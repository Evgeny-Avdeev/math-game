import {mountActivityTemplate} from './activity-template.mjs?v=arithmetic-template-1';
import {activityDefinitions} from './activity-definitions.mjs?v=activity-rewards-1';
import {makeProblems,hint} from './math.mjs?v=15';
import {makeMultiplicationSeries,multiplicationSeriesLength,multiplicationHint,multiplicationTable,multiplicationTables,restoreMultiplicationDraft,validMultiplicationSeries} from './multiplication.mjs?v=2';
import {amount} from './worlds.mjs?v=dogs-names-1';
import {answerReward,rewardStatus,rewardMessage} from './game.mjs?v=arithmetic-template-1';

export function mountArithmetic(root, {$,context,view,track,el,setSpeech,setCurrency,itemImage,themedBadges,celebrate,goalMission,complete,completeLegacy,onStorageError}){
 let problems=[],records=[],index=0,streak=0,bestStreak=0,attempts=0,hinted=false,checked=false,active=false,missionId=null,origin='home',earned=0,lastMistakes=[];
 function startMission(m){
  const {world,worldId,profile}=context();
  missionId=m.id;origin='home';
  start(makeProblems(m.count,'mixed',m.level),m.title,`Собираем набор «${m.title}». Реши ${Math.ceil(m.count*.8)} из ${m.count} примеров · + и − и получи ${world.collectibleAcc}. Подсказки разрешены! ${rewardMessage(rewardStatus(profile,m.id,'math',worldId))}`);
 }
 let mathStart,mathSessionId,seriesTable;
 const isMultiplication = () => mathStart?.mode==='multiplication';
 const problemHint = () => (isMultiplication()?multiplicationHint:hint)(problems[index]);
 const lifecycle={
  key(){
   const {worldId}=context();
   if(mathStart.retry)return `schitay-${mathStart.mode}-${worldId}-retry-v1`;
   return isMultiplication()
    ? `schitay-multiplication-${worldId}${missionId?'-'+missionId:''}-v1`
    : `schitay-math-${worldId}-${missionId||origin}-v1`;
  },
  id:()=>mathSessionId,render:()=>{active=true;},
  solved:()=>active&&index===problems.length,
  lock:()=>{active=false;},
  snapshot:completed=>({completed,rewardVersion:1,id:mathSessionId,mode:mathStart.mode,table:seriesTable,problems,records,index,streak,bestStreak,attempts,hinted,checked,earned,missionId,origin,
   title:$('playTitle').textContent,goal:$('goalText').textContent,answer:$('answer').value,feedback:$('feedback').textContent}),
  load(saved){
   const {worldId,missions}=context();
   const multiplication=isMultiplication();
   const level=missionId&&missions.find(m=>m.id===missionId).level;
   if(multiplication) saved=restoreMultiplicationDraft(saved,missionId,origin);
   const validProblems=Array.isArray(saved?.problems)&&saved.problems.length>0&&saved.problems.length<=100
    &&(multiplication?validMultiplicationSeries(saved.problems,saved.table,level,{retry:!!mathStart.retry})
      :saved.problems.every(p=>p&&Number.isInteger(p.a)&&Number.isInteger(p.b)&&['+','−'].includes(p.op)&&p.answer===(p.op==='+'?p.a+p.b:p.a-p.b)));
   const sameSeries=validProblems&&saved.missionId===missionId&&saved.origin===origin&&typeof saved.id==='string';
   const recordCount=saved?.completed?saved.problems?.length:saved?.index+(saved?.checked?1:0);
   const validRecords=sameSeries&&Array.isArray(saved.records)&&saved.records.length===recordCount
    &&saved.records.every((r,i)=>r?.p&&saved.problems[i]&&r.p.a===saved.problems[i].a&&r.p.b===saved.problems[i].b&&r.p.op===saved.problems[i].op
     &&typeof r.first==='boolean'&&typeof r.skipped==='boolean'&&(!multiplication||!r.skipped));
   if(validRecords&&saved.completed){
    if(saved.rewardVersion===1&&Number.isSafeInteger(saved.bestStreak)&&saved.bestStreak>=0)
     complete(completion(saved.records,saved.id,saved.bestStreak));
    else if(multiplication&&missionId)completeLegacy(saved.id,missionId,saved.problems.length);
   }
   const draft=validRecords&&!saved.completed&&Number.isInteger(saved.index)&&saved.index>=0&&saved.index<saved.problems.length
    &&['streak','bestStreak','attempts','earned'].every(k=>Number.isSafeInteger(saved[k])&&saved[k]>=0)?saved:null;
   if(multiplication){
    const previous=sameSeries?saved.table:mathStart.previousTable;
    seriesTable=draft?.table??(missionId?multiplicationTable(level,previous):mathStart.table??previous??'mixed');
   }else seriesTable=undefined;
   problems=draft?.problems??mathStart.list??makeMultiplicationSeries(seriesTable);
   records=draft?draft.records:[];
   index=draft?draft.index:0;streak=draft?draft.streak:0;bestStreak=draft?draft.bestStreak:0;earned=records.reduce((sum,record)=>sum+answerReward(record),0);
   mathSessionId=draft?draft.id:crypto.randomUUID();active=true;
   $('playTitle').textContent=draft?.title??mathStart.title;
   $('mathSetProgress').textContent=missionId?'Решай примеры и пополняй коллекцию':'Тренировка в своём темпе';
   $('goalText').textContent=multiplication&&!mathStart.retry
    ? `${seriesTable==='mixed'?'Вперемешку':'Умножение на '+seriesTable}. ${mathStart.goal}`
    : draft?.goal??mathStart.goal;
   if(multiplication&&!missionId&&!mathStart.retry)$('multiplicationTable').value=seriesTable;
   setCurrency($('sessionStars'),earned);show();
   if(draft){attempts=draft.attempts;hinted=!!draft.hinted;checked=!!draft.checked;$('answer').value=String(draft.answer||'');
    $('answer').readOnly=checked;$('answer').className='answer'+(checked?' correct':'');
    feedback(draft.feedback||'');$('skip').hidden=checked||multiplication;$('hint').disabled=checked;
    $('hintBox').hidden=!hinted;if(hinted)$('hintBox').textContent=problemHint();
    if(checked)$('submit').textContent=nextAnswerLabel();
    $('streak').textContent=`🔥 ${streak} подряд`;
   }
   track('game_start',{world:worldId,game:mathStart.mode});
  },
  onStorageError,
 };
 function completion(series=records,id=mathSessionId,best=bestStreak){
  return {records:series,completionId:id,bestStreak:best,missionId,activityId:mathStart.mode,count:isMultiplication()?multiplicationSeriesLength:undefined};
 }
 const template=mountActivityTemplate(root,{complete,screen:{
  definitions:[activityDefinitions.math,activityDefinitions.multiplication],
  activityId:()=>mathStart.mode,
  lifecycle,
  completion,
  onComplete:finishResult,
 }});
 function start(list,title,goal){openArithmetic({mode:'math',list,title,goal});}
 function openArithmetic(config){
  mathStart=config;
  const multiplication=isMultiplication();
  template.prepare(activityDefinitions[config.mode]);
  $('multiplicationTablePicker').hidden=!multiplication||!!missionId||!!config.retry;
  $('answerSign').hidden=multiplication;
  template.enter();
  view('play');
 }
 function persistMath(){if(active)template.persist();}
 window.addEventListener('pagehide',persistMath);

 function show(){
  const p=problems[index];attempts=0;hinted=false;checked=false;
  $('position').textContent=`Пример ${index+1} из ${problems.length}`;$('progress').style.width=`${index/problems.length*100}%`;
  $('numA').textContent=p.a;$('numB').textContent=p.b;$('operator').textContent=p.op;
  const a=$('answer');a.value='';a.readOnly=false;a.className='answer';a.removeAttribute('aria-invalid');
  $('feedback').textContent='';$('feedback').className='feedback';$('submit').textContent='Проверить ✓';$('hintBox').hidden=true;$('hint').disabled=false;$('skip').hidden=isMultiplication();
  $('buddyText').textContent=['Не спеши. Ты справишься!',isMultiplication()?'Вспомни таблицу умножения.':'Прибавляй или вычитай по частям.','Если трудно — позови меня!'][index%3];
  $('streak').textContent=`🔥 ${streak} подряд`;$('dots').replaceChildren();
  for(let i=0;i<problems.length;i++){const d=el('span',`dot${i<index?(records[i].skipped?' skipped':' done'):i===index?' current':''}`);d.setAttribute('aria-label',`${i+1}: ${i<index?(records[i].skipped?'пропущен':'решён'):i===index?'сейчас':'впереди'}`);$('dots').append(d);}
 }
 function nextAnswerLabel(){
  if(index<problems.length-1)return 'Ещё пример →';
  return 'Забрать награды! 🎉';
 }
 function next(){index++;if(index===problems.length)finish();else{show();persistMath();}}
 $('answerForm').addEventListener('submit',e=>{
  e.preventDefault();if(!active)return;if(checked){next();return;}
  const raw=$('answer').value.trim().replace('−','-');if(!(isMultiplication()?/^\d+$/:/^-?\d+$/).test(raw)){feedback('Сначала введи число 😊',true);return;}
  const p=problems[index];
  if(Number(raw)===p.answer){
   const {world}=context();
   const first=attempts===0&&!hinted;streak=first?streak+1:0;bestStreak=Math.max(bestStreak,streak);
   const record={p,first,attempts,hinted,skipped:false};
   records.push(record);const gain=answerReward(record);earned+=gain;checked=true;$('answer').readOnly=true;$('answer').className='answer correct';$('answer').removeAttribute('aria-invalid');
   const praise=first?['Ура! Всё верно!','Вот это да!','Отличный ответ!'][index%3]:'Получилось!';
   feedback(`${praise} +${amount(gain,world)} ${first?'🎉':'💛'}`);
   $('submit').textContent=nextAnswerLabel();$('skip').hidden=true;$('hint').disabled=true;$('streak').textContent=`🔥 ${streak} подряд`;setCurrency($('sessionStars'),earned);
   setSpeech($('buddyText'),streak>=5?`Пять подряд и больше! ${highFive()}`:'Я знал, что у тебя получится!');
  }else{attempts++;streak=0;$('streak').textContent='🔥 0 подряд';$('answer').className='answer wrong';$('answer').setAttribute('aria-invalid','true');feedback(`Почти! Попробуй ещё или позови на помощь 💡`,true);$('buddyText').textContent='Ошибки помогают учиться. Давай попробуем вместе!';if(!isMultiplication()){$('answer').focus();$('answer').select();}}
  persistMath();
 });
 function highFive(){return ['dog','dogMore','cat'].includes(context().worldId)?'Дай лапу!':'Дай пять! 🖐';}
 function feedback(text,bad=false){$('feedback').textContent=text;$('feedback').className='feedback'+(bad?' bad':'');}
 $('hint').onclick=()=>{hinted=true;streak=0;$('streak').textContent='🔥 0 подряд';$('hintBox').textContent=problemHint();$('hintBox').hidden=false;$('buddyText').textContent='Посчитаем по частям — так проще!';persistMath();};
 $('skip').onclick=()=>{if(isMultiplication())return;records.push({p:problems[index],first:false,attempts,hinted,skipped:true});streak=0;next();};
 $('answer').oninput=()=>{if(!checked){$('answer').className='answer';$('answer').removeAttribute('aria-invalid');$('feedback').textContent='';persistMath();}};
 $('keypad').onclick=e=>{const b=e.target.closest('[data-key]');if(!b||checked||(isMultiplication()&&b.dataset.key==='minus'))return;const a=$('answer'),k=b.dataset.key;if(k==='del')a.value=a.value.slice(0,-1);else if(k==='minus')a.value=a.value.startsWith('-')?a.value.slice(1):'-'+a.value;else if(a.value.length<4)a.value+=k;a.dispatchEvent(new Event('input'));};
 function finish(){template.complete();}
 function finishResult(result){
  const {worldId,world}=context();
  track('game_complete',{world:worldId,game:mathStart.mode,solved:result.solved});
  lastMistakes=records.filter(r=>!r.first).map(r=>r.p);
  const title=result.success?'Миссия выполнена!':result.solved===0?'Первый шаг сделан!':'Ты отлично потрудился!';
  const message=result.success
   ? result.reward?(worldId==='space'?'Космос стал понятнее, а коллекция — богаче!':(world.successText||'В твоей команде появился новый хвостатый друг!'))
    : `${rewardMessage(result.rewardStatus)} А ${world.currency} — награда за практику.`
   : missionId?`Для награды нужно решить хотя бы ${Math.ceil(problems.length*.8)} из ${problems.length} примеров. Попробуй ещё: ${world.buddy} поможет!`
    : `Каждый решённый пример делает тебя увереннее. ${highFive()}`;
  $('resultTitle').textContent=title;
  setSpeech($('resultText'),message);
  $('nextMission').textContent=isMultiplication()&&!mathStart.retry?'Новая серия →':`К ${world.place} →`;
  $('nextMission').onclick=isMultiplication()&&!mathStart.retry?()=>openMultiplication(!missionId,seriesTable):()=>view('home');
  $('resultStats').replaceChildren();for(const [v,t] of [[`+${result.stars}` ,world.unit[2]+' получено'],[`${result.solved}/${records.length}`,'решено примеров'],[records.filter(r=>r.first).length,'с первого раза']]){const d=el('div','result-stat');d.append(el('b','',v),el('span','',t));$('resultStats').append(d);}
  $('rewardBox').replaceChildren();$('rewardBox').hidden=!result.reward;if(result.reward){const a=result.reward;$('rewardBox').append(el('span','reward-label',world.rewardTitle||(worldId==='space'?'НОВЫЙ АРТЕФАКТ!':'НОВАЯ ПОРОДА В КОЛЛЕКЦИИ!')),itemImage(a,true),el('h2','',a.name),el('p','',a.story));}
  $('newBadges').textContent=result.badges.map(b=>{const themed=themedBadges().find(d=>d.id===b.id);return `${themed.icon} Новый значок: ${themed.name}!`;}).join(' · ');
  $('review').replaceChildren();for(const r of records){const row=el('div','review-row');row.append(el('span','',`${r.skipped?'↻':'✓'} ${r.p.a} ${r.p.op} ${r.p.b} = ${r.p.answer}`),el('small','',r.skipped?'Попробуй ещё':r.first?'С первого раза':r.hinted?'С подсказкой':'Справился!'));$('review').append(row);}
  $('retry').hidden=!lastMistakes.length;view('result');if(result.solved&&!result.already)celebrate();
 }
 $('retry').onclick=()=>{
  const {world}=context();
  missionId=null;origin='home';
  openArithmetic({mode:mathStart.mode,retry:true,table:seriesTable,list:lastMistakes.map(p=>({...p})),
   title:'Ещё одна попытка',goal:`Повтори трудные примеры. За каждый ответ — ${world.currency}!`});
 };
 $('startFree').onclick=()=>{
  const {world}=context();
  missionId=null;origin='free';
  start(makeProblems(Number($('count').value),'mixed',$('level').value,$('negative').checked),'Просто играем!',`Считай в своём темпе и собирай ${world.currency}.`);
 };
 function openMultiplication(practice,previousTable){
  const {profile,world,worldId}=context();
  const mission=practice?null:goalMission();
  missionId=mission?.id??null;
  origin=practice?'free':'home';
  openArithmetic({
   mode:'multiplication',previousTable,title:mission?.title??'Свободная тренировка',
   goal:practice?`Считай в своём темпе и собирай ${world.currency}.`
    :`Реши ${multiplicationSeriesLength} примеров. ${rewardMessage(rewardStatus(profile,missionId,'multiplication',worldId))}`,
  });
 }
 $('startFreeMultiplication').onclick=()=>openMultiplication(true);
 $('multiplicationTable').replaceChildren(...multiplicationTables.map(table=>new Option(table==='mixed'?'Вперемешку':`Умножение на ${table}`,table)));
 $('multiplicationTable').onchange=()=>{
  if(!isMultiplication()||missionId||mathStart.retry)return;
  mathStart.table=$('multiplicationTable').value;
  template.next();
 };
 return {
  startMission,openMultiplication,persist:persistMath,
  get active(){return active;},
  get origin(){return origin;},
  leave(){persistMath();active=false;},
  showTutorialIfFirst:template.showTutorialIfFirst,
 };
}
