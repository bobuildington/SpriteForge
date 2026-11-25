/* SpireWrought Map Forge V3.1 advanced world planning.
 * Pure, deterministic: no licensed imagery and no network calls.
 * Planned paths are design layers, not part of Forest Map Kit's legacy Unity artwork.
 */
(function(root){'use strict';
const DIRS={N:[0,-1,'S'],E:[1,0,'W'],S:[0,1,'N'],W:[-1,0,'E']};
const coord=(x,y)=>x+','+y;
const clamp=(n,min,max)=>Math.max(min,Math.min(max,n));
function hash(seed,...parts){let h=(seed>>>0)^0x9e3779b9;for(const value of parts){h^=(Number(value)|0)+0x9e3779b9+(h<<6)+(h>>>2);h=Math.imul(h^(h>>>16),0x85ebca6b);h=Math.imul(h^(h>>>13),0xc2b2ae35);}return(h^(h>>>16))>>>0;}
function rand(seed,...parts){return hash(seed,...parts)/4294967296;}
function sortedObject(obj){return Object.fromEntries(Object.entries(obj).sort(([a],[b])=>a.localeCompare(b,undefined,{numeric:true})));}
function link(plan,x,y,d,kind,seed){const dir=DIRS[d];const a=plan.cells[coord(x,y)],b=plan.cells[coord(x+dir[0],y+dir[1])];if(!a||!b||a.locked||b.locked)return false;
 const aIndex=y*plan.cols+x,bIndex=(y+dir[1])*plan.cols+x+dir[0],lo=Math.min(aIndex,bIndex),hi=Math.max(aIndex,bIndex);
 const t=0.36+rand(seed,lo,hi,kind==='river'?7:11)*0.28;
 a[kind][d]=t;b[kind][dir[2]]=t;return true;
}
function pathCells(plan,start,end,seed){if(!start||!end)return[];const k=c=>coord(c[0],c[1]),queue=[start],vis=new Set([k(start)]),prev=new Map(),directions=['E','S','N','W'].sort((a,b)=>hash(seed,a.charCodeAt(0))-hash(seed,b.charCodeAt(0)));
 while(queue.length){const cur=queue.shift();if(k(cur)===k(end)){const out=[cur];let v=k(cur);while(prev.has(v)){const z=prev.get(v);out.push(z);v=k(z)}return out.reverse()}
  for(const d of directions){const [dx,dy]=DIRS[d],x=cur[0]+dx,y=cur[1]+dy,c=plan.cells[coord(x,y)];if(!c||c.locked||vis.has(coord(x,y)))continue;vis.add(coord(x,y));prev.set(coord(x,y),cur);queue.push([x,y]);}}
 return[];
}
function addPath(plan,coords,kind,seed){for(let i=1;i<coords.length;i++){const [x,y]=coords[i-1],[xx,yy]=coords[i];const d=xx>x?'E':xx<x?'W':yy>y?'S':'N';link(plan,x,y,d,kind,seed)}}
function generate(options={},existing={}){
 const cols=clamp(Math.floor(+options.cols||5),1,12),rows=clamp(Math.floor(+options.rows||5),1,12),seed=(Number(options.seed)||412038)>>>0;
 const density=!options.enableRoads?'off':(['off','main','network'].includes(options.roads)?options.roads:'main'),river=!!options.river,settlements=options.villages===false?0:clamp(Math.round(+options.settlements||0),0,12);
 const regionMode=['mixed','forest','wild'].includes(options.biomes)?options.biomes:'mixed';
 const plan={format:'spirewrought-world-plan',version:1,cols,rows,seed,roadsMode:density,roadsEnabled:density!=='off',riverEnabled:river,villagesEnabled:options.villages!==false,buildingsEnabled:options.buildings!==false,settlements,biomes:regionMode,cells:{}};
 const anchors=[...Array(regionMode==='forest'?2:Math.max(3,Math.ceil(cols*rows/12)))].map((_,i)=>({x:rand(seed,7,i)*cols,y:rand(seed,9,i)*rows,biome:(regionMode==='forest'?['forest','dense']:regionMode==='wild'?['dense','mystic','ruins','clearing','forest']:['forest','dense','clearing','mystic','ruins'])[i%(regionMode==='forest'?2:5)]}));
 for(let y=0;y<rows;y++)for(let x=0;x<cols;x++){
  const k=coord(x,y),old=existing?.cells?.[k];
  let biome='forest',best=Infinity;for(let i=0;i<anchors.length;i++){const anchor=anchors[i],dist=(x+.5-anchor.x)**2+(y+.5-anchor.y)**2+rand(seed,x,y,i)*1.9;if(dist<best){best=dist;biome=anchor.biome}}
  const locked=!!(old?.locked||options.locks?.[k]);
  plan.cells[k]=locked&&old?{...old,locked:true,roads:{...(old.roads||{})},river:{...(old.river||{})}}:{biome,settlement:null,landmark:null,roads:{},river:{},buildingsEnabled:plan.buildingsEnabled,roadsEnabled:plan.roadsEnabled,locked};
 }
 // Existing locked squares retain their already-authored exits. Adjacent unlocked
 // squares inherit matching endpoints, preventing an accidental border seam.
 for(let y=0;y<rows;y++)for(let x=0;x<cols;x++){
  const c=plan.cells[coord(x,y)];if(!c.locked)continue;
  for(const kind of ['roads','river'])for(const[d,t]of Object.entries(c[kind]||{})){
   const axis=DIRS[d];if(!axis)continue;
   const neighbor=plan.cells[coord(x+axis[0],y+axis[1])];
   if(neighbor&&!neighbor.locked)neighbor[kind][axis[2]]=t;
  }
 }
 // Town sites are deterministic but spread apart; completed/locked cells are not changed.
 let sites=[];const candidates=[];for(let y=0;y<rows;y++)for(let x=0;x<cols;x++)if(!plan.cells[coord(x,y)].locked)candidates.push([x,y]);
 while(sites.length<settlements&&candidates.length){let best=null,bestScore=-Infinity;for(const c of candidates){const [x,y]=c,dist=sites.length?Math.min(...sites.map(z=>(z[0]-x)**2+(z[1]-y)**2)):((cols-1)/2-x)**2+((rows-1)/2-y)**2;
  const preferred=sites.length?dist:-dist,noise=rand(seed,x,y,55)*1.2;
  const biome=plan.cells[coord(x,y)].biome,score=preferred+noise+(biome==='clearing'?0.8:0);if(score>bestScore){bestScore=score;best=c}}
  if(!best)break;sites.push(best);candidates.splice(candidates.findIndex(c=>c[0]===best[0]&&c[1]===best[1]),1);plan.cells[coord(...best)].settlement=sites.length===1?'village':'outpost';plan.cells[coord(...best)].buildingsEnabled=plan.buildingsEnabled;
 }
 // Distinct landmark sites; no invented kit images are required to show these symbols.
 const numLandmarks=Math.min(6,Math.max(1,Math.round(cols*rows/10)));
 const landCandidates=candidates.filter(([x,y])=>!plan.cells[coord(x,y)].locked&&rand(seed,x,y,73)>.15).sort((a,b)=>rand(seed,a[0],a[1],77)-rand(seed,b[0],b[1],77));
 for(const [x,y]of landCandidates.slice(0,numLandmarks)){const c=plan.cells[coord(x,y)];c.landmark=c.biome==='mystic'?'shrine':c.biome==='ruins'?'ruins':'landmark'}
 if(density!=='off'){
   let nodes=sites.slice();const free=candidates.filter(([x,y])=>!plan.cells[coord(x,y)].locked);
   if(!nodes.length&&free.length)nodes=[[...free].sort((a,b)=>(a[0]-(cols-1)/2)**2+(a[1]-(rows-1)/2)**2-((b[0]-(cols-1)/2)**2+(b[1]-(rows-1)/2)**2))[0]];
   // Connect settlements to the nearest existing road node via shortest unlocked paths.
   const linked=[];if(nodes.length)linked.push(nodes.shift());
   while(nodes.length){let best=null;for(const b of nodes)for(const a of linked){const p=pathCells(plan,a,b,seed);if(p.length&&(!best||p.length<best.path.length))best={a,b,path:p}}if(!best)break;addPath(plan,best.path,'roads',seed);linked.push(best.b);nodes.splice(nodes.indexOf(best.b),1)}
   // A main road enters from the western edge, through a planned settlement/center.
   const freeLeft=[...Array(rows)].map((_,y)=>[0,y]).filter(([x,y])=>!plan.cells[coord(x,y)].locked);
   if(freeLeft.length){const entrance=freeLeft.sort((a,b)=>Math.abs(a[1]-(rows-1)/2)-Math.abs(b[1]-(rows-1)/2))[0],target=linked[0]||entrance;
    const p=pathCells(plan,entrance,target,seed);addPath(plan,p,'roads',seed);plan.cells[coord(...entrance)].roads.W=.5;
    if(density==='network'){const freeRight=[...Array(rows)].map((_,y)=>[cols-1,y]).filter(([x,y])=>!plan.cells[coord(x,y)].locked);
     if(freeRight.length){const end=freeRight.sort((a,b)=>Math.abs(a[1]-(rows-1)/2)-Math.abs(b[1]-(rows-1)/2))[0];addPath(plan,pathCells(plan,target,end,seed),'roads',seed);plan.cells[coord(...end)].roads.E=.5}
    }
   }
 }
 if(river){
  const freeTop=[...Array(cols)].map((_,x)=>[x,0]).filter(([x,y])=>!plan.cells[coord(x,y)].locked),freeBottom=[...Array(cols)].map((_,x)=>[x,rows-1]).filter(([x,y])=>!plan.cells[coord(x,y)].locked);
  if(freeTop.length&&freeBottom.length){const start=freeTop[Math.floor(rand(seed,91)*freeTop.length)],end=freeBottom[Math.floor(rand(seed,93)*freeBottom.length)];const cells=pathCells(plan,start,end,seed^0xa1144);addPath(plan,cells,'river',seed);if(cells.length){plan.cells[coord(...start)].river.N=.5;plan.cells[coord(...end)].river.S=.5}}
 }
 plan.cells=sortedObject(plan.cells);return plan;
}
function endpoint(d,t,w,h){if(d==='N')return [t*w,0];if(d==='S')return[t*w,h];if(d==='E')return[w,t*h];return[0,t*h]}
function pathways(feature,ctx,width,height,options={}){
 if(!feature)return;const routes=[['river','#294a50','#367f95','#77acb5',.072],['roads','#453e31','#967c57','#c5a778',.044]];
 for(const [kind,border,color,center,amount] of routes){const ends=Object.entries(feature[kind]||{}).filter(([d,t])=>DIRS[d]&&Number.isFinite(+t)).map(([d,t])=>endpoint(d,clamp(+t,.05,.95),width,height));if(!ends.length)continue;
  const hub=[width*.5,height*.5],pairs=ends.length===2?[[ends[0],ends[1]]]:ends.map(e=>[hub,e]);
  for(const [a,b]of pairs){const draw=()=>{ctx.beginPath();ctx.moveTo(...a);if(ends.length===2){const bend=(a[0]+b[0])/2+(hash(1829,Math.round(a[0]),Math.round(b[0]))%2?1:-1)*width*.045;ctx.quadraticCurveTo(bend,(a[1]+b[1])/2,b[0],b[1]);}else ctx.quadraticCurveTo(hub[0],hub[1],b[0],b[1])};
   ctx.save();ctx.lineJoin='round';ctx.lineCap='round';for(const [thickness,paint] of [[1.35,border],[1,color],[.22,center]]){draw();ctx.strokeStyle=paint;ctx.lineWidth=Math.max(.9,Math.min(width,height)*amount*thickness);ctx.stroke()}ctx.restore();}
 }
 if(feature.settlement||feature.landmark){const x=width*.5,y=height*.5;
  ctx.save();ctx.fillStyle=feature.settlement?'#f3cb86':'#a5d4cc';ctx.strokeStyle='#263744';ctx.lineWidth=Math.max(1,width*.015);ctx.beginPath();ctx.arc(x,y,Math.max(4,Math.min(width,height)*.057),0,2*Math.PI);ctx.fill();ctx.stroke();ctx.restore();}
}
function nearPath(feature,x,y,size=1254){if(!feature)return false;for(const [kind,width]of[['roads',66],['river',102]]){const ends=Object.entries(feature[kind]||{}).filter(([d,t])=>DIRS[d]).map(([d,t])=>endpoint(d,+t,size,size));if(!ends.length)continue;const parts=ends.length===2?[[ends[0],ends[1]]]:ends.map(pt=>[[size/2,size/2],pt]);for(const [a,b]of parts){const dx=b[0]-a[0],dy=b[1]-a[1],len=dx*dx+dy*dy,t=len?clamp(((x-a[0])*dx+(y-a[1])*dy)/len,0,1):0;if(Math.hypot(x-a[0]-dx*t,y-a[1]-dy*t)<width)return true}}
 if(feature.settlement&&Math.hypot(x-size/2,y-size/2)<170)return true;
 return false;
}
function audit(plan){const failures=[];if(!plan?.cells)return ['Missing plan cells'];for(const [key,c]of Object.entries(plan.cells))for(const type of ['roads','river'])for(const[d,t]of Object.entries(c[type]||{})){const [x,y]=key.split(',').map(Number),dir=DIRS[d];if(!dir){failures.push('Invalid '+d);continue}const other=plan.cells[coord(x+dir[0],y+dir[1])];if(other&&Math.abs((other[type]||{})[dir[2]]-t)>1e-6)failures.push(`Unmatched ${type} at ${key}.${d}`)}return failures;}
root.MapForgeWorldPlanner=Object.freeze({generate,render:pathways,nearPath,audit,coordinate:coord});
})(typeof window!=='undefined'?window:globalThis);
