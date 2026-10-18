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
  const {a,b,op}=p;
  // Optional negative-answer practice: subtract the smaller magnitude first.
  if(op==='−'&&a<b)return `Ответ будет отрицательным. Сначала найди ${b} − ${a}. ${hint({a:b,b:a,op:'−'})} Перед полученным ответом поставь минус.`;
  const au=a%10,bu=b%10,at=Math.floor(a/10),bt=Math.floor(b/10);
  if(op==='+'){
    const units=au+bu,carry=units>=10?1:0;
    const first=carry
      ?`Единицы: ${au} + ${bu} = ${units}. Оставь ${units%10} в разряде единиц, а 1 десяток перенеси к десяткам.`
      :`Сначала единицы: ${au} + ${bu} = ${units}.`;
    const hundreds=at+bt+carry>=10?' Помни: 10 десятков — это 1 сотня.':'';
    return `${first} Теперь десятки: ${at} + ${bt}${carry?' + 1 (перенос)':''} = ? Собери ответ из десятков и единиц.${hundreds}`;
  }
  if(au<bu){
    return `В разряде единиц ${au} меньше ${bu}. Займи 1 десяток: останется ${at-1} в разряде десятков, а единиц станет ${au+10}. Единицы: ${au+10} − ${bu} = ${au+10-bu}. Теперь десятки: ${at-1} − ${bt} = ? Собери ответ из десятков и единиц.`;
  }
  return `Сначала единицы: ${au} − ${bu} = ${au-bu}. Теперь десятки: ${at} − ${bt} = ? Собери ответ из десятков и единиц.`;
}
