export const missions=[
 {id:'garden',title:'Планета Росток',subtitle:'Складывай числа и оживляй космический сад.',symbol:'+',accent:'#5a9c80',tint:'#e8f5ed',mode:'add',level:'all',count:10,set:'Сокровища космического сада'},
 {id:'ocean',title:'Океан Луны',subtitle:'Вычитай числа и ищи сокровища под водой.',symbol:'−',accent:'#579ac3',tint:'#e6f3fc',mode:'subtract',level:'all',count:10,set:'Тайны лунного океана'},
 {id:'crystal',title:'Кристальные горы',subtitle:'Чередуй плюс и минус на пути к вершине.',symbol:'±',accent:'#a078c5',tint:'#f2eafb',mode:'mixed',level:'all',count:10,set:'Коллекция горного исследователя'},
 {id:'sun',title:'Солнечный портал',subtitle:'Переходи через десяток и открывай портал!',symbol:'✦',accent:'#d5a14d',tint:'#fff2d9',mode:'mixed',level:'carry',count:12,set:'Артефакты солнечного портала'}
];
export const artifacts=[
 {id:'seed',mission:'garden',icon:'🌱',name:'Звёздный росток',story:'Крошечное растение, которое тянется к звёздам. Говорят, оно растёт каждый раз, когда ты узнаёшь что-то новое.'},
 {id:'flower',mission:'garden',icon:'🌸',name:'Цветок кометы',story:'Его лепестки раскрываются только в свете пролетающей кометы. Ты помог космическому саду расцвести!'},
 {id:'tree',mission:'garden',icon:'🌳',name:'Дерево мудрости',story:'В его ветвях живут добрые идеи. Это дерево выросло благодаря твоему терпению и практике.'},
 {id:'shell',mission:'ocean',icon:'🐚',name:'Лунная ракушка',story:'Приложи её к уху в своём воображении. Слышишь? Это шум самого далёкого океана во Вселенной.'},
 {id:'pearl',mission:'ocean',icon:'🔮',name:'Жемчужина Луны',story:'Светится мягким лунным светом и помогает исследователям находить дорогу домой.'},
 {id:'trident',mission:'ocean',icon:'🔱',name:'Трезубец приливов',story:'Старинный ключ к подводным воротам. Теперь тайны лунного океана открыты для тебя!'},
 {id:'gem',mission:'crystal',icon:'💎',name:'Кристалл ясности',story:'Внутри него спрятана крошечная радуга. Чем внимательнее смотришь, тем больше цветов замечаешь.'},
 {id:'compass',mission:'crystal',icon:'🧭',name:'Компас смелости',story:'Его стрелка всегда показывает на новое приключение. С ним не страшно пробовать трудные примеры.'},
 {id:'crown',mission:'crystal',icon:'👑',name:'Корона вершины',story:'Награда за путь к самой высокой горе. Каждый шаг был важен — даже тот, который пришлось повторить.'},
 {id:'key',mission:'sun',icon:'🗝️',name:'Солнечный ключ',story:'Этот золотой ключ умеет открывать двери между десятками. Отличный спутник для новых задач!'},
 {id:'orb',mission:'sun',icon:'☀️',name:'Искра Солнца',story:'Маленькое ручное солнышко. Его тепло напоминает: даже большая задача решается маленькими шагами.'},
 {id:'rocket',mission:'sun',icon:'🚀',name:'Корабль мечты',story:'Теперь у тебя есть собственный корабль для путешествий. Впереди ещё столько открытий!'}
];
export const badgeDefs=[
 {id:'first',icon:'🏅',name:'Первый полёт',description:'Заверши первую миссию',test:p=>p.completed>=1},
 {id:'streak',icon:'🔥',name:'На одной волне',description:'Реши 5 подряд с первого раза без подсказок',test:p=>p.bestStreak>=5},
 {id:'fifty',icon:'🌟',name:'Знаток чисел',description:'Реши 50 примеров',test:p=>p.solved>=50},
 {id:'collector',icon:'🏆',name:'Хранитель сокровищ',description:'Собери все 12 артефактов',test:p=>p.items.length===12}
];
export const emptyProfile=()=>({stars:0,solved:0,completed:0,bestStreak:0,items:[],badges:[]});
export function cleanProfile(raw){
 const p=emptyProfile();
 if(!raw||typeof raw!=='object')return p;
 for(const k of ['stars','solved','completed','bestStreak'])if(Number.isSafeInteger(raw[k])&&raw[k]>=0)p[k]=raw[k];
 p.items=[...new Set(Array.isArray(raw.items)?raw.items:[])].filter(id=>artifacts.some(a=>a.id===id));
 p.badges=[...new Set(Array.isArray(raw.badges)?raw.badges:[])].filter(id=>badgeDefs.some(a=>a.id===id));return p;
}
export function settle(profile,records,missionId,bestStreak){
 const p=cleanProfile(profile);const solved=records.filter(r=>!r.skipped).length;
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
