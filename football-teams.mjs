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
  "story": "Этот лондонский клуб играет в синих цветах. Его домашний стадион называется «Стэмфорд Бридж».",
  "look": {
   "initials": "CHE",
   "primary": "#2851a4",
   "secondary": "#ffffff",
   "pattern": 3
  }
 },
 {
  "id": "club-tottenham",
  "name": "Тоттенхэм",
  "city": "Лондон, Англия",
  "mission": "teams0",
  "pet": "team",
  "icon": "🛡️",
  "story": "Команда из северного Лондона носит белые футболки. Её символ — петушок, стоящий на футбольном мяче.",
  "look": {
   "initials": "TOT",
   "primary": "#ffffff",
   "secondary": "#25375a",
   "pattern": 0
  }
 },
 {
  "id": "club-bayern",
  "name": "Бавария",
  "city": "Мюнхен, Германия",
  "mission": "teams1",
  "pet": "team",
  "icon": "🛡️",
  "story": "Мюнхенская команда носит имя своего региона — Баварии. На её эмблеме есть бело-голубые ромбы баварского флага.",
  "look": {
   "initials": "BAY",
   "primary": "#d43349",
   "secondary": "#ffffff",
   "pattern": 1
  }
 },
 {
  "id": "club-dortmund",
  "name": "Боруссия Дортмунд",
  "city": "Дортмунд, Германия",
  "mission": "teams1",
  "pet": "team",
  "icon": "🛡️",
  "story": "Жёлто-чёрные цвета помогают сразу узнать эту команду. Огромную трибуну её болельщиков называют «Жёлтой стеной».",
  "look": {
   "initials": "BVB",
   "primary": "#f5cf35",
   "secondary": "#272b37",
   "pattern": 2
  }
 },
 {
  "id": "club-leverkusen",
  "name": "Байер",
  "city": "Леверкузен, Германия",
  "mission": "teams1",
  "pet": "team",
  "icon": "🛡️",
  "story": "Команда представляет немецкий город Леверкузен. На её эмблеме два красных льва держат круглый знак клуба.",
  "look": {
   "initials": "B04",
   "primary": "#d43b42",
   "secondary": "#252936",
   "pattern": 3
  }
 },
 {
  "id": "club-juventus",
  "name": "Ювентус",
  "city": "Турин, Италия",
  "mission": "teams1",
  "pet": "team",
  "icon": "🛡️",
  "story": "Клуб из Турина знаменит чёрно-белыми полосками. За эти цвета его иногда сравнивают с зебрами.",
  "look": {
   "initials": "JUV",
   "primary": "#ffffff",
   "secondary": "#272936",
   "pattern": 0
  }
 },
 {
  "id": "club-milan",
  "name": "Милан",
  "city": "Милан, Италия",
  "mission": "teams1",
  "pet": "team",
  "icon": "🛡️",
  "story": "Красно-чёрная форма принадлежит одному из знаменитых клубов Милана. Он делит стадион «Сан-Сиро» со своим городским соперником.",
  "look": {
   "initials": "ACM",
   "primary": "#c93642",
   "secondary": "#282b36",
   "pattern": 1
  }
 },
 {
  "id": "club-inter",
  "name": "Интер",
  "city": "Милан, Италия",
  "mission": "teams1",
  "pet": "team",
  "icon": "🛡️",
  "story": "Сине-чёрные полосы отличают «Интер» от «Милана». Их встречи превращаются в большое миланское дерби.",
  "look": {
   "initials": "INT",
   "primary": "#2864b2",
   "secondary": "#252a36",
   "pattern": 2
  }
 },
 {
  "id": "club-roma",
  "name": "Рома",
  "city": "Рим, Италия",
  "mission": "teams1",
  "pet": "team",
  "icon": "🛡️",
  "story": "Команда из Рима играет в бордово-золотых цветах. Волчица на её эмблеме связана с легендой об основании города.",
  "look": {
   "initials": "ROM",
   "primary": "#8e3043",
   "secondary": "#efb750",
   "pattern": 3
  }
 },
 {
  "id": "club-napoli",
  "name": "Наполи",
  "city": "Неаполь, Италия",
  "mission": "teams1",
  "pet": "team",
  "icon": "🛡️",
  "story": "Голубая форма напоминает о небе и море у Неаполя. Стадион команды назван в честь Диего Марадоны.",
  "look": {
   "initials": "NAP",
   "primary": "#4ba8d6",
   "secondary": "#ffffff",
   "pattern": 0
  }
 },
 {
  "id": "club-psg",
  "name": "Пари Сен-Жермен",
  "city": "Париж, Франция",
  "mission": "teams1",
  "pet": "team",
  "icon": "🛡️",
  "story": "Парижский клуб часто называют просто ПСЖ. На его эмблеме изображена Эйфелева башня.",
  "look": {
   "initials": "PSG",
   "primary": "#243c70",
   "secondary": "#d84252",
   "pattern": 1
  }
 },
 {
  "id": "club-marseille",
  "name": "Олимпик Марсель",
  "city": "Марсель, Франция",
  "mission": "teams2",
  "pet": "team",
  "icon": "🛡️",
  "story": "Клуб представляет Марсель — порт на Средиземном море. Его бело-голубые цвета хорошо знают французские болельщики.",
  "look": {
   "initials": "OM",
   "primary": "#ffffff",
   "secondary": "#4aadd3",
   "pattern": 2
  }
 },
 {
  "id": "club-lyon",
  "name": "Олимпик Лион",
  "city": "Лион, Франция",
  "mission": "teams2",
  "pet": "team",
  "icon": "🛡️",
  "story": "Команда из Лиона использует белый, синий и красный цвета. Лев на её эмблеме напоминает о символе города.",
  "look": {
   "initials": "OL",
   "primary": "#ffffff",
   "secondary": "#34599d",
   "pattern": 3
  }
 },
 {
  "id": "club-ajax",
  "name": "Аякс",
  "city": "Амстердам, Нидерланды",
  "mission": "teams2",
  "pet": "team",
  "icon": "🛡️",
  "story": "У футболки «Аякса» широкая красная полоса посередине. Клуб назван в честь героя древнегреческих мифов.",
  "look": {
   "initials": "AJA",
   "primary": "#ffffff",
   "secondary": "#cd3948",
   "pattern": 0
  }
 },
 {
  "id": "club-psv",
  "name": "ПСВ",
  "city": "Эйндховен, Нидерланды",
  "mission": "teams2",
  "pet": "team",
  "icon": "🛡️",
  "story": "Клуб из Эйндховена играет в красно-белую полоску. Клуб вырос из спортивного общества сотрудников компании Philips.",
  "look": {
   "initials": "PSV",
   "primary": "#d93b45",
   "secondary": "#ffffff",
   "pattern": 1
  }
 },
 {
  "id": "club-feyenoord",
  "name": "Фейеноорд",
  "city": "Роттердам, Нидерланды",
  "mission": "teams2",
  "pet": "team",
  "icon": "🛡️",
  "story": "Роттердамский клуб узнают по красно-белой футболке. Его стадион прозвали «Де Кёйп», что по-нидерландски означает «ванна».",
  "look": {
   "initials": "FEY",
   "primary": "#d43a43",
   "secondary": "#ffffff",
   "pattern": 2
  }
 },
 {
  "id": "club-benfica",
  "name": "Бенфика",
  "city": "Лиссабон, Португалия",
  "mission": "teams2",
  "pet": "team",
  "icon": "🛡️",
  "story": "Один из символов лиссабонской команды — орёл. Перед домашними матчами над стадионом летает живая птица.",
  "look": {
   "initials": "SLB",
   "primary": "#d93843",
   "secondary": "#ffffff",
   "pattern": 3
  }
 },
 {
  "id": "club-porto",
  "name": "Порту",
  "city": "Порту, Португалия",
  "mission": "teams2",
  "pet": "team",
  "icon": "🛡️",
  "story": "Сине-белые полосы принадлежат команде из города Порту. Дракон — её знаменитый символ и прозвище.",
  "look": {
   "initials": "FCP",
   "primary": "#315ba3",
   "secondary": "#ffffff",
   "pattern": 0
  }
 },
 {
  "id": "club-sporting",
  "name": "Спортинг",
  "city": "Лиссабон, Португалия",
  "mission": "teams2",
  "pet": "team",
  "icon": "🛡️",
  "story": "Зелёно-белые горизонтальные полосы отличают «Спортинг». Лев на эмблеме дал команде прозвище «Львы».",
  "look": {
   "initials": "SCP",
   "primary": "#34895e",
   "secondary": "#ffffff",
   "pattern": 1
  }
 },
 {
  "id": "club-celtic",
  "name": "Селтик",
  "city": "Глазго, Шотландия",
  "mission": "teams2",
  "pet": "team",
  "icon": "🛡️",
  "story": "Шотландский клуб носит зелёно-белую полосатую форму. Четырёхлистный клевер украшает его эмблему.",
  "look": {
   "initials": "CEL",
   "primary": "#35986d",
   "secondary": "#ffffff",
   "pattern": 2
  }
 },
 {
  "id": "club-zenit",
  "name": "Зенит",
  "city": "Санкт-Петербург, Россия",
  "mission": "teams3",
  "pet": "team",
  "icon": "🛡️",
  "story": "Команда с берегов Невы играет в сине-бело-голубых цветах. Её эмблема похожа на стрелку с названием клуба.",
  "look": {
   "initials": "ЗЕН",
   "primary": "#56b8dd",
   "secondary": "#ffffff",
   "pattern": 3
  }
 },
 {
  "id": "club-spartak",
  "name": "Спартак",
  "city": "Москва, Россия",
  "mission": "teams3",
  "pet": "team",
  "icon": "🛡️",
  "story": "Московский клуб легко узнать по красно-белым цветам. На его ромбовидной эмблеме находится буква «С».",
  "look": {
   "initials": "СПМ",
   "primary": "#cf3946",
   "secondary": "#ffffff",
   "pattern": 0
  }
 },
 {
  "id": "club-cska",
  "name": "ЦСКА",
  "city": "Москва, Россия",
  "mission": "teams3",
  "pet": "team",
  "icon": "🛡️",
  "story": "Красно-синие цвета принадлежат армейскому клубу из Москвы. Звезда на эмблеме напоминает об истории команды.",
  "look": {
   "initials": "ЦСКА",
   "primary": "#ca3946",
   "secondary": "#315da0",
   "pattern": 1
  }
 },
 {
  "id": "club-dynamo",
  "name": "Динамо Москва",
  "city": "Москва, Россия",
  "mission": "teams3",
  "pet": "team",
  "icon": "🛡️",
  "story": "Бело-голубые цвета — знак московского «Динамо». Красиво написанная буква «Д» стала его узнаваемым символом.",
  "look": {
   "initials": "ДИН",
   "primary": "#315ca2",
   "secondary": "#ffffff",
   "pattern": 2
  }
 },
 {
  "id": "club-lokomotiv",
  "name": "Локомотив",
  "city": "Москва, Россия",
  "mission": "teams3",
  "pet": "team",
  "icon": "🛡️",
  "story": "Красно-зелёную команду называют «Железнодорожниками». Её название и эмблема связаны с поездами и железной дорогой.",
  "look": {
   "initials": "ЛОКО",
   "primary": "#388e60",
   "secondary": "#d33c45",
   "pattern": 3
  }
 },
 {
  "id": "club-krasnodar",
  "name": "Краснодар",
  "city": "Краснодар, Россия",
  "mission": "teams3",
  "pet": "team",
  "icon": "🛡️",
  "story": "Клуб из Краснодара играет в чёрно-зелёных цветах. Бык на эмблеме дал команде прозвище «Быки».",
  "look": {
   "initials": "КРД",
   "primary": "#348265",
   "secondary": "#242d32",
   "pattern": 0
  }
 },
 {
  "id": "club-boca",
  "name": "Бока Хуниорс",
  "city": "Буэнос-Айрес, Аргентина",
  "mission": "teams3",
  "pet": "team",
  "icon": "🛡️",
  "story": "Аргентинскую команду узнают по синей форме с жёлтой полосой. Её стадион «Бомбонера» напоминает по форме коробку конфет.",
  "look": {
   "initials": "BOCA",
   "primary": "#254d92",
   "secondary": "#efc547",
   "pattern": 1
  }
 },
 {
  "id": "club-river",
  "name": "Ривер Плейт",
  "city": "Буэнос-Айрес, Аргентина",
  "mission": "teams3",
  "pet": "team",
  "icon": "🛡️",
  "story": "Белую футболку этой команды пересекает красная диагональная полоса. Матчи с «Бокой» называют аргентинским суперкласико.",
  "look": {
   "initials": "RIVER",
   "primary": "#ffffff",
   "secondary": "#d43748",
   "pattern": 2
  }
 },
 {
  "id": "club-flamengo",
  "name": "Фламенго",
  "city": "Рио-де-Жанейро, Бразилия",
  "mission": "teams3",
  "pet": "team",
  "icon": "🛡️",
  "story": "Бразильский клуб из Рио играет в красно-чёрных полосатых футболках. Футбольные матчи команды собирают множество болельщиков на «Маракане».",
  "look": {
   "initials": "FLA",
   "primary": "#ce3941",
   "secondary": "#282b34",
   "pattern": 3
  }
 }
];
export const footballTeamsWorld={
 ...footballWorld,id:'footballTeams',name:'Футбол · команды',
 collectiblePlural:'карточки команд',collectibleAcc:'карточку команды',secret:'Секретная команда',
 welcome:'Открой футбольный мир!',hero:'Собери коллекцию клубов!',
 intro:'Решай примеры или головоломки и знакомься с футбольными командами!',
 section:'Клубы со всего мира',club:'КЛУБ КОЛЛЕКЦИОНЕРОВ',place:'командам',
 collectionTitle:'Мои футбольные команды',
 collectionNote:'36 клубов: у каждого своя карточка и история. Открой карточку и познакомься с командой!',
 banner:'Большой футбол начинается здесь!',bannerText:'Четыре набора по 9 команд. Соберёшь все 36 клубов?',
 missions:footballWorld.missions.map((m,i)=>({...m,id:'teams'+i,title:['Первый состав','Европейский матч','Клубное путешествие','Большой финал'][i],set:['Первый состав','Европейский матч','Клубное путешествие','Большой финал'][i],subtitle:'Считай и решай головоломки — открывай новые клубы!'})),
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
