import {makeProblems,hint} from './math.mjs';
import {missions,artifacts,badgeDefs,cleanProfile,settle} from './game.mjs';
const $=id=>document.getElementById(id),key='schitay-space-v1';
let profile=cleanProfile(),storageOK=true;
try{profile=cleanProfile(JSON.parse(localStorage.getItem(key)||'null'));}catch{storageOK=false;}
let problems=[],records=[],index=0,streak=0,bestStreak=0,attempts=0,hinted=false,checked=false,active=false,missionId=null,origin='home',earned=0,lastMistakes=[];
function save(){try{localStorage.setItem(key,JSON.stringify(profile));}catch{storageOK=false;}updateProfile();}
function el(tag,cls,text){const e=document.createElement(tag);if(cls)e.className=cls;if(text!==undefined)e.textContent=text;return e;}
function theme(e,m){e.style.setProperty('--accent',m.accent);e.style.setProperty('--tint',m.tint);}
function view(id){for(const e of document.querySelectorAll('.view'))e.hidden=e.id!==id;for(const b of document.querySelectorAll('nav [data-view]')){b.classList.toggle('active',b.dataset.view===id);b.setAttribute('aria-current',b.dataset.view===id?'page':'false');}window.scrollTo({top:0,behavior:'instant'});}
function updateProfile(){
 $('wallet').textContent=profile.stars;$('collectionCount').textContent=`${profile.items.length}/12`;$('collectionTotal').textContent=`${profile.items.length} / 12`;
 const level=Math.floor(profile.stars/50)+1;
 $('rank').textContent=level<3?'Юный исследователь':level<6?'Космический путешественник':level<10?'Капитан открытий':'Легенда космоса';
 $('levelInfo').textContent=`Уровень ${level} · ${profile.stars%50} из 50 звёзд до следующего`;$('levelProgress').style.width=`${profile.stars%50*2}%`;
 $('totalSolved').textContent=profile.solved;$('totalMissions').textContent=profile.completed;
 $('storageNote').textContent=storageOK?'Коллекция сохраняется в этом браузере на этом устройстве.':'Браузер не разрешил сохранение. Коллекция доступна, пока открыта эта страница.';
 renderMissions();renderCollection();
}
function renderMissions(){
 $('missions').replaceChildren();
 for(const [i,m] of missions.entries()){
  const n=artifacts.filter(a=>a.mission===m.id&&profile.items.includes(a.id)).length;
  const card=el('article','mission');theme(card,m);
  const art=el('div','mission-art');art.append(el('div','planet',m.symbol));art.setAttribute('aria-hidden','true');
  if(n===3)art.append(el('span','mission-complete','Коллекция собрана ✓'));
  const body=el('div','mission-body');body.append(el('span','mission-num',`МИССИЯ 0${i+1}`),el('h3','',m.title),el('p','',m.subtitle));
  const meta=el('div','mission-meta');meta.append(el('span','',`${m.count} примеров`),el('span','',`💎 ${n}/3 · ⭐ +10`));
  const b=el('button','',n===3?'Ещё полёт →':'В полёт →');b.onclick=()=>startMission(m.id);body.append(meta,b);card.append(art,body);$('missions').append(card);
 }
}
function renderCollection(){
 $('sets').replaceChildren();
 for(const m of missions){
  const set=el('section','set');theme(set,m);const head=el('div','set-head');head.append(el('h2','',m.set),el('span','',`${artifacts.filter(a=>a.mission===m.id&&profile.items.includes(a.id)).length} из 3 найдено`));
  const grid=el('div','artifacts');
  for(const [i,a] of artifacts.filter(a=>a.mission===m.id).entries()){
   const owned=profile.items.includes(a.id);const b=el('button',`artifact${owned?'':' locked'}`);
   b.append(el('span','artifact-image',owned?a.icon:'🔒'),el('b','',owned?a.name:`Секретный артефакт ${i+1}`),el('small','',owned?'Нажми: узнаешь историю':`Пройди миссию ${i+1} раз${i===0?'':i===1?'а':'а'}`));
   b.onclick=()=>openArtifact(a,owned,m);grid.append(b);
  }
  set.append(head,grid);$('sets').append(set);
 }
 $('badges').replaceChildren();
 for(const b of badgeDefs){const owned=profile.badges.includes(b.id);const card=el('div',`badge${owned?'':' locked'}`);card.append(el('span','',owned?b.icon:'🔒'),el('b','',b.name),el('p','',owned?'Получено! '+b.description:b.description));$('badges').append(card);}
}
function openArtifact(a,owned,m){const box=$('artifactDetail');box.replaceChildren();box.append(el('div','artifact-image',owned?a.icon:'🔒'),el('span','eyebrow',m.title),el('h2','',owned?a.name:'Здесь будет сокровище'),el('p','',owned?a.story:'Выполняй миссии этой планеты: за каждый удачный полёт ты получишь следующий артефакт. Подсказками пользоваться можно!'));$('artifactDialog').showModal();}
$('closeArtifact').onclick=()=>$('artifactDialog').close();
function startMission(id){const m=missions.find(m=>m.id===id);missionId=id;origin='home';start(makeProblems(m.count,m.mode,m.level),m.title,`Реши ${Math.ceil(m.count*.8)} из ${m.count} примеров и найди артефакт. Подсказки разрешены!`);}
function start(list,title,goal){
 problems=list;records=[];index=streak=bestStreak=earned=0;active=true;$('playTitle').textContent=title;$('goalText').textContent=goal;$('sessionStars').textContent='⭐ 0';view('play');show();
}
function show(){
 const p=problems[index];attempts=0;hinted=false;checked=false;
 $('position').textContent=`Пример ${index+1} из ${problems.length}`;$('progress').style.width=`${index/problems.length*100}%`;
 $('numA').textContent=p.a;$('numB').textContent=p.b;$('operator').textContent=p.op;
 const a=$('answer');a.value='';a.readOnly=false;a.className='answer';a.removeAttribute('aria-invalid');
 $('feedback').textContent='';$('feedback').className='feedback';$('submit').textContent='Проверить ✓';$('hintBox').hidden=true;$('hint').disabled=false;$('skip').hidden=false;
 $('buddyText').textContent=['Не спеши. Ты справишься!','Сначала десятки, потом единицы.','Если трудно — позови меня!'][index%3];
 $('streak').textContent=`🔥 ${streak} подряд`;$('dots').replaceChildren();
 for(let i=0;i<problems.length;i++){const d=el('span',`dot${i<index?(records[i].skipped?' skipped':' done'):i===index?' current':''}`);d.setAttribute('aria-label',`${i+1}: ${i<index?(records[i].skipped?'пропущен':'решён'):i===index?'сейчас':'впереди'}`);$('dots').append(d);}
}
function next(){index++;if(index===problems.length)finish();else{show();if(matchMedia('(min-width: 761px)').matches)$('answer').focus();}}
$('answerForm').addEventListener('submit',e=>{
 e.preventDefault();if(!active)return;if(checked){next();return;}
 const raw=$('answer').value.trim().replace('−','-');if(!/^-?\d+$/.test(raw)){feedback('Сначала введи число 😊',true);return;}
 const p=problems[index];
 if(Number(raw)===p.answer){
  const first=attempts===0&&!hinted;streak=first?streak+1:0;bestStreak=Math.max(bestStreak,streak);earned+=first?3:1;
  records.push({p,first,attempts,hinted,skipped:false});checked=true;$('answer').readOnly=true;$('answer').className='answer correct';$('answer').removeAttribute('aria-invalid');
  feedback(first?['Отлично! +3 звезды ⭐','Точно! Летим дальше! +3 ⭐','Вот это да! +3 звезды ⭐'][index%3]:'Получилось! +1 звезда за старание ⭐');
  $('submit').textContent=index===problems.length-1?'Завершить полёт 🎉':'Следующий пример →';$('skip').hidden=true;$('hint').disabled=true;$('streak').textContent=`🔥 ${streak} подряд`;$('sessionStars').textContent=`⭐ ${earned}`;
  $('buddyText').textContent=streak>=5?'Пять подряд и больше! Вот это полёт!':'Я знал, что у тебя получится!';
 }else{attempts++;streak=0;$('streak').textContent='🔥 0 подряд';$('answer').className='answer wrong';$('answer').setAttribute('aria-invalid','true');feedback('Почти! Попробуй ещё или позови Бипа 💡',true);$('buddyText').textContent='Ошибки помогают учиться. Давай попробуем вместе!';$('answer').focus();$('answer').select();}
});
function feedback(text,bad=false){$('feedback').textContent=text;$('feedback').className='feedback'+(bad?' bad':'');}
$('hint').onclick=()=>{hinted=true;streak=0;$('streak').textContent='🔥 0 подряд';$('hintBox').textContent=hint(problems[index]);$('hintBox').hidden=false;$('buddyText').textContent='Разобьём большое число на две маленькие задачи!';};
$('skip').onclick=()=>{records.push({p:problems[index],first:false,attempts,hinted,skipped:true});streak=0;next();};
$('answer').oninput=()=>{if(!checked){$('answer').className='answer';$('answer').removeAttribute('aria-invalid');$('feedback').textContent='';}};
$('keypad').onclick=e=>{const b=e.target.closest('[data-key]');if(!b||checked)return;const a=$('answer'),k=b.dataset.key;if(k==='del')a.value=a.value.slice(0,-1);else if(k==='minus')a.value=a.value.startsWith('-')?a.value.slice(1):'-'+a.value;else if(a.value.length<4)a.value+=k;a.dispatchEvent(new Event('input'));};
function finish(){
 if(!active)return;active=false;
 const result=settle(profile,records,missionId,bestStreak);profile=result.profile;save();
 lastMistakes=records.filter(r=>!r.first).map(r=>r.p);
 $('resultTitle').textContent=result.success?'Миссия выполнена!':result.solved===0?'Первый шаг сделан!':'Ты отлично потрудился!';
 $('resultText').textContent=result.success?'Космос стал чуточку понятнее. А твоя коллекция — богаче!':missionId?`Для сокровища нужно решить хотя бы ${Math.ceil(problems.length*.8)} из ${problems.length} примеров. Попробуй ещё: Бип поможет!`:'Каждый решённый пример делает тебя увереннее. Спасибо за полёт!';
 if(result.success&&!result.reward)$('resultText').textContent='Все сокровища этой планеты уже у тебя. А новые звёзды — награда за практику!';
 $('resultStats').replaceChildren();for(const [v,t] of [[`+${result.stars} ⭐`,'получено звёзд'],[`${result.solved}/${records.length}`,'решено примеров'],[records.filter(r=>r.first).length,'с первого раза']]){const d=el('div','result-stat');d.append(el('b','',v),el('span','',t));$('resultStats').append(d);}
 $('rewardBox').replaceChildren();$('rewardBox').hidden=!result.reward;if(result.reward){const a=result.reward;$('rewardBox').append(el('span','reward-label','НОВЫЙ АРТЕФАКТ В КОЛЛЕКЦИИ!'),el('div','artifact-image',a.icon),el('h2','',a.name),el('p','',a.story));}
 $('newBadges').textContent=result.badges.map(b=>`${b.icon} Новый значок: ${b.name}!`).join(' · ');
 $('review').replaceChildren();for(const r of records){const row=el('div','review-row');row.append(el('span','',`${r.skipped?'↻':'✓'} ${r.p.a} ${r.p.op} ${r.p.b} = ${r.p.answer}`),el('small','',r.skipped?'Попробуй ещё':r.first?'С первого раза':r.hinted?'С помощью Бипа':'Справился!'));$('review').append(row);}
 $('retry').hidden=!lastMistakes.length;view('result');if(result.solved)celebrate();
}
function celebrate(){const box=$('confetti');box.replaceChildren();for(let i=0;i<26;i++){const c=el('i','confetto');c.style.setProperty('--x',`${Math.random()*100}%`);c.style.setProperty('--c',['#b99ae9','#ffce7e','#9cd5b9','#8cc9e7'][i%4]);c.style.setProperty('--delay',`${Math.random()*.4}s`);box.append(c);}setTimeout(()=>box.replaceChildren(),3000);}
$('retry').onclick=()=>{missionId=null;origin='home';start(lastMistakes.map(p=>({...p})),'Ещё одна попытка','Повтори трудные примеры. За каждый ответ — звёзды!');};
$('startFree').onclick=()=>{missionId=null;origin='free';start(makeProblems(Number($('count').value),$('mode').value,$('level').value,$('negative').checked),'Свободный полёт','Считай в своём темпе и собирай звёзды.');};
$('goMission').onclick=()=>$('missionAnchor').scrollIntoView({behavior:'smooth',block:'start'});
$('nextMission').onclick=()=>view('home');
function requestView(id){if(active){pendingView=id;$('leaveDialog').showModal();}else view(id);}
let pendingView='home';$('leave').onclick=()=>requestView(origin);$('stay').onclick=()=>$('leaveDialog').close();$('confirmLeave').onclick=()=>{active=false;$('leaveDialog').close();view(pendingView);};
for(const b of document.querySelectorAll('[data-view]'))b.onclick=()=>requestView(b.dataset.view);
for(const a of document.querySelectorAll('a[href="#home"]'))a.onclick=e=>{e.preventDefault();requestView('home');};
$('print').onclick=()=>{
 const list=makeProblems(Number($('count').value),$('mode').value,$('level').value,$('negative').checked),sheet=$('printSheet');sheet.replaceChildren();
 sheet.append(el('h1','','Считай легко · Космическая математика'),el('p','','Имя: __________________    Дата: ______________'));
 const grid=el('div','print-grid');list.forEach((p,i)=>grid.append(el('div','',`${i+1}. ${p.a} ${p.op} ${p.b} = ____`)));sheet.append(grid);
 const answers=el('div','answers');answers.append(el('h2','','Ответы для проверки'));const ag=el('div','print-grid');list.forEach((p,i)=>ag.append(el('div','',`${i+1}. ${p.answer}`)));answers.append(ag);sheet.append(answers);window.print();
};
updateProfile();view('home');
