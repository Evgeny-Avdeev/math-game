import test from 'node:test';
import assert from 'node:assert/strict';
import {cleanProfile,settle,settleActivity,settlePuzzle,rewardStatus,rewardModes} from '../game.mjs';
import {getWorld} from '../worlds.mjs';
function earn(p,w,m,mode,n){
 if(mode==='math')return settle(p,Array.from({length:m.count},()=>({first:true})),m.id,0,w);
 if(mode==='multiplication')return settle(p,Array.from({length:10},()=>({first:true})),m.id,0,w,{activityId:mode,completionId:`${m.id}-series-${n}`,count:10});
 return settlePuzzle(p,`${mode==='tents'?'forest-5':'figudoku-easy'}-${n}`,m.id,w);
}
test('each activity awards at most five of nine cards, across every set and world',()=>{
 for(const w of ['space','dog','cat','football'])for(const m of getWorld(w).missions)for(const mode of rewardModes){
  let p=cleanProfile(null,w);
  for(let n=1;n<=5;n++){const r=earn(p,w,m,mode,n);assert.ok(r.reward);p=cleanProfile(r.profile,w);}
  const r=earn(p,w,m,mode,6);assert.equal(r.reward,null);assert.equal(r.rewardStatus.reason,'limit');assert.equal(r.profile.items.length,5);assert.ok(r.profile.stars>p.stars);
 }
});
test('last cards are reserved for unused activities, in every activity order',()=>{
 for(const a of rewardModes)for(const b of rewardModes.filter(x=>x!==a)){
  const [c,d]=rewardModes.filter(x=>x!==a&&x!==b),w='dog',m=getWorld(w).missions[0];let p=cleanProfile(null,w);
  for(let n=1;n<=5;n++)p=earn(p,w,m,a,n).profile;
  for(let n=6;n<=7;n++)p=earn(p,w,m,b,n).profile;
  const blocked=earn(p,w,m,b,8);assert.equal(blocked.reward,null);assert.equal(blocked.rewardStatus.reason,'reserved');
  const penultimate=earn(blocked.profile,w,m,c,9);assert.ok(penultimate.reward);
  const final=earn(penultimate.profile,w,m,d,10);assert.ok(final.reward);assert.equal(final.profile.items.length,9);
  assert.deepEqual(rewardModes.map(mode=>rewardStatus(final.profile,m.id,mode,w).counts[mode]).sort(),[1,1,2,5]);
 }
});
test('all reachable new collection states can finish and require all registered activities',()=>{
 const w='space',m=getWorld(w).missions[0];
 const seen=new Set();
 function visit(p,counts){
  const key=counts.join();if(seen.has(key))return;seen.add(key);
  if(p.items.length===9){assert.ok(counts.every(n=>n>0&&n<=5));return;}
  let choices=0;
  for(let i=0;i<rewardModes.length;i++){
   const mode=rewardModes[i];if(!rewardStatus(p,m.id,mode,w).allowed)continue;
   choices++;const r=earn(p,w,m,mode,p.items.length+1);assert.ok(r.reward);const next=[...counts];next[i]++;visit(cleanProfile(r.profile,w),next);
  }
  assert.ok(choices>0,'no collection dead ends');
 }
 visit(cleanProfile(null,w),rewardModes.map(()=>0));
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

test('multiplication completion survives reload and cannot pay twice in another set',()=>{
 const world='space',[first,second]=getWorld(world).missions;
 const initial=settleActivity(cleanProfile(null,world),'multiplication','series-a',first.id,world,{solved:10});
 assert.equal(initial.profile.stars,10);
 assert.equal(initial.profile.solved,10);
 const profile=cleanProfile(JSON.parse(JSON.stringify(initial.profile)),world);
 const replay=settleActivity(profile,'multiplication','series-a',second.id,world,{solved:10});
 assert.equal(replay.already,true);
 assert.deepEqual(replay.profile,profile);
 assert.equal(rewardStatus(profile,first.id,'math',world).counts.math,0);
});

test('a new template definition gets its own limit and preserves its reward source on reload',async()=>{
 const {activityDefinitions}=await import('../activity-definitions.mjs?v=activity-rewards-1');
 const id='future-task';
 activityDefinitions[id]={id,title:'Новое задание',mount(){}};
 try{
  const rewards=await import('../game.mjs?test=future-task');
  const world='space',mission=getWorld(world).missions[0].id;
  let profile=rewards.cleanProfile(null,world);
  for(let i=0;i<5;i++){
   const result=rewards.settleActivity(profile,id,`task-${i}`,mission,world);
   assert.ok(result.reward);
   profile=rewards.cleanProfile(JSON.parse(JSON.stringify(result.profile)),world);
   assert.equal(profile.itemSources[result.reward.id],id);
  }
  const status=rewards.rewardStatus(profile,mission,id,world);
  assert.equal(status.counts[id],5);
  assert.equal(status.reason,'limit');
  assert.ok(status.missing.includes('multiplication'));
 }finally{
  delete activityDefinitions[id];
 }
});

test('arithmetic uses the same answer currency and completion bonus for both activities',()=>{
 const world='dog',mission=getWorld(world).missions[0];
 const records=Array.from({length:mission.count},(_,i)=>({first:i>=2,skipped:i===1}));
 const rewards=['math','multiplication'].map(activityId=>{
  const options={activityId,completionId:'series-1',count:mission.count};
  const result=settle(cleanProfile(null,world),records,mission.id,2,world,options);
  assert.equal(result.stars,10+1+3*(mission.count-2));
  assert.equal(result.profile.itemSources[result.reward.id],activityId);
  const restored=cleanProfile(JSON.parse(JSON.stringify(result.profile)),world);
  const replay=settle(restored,records,mission.id,2,world,options);
  assert.equal(replay.already,true);
  assert.deepEqual(replay.profile,restored);
  return result.stars;
 });
 assert.equal(rewards[0],rewards[1]);
});
