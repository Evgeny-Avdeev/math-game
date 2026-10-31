// Rules are checked independently of the stored solution, including one-to-one tree pairing.
export function adjacent(a,b,n){return Math.abs(Math.floor(a/n)-Math.floor(b/n))+Math.abs(a%n-b%n)===1;}
export function paired(tents,trees,n){
 const owner=new Map();
 function match(t,seen){for(const tree of trees){if(seen.has(tree)||!adjacent(t,tree,n))continue;seen.add(tree);if(!owner.has(tree)||match(owner.get(tree),seen)){owner.set(tree,t);return true;}}return false;}
 return tents.length===trees.length&&tents.every(t=>match(t,new Set()));
}
export function inspect(p,marks){
 const tents=marks.flatMap((v,i)=>v===1?[i]:[]),rows=Array(p.n).fill(0),cols=[...rows],bad=new Set();
 for(const t of tents){rows[Math.floor(t/p.n)]++;cols[t%p.n]++;if(p.trees.includes(t)||!p.trees.some(tr=>adjacent(t,tr,p.n)))bad.add(t);}
 for(const a of tents)for(const b of tents)if(a!==b&&Math.abs(Math.floor(a/p.n)-Math.floor(b/p.n))<=1&&Math.abs(a%p.n-b%p.n)<=1){bad.add(a);bad.add(b);}
 const counts=rows.every((v,i)=>v===p.rows[i])&&cols.every((v,i)=>v===p.cols[i]);
 return {tents,rows,cols,bad,solved:counts&&!bad.size&&paired(tents,p.trees,p.n)};
}
export function solve(p,limit=2){
 const options=Array.from({length:p.n},(_,r)=>{
  const out=[];for(let mask=0;mask<1<<p.n;mask++){
   if(mask&(mask<<1))continue;const cells=[];for(let c=0;c<p.n;c++)if(mask>>c&1)cells.push(r*p.n+c);
   if(cells.length===p.rows[r]&&cells.every(t=>!p.trees.includes(t)&&p.trees.some(tr=>adjacent(t,tr,p.n))))out.push({mask,cells});
  }return out;
 });
 const found=[],cols=Array(p.n).fill(0);
 function visit(r,prev,tents){if(found.length>=limit)return;if(r===p.n){if(cols.every((v,c)=>v===p.cols[c])&&paired(tents,p.trees,p.n))found.push(tents);return;}
  for(const o of options[r]){if(o.mask&(prev|prev<<1|prev>>1))continue;for(const t of o.cells)cols[t%p.n]++;
   if(cols.every((v,c)=>v<=p.cols[c]&&v+p.n-r-1>=p.cols[c]))visit(r+1,o.mask,[...tents,...o.cells]);
   for(const t of o.cells)cols[t%p.n]--;
  }
 }visit(0,0,[]);return found;
}
