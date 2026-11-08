import test from 'node:test';
import assert from 'node:assert/strict';
import {cleanProfile,settlePuzzle,solvedPuzzlesAcrossWorlds} from '../game.mjs';
import {worlds,getWorld} from '../worlds.mjs';
import {figudokuPuzzles} from '../figudoku-data.mjs';
import {nextFigudoku} from '../figudoku-engine.mjs';
import {puzzles} from '../tents-data.mjs';
import {nextPuzzle} from '../tents-sequence.mjs';

const fresh=()=>Object.fromEntries(Object.keys(worlds).map(id=>[id,cleanProfile(null,id)]));
const games=[
 ...['easy','medium','hard'].map(level=>({list:figudokuPuzzles.filter(p=>p.level===level),next:done=>nextFigudoku(figudokuPuzzles,level,done)})),
 ...[5,6,8].map(size=>({list:puzzles.filter(p=>p.n===size),next:done=>nextPuzzle(puzzles,size,done)}))
];

test('legacy solutions from every world are combined without changing collections or rewards',()=>{
 const profiles=fresh();
 for(const [i,id] of Object.keys(profiles).entries())profiles[id]=cleanProfile({stars:42,solved:12,puzzles:[games[0].list[0].id,games[1].list[i].id]},id);
 const before=JSON.stringify(profiles),done=solvedPuzzlesAcrossWorlds(profiles);
 assert.equal(done.length,Object.keys(worlds).length+1);
 assert.equal(games[0].next(done).id,games[0].list[1].id);
 assert.equal(JSON.stringify(profiles),before);
});

test('switching worlds and sets never repeats either puzzle type before its difficulty is exhausted',()=>{
 for(const game of games){
  let profiles=fresh();const ids=Object.keys(profiles),seen=new Set();
  for(let i=0;i<game.list.length;i++){
   const world=ids[i%ids.length],w=getWorld(world),mission=w.missions[i%4];
   const task=game.next(solvedPuzzlesAcrossWorlds(profiles));
   assert.equal(seen.has(task.id),false,task.id);seen.add(task.id);
   const result=settlePuzzle(profiles[world],task.id,mission.id,world);
   assert.equal(result.already,false);profiles[world]=result.profile;
   // Reload the existing storage format between every selection.
   profiles=Object.fromEntries(Object.entries(JSON.parse(JSON.stringify(profiles))).map(([id,p])=>[id,cleanProfile(p,id)]));
  }
  assert.equal(seen.size,game.list.length);
  assert.ok(seen.has(game.next(solvedPuzzlesAcrossWorlds(profiles)).id));
 }
});

test('a solve in another world immediately removes an old draft from the unsolved pool',()=>{
 const profiles=fresh(),draft=games[0].list[0];
 profiles.dog=settlePuzzle(profiles.dog,draft.id,getWorld('dog').missions[0].id,'dog').profile;
 assert.ok(solvedPuzzlesAcrossWorlds(profiles).includes(draft.id));
 assert.notEqual(games[0].next(solvedPuzzlesAcrossWorlds(profiles)).id,draft.id);
 assert.deepEqual(profiles.space.puzzles,[]);
});
