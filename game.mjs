import {getWorld} from './worlds.mjs?v=3';
export {missions,artifacts} from './space.mjs?v=3';
export const badgeDefs=[
 {id:'first',icon:'🏅',name:'Первый полёт',description:'Заверши первую миссию',test:p=>p.completed>=1},
 {id:'streak',icon:'🔥',name:'На одной волне',description:'Реши 5 подряд с первого раза без подсказок',test:p=>p.bestStreak>=5},
 {id:'fifty',icon:'🌟',name:'Знаток чисел',description:'Реши 50 примеров',test:p=>p.solved>=50},
 {id:'collector',icon:'🏆',name:'Хранитель сокровищ',description:'Собери все 12 артефактов',test:p=>p.items.length===12}
];
export const emptyProfile=()=>({stars:0,solved:0,completed:0,bestStreak:0,items:[],badges:[]});
export function cleanProfile(raw,worldId='space'){
 const {artifacts}=getWorld(worldId);
 const p=emptyProfile();
 if(!raw||typeof raw!=='object')return p;
 for(const k of ['stars','solved','completed','bestStreak'])if(Number.isSafeInteger(raw[k])&&raw[k]>=0)p[k]=raw[k];
 p.items=[...new Set(Array.isArray(raw.items)?raw.items:[])].filter(id=>artifacts.some(a=>a.id===id));
 p.badges=[...new Set(Array.isArray(raw.badges)?raw.badges:[])].filter(id=>badgeDefs.some(a=>a.id===id));return p;
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
 const badges=badgeDefs.filter(b=>!p.badges.includes(b.id)&&b.test(p));p.badges.push(...badges.map(b=>b.id));
 return {profile:p,stars,solved,reward,badges,success};
}
