import {getWorld} from './worlds.mjs?v=8';
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
export const emptyProfile=()=>({stars:0,solved:0,completed:0,bestStreak:0,items:[],badges:[]});
export function cleanProfile(raw,worldId='space'){
 const {artifacts}=getWorld(worldId);
 const p=emptyProfile();
 if(!raw||typeof raw!=='object')return p;
 for(const k of ['stars','solved','completed','bestStreak'])if(Number.isSafeInteger(raw[k])&&raw[k]>=0)p[k]=raw[k];
 p.items=[...new Set(Array.isArray(raw.items)?raw.items:[])].filter(id=>artifacts.some(a=>a.id===id));
 p.badges=[...new Set(Array.isArray(raw.badges)?raw.badges:[])].filter(id=>badgeDefs.some(a=>a.id===id));
 // Credit existing progress when new achievements become available.
 for(const b of badgeDefs)if(!p.badges.includes(b.id)&&(b.id==='collector'?p.items.length===artifacts.length:b.test(p)))p.badges.push(b.id);
 return p;
}
export function settle(profile,records,missionId,bestStreak,worldId='space'){
 const {missions,artifacts}=getWorld(worldId);
 const p=cleanProfile(profile,worldId);const solved=records.filter(r=>!r.skipped).length;
 const earned=records.reduce((n,r)=>n+(r.skipped?0:r.first?3:1),0);
 p.solved+=solved;p.bestStreak=Math.max(p.bestStreak,bestStreak);
 const mission=missions.find(m=>m.id===missionId);
 const success=!!mission&&records.length===mission.count&&solved>=Math.ceil(mission.count*.8);
 let reward=null;
 if(success){p.completed++;reward=artifacts.find(a=>a.mission===missionId&&!p.items.includes(a.id))||null;if(reward)p.items.push(reward.id);}
 const stars=earned+(success?10:0);p.stars+=stars;
 const badges=badgeDefs.filter(b=>!p.badges.includes(b.id)&&(b.id==='collector'?p.items.length===artifacts.length:b.test(p)));p.badges.push(...badges.map(b=>b.id));
 return {profile:p,stars,solved,reward,badges,success};
}
