import {createActivityTutorial} from './activity-tutorial.mjs?v=1';
import {activityDefinitions} from './activity-definitions.mjs?v=1';
export function addTutorial(root){
 let step=0,marks=Array(9).fill(0);
 const {dialog,visit}=createActivityTutorial(root,{definition:activityDefinitions.tents,label:"Учебный лагерь",className:"",practiceHTML:"<span class=\"eyebrow\">УЧЕБНЫЙ ЛАГЕРЬ · БЕЗ НАГРАД</span><h2>Твой первый поход</h2><p>Два дерева — две палатки. Пройдём все шаги вместе!</p><div class=\"forest-board\" style=\"--n:3\"></div><div class=\"forest-feedback\" role=\"status\" aria-live=\"polite\"></div><div class=\"result-actions\"><button class=\"secondary tutorial-again\">Сначала</button><button class=\"primary tutorial-finish\" hidden>К головоломкам →</button></div>",onStart:()=>{step=0;marks.fill(0);draw();},onPractice:draw});
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
 return visit;
}
