const analyticsModule=import('./analytics.mjs?v=1').catch(()=>null);
function track(event,data){void analyticsModule.then(m=>m?.track(event,data)).catch(()=>{});}
import {mountFigudoku} from './figudoku-ui.mjs?v=responsive-buddy-20261108';
import {mountTents} from './tents-ui.mjs?v=responsive-buddy-20261108';
import {makeProblems,hint} from './math.mjs?v=15';
import {badgeDefs,cleanProfile,settle,settlePuzzle,rewardStatus,rewardMessage,rewardModes} from './game.mjs?v=teams-repair2-20261107';
import {worlds,getWorld,amount} from './worlds.mjs?v=teams-repair2-20261107';
import {portrait} from './portraits.mjs?v=teams-repair2-20261107';
const $=id=>document.getElementById(id);
let worldId='space',world,missions,artifacts,profile,storageOK=true;
let puzzleUI,figudokuUI;
const selectedSets={};
const profiles={};
let footballMenuOpen=false;
const isFootball=()=>worldId==='football'||worldId==='footballTeams';
try{const selected=localStorage.getItem('schitay-world-v1');if(worlds[selected])worldId=selected;}catch{storageOK=false;}
for(const id of Object.keys(worlds)){try{profiles[id]=cleanProfile(JSON.parse(localStorage.getItem(`schitay-${id}-v1`)||'null'),id);}catch{profiles[id]=cleanProfile(null,id);storageOK=false;}}
function bindWorld(){world=getWorld(worldId);missions=world.missions.map((m,i)=>({...m,level:i===0?'easy':i===3?'carry':'all'}));artifacts=world.artifacts;profile=profiles[worldId];if(!selectedSets[worldId])try{selectedSets[worldId]=localStorage.getItem(`schitay-goal-${worldId}-v1`);}catch{storageOK=false;}}
bindWorld();
track('page_view',{world:worldId});
let problems=[],records=[],index=0,streak=0,bestStreak=0,attempts=0,hinted=false,checked=false,active=false,missionId=null,origin='home',earned=0,lastMistakes=[];
function save(){profiles[worldId]=profile;try{localStorage.setItem(`schitay-${worldId}-v1`,JSON.stringify(profile));}catch{storageOK=false;}updateProfile();}
function el(tag,cls,text){const e=document.createElement(tag);if(cls)e.className=cls;if(text!==undefined)e.textContent=text;return e;}
function theme(e,m){e.style.setProperty('--accent',m.accent);e.style.setProperty('--tint',m.tint);}
function view(id,options={}){if(id==='tents')puzzleUI?.enter();if(id==='figudoku')figudokuUI?.enter();for(const e of document.querySelectorAll('.view'))e.hidden=e.id!==id;for(const b of document.querySelectorAll('nav [data-view]')){b.classList.toggle('active',b.dataset.view===(['tents','figudoku','play','result'].includes(id)?'home':id));b.setAttribute('aria-current',b.dataset.view===(['tents','figudoku','play','result'].includes(id)?'home':id)?'page':'false');}scrollToView(id,options);}
// Wait until the newly selected view and its dynamic content have been laid out.
let navigationFrame=0;
function scrollToView(id,{scroll=true}={}){
 cancelAnimationFrame(navigationFrame);
 if(!scroll){window.scrollTo({top:0,behavior:'instant'});return;}
 if(!matchMedia('(max-width:600px)').matches){window.scrollTo({top:0,behavior:'instant'});return;}
 navigationFrame=requestAnimationFrame(()=>{
  const selectors={home:'#activityHub',play:'#play .prompt',tents:'#tents .forest-remaining',figudoku:'#figudoku .forest-remaining',collection:'#collection .section-head',free:'#free .free-card',result:'#result .result-card'};
  const target=document.querySelector(selectors[id]||'#'+id);
  if(!target||target.closest('[hidden]'))return;
  const top=Math.max(0,target.getBoundingClientRect().top+window.scrollY-12);
  window.scrollTo({top,behavior:matchMedia('(prefers-reduced-motion:reduce)').matches?'instant':'smooth'});
 });
}
document.addEventListener('click',e=>{if(e.target.closest('#forestNext'))scrollToView('tents');else if(e.target.closest('#figNext'))scrollToView('figudoku');});
function updateProfile(){
 $('wallet').textContent=profile.stars;$('collectionCount').textContent=`${profile.items.length}/${artifacts.length}`;$('collectionTotal').textContent=`${profile.items.length} / ${artifacts.length}`;
 const level=Math.floor(profile.stars/50)+1;
 $('rank').textContent=world.rank[level<3?0:level<6?1:level<10?2:3];
 $('levelInfo').textContent=`Уровень ${level} · ${profile.stars%50} из 50 ${world.unit[2]} до следующего`;$('levelProgress').style.width=`${profile.stars%50*2}%`;
 $('totalSolved').textContent=profile.solved;$('totalMissions').textContent=profile.completed;
 $('storageNote').textContent=storageOK?'Коллекция сохраняется в этом браузере на этом устройстве.':'Браузер не разрешил сохранение. Коллекция доступна, пока открыта эта страница.';
 renderMissions();renderCollection();renderActivity();renderFootballMenu();
}
function difficulty(m){return {easy:'лёгкая',all:'средняя',carry:'сложная'}[m.level];}
function renderMissions(){
 $('missions').replaceChildren();
 for(const [i,m] of missions.entries()){
  const total=artifacts.filter(a=>a.mission===m.id).length;const n=artifacts.filter(a=>a.mission===m.id&&profile.items.includes(a.id)).length;
  const card=el('article','mission');theme(card,m);
  const art=el('div','mission-art');if(worldId==='space')art.append(el('div','planet',m.symbol));else{const pic=el('div','mission-pet');pic.innerHTML=portrait(artifacts.find(a=>a.mission===m.id));art.append(pic,el('span','math-sticker',m.symbol));}art.setAttribute('aria-hidden','true');
  if(n===total)art.append(el('span','mission-complete','Коллекция собрана ✓'));
  const body=el('div','mission-body');body.append(el('span','mission-num',`МИССИЯ 0${i+1}`),el('h3','',m.title));
  const meta=el('div','mission-meta');meta.append(el('span','',`Сложность: ${difficulty(m)}`),el('span','',`${world.collectionIcon} ${n}/${total} · +10 ${world.unit[2]}`));
  const b=el('button','',n===total?'Набор собран ✓':'Выбрать набор →');b.onclick=()=>{selectedSets[worldId]=m.id;renderActivity();$('activityHub').scrollIntoView({behavior:'smooth',block:'start'});};body.append(meta,b);card.append(art,body);$('missions').append(card);
 }
}
function renderCollection(){
 $('sets').replaceChildren();
 for(const m of missions){
  const set=el('section','set');theme(set,m);const head=el('div','set-head');head.append(el('h2','',m.title),el('span','',`${artifacts.filter(a=>a.mission===m.id&&profile.items.includes(a.id)).length} из ${artifacts.filter(a=>a.mission===m.id).length} найдено`));
  const grid=el('div','artifacts');
  for(const [i,a] of artifacts.filter(a=>a.mission===m.id).entries()){
   const owned=profile.items.includes(a.id);const b=el('button',`artifact${owned?'':' locked'}`);
   b.append(itemImage(a,owned),el('b','',owned?a.name:`${world.secret} ${i+1}`),el('small','',owned?'Нажми: узнаешь историю':'Примеры или головоломка'));
   b.onclick=()=>openArtifact(a,owned,m);grid.append(b);
  }
  set.append(head,grid);$('sets').append(set);
 }
 $('badges').replaceChildren();
 for(const b of themedBadges()){const owned=profile.badges.includes(b.id);const card=el('div',`badge${owned?'':' locked'}`);card.append(el('span','',owned?b.icon:'🔒'),el('b','',b.name),el('p','',owned?'Получено! '+b.description:b.description));$('badges').append(card);}
}
function openArtifact(a,owned,m){const box=$('artifactDetail');box.replaceChildren();box.append(itemImage(a,owned),el('span','eyebrow',m.title),el('h2','',owned?a.name:worldId==='space'?'Здесь будет сокровище':isFootball()?'Здесь будет новая карточка!':'Здесь будет новый друг!'),el('p','',owned?a.story:`Выполняй это приключение: за удачную игру ты можешь открыть ${world.collectibleAcc}. Или реши «Деревья и палатки» или «Фигудоку» для этого набора. Чтобы собрать набор, получи карточки всеми тремя способами. Одним способом — не больше 60% набора. Подсказками пользоваться можно!`));$('artifactDialog').showModal();}
$('closeArtifact').onclick=()=>$('artifactDialog').close();
function startMission(id){const m=missions.find(m=>m.id===id);missionId=id;origin='home';start(makeProblems(m.count,'mixed',m.level),m.title,`Собираем набор «${m.title}». Реши ${Math.ceil(m.count*.8)} из ${m.count} примеров · + и − и получи ${world.collectibleAcc}. Подсказки разрешены! ${rewardMessage(rewardStatus(profile,id,'math',worldId))}`);}
function start(list,title,goal){
 track('game_start',{world:worldId,game:'math'});
 problems=list;records=[];index=streak=bestStreak=earned=0;active=true;$('playTitle').textContent=title;$('mathSetProgress').textContent=missionId?'Решай примеры и пополняй коллекцию':'Тренировка в своём темпе';$('goalText').textContent=goal;setCurrency($('sessionStars'),0);view('play');show();
}
function show(){
 const p=problems[index];attempts=0;hinted=false;checked=false;
 $('position').textContent=`Пример ${index+1} из ${problems.length}`;$('progress').style.width=`${index/problems.length*100}%`;
 $('numA').textContent=p.a;$('numB').textContent=p.b;$('operator').textContent=p.op;
 const a=$('answer');a.value='';a.readOnly=false;a.className='answer';a.removeAttribute('aria-invalid');
 $('feedback').textContent='';$('feedback').className='feedback';$('submit').textContent='Проверить ✓';$('hintBox').hidden=true;$('hint').disabled=false;$('skip').hidden=false;
 $('buddyText').textContent=['Не спеши. Ты справишься!','Прибавляй или вычитай по частям.','Если трудно — позови меня!'][index%3];
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
  feedback(first?`${['Ура! Всё верно!','Вот это да!','Отличный ответ!'][index%3]} +${amount(3,world)} 🎉`:`Получилось! +${amount(1,world)} за старание 💛`);
  $('submit').textContent=index===problems.length-1?'Забрать награды! 🎉':'Ещё пример →';$('skip').hidden=true;$('hint').disabled=true;$('streak').textContent=`🔥 ${streak} подряд`;setCurrency($('sessionStars'),earned);
  setSpeech($('buddyText'),streak>=5?`Пять подряд и больше! ${highFive()}`:'Я знал, что у тебя получится!');
 }else{attempts++;streak=0;$('streak').textContent='🔥 0 подряд';$('answer').className='answer wrong';$('answer').setAttribute('aria-invalid','true');feedback(`Почти! Попробуй ещё или позови на помощь 💡`,true);$('buddyText').textContent='Ошибки помогают учиться. Давай попробуем вместе!';$('answer').focus();$('answer').select();}
});
function setSpeech(target,text){
 target.textContent=text;
 if((worldId==='dog'||worldId==='cat')&&text.includes('Дай лапу!')){
  const paw=el('span','single-paw');paw.setAttribute('aria-hidden','true');
  paw.innerHTML='<svg viewBox="0 0 32 32" xmlns="http://www.w3.org/2000/svg"><g fill="currentColor"><ellipse cx="6" cy="12" rx="3.5" ry="5" transform="rotate(-25 6 12)"/><ellipse cx="12" cy="6.5" rx="3.5" ry="5" transform="rotate(-8 12 6.5)"/><ellipse cx="20" cy="6.5" rx="3.5" ry="5" transform="rotate(8 20 6.5)"/><ellipse cx="26" cy="12" rx="3.5" ry="5" transform="rotate(25 26 12)"/><path d="M7 24c0-4 5-10 9-10s9 6 9 10c0 5-5 6-9 4-4 2-9 1-9-4Z"/></g></svg>';
  target.append(paw);
 }
}
function highFive(){return worldId==='dog'||worldId==='cat'?'Дай лапу!':'Дай пять! 🖐';}
function feedback(text,bad=false){$('feedback').textContent=text;$('feedback').className='feedback'+(bad?' bad':'');}
$('hint').onclick=()=>{hinted=true;streak=0;$('streak').textContent='🔥 0 подряд';$('hintBox').textContent=hint(problems[index]);$('hintBox').hidden=false;$('buddyText').textContent='Посчитаем по частям — так проще!';};
$('skip').onclick=()=>{records.push({p:problems[index],first:false,attempts,hinted,skipped:true});streak=0;next();};
$('answer').oninput=()=>{if(!checked){$('answer').className='answer';$('answer').removeAttribute('aria-invalid');$('feedback').textContent='';}};
$('keypad').onclick=e=>{const b=e.target.closest('[data-key]');if(!b||checked)return;const a=$('answer'),k=b.dataset.key;if(k==='del')a.value=a.value.slice(0,-1);else if(k==='minus')a.value=a.value.startsWith('-')?a.value.slice(1):'-'+a.value;else if(a.value.length<4)a.value+=k;a.dispatchEvent(new Event('input'));};
function finish(){
 if(!active)return;active=false;
 track('game_complete',{world:worldId,game:'math',solved:records.filter(r=>!r.skipped).length});
 const result=settle(profile,records,missionId,bestStreak,worldId);profile=result.profile;save();
 lastMistakes=records.filter(r=>!r.first).map(r=>r.p);
 $('resultTitle').textContent=result.success?'Миссия выполнена!':result.solved===0?'Первый шаг сделан!':'Ты отлично потрудился!';
 $('resultText').textContent=result.success?(worldId==='space'?'Космос стал понятнее, а коллекция — богаче!':(world.successText||'В твоей команде появился новый хвостатый друг!')):missionId?`Для награды нужно решить хотя бы ${Math.ceil(problems.length*.8)} из ${problems.length} примеров. Попробуй ещё: ${world.buddy} поможет!`:`Каждый решённый пример делает тебя увереннее. ${highFive()}`;
 if(result.success&&!result.reward)$('resultText').textContent=`${rewardMessage(result.rewardStatus)} А ${world.currency} — награда за практику.`;
 setSpeech($('resultText'),$('resultText').textContent);
 $('resultStats').replaceChildren();for(const [v,t] of [[`+${result.stars}` ,world.unit[2]+' получено'],[`${result.solved}/${records.length}`,'решено примеров'],[records.filter(r=>r.first).length,'с первого раза']]){const d=el('div','result-stat');d.append(el('b','',v),el('span','',t));$('resultStats').append(d);}
 $('rewardBox').replaceChildren();$('rewardBox').hidden=!result.reward;if(result.reward){const a=result.reward;$('rewardBox').append(el('span','reward-label',world.rewardTitle||(worldId==='space'?'НОВЫЙ АРТЕФАКТ!':'НОВАЯ ПОРОДА В КОЛЛЕКЦИИ!')),itemImage(a,true),el('h2','',a.name),el('p','',a.story));}
 $('newBadges').textContent=result.badges.map(b=>{const themed=themedBadges().find(d=>d.id===b.id);return `${themed.icon} Новый значок: ${themed.name}!`;}).join(' · ');
 $('review').replaceChildren();for(const r of records){const row=el('div','review-row');row.append(el('span','',`${r.skipped?'↻':'✓'} ${r.p.a} ${r.p.op} ${r.p.b} = ${r.p.answer}`),el('small','',r.skipped?'Попробуй ещё':r.first?'С первого раза':r.hinted?'С подсказкой':'Справился!'));$('review').append(row);}
 $('retry').hidden=!lastMistakes.length;view('result');if(result.solved)celebrate();
}
function celebrate(){const box=$('confetti');box.replaceChildren();for(let i=0;i<26;i++){const c=el('i','confetto');c.style.setProperty('--x',`${Math.random()*100}%`);c.style.setProperty('--c',['#b99ae9','#ffce7e','#9cd5b9','#8cc9e7'][i%4]);c.style.setProperty('--delay',`${Math.random()*.4}s`);box.append(c);}setTimeout(()=>box.replaceChildren(),3000);}
$('retry').onclick=()=>{missionId=null;origin='home';start(lastMistakes.map(p=>({...p})),'Ещё одна попытка',`Повтори трудные примеры. За каждый ответ — ${world.currency}!`);};
$('startFree').onclick=()=>{missionId=null;origin='free';start(makeProblems(Number($('count').value),'mixed',$('level').value,$('negative').checked),'Просто играем!',`Считай в своём темпе и собирай ${world.currency}.`);};
$('goMission').onclick=()=>$('activityHub').scrollIntoView({behavior:'smooth',block:'start'});
$('nextMission').onclick=()=>view('home');
function requestView(id){pendingWorld=null;if(active){pendingView=id;$('leaveDialog').showModal();}else view(id);}
let pendingView='home';$('leave').onclick=()=>requestView(origin);$('stay').onclick=()=>{pendingWorld=null;$('leaveDialog').close();};$('confirmLeave').onclick=()=>{active=false;$('leaveDialog').close();if(pendingWorld){const id=pendingWorld;pendingWorld=null;switchWorld(id);}else view(pendingView);};
for(const b of document.querySelectorAll('[data-view]'))b.onclick=()=>requestView(b.dataset.view);
for(const a of document.querySelectorAll('a[href="#home"]'))a.onclick=e=>{e.preventDefault();requestView('home');};
$('print').onclick=()=>{
 const list=makeProblems(Number($('count').value),'mixed',$('level').value,$('negative').checked),sheet=$('printSheet');sheet.replaceChildren();
 sheet.append(el('h1','',`Считай легко · ${world.name}`),el('p','','Имя: __________________    Дата: ______________'));
 const grid=el('div','print-grid');list.forEach((p,i)=>grid.append(el('div','',`${i+1}. ${p.a} ${p.op} ${p.b} = ____`)));sheet.append(grid);
 const answers=el('div','answers');answers.append(el('h2','','Ответы для проверки'));const ag=el('div','print-grid');list.forEach((p,i)=>ag.append(el('div','',`${i+1}. ${p.answer}`)));answers.append(ag);sheet.append(answers);window.print();
};
applyWorld();updateProfile();view('home',{scroll:false});

