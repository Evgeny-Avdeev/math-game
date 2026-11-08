import test from 'node:test';
import assert from 'node:assert/strict';
import {currencyBalance,cleanProfile,settle,settlePuzzle} from '../game.mjs';
import {getWorld} from '../worlds.mjs';

test('old dog and football balances are combined once, without moving card progress',()=>{
 const profiles=Object.fromEntries(['dog','dogMore','football','footballTeams','cat','space'].map((id,i)=>[id,cleanProfile({stars:(i+1)*100,items:[getWorld(id).artifacts[0].id]},id)]));
 const snapshot=JSON.stringify(profiles);
 for(let reload=0;reload<3;reload++){
  const saved=JSON.parse(snapshot);
  assert.equal(currencyBalance(saved,'dog'),300);assert.equal(currencyBalance(saved,'dogMore'),300);
  assert.equal(currencyBalance(saved,'football'),700);assert.equal(currencyBalance(saved,'footballTeams'),700);
  assert.equal(currencyBalance(saved,'cat'),500);assert.equal(currencyBalance(saved,'space'),600);
  assert.equal(JSON.stringify(saved),snapshot);
 }
 assert.equal(currencyBalance({dog:{stars:50}},'dogMore'),50);
 assert.equal(currencyBalance({},'football'),0);
});
test('awards in either collection increase its shared wallet exactly once',()=>{
 for(const ids of [['dog','dogMore'],['football','footballTeams']]){
  const profiles=Object.fromEntries(ids.map(id=>[id,cleanProfile({stars:100},id)]));
  let total=200;
  for(const id of ids){
   const m=getWorld(id).missions[0];
   const result=settle(profiles[id],Array.from({length:m.count},()=>({first:true})),m.id,0,id);
   profiles[id]=result.profile;total+=result.stars;
   for(const other of ids)assert.equal(currencyBalance(profiles,other),total);
   profiles[id]=settlePuzzle(profiles[id],'forest-5-1',m.id,id).profile;total+=10;
   profiles[id]=settlePuzzle(profiles[id],'forest-5-1',m.id,id).profile;
   for(const other of ids)assert.equal(currencyBalance(profiles,other),total);
   assert.equal(profiles[id].items.length,2);
  }
 }
});
