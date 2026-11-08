import test from 'node:test';
import assert from 'node:assert/strict';
import {mountActivityTemplate} from '../activity-template.mjs';
import {createActivityRegistry} from '../activity-registry.mjs';

// Minimal DOM surface for the real shell/tutorial/controller. Layout is not under test.
class Element {
 children=[]; nodes=new Map(); dataset={}; hidden=false; disabled=false; textContent='';
 querySelector(selector){
  if(!this.nodes.has(selector))this.nodes.set(selector,new Element());
  return this.nodes.get(selector);
 }
 querySelectorAll(){return [];}
 append(...nodes){this.children.push(...nodes);}
 before(){}
 setAttribute(name,value){this[name]=value;}
 replaceChildren(...nodes){this.children=nodes;}
 click(){if(!this.disabled)this.onclick?.();}
}

function environment(t){
 const data=new Map();
 for(const [name,value] of Object.entries({
  document:{createElement:()=>new Element(),body:new Element()},
  localStorage:{getItem:key=>data.get(key)??null,setItem:(key,value)=>data.set(key,String(value))},
 })){
  const old=Object.getOwnPropertyDescriptor(globalThis,name);
  Object.defineProperty(globalThis,name,{configurable:true,value});
  t.after(()=>{if(old)Object.defineProperty(globalThis,name,old);else delete globalThis[name];});
 }
 return data;
}

const draftKey=(world='space',set='set-1')=>`schitay-task-synthetic-${world}-${set}-v1`;
function mount({count=3}={}){
 const root=new Element(),calls=[],completions=[],tasks=Array.from({length:count},(_,i)=>({id:`task-${i+1}`}));
 const ctx={id:'space',targetMission:{id:'set-1',title:'Набор'},world:{buddy:'Робот',artifacts:[{id:'existing-card',mission:'set-1'}]},profile:{items:['existing-card'],puzzles:[],rewards:0}};
 function readProfile(){ctx.profile=JSON.parse(localStorage.getItem('synthetic-profile')||JSON.stringify(ctx.profile));}
 readProfile();
 let rendered;
 const engine={
  // Same exhaustion policy as figudoku: unfinished tasks, then another task for practice.
  next(context,previousId){
   calls.push({world:context.id,set:context.targetMission.id,previousId});
   return tasks.find(task=>!context.profile.puzzles.includes(task.id)&&task.id!==previousId)
    ||tasks.find(task=>task.id!==previousId)||tasks[0];
  },
  initial:()=>({value:0}),
  validateState:(_task,state)=>Number.isInteger(state?.value)&&state.value>=0&&state.value<=2,
  inspect:(_task,state)=>({solved:state.value===2,remaining:2-state.value}),
  render(board,options){
   rendered=options;
   const button=document.createElement('button');button.disabled=options.locked;
   button.onclick=()=>options.onChange({value:options.state.value+1});
   board.replaceChildren(button);
  },
 };
 const controller=mountActivityTemplate(root,{
  definition:{id:'synthetic',title:'Тестовая задача',rules:[]},context:()=>ctx,engine,
  openActivities:()=>{registry.enter('home');},openCollection:()=>{registry.enter('collection');},
  complete(taskId,setId){
   completions.push({taskId,setId});
   const already=ctx.profile.puzzles.includes(taskId);
   if(!already){ctx.profile.puzzles.push(taskId);ctx.profile.rewards++;}
   localStorage.setItem('synthetic-profile',JSON.stringify(ctx.profile));
   return {message:already?'Только тренировка':'Награда'};
  },
 });
 const registry=createActivityRegistry();registry.register('synthetic',controller);
 return {
  ctx,calls,completions,
  get rendered(){return rendered;},
  enter:()=>registry.enter('synthetic'),
  button:name=>root.querySelector(`#synthetic-${name}`),
  change:value=>rendered.onChange({value}),
  leave:()=>root.querySelector('#synthetic-back').click(),
 };
}

test('unfinished task survives leaving and returning, including undo history',t=>{
 const data=environment(t),game=mount();game.enter();game.change(1);game.leave();game.enter();
 assert.equal(game.rendered.task.id,'task-1');assert.deepEqual(game.rendered.state,{value:1});
 assert.equal(game.rendered.locked,false);assert.equal(game.calls.length,1);
 assert.deepEqual(JSON.parse(data.get(draftKey())),{id:'task-1',state:{value:1}});
 game.button('undo').click();assert.deepEqual(game.rendered.state,{value:0});
 assert.equal(game.completions.length,0);
});

test('successful completion locks input and calls the adapter only once',t=>{
 environment(t);const game=mount();game.enter();game.button('check').click();
 assert.equal(game.completions.length,0);game.change(2);
 assert.equal(game.rendered.locked,true);assert.equal(game.button('win').hidden,false);
 for(const action of ['check','undo','reset'])assert.equal(game.button(action).disabled,true);
 game.button('check').onclick();game.change(0);
 assert.deepEqual(game.rendered.state,{value:2});assert.equal(game.completions.length,1);
 assert.equal(game.ctx.profile.rewards,1);assert.deepEqual(game.ctx.profile.items,['existing-card']);
});