function themedBadges(){return badgeDefs.map(b=>b.id==='first'?{...b,name:worldId==='space'?'Первый полёт':'Первое приключение'}:b.id==='collector'?{...b,name:worldId==='space'?'Хранитель сокровищ':'Вся команда в сборе!',description:worldId==='space'?'Собери все 36 артефактов':`Собери все ${artifacts.length} ${isFootball()?(worldId==='footballTeams'?'карточек команд':'карточек футболистов'):worldId==='dog'?'пород собак':'пород кошек'}`} : b);}
function itemImage(a,owned){const d=el('span','artifact-image'+(a.pet?' pet-image':''));if(owned&&a.pet)d.innerHTML=portrait(a);else d.textContent=owned?a.icon:'🔒';return d;}
function token(){const t=el('span',worldId==='cat'?'sausage-token':'currency-token',worldId==='cat'?'':world.rewardIcon);t.setAttribute('aria-hidden','true');return t;}
function setCurrency(target,n){target.replaceChildren(token(),el('span','',String(n)));}
function applyWorld(){
 document.body.dataset.world=isFootball()?'football':worldId;
 const avatar=$('levelAvatar');avatar.replaceChildren();
 const avatarNames={space:'Космонавт',dog:'Мальтипу Лорри',cat:'Котик',football:'Футболист'};
 avatar.setAttribute('aria-label',avatarNames[worldId==='footballTeams'?'football':worldId]);
 if(worldId==='space')avatar.textContent='🧑‍🚀';
 else if(isFootball())avatar.innerHTML='<svg viewBox="0 0 64 64" aria-hidden="true"><path d="M7 61V48Q9 36 24 36H40Q55 36 57 48V61Z" fill="#35966e"/><path d="M24 36L32 45L40 36" fill="#fff7df"/><circle cx="32" cy="22" r="16" fill="#edbd91"/><path d="M16 21Q12 3 30 3Q51 1 49 23L43 17L38 11Q28 20 16 21Z" fill="#5a4139"/><circle cx="26" cy="23" r="1.7" fill="#493b44"/><circle cx="38" cy="23" r="1.7" fill="#493b44"/><path d="M27 30Q32 34 37 30" stroke="#925b52" stroke-width="2" fill="none" stroke-linecap="round"/><circle cx="47" cy="51" r="11" fill="white" stroke="#31574b" stroke-width="1.5"/><path d="M47 45L52 49L50 55H44L42 49Z" fill="#31574b"/></svg>';
 else avatar.innerHTML=portrait(world.mascot||artifacts[0]);
 $('clubName').textContent=world.club;$('walletIcon').replaceChildren(token());$('walletUnit').textContent=world.unit[2];
 $('welcomeText').textContent=world.welcome;$('heroTitle').textContent=world.hero;$('heroIntro').textContent={space:'Решай примеры или головоломки с Бипом и собирай космические сокровища!',dog:'Решай примеры или головоломки с Лорри и собирай карточки пород собак!',cat:'Решай примеры или головоломки с Муркой и собирай карточки пород кошек!',football:'Решай примеры или головоломки и открывай карточки известных футболистов!',footballTeams:world.intro}[worldId];$('goMission').textContent='Выбрать занятие →';
 $('missionHeading').textContent=world.section;$('missionNote').textContent=world.missionNote||(worldId==='space'?`${artifacts.length} сокровищ ждут тебя!`:`${artifacts.length} хвостатых друзей ждут тебя!`);$('bannerTitle').textContent=world.banner;$('bannerText').textContent=world.bannerText;$('collectionTitle').textContent=world.collectionTitle;$('collectionNote').textContent=world.collectionNote;
 $('freeIntro').textContent=`Плюс и минус вперемешку. За ответы получай ${world.currency}!`;$('freeCollectionNote').textContent=`${world.collectionKind||(worldId==='space'?'Артефакты':'Породы')} можно открыть в приключениях.`;
 $('buddyName').textContent=`Я ${world.buddy}!`;$('hint').textContent=`💡 ${world.buddy}, помоги!`;$('spaceArt').hidden=worldId!=='space';$('petHero').hidden=worldId==='space';
 $('buddyFace').replaceChildren();$('petHero').replaceChildren();
 if(worldId==='space')$('buddyFace').textContent='🤖';else{
  const buddy=world.mascot||artifacts[0];$('buddyFace').innerHTML=portrait(buddy);
  const bubble=el('span','pet-bubble',world.heroBubble||(worldId==='dog'?'Я Лорри! Дай лапу!':'Мур! Дай лапу!'));setSpeech(bubble,bubble.textContent);const face=el('div','hero-pet-face');face.innerHTML=portrait(buddy);
  const fun=el('span','pet-fun-token');fun.append(token());$('petHero').append(bubble,face,fun,el('span','pet-paw',isFootball()?'🏆':'🐾'),el('span','pet-math','＋ −'));
 }
 $('leave').textContent='← Выбрать занятие';$('nextMission').textContent=`К ${world.place} →`;$('confirmLeave').textContent=`К ${world.place}`;$('celebration').replaceChildren(el('span','','🎉'),token(),el('span','','🎉'));
 for(const b of document.querySelectorAll('[data-world-choice]')){const selected=b.dataset.worldChoice===worldId||(b.dataset.worldChoice==='football'&&isFootball());b.setAttribute('aria-pressed',String(selected));b.classList.toggle('selected',selected);}
 document.title=`Считай легко · ${world.name}`;
}
function switchWorld(id){if(!worlds[id])return;if(active){pendingWorld=id;pendingView='home';$('leaveDialog').showModal();return;}worldId=id;footballMenuOpen=false;bindWorld();track('world_select',{world:worldId});try{localStorage.setItem('schitay-world-v1',id);}catch{storageOK=false;}applyWorld();updateProfile();view('home',{scroll:false});}
let pendingWorld=null;
function renderFootballMenu(){
 const parent=document.querySelector('[data-world-choice="football"]');
 $('footballMenu').hidden=!footballMenuOpen;parent.setAttribute('aria-expanded',String(footballMenuOpen));
 $('footballPlayerProgress').textContent=`${profiles.football.items.length} из 36 · твои достижения`;
 $('footballTeamProgress').textContent=`${profiles.footballTeams.items.length} из 36 · клубы со всего мира`;
 for(const b of document.querySelectorAll('[data-football-choice]'))b.setAttribute('aria-pressed',String(b.dataset.footballChoice===worldId));
}
for(const b of document.querySelectorAll('[data-world-choice]'))b.onclick=()=>{
 if(b.dataset.worldChoice==='football'){footballMenuOpen=!footballMenuOpen;renderFootballMenu();}
 else switchWorld(b.dataset.worldChoice);
};
for(const b of document.querySelectorAll('[data-football-choice]'))b.onclick=()=>switchWorld(b.dataset.footballChoice);
function closeFootballMenu(){if(footballMenuOpen){footballMenuOpen=false;renderFootballMenu();}}
document.addEventListener('click',e=>{
 if(footballMenuOpen&&!e.target.closest('[data-world-choice="football"]'))closeFootballMenu();
});
document.addEventListener('keydown',e=>{if(e.key==='Escape')closeFootballMenu();});

