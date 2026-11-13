import test from 'node:test';
import assert from 'node:assert/strict';
import {readFile} from 'node:fs/promises';
import {chromium} from 'playwright';

const site = new URL('../../', import.meta.url);

const futureActivity = `
import {mountActivityTemplate} from './activity-template.mjs?v=arithmetic-template-1';
activityDefinitions.futureTask = {
 id: 'future-task',
 title: 'Тестовое занятие',
 rules: ['Тестовое правило'],
 mount(root, services) {
  return mountActivityTemplate(root, {...services, engine: {
   next: () => ({id: 'test-task'}),
   initial: () => ({}),
   inspect: () => ({solved: false}),
   render: board => { board.textContent = 'Тестовое поле'; },
  }});
 },
};
`;

test('a newly registered activity opens and scrolls to its game card before the footer', async t => {
 const browser = await chromium.launch({executablePath: process.env.CHROMIUM_BIN});
 t.after(() => browser.close());
 const page = await browser.newPage({viewport: {width: 390, height: 700}, reducedMotion: 'reduce'});
 await page.route('http://math-game.test/**', async route => {
  const path = new URL(route.request().url()).pathname;
  const file = new URL(path === '/' ? 'index.html' : '.' + path, site);
  if (path === '/activity-definitions.mjs') {
   await route.fulfill({
    contentType: 'text/javascript',
    body: await readFile(file, 'utf8') + futureActivity,
   });
  } else {
   await route.fulfill({path: file.pathname});
  }
 });
 await page.goto('http://math-game.test/');

 const screen = page.locator('main > #future-task');
 assert.equal(await screen.count(), 1);
 assert.equal(await screen.isHidden(), true);
 assert.equal(await screen.evaluate(node => node.nextElementSibling?.tagName), 'FOOTER');

 await page.evaluate(() => {
  localStorage.setItem('schitay-tutorial-future-task-seen-v1', '1');
  const scrollTo = window.scrollTo.bind(window);
  window.scrollTo = options => {
   window.activityScrollTop = options.top;
   scrollTo(options);
  };
 });
 await page.locator('.activity-choice').filter({hasText: 'Тестовое занятие'}).click();
 const card = screen.locator('.game-card');
 assert.equal(await card.locator('#future-task-board').textContent(), 'Тестовое поле');
 assert.equal(await card.isVisible(), true);
 assert.equal(await page.locator('#home').isHidden(), true);
 assert.equal(await page.locator('nav [data-view="home"]').getAttribute('aria-current'), 'page');

 await page.waitForFunction(() => window.activityScrollTop !== undefined);
 const {actual, target} = await card.evaluate(node => ({
  actual: window.activityScrollTop,
  target: node.getBoundingClientRect().top + window.scrollY - 12,
 }));
 assert.ok(target > 0 && Math.abs(actual - target) < 1, 'Mobile navigation should scroll to the game card');
});
