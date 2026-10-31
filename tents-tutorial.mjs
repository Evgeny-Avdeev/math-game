export function addTutorial(root){
 const launch=document.createElement('button');launch.className='secondary forest-tutorial-launch';launch.textContent='🎓 Научиться играть · 2 минуты';root.querySelector('.forest-guide h2').after(launch);
 const dialog=document.createElement('dialog');dialog.className='forest-tutorial';dialog.setAttribute('aria-label','Учебный лагерь');
 dialog.innerHTML='<button class="dialog-close" aria-label="Закрыть обучение">×</button><span class="eyebrow">УЧЕБНЫЙ ЛАГЕРЬ · БЕЗ НАГРАД</span><h2>Твой первый поход</h2><p>Два дерева — две палатки. Пройдём все шаги вместе!</p><div class="forest-board" style="--n:3"></div><div class="forest-feedback" role="status" aria-live="polite"></div><div class="result-actions"><button class="secondary tutorial-again">Сначала</button><button class="primary tutorial-finish" hidden>К головоломкам →</button></div>';
 document.body.append(dialog);let step=0,marks=Array(9).fill(0);
 const instructions=[
 'Шаг 1 из 3. Слева у средней строки стоит 0: здесь палаток нет. Нажми выделенную клетку, чтобы отметить всю строку травой.',
 'Шаг 2 из 3. У верхнего дерева единственное свободное место по стороне — справа. Нажми выделенную клетку и поставь палатку. Число 1 слева означает одну палатку в этой строке.',
 'Шаг 3 из 3. Нижнему дереву нужна своя палатка — слева от него. Нажми выделенную клетку. Палатки разделены пустой строкой и не касаются даже уголками.',
 'Готово! У каждого дерева своя палатка. По строкам получилось 1, 0, 1, по столбцам — 0, 2, 0. Ни одна палатка не касается другой. Теперь ты можешь собрать настоящий лагерь и получить карточку!'
 ];
 function draw(){const board=dialog.querySelector('.forest-board');board.replaceChildren(document.createElement('span'));const counts=[0,2,0];for(const v of counts){const e=document.createElement('span');e.className='forest-number';e.textContent=v;board.append(e);}for(let r=0;r<3;r++){const num=document.createElement('span');num.className='forest-number';num.textContent=[1,0,1][r];board.append(num);for(let c=0;c<3;c++){const i=r*3+c,tree=i===0||i===8,b=document.createElement('button'),target=[4,1,7][step];b.className='forest-cell'+(tree?' tree':'')+(i===target?' hinted':'');b.textContent=tree?'🌳':marks[i]===1?'⛺':marks[i]===2?'·':'';b.setAttribute('aria-label',`Строка ${r+1}, столбец ${c+1}${i===target?', нажми здесь':''}`);b.disabled=i!==target;b.onclick=()=>{if(step===0)for(const k of [3,4,5])marks[k]=2;else marks[target]=1;step++;draw();};board.append(b);}}
 dialog.querySelector('.forest-feedback').textContent=instructions[step];dialog.querySelector('.tutorial-finish').hidden=step!==3;
 }
 function start(){step=0;marks.fill(0);draw();}
 launch.onclick=()=>{start();dialog.showModal();};dialog.querySelector('.dialog-close').onclick=()=>dialog.close();dialog.querySelector('.tutorial-again').onclick=start;dialog.querySelector('.tutorial-finish').onclick=()=>dialog.close();
}