puzzleUI=mountTents($('tents'),{
 context:()=>({id:worldId,world,missions,profile,targetMission:goalMission()}),
 openActivities:()=>requestView('home'),
 reward:(id,set)=>{const result=settlePuzzle(profile,id,set,worldId);profile=result.profile;save();if(!result.already)celebrate();return {...result,image:result.reward?itemImage(result.reward,true):null};},
 openCollection:()=>requestView('collection')
});
figudokuUI=mountFigudoku($('figudoku'),{
 context:()=>({id:worldId,world,missions,profile,targetMission:goalMission()}),
 openActivities:()=>requestView('home'),
 reward:(id,set)=>{const result=settlePuzzle(profile,id,set,worldId);profile=result.profile;save();if(!result.already)celebrate();return {...result,image:result.reward?itemImage(result.reward,true):null};},
 openCollection:()=>requestView('collection')
});
if(location.hash==='#tents')view('home');

function goalMission(){
 return missions.find(m=>m.id===selectedSets[worldId])||missions.find(m=>artifacts.some(a=>a.mission===m.id&&!profile.items.includes(a.id)))||missions[0];
}
function renderActivity(){
 const m=goalMission();selectedSets[worldId]=m.id;try{localStorage.setItem(`schitay-goal-${worldId}-v1`,m.id);}catch{storageOK=false;}
 $('activitySet').replaceChildren(...missions.map(set=>new Option(set.title,set.id)));$('activitySet').value=m.id;
 $('activityDifficulty').textContent=`Сложность: ${difficulty(m)}`;
 const items=artifacts.filter(a=>a.mission===m.id),owned=items.filter(a=>profile.items.includes(a.id)).length;
 $('activityProgress').textContent=`Собрано: ${owned} из ${items.length}`;
 for(const mode of rewardModes){
  const status=rewardStatus(profile,m.id,mode,worldId),target=$(`${mode}ActivityGoal`);
  target.textContent=status.allowed?'Реши и получи карточку':'Только тренировка';
 }
 $('activityTitle').textContent=owned===items.length?'Набор собран! Продолжим играть?':'Как получим следующую карточку?';
}
$('activitySet').onchange=()=>{selectedSets[worldId]=$('activitySet').value;renderActivity();};
$('chooseMath').onclick=()=>startMission(goalMission().id);
$('chooseTents').onclick=()=>view('tents');

