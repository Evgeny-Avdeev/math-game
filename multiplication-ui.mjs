import {createActivityLifecycle} from './activity-lifecycle.mjs?v=1';
import {mountActivityShell} from './activity-shell.mjs?v=1';
import {createActivityTutorial} from './activity-tutorial.mjs?v=1';

const tables = ['mixed', '2', '3', '4', '5', '6', '7', '8', '9'];
const seriesLength = 10;
const factors = Array.from({length: seriesLength}, (_, i) => i + 1);

function makeSeries(table) {
 const leftFactors = table === 'mixed' ? tables.slice(1).map(Number) : [Number(table)];
 const problems = leftFactors.flatMap(a => factors.map(b => [a, b]));
 for (let i = problems.length - 1; i > 0; i--) {
  const j = Math.floor(Math.random() * (i + 1));
  [problems[i], problems[j]] = [problems[j], problems[i]];
 }
 return {table, problems: problems.slice(0, seriesLength), index: 0, answer: '', checked: false};
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

export function mountMultiplication(root, {definition, context, openActivities}) {
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
    <div><label for="multiplication-table">Таблица<select id="multiplication-table">${options}</select></label></div>
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
    <button class="primary" id="multiplication-again">Новая серия →</button>
   </div>`,
 });
 root.querySelector('.forest-current-goal').hidden = true;
 const tutorial = createActivityTutorial(root, {definition});
 const $ = suffix => root.querySelector(`#multiplication-${suffix}`);
 const answer = $('answer');
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
  $('table').value = state.table;
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
  key: () => `schitay-multiplication-${context().id}-v1`,
  id: () => state.table,
  snapshot: () => state,
  load(saved, previousTable) {
   const hasDraft = validDraft(saved);
   const finished = hasDraft && saved.index === seriesLength - 1 && saved.checked;
   state = hasDraft && !finished ? saved : makeSeries(nextTable ?? (hasDraft ? saved.table : previousTable) ?? 'mixed');
   nextTable = undefined;
   draw();
  },
  render: draw,
  solved: () => state.checked && state.index === seriesLength - 1,
  complete: draw,
 });

 function updateAnswer(value) {
  answer.value = state.answer = value.replace(/\D/g, '').slice(0, 2);
  message();
  lifecycle.persist();
 }

 $('table').onchange = () => {
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
 $('again').onclick = () => {
  lifecycle.next();
  $('table').focus();
 };

 return {enter: lifecycle.enter, showTutorialIfFirst: tutorial.visit.openIfFirst};
}
