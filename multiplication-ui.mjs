import {createActivityLifecycle} from './activity-lifecycle.mjs?v=1';
import {mountActivityShell} from './activity-shell.mjs?v=1';
import {createActivityTutorial} from './activity-tutorial.mjs?v=1';

const tables = ['mixed', '2', '3', '4', '5', '6', '7', '8', '9'];
const seriesLength = 10;
const factors = Array.from({length: seriesLength}, (_, i) => i + 1);
const tablesByDifficulty = {
 easy: ['2', '3', '4', '5'],
 all: ['4', '5', '6', '7'],
 carry: ['6', '7', '8', '9'],
};

function makeSeries(table) {
 const leftFactors = table === 'mixed' ? tables.slice(1).map(Number) : [Number(table)];
 const problems = leftFactors.flatMap(a => factors.map(b => [a, b]));
 for (let i = problems.length - 1; i > 0; i--) {
  const j = Math.floor(Math.random() * (i + 1));
  [problems[i], problems[j]] = [problems[j], problems[i]];
 }
 return {id: crypto.randomUUID(), table, problems: problems.slice(0, seriesLength), index: 0, answer: '', checked: false};
}

function validDraft(draft) {
 if (!draft || !tables.includes(draft.table) || !Array.isArray(draft.problems)
     || draft.problems.length !== seriesLength || !Number.isInteger(draft.index)
     || draft.index < 0 || draft.index >= seriesLength
     || typeof draft.answer !== 'string' || !/^\d{0,2}$/.test(draft.answer)
     || typeof draft.checked !== 'boolean') return false;
 if (!draft.problems.every(pair => Array.isArray(pair) && pair.length === 2
     && Number.isInteger(pair[0]) && pair[0] >= 2 && pair[0] <= 9
     && (draft.table === 'mixed' || pair[0] === Number(draft.table))
     && factors.includes(pair[1]))) return false;
 const [a, b] = draft.problems[draft.index];
 return new Set(draft.problems.map(pair => pair.join('×'))).size === seriesLength
     && (!draft.checked || Number(draft.answer) === a * b);
}

