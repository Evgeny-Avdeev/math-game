import {getWorld} from './worlds.mjs?v=dogs-names-1';
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
export const emptyProfile=()=>({stars:0,solved:0,completed:0,bestStreak:0,items:[],badges:[],puzzles:[],itemSources:{}});
export function cleanProfile(raw,worldId='space'){
 const {artifacts}=getWorld(worldId);
 const p=emptyProfile();
 if(!raw||typeof raw!=='object')return p;
 for(const k of ['stars','solved','completed','bestStreak'])if(Number.isSafeInteger(raw[k])&&raw[k]>=0)p[k]=raw[k];
 p.puzzles=[...new Set(Array.isArray(raw.puzzles)?raw.puzzles:[])].filter(id=>typeof id==='string'&&/^(?:forest-(?:5|6|8)|figudoku-(?:easy|medium|hard))-([1-9]|1[0-9]|2[0-4])$/.test(id));
 p.items=[...new Set(Array.isArray(raw.items)?raw.items:[])].filter(id=>artifacts.some(a=>a.id===id));
 for(const id of p.items)if(['math','tents','figudoku'].includes(raw.itemSources?.[id]))p.itemSources[id]=raw.itemSources[id];
 p.badges=[...new Set(Array.isArray(raw.badges)?raw.badges:[])].filter(id=>badgeDefs.some(a=>a.id===id));
 // Credit existing progress when new achievements become available.
 for(const b of badgeDefs)if(!p.badges.includes(b.id)&&(b.id==='collector'?p.items.length===artifacts.length:b.test(p)))p.badges.push(b.id);
 return p;
}
export const rewardModes=['math','tents','figudoku'];
export const rewardModeNames={math:'Примеры',tents:'Деревья и палатки',figudoku:'Фигудоку'};
export function rewardStatus(profile,missionId,mode,worldId='space'){
 const p=cleanProfile(profile,worldId),items=getWorld(worldId).artifacts.filter(a=>a.mission===missionId);
 const owned=items.filter(a=>p.items.includes(a.id));
 const counts=Object.fromEntries(rewardModes.map(m=>[m,owned.filter(a=>p.itemSources[a.id]===m).length]));
 const limit=Math.floor(items.length*.6),remaining=items.length-owned.length;
 const missing=rewardModes.filter(m=>counts[m]===0),legacy=owned.filter(a=>!p.itemSources[a.id]).length;
 let reason=remaining===0?'complete':counts[mode]>=limit?'limit':null;
 // Old cards keep their value: only newly earned cards require source tracking.
 if(!reason&&counts[mode]>0&&remaining<=Math.max(0,missing.length-legacy))reason='reserved';
 return {counts,limit,remaining,missing,reason,allowed:!reason};
}
export function rewardMessage(status){
 if(status.reason==='complete')return 'Набор уже собран. Продолжай играть ради тренировки и наград!';
 if(status.reason==='limit')return `Этим способом уже получено ${status.limit} карточек — это максимум для набора. За следующей выбери другое занятие.`;
 if(status.reason==='reserved')return `Оставшиеся карточки ждут новых способов: ${status.missing.map(m=>rewardModeNames[m]).join(', ')}. Получи хотя бы одну карточку каждым способом.`;
 return '';
}
function awardCard(p,missionId,mode,worldId){
 const status=rewardStatus(p,missionId,mode,worldId);
 const reward=status.allowed?getWorld(worldId).artifacts.find(a=>a.mission===missionId&&!p.items.includes(a.id))||null:null;
 if(reward){p.items.push(reward.id);p.itemSources[reward.id]=mode;}
 return {reward,rewardStatus:status};
}
export function settle(profile,records,missionId,bestStreak,worldId='space'){
 const {missions,artifacts}=getWorld(worldId);
 const p=cleanProfile(profile,worldId);const solved=records.filter(r=>!r.skipped).length;
 const earned=records.reduce((n,r)=>n+(r.skipped?0:r.first?3:1),0);
 p.solved+=solved;p.bestStreak=Math.max(p.bestStreak,bestStreak);
 const mission=missions.find(m=>m.id===missionId);
 const success=!!mission&&records.length===mission.count&&solved>=Math.ceil(mission.count*.8);
 let reward=null,rewardStatus=null;
 if(success){p.completed++;({reward,rewardStatus}=awardCard(p,missionId,'math',worldId));}
 const stars=earned+(success?10:0);p.stars+=stars;
 const badges=badgeDefs.filter(b=>!p.badges.includes(b.id)&&(b.id==='collector'?p.items.length===artifacts.length:b.test(p)));p.badges.push(...badges.map(b=>b.id));
 return {profile:p,stars,solved,reward,rewardStatus,badges,success};
}

export function settlePuzzle(profile,puzzleId,missionId,worldId='space'){
 const p=cleanProfile(profile,worldId),{missions,artifacts}=getWorld(worldId);
 if(!/^(?:forest-(?:5|6|8)|figudoku-(?:easy|medium|hard))-([1-9]|1[0-9]|2[0-4])$/.test(puzzleId)||!missions.some(m=>m.id===missionId))throw new Error('Unknown puzzle or collection');
 if(p.puzzles.includes(puzzleId))return {profile:p,already:true,reward:null};
 p.puzzles.push(puzzleId);p.stars+=10;p.completed++;
 const {reward,rewardStatus}=awardCard(p,missionId,puzzleId.startsWith('figudoku-')?'figudoku':'tents',worldId);
 for(const b of badgeDefs)if(!p.badges.includes(b.id)&&(b.id==='collector'?p.items.length===artifacts.length:b.test(p)))p.badges.push(b.id);
 return {profile:p,already:false,reward,rewardStatus};
}



