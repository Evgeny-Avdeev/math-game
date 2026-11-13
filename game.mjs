import {getWorld} from './worlds.mjs?v=dogs-names-1';
import {activityDefinitions} from './activity-definitions.mjs?v=activity-rewards-1';

const policies = new Map();
const puzzleActivities = new Map();
for (const definition of Object.values(activityDefinitions)) {
 const {label = definition.title, puzzles = []} = definition.reward ?? {};
 policies.set(definition.id, {label, puzzles: new Set(puzzles.map(p => p.id))});
 for (const puzzle of puzzles) puzzleActivities.set(puzzle.id, definition.id);
}
export const rewardModes = [...policies.keys()];
export const rewardModeNames = Object.fromEntries([...policies].map(([id, {label}]) => [id, label]));
const validCompletionId = id => typeof id === 'string' && id.length > 0 && id.length <= 128;
export {missions,artifacts} from './space.mjs?v=8';
export const badgeDefs=[
 {id:'first',icon:'🏅',name:'Первый полёт',description:'Заверши первую миссию',test:p=>p.completed>=1},
 {id:'streak',icon:'🔥',name:'На одной волне',description:'Реши 5 подряд с первого раза без подсказок',test:p=>p.bestStreak>=5},
 {id:'fifty',icon:'🌟',name:'Знаток чисел',description:'Реши 50 примеров',test:p=>p.solved>=50},
 {id:'ten',icon:'🎯',name:'Разминка удалась',description:'Реши 10 примеров',test:p=>p.solved>=10},
 {id:'hundred',icon:'💯',name:'Сотня открытий',description:'Реши 100 примеров',test:p=>p.solved>=100},
 {id:'twofifty',icon:'🧠',name:'Математический супергерой',description:'Реши 250 примеров',test:p=>p.solved>=250},
 {id:'streakten',icon:'⚡',name:'Десятка без промаха',description:'Реши 10 подряд с первого раза без подсказок',test:p=>p.bestStreak>=10},
 {id:'fiveMissions',icon:'🎖️',name:'Пять приключений',description:'Успешно пройди 5 приключений',test:p=>p.completed>=5},
 {id:'twentyMissions',icon:'🏰',name:'Большое путешествие',description:'Успешно пройди 20 приключений',test:p=>p.completed>=20},
 {id:'ninecards',icon:'🎒',name:'Первая девятка',description:'Собери 9 наград в коллекции',test:p=>p.items.length>=9},
 {id:'eighteencards',icon:'💝',name:'Половина сокровищницы',description:'Собери 18 наград в коллекции',test:p=>p.items.length>=18},
 {id:'collector',icon:'🏆',name:'Хранитель сокровищ',description:'Собери все артефакты',test:p=>p.items.length===36}
];
// Puzzle selection shares the existing completion history of every card world.
export function solvedPuzzlesAcrossWorlds(profiles){
 return [...new Set(Object.values(profiles).flatMap(p=>p?.puzzles||[]))];
}
// Keep each collection's earned currency in its existing profile. Display the sum
// for related collections, so old saves need no migration or duplicated balance.
export function currencyBalance(profiles,worldId){
 const group={dog:['dog','dogMore'],dogMore:['dog','dogMore'],football:['football','footballTeams'],footballTeams:['football','footballTeams']}[worldId]||[worldId];
 return group.reduce((sum,id)=>sum+(profiles[id]?.stars||0),0);
}
export const emptyProfile=()=>({stars:0,solved:0,completed:0,bestStreak:0,items:[],badges:[],puzzles:[],itemSources:{},activityCompletions:{}});
export function cleanProfile(raw,worldId='space'){
 const {artifacts}=getWorld(worldId);
 const p=emptyProfile();
 if(!raw||typeof raw!=='object')return p;
 for(const k of ['stars','solved','completed','bestStreak'])if(Number.isSafeInteger(raw[k])&&raw[k]>=0)p[k]=raw[k];
 p.puzzles=[...new Set(Array.isArray(raw.puzzles)?raw.puzzles:[])].filter(id=>puzzleActivities.has(id));
 for(const [id,policy] of policies){
  const completed=raw.activityCompletions?.[id];
  if(!policy.puzzles.size&&Array.isArray(completed))p.activityCompletions[id]=[...new Set(completed.filter(validCompletionId))];
 }
 p.items=[...new Set(Array.isArray(raw.items)?raw.items:[])].filter(id=>artifacts.some(a=>a.id===id));
 for(const id of p.items)if(policies.has(raw.itemSources?.[id]))p.itemSources[id]=raw.itemSources[id];
 p.badges=[...new Set(Array.isArray(raw.badges)?raw.badges:[])].filter(id=>badgeDefs.some(a=>a.id===id));
 // Credit existing progress when new achievements become available.
 for(const b of badgeDefs)if(!p.badges.includes(b.id)&&(b.id==='collector'?p.items.length===artifacts.length:b.test(p)))p.badges.push(b.id);
 return p;
}
export function rewardStatus(profile,missionId,mode,worldId='space'){
 const p=cleanProfile(profile,worldId),items=getWorld(worldId).artifacts.filter(a=>a.mission===missionId);
 const owned=items.filter(a=>p.items.includes(a.id));
 const counts=Object.fromEntries(rewardModes.map(m=>[m,owned.filter(a=>p.itemSources[a.id]===m).length]));
 const limit=Math.floor(items.length*.6),remaining=items.length-owned.length;
 const missing=rewardModes.filter(m=>counts[m]===0),legacy=owned.filter(a=>!p.itemSources[a.id]).length;
 if(!policies.has(mode))throw new Error('Unknown activity');
 let reason=remaining===0?'complete':counts[mode]>=limit?'limit':null;
 // Old cards keep their value: only newly earned cards require source tracking.
 const needed=Math.min(items.length,rewardModes.length)-(rewardModes.length-missing.length)-legacy;
 if(!reason&&counts[mode]>0&&remaining<=needed)reason='reserved';
 return {counts,limit,remaining,missing,reason,allowed:!reason};
}
export function collectionRewardRules(size){
 const variety = Math.min(size, rewardModes.length);
 return `Получи карточки в ${variety} разных занятиях. За каждое занятие можно заработать не больше 60% набора.`;
}
export function rewardMessage(status){
 if(status.reason==='complete')return 'Набор уже собран. Продолжай играть ради тренировки и наград!';
 if(status.reason==='limit')return `Этим способом уже получено ${status.limit} карточек — это максимум для набора. За следующей выбери другое занятие.`;
 if(status.reason==='reserved')return `За следующей карточкой выбери занятие, за которое ещё не получал карточек: ${status.missing.map(m=>rewardModeNames[m]).join(', ')}.`;
 return '';
}
function awardCard(p,missionId,mode,worldId){
 const status=rewardStatus(p,missionId,mode,worldId);
 const reward=status.allowed?getWorld(worldId).artifacts.find(a=>a.mission===missionId&&!p.items.includes(a.id))||null:null;
 if(reward){p.items.push(reward.id);p.itemSources[reward.id]=mode;}
 return {reward,rewardStatus:status};
}
export const answerReward = ({first,skipped}) => skipped?0:first?3:1;

