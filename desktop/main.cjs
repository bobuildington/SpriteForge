'use strict';
const {app,BrowserWindow,Menu,ipcMain,dialog,protocol,net,shell}=require('electron');
const path=require('node:path');
const fs=require('node:fs');
const {pathToFileURL}=require('node:url');

// Keep the licensed Forest Kit outside the public repository and the installer.
protocol.registerSchemesAsPrivileged([{scheme:'mapforge',privileges:{standard:true,secure:true,supportFetchAPI:true,stream:true}}]);
let window=null;
const recentPaths=new Map();
const routes=new Set(['/','/index.html','/world/','/world/index.html','/manifest.webmanifest','/icon-192.png','/icon-512.png']);
function command(cmd){if(window&&!window.isDestroyed())window.webContents.send('mapforge:command',cmd)}
function menu(){
 return Menu.buildFromTemplate([
  {label:'File',submenu:[
   {label:'Open Forest Kit ZIP…',accelerator:'CmdOrCtrl+K',click:()=>command('open-kit')},
   {label:'Open Map Project…',accelerator:'CmdOrCtrl+O',click:()=>command('open-project')},
   {type:'separator'},
   {label:'Save Map Project',accelerator:'CmdOrCtrl+S',click:()=>command('save-project')},
   {label:'Save Map Project As…',accelerator:'CmdOrCtrl+Shift+S',click:()=>command('save-project-as')},
   {label:'Save Full Backup…',accelerator:'CmdOrCtrl+Alt+S',click:()=>command('backup')},
   {label:'Export Forest Kit World ZIP…',accelerator:'CmdOrCtrl+E',click:()=>command('export-world')},
   {type:'separator'},{role:'quit'}
  ]},
  {label:'Edit',submenu:[
   {label:'Undo Map Edit',accelerator:'CmdOrCtrl+Z',click:()=>command('undo')},
   {label:'Redo Pixel Edit',accelerator:'CmdOrCtrl+Shift+Z',click:()=>command('redo')},
   {type:'separator'},{role:'cut'},{role:'copy'},{role:'paste'},{role:'selectAll'}
  ]},
  {label:'Workspace',submenu:[
   {label:'World Grid',accelerator:'CmdOrCtrl+1',click:()=>command('world')},
   {label:'Map Editor',accelerator:'CmdOrCtrl+2',click:()=>command('map')},
   {label:'Tiles & Objects',accelerator:'CmdOrCtrl+3',click:()=>command('studio')},
   {type:'separator'},
   {label:'Fit to View',accelerator:'CmdOrCtrl+0',click:()=>command('fit')},
   {label:'Zoom In',accelerator:'CmdOrCtrl+Plus',click:()=>command('zoom-in')},
   {label:'Zoom Out',accelerator:'CmdOrCtrl+-',click:()=>command('zoom-out')}
  ]},
  {label:'View',submenu:[{role:'reload'},{role:'togglefullscreen'},{role:'resetZoom'},{role:'zoomIn'},{role:'zoomOut'}]},
  {label:'Help',submenu:[
   {label:'Desktop Instructions',click:()=>shell.openExternal('https://github.com/bobuildington/SpriteForge/blob/main/desktop/README.md')},
   {label:'GitHub Repository',click:()=>shell.openExternal('https://github.com/bobuildington/SpriteForge')}
  ]}
 ]);
}
async function createWindow(){
 window=new BrowserWindow({
  title:'SpireWrought Map Forge',width:1500,height:950,minWidth:960,minHeight:650,show:false,
  backgroundColor:'#101923',icon:path.join(app.getAppPath(),'web','icon-512.png'),
  webPreferences:{
   preload:path.join(app.getAppPath(),'desktop','preload.cjs'),
   contextIsolation:true,nodeIntegration:false,sandbox:true,webSecurity:true
  }
 });
 window.once('ready-to-show',()=>window?.show());
 window.webContents.setWindowOpenHandler(({url})=>{
  if(/^https:\/\/(github\.com|bobuildington\.github\.io)\//.test(url))shell.openExternal(url);
  return {action:'deny'}
 });
 window.webContents.on('will-navigate',(event,url)=>{
  try{
   const target=new URL(url);
   if(target.protocol!=='mapforge:'||target.hostname!=='app'||!routes.has(target.pathname)){
    event.preventDefault();
    if(target.protocol==='https:')shell.openExternal(target.href);
   }
  }catch{event.preventDefault()}
 });
 window.webContents.session.on('will-download',(event,item)=>{
  const filename=path.basename(item.getFilename()).replace(/[<>:"/\\|?*\x00-\x1f]/g,'_')||'MapForge-export';
  item.setSaveDialogOptions({
   title:'Save Map Forge export',defaultPath:path.join(app.getPath('documents'),filename)
  });
 });
 window.webContents.on('did-finish-load',async()=>{
  try{
   const source=fs.readFileSync(path.join(app.getAppPath(),'desktop','ui.js'),'utf8');
   await window.webContents.executeJavaScript(source);
  }catch(error){console.error('Desktop UI failed:',error)}
 });
 await window.loadURL('mapforge://app/index.html');
}
ipcMain.handle('mapforge:save-json',async(event,args)=>{
 if(!window||event.sender!==window.webContents)throw Error('Invalid window');
 const {kind,suggestedName,content,saveAs}=args||{};
 if(!['map','backup'].includes(kind)||typeof content!=='string'||content.length>256*1024*1024)throw Error('Invalid project data');
 try{JSON.parse(content)}catch{throw Error('Not valid JSON')}
 let file=!saveAs?recentPaths.get(kind):null;
 if(!file){
  const proposed=path.basename(String(suggestedName||'MapForge-project').replace(/[<>:"/\\|?*\x00-\x1f]/g,'_'));
  const r=await dialog.showSaveDialog(window,{
   title:kind==='map'?'Save Map Project':'Save Complete Backup',
   defaultPath:path.join(app.getPath('documents'),proposed.endsWith('.json')?proposed:proposed+'.json'),
   filters:[{name:'Map Forge JSON',extensions:['json']}]
  });
  if(r.canceled||!r.filePath)return {saved:false};
  file=r.filePath;
 }
 const temporary=file+'.mapforge-writing-'+process.pid;
 try{
  await fs.promises.writeFile(temporary,content,{encoding:'utf8'});
  await fs.promises.rename(temporary,file);
  recentPaths.set(kind,file);
  return {saved:true,path:file};
 }catch(error){
  await fs.promises.rm(temporary,{force:true}).catch(()=>{});
  throw error;
 }
});
ipcMain.handle('mapforge:open-json',async(event)=>{
 if(!window||event.sender!==window.webContents)throw Error('Invalid window');
 const r=await dialog.showOpenDialog(window,{
  title:'Open Map Forge Project',properties:['openFile'],filters:[{name:'Map Forge projects',extensions:['json']}]
 });
 if(r.canceled||!r.filePaths.length)return null;
 const file=r.filePaths[0],stat=await fs.promises.stat(file);
 if(stat.size>256*1024*1024)throw Error('Project file too large');
 const content=await fs.promises.readFile(file,'utf8');
 const parsed=JSON.parse(content);
 if(!['spirewrought-mapforge','spirewrought-mapforge-full-backup'].includes(parsed.format))throw Error('Not a Map Forge project');
 recentPaths.set(parsed.format==='spirewrought-mapforge-full-backup'?'backup':'map',file);
 return {name:path.basename(file),content};
});
app.whenReady().then(async()=>{
 protocol.handle('mapforge',request=>{
  try{
   const u=new URL(request.url);
   if(u.hostname!=='app'||!routes.has(u.pathname))return new Response('Not found',{status:404});
   const relative=u.pathname==='/'?'index.html':u.pathname==='/world/'?'world/index.html':u.pathname.slice(1);
   const root=path.resolve(app.getAppPath(),'web');
   const target=path.resolve(root,relative);
   if(!target.startsWith(root+path.sep))return new Response('Forbidden',{status:403});
   return net.fetch(pathToFileURL(target).toString());
  }catch{return new Response('Invalid path',{status:400})}
 });
 Menu.setApplicationMenu(menu());
 await createWindow();
});
app.on('window-all-closed',()=>{if(process.platform!=='darwin')app.quit()});
app.on('activate',()=>{if(BrowserWindow.getAllWindows().length===0)createWindow()});