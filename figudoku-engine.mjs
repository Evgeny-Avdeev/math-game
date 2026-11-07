export const levelNames={easy:'лёгкая',medium:'средняя',hard:'сложная'};
export function figudokuLevel(missions,id){const i=missions.findIndex(m=>m.id===id);return i===3?'hard':i>0?'medium':'easy';}
export function nextFigudoku(puzzles,level,solved=[],current){const list=puzzles.filter(p=>p.level===level);return list.find(p=>!solved.includes(p.id)&&p.id!==current)||list.find(p=>p.id!==current)||list[0];}
function units(n,i){const r=Math.floor(i/n),c=i%n;return [r,n+c,2*n+Math.floor(r/2)*2+Math.floor(c/(n/2))];}
export function inspectFigudoku(p,numbers,shapes){const n=p.n,bad=new Set();let missing=0;
 for(const a of [numbers,shapes]){for(let i=0;i<n*n;i++){if(!a[i])missing++;else if(!Number.isInteger(a[i])||a[i]<1||a[i]>n)bad.add(i);}
 for(let i=0;i<n*n;i++)if(a[i])for(let j=0;j<i;j++)if(a[i]===a[j]&&units(n,i).some(u=>units(n,j).includes(u))){bad.add(i);bad.add(j);}}
 for(let i=0;i<n*n;i++){if(p.numbers[i]&&numbers[i]!==p.numbers[i]||p.shapes[i]&&shapes[i]!==p.shapes[i])bad.add(i);
 if(numbers[i]&&shapes[i])for(let j=0;j<i;j++)if(numbers[i]===numbers[j]&&shapes[i]===shapes[j]){bad.add(i);bad.add(j);}}
 return {bad,missing,solved:missing===0&&bad.size===0};}
// Exact solver for generation and independent uniqueness checks. The budget fails closed.
export function countFigudokuSolutions(p,limit=2,budget=500000){const n=p.n,L=n*n,a=[...p.numbers,...p.shapes],m=[Array(n*3).fill(0),Array(n*3).fill(0)],pairs=Array(L).fill(false),us=Array.from({length:L},(_,i)=>units(n,i));let nodes=0,count=0;
 for(let k=0;k<2;k++)for(let i=0;i<L;i++)if(a[k*L+i]){const bit=1<<(a[k*L+i]-1);if(us[i].some(u=>m[k][u]&bit))return 0;for(const u of us[i])m[k][u]|=bit;}
 for(let i=0;i<L;i++)if(a[i]&&a[L+i]){const pair=(a[i]-1)*n+a[L+i]-1;if(pairs[pair])return 0;pairs[pair]=true;}
 function search(){if(++nodes>budget)throw Error('Solver budget exceeded');if(count>=limit)return;let best=-1,opts=[],bestLen=n+1;
 for(let j=0;j<2*L;j++)if(!a[j]){const k=j>=L?1:0,i=j%L,other=a[(1-k)*L+i],mask=us[i].reduce((v,u)=>v|m[k][u],0),choices=[];
 for(let v=1;v<=n;v++)if(!(mask&(1<<(v-1)))&&(!other||!pairs[k?(other-1)*n+v-1:(v-1)*n+other-1]))choices.push(v);
 if(!choices.length)return;if(choices.length<bestLen){best=j;opts=choices;bestLen=choices.length;if(bestLen===1)break;}}
 if(best<0){count++;return;}const k=best>=L?1:0,i=best%L,other=a[(1-k)*L+i];
 for(const v of opts){const bit=1<<(v-1),pair=k?(other-1)*n+v-1:(v-1)*n+other-1;a[best]=v;for(const u of us[i])m[k][u]|=bit;if(other)pairs[pair]=true;search();if(other)pairs[pair]=false;for(const u of us[i])m[k][u]&=~bit;a[best]=0;if(count>=limit)return;}}
 search();return count;}

// Exclude the edited cell: only complete pairs elsewhere reserve a choice.
export function figudokuPairUsed(numbers,shapes,selected,type,value){
 if(!value)return false;
 const number=type==='number'?value:numbers[selected],shape=type==='shape'?value:shapes[selected];
 return !!number&&!!shape&&numbers.some((v,i)=>i!==selected&&v===number&&shapes[i]===shape);
}
