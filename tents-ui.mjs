const analyticsModule=import('./analytics.mjs?v=1').catch(()=>null);
function track(event,data){void analyticsModule.then(m=>m?.track(event,data)).catch(()=>{});}
import {puzzleSize,nextPuzzle} from './tents-sequence.mjs?v=1';
import {addTutorial} from './tents-tutorial.mjs?v=2';
import {puzzles} from './tents-data.mjs?v=1';
import {inspect} from './tents-engine.mjs?v=1';
export function mountTents(root,{context,reward,openCollection,openActivities}){
 const $=id=>root.querySelector('#'+id);let p,marks=[],history=[],locked=false,draftKey='',hintCell=-1;
 root.innerHTML=`<button class="text-button" id="forestBack">← Выбрать занятие</button><div class="forest-current-goal"><span class="eyebrow">ПРОДОЛЖАЕМ СОБИРАТЬ КОЛЛЕКЦИЮ</span><b id="forestSetTitle"></b><span id="forestSetProgress"></span></div><div class="section-head"><div><span class="eyebrow">ЛОГИКА И НОВЫЕ ОТКРЫТИЯ</span><h1>Деревья и палатки</h1><p class="muted">Одна новая головоломка — одна награда в твою коллекцию!</p></div><span class="forest-sign" aria-hidden="true">🌳 ⛺</span></div>
 <div class="forest-layout"><aside class="forest-guide"><div class="forest-postcard" aria-hidden="true">🌲 ⛺ 🌲<span>Маленький поход<br>для большого ума</span></div><h2>Разобьём лагерь?</h2><ol><li>У каждого дерева своя палатка на соседней клетке: сверху, снизу, слева или справа.</li><li>Палатки не касаются друг друга, даже уголками.</li><li>Числа у поля показывают, сколько палаток в каждой строке и столбце.</li><li>Палатка может стоять рядом с несколькими деревьями, но пара у каждого дерева своя.</li></ol><p class="small" id="forestRewardNote"></p><p class="small muted">Подсказки разрешены. За повтор уже решённого поля новая награда не выдаётся.</p></aside>
 <div class="forest-game"><div class="forest-settings"><div><span class="small muted">Размер поля</span><b id="forestSize"></b></div><div><span class="small muted">Головоломка</span><b id="forestPuzzle"></b></div></div>
 <p class="forest-instruction">Нажимай на клетку: ⛺ палатка → · трава → пусто.</p>
 <div class="forest-remaining" role="status" aria-live="polite" aria-atomic="true"><span aria-hidden="true">⛺</span><div><span id="forestRemainingLabel">Осталось поставить</span><strong id="forestRemaining"></strong></div></div><div id="forestBoard" class="forest-board" aria-label="Игровое поле"></div><div class="forest-status"><span id="forestDone"></span></div>
 <div id="forestFeedback" class="forest-feedback" role="status" aria-live="polite" hidden></div><div class="forest-actions"><button class="primary" id="forestCheck">Проверить лагерь ✓</button><button class="secondary" id="forestUndo">↶ Отменить</button><button class="secondary" id="forestHint">💡 Подсказка</button><button class="text-button" id="forestReset">Начать заново</button></div>
 <div id="forestWin" class="forest-win" hidden><div id="forestPrize"></div><button class="primary" id="forestNext">Следующая головоломка →</button><button class="text-button" id="forestCollection">Открыть коллекцию</button></div><p id="forestSave" class="small muted" hidden></p></div></div>`;
 function message(s){$('forestFeedback').textContent=s;$('forestFeedback').hidden=!s;}
 function persist(){try{localStorage.setItem(draftKey,JSON.stringify({id:p.id,marks,size:p.n,mission:context().targetMission.id}));}catch{$('forestSave').textContent='Сохранение недоступно: не закрывай страницу до конца игры.';$('forestSave').hidden=false;}}
 function load(id,saved){p=puzzles.find(p=>p.id===id)||puzzles[0];marks=Array.isArray(saved)&&saved.length===p.n*p.n?saved.map((v,i)=>p.trees.includes(i)?0:[0,1,2].includes(v)?v:0):Array(p.n*p.n).fill(0);history=[];locked=false;hintCell=-1;track('game_start',{world:context().id,game:'tents'});$('forestWin').hidden=true;message('');draw();persist();complete();}
 function draw(){updateGoal();const state=inspect(p,marks),board=$('forestBoard');board.style.setProperty('--n',p.n);board.replaceChildren();board.append(document.createElement('span'));
 function number(value,current,label){const e=document.createElement('span');e.className='forest-number'+(current>value?' over':current===value?' complete':'');e.textContent=value;e.setAttribute('aria-label',`${label}: нужно ${value}, поставлено ${current}`);return e;}
 for(let c=0;c<p.n;c++)board.append(number(p.cols[c],state.cols[c],`Столбец ${c+1}`));
 for(let r=0;r<p.n;r++){board.append(number(p.rows[r],state.rows[r],`Строка ${r+1}`));for(let c=0;c<p.n;c++){const i=r*p.n+c,tree=p.trees.includes(i),b=document.createElement('button');b.className='forest-cell'+(tree?' tree':marks[i]===1?' tent':marks[i]===2?' grass':'')+(hintCell===i?' hinted':'');b.textContent=tree?'🌳':marks[i]===1?'⛺':marks[i]===2?'·':'';b.disabled=tree||locked;b.setAttribute('aria-label',`Строка ${r+1}, столбец ${c+1}: ${tree?'дерево':marks[i]===1?'палатка':marks[i]===2?'трава':'пусто'}`);b.onclick=()=>{history.push([...marks]);marks[i]=(marks[i]+1)%3;hintCell=-1;message('');draw();persist();complete();};board.append(b);}}
 const remaining=p.trees.length-state.tents.length;
 $('forestRemainingLabel').textContent=state.solved?'Лагерь готов!':remaining<0?'Лишних палаток':'Осталось поставить';$('forestRemaining').textContent=state.solved?'✓':Math.abs(remaining);if(!state.solved){const total=document.createElement('span');total.className='forest-total';total.textContent=' / '+p.trees.length;$('forestRemaining').append(total);}root.querySelector('.forest-remaining').classList.toggle('over',remaining<0);
 $('forestDone').textContent=`Решено: ${(context().profile.puzzles||[]).filter(id=>id.startsWith('forest-')).length} / ${puzzles.length}`;$('forestUndo').disabled=!history.length||locked;$('forestHint').disabled=locked;$('forestCheck').disabled=locked;
 }
 $('forestBack').onclick=openActivities;
 $('forestUndo').onclick=()=>{if(history.length){marks=history.pop();hintCell=-1;message('');draw();persist();complete();}};
 $('forestReset').onclick=()=>{if(marks.some(v=>v)&&!locked){history.push([...marks]);marks.fill(0);hintCell=-1;draw();persist();message('');}else load(p.id);};
 $('forestHint').onclick=()=>{const wrong=marks.findIndex((v,i)=>v===1&&!p.solution.includes(i)||v===2&&p.solution.includes(i));hintCell=wrong>=0?wrong:p.solution.find(i=>marks[i]!==1)??-1;draw();if(hintCell<0)complete();else{const r=Math.floor(hintCell/p.n)+1,c=hintCell%p.n+1;message(wrong>=0?`Посмотри на выделенную клетку: строка ${r}, столбец ${c}. ${marks[hintCell]===1?'Здесь палатке не место.':'Здесь должна быть палатка, а не трава.'}`:`В выделенной клетке можно поставить палатку: строка ${r}, столбец ${c}. Проверь числа и соседние деревья.`);}};
 $('forestCheck').onclick=()=>{const s=inspect(p,marks);if(!s.solved){if(s.bad.size)message('Проверь палатки: они не должны касаться друг друга, и у каждой должно быть соседнее дерево.');else if(s.tents.length!==p.trees.length)message(`У каждого дерева должна быть своя палатка. Нужно ${p.trees.length}, сейчас ${s.tents.length}.`);else if(!s.rows.every((v,i)=>v===p.rows[i])||!s.cols.every((v,i)=>v===p.cols[i]))message('Сравни количество палаток с числами у строк и столбцов. Красное число означает, что палаток слишком много.');else message('Проверь пары: каждому дереву нужна своя отдельная палатка.');return;}
 complete();};
 function complete(){
 if(locked||!inspect(p,marks).solved)return false;
 locked=true;track('game_complete',{world:context().id,game:'tents',solved:1});const result=reward(p.id,context().targetMission.id);draw();$('forestWin').hidden=false;$('forestPrize').replaceChildren();message(result.already?'Этот лагерь уже был решён. Продолжим со следующей головоломкой!':'Ура! Лагерь готов, все правила соблюдены!');const title=document.createElement('h2');title.textContent=result.already?'Отличная тренировка!':result.reward?'Новая награда в коллекции!':'Лагерь готов! +10';$('forestPrize').append(title);if(result.reward){const pic=document.createElement('div');pic.className='forest-prize-image';pic.append(result.image);const name=document.createElement('h3');name.textContent=result.reward.name;const story=document.createElement('p');story.textContent=result.reward.story;$('forestPrize').append(pic,name,story);}else{const note=document.createElement('p');note.textContent=result.already?'За это поле награда уже получена.':'Все карточки выбранного набора уже собраны. За новый лагерь получено 10 единиц награды!';$('forestPrize').append(note);}persist();return true;}
 $('forestNext').onclick=()=>{const ctx=context();load(nextPuzzle(puzzles,puzzleSize(ctx.missions,ctx.targetMission.id),ctx.profile.puzzles,p.id).id);};$('forestCollection').onclick=openCollection;
 function updateGoal(){const ctx=context();
 if(p){$('forestSize').textContent=`${p.n} × ${p.n}`;const list=puzzles.filter(a=>a.n===p.n);$('forestPuzzle').textContent=`№ ${list.findIndex(a=>a.id===p.id)+1} из ${list.length}`;}
 $('forestSetTitle').textContent=ctx.targetMission.title;
 const items=ctx.world.artifacts.filter(a=>a.mission===ctx.targetMission.id);
 $('forestSetProgress').textContent=`${items.filter(a=>ctx.profile.items.includes(a.id)).length} из ${items.length} · следующая награда за один новый лагерь`;
 $('forestRewardNote').textContent=`Этот лагерь принесёт награду в набор «${ctx.targetMission.title}».`;
 }
 function enter(){const ctx=context(),size=puzzleSize(ctx.missions,ctx.targetMission.id),key=`schitay-tents-${ctx.id}-${ctx.targetMission.id}-v2`;
 const next=nextPuzzle(puzzles,size,ctx.profile.puzzles);
 if(draftKey===key&&p?.id===next.id&&!locked){updateGoal();return;}
 draftKey=key;let saved;
 try{saved=JSON.parse(localStorage.getItem(key)||'null');if(!saved){const old=JSON.parse(localStorage.getItem(`schitay-tents-${ctx.id}-v1`)||'null');if(old?.mission===ctx.targetMission.id)saved=old;}}catch{}
 load(next.id,saved?.id===next.id?saved.marks:null);
 }
 addTutorial(root);
 return {enter};
}
