(()=>{'use strict';
const bridge=window.mapForgeDesktop;
if(!bridge?.isDesktop||document.getElementById('mapforgeDesktopBar'))return;
const isWorld=location.pathname.includes('/world/');
document.body.classList.add('mapforge-desktop');
const css=document.createElement('style');
css.textContent=[
 'body.mapforge-desktop{min-width:860px;font-size:14px}',
 '.mapforge-desktop .top,.mapforge-desktop>header{display:none}',
 '#mapforgeDesktopBar{position:sticky;top:0;z-index:100;background:#111e2c;border-bottom:1px solid #506579;padding:9px 14px;display:flex;align-items:center;gap:9px;min-height:58px;box-shadow:0 4px 16px #0003}',
 '#mapforgeDesktopBar button{font-size:13px;padding:9px 13px;min-height:37px;border-radius:8px;white-space:nowrap}',
 '#mapforgeDesktopBar button:hover{border-color:#d6b387}',
 '#mapforgeDesktopBar .desktop-brand{font-size:15px;letter-spacing:.02em;margin-right:12px;flex-shrink:0}',
 '#mapforgeDesktopBar .desktop-brand b{color:#f1bd7c}',
 '#mapforgeDesktopBar .desktop-nav{display:flex;gap:5px}',
 '#mapforgeDesktopBar .desktop-nav button.selected{background:#2a544e;border-color:#a2ead3}',
 '#mapforgeDesktopBar .desktop-flex{flex:1}',
 '#mapforgeDesktopBar .desktop-file{background:#273b4d}',
 '#mapforgeDesktopBar #desktopSave{background:#e9b979;color:#1b2935;font-weight:800}',
 '#mapforgeDesktopBar #desktopFeedback{font-size:11px;color:#b4c7d7;max-width:240px;overflow:hidden;text-overflow:ellipsis;white-space:nowrap}',
 '.mapforge-desktop .layout,.mapforge-desktop .studio-workspace{max-width:none;grid-template-columns:350px minmax(0,1fr);padding:12px 15px;gap:13px}',
 '.mapforge-desktop .viewport{height:calc(100dvh - 205px);max-height:none;min-height:440px}',
 '.mapforge-desktop .palette{max-height:calc(100dvh - 440px);grid-template-columns:repeat(4,minmax(0,1fr))}',
 '.mapforge-desktop .workspace-switch{padding:8px 15px}',
 '.mapforge-desktop .studio-workspace{grid-template-columns:375px minmax(0,1fr)}',
 '.mapforge-desktop .studio-canvas-panel{min-height:580px}',
 '.mapforge-desktop main{max-width:none;grid-template-columns:minmax(0,1fr) 380px;padding:14px;gap:14px}',
 '.mapforge-desktop .world-shell{max-height:calc(100dvh - 200px);overflow:auto}',
 '.mapforge-desktop .world-grid{margin:auto}',
 '@media(max-width:1100px){#mapforgeDesktopBar .desktop-brand{display:none}#mapforgeDesktopBar #desktopFeedback{display:none}.mapforge-desktop .layout{grid-template-columns:305px minmax(0,1fr)}}'
].join('\n');
document.head.append(css);
const $=id=>document.getElementById(id);
const bar=document.createElement('div');bar.id='mapforgeDesktopBar';
bar.innerHTML='<span class="desktop-brand">SPIREWROUGHT <b>MAP FORGE</b> <small>DESKTOP</small></span>'+
'<nav class="desktop-nav"><button id="desktopWorld">▦ World Grid</button><button id="desktopMap">▣ Map Editor</button><button id="desktopStudio">✎ Tiles & Objects</button></nav>'+
'<span class="desktop-flex"></span><button class="desktop-file" id="desktopOpenKit">Open Forest Kit</button>'+
'<button class="desktop-file" id="desktopOpen">Open Project</button><button id="desktopSave">Save Project</button>'+
'<button class="desktop-file" id="desktopBackup">Full Backup</button><span id="desktopFeedback" role="status"></span>';
document.body.prepend(bar);
$('desktopWorld').classList.toggle('selected',isWorld);
$('desktopMap').classList.toggle('selected',!isWorld);
const feedback=msg=>{$('desktopFeedback').textContent=msg};
const click=id=>{const button=$(id);if(button){button.click();return true}return false};
const openMap=section=>{
 if(isWorld){location.href='../'+(section==='studio'?'#studio':'');return}
 if(section==='studio')click('workspaceStudio');else click('workspaceMap');
};
const run=async action=>{
 try{
  switch(action){
   case 'world':if(!isWorld)click('workspaceWorld');break;
   case 'map':openMap('map');break;
   case 'studio':openMap('studio');break;
   case 'open-kit':click('loadKit');break;
   case 'open-project':{
    if(isWorld){location.href='../#open-project';return}
    const opened=await bridge.openJson();if(!opened)return;
    const input=$('importProjectInput');if(!input)throw Error('Project import unavailable');
    const blob=new File([opened.content],opened.name,{type:'application/json'});
    const transfer=new DataTransfer();transfer.items.add(blob);input.files=transfer.files;
    input.dispatchEvent(new Event('change',{bubbles:true}));
    feedback('Opened '+opened.name);
    break;
   }
   case 'save-project':case 'save-project-as':{
    if(isWorld){location.href='../#save-project';return}
    const api=window.__mapForgeDesktopProject;if(!api)throw Error('Map Editor is not ready');
    const project=api.snapshot();
    const filename=(project.name||'Map Forge Map').replace(/[<>:"/\\|?*]/g,'_')+'.mapforge.json';
    const saved=await bridge.saveJson({kind:'map',suggestedName:filename,content:JSON.stringify(project,null,2),saveAs:action==='save-project-as'});
    if(saved?.saved){
     await api.saveCell().catch(err=>console.warn('World autosave:',err));
     feedback('Saved '+saved.path.split(/[\\/]/).pop());
    }
    break;
   }
   case 'backup':{
    if(isWorld){location.href='../#backup';return}
    const api=window.__mapForgeDesktopProject;if(!api)throw Error('Map Editor is not ready');
    const bundle=await api.fullBackup();
    const saved=await bridge.saveJson({kind:'backup',suggestedName:'spirewrought-mapforge-full-backup.json',content:JSON.stringify(bundle),saveAs:true});
    if(saved?.saved)feedback('Backup saved '+saved.path.split(/[\\/]/).pop());
    break;
   }
   case 'export-world':if(isWorld)click('exportWorld');else click('workspaceWorld');break;
   case 'undo':click('undo')||click('paintUndo');break;
   case 'redo':click('paintRedo');break;
   case 'fit':click(isWorld?'fitWorld':'fit');break;
   case 'zoom-in':click(isWorld?'fitWorld':'zoomIn');break;
   case 'zoom-out':click(isWorld?'fitWorld':'zoomOut');break;
  }
 }catch(error){feedback(error.message);console.error('Desktop command:',action,error)}
};
$('desktopWorld').onclick=()=>run('world');
$('desktopMap').onclick=()=>run('map');
$('desktopStudio').onclick=()=>run('studio');
$('desktopOpenKit').onclick=()=>run('open-kit');
$('desktopOpen').onclick=()=>run('open-project');
$('desktopSave').onclick=()=>run('save-project');
$('desktopBackup').onclick=()=>run('backup');
bridge.onCommand(run);
if(!isWorld){
 const hash=location.hash;
 if(['#studio','#open-project','#save-project','#backup'].includes(hash)){
  run(hash.slice(1));history.replaceState(null,'',location.pathname);
 }
}
})();