export function mountMultiplication(root, {definition, context, openActivities, openCollection, complete, isPractice}) {
 const options = tables.map(table =>
  `<option value="${table}">${table === 'mixed' ? 'Вперемешку' : 'Умножение на ' + table}</option>`
 ).join('');
 const keys = ['1', '2', '3', '4', '5', '6', '7', '8', '9', '0']
  .map(digit => `<button type="button" data-digit="${digit}">${digit}</button>`).join('');
 const guide = mountActivityShell(root, {
  definition, context, onBack: openActivities,
  hintId: 'multiplication-hint', nextId: 'multiplication-again',
  gameHTML: `
   <div class="forest-settings">
    <div><label id="multiplication-table-picker" for="multiplication-table">Таблица<select id="multiplication-table">${options}</select></label>
      <span class="small muted" id="multiplication-table-label">Таблица</span><b id="multiplication-table-name" tabindex="-1"></b></div>
    <div><span class="small muted">Решено</span><b id="multiplication-progress" role="status"></b></div>
   </div>
   <form id="multiplication-form">
    <div class="equation">
     <span id="multiplication-a"></span><span class="op">×</span>
     <span id="multiplication-b"></span><span class="op">=</span>
     <input id="multiplication-answer" class="answer" type="text" inputmode="numeric"
       autocomplete="off" placeholder="?" maxlength="2" aria-label="Твой ответ">
    </div>
    <p id="multiplication-feedback" class="feedback" role="status"></p>
    <div class="forest-actions">
     <button class="primary" id="multiplication-submit" type="submit">Проверить ✓</button>
     <button class="secondary" id="multiplication-hint" type="button">💡 Подсказка</button>
    </div>
    <div id="multiplication-keypad" class="keypad" aria-label="Цифровая клавиатура">
     ${keys}<button type="button" data-digit="" aria-label="Стереть цифру">⌫</button>
    </div>
   </form>
   <div id="multiplication-result" class="forest-win" hidden>
    <h2>Все 10 примеров решены!</h2>
    <div id="multiplication-prize" class="forest-prize-image"></div>
    <button class="primary" id="multiplication-again">Новая серия →</button>
    <button class="text-button" id="multiplication-collection">Открыть коллекцию</button>
   </div>`,
 });
 const tutorial = createActivityTutorial(root, {definition});
 const $ = suffix => root.querySelector(`#multiplication-${suffix}`);
 const answer = $('answer');
 const collectionGoal = root.querySelector('.forest-current-goal');
 let state;
 let nextTable;

 function message(text = '', error = false) {
  const feedback = $('feedback');
  feedback.textContent = text;
  feedback.classList.toggle('bad', error);
  if (error && state.answer) answer.setAttribute('aria-invalid', 'true');
  else answer.removeAttribute('aria-invalid');
 }

 function draw() {
  const [a, b] = state.problems[state.index];
  const done = lifecycle.completed;
  guide.update();
  const {targetMission, world, profile} = context();
  const practice = isPractice();
  collectionGoal.hidden = practice;
  if (!practice) {
   const items = world.artifacts.filter(item => item.mission === targetMission.id);
   $('set-title').textContent = targetMission.title;
   $('set-progress').textContent = `Собрано: ${items.filter(item => profile.items.includes(item.id)).length} из ${items.length}`;
  }
  $('table-picker').hidden = !practice;
  $('table-label').hidden = practice;
  $('table-name').hidden = practice;
  $('table-name').textContent = `Умножение на ${state.table}`;
  $('table').value = state.table;
  $('collection').hidden = practice;
  $('a').textContent = a;
  $('b').textContent = b;
  $('progress').textContent = `${state.index + Number(state.checked)} из ${seriesLength}`;
  answer.setAttribute('aria-label', `Твой ответ. ${a} умножить на ${b}`);
  answer.value = state.answer;
  answer.readOnly = state.checked;
  answer.classList.toggle('correct', state.checked);
  $('submit').textContent = state.checked ? 'Следующий пример →' : 'Проверить ✓';
  $('hint').disabled = state.checked;
  $('keypad').hidden = state.checked;
  $('form').hidden = done;
  $('result').hidden = !done;
  message(state.checked ? 'Верно!' : '');
 }

 const lifecycle = createActivityLifecycle({
  key: () => {
   const {id, targetMission} = context();
   return isPractice() ? `schitay-multiplication-${id}-v1`
    : `schitay-multiplication-${id}-${targetMission.id}-v1`;
  },
  id: () => state.table,
  snapshot: () => state,
  load(saved, previousTable) {
   const practice = isPractice();
   const {targetMission} = context();
   const eligible = tablesByDifficulty[targetMission.level];
   const hasDraft = validDraft(saved) && (practice || eligible.includes(saved.table));
   const finished = hasDraft && saved.index === seriesLength - 1 && saved.checked;
   if (finished && !practice && saved.id) complete(saved.id, targetMission.id, {solved: seriesLength});
   const choices = eligible.filter(table => table !== (hasDraft ? saved.table : previousTable));
   const table = practice ? nextTable ?? (hasDraft ? saved.table : previousTable) ?? 'mixed'
    : choices[Math.floor(Math.random() * choices.length)];
   state = hasDraft && !finished ? {...saved, id: saved.id || crypto.randomUUID()} : makeSeries(table);
   nextTable = undefined;
   draw();
  },
  render: draw,
  solved: () => state.checked && state.index === seriesLength - 1,
  complete() {
   const prize = $('prize');
   prize.replaceChildren();
   if (!isPractice()) {
    const result = complete(state.id, context().targetMission.id, {solved: seriesLength});
    if (result.image) prize.append(result.image);
    const message = document.createElement('p');
    message.textContent = result.message;
    prize.append(message);
   }
   draw();
  },
 });

 function updateAnswer(value) {
  answer.value = state.answer = value.replace(/\D/g, '').slice(0, 2);
  message();
  lifecycle.persist();
 }

 $('table').onchange = () => {
  if (!isPractice()) return;
  nextTable = $('table').value;
  lifecycle.next();
 };
 answer.oninput = () => updateAnswer(answer.value);
 $('keypad').onclick = event => {
  const key = event.target.closest('[data-digit]');
  if (key && !state.checked) {
   const digit = key.dataset.digit;
   updateAnswer(digit ? state.answer + digit : state.answer.slice(0, -1));
  }
 };
 $('hint').onclick = () => {
  const [a, b] = state.problems[state.index];
  const repeated = Array(b).fill(a).join(' + ');
  const hint = b === 1 ? `Возьми ${a} один раз.` : `Сложи: ${repeated}.`;
  message(hint);
 };
 $('form').addEventListener('submit', event => {
  event.preventDefault();
  if (lifecycle.completed) return;
  if (state.checked) {
   state.index++;
   state.answer = '';
   state.checked = false;
  } else {
   const [a, b] = state.problems[state.index];
   if (!state.answer) return message('Сначала введи ответ.', true);
   if (Number(state.answer) !== a * b) return message('Попробуй ещё!', true);
   state.checked = true;
   if (lifecycle.complete()) {
    $('again').focus();
    return;
   }
  }
  lifecycle.persist();
  draw();
 });
 $('collection').onclick = openCollection;
 $('again').onclick = () => {
  lifecycle.next();
  if (isPractice()) $('table').focus();
  else $('table-name').focus();
 };

 return {enter: lifecycle.enter, showTutorialIfFirst: tutorial.visit.openIfFirst};
}
