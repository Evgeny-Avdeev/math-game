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
  if(op==='−'&&a<b)return `Ответ будет отрицательным. Сначала найди ${b} − ${a}. ${hint({a:b,b:a,op:'−'})} Перед полученным ответом поставь минус.`;
  const units=b%10,tens=b-units,au=a%10;
  // When crossing a ten, first reach the nearest round number.
  if(op==='+'&&au>0&&au+units>=10){
    const part=10-au,rest=b-part,round=a+part;
    return `Представим ${b} = ${part} + ${rest}. Сначала прибавим ${part}: ${a} + ${part} = ${round}. Теперь прибавим то, что осталось: ${round} + ${rest} = ?`;
  }
  if(op==='−'&&au>0&&units>au){
    const rest=b-au,round=a-au;
    return `Представим ${b} = ${au} + ${rest}. Сначала вычтем ${au}: ${a} − ${au} = ${round}. Теперь вычтем то, что осталось: ${round} − ${rest} = ?`;
  }
  if(units===0)return `В числе ${b} только целые десятки. ${op==='+'?'Прибавь':'Вычти'} их: ${a} ${op} ${b} = ?`;
  const mid=op==='+'?a+units:a-units;
  return `Сначала ${op==='+'?'прибавь':'вычти'} единицы: ${a} ${op} ${units} = ${mid}. Теперь десятки: ${mid} ${op} ${tens} = ?`;
}
