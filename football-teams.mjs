import {footballWorld} from './football.mjs?v=8';

// Independent collection: player IDs and the schitay-football-v1 save stay unchanged.
const teams=[
 {
  "id": "club-real",
  "name": "Реал Мадрид",
  "city": "Мадрид, Испания",
  "mission": "teams0",
  "pet": "team",
  "icon": "🛡️",
  "story": "Клуб из столицы Испании легко узнать по белой форме. Его домашний стадион носит имя Сантьяго Бернабеу.",
  "look": {
   "initials": "RMA",
   "primary": "#ffffff",
   "secondary": "#c4a34c",
   "pattern": 0
  }
 },
 {
  "id": "club-barcelona",
  "name": "Барселона",
  "city": "Барселона, Испания",
  "mission": "teams0",
  "pet": "team",
  "icon": "🛡️",
  "story": "Сине-гранатовые цвета — визитная карточка «Барселоны». Клуб представляет город на берегу Средиземного моря.",
  "look": {
   "initials": "FCB",
   "primary": "#a52145",
   "secondary": "#24519b",
   "pattern": 1
  }
 },
 {
  "id": "club-atletico",
  "name": "Атлетико Мадрид",
  "city": "Мадрид, Испания",
  "mission": "teams0",
  "pet": "team",
  "icon": "🛡️",
  "story": "Ещё одна знаменитая команда из Мадрида играет в красно-белую полоску. Матчи с «Реалом» называют мадридским дерби.",
  "look": {
   "initials": "ATM",
   "primary": "#db3547",
   "secondary": "#ffffff",
   "pattern": 2
  }
 },
 {
  "id": "club-liverpool",
  "name": "Ливерпуль",
  "city": "Ливерпуль, Англия",
  "mission": "teams0",
  "pet": "team",
  "icon": "🛡️",
  "story": "Команда из портового города выходит на поле в красном. На её стадионе «Энфилд» болельщики поют «Ты никогда не будешь один».",
  "look": {
   "initials": "LIV",
   "primary": "#c93240",
   "secondary": "#ffffff",
   "pattern": 3
  }
 },
 {
  "id": "club-manutd",
  "name": "Манчестер Юнайтед",
  "city": "Манчестер, Англия",
  "mission": "teams0",
  "pet": "team",
  "icon": "🛡️",
  "story": "Красные футболки и прозвище «Красные дьяволы» известны по всему миру. Домашний стадион команды — «Олд Траффорд».",
  "look": {
   "initials": "MU",
   "primary": "#d9383c",
   "secondary": "#262a39",
   "pattern": 0
  }
 },
 {
  "id": "club-mancity",
  "name": "Манчестер Сити",
  "city": "Манчестер, Англия",
  "mission": "teams0",
  "pet": "team",
  "icon": "🛡️",
  "story": "Небесно-голубая форма отличает этот клуб от соседей по Манчестеру. Встречи двух манчестерских команд называют городским дерби.",
  "look": {
   "initials": "MC",
   "primary": "#6fb9df",
   "secondary": "#ffffff",
   "pattern": 1
  }
 },
 {
  "id": "club-arsenal",
  "name": "Арсенал",
  "city": "Лондон, Англия",
  "mission": "teams0",
  "pet": "team",
  "icon": "🛡️",
  "story": "Лондонскую команду называют «Канонирами». Поэтому на её эмблеме можно увидеть пушку.",
  "look": {
   "initials": "ARS",
   "primary": "#d23e45",
   "secondary": "#ffffff",
   "pattern": 2
  }
 },
 {
  "id": "club-chelsea",
  "name": "Челси",
  "city": "Лондон, Англия",
  "mission": "teams0",
  "pet": "team",
  "icon": "🛡️",
  "story": "Этот лондонский клуб играет в синих цветах. Его …4229 tokens truncated…ткрывай новые клубы!'})),
 artifacts:teams,successText:'Отличная игра! Ты открыл карточку футбольной команды!',
 rewardTitle:'НОВАЯ КОМАНДА В КОЛЛЕКЦИИ!',missionNote:'36 футбольных клубов ждут тебя!',
 collectionKind:'Карточки команд',heroBubble:'Соберём клубы со всего мира!'
};
// Original collectible illustrations in club colours, rather than official logos.
export function teamPortrait(item){
 const {primary:c,secondary:s,initials,pattern}=item.look;
 const decoration=[`<path d="M61 39V115M83 39V134M105 39V134M127 39V115" stroke="${s}" stroke-width="10"/>`,
 `<path d="M45 60H143M45 84H143M51 108H137" stroke="${s}" stroke-width="12"/>`,
 `<path d="M49 119L139 37" stroke="${s}" stroke-width="23"/>`,
 `<path d="M94 36H143V89Q143 123 94 146Z" fill="${s}"/>`][pattern];
 return `<svg viewBox="0 0 188 190" xmlns="http://www.w3.org/2000/svg" role="img" aria-label="${item.name}">
 <rect x="5" y="5" width="178" height="180" rx="25" fill="#edf5ec"/>
 <path d="M16 154Q94 117 172 154V174H16Z" fill="#d2e8cf"/><path d="M20 163H168M94 148V177" stroke="white" stroke-width="2"/>
 <path d="M36 47L28 39M152 47L160 39M94 22V12" stroke="#e0b94f" stroke-width="4" stroke-linecap="round"/>
 <path d="M45 36H143V88Q143 128 94 151Q45 128 45 88Z" fill="${c}"/>
 ${decoration}<path d="M45 36H143V88Q143 128 94 151Q45 128 45 88Z" fill="none" stroke="#334c43" stroke-width="4"/>
 <rect x="52" y="63" width="84" height="39" rx="12" fill="#ffffff" stroke="#334c43" stroke-width="2"/>
 <text x="94" y="89" text-anchor="middle" font-family="system-ui,sans-serif" font-size="${initials.length>4?16:21}" font-weight="800" fill="#2e4a3e">${initials}</text>
 <circle cx="94" cy="131" r="16" fill="white" stroke="#334c43" stroke-width="2"/><path d="M94 121L103 127L100 137H88L85 127Z" fill="#334c43"/>
 <path d="M35 165L40 161L45 165L43 171H37ZM143 165L148 161L153 165L151 171H145Z" fill="#dfb951"/></svg>`;
}
