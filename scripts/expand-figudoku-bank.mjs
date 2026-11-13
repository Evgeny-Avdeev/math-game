// Reproducible offline expansion. Existing puzzles (1–24) are never regenerated.
// Run from any directory: node scripts/expand-figudoku-bank.mjs
import {writeFileSync} from 'node:fs';
import {figudokuPuzzles} from '../figudoku-data.mjs';
import {countFigudokuSolutions,inspectFigudoku} from '../figudoku-engine.mjs';

let seed=20261108;
const random=()=>{seed=(Math.imul(seed,1664525)+1013904223)>>>0;return seed/2**32;};
function shuffle(values){const a=[...values];for(let i=a.length-1;i>0;i--){const j=Math.floor(random()*(i+1));[a[i],a[j]]=[a[j],a[i]];}return a;}
const legacy=figudokuPuzzles.filter(p=>Number(p.id.split('-').at(-1))<=24);
const result=[...legacy];
const signature=p=>JSON.stringify([p.n,p.numbers,p.shapes]);
// Also exclude clue layouts identical under a mere relabelling of symbols.
const layout=p=>JSON.stringify([p.n,p.numbers.map(Boolean),p.shapes.map(Boolean)]);
const seen=new Set(legacy.map(signature)),layouts=new Set(legacy.map(layout));
for(const [level,total,givens] of [['easy',30,20],['medium',60,14],['hard',30,58]]){
 const templates=legacy.filter(p=>p.level===level);
 for(let index=25;index<=total;index++){
  let accepted;
  for(let attempt=0;attempt<200&&!accepted;attempt++){
   const template=templates[(index-25+attempt)%templates.length],{n}=template,L=n*n;
   // Relabelling preserves both Sudoku layers and all number–shape pairs.
   // A fresh clue layout is then carved with the exact uniqueness solver.
   const maps=[shuffle(Array.from({length:n},(_,i)=>i+1)),shuffle(Array.from({length:n},(_,i)=>i+1))];
   const solutionNumbers=template.solutionNumbers.map(v=>maps[0][v-1]);
   const solutionShapes=template.solutionShapes.map(v=>maps[1][v-1]);
   const p={id:`figudoku-${level}-${index}`,level,n,numbers:[...solutionNumbers],shapes:[...solutionShapes],solutionNumbers,solutionShapes};
   let remaining=2*L;
   for(const cell of shuffle(Array.from({length:2*L},(_,i)=>i))){
    if(remaining===givens)break;
    const a=cell<L?p.numbers:p.shapes,i=cell%L,v=a[i];a[i]=0;
    let unique=false;
    try{unique=countFigudokuSolutions(p)===1;}catch(error){if(error.message!=='Solver budget exceeded')throw error;}
    if(unique)remaining--;else a[i]=v;
   }
   if(remaining!==givens||seen.has(signature(p))||layouts.has(layout(p)))continue;
   if(!inspectFigudoku(p,solutionNumbers,solutionShapes).solved||countFigudokuSolutions(p)!==1)throw Error(p.id);
   accepted=p;
  }
  if(!accepted)throw Error(`Cannot generate ${level}-${index}`);
  result.push(accepted);seen.add(signature(accepted));layouts.add(layout(accepted));
 }
 console.log(`${level}: ${total} puzzles, ${givens} givens each`);
}
// Retain the original array order and append only the new boards.
writeFileSync(new URL('../figudoku-data.mjs',import.meta.url),'// Each puzzle has one solution, including the unique number–shape pair rule.\nexport const figudokuPuzzles=['+result.map(p=>JSON.stringify(p)).join(',')+'];\n');
