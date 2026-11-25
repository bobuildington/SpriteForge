'use strict';
// Build the Windows editor from the current website sources to avoid forking the generator.
const fs=require('node:fs');
const path=require('node:path');
const root=path.resolve(__dirname,'..'), web=path.join(root,'web');
fs.mkdirSync(path.join(web,'world'),{recursive:true});
let html=fs.readFileSync(path.join(root,'index.html'),'utf8');
let world=fs.readFileSync(path.join(root,'world','index.html'),'utf8');
const marker='renderPainter();renderAssetLibrary();pixelUndoUI();';
if(!html.includes(marker)||!html.includes('function recipe()')||!html.includes('async function saveWorldCell()'))
 throw Error('Map Editor changed: check the desktop snapshot bridge');
const injection=String.raw`
// Native Save / Save As bridge — active only in the desktop app.
if(window.mapForgeDesktop?.isDesktop){
 window.__mapForgeDesktopProject={
  snapshot:()=>recipe(),
  fullBackup:async()=>{
   const active=recipe();await idbPut('projects','active',active);
   return {format:'spirewrought-mapforge-full-backup',version:1,active,
    savedMaps:s.savedMaps,originalAssets:s.customAssets,
    worldCells:await idbAll('world'),createdAt:new Date().toISOString()};
  },
  saveCell:async()=>{await saveWorldCell();return recipe()}
 };
}
`;
html=html.replace(marker,marker+injection)
 .replace(/<title>SpireWrought Map Forge V[^<]+<\/title>/,'<title>SpireWrought Map Forge Desktop V3.0</title>');
world=world.replace('<title>SpireWrought Map Forge · World Grid</title>','<title>SpireWrought Map Forge Desktop · World Grid</title>');
fs.writeFileSync(path.join(web,'index.html'),html);
fs.writeFileSync(path.join(web,'world','index.html'),world);
for(const file of ['icon-192.png','icon-512.png','manifest.webmanifest'])
 fs.copyFileSync(path.join(root,file),path.join(web,file));
console.log('Prepared desktop from current World Grid and Map Editor sources.');