import {createActivityRegistry} from './activity-registry.mjs?v=1';
import {activityDefinitions} from './activity-definitions.mjs?v=activity-rewards-1';
const analyticsModule=import('./analytics.mjs?v=1').catch(()=>null);
function track(event,data){void analyticsModule.then(m=>m?.track(event,data)).catch(()=>{});}
import {mountFigudoku} from './figudoku-ui.mjs?v=activity-rewards-1';
import {mountTents} from './tents-ui.mjs?v=activity-rewards-1';
import {mountArithmetic} from './arithmetic.mjs?v=2';
import {makeProblems} from './math.mjs?v=15';
import {badgeDefs,currencyBalance,solvedPuzzlesAcrossWorlds,cleanProfile,settle,settleActivity,rewardStatus,rewardMessage,collectionRewardRules} from './game.mjs?v=arithmetic-template-1';
import {worlds,getWorld} from './worlds.mjs?v=dogs-names-1';
import {portrait} from './portraits.mjs?v=teams-repair2-20261107';
const $=id=>document.getElementById(id);
let worldId='space',world,missions,artifacts,profile,storageOK=true;
const activities=createActivityRegistry();
const activityChoices = new Map();
const selectedSets={};
const profiles={};
let footballMenuOpen=false,dogMenuOpen=false;
const isDog=()=>worldId==='dog'||worldId==='dogMore';
const isFootball=()=>worldId==='football'||worldId==='footballTeams';
try{const selected=localStorage.getItem('schitay-world-v1');if(worlds[selected])worldId=selected;}catch{storageOK=false;}
for(const id of Object.keys(worlds)){try{profiles[id]=cleanProfile(JSON.parse(localStorage.getItem(`schitay-${id}-v1`)||'null'),id);}catch{profiles[id]=cleanProfile(null,id);storageOK=false;}}
function bindWorld(){world=getWorld(worldId);missions=world.missions.map((m,i)=>({...m,level:i===0?'easy':i===3?'carry':'all'}));artifacts=world.artifacts;profile=profiles[worldId];if(!selectedSets[worldId])try{selectedSets[worldId]=localStorage.getItem(`schitay-goal-${worldId}-v1`);}catch{storageOK=false;}}
bindWorld();
track('page_view',{world:worldId});
function save(){profiles[worldId]=profile;try{localStorage.setItem(`schitay-${worldId}-v1`,JSON.stringify(profile));}catch{storageOK=false;}updateProfile();}
function el(tag,cls,text){const e=document.createElement(tag);if(cls)e.className=cls;if(text!==undefined)e.textContent=text;return e;}
function theme(e,m){e.style.setProperty('--accent',m.accent);e.style.setProperty('--tint',m.tint);}
function view(id,options={}){activities.enter(id);for(const e of document.querySelectorAll('.view'))e.hidden=e.id!==id;for(const b of document.querySelectorAll('nav [data-view]')){b.classList.toggle('active',b.dataset.view===((activities.has(id)||id==='result')?'home':id));b.setAttribute('aria-current',b.dataset.view===((activities.has(id)||id==='result')?'home':id)?'page':'false');}scrollToView(id,options);activities.showTutorialIfFirst(id);}
// Wait until the newly selected view and its dynamic content have been laid out.
let navigationFrame=0;
function scrollToView(id,{scroll=true}={}){
 cancelAnimationFrame(navigationFrame);
 if(!scroll){window.scrollTo({top:0,behavior:'instant'});return;}
 if(!matchMedia('(max-width:600px)').matches){window.scrollTo({top:0,behavior:'instant'});return;}
 navigationFrame=requestAnimationFrame(()=>{
  const selectors={home:'#activityHub',collection:'#collection .section-head',free:'#free .section-head',result:'#result .result-card'};
  const target=document.querySelector(activities.scrollSelector(id)||selectors[id]||'#'+id);
  if(!target||target.closest('[hidden]'))return;
  const top=Math.max(0,target.getBoundingClientRect().top+window.scrollY-12);
  window.scrollTo({top,behavior:matchMedia('(prefers-reduced-motion:reduce)').matches?'instant':'smooth'});
 });
}
document.addEventListener('click',e=>{const next=e.target.closest('[data-activity-next]');if(next){const root=next.closest('.view[data-activity]');if(root)scrollToView(root.id);}});
function updateProfile(){
 const balance=currencyBalance(profiles,worldId);
 $('wallet').textContent=balance;$('collectionCount').textContent=`${profile.items.length}/${artifacts.length}`;$('collectionTotal').textContent=`${profile.items.length} / ${artifacts.length}`;
 const level=Math.floor(balance/50)+1;
 $('rank').textContent=world.rank[level<3?0:level<6?1:level<10?2:3];
 $('levelInfo').textContent=`Уровень ${level} · ${balance%50} из 50 ${world.unit[2]} до следующего`;$('levelProgress').style.width=`${balance%50*2}%`;
 $('totalSolved').textContent=profile.solved;$('totalMissions').textContent=profile.completed;
 $('storageNote').textContent=storageOK?'Коллекция сохраняется в этом браузере на этом устройстве.':'Браузер не разрешил сохранение. Коллекция доступна, пока открыта эта страница.';
 renderMissions();renderCollection();renderActivity();renderFootballMenu();renderDogMenu();
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
function openArtifact(a,owned,m){const box=$('artifactDetail');box.replaceChildren();box.append(itemImage(a,owned),el('span','eyebrow',m.title),el('h2','',owned?a.name:worldId==='space'?'Здесь будет сокровище':isFootball()?'Здесь будет новая карточка!':'Здесь будет новый друг!'),el('p','',owned?a.story:`Выполняй это приключение: за удачную игру ты можешь открыть ${world.collectibleAcc}. Выбери занятие для этого набора. ${collectionRewardRules(artifacts.filter(item=>item.mission===m.id).length)} Подсказками пользоваться можно!`));$('artifactDialog').showModal();}
$('closeArtifact').onclick=()=>$('artifactDialog').close();
function setSpeech(target,text){
 target.textContent=text;
 if((isDog()||worldId==='cat')&&text.includes('Дай лапу!')){
  const paw=el('span','single-paw');paw.setAttribute('aria-hidden','true');
  paw.innerHTML='<svg viewBox="0 0 32 32" xmlns="http://www.w3.org/2000/svg"><g fill="currentColor"><ellipse cx="6" cy="12" rx="3.5" ry="5" transform="rotate(-25 6 12)"/><ellipse cx="12" cy="6.5" rx="3.5" ry="5" transform="rotate(-8 12 6.5)"/><ellipse cx="20" cy="6.5" rx="3.5" ry="5" transform="rotate(8 20 6.5)"/><ellipse cx="26" cy="12" rx="3.5" ry="5" transform="rotate(25 26 12)"/><path d="M7 24c0-4 5-10 9-10s9 6 9 10c0 5-5 6-9 4-4 2-9 1-9-4Z"/></g></svg>';
  target.append(paw);
 }
}
function celebrate(){const box=$('confetti');box.replaceChildren();for(let i=0;i<26;i++){const c=el('i','confetto');c.style.setProperty('--x',`${Math.random()*100}%`);c.style.setProperty('--c',['#b99ae9','#ffce7e','#9cd5b9','#8cc9e7'][i%4]);c.style.setProperty('--delay',`${Math.random()*.4}s`);box.append(c);}setTimeout(()=>box.replaceChildren(),3000);}
$('goMission').onclick=()=>$('activityHub').scrollIntoView({behavior:'smooth',block:'start'});
function requestView(id){pendingWorld=null;if(arithmetic.active){arithmetic.persist();pendingView=id;$('leaveDialog').showModal();}else view(id);}
let pendingView='home';$('leave').onclick=()=>requestView(arithmetic.origin);$('stay').onclick=()=>{pendingWorld=null;$('leaveDialog').close();};$('confirmLeave').onclick=()=>{arithmetic.leave();$('leaveDialog').close();if(pendingWorld){const id=pendingWorld;pendingWorld=null;switchWorld(id);}else view(pendingView);};
for(const b of document.querySelectorAll('[data-view]'))b.onclick=()=>requestView(b.dataset.view);
for(const a of document.querySelectorAll('a[href="#home"]'))a.onclick=e=>{e.preventDefault();requestView('home');};
$('print').onclick=()=>{
 const list=makeProblems(Number($('count').value),'mixed',$('level').value,$('negative').checked),sheet=$('printSheet');sheet.replaceChildren();
 sheet.append(el('h1','',`Считай легко · ${world.name}`),el('p','','Имя: __________________    Дата: ______________'));
 const grid=el('div','print-grid');list.forEach((p,i)=>grid.append(el('div','',`${i+1}. ${p.a} ${p.op} ${p.b} = ____`)));sheet.append(grid);
 const answers=el('div','answers');answers.append(el('h2','','Ответы для проверки'));const ag=el('div','print-grid');list.forEach((p,i)=>ag.append(el('div','',`${i+1}. ${p.answer}`)));answers.append(ag);sheet.append(answers);window.print();
};
function themedBadges(){return badgeDefs.map(b=>b.id==='first'?{...b,name:worldId==='space'?'Первый полёт':'Первое приключение'}:b.id==='collector'?{...b,name:worldId==='space'?'Хранитель сокровищ':'Вся команда в сборе!',description:worldId==='space'?'Собери все 36 артефактов':`Собери все ${artifacts.length} ${isFootball()?(worldId==='footballTeams'?'карточек команд':'карточек футболистов'):isDog()?'пород собак':'пород кошек'}`} : b);}
function itemImage(a,owned){const d=el('span','artifact-image'+(a.pet?' pet-image':''));if(owned&&a.pet)d.innerHTML=portrait(a);else d.textContent=owned?a.icon:'🔒';return d;}
function token(){const t=el('span',worldId==='cat'?'sausage-token':'currency-token',worldId==='cat'?'':world.rewardIcon);t.setAttribute('aria-hidden','true');return t;}
function setCurrency(target,n){target.replaceChildren(token(),el('span','',String(n)));}
function applyWorld(){
 document.body.dataset.world=isFootball()?'football':isDog()?'dog':worldId;
 const avatar=$('levelAvatar');avatar.replaceChildren();
 const avatarNames={space:'Космонавт',dog:'Мальтипу Лорри',cat:'Котик',football:'Футболист'};
 avatar.setAttribute('aria-label',avatarNames[isDog()?'dog':isFootball()?'football':worldId]);
 if(worldId==='space')avatar.textContent='🧑‍🚀';
 else if(isFootball())avatar.innerHTML='<svg viewBox="0 0 64 64" aria-hidden="true"><path d="M7 61V48Q9 36 24 36H40Q55 36 57 48V61Z" fill="#35966e"/><path d="M24 36L32 45L40 36" fill="#fff7df"/><circle cx="32" cy="22" r="16" fill="#edbd91"/><path d="M16 21Q12 3 30 3Q51 1 49 23L43 17L38 11Q28 20 16 21Z" fill="#5a4139"/><circle cx="26" cy="23" r="1.7" fill="#493b44"/><circle cx="38" cy="23" r="1.7" fill="#493b44"/><path d="M27 30Q32 34 37 30" stroke="#925b52" stroke-width="2" fill="none" stroke-linecap="round"/><circle cx="47" cy="51" r="11" fill="white" stroke="#31574b" stroke-width="1.5"/><path d="M47 45L52 49L50 55H44L42 49Z" fill="#31574b"/></svg>';
 else avatar.innerHTML=portrait(world.mascot||artifacts[0]);
 $('clubName').textContent=world.club;$('walletIcon').replaceChildren(token());$('walletUnit').textContent=world.unit[2];
 $('welcomeText').textContent=world.welcome;$('heroTitle').textContent=world.hero;$('heroIntro').textContent={space:'Решай примеры или головоломки с Бипом и собирай космические сокровища!',dog:'Решай примеры или головоломки с Лорри и собирай карточки пород собак!',cat:'Решай примеры или головоломки с Муркой и собирай карточки пород кошек!',football:'Решай примеры или головоломки и открывай карточки известных футболистов!',footballTeams:world.intro,dogMore:world.intro}[worldId];$('goMission').textContent='Выбрать занятие →';
 $('missionHeading').textContent=world.section;$('missionNote').textContent=world.missionNote||(worldId==='space'?`${artifacts.length} сокровищ ждут тебя!`:`${artifacts.length} хвостатых друзей ждут тебя!`);$('bannerTitle').textContent=world.banner;$('bannerText').textContent=world.bannerText;$('collectionTitle').textContent=world.collectionTitle;$('collectionNote').textContent=world.collectionNote;
 $('freeIntro').textContent=`Плюс и минус вперемешку. За ответы получай ${world.currency}!`;$('freeCollectionNote').textContent=`${world.collectionKind||(worldId==='space'?'Артефакты':'Породы')} можно открыть в приключениях.`;
 $('buddyName').textContent=`Я ${world.buddy}!`;$('hint').textContent=`💡 ${world.buddy}, помоги!`;$('spaceArt').hidden=worldId!=='space';$('petHero').hidden=worldId==='space';
 $('buddyFace').replaceChildren();$('petHero').replaceChildren();
 if(worldId==='space')$('buddyFace').textContent='🤖';else{
  const buddy=world.mascot||artifacts[0];$('buddyFace').innerHTML=portrait(buddy);
  const bubble=el('span','pet-bubble',world.heroBubble||(isDog()?'Я Лорри! Дай лапу!':'Мур! Дай лапу!'));setSpeech(bubble,bubble.textContent);const face=el('div','hero-pet-face');face.innerHTML=portrait(buddy);
  const fun=el('span','pet-fun-token');fun.append(token());$('petHero').append(bubble,face,fun,el('span','pet-paw',isFootball()?'🏆':'🐾'),el('span','pet-math','＋ −'));
 }
 $('leave').textContent='← Выбрать занятие';$('nextMission').textContent=`К ${world.place} →`;$('confirmLeave').textContent=`К ${world.place}`;$('celebration').replaceChildren(el('span','','🎉'),token(),el('span','','🎉'));
 for(const b of document.querySelectorAll('[data-world-choice]')){const selected=b.dataset.worldChoice===worldId||(b.dataset.worldChoice==='football'&&isFootball())||(b.dataset.worldChoice==='dog'&&isDog());b.setAttribute('aria-pressed',String(selected));b.classList.toggle('selected',selected);}
 document.title=`Считай легко · ${world.name}`;
}
function switchWorld(id){if(!worlds[id])return;if(arithmetic.active){arithmetic.persist();pendingWorld=id;pendingView='home';$('leaveDialog').showModal();return;}worldId=id;footballMenuOpen=false;dogMenuOpen=false;bindWorld();track('world_select',{world:worldId});try{localStorage.setItem('schitay-world-v1',id);}catch{storageOK=false;}applyWorld();updateProfile();view('home',{scroll:false});}
let pendingWorld=null;
function renderFootballMenu(){
 const parent=document.querySelector('[data-world-choice="football"]');
 $('footballMenu').hidden=!footballMenuOpen;parent.setAttribute('aria-expanded',String(footballMenuOpen));
 $('footballPlayerProgress').textContent=`${profiles.football.items.length} из 36 · известные футболисты`;
 $('footballTeamProgress').textContent=`${profiles.footballTeams.items.length} из 36 · клубы со всего мира`;
 for(const b of document.querySelectorAll('[data-football-choice]'))b.setAttribute('aria-pressed',String(b.dataset.footballChoice===worldId));
}
function renderDogMenu(){
 const parent=document.querySelector('[data-world-choice="dog"]');
 $('dogMenu').hidden=!dogMenuOpen;parent.setAttribute('aria-expanded',String(dogMenuOpen));
 $('dogFirstProgress').textContent=`${profiles.dog.items.length} из ${worlds.dog.artifacts.length} · породы собак`;
 $('dogSecondProgress').textContent=`${profiles.dogMore.items.length} из ${worlds.dogMore.artifacts.length} · новые породы`;
 for(const b of document.querySelectorAll('[data-dog-choice]'))b.setAttribute('aria-pressed',String(b.dataset.dogChoice===worldId));
}
for(const b of document.querySelectorAll('[data-world-choice]'))b.onclick=()=>{
 if(b.dataset.worldChoice==='football'){footballMenuOpen=!footballMenuOpen;dogMenuOpen=false;renderFootballMenu();renderDogMenu();}
 else if(b.dataset.worldChoice==='dog'){dogMenuOpen=!dogMenuOpen;footballMenuOpen=false;renderDogMenu();renderFootballMenu();}
 else switchWorld(b.dataset.worldChoice);
};
for(const b of document.querySelectorAll('[data-football-choice]'))b.onclick=()=>switchWorld(b.dataset.footballChoice);
for(const b of document.querySelectorAll('[data-dog-choice]'))b.onclick=()=>switchWorld(b.dataset.dogChoice);
function closeCollectionMenus(){footballMenuOpen=false;dogMenuOpen=false;renderFootballMenu();renderDogMenu();}
document.addEventListener('click',e=>{
 if((footballMenuOpen&&!e.target.closest('[data-world-choice="football"]'))||(dogMenuOpen&&!e.target.closest('[data-world-choice="dog"]')))closeCollectionMenus();
});
document.addEventListener('keydown',e=>{if(e.key==='Escape')closeCollectionMenus();});

function activityContext(definition){
 const solvedPuzzles = definition.reward?.puzzles
  ? solvedPuzzlesAcrossWorlds(profiles)
  : [...new Set(Object.values(profiles).flatMap(p => p.activityCompletions[definition.id] ?? []))];
 return {id:worldId,world,missions,profile,solvedPuzzles,targetMission:goalMission()};
}

function registerActivity(definition, mount, {viewId = definition.id, choiceId, open, sharedView=false} = {}){
 const reward = (id, set, details) => {
  const result = settleActivity(profile, definition.id, id, set, worldId, details);
  const badges=badgeDefs.filter(badge=>!profile.badges.includes(badge.id)&&result.profile.badges.includes(badge.id));
  profile = result.profile;
  if (!result.already) {
   save();
   celebrate();
  }
  const message = result.already ? 'За это задание награда уже получена.'
   : result.reward ? `Новая карточка: ${result.reward.name}`
   : rewardMessage(result.rewardStatus);
  return {...result, badges, message, image: result.reward ? itemImage(result.reward, true) : null};
 };
 let root = $(viewId);
 if (!root) {
  root = el('section','view');
  root.id = viewId;
  root.hidden = true;
  const main = document.querySelector('main');
  main.insertBefore(root, main.querySelector(':scope > footer'));
 }
 const controller = mount(root, {
  definition,
  context: () => activityContext(definition),
  openActivities: () => requestView('home'),
  openCollection: () => requestView('collection'),
  reward,
  complete: reward,
 });
 if(!sharedView)activities.register(viewId, controller);
 let choice = choiceId ? $(choiceId) : null;
 let goal;
 if (choice) goal = choice.querySelector('small');
 else {
  choice = el('button','activity-choice');
  choice.type = 'button';
  const symbol = el('span','activity-symbol',definition.symbol ?? '✦');
  const text = el('span');
  const arrow = el('span','','→');
  for (const decoration of [symbol,arrow]) decoration.setAttribute('aria-hidden','true');
  goal = el('small');
  text.append(el('b','',definition.title),goal);
  choice.append(symbol,text,arrow);
  document.querySelector('.activity-choices').append(choice);
 }
 activityChoices.set(definition.id, goal);
 choice.onclick = open ?? (() => requestView(viewId));
}

const arithmetic=mountArithmetic($('play'),{
 $, context:()=>({worldId,world,missions,profile}), view, track, el, setSpeech, setCurrency,
 itemImage, themedBadges, celebrate, goalMission,
 onStorageError:()=>{storageOK=false;},
 completeLegacy(id,missionId,solved){
  const result=settleActivity(profile,'multiplication',id,missionId,worldId,{solved});
  if(!result.already){profile=result.profile;save();}
 },
 complete({records,missionId,bestStreak,activityId,completionId,count}){
  const result=settle(profile,records,missionId,bestStreak,worldId,{activityId,completionId,count});
  if(!result.already){profile=result.profile;save();}
  return result;
 },
});
registerActivity(activityDefinitions.math,()=>arithmetic,
 {viewId:'play',choiceId:'chooseMath',open:()=>arithmetic.startMission(goalMission())});
registerActivity(activityDefinitions.multiplication,()=>arithmetic,
 {viewId:'play',sharedView:true,choiceId:'chooseMultiplication',open:()=>arithmetic.openMultiplication(false)});
registerActivity(activityDefinitions.tents, mountTents, {choiceId:'chooseTents'});
registerActivity(activityDefinitions.figudoku, mountFigudoku, {choiceId:'chooseFigudoku'});
for (const definition of Object.values(activityDefinitions)) {
 if (definition.mount) registerActivity(definition, definition.mount);
}

function goalMission(){
 return missions.find(m=>m.id===selectedSets[worldId])||missions.find(m=>artifacts.some(a=>a.mission===m.id&&!profile.items.includes(a.id)))||missions[0];
}
function renderActivity(){
 const m=goalMission();selectedSets[worldId]=m.id;try{localStorage.setItem(`schitay-goal-${worldId}-v1`,m.id);}catch{storageOK=false;}
 $('activitySet').replaceChildren(...missions.map(set=>new Option(set.title,set.id)));$('activitySet').value=m.id;
 $('activityDifficulty').textContent=`Сложность: ${difficulty(m)}`;
 const items=artifacts.filter(a=>a.mission===m.id),owned=items.filter(a=>profile.items.includes(a.id)).length;
 $('activityProgress').textContent=`Собрано: ${owned} из ${items.length}`;
 $('activityRewardRules').textContent=collectionRewardRules(items.length);
 for(const [id,target] of activityChoices){
  const status=rewardStatus(profile,m.id,id,worldId);
  target.textContent=status.allowed?'Реши и получи карточку':'Только тренировка';
 }
 $('activityTitle').textContent=owned===items.length?'Набор собран! Продолжим играть?':'Как получим следующую карточку?';
}
$('activitySet').onchange=()=>{selectedSets[worldId]=$('activitySet').value;renderActivity();};
applyWorld();updateProfile();view('home',{scroll:false});
