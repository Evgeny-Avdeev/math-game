// Activity navigation is driven by registration, not a switch over game names.
export function createActivityRegistry(){
 const entries=new Map();
 function register(viewId,controller){
  if(!/^[a-z][a-z0-9-]*$/i.test(viewId)||!controller||entries.has(viewId))throw Error(`Invalid or duplicate activity: ${viewId}`);
  for(const hook of ['enter','showTutorialIfFirst'])if(controller[hook]!==undefined&&typeof controller[hook]!=='function')throw Error(`Invalid ${hook} for ${viewId}`);
  entries.set(viewId,controller);return controller;
 }
 return {register,has:id=>entries.has(id),enter:id=>entries.get(id)?.enter?.(),showTutorialIfFirst:id=>entries.get(id)?.showTutorialIfFirst?.(),scrollSelector:id=>entries.has(id)?`#${id} .game-card`:null};
}