test('return after completion selects the next task and persists a clean draft',t=>{
 const data=environment(t),game=mount();game.enter();game.change(2);game.leave();game.enter();
 assert.equal(game.rendered.task.id,'task-2');assert.deepEqual(game.rendered.state,{value:0});
 assert.equal(game.calls.at(-1).previousId,'task-1');assert.equal(game.rendered.locked,false);
 assert.equal(game.button('win').hidden,true);assert.equal(game.button('check').disabled,false);
 assert.equal(game.button('undo').disabled,true);assert.equal(game.button('feedback').hidden,true);
 assert.deepEqual(JSON.parse(data.get(draftKey())),{id:'task-2',state:{value:0}});
 game.enter();assert.equal(game.calls.length,2);assert.equal(game.completions.length,1);
});

test('the next button and returning after completion use the same engine contract',t=>{
 environment(t);const game=mount();game.enter();game.change(2);game.button('next').click();
 assert.equal(game.rendered.task.id,'task-2');assert.equal(game.calls.at(-1).previousId,'task-1');
 game.change(1);game.leave();game.enter();assert.deepEqual(game.rendered.state,{value:1});
});

test('page reload restores an unfinished legacy v1 draft without issuing rewards',t=>{
 const data=environment(t);data.set(draftKey(),JSON.stringify({id:'task-1',state:{value:1}}));
 let game=mount();game.enter();assert.deepEqual(game.rendered.state,{value:1});
 game=mount();game.enter();assert.deepEqual(game.rendered.state,{value:1});
 assert.equal(game.rendered.locked,false);assert.equal(game.completions.length,0);
});

test('page reload after completion selects the next task using the saved profile',t=>{
 environment(t);let game=mount();game.enter();game.change(2);
 game=mount();game.enter();assert.equal(game.rendered.task.id,'task-2');
 assert.deepEqual(game.rendered.state,{value:0});assert.equal(game.completions.length,0);
 assert.equal(game.ctx.profile.rewards,1);
});

test('exhaustion follows engine practice selection and never grants a second reward',t=>{
 environment(t);let game=mount({count:2});game.enter();game.change(2);game.leave();game.enter();
 game.change(2);game.leave();game.enter();
 assert.equal(game.calls.at(-1).previousId,'task-2');assert.equal(game.rendered.task.id,'task-1');
 assert.deepEqual(game.rendered.state,{value:0});game.change(2);
 assert.equal(game.ctx.profile.rewards,2);
 // Reload with a completed draft still on disk and every task already rewarded.
 game=mount({count:2});game.enter();assert.equal(game.rendered.task.id,'task-2');
 assert.deepEqual(game.rendered.state,{value:0});assert.equal(game.completions.length,0);
 game.change(2);assert.equal(game.ctx.profile.rewards,2);
 assert.deepEqual(game.ctx.profile.items,['existing-card']);
});

test('a single exhausted task restarts cleanly on return and after reload',t=>{
 environment(t);let game=mount({count:1});game.enter();game.change(2);game.leave();game.enter();
 assert.equal(game.rendered.task.id,'task-1');assert.deepEqual(game.rendered.state,{value:0});
 game.change(2);assert.equal(game.ctx.profile.rewards,1);
 game=mount({count:1});game.enter();assert.equal(game.rendered.locked,false);
 assert.deepEqual(game.rendered.state,{value:0});game.change(2);
 assert.equal(game.ctx.profile.rewards,1);
});

for(const count of [1,2])test(`reload of an exhausted ${count}-task engine discards the completed v1 draft`,t=>{
 const data=environment(t),puzzles=Array.from({length:count},(_,i)=>`task-${i+1}`);
 data.set('synthetic-profile',JSON.stringify({items:['existing-card'],puzzles,rewards:count}));
 data.set(draftKey(),JSON.stringify({id:'task-1',state:{value:2}}));
 const game=mount({count});game.enter();
 assert.equal(game.calls.at(-1).previousId,'task-1');
 assert.equal(game.rendered.task.id,count===1?'task-1':'task-2');
 assert.deepEqual(game.rendered.state,{value:0});assert.equal(game.rendered.locked,false);
 assert.equal(game.completions.length,0);game.change(2);game.button('check').onclick();
 assert.equal(game.completions.length,1);assert.equal(game.ctx.profile.rewards,count);
});

test('switching collection keys restores only that collection and preserves its draft',t=>{
 const data=environment(t),game=mount();game.enter();game.change(1);
 game.ctx.targetMission={id:'set-2',title:'Другой набор'};game.enter();
 assert.deepEqual(game.rendered.state,{value:0});game.change(1);
 game.ctx.targetMission={id:'set-1',title:'Набор'};game.enter();
 assert.deepEqual(game.rendered.state,{value:1});assert.equal(game.calls.at(-1).previousId,undefined);
 assert.equal(JSON.parse(data.get(draftKey('space','set-2'))).state.value,1);
});

test('invalid or broken drafts start cleanly and unavailable storage does not break reentry',t=>{
 const data=environment(t);
 for(const saved of ['{broken',JSON.stringify({id:'task-1',state:{value:99}})]){
  data.set(draftKey(),saved);const game=mount();game.enter();assert.deepEqual(game.rendered.state,{value:0});
 }
 const game=mount();
 // Profile setup above reads storage; exercise the controller with storage blocked after mount.
 localStorage.getItem=()=>{throw Error('blocked');};localStorage.setItem=()=>{throw Error('blocked');};
 game.enter();game.change(1);game.leave();game.enter();assert.deepEqual(game.rendered.state,{value:1});
});
