'use strict';
// Licensed Forest Kit artwork is loaded by the editor at runtime; it is not bundled in this application.
const {app, BrowserWindow, Menu, ipcMain, dialog, protocol, net, shell} = require('electron');
const path = require('node:path');
const fs = require('node:fs');
const {pathToFileURL} = require('node:url');

protocol.registerSchemesAsPrivileged([{
  scheme: 'mapforge',
  privileges: { standard: true, secure: true, supportFetchAPI: true, stream: true }
}]);

let mainWindow = null;
const recentPaths = new Map();
const allowedPaths = new Set([
  '/', '/index.html', '/world/', '/world/index.html', '/shared/world-planner.js', '/manifest.webmanifest', '/icon-192.png', '/icon-512.png'
]);

function send(command) {
  if (mainWindow && !mainWindow.isDestroyed()) mainWindow.webContents.send('mapforge:command', command);
}

function buildMenu() {
  return Menu.buildFromTemplate([
    {label: 'File', submenu: [
      {label:'Open Forest Kit ZIP…', accelerator:'CmdOrCtrl+K', click:()=>send('open-kit')},
      {label:'Open Map Project…', accelerator:'CmdOrCtrl+O', click:()=>send('open-project')},
      {type:'separator'},
      {label:'Save Map Project', accelerator:'CmdOrCtrl+S', click:()=>send('save-project')},
      {label:'Save Map Project As…', accelerator:'CmdOrCtrl+Shift+S', click:()=>send('save-project-as')},
      {label:'Export Complete Project Backup…', accelerator:'CmdOrCtrl+Alt+S', click:()=>send('backup')},
      {label:'Export Forest Kit World ZIP…', accelerator:'CmdOrCtrl+E', click:()=>send('export-world')},
      {type:'separator'},
      {role:'quit'}
    ]},
    {label: 'Edit', submenu: [
      {label:'Undo Map Edit', accelerator:'CmdOrCtrl+Z', click:()=>send('undo')},
      {label:'Redo Pixel Edit', accelerator:'CmdOrCtrl+Shift+Z', click:()=>send('redo')},
      {type:'separator'},
      {role:'cut'}, {role:'copy'}, {role:'paste'}, {role:'selectAll'}
    ]},
    {label:'Workspace', submenu: [
      {label:'Plan World', accelerator:'CmdOrCtrl+Shift+P', click:()=>send('plan-world')},
      {label:'World Grid', accelerator:'CmdOrCtrl+1', click:()=>send('world')},
      {label:'Map Editor', accelerator:'CmdOrCtrl+2', click:()=>send('map')},
      {label:'Tiles & Objects', accelerator:'CmdOrCtrl+3', click:()=>send('studio')},
      {type:'separator'},
      {label:'Fit Map / World', accelerator:'CmdOrCtrl+0', click:()=>send('fit')},
      {label:'Zoom In', accelerator:'CmdOrCtrl+Plus', click:()=>send('zoom-in')},
      {label:'Zoom Out', accelerator:'CmdOrCtrl+-', click:()=>send('zoom-out')}
    ]},
    {label:'View', submenu:[
      {role:'reload'}, {role:'togglefullscreen'}, {role:'resetZoom'},
      {role:'zoomIn'}, {role:'zoomOut'}
    ]},
    {label:'Help', submenu: [
      {label:'Desktop README', click:()=>shell.openExternal('https://github.com/bobuildington/SpriteForge/blob/main/desktop/README.md')},
      {label:'GitHub Repository', click:()=>shell.openExternal('https://github.com/bobuildington/SpriteForge')}
    ]}
  ]);
}

