import test from 'node:test';
import assert from 'node:assert/strict';
import {figudokuPuzzles} from '../figudoku-data.mjs';
import {countFigudokuSolutions,inspectFigudoku,figudokuLevel,nextFigudoku} from '../figudoku-engine.mjs';
import {cleanProfile,settlePuzzle,settle} from '../game.mjs';
import {worlds,getWorld} from '../worlds.mjs';
import {createHash} from 'node:crypto';
test('120 distinct puzzles have exactly one solution and obey all three constraints',()=>{
 assert.equal(figudokuPuzzles.length,120);assert.equal(new Set(figudokuPuzzles.map(p=>p.id)).size,120);
 const signatures=new Set();
 for(const p of figudokuPuzzles){const key=JSON.stringify([p.n,p.numbers,p.shapes]);assert.ok(!signatures.has(key),p.id);signatures.add(key);
 assert.equal(countFigudokuSolutions(p),1,p.id);assert.ok(inspectFigudoku(p,p.solutionNumbers,p.solutionShapes).solved,p.id);
 const groups=[];for(let r=0;r<p.n;r++)groups.push(Array.from({length:p.n},(_,c)=>r*p.n+c));for(let c=0;c<p.n;c++)groups.push(Array.from({length:p.n},(_,r)=>r*p.n+c));
 for(let r=0;r<p.n;r+=2)for(let c=0;c<p.n;c+=p.n/2)groups.push(Array.from({length:p.n},(_,j)=>(r+Math.floor(j/(p.n/2)))*p.n+c+j%(p.n/2)));
 for(const a of [p.solutionNumbers,p.solutionShapes])for(const group of groups)assert.equal(new Set(group.map(i=>a[i])).size,p.n,p.id);
 assert.equal(new Set(p.solutionNumbers.map((v,i)=>`${v}-${p.solutionShapes[i]}`)).size,p.n*p.n,p.id);
 assert.equal(p.numbers.filter(Boolean).length+p.shapes.filter(Boolean).length,{easy:20,medium:14,hard:58}[p.level]);
 }
});
test('difficulty follows collection order in every world; only final collection is 8x8',()=>{for(const id of Object.keys(worlds)){const {missions}=getWorld(id);assert.deepEqual(missions.map(m=>figudokuLevel(missions,m.id)),['easy','medium','medium','hard']);}for(const p of figudokuPuzzles)assert.equal(p.n,p.level==='hard'?8:4);});
test('selection skips solved boards, shares medium sequence, and offers practice when finished',()=>{assert.equal(nextFigudoku(figudokuPuzzles,'medium',['figudoku-medium-1']).id,'figudoku-medium-2');const done=figudokuPuzzles.map(p=>p.id);assert.equal(nextFigudoku(figudokuPuzzles,'hard',done,'figudoku-hard-1').id,'figudoku-hard-2');});
test('row, column, block, pair duplicates and missing entries cannot complete a puzzle',()=>{const p=figudokuPuzzles[0],nums=[...p.solutionNumbers],shapes=[...p.solutionShapes];assert.equal(inspectFigudoku(p,Array(16).fill(0),Array(16).fill(0)).solved,false);nums[0]=nums[1];assert.equal(inspectFigudoku(p,nums,shapes).solved,false);const empty={...p,numbers:Array(16).fill(0),shapes:Array(16).fill(0)};assert.equal(inspectFigudoku(empty,p.solutionNumbers,p.solutionNumbers).solved,false);assert.ok(inspectFigudoku(empty,p.solutionNumbers,p.solutionNumbers).bad.size);});
test('figudoku, tents and math share rewards without duplicate awards after profile reload',()=>{for(const world of Object.keys(worlds)){const w=getWorld(world),mission=w.missions[3];let p=cleanProfile({stars:14,solved:10,puzzles:['forest-8-1']},world);const r=settlePuzzle(p,'figudoku-hard-1',mission.id,world);assert.equal(r.profile.stars,24);assert.equal(r.profile.items.length,1);assert.equal(r.reward.mission,mission.id);p=cleanProfile(r.profile,world);assert.deepEqual(p.puzzles,['forest-8-1','figudoku-hard-1']);const repeat=settlePuzzle(p,'figudoku-hard-1',w.missions[0].id,world);assert.equal(repeat.already,true);assert.equal(repeat.profile.stars,24);assert.equal(repeat.profile.items.length,1);assert.deepEqual(settle(p,[],null,0,world).profile.puzzles,p.puzzles);assert.throws(()=>settlePuzzle(p,'figudoku-hard-31',mission.id,world));}});

test('all 72 legacy boards and identifiers are unchanged',()=>{
 const legacy=figudokuPuzzles.filter(p=>Number(p.id.split('-').at(-1))<=24);
 assert.equal(legacy.length,72);
 assert.equal(createHash('sha256').update(JSON.stringify(legacy)).digest('hex'),'daa49354c0524ae9af0411f19a23a20cad962d1c3f5823a8bee4c5830df7a497');
});

test('new puzzles have fresh clue layouts and valid givens on both layers',()=>{
 const layouts=new Set();
 for(const p of figudokuPuzzles){
  const key=JSON.stringify([p.n,p.numbers.map(Boolean),p.shapes.map(Boolean)]);
  assert.ok(!layouts.has(key),p.id);layouts.add(key);
  for(const [givens,solution] of [[p.numbers,p.solutionNumbers],[p.shapes,p.solutionShapes]]){
   assert.equal(givens.length,p.n*p.n);assert.equal(solution.length,p.n*p.n);
   for(const [i,v] of givens.entries()){assert.ok(Number.isInteger(v)&&v>=0&&v<=p.n,p.id);if(v)assert.equal(v,solution[i],p.id);}
  }
 }
});
