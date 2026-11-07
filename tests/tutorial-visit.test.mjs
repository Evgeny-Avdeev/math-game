import test from 'node:test';
import assert from 'node:assert/strict';
import {tutorialVisit} from '../tutorial-visit.mjs';
function storage(t){const old=Object.getOwnPropertyDescriptor(globalThis,'localStorage'),data=new Map();Object.defineProperty(globalThis,'localStorage',{configurable:true,value:{getItem:k=>data.get(k)??null,setItem:(k,v)=>data.set(k,v)}});t.after(()=>{if(old)Object.defineProperty(globalThis,'localStorage',old);else delete globalThis.localStorage;});return data;}
test('each activity opens once, including after page reload',t=>{storage(t);const shown=[];for(const mode of ['math','tents','figudoku']){const visit=tutorialVisit(mode,()=>shown.push(mode));visit.openIfFirst();visit.openIfFirst();tutorialVisit(mode,()=>shown.push(mode)).openIfFirst();}assert.deepEqual(shown,['math','tents','figudoku']);});
test('manual learning remains available and counts as the first visit',t=>{storage(t);let count=0;const visit=tutorialVisit('math',()=>count++);visit.open();visit.openIfFirst();visit.open();assert.equal(count,2);});
test('unavailable storage still prevents repeated popups during the session',t=>{storage(t);Object.defineProperty(globalThis,'localStorage',{configurable:true,get(){throw Error('blocked');}});let count=0;const visit=tutorialVisit('tents',()=>count++);visit.openIfFirst();visit.openIfFirst();assert.equal(count,1);});
test('an unsuccessful dialog open does not mark learning as seen',t=>{const data=storage(t);const visit=tutorialVisit('figudoku',()=>{throw Error('not ready');});assert.throws(()=>visit.openIfFirst());assert.equal(data.size,0);});
