import test from 'node:test';
import assert from 'node:assert/strict';
import {getWorld} from '../worlds.mjs';
import {cleanProfile,settle,settleActivity,settlePuzzle,rewardStatus} from '../game.mjs';
import {portrait} from '../portraits.mjs';
test('36 distinct clubs in four nine-card sets, rendered as club cards',()=>{
 const w=getWorld('footballTeams');assert.equal(w.id,'footballTeams');
 assert.equal(w.artifacts.length,36);assert.equal(new Set(w.artifacts.map(a=>a.id)).size,36);
 for(const m of w.missions)assert.equal(w.artifacts.filter(a=>a.mission===m.id).length,9);
 for(const a of w.artifacts){assert.ok(!getWorld('football').artifacts.some(b=>a.id===b.id));assert.match(portrait(a),/<svg/);assert.match(portrait(a),new RegExp(a.look.initials));}
});
test('complete legacy player profile survives team rewards and reload unchanged',()=>{
 const players=getWorld('football');
 const raw={stars:1234,solved:222,completed:50,bestStreak:10,items:players.artifacts.map(a=>a.id),badges:['first','collector'],puzzles:['forest-5-1','figudoku-easy-1'],itemSources:{[players.artifacts[0].id]:'math'}};
 const before=cleanProfile(raw,'football'),snapshot=JSON.stringify(before);
 assert.equal(before.items.length,36);for(const k of ['stars','solved','completed','bestStreak','items','puzzles','itemSources'])assert.deepEqual(before[k],raw[k]);
 let teams=settlePuzzle(cleanProfile(null,'footballTeams'),'forest-5-1','teams0','footballTeams').profile;
 teams=settle(teams,Array.from({length:10},()=>({first:true})),'teams0',10,'footballTeams').profile;
 teams=cleanProfile(JSON.parse(JSON.stringify(teams)),'footballTeams');
 assert.equal(teams.items.length,2);assert.equal(JSON.stringify(before),snapshot);
 assert.deepEqual(cleanProfile(JSON.parse(snapshot),'football'),before);
 assert.equal(rewardStatus(before,'football0','math','football').reason,'complete');
});
test('team rewards require varied activities and finish independently for every set',()=>{
 const w='footballTeams';let p=cleanProfile(null,w);
 for(const m of getWorld(w).missions){
  for(let i=0;i<5;i++)p=settle(p,Array.from({length:m.count},()=>({first:true})),m.id,0,w).profile;
  assert.equal(rewardStatus(p,m.id,'math',w).reason,'limit');
  for(let i=1;i<=2;i++)p=settlePuzzle(p,`forest-${m.id==='teams0'?5:m.id==='teams3'?8:6}-${(m.id==='teams2'?3:0)+i}`,m.id,w).profile;
  assert.equal(rewardStatus(p,m.id,'tents',w).reason,'reserved');
  p=settleActivity(p,'multiplication',`series-${m.id}`,m.id,w).profile;
  p=settlePuzzle(p,`figudoku-${m.id==='teams0'?'easy':m.id==='teams3'?'hard':'medium'}-${m.id==='teams2'?2:1}`,m.id,w).profile;
 }
 assert.equal(p.items.length,36);assert.ok(p.badges.includes('collector'));
});
