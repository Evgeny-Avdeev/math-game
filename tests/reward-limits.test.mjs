import test from 'node:test';
import assert from 'node:assert/strict';
import {cleanProfile,settle,settlePuzzle,rewardStatus,rewardModes} from '../game.mjs';
import {getWorld} from '../worlds.mjs';
function earn(p,w,m,mode,n){return mode==='math'?settle(p,Array.from({length:m.count},()=>({first:true})),m.id,0,w):settlePuzzle(p,`${mode==='tents'?'forest-5':'figudoku-easy'}-${n}`,m.id,w);}
test('each activity awards at most five of nine cards, across every set and world',()=>{
 for(const w of ['space','dog','cat','football'])for(const m of getWorld(w).missions)for(const mode of rewardModes){
  let p=cleanProfile(null,w);
  for(let n=1;n<=5;n++){const r=earn(p,w,m,mode,n);assert.ok(r.reward);p=cleanProfile(r.profile,w);}
  const r=earn(p,w,m,mode,6);assert.equal(r.reward,null);assert.equal(r.rewardStatus.reason,'limit');assert.equal(r.profile.items.length,5);assert.ok(r.profile.stars>p.stars);
 }
});
test('last card is reserved for the third mode, in every activity order',()=>{
 for(const a of rewardModes)for(const b of rewardModes.filter(x=>x!==a)){
  const c=rewardModes.find(x=>x!==a&&x!==b),w='dog',m=getWorld(w).missions[0];let p=cleanProfile(null,w);
  for(let n=1;n<=5;n++)p=earn(p,w,m,a,n).profile;
  for(let n=6;n<=8;n++)p=earn(p,w,m,b,n).profile;
  const blocked=earn(p,w,m,b,9);assert.equal(blocked.reward,null);assert.equal(blocked.rewardStatus.reason,'reserved');
  const final=earn(blocked.profile,w,m,c,10);assert.ok(final.reward);assert.equal(final.profile.items.length,9);
  assert.deepEqual(rewardModes.map(mode=>rewardStatus(final.profile,m.id,mode,w).counts[mode]).sort(),[1,3,5]);
 }
});
test('all reachable new collection states can finish and require all three modes',()=>{
 const w='space',m=getWorld(w).missions[0];
 function visit(p,counts){
  if(p.items.length===9){assert.ok(counts.every(n=>n>0&&n<=5));return;}
  let choices=0;
  for(let i=0;i<3;i++){
   const mode=rewardModes[i];if(!rewardStatus(p,m.id,mode,w).allowed)continue;
   choices++;const r=earn(p,w,m,mode,p.items.length+1);assert.ok(r.reward);const next=[...counts];next[i]++;visit(cleanProfile(r.profile,w),next);
  }
  assert.ok(choices>0,'no collection dead ends');
 }
 visit(cleanProfile(null,w),[0,0,0]);
});
test('sources survive reload, are validated, and are independent per set and world',()=>{
 const w=getWorld('cat'),m=w.missions[0];let p=cleanProfile(null,'cat');for(let i=1;i<=5;i++)p=earn(p,'cat',m,'math',i).profile;
 p=cleanProfile(JSON.parse(JSON.stringify(p)),'cat');assert.equal(rewardStatus(p,m.id,'math','cat').allowed,false);assert.equal(rewardStatus(p,w.missions[1].id,'math','cat').allowed,true);
 const id=p.items[0];p.itemSources[id]='invalid';p.itemSources['nonexistent']='math';const cleaned=cleanProfile(p,'cat');assert.equal(cleaned.itemSources[id],undefined);assert.equal(cleaned.itemSources.nonexistent,undefined);
});
test('legacy cards and complete collections stay intact; partial old collections can finish',()=>{
 const w='football',m=getWorld(w).missions[0],items=getWorld(w).artifacts.filter(a=>a.mission===m.id).map(a=>a.id);
 for(let n=1;n<=9;n++){
  let p=cleanProfile({items:items.slice(0,n),stars:41,solved:24},w);assert.equal(p.items.length,n);assert.equal(p.stars,41);assert.equal(p.solved,24);
  for(let i=n;i<9;i++){const mode=rewardModes.find(mode=>rewardStatus(p,m.id,mode,w).allowed);assert.ok(mode);p=earn(p,w,m,mode,i+1).profile;}
  assert.equal(p.items.length,9);assert.ok(items.every(id=>p.items.includes(id)));
 }
});
