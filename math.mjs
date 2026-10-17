export function makeProblems(count, mode='mixed', level='all', negative=false, random=Math.random) {
  const pool=[];
  for(let a=10;a<=99;a++) for(let b=10;b<=99;b++) for(const op of ['+','−']) {
    if(mode==='add'&&op!=='+'||mode==='subtract'&&op!== '−') continue;
    if(op==='−'&&!negative&&a<b) continue;
    const carry=op==='+'?a%10+b%10>=10:a%10<b%10;
    if(level==='easy'&&carry||level==='carry'&&!carry) continue;
    pool.push({a,b,op,answer:op==='+'?a+b:a-b});
  }
  for(let i=pool.length-1;i>0;i--){const j=Math.floor(random()*(i+1));[pool[i],pool[j]]=[pool[j],pool[i]];}
  if(mode!=='mixed')return pool.slice(0,count);
  const add=pool.filter(p=>p.op==='+').slice(0,Math.ceil(count/2));
  const sub=pool.filter(p=>p.op==='−').slice(0,Math.floor(count/2));
  const result=[...add,...sub];
  for(let i=result.length-1;i>0;i--){const j=Math.floor(random()*(i+1));[result[i],result[j]]=[result[j],result[i]];}
  return result;
}
export function hint(p){
  const tens=Math.floor(p.b/10)*10,units=p.b%10;
  const mid=p.op==='+'?p.a+tens:p.a-tens;
  return `${p.b} = ${tens} + ${units}. Сначала ${p.a} ${p.op} ${tens} = ${mid}. Теперь ${mid} ${p.op} ${units} = ?`;
}
