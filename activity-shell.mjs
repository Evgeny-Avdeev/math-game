import {mountPuzzleGuide} from './activity-guide.mjs?v=activity-template-1';

const escapeHTML=value=>String(value).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
// Also hydrates existing custom exercises without replacing their inputs or handlers.
export function applyActivityDefinition(root,definition){
 if(!definition.id||!definition.title||!Array.isArray(definition.rules))throw Error('Activity needs id, title and rules');
 root.dataset.activity=definition.id;
 for(const heading of root.querySelectorAll('.game-heading,.wide-game-heading')){heading.querySelector('h1').textContent=definition.title;heading.querySelector('.eyebrow').textContent=definition.eyebrow||'';}
}
export function mountActivityShell(root,{definition,context,backId=`${definition.id}-back`,titleId=`${definition.id}-set-title`,progressId=`${definition.id}-set-progress`,hintId,nextId,onBack,gameHTML}){
 root.innerHTML=`<button class="text-button" id="${escapeHTML(backId)}">← Выбрать занятие</button><div class="forest-current-goal"><span class="eyebrow">ПРОДОЛЖАЕМ СОБИРАТЬ КОЛЛЕКЦИЮ</span><b id="${escapeHTML(titleId)}"></b><span id="${escapeHTML(progressId)}"></span></div><div class="game-card forest-game"><div class="game-heading"><div><span class="eyebrow">${escapeHTML(definition.eyebrow||'')}</span><h1>${escapeHTML(definition.title)}</h1></div><div class="game-learning"></div></div>${gameHTML}</div>`;
 applyActivityDefinition(root,definition);
 const guide=mountPuzzleGuide(root,{context,definition,onHint:hintId?()=>root.querySelector(`#${hintId}`)?.click():null});
 root.querySelector(`#${backId}`).onclick=onBack;
 if(nextId)root.querySelector(`#${nextId}`)?.setAttribute('data-activity-next','');
 return guide;
}
