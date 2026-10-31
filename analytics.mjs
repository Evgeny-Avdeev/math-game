// Optional telemetry. Failure must never affect the game or its saved progress.
const endpoint='https://schitay-legko.evgeny-e-avdeev.chatgpt.site/analytics/collect';
let memoryVisitor, memorySession;
const uuid=()=>globalThis.crypto.randomUUID();
function read(key){try{return JSON.parse(localStorage.getItem(key)||'null');}catch{return null;}}
function write(key,value){try{localStorage.setItem(key,JSON.stringify(value));}catch{}}
function identity(){
 let visitor=read('schitay-analytics-visitor-v1');
 if(typeof visitor!=='string'||!/^[-a-f0-9]{36}$/.test(visitor)){visitor=memoryVisitor||uuid();write('schitay-analytics-visitor-v1',visitor);}memoryVisitor=visitor;
 let session=read('schitay-analytics-session-v1')||memorySession;
 const now=Date.now();
 if(!session||typeof session.id!=='string'||!Number.isFinite(session.time)||now-session.time>1800000||now<session.time)session={id:uuid(),time:now};
 session.time=now;memorySession=session;write('schitay-analytics-session-v1',session);
 return {visitor,session:session.id};
}
export function track(event,{world='none',game='none',solved=0}={}){
 try{
 if(location.origin!=='https://evgeny-avdeev.github.io'||!location.pathname.startsWith('/math-game/')||navigator.doNotTrack==='1'||navigator.globalPrivacyControl===true)return;
 const payload={id:uuid(),...identity(),event,world,game,solved};
 const body=JSON.stringify(payload);
 const send=()=>fetch(endpoint,{method:'POST',mode:'cors',credentials:'omit',headers:{'Content-Type':'application/json'},body,keepalive:true});
 void send().then(r=>{if(r.status>=500)throw new Error('temporary');}).catch(()=>{setTimeout(()=>{void send().catch(()=>{});},1500);});
 }catch{/* Analytics is always optional. */}
}
