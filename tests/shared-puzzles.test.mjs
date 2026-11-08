import test from 'node:test';
import assert from 'node:assert/strict';
import {cleanProfile,settlePuzzle,rewardStatus,solvedPuzzlesAcrossWorlds} from '../game.mjs';
import {worlds,getWorld} from '../worlds.mjs';
import {figudokuPuzzles} from '../figudoku-data.mjs';
import {figudokuLevel,nextFigudoku} from '../figudoku-engine.mjs';
import {puzzles} from '../tents-data.mjs';
import {nextPuzzle} from '../tents-sequence.mjs';

const fresh=()=>Object.fromEntries(Object.keys(worlds).map(id=>[id,cleanProfile(null,id)]));
const games=[
 ...['easy','medium','hard'].map(level=>({list:figudokuPuzzles.filter(p=>p.level===level),next:done=>nextFigudoku(figudokuPuzzles,level,done)})),
 ...[5,6,8].map(size=>({list:puzzles.filter(p=>p.n===size),next:done=>nextPuzzle(puzzles,size,done)}))
];

test('legacy solutions from every world are combined without changing collections or rewards',()=>{
 const profiles=fresh();
 for(const [i,id] of Object.keys(profiles).entries())profiles[id]=cleanProfile({stars:42,solved:12,puzzles:[games[0].list[0].id,games[1].list[i].id]},id);
 const before=JSON.stringify(profiles),done=solvedPuzzlesAcrossWorlds(profiles);
 assert.equal(done.length,Object.keys(worlds).length+1);
 assert.equal(games[0].next(done).id,games[0].list[1].id);
 assert.equal(JSON.stringify(profiles),before);
});

test('switching worlds and sets never repeats either puzzle type before its difficulty is exhausted',()=>{
 for(const game of games){
  let profiles=fresh();const ids=Object.keys(profiles),seen=new Set();
  for(let i=0;i<game.list.length;i++){
   const world=ids[i%ids.length],w=getWorld(world),mission=w.missions[i%4];
   const task=game.next(solvedPuzzlesAcrossWorlds(profiles));
   assert.equal(seen.has(task.id),false,task.id);seen.add(task.id);
   const result=settlePuzzle(profiles[world],task.id,mission.id,world);
   assert.equal(result.already,false);profiles[world]=result.profile;
   // Reload the existing storage format between every selection.
   profiles=Object.fromEntries(Object.entries(JSON.parse(JSON.stringify(profiles))).map(([id,p])=>[id,cleanProfile(p,id)]));
  }
  assert.equal(seen.size,game.list.length);
  assert.ok(seen.has(game.next(solvedPuzzlesAcrossWorlds(profiles)).id));
 }
});

test('a solve in another world immediately removes an old draft from the unsolved pool',()=>{
 const profiles=fresh(),draft=games[0].list[0];
 profiles.dog=settlePuzzle(profiles.dog,draft.id,getWorld('dog').missions[0].id,'dog').profile;
 assert.ok(solvedPuzzlesAcrossWorlds(profiles).includes(draft.id));
 assert.notEqual(games[0].next(solvedPuzzlesAcrossWorlds(profiles)).id,draft.id);
 assert.deepEqual(profiles.space.puzzles,[]);
});

// Keep the originally requested five-world scenario and cover later collections too.
const originalWorlds=['space','dog','cat','football','footballTeams'];
const reload=profiles=>Object.fromEntries(Object.entries(JSON.parse(JSON.stringify(profiles))).map(([id,p])=>[id,cleanProfile(p,id)]));
for(const ids of [originalWorlds,Object.keys(worlds)])for(const order of ['world-first','alternating-sets']){
 test(`all available Figudoku cards in ${ids.length} worlds: ${order}, including reloads`,()=>{
  let profiles=fresh();const seen=new Set(),counts={easy:0,medium:0,hard:0};
  const tasks=order==='world-first'
   ?ids.flatMap(world=>getWorld(world).missions.flatMap((_,set)=>Array.from({length:5},()=>({world,set}))))
   :Array.from({length:5},()=>[0,1,2,3].flatMap(set=>ids.map(world=>({world,set})))).flat();
  for(const {world,set} of tasks){
   const w=getWorld(world),mission=w.missions[set],level=figudokuLevel(w.missions,mission.id);
   const p=nextFigudoku(figudokuPuzzles,level,solvedPuzzlesAcrossWorlds(profiles));
   assert.equal(p.level,level);assert.equal(seen.has(p.id),false,`${world}/${set}: ${p.id}`);
   const result=settlePuzzle(profiles[world],p.id,mission.id,world);
   assert.equal(result.already,false);assert.ok(result.reward,`${world}/${set}: missing card`);
   assert.equal(result.reward.mission,mission.id);seen.add(p.id);counts[level]++;
   profiles[world]=result.profile;profiles=reload(profiles);
   assert.ok(solvedPuzzlesAcrossWorlds(profiles).includes(p.id),`lost after reload: ${p.id}`);
   const repeat=settlePuzzle(profiles[world],p.id,mission.id,world);
   assert.equal(repeat.already,true);assert.equal(repeat.reward,null);assert.deepEqual(repeat.profile,profiles[world]);
  }
  assert.deepEqual(counts,{easy:ids.length*5,medium:ids.length*10,hard:ids.length*5});
  for(const world of ids){
   const profile=profiles[world];assert.equal(profile.items.length,20);assert.equal(profile.stars,200);
   for(const mission of getWorld(world).missions){
    const status=rewardStatus(profile,mission.id,'figudoku',world);
    assert.equal(status.counts.figudoku,5);assert.equal(status.reason,'limit');assert.equal(status.allowed,false);
   }
  }
  // With all current worlds the entire bank is exhausted, then only practice remains.
  if(ids.length===Object.keys(worlds).length){
   assert.equal(seen.size,figudokuPuzzles.length);
   for(const level of ['easy','medium','hard'])assert.ok(seen.has(nextFigudoku(figudokuPuzzles,level,solvedPuzzlesAcrossWorlds(profiles)).id));
  }
 });
}

test('bank capacity covers all current collections and their actual Figudoku reward limits',()=>{
 const needed={easy:0,medium:0,hard:0};
 for(const world of Object.keys(worlds)){
  const {missions}=getWorld(world);
  for(const m of missions)needed[figudokuLevel(missions,m.id)]+=rewardStatus(cleanProfile(null,world),m.id,'figudoku',world).limit;
 }
 for(const [level,minimum] of Object.entries(needed))assert.ok(figudokuPuzzles.filter(p=>p.level===level).length>=minimum,`${level} needs ${minimum}`);
});

test('expanded IDs survive reload while nonexistent puzzle IDs remain rejected',()=>{
 const valid=[...figudokuPuzzles,...puzzles].map(p=>p.id);
 const invalid=['figudoku-easy-31','figudoku-medium-61','figudoku-hard-31','forest-5-25','forest-6-50','figudoku-medium-01','figudoku-medium-0','figudoku-medium-1junk',null,42,{}];
 const p=cleanProfile({puzzles:[...valid,...valid,...invalid]},'space');
 assert.deepEqual(p.puzzles,valid);
 assert.deepEqual(reload({space:p}).space,p);
 const mission=getWorld('space').missions[0].id;
 for(const id of invalid)assert.throws(()=>settlePuzzle(p,id,mission,'space'),/Unknown puzzle/);
 assert.throws(()=>settlePuzzle(p,valid[0],'missing','space'),/Unknown puzzle or collection/);
});
