import {tutorialVisit} from './tutorial-visit.mjs?v=1';

// practiceHTML is trusted, authored application markup; rules are plain text.
export function createActivityTutorial(root,{definition,label=definition.title,className='',practiceHTML='',onStart=()=>{},onPractice=()=>{},finishText='Попробуем! →'}){
 const host=root.querySelector('.game-learning');
 if(!host)throw Error('Activity needs a .game-learning slot');
 if(!host.querySelector('button')){const launch=document.createElement('button');launch.className='secondary forest-tutorial-launch';launch.textContent='🎓 Научиться играть';host.append(launch);}
 const dialog=document.createElement('dialog');dialog.className=`forest-tutorial ${className}`.trim();dialog.setAttribute('aria-label',label);
 const close=document.createElement('button');close.className='dialog-close';close.setAttribute('aria-label','Закрыть обучение');close.textContent='×';close.onclick=()=>dialog.close();
 const intro=document.createElement('div');intro.className='tutorial-rules';
 const eyebrow=document.createElement('span');eyebrow.className='eyebrow';eyebrow.textContent='СНАЧАЛА ПРАВИЛА';
 const title=document.createElement('h2');title.textContent=definition.title;
 const list=document.createElement('ol');for(const rule of definition.rules){const li=document.createElement('li');li.textContent=rule;list.append(li);}
 const note=document.createElement('p');note.className='small muted';note.textContent=definition.rulesNote||'';
 const next=document.createElement('button');next.className='primary tutorial-practice';next.textContent=practiceHTML?'Попробовать вместе →':finishText;
 intro.append(eyebrow,title,list,note,next);
 const practice=document.createElement('div');practice.className='tutorial-practice-screen';practice.innerHTML=practiceHTML;practice.hidden=true;
 dialog.append(close,intro,practice);document.body.append(dialog);
 function reset(){const showPractice=!!practiceHTML&&matchMedia('(min-width:601px)').matches;intro.hidden=showPractice;practice.hidden=!showPractice;dialog.scrollTop=0;onStart();}
 const visit=tutorialVisit(definition.id,()=>{if(!dialog.open){reset();dialog.showModal();dialog.scrollTop=0;}});
 next.onclick=()=>{if(!practiceHTML){dialog.close();return;}intro.hidden=true;practice.hidden=false;dialog.scrollTop=0;onPractice();};
 for(const button of practice.querySelectorAll('.tutorial-again'))button.onclick=reset;
 for(const button of practice.querySelectorAll('.tutorial-finish'))button.onclick=()=>dialog.close();
 for(const button of root.querySelectorAll('.game-learning button,.guide-learn'))button.onclick=visit.open;
 return {dialog,intro,practice,visit};
}