export function settle(profile,records,missionId,bestStreak,worldId='space',
 {activityId='math',completionId,count}={}){
 const {missions,artifacts}=getWorld(worldId);
 const p=cleanProfile(profile,worldId);const solved=records.filter(r=>!r.skipped).length;
 const completions=completionId?(p.activityCompletions[activityId]??=[]):null;
 if(completions?.includes(completionId))return {profile:p,stars:0,solved,reward:null,badges:[],success:false,already:true};
 completions?.push(completionId);
 const earned=records.reduce((n,r)=>n+answerReward(r),0);
 p.solved+=solved;p.bestStreak=Math.max(p.bestStreak,bestStreak);
 const mission=missions.find(m=>m.id===missionId);
 const success=!!mission&&records.length===(count??mission.count)&&solved>=Math.ceil(records.length*.8);
 let reward=null,rewardStatus=null;
 if(success){p.completed++;({reward,rewardStatus}=awardCard(p,missionId,activityId,worldId));}
 const stars=earned+(success?10:0);p.stars+=stars;
 const badges=badgeDefs.filter(b=>!p.badges.includes(b.id)&&(b.id==='collector'?p.items.length===artifacts.length:b.test(p)));p.badges.push(...badges.map(b=>b.id));
 return {profile:p,stars,solved,reward,rewardStatus,badges,success};
}

export function settleActivity(profile,activityId,completionId,missionId,worldId='space',{solved=0}={}){
 const policy=policies.get(activityId),{missions,artifacts}=getWorld(worldId);
 if(!policy||!validCompletionId(completionId)||!missions.some(m=>m.id===missionId)
    ||(policy.puzzles.size&&!policy.puzzles.has(completionId)))throw new Error('Unknown activity, task or collection');
 const p=cleanProfile(profile,worldId);
 const completions=policy.puzzles.size?p.puzzles:(p.activityCompletions[activityId]??=[]);
 if(completions.includes(completionId))return {profile:p,already:true,reward:null};
 completions.push(completionId);p.stars+=10;p.completed++;p.solved+=solved;
 const {reward,rewardStatus}=awardCard(p,missionId,activityId,worldId);
 for(const b of badgeDefs)if(!p.badges.includes(b.id)&&(b.id==='collector'?p.items.length===artifacts.length:b.test(p)))p.badges.push(b.id);
 return {profile:p,already:false,reward,rewardStatus};
}

export function settlePuzzle(profile,puzzleId,missionId,worldId='space'){
 const activity=puzzleActivities.get(puzzleId);
 if(!activity||!getWorld(worldId).missions.some(m=>m.id===missionId))throw new Error('Unknown puzzle or collection');
 return settleActivity(profile,activity,puzzleId,missionId,worldId);
}
