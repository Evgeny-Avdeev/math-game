import test from 'node:test';
import assert from 'node:assert/strict';
import {createActivityLifecycle} from '../activity-lifecycle.mjs';
function fixture(t){
 const data=new Map(),old=globalThis.localStorage;
 globalThis.localStorage={getItem:k=>data.get(k)||null,setItem:(k,v)=>data.set(k,v)};
 t.after(()=>{if(old===undefined)delete globalThis.localStorage;else globalThis.localStorage=old;});
 let key='one',task=1,value=0,locked=false,rewards=0,renders=0,loads=0,stale=false;
 const adapter={key:()=>key,id:()=>task,stale:()=>stale,render:()=>renders++,snapshot:completed=>({task,value,completed}),
  load(saved,previous){loads++;task=previous?previous+1:saved?.task||1;value=saved&&!saved.completed?saved.value:0;locked=false;},
  solved:()=>value===2,lock:()=>{locked=true;},complete:()=>rewards++};
 const lifecycle=createActivityLifecycle(adapter);
 return {data,adapter,lifecycle,edit:n=>{value=n;lifecycle.persist();},switch:k=>{key=k;},stale:()=>{stale=true;},get state(){return {task,value,locked,rewards,renders,loads};}};
}
test('shared lifecycle preserves unfinished memory and restores independent saved scopes',t=>{
 const f=fixture(t);f.lifecycle.enter();f.edit(1);f.lifecycle.enter();
 assert.equal(f.state.loads,1);assert.equal(f.state.value,1);assert.equal(f.state.renders,1);
 f.switch('two');f.lifecycle.enter();assert.equal(f.state.value,0);
 f.switch('one');f.lifecycle.enter();assert.equal(f.state.value,1);
});
test('completion locks and persists before awarding, once; reentry advances',t=>{
 const f=fixture(t);f.lifecycle.enter();assert.equal(f.lifecycle.complete(),false);f.edit(2);
 const complete=f.adapter.complete;f.adapter.complete=()=>{assert.equal(f.state.locked,true);assert.equal(JSON.parse(f.data.get('one')).completed,true);complete();};
 assert.equal(f.lifecycle.complete(),true);assert.equal(f.lifecycle.complete(),false);assert.equal(f.state.rewards,1);
 f.lifecycle.enter();assert.equal(f.state.task,2);assert.equal(f.state.locked,false);assert.equal(f.state.value,0);
});
test('shared history invalidates an in-memory draft and next always starts clean',t=>{
 const f=fixture(t);f.lifecycle.enter();f.edit(1);f.stale();f.lifecycle.enter();assert.equal(f.state.loads,2);
 f.lifecycle.next();assert.equal(f.state.task,2);assert.equal(f.state.value,0);
});
test('malformed and unavailable storage do not prevent play or in-memory reentry',t=>{
 const f=fixture(t);f.data.set('one','{invalid');f.lifecycle.enter();assert.equal(f.state.value,0);
 globalThis.localStorage={getItem(){throw Error('blocked');},setItem(){throw Error('blocked');}};
 f.switch('two');f.lifecycle.enter();f.edit(1);f.lifecycle.enter();assert.equal(f.state.value,1);
});
