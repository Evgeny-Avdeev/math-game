// Shared lifecycle; adapters retain their boards, rules, and legacy save formats.
export function createActivityLifecycle(adapter){
 let key='', loaded=false, completed=false;
 const read=k=>{try{return JSON.parse(localStorage.getItem(k)||'null');}catch{return null;}};
 function persist(){if(!loaded)return;try{localStorage.setItem(key,JSON.stringify(adapter.snapshot(completed)));}catch{adapter.onStorageError?.();}}
 function load(saved,previousId){completed=false;loaded=true;adapter.load(saved,previousId);persist();}
 return {
  persist,
  enter(){const nextKey=adapter.key();if(loaded&&key===nextKey&&!completed&&!adapter.stale?.()){adapter.render?.();return;}
   const previousId=loaded&&key===nextKey&&completed?adapter.id():undefined;
   key=nextKey;const saved=read(key)??adapter.legacy?.(read);load(saved,previousId);
  },
  next(){const previousId=loaded?adapter.id():undefined;key=adapter.key();load(null,previousId);},
  complete(){if(!loaded||completed||!adapter.solved())return false;completed=true;adapter.lock?.();persist();adapter.complete();persist();return true;},
  get completed(){return completed;},
 };
}