async function createWindow() {
  mainWindow = new BrowserWindow({
    title: 'SpireWrought Map Forge',
    width: 1500, height: 950, minWidth: 960, minHeight: 650,
    show: false,
    backgroundColor: '#101923',
    icon: path.join(app.getAppPath(), 'web', 'icon-512.png'),
    webPreferences: {
      preload: path.join(app.getAppPath(), 'desktop', 'preload.cjs'),
      contextIsolation: true, nodeIntegration: false, sandbox: true,
      webSecurity: true
    }
  });
  mainWindow.once('ready-to-show',()=>mainWindow?.show());
  mainWindow.webContents.setWindowOpenHandler(({url})=>{
    if (/^https:\/\/(github\.com|bobuildington\.github\.io)\//.test(url)) shell.openExternal(url);
    return {action:'deny'};
  });
  mainWindow.webContents.on('will-navigate',(event,url)=>{
    try{
      const target=new URL(url);
      if(target.protocol!=='mapforge:'||target.hostname!=='app'||!allowedPaths.has(target.pathname)) {
        event.preventDefault();
        if(target.protocol==='https:') shell.openExternal(target.href);
      }
    }catch{event.preventDefault()}
  });
  // Blob exports (PNG, ZIP, JSON) continue to use the editor's original export code.
  // Show a native Save As chooser instead of silently dropping the files in Downloads.
  mainWindow.webContents.session.on('will-download',(event,item)=>{
    const original=path.basename(item.getFilename()).replace(/[<>:"/\\|?*\x00-\x1f]/g,'_')||'MapForge-export';
    item.setSaveDialogOptions({
      title:'Save Map Forge export',
      defaultPath:path.join(app.getPath('documents'),original)
    });
  });
  mainWindow.webContents.on('did-finish-load',async()=>{
    try{
      const code=fs.readFileSync(path.join(app.getAppPath(),'desktop','ui.js'),'utf8');
      await mainWindow.webContents.executeJavaScript(code);
    }catch(error){console.error('Desktop controls failed to load:',error)}
  });
  await mainWindow.loadURL('mapforge://app/index.html');
}

ipcMain.handle('mapforge:save-json',async (event,args)=>{
  if(!mainWindow || event.sender!==mainWindow.webContents) throw Error('Invalid window');
  const {kind, suggestedName, content, saveAs}=args||{};
  if(!['map','backup'].includes(kind)||typeof content!=='string'||content.length>256*1024*1024)
    throw Error('Invalid or excessively large project data');
  try {JSON.parse(content)} catch {throw Error('Project is not valid JSON')}
  let destination = !saveAs ? recentPaths.get(kind) : null;
  if(!destination){
    const name=path.basename(String(suggestedName||'MapForge-project').replace(/[<>:"/\\|?*\x00-\x1f]/g,'_'));
    const picked=await dialog.showSaveDialog(mainWindow,{
      title: kind==='map' ? 'Save Map Project' : 'Save Complete World Backup',
      defaultPath:path.join(app.getPath('documents'),name.endsWith('.json')?name:name+'.json'),
      filters:[{name:'Map Forge JSON',extensions:['json']}]
    });
    if(picked.canceled||!picked.filePath) return {saved:false};
    destination=picked.filePath;
  }
  // Write a temporary sibling first. A failed save must not truncate a previous project.
  const temporary=destination+'.mapforge-writing-'+process.pid;
  try {
    await fs.promises.writeFile(temporary,content,{encoding:'utf8',flag:'w'});
    await fs.promises.rename(temporary,destination);
    recentPaths.set(kind,destination);
    return {saved:true,path:destination};
  }catch(error){
    await fs.promises.rm(temporary,{force:true}).catch(()=>{});
    throw error;
  }
});

ipcMain.handle('mapforge:open-json',async (event)=>{
  if(!mainWindow || event.sender!==mainWindow.webContents) throw Error('Invalid window');
  const result=await dialog.showOpenDialog(mainWindow,{
    title:'Open Map Forge Project',
    properties:['openFile'],
    filters:[{name:'Map Forge projects',extensions:['json']}]
  });
  if(result.canceled||!result.filePaths.length) return null;
  const p=result.filePaths[0],stat=await fs.promises.stat(p);
  if(stat.size>256*1024*1024) throw Error('Project file is too large');
  const contents=await fs.promises.readFile(p,'utf8');
  const parsed=JSON.parse(contents);
  if(!['spirewrought-mapforge','spirewrought-mapforge-full-backup'].includes(parsed.format))
    throw Error('Not a Map Forge project JSON');
  recentPaths.set(parsed.format==='spirewrought-mapforge-full-backup'?'backup':'map',p);
  return {name:path.basename(p),content:contents};
});

app.whenReady().then(async()=>{
  protocol.handle('mapforge',request=>{
    try{
      const url=new URL(request.url);
      if(url.hostname!=='app'||!allowedPaths.has(url.pathname))
        return new Response('Not found',{status:404});
      const relative=url.pathname==='/' ? 'index.html' : url.pathname==='/world/' ? 'world/index.html' : url.pathname.replace(/^\//,'');
      const target=path.resolve(app.getAppPath(),'web',relative);
      const root=path.resolve(app.getAppPath(),'web');
      if(!target.startsWith(root+path.sep))return new Response('Forbidden',{status:403});
      return net.fetch(pathToFileURL(target).toString());
    }catch{return new Response('Invalid path',{status:400})}
  });
  Menu.setApplicationMenu(buildMenu());
  await createWindow();
});
app.on('window-all-closed',()=>{if(process.platform!=='darwin')app.quit()});
app.on('activate',()=>{if(BrowserWindow.getAllWindows().length===0)createWindow()});
