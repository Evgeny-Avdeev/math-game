import {mountActivityShell} from './activity-shell.mjs?v=1';
import {createActivityTutorial} from './activity-tutorial.mjs?v=1';

// Reusable host for a serializable task engine. No new game is registered by this file.
export function mountActivityTemplate(root,{definition,context,openActivities,openCollection,complete,engine,practiceHTML=''}){
 for(const name of ['next','initial','render','inspect'])if(typeof engine?.[name]!=='function')throw Error(`Activity engine needs ${name}()`);
 if(typeof complete!=='function')throw Error('Activity needs an explicit reward/completion adapter');
 const id=definition.id;
 if(!/^[a-z][a-z0-9-]*$/.test(id))throw Error('Use a unique activity id with letters, digits and hyphens');
 const $=suffix=>root.querySelector(`#${id}-${suffix}`);
 const guide=mountActivityShell(root,{definition,context,onBack:openActivities,hintId:engine.hint?`${id}-hint`:undefined,nextId:`${id}-next`,gameHTML:`
 <div class="forest-settings"><div><span class="small muted">Набор</span><b id="${id}-level"></b></div><div><span class="small muted">Задание</span><b id="${id}-number"></b></div></div>
 <p class="forest-instruction" id="${id}-instruction"></p>
 <div class="forest-remaining" role="status"><span aria-hidden="true">✎</span><div><span>Осталось</span><strong id="${id}-remaining"></strong></div></div>
 <div id="${id}-board" class="activity-board-slot" aria-label="Игровое поле"></div>
 <div id="${id}-feedback" class="forest-feedback" role="status" aria-live="polite" hidden></div>
 <div class="forest-actions"><button class="primary" id="${id}-check" data-activity-action="check">Проверить ✓</button><button class="secondary" id="${id}-undo">↶ Отменить</button><button class="secondary" id="${id}-hint">💡 Подсказка</button><button class="text-button" id="${id}-reset" data-activity-action="reset">Начать заново</button></div>
 <div class="forest-win" id="${id}-win" hidden><h2>Отличная работа!</h2><p id="${id}-prize"></p><button class="primary" id="${id}-next">Следующее задание →</button><button class="text-button" id="${id}-collection">Открыть коллекцию</button></div>`});
 const tutorial=createActivityTutorial(root,{definition,practiceHTML});
 let task,state,history=[],key='',locked=false;
 const copy=value=>JSON.parse(JSON.stringify(value));
 function message(text=''){const box=$('feedback');box.textContent=text;box.hidden=!text;guide.say(text);}
 function persist(){try{localStorage.setItem(key,JSON.stringify({id:task.id,state}));}catch{}}
 function draw(){const ctx=context(),status=engine.inspect(task,state);guide.update();root.querySelector(`#${id}-set-title`).textContent=ctx.targetMission.title;const items=ctx.world.artifacts.filter(a=>a.mission===ctx.targetMission.id);root.querySelector(`#${id}-set-progress`).textContent=`Собрано: ${items.filter(a=>ctx.profile.items.includes(a.id)).length} из ${items.length}`;
  $('level').textContent=task.difficulty||ctx.targetMission.title;$('number').textContent=task.label||task.id;$('instruction').textContent=definition.instruction||'';$('remaining').textContent=status.remaining??'—';
  engine.render($('board'),{task,state:copy(state),locked,onChange:change});$('undo').disabled=locked||!history.length;for(const action of ['check','hint','reset'])$(action).disabled=locked||action==='hint'&&!engine.hint;
 }
 function check(){const status=engine.inspect(task,state);if(!status.solved){message(status.message||'Попробуй ещё — у тебя получится!');return;}if(locked)return;locked=true;persist();draw();const result=complete(task.id,context().targetMission.id);$('win').hidden=false;$('prize').textContent=result?.message||'Задание решено!';message('Готово! Можно перейти к следующему заданию.');}
 function change(next){if(locked)return;history.push(copy(state));state=copy(next);message();persist();draw();if(engine.inspect(task,state).solved)check();}
 function load(next,saved){task=next;state=engine.initial(task);if(saved?.id===task.id&&engine.validateState?.(task,saved.state))state=copy(saved.state);history=[];locked=false;$('win').hidden=true;message();draw();}
 function enter(){const ctx=context(),nextKey=`schitay-task-${id}-${ctx.id}-${ctx.targetMission.id}-v1`;if(key===nextKey&&task){draw();return;}key=nextKey;const next=engine.next(ctx);let saved;try{saved=JSON.parse(localStorage.getItem(key)||'null');}catch{}load(next,saved);}
 $('check').onclick=check;$('undo').onclick=()=>{if(!locked&&history.length){state=history.pop();message();persist();draw();}};
 $('hint').onclick=()=>{if(!locked&&engine.hint)message(engine.hint(task,copy(state)));};
 $('reset').onclick=()=>{if(!locked)change(engine.initial(task));};
 $('next').onclick=()=>{load(engine.next(context(),task.id));persist();};$('collection').onclick=openCollection;
 return {enter,showTutorialIfFirst:tutorial.visit.openIfFirst};
}
