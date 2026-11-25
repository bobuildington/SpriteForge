'use strict';
const assert = require('node:assert/strict');
require('../shared/world-planner.js');
require('../shared/terrain-art.js');
const planner=globalThis.MapForgeWorldPlanner, terrain=globalThis.MapForgeTerrain;
const configs=[
 {enableRoads:false,roads:'network',river:false,villages:false,buildings:false,settlements:0},
 {enableRoads:false,roads:'main',river:false,villages:true,buildings:true,settlements:3},
 {enableRoads:true,roads:'network',river:true,villages:false,buildings:false,settlements:0},
 {enableRoads:true,roads:'network',river:true,villages:true,buildings:false,settlements:3},
 {enableRoads:true,roads:'network',river:true,villages:true,buildings:true,settlements:3}
];
for(const cfg of configs){
 const options={cols:5,rows:5,seed:123456,biomes:'mixed',...cfg};
 const plan=planner.generate(options),second=planner.generate(options);
 assert.deepEqual(plan,second,'planning must be deterministic');
 assert.deepEqual(planner.audit(plan),[],'edge exits must match');
 const designs=Object.values(plan.cells).map((feature,i)=>terrain.fromPlan(feature,i+123));
 assert.ok(designs.every(terrain.valid),'every design should be editable');
 if(!cfg.enableRoads) assert.ok(designs.every(d=>!d.paths.some(p=>p.kind==='road')),'roads off should create no paths');
 if(!cfg.river)assert.ok(designs.every(d=>!d.paths.some(p=>p.kind==='river')),'rivers off should create no rivers');
 if(!cfg.villages) assert.ok(designs.every(d=>!d.buildings.length&&!d.clearings.length),'villages off should create no buildings/clearings');
 if(cfg.villages&&!cfg.buildings)assert.ok(designs.every(d=>!d.buildings.length),'buildings off should create no buildings');
 if(cfg.villages&&cfg.buildings)assert.ok(designs.some(d=>d.buildings.length>0),'villages should create house art');
}
let test=terrain.fromPlan({roads:{E:.5,W:.5},river:{N:.25,S:.25},roadsEnabled:true,settlement:'village',buildingsEnabled:true},51);
const old=test.buildings.length;
assert.ok(old>0);
const first=test.buildings[0];const hit=terrain.hitBuilding(test,first.x,first.y);
assert.notEqual(hit,-1);
test.buildings.splice(hit,1);assert.equal(test.buildings.length,old-1);
const cloned=terrain.clone(test);assert.deepEqual(cloned,test);assert.notEqual(cloned,test);
console.log('Map Forge V3.2 terrain regression checks passed');
