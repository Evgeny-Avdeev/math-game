export const multiplicationTables = ['mixed', '2', '3', '4', '5', '6', '7', '8', '9'];
const seriesLength = 10;
const factors = Array.from({length: seriesLength}, (_, i) => i + 1);
const tablesByDifficulty = {
 easy: ['2', '3', '4', '5'],
 all: ['4', '5', '6', '7'],
 carry: ['6', '7', '8', '9'],
};

export function makeMultiplicationSeries(table) {
 const leftFactors = table === 'mixed' ? multiplicationTables.slice(1).map(Number) : [Number(table)];
 const problems = leftFactors.flatMap(a => factors.map(b => [a, b]));
 for (let i = problems.length - 1; i > 0; i--) {
  const j = Math.floor(Math.random() * (i + 1));
  [problems[i], problems[j]] = [problems[j], problems[i]];
 }
 return problems.slice(0, seriesLength).map(([a,b])=>({a,b,op:'×',answer:a*b}));
}

function validLegacyDraft(draft) {
 if (!draft || !multiplicationTables.includes(draft.table) || !Array.isArray(draft.problems)
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

export function multiplicationTable(level, previous) {
 const choices=tablesByDifficulty[level].filter(table=>table!==previous);
 return choices[Math.floor(Math.random()*choices.length)];
}

export function restoreMultiplicationDraft(saved, missionId, origin) {
 if (!validLegacyDraft(saved)) return saved;
 const problems=saved.problems.map(([a,b])=>({a,b,op:'×',answer:a*b}));
 const records=problems.slice(0,saved.index+Number(saved.checked)).map(p=>({
  p, first:false, attempts:0, hinted:false, skipped:false,
 }));
 return {...saved, id:saved.id || crypto.randomUUID(), mode:'multiplication', missionId, origin,
  completed:saved.index===problems.length-1&&saved.checked, problems, records,
  attempts:0, hinted:false, streak:0, bestStreak:0, earned:missionId?records.length:0,
  feedback:saved.checked?'Верно!':'',
 };
}

export function validMultiplicationSeries(problems, table, level) {
 if (!(level ? tablesByDifficulty[level] : multiplicationTables).includes(table)
     || problems.length!==seriesLength) return false;
 return problems.every(p=>p&&p.op==='×'&&Number.isInteger(p.a)&&p.a>=2&&p.a<=9
  &&(table==='mixed'||p.a===Number(table))&&factors.includes(p.b)&&p.answer===p.a*p.b)
  &&new Set(problems.map(p=>p.a+'×'+p.b)).size===seriesLength;
}

export function multiplicationHint({a,b}) {
 return b===1?`Возьми ${a} один раз.`:`Сложи: ${Array(b).fill(a).join(' + ')}.`;
}
