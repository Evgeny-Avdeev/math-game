import {portrait} from './portraits.mjs?v=teams-repair2-20261107';
const rules={"tents": "<li>У каждого дерева своя палатка на соседней клетке: сверху, снизу, слева или справа.</li><li>Палатки не касаются друг друга, даже уголками.</li><li>Числа у поля показывают, сколько палаток в каждой строке и столбце.</li><li>Палатка может стоять рядом с несколькими деревьями, но пара у каждого дерева своя.</li>", "figudoku": "<li>В каждой клетке нужны цифра и фигура: на поле 4 × 4 — от 1 до 4 и четыре фигуры, на поле 8 × 8 — от 1 до 8 и восемь фигур.</li><li>В каждой строке, столбце и блоке с толстым контуром цифры не повторяются. Фигуры тоже.</li><li>Каждая пара «цифра + фигура» встречается на всём поле только один раз.</li><li>Выбери клетку, затем цифру и фигуру под полем. Заданные части со значком 🔒 менять нельзя.</li>"};
export function mountPuzzleGuide(root,{context,mode}){
 const card=root.querySelector('.game-card'),head=card.querySelector('.game-heading');
 const heading=document.createElement('div');heading.className='wide-game-heading section-head';heading.innerHTML=head.querySelector('div').outerHTML;
 const layout=document.createElement('div');layout.className='activity-layout';card.before(heading,layout);
 const side=document.createElement('aside');side.className='activity-sidebar puzzle-guide';side.setAttribute('aria-label','Помощник и правила');
 side.innerHTML='<div class="buddy"><div class="buddy-face" aria-hidden="true"></div><h2></h2><p class="puzzle-buddy-text" role="status" aria-live="polite"></p></div><button class="secondary guide-learn">🎓 Научиться играть</button><div class="wide-rules"><h3>Как играть</h3><ol>'+rules[mode]+'</ol></div><button class="text-button guide-hint">💡 Помоги мне</button>';
 layout.append(side,card);let worldId;
 const defaults=mode==='tents'?'Разобьём лагерь вместе! Смотри на числа у поля — они помогут найти место для палаток.':'Подружим цифры и фигуры! Выбери клетку, а я помогу разобраться.';
 function update(){const ctx=context();if(worldId===ctx.id)return;worldId=ctx.id;const face=side.querySelector('.buddy-face');face.replaceChildren();if(ctx.id==='space')face.textContent='🤖';else face.innerHTML=portrait(ctx.world.mascot||ctx.world.artifacts[0]);side.querySelector('h2').textContent=`Я ${ctx.world.buddy}!`;side.querySelector('.guide-hint').textContent=`💡 ${ctx.world.buddy}, помоги!`;say('');}
 function say(text){side.querySelector('.puzzle-buddy-text').textContent=text||defaults;}
 side.querySelector('.guide-learn').onclick=()=>root.querySelector('.game-learning button').click();
 side.querySelector('.guide-hint').onclick=()=>root.querySelector(mode==='tents'?'#forestHint':'#figHint').click();
 return {update,say};
}
