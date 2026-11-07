import {tutorialVisit} from './tutorial-visit.mjs?v=1';
export function addTutorial(root){
 const launch=document.createElement('button');launch.className='secondary forest-tutorial-launch';launch.textContent='🎓 Научиться играть';root.querySelector('.game-learning').append(launch);
 const dialog=document.createElement('dialog');dialog.className='forest-tutorial';dialog.setAttribute('aria-label','Учебный лагерь');
 dialog.innerHTML='<button class="dialog-close" aria-label="Закрыть обучение">×</button><span class="eyebrow">УЧЕБНЫЙ ЛАГЕРЬ · БЕЗ НАГРАД</span><h2>Твой первый поход</h2><p>Два дерева — две палатки. Пройдём все шаги вместе!</p><div class="forest-board" style="--n:3"></div><div class="forest-feedback" role="status" aria-live="polite"></div><div class="result-actions"><button class="secondary tutorial-again">Сначала</button><button class="primary tutorial-finish" hidden>К головоломкам →</button></div>';
 const intro=document.createElement('div');intro.className='tutorial-rules';intro.innerHTML='<span class="eyebrow">СНАЧАЛА ПРАВИЛА</span><h2>Деревья и палатки</h2><ol><li>У каждого дерева своя палатка на соседней клетке: сверху, снизу, слева или справа.</li><li>Палатки не касаются друг друга, даже уголками.</li><li>Числа у поля показывают, сколько палаток в каждой строке и столбце.</li><li>Палатка может стоять рядом с несколькими деревьями, но пара у каждого дерева своя.</li></ol><p class="small muted">Подсказки разрешены. За повтор уже решённого поля новая награда не выдаётся.</p><button class="primary tutorial-practice">Попробовать вместе →</button>';
 const practice=document.createElement('div');practice.className='tutorial-practice-screen';while(dialog.children.length>1)practice.append(dialog.children[1]);dialog.append(intro,practice);practice.hidden=true;
 document.body.append(dialog);let step=0,marks=Array(9).fill(0);
 const instructions=[
 'Шаг 1 из 5. Потренируем нажатия. Нажми выделенную пустую клетку один раз — появится палатка.',
 'Шаг 2 из 5. Слева у средней строки стоит 0: палаткам здесь не место. Нажми ту же клетку ещё раз — палатка сменится травой. Так отмечают клетки без палаток.',
 'Шаг 3 из 5. Нажми эту клетку в третий раз — отметка сотрётся. Цикл всегда один: пусто → палатка → трава → пусто. Трава помогает рассуждать, но отмечать ею все свободные клетки необязательно.',
 'Шаг 4 из 5. Теперь соберём лагерь! У верхнего дерева подходящее место для палатки — справа: средняя строка запрещена числом 0. Нажми выделенную клетку один раз. Число 1 слева означает одну палатку в строке.',
 'Шаг 5 из 5. Нижнему дереву нужна своя палатка слева от него. Нажми выделенную клетку один раз. Между палатками пустая строка, поэтому они не касаются даже уголками.',
 'Готово! У каждого дерева своя палатка, а числа у строк и столбцов совпадают с расстановкой. В основной игре верный лагерь завершится сам и принесёт награду. Если что-то не сходится, кнопка «Проверить» объяснит ошибку. Счётчик над полем покажет, сколько палаток осталось поставить.'
 ];
 function draw(){const board=dialog.querySelector('.forest-board');board.replaceChildren(document.createElement('span'));const counts=[0,2,0];for(const v of counts){const e=document.createElement('span');e.className='forest-number';e.textContent=v;board.append(e);}for(let r=0;r<3;r++){const num=document.createElement('span');num.className='forest-number';num.textContent=[1,0,1][r];board.append(num);for(let c=0;c<3;c++){const i=r*3+c,tree=i===0||i===8,b=document.createElement('button'),target=[4,4,4,1,7][step];b.className='forest-cell'+(tree?' tree':'')+(i===target?' hinted':'');b.textContent=tree?'🌳':marks[i]===1?'⛺':marks[i]===2?'·':'';b.setAttribute('aria-label',`Строка ${r+1}, столбец ${c+1}${i===target?', нажми здесь':''}`);b.disabled=i!==target;b.onclick=()=>{marks[target]=(marks[target]+1)%3;step++;draw();};board.append(b);}}
 dialog.querySelector('.forest-feedback').textContent=instructions[step];dialog.querySelector('.tutorial-finish').hidden=step!==5;
 }
 function start(){const wide=matchMedia('(min-width:601px)').matches;intro.hidden=wide;practice.hidden=!wide;dialog.scrollTop=0;step=0;marks.fill(0);draw();}
 intro.querySelector('.tutorial-practice').onclick=()=>{intro.hidden=true;practice.hidden=false;dialog.scrollTop=0;draw();};const visit=tutorialVisit('tents',()=>{if(!dialog.open){start();dialog.showModal();}});launch.onclick=visit.open;dialog.querySelector('.dialog-close').onclick=()=>dialog.close();dialog.querySelector('.tutorial-again').onclick=start;dialog.querySelector('.tutorial-finish').onclick=()=>dialog.close();
 return visit;
}

