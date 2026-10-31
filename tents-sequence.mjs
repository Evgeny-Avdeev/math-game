// Card-set order defines the puzzle size in every world.
export function puzzleSize(missions,missionId){
 const index=missions.findIndex(m=>m.id===missionId);
 if(index<0)throw new Error('Unknown collection set');
 return [5,6,6,8][index]??8;
}
export function nextPuzzle(puzzles,size,completed,after=null){
 const list=puzzles.filter(p=>p.n===size);
 if(!list.length)throw new Error('No puzzles for this size');
 const done=new Set(completed||[]);
 return list.find(p=>!done.has(p.id))||list[(list.findIndex(p=>p.id===after)+1)%list.length];
}
