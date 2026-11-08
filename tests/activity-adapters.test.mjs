import test from 'node:test';
import assert from 'node:assert/strict';
import {mountTents} from '../tents-ui.mjs';
import {mountFigudoku} from '../figudoku-ui.mjs';
import {puzzles} from '../tents-data.mjs';
import {figudokuPuzzles} from '../figudoku-data.mjs';
import {getWorld} from '../worlds.mjs';
import {cleanProfile} from '../game.mjs';
// Minimal DOM for real controllers, not a layout or browser substitute.
class Element{
 nodes=new Map();children=[];dataset={};hidden=false;disabled=false;value='';textContent='';style={setProperty(){}};classList={toggle(){},add(){}};listeners={};
 querySelector(s){if(!this.nodes.has(s))this.nodes.set(s,new Element());return this.nodes.get(s);}
 querySelectorAll(){return [];}
 append(...nodes){this.children.push(...nodes);}before(){}replaceChildren(...nodes){this.children=nodes;}
 setAttribute(k,v){this[k]=v;}removeAttribute(k){delete this[k];}addEventListener(k,fn){this.listeners[k]=fn;}
 click(){if(!this.disabled)this.onclick?.();}showModal(){this.open=true;}close(){this.open=false;}focus(){}select(){}
}
function env(t,data=new Map()){
 const doc={createElement:()=>new Element(),body:new Element(),nodes:new Map(),querySelectorAll:()=>[],querySelector:()=>new Element(),addEventListener(){},getElementById(id){if(!this.nodes.has(id))this.nodes.set(id,new Element());return this.nodes.get(id);}};
 const globals={document:doc,window:{addEventListener(){},scrollTo(){}},location:{hash:''},matchMedia:()=>({matches:false}),requestAnimationFrame:()=>1,cancelAnimationFrame(){},Option:class extends Element{constructor(text,value){super();this.textContent=text;this.value=value;}},localStorage:{getItem:k=>data.get(k)||null,setItem:(k,v)=>data.set(k,v)}};
 for(const [k,v] of Object.entries(globals)){const old=Object.getOwnPropertyDescriptor(globalThis,k);Object.defineProperty(globalThis,k,{value:v,configurable:true});t.after(()=>old?Object.defineProperty(globalThis,k,old):delete globalThis[k]);}
 return {data,doc,$:id=>doc.getElementById(id)};
}
for(const type of ['tents','figudoku'])test(`${type} real adapter restores legacy input, locks completion and follows shared history`,t=>{
 const {data}=env(t),world=getWorld('dog');const ctx={id:'dog',world,missions:world.missions,targetMission:world.missions[0],profile:cleanProfile(null,'dog'),solvedPuzzles:[]};
 const forest=type==='tents',mount=forest?mountTents:mountFigudoku,list=forest?puzzles:figudokuPuzzles,key=`schitay-${type}-dog-${ctx.targetMission.id}-${forest?'v2':'v1'}`;let awards=0;
 const services={context:()=>ctx,openActivities(){},openCollection(){},reward(id){awards++;ctx.profile.puzzles.push(id);ctx.solvedPuzzles.push(id);return {already:false,reward:null,rewardStatus:{reason:"complete"}};}};
 let root=new Element(),controller=mount(root,services);controller.enter();let saved=JSON.parse(data.get(key)),task=list.find(p=>p.id===saved.id);
 let missing;
 if(forest){const marks=Array(task.n*task.n).fill(0);for(const i of task.solution)marks[i]=1;missing=task.solution[0];marks[missing]=0;saved={...saved,marks};}
 else{missing=task.numbers.findIndex(n=>!n);saved={...saved,numbers:[...task.solutionNumbers],shapes:[...task.solutionShapes]};saved.numbers[missing]=0;}
 data.set(key,JSON.stringify(saved));root=new Element();controller=mount(root,services);controller.enter();assert.equal(awards,0);
 const draft=data.get(key);controller.enter();assert.equal(data.get(key),draft);
 if(forest)root.querySelector('#forestBoard').children[(Math.floor(missing/task.n)+1)*(task.n+1)+missing%task.n+1].click();
 else{root.querySelector('#figBoard').children[missing].click();root.querySelector('#figNumbers').children[task.solutionNumbers[missing]-1].click();}
 assert.equal(awards,1);assert.equal(root.querySelector(forest?'#forestWin':'#figWin').hidden,false);
 assert.equal(root.querySelector(forest?'#forestReset':'#figReset').disabled,true);
 controller.enter();assert.notEqual(JSON.parse(data.get(key)).id,task.id);assert.equal(awards,1);
 saved=JSON.parse(data.get(key));ctx.solvedPuzzles.push(saved.id);controller.enter();assert.notEqual(JSON.parse(data.get(key)).id,saved.id);
});
test('actual math adapter restores checked answer, leaves/resumes, finishes once and reloads cleanly',async t=>{
 const {data,$}=env(t);await import('../app.mjs?adapter-test=first');
 const submit=()=>$('answerForm').listeners.submit({preventDefault(){}});
 const answer=()=>Number($('numA').textContent)+($('operator').textContent==='+'?1:-1)*Number($('numB').textContent);
 $('chooseMath').click();const expected=answer();$('answer').value=String(expected);$('answer').oninput();submit();
 const key=[...data.keys()].find(k=>k.startsWith('schitay-math-'));assert.equal(JSON.parse(data.get(key)).checked,true);
 await import('../app.mjs?adapter-test=reload');$('chooseMath').click();assert.equal($('answer').value,String(expected));assert.equal($('answer').readOnly,true);
 submit();assert.match($('position').textContent,/2 из/);$('answer').value='12';$('answer').oninput();$('leave').click();$('confirmLeave').click();$('chooseMath').click();assert.equal($('answer').value,'12');
 // Complete remaining examples without changing settlement rules.
 while(!JSON.parse(data.get(key)).completed){$('answer').value=String(answer());submit();submit();}
 const profileKey='schitay-space-v1',profile=data.get(profileKey);assert.ok(profile);
 await import('../app.mjs?adapter-test=finished');$('chooseMath').click();assert.match($('position').textContent,/1 из/);assert.equal(data.get(profileKey),profile);
 const corrupt=JSON.parse(data.get(key));corrupt.index=1;corrupt.records=[null];data.set(key,JSON.stringify(corrupt));
 await import('../app.mjs?adapter-test=corrupt');$('chooseMath').click();assert.match($('position').textContent,/1 из/);
 // A hinted attempt survives reload and keeps its lower first-answer reward.
 $('hint').click();$('answer').value=String(answer());$('answer').oninput();
 await import('../app.mjs?adapter-test=hinted');$('chooseMath').click();submit();
 assert.equal(JSON.parse(data.get(key)).records[0].first,false);
 assert.equal(JSON.parse(data.get(key)).earned,1);
});