$('chooseFigudoku').onclick=()=>view('figudoku');




const mathTutorial=document.createElement('dialog');mathTutorial.className='forest-tutorial';mathTutorial.setAttribute('aria-label','Как решать примеры');mathTutorial.innerHTML='<button class="dialog-close" aria-label="Закрыть обучение">×</button><span class="eyebrow">СНАЧАЛА ПРАВИЛА</span><h2>Решаем примеры</h2><ol class="tutorial-rules-list"><li>Посчитай ответ и введи его кнопками под примером или с клавиатуры.</li><li>Нажми «Проверить». Если ответ неверный, можно попробовать ещё раз.</li><li>Если трудно, нажми кнопку с лампочкой: появится подсказка.</li><li>Для карточки реши верно хотя бы 80% примеров (например, 8 из 10). В режиме «Просто порешать» тренируйся в своём темпе.</li></ol><p class="muted small">Подсказками пользоваться можно! Доступность новой карточки зависит от выбранного набора и уже полученных наград.</p><button class="primary">Попробуем! →</button>';document.body.append(mathTutorial);$('mathLearn').onclick=()=>{mathTutorial.showModal();mathTutorial.scrollTop=0;};for(const b of mathTutorial.querySelectorAll('button'))b.onclick=()=>mathTutorial.close();

$('mathLearnWide').onclick=()=>$('mathLearn').click();
