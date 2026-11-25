'use strict';
const {contextBridge,ipcRenderer}=require('electron');
const commands=new Set(['open-kit','open-project','save-project','save-project-as','backup','export-world','undo','redo','world','map','studio','fit','zoom-in','zoom-out']);
contextBridge.exposeInMainWorld('mapForgeDesktop',Object.freeze({
 isDesktop:true,
 saveJson:args=>ipcRenderer.invoke('mapforge:save-json',args),
 openJson:()=>ipcRenderer.invoke('mapforge:open-json'),
 onCommand:callback=>{
  if(typeof callback!=='function')return;
  ipcRenderer.on('mapforge:command',(_,name)=>{if(commands.has(name))callback(name)})
 }
}));