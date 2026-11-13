import test from 'node:test';
import assert from 'node:assert/strict';
import {chromium, devices} from 'playwright';

const site = new URL('../../', import.meta.url);
const origin = 'https://math-game.test/';
const operations = {
 '+': (a, b) => a + b,
 '−': (a, b) => a - b,
 '×': (a, b) => a * b,
};

test('arithmetic clears answer focus between problems and accepts fresh input', async t => {
 const browser = await chromium.launch({executablePath: process.env.CHROMIUM_BIN});
 t.after(() => browser.close());

 for (const [choice, activity, expectedOperators] of [
  ['chooseMath', 'math', ['+', '−']],
  ['chooseMultiplication', 'multiplication', ['×']],
 ]) {
  await t.test(activity, async () => {
   const page = await browser.newPage({...devices['iPad (gen 7)'], reducedMotion: 'reduce'});
   try {
    await page.route('https://fonts.googleapis.com/**', route => route.abort());
    await page.route(origin + '**', route => {
     const path = new URL(route.request().url()).pathname;
     return route.fulfill({path: new URL(path === '/' ? 'index.html' : '.' + path, site).pathname});
    });
    await page.addInitScript(id => localStorage.setItem('schitay-tutorial-' + id + '-seen-v1', '1'), activity);
    await page.goto(origin);
    await page.locator('#' + choice).tap();

    const answer = page.locator('#answer');
    const submit = page.locator('#submit');
    const position = page.locator('#position');
    const hasFocus = () => answer.evaluate(field => field === document.activeElement);
    const assertReady = async () => {
     assert.equal(await hasFocus(), false);
     assert.equal(await answer.inputValue(), '');
     assert.equal(await answer.isEditable(), true);
    };
    await position.filter({hasText: /^Пример 1 из \d+$/}).waitFor();
    await assertReady();

    const count = Number((await position.textContent()).split(' из ')[1]);
    assert.ok(count > 2);
    const keyboardOperators = new Set();
    for (let i = 1; i <= count; i++) {
     const operator = await page.locator('#operator').textContent();
     const a = Number(await page.locator('#numA').textContent());
     const b = Number(await page.locator('#numB').textContent());
     const value = String(operations[operator](a, b));
     const useKeypad = i === 2;
     if (useKeypad) {
      for (const digit of value) await page.locator('#keypad [data-key="' + digit + '"]').tap();
      assert.equal(await hasFocus(), false);
      await submit.tap();
     } else {
      await answer.tap();
      assert.equal(await hasFocus(), true);
      await page.keyboard.type(value);
      await page.keyboard.press('Enter');
     }
     assert.equal(await answer.inputValue(), value);
     assert.equal(await answer.isEditable(), false);
     assert.equal(await position.textContent(), 'Пример ' + i + ' из ' + count);

     if (useKeypad) {
      await submit.tap();
     } else {
      // Enter can advance directly from the focused, read-only answer.
      assert.equal(await hasFocus(), true);
      keyboardOperators.add(operator);
      await page.keyboard.press('Enter');
     }
     assert.equal(await hasFocus(), false, 'Answer must lose focus after ' + operator);
     if (i < count) {
      assert.equal(await position.textContent(), 'Пример ' + (i + 1) + ' из ' + count);
      await assertReady();
     }
    }
    assert.deepEqual([...keyboardOperators].sort(), expectedOperators);
    assert.equal(await page.locator('#result').isVisible(), true);
   } finally {
    await page.close();
   }
  });
 }
});
