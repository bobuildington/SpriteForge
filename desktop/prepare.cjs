'use strict';
// Assemble the desktop app from the *current* GitHub Pages editor source.
// Do not fork the generator/export logic: desktop and web stay compatible.
const fs=require('node:fs');
const path=require('node:path');
const root=path.resolve(__dirname,'..');
const web=path.join(root,'web');
fs.mkdirSync(path.join(web,'world'),{recursive:true});
fs.mkdirSync(path.join(web,'shared'),{recursive:true});
fs.copyFileSync(path.join(root,'shared','world-planner.js'),path.join(web,'shared','world-planner.js'));
fs.copyFileSync(path.join(root,'shared','terrain-art.js'),path.join(web,'shared','terrain-art.js'));
let html=fs.readFileSync(path.join(root,'index.html'),'utf8');
let world=fs.readFileSync(path.join(root,'world','index.html'),'utf8');
const marker='renderPainter();renderAssetLibrary();pixelUndoUI();';
if(!html.includes(marker)||!html.includes("function recipe()")||!html.includes("async function saveWorldCell()"))
  throw Error('Map Editor changed; review desktop project-snapshot integration');
const injection=`
// Desktop-only snapshots for native Save/Save As. No filesystem APIs are exposed to this page.
if (window.mapForgeDesktop?.isDesktop) {
 window.__mapForgeDesktopProject={
  snapshot:()=>recipe(),
  fullBackup:async()=>{
   const active=recipe();await idbPut('projects','active',active);
   return {format:'spirewrought-mapforge-full-backup',version:1,active,
    savedMaps:s.savedMaps,originalAssets:s.customAssets,
    worldCells:await idbAll('world'),worldPlan:await idbGet('projects','world-generation-plan-v1'),createdAt:new Date().toISOString()};
  },
  saveCell:async()=>{await saveWorldCell();return recipe()}
 };
}
`;
html=html.replace(marker,marker+injection)
  .replace(/<title>SpireWrought Map Forge V[^<]+<\/title>/,
  '<title>SpireWrought Map Forge Desktop V3.2</title>');
world=world.replace('<title>SpireWrought Map Forge · World Grid</title>',
                    '<title>SpireWrought Map Forge Desktop · World Grid</title>');
fs.writeFileSync(path.join(web,'index.html'),html);
fs.writeFileSync(path.join(web,'world','index.html'),world);
for(const file of ['icon-192.png','icon-512.png','manifest.webmanifest']){
 fs.copyFileSync(path.join(root,file),path.join(web,file));
}
console.log('Prepared desktop Map Editor and World Grid from the current source.');
