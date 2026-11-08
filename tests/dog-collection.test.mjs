import test from 'node:test';
import assert from 'node:assert/strict';
import {getWorld} from '../worlds.mjs';
import {cleanProfile,settle,settlePuzzle,solvedPuzzlesAcrossWorlds} from '../game.mjs';
import {portrait} from '../portraits.mjs';
import {figudokuLevel} from '../figudoku-engine.mjs';

test('second dog collection contains 36 new breeds in four nine-card sets',()=>{
 const old=getWorld('dog'),next=getWorld('dogMore');
 assert.equal(next.id,'dogMore');assert.equal(next.artifacts.length,36);
 assert.equal(new Set(next.artifacts.map(a=>a.id)).size,36);
 assert.deepEqual(next.missions.map(m=>figudokuLevel(next.missions,m.id)),['easy','medium','medium','hard']);
 for(const m of next.missions)assert.equal(next.artifacts.filter(a=>a.mission===m.id).length,9);
 for(const a of next.artifacts){
  assert.ok(!old.artifacts.some(b=>b.id===a.id||b.name===a.name));
  assert.match(portrait(a),/<svg/);assert.equal(a.pet,'dog');assert.ok(a.story.length>70);
 }
});
test('legacy dog cards, currency, stats and puzzles survive independently of new rewards',()=>{
 for(const count of [0,14,36]){
  const old=getWorld('dog');
  const raw={stars:1234,solved:222,completed:50,bestStreak:10,items:old.artifacts.slice(0,count).map(a=>a.id),badges:['first'],puzzles:['forest-5-1','figudoku-easy-1'],itemSources:count?{[old.artifacts[0].id]:'math'}:{}};
  const before=cleanProfile(raw,'dog'),snapshot=JSON.stringify(before);
  for(const key of ['stars','solved','completed','bestStreak','items','puzzles','itemSources'])assert.deepEqual(before[key],raw[key]);
  let next=cleanProfile(null,'dogMore');assert.equal(next.items.length,0);assert.equal(next.stars,0);
  next=settle(next,Array.from({length:10},()=>({first:true})),'dogMore0',10,'dogMore').profile;
  next=settlePuzzle(next,'forest-5-2','dogMore0','dogMore').profile;
  next=cleanProfile(JSON.parse(JSON.stringify(next)),'dogMore');assert.equal(next.items.length,2);
  assert.equal(JSON.stringify(before),snapshot);assert.deepEqual(cleanProfile(JSON.parse(snapshot),'dog'),before);
  assert.deepEqual(solvedPuzzlesAcrossWorlds({dog:before,dogMore:next}),['forest-5-1','figudoku-easy-1','forest-5-2']);
 }
});
