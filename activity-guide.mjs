import {portrait} from './portraits.mjs?v=teams-repair2-20261107';
const escapeHTML=value=>String(value).replace(/[&<>]/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;'}[c]));
export function mountPuzzleGuide(root,{context,definition,onHint}){
 const card=root.querySelector('.game-card'),head=card.querySelector('.game-heading');
 const heading=document.createElement('div');heading.className='wide-game-heading section-head';heading.innerHTML=head.querySelector('div').outerHTML;
 const layout=document.createElement('div');layout.className='activity-layout';card.before(heading,layout);
 const side=document.createElement('aside');side.className='activity-sidebar puzzle-guide';side.setAttribute('aria-label','Помощник и правила');
 side.innerHTML='<div class="buddy"><div class="buddy-face" aria-hidden="true"></div><h2></h2><p class="puzzle-buddy-text" role="status" aria-live="polite"></p></div><button class="secondary guide-learn">🎓 Научиться играть</button><div class="wide-rules"><h3>Как играть</h3><ol>'+definition.rules.map(rule=>'<li>'+escapeHTML(rule)+'</li>').join('')+'</ol></div><button class="text-button guide-hint">💡 Помоги мне</button>';
 layout.append(side,card);let worldId;
 const defaults=definition.buddyText||'Я рядом! Если трудно, нажми кнопку помощи.';
 function update(){const ctx=context();if(worldId===ctx.id)return;worldId=ctx.id;const face=side.querySelector('.buddy-face');face.replaceChildren();if(ctx.id==='space')face.textContent='🤖';else face.innerHTML=portrait(ctx.world.mascot||ctx.world.artifacts[0]);side.querySelector('h2').textContent=`Я ${ctx.world.buddy}!`;side.querySelector('.guide-hint').textContent=`💡 ${ctx.world.buddy}, помоги!`;say('');}
 function say(text){side.querySelector('.puzzle-buddy-text').textContent=text||defaults;}
 side.querySelector('.guide-learn').onclick=()=>root.querySelector('.game-learning button').click();
 side.querySelector('.guide-hint').onclick=onHint;if(!onHint)side.querySelector('.guide-hint').hidden=true;
 return {update,say};
}
