import test from 'node:test';
import assert from 'node:assert/strict';
import {createActivityRegistry} from '../activity-registry.mjs';
test('a future activity inherits navigation and tutorial hooks without a name-specific branch',()=>{const r=createActivityRegistry(),events=[];r.register('future-task',{enter:()=>events.push('enter'),showTutorialIfFirst:()=>events.push('tutorial')});r.enter('future-task');r.showTutorialIfFirst('future-task');assert.deepEqual(events,['enter','tutorial']);assert.equal(r.scrollSelector('future-task'),'#future-task .game-card');assert.equal(r.has('future-task'),true);assert.equal(r.scrollSelector('collection'),null);r.enter('home');});
test('duplicate ids and invalid hooks cannot silently replace an existing activity',()=>{const r=createActivityRegistry();r.register('tents',{});assert.throws(()=>r.register('tents',{}));assert.throws(()=>r.register('bad id',{}));assert.throws(()=>r.register('other',{enter:true}));});
