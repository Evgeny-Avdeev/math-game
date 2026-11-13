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

test('multiplication uses the shared exercise and result screens, with separate drafts and rewards',async t=>{
 const {data,$}=env(t);
 await import('../app.mjs?adapter-test=multiplication');
 const profileKey='schitay-space-v1';
 $('chooseMultiplication').click();
 const mission=getWorld('space').missions[0].id;
 const key=`schitay-multiplication-space-${mission}-v1`, draft=()=>JSON.parse(data.get(key));
 const submit=()=>$('answerForm').listeners.submit({preventDefault(){}});
 const enter=value=>{$('answer').value=String(value);$('answer').oninput();};
 const solve=()=>{enter(Number($('numA').textContent)*Number($('numB').textContent));submit();submit();};
 const leave=()=>{$('leave').click();$('confirmLeave').click();};
 const table=draft().table;
 assert.ok(['2','3','4','5'].includes(table));
 assert.equal($('operator').textContent,'×');
 assert.equal($('position').textContent,'Пример 1 из 10');
 assert.equal($('dots').children.length,10);
 assert.equal($('multiplicationTablePicker').hidden,true);
 assert.equal(data.get('schitay-tutorial-multiplication-seen-v1'),'1');
 assert.deepEqual(draft().problems.map(({a,b})=>{assert.equal(a,Number(table));return b;}).sort((a,b)=>a-b),
  [1,2,3,4,5,6,7,8,9,10]);
 $('hint').click();
 assert.match($('hintBox').textContent,/Сложи|Возьми/);
 enter(0);submit();
 assert.equal($('answer')['aria-invalid'],'true');
 assert.equal(draft().index,0);
 const beforeReload=draft();
 await import('../app.mjs?adapter-test=multiplication-reload');
 $('chooseMultiplication').click();
 assert.deepEqual(draft(),beforeReload);
 for(let i=0;i<10;i++)solve();
 assert.equal($('resultTitle').textContent,'Миссия выполнена!');
 assert.equal($('rewardBox').hidden,false);
 assert.equal($('review').children.length,10);
 const awarded=data.get(profileKey);
 const savedProfile=JSON.parse(awarded);
 assert.equal(savedProfile.stars,38);
 assert.equal(savedProfile.items.length,1);
 assert.equal(savedProfile.itemSources[savedProfile.items[0]],'multiplication');
 await import('../app.mjs?adapter-test=multiplication-completed');
 $('chooseMultiplication').click();
 assert.equal(data.get(profileKey),awarded);
 assert.notEqual(draft().table,table);
 assert.equal(draft().index,0);
 leave();
 $('activitySet').value=getWorld('space').missions[3].id;
 $('activitySet').onchange();
 $('chooseMultiplication').click();
 assert.match($('goalText').textContent,/Умножение на [6-9]/);
 leave();
 $('startFreeMultiplication').click();
 assert.equal($('multiplicationTablePicker').hidden,false);
 $('multiplicationTable').value='7';
 $('multiplicationTable').onchange();
 assert.equal(JSON.parse(data.get('schitay-multiplication-space-v1')).table,'7');
 for(let i=0;i<10;i++)solve();
 const afterPractice=JSON.parse(data.get(profileKey));
 assert.equal(afterPractice.stars,savedProfile.stars+30);
 assert.deepEqual(afterPractice.items,savedProfile.items);
 $('chooseMath').click();
 assert.notEqual($('operator').textContent,'×');
 assert.equal($('multiplicationTablePicker').hidden,true);
});

test('legacy multiplication draft restores its checked answer on the shared screen',async t=>{
 const mission=getWorld('space').missions[0].id;
 const key=`schitay-multiplication-space-${mission}-v1`;
 const draft={id:'legacy-series',table:'3',problems:Array.from({length:10},(_,i)=>[3,i+1]),index:2,answer:'9',checked:true};
 const {data,$}=env(t,new Map([[key,JSON.stringify(draft)]]));
 await import('../app.mjs?adapter-test=multiplication-legacy');
 $('chooseMultiplication').click();
 assert.equal($('answer').value,'9');
 assert.equal($('answer').readOnly,true);
 assert.equal($('position').textContent,'Пример 3 из 10');
 assert.equal(JSON.parse(data.get(key)).records.length,3);
 $('answerForm').listeners.submit({preventDefault(){}});
 assert.equal($('position').textContent,'Пример 4 из 10');
});
