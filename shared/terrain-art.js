/* SpireWrought Map Forge V3.2 — original, editable terrain and village artwork.
 * Zero licensed images: source data remains editable as polylines and building objects.
 * All coordinates are source-map pixels (1254 × 1254 for Forest Kit worlds).
 */
(function(root){'use strict';
const SIZE=1254;
const clamp=(x,a,b)=>Math.max(a,Math.min(b,x));
function hash(...args){let v=0x6d2b79f5;for(const a of args){v^=(Number(a)||0)+0x9e3779b9+(v<<6)+(v>>>2);v=Math.imul(v^(v>>>16),0x85ebca6b)}return (v^(v>>>16))>>>0}
function random(...args){return hash(...args)/4294967296}
function endpoint(direction,t){switch(direction){case'N':return[Math.round(t*SIZE),0];case'S':return[Math.round(t*SIZE),SIZE];case'E':return[SIZE,Math.round(t*SIZE)];default:return[0,Math.round(t*SIZE)]}}
function onSegment(p,a,b,width){const dx=b[0]-a[0],dy=b[1]-a[1],len=dx*dx+dy*dy,t=len?clamp(((p[0]-a[0])*dx+(p[1]-a[1])*dy)/len,0,1):0;return Math.hypot(p[0]-a[0]-t*dx,p[1]-a[1]-t*dy)<width}
function closeToPaths(paths,x,y,padding){const p=[x,y];for(const path of paths)for(let i=1;i<path.points.length;i++)if(onSegment(p,path.points[i-1],path.points[i],(path.width||60)/2+padding))return true;return false}
function pathsFor(feature,kind,seed){const entries=Object.entries(feature?.[kind]||{}).filter(([d,t])=>['N','S','E','W'].includes(d)&&Number.isFinite(+t));if(!entries.length)return[];
 const edges=entries.map(([d,t])=>endpoint(d,clamp(+t,.02,.98)));
 const links=edges.length===2?[[edges[0],edges[1]]]:edges.map(e=>[[SIZE/2,SIZE/2],e]);
 return links.map(([start,end],i)=>{
  const points=[start];const length=Math.hypot(end[0]-start[0],end[1]-start[1]);const pieces=Math.max(5,Math.ceil(length/65));
  for(let j=1;j<pieces;j++){const t=j/pieces,fade=Math.sin(t*Math.PI),offset=(random(seed,kind==='river'?23:17,i,j)-.5)*42*fade,dx=end[0]-start[0],dy=end[1]-start[1],ln=Math.max(1,length);points.push([Math.round(start[0]+dx*t-dy/ln*offset),Math.round(start[1]+dy*t+dx/ln*offset)])}
  points.push(end);
  return {kind:kind==='river'?'river':'road',width:kind==='river'?110:64,points,source:'generated',id:kind+'-'+i};
 });
}
function villageBuildings(feature,paths,seed){if(!feature?.settlement)return[];
 const out=[],isVillage=feature.settlement==='village',limit=isVillage?9:5;
 for(let i=0;i<limit;i++){
  const angle=i*2.399963+random(seed,i,32)*.23,ring=170+Math.floor(i/5)*95+(random(seed,i,33)-.5)*24;
  let x=Math.round(SIZE/2+Math.cos(angle)*ring),y=Math.round(SIZE/2+Math.sin(angle)*ring);
  const width=i===0&&isVillage?120:64+Math.round(random(seed,i,44)*2)*16,height=i===0&&isVillage?98:58+Math.round(random(seed,i,45)*2)*12;
  if(x-width/2<45||x+width/2>SIZE-45||y-height/2<45||y+height/2>SIZE-45||closeToPaths(paths.filter(p=>p.kind==='river'),x,y,72))continue;
  out.push({id:'house-'+i,x,y,w:width,h:height,kind:i===0&&isVillage?'hall':i%3===0?'workshop':i%2?'cottage':'hut',roof:i%3,source:'generated'});
 }
 return out;
}
function fromPlan(feature,seed=412038){const paths=[...pathsFor(feature,'river',seed),...pathsFor(feature,'roads',seed)];
 const buildings=feature?.buildingsEnabled!==false?villageBuildings(feature,paths,seed):[];
 const clearings=feature?.settlement&&feature?.buildingsEnabled!==false?[{x:SIZE/2,y:SIZE/2,rx:335,ry:300,source:'generated'}]:[];
 if(buildings.length&&feature?.roadsEnabled!==false){ // A village without a main road still has local walkways.
  for(const [i,building]of buildings.entries())paths.push({id:'village-path-'+i,kind:'road',width:25,source:'generated',points:[[SIZE/2,SIZE/2],[building.x,building.y+building.h/2+5]]});
 }
 return {format:'spirewrought-terrain-design',version:1,size:[SIZE,SIZE],seed,paths,buildings,clearings,roadsEnabled:!!Object.keys(feature?.roads||{}).length||!!buildings.length,riversEnabled:!!Object.keys(feature?.river||{}).length,villageEnabled:!!feature?.settlement&&feature?.buildingsEnabled!==false};
}
function clone(design){return JSON.parse(JSON.stringify(design||fromPlan(null)))}
function valid(design){return !!(design&&design.format==='spirewrought-terrain-design'&&Array.isArray(design.paths)&&Array.isArray(design.buildings)&&Array.isArray(design.clearings))}
function trace(ctx,points,sx,sy){if(!points?.length)return;ctx.beginPath();ctx.moveTo(points[0][0]*sx,points[0][1]*sy);for(let i=1;i<points.length;i++)ctx.lineTo(points[i][0]*sx,points[i][1]*sy)}
function drawClearings(d,ctx,sx,sy){for(const clearing of d.clearings||[]){const x=clearing.x*sx,y=clearing.y*sy;ctx.save();ctx.fillStyle='rgba(114,137,77,.77)';ctx.beginPath();ctx.ellipse(x,y,clearing.rx*sx,clearing.ry*sy,0,0,Math.PI*2);ctx.fill();ctx.fillStyle='rgba(170,156,104,.25)';ctx.beginPath();ctx.ellipse(x,y,clearing.rx*sx*.69,clearing.ry*sy*.69,0,0,Math.PI*2);ctx.fill();ctx.restore();}}
function drawPath(d,ctx,sx,sy,type){const basis=Math.min(sx,sy);
 for(const [i,path]of (d.paths||[]).entries()){
  if(path.kind!==type||!Array.isArray(path.points)||path.points.length<2)continue;
  const width=clamp(+path.width||60,10,240)*basis;
  ctx.save();ctx.lineJoin='round';ctx.lineCap='round';
  const paints=type==='river'?[[1.4,'#294a4d'],[1.22,'#56826d'],[1,'#36728b'],[.72,'#478ea6'],[.17,'#8ec4cf']]:[[1.31,'#38382e'],[1.13,'#716047'],[1,'#ac9061'],[.72,'#c0a477']];
  for(const [factor,color] of paints){trace(ctx,path.points,sx,sy);ctx.strokeStyle=color;ctx.lineWidth=Math.max(1,width*factor);ctx.stroke()}
  // Individually positioned original surface flecks, deterministic across redraws.
  const first=path.points[0],last=path.points[path.points.length-1],len=Math.hypot(last[0]-first[0],last[1]-first[1]);
  for(let n=0;n<Math.min(130,Math.max(4,Math.ceil(len/12)));n++){
   const segment=n%Math.max(1,path.points.length-1),a=path.points[segment],b=path.points[segment+1],t=random(d.seed,i,n,41),x=a[0]+(b[0]-a[0])*t,y=a[1]+(b[1]-a[1])*t;
   ctx.fillStyle=type==='river'?'rgba(193,233,239,.44)':'rgba(79,67,46,.36)';
   ctx.fillRect(Math.round((x+(random(d.seed,i,n,42)-.5)*path.width*.45)*sx),Math.round((y+(random(d.seed,i,n,43)-.5)*path.width*.45)*sy),Math.max(1,2*basis),Math.max(1,2*basis));
  }
  ctx.restore();
 }
}
function drawHouse(ctx,b,sx,sy){const x=Math.round((b.x-b.w/2)*sx),y=Math.round((b.y-b.h/2)*sy),w=Math.max(4,Math.round(b.w*sx)),h=Math.max(4,Math.round(b.h*sy));
 const unit=Math.max(1,Math.round(Math.min(sx,sy)*3));
 const roofs=['#845041','#68606b','#6e794b'];let roof=roofs[(b.roof||0)%roofs.length];
 ctx.save();ctx.fillStyle='#20272a';ctx.fillRect(x-2*unit,y+4*unit,w+4*unit,h);
 ctx.fillStyle='#c5aa7e';ctx.fillRect(x,y+Math.floor(h*.18),w,Math.floor(h*.76));
 ctx.fillStyle='#524639';ctx.fillRect(x+unit,y+Math.floor(h*.18),w-2*unit,unit);
 ctx.fillStyle=roof;ctx.fillRect(x-3*unit,y-2*unit,w+6*unit,Math.floor(h*.66));
 ctx.fillStyle='rgba(255,228,188,.2)';for(let v=0;v<4;v++)ctx.fillRect(x-2*unit,y+v*unit*3,w+4*unit,unit);
 ctx.fillStyle='#332b2a';ctx.fillRect(x+Math.floor(w*.41),y+Math.floor(h*.74),Math.round(w*.2),Math.floor(h*.26));
 ctx.fillStyle='#e6cb84';ctx.fillRect(x+Math.floor(w*.17),y+Math.floor(h*.61),Math.round(w*.16),Math.round(h*.12));
 ctx.fillRect(x+Math.floor(w*.70),y+Math.floor(h*.61),Math.round(w*.13),Math.round(h*.12));
 ctx.strokeStyle='#202b2d';ctx.lineWidth=unit;ctx.strokeRect(x-2*unit,y-2*unit,w+4*unit,Math.floor(h*.68));ctx.restore();
}
function drawBuildings(d,ctx,sx,sy){for(const b of (d.buildings||[]).slice().sort((a,b)=>a.y-b.y))drawHouse(ctx,b,sx,sy)}
function render(d,ctx,width=SIZE,height=SIZE,part='all'){
 if(!valid(d))return;const sx=width/SIZE,sy=height/SIZE;
 if(part==='all'||part==='clearings')drawClearings(d,ctx,sx,sy);
 if(part==='all'||part==='rivers')drawPath(d,ctx,sx,sy,'river');
 if(part==='all'||part==='roads')drawPath(d,ctx,sx,sy,'road');
 if(part==='all'||part==='buildings')drawBuildings(d,ctx,sx,sy);
}
function eraseNear(d,x,y,range=44){let removed=0;
 d.buildings=d.buildings.filter(b=>{const hit=Math.abs(b.x-x)<b.w/2+range&&Math.abs(b.y-y)<b.h/2+range;if(hit)removed++;return !hit});
 d.paths=d.paths.filter(path=>{let hit=false;for(let i=1;i<path.points.length;i++)if(onSegment([x,y],path.points[i-1],path.points[i],(path.width||60)/2+range)){hit=true;break}if(hit)removed++;return !hit});return removed;
}
function hitBuilding(d,x,y){for(let i=(d?.buildings?.length||0)-1;i>=0;i--){const b=d.buildings[i];if(Math.abs(x-b.x)<=b.w/2&&Math.abs(y-b.y)<=b.h/2)return i}return -1}
root.MapForgeTerrain=Object.freeze({SIZE,fromPlan,clone,valid,render,eraseNear,hitBuilding,closeToPaths});
})(typeof window!=='undefined'?window:globalThis);
