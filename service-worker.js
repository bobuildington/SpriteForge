/* SpireWrought Map Forge V3.1 offline shell for Map Editor and World Grid.
 * Licensed Forest Kit files are private browser storage, never cached by this worker. */
const CACHE='spirewrought-mapforge-v3.1-desktop-world-plan';
const HOME=new URL('./index.html',self.registration.scope).href;
const WORLD=new URL('./world/index.html',self.registration.scope).href;
const ROOT_PATH=new URL('./',self.registration.scope).pathname;
const WORLD_PATH=new URL('./world/',self.registration.scope).pathname;
const WORLD_FILE_PATH=new URL('./world/index.html',self.registration.scope).pathname;
const ROOT_FILE_PATH=new URL('./index.html',self.registration.scope).pathname;
const OPTIONAL=['./manifest.webmanifest','./icon-192.png','./icon-512.png', './world/index.html','./shared/world-planner.js'];
self.addEventListener('install',event=>event.waitUntil((async()=>{
 const cache=await caches.open(CACHE);
 const response=await fetch(new Request(HOME,{cache:'reload'}));
 if(!response.ok)throw Error('Map Forge cannot be cached');
 await cache.put(HOME,response.clone());
 await Promise.allSettled(OPTIONAL.map(async path=>{
  const url=new URL(path,self.registration.scope).href;
  const response=await fetch(new Request(url,{cache:'reload'}));
  if(response.ok)await cache.put(url,response.clone());
 }));
 await self.skipWaiting();
})()));
self.addEventListener('activate',event=>event.waitUntil((async()=>{
 const keys=await caches.keys();
 await Promise.all(keys.filter(key=>key!==CACHE&&(key.startsWith('spirewrought-mapforge-')||key.startsWith('spirewrought-sprite-forge-'))).map(key=>caches.delete(key)));
 await self.clients.claim();
})()));
self.addEventListener('fetch',event=>{
 const request=event.request;
 if(request.method!=='GET')return;
 const url=new URL(request.url);
 if(url.origin!==self.location.origin)return;
 if(request.mode==='navigate'){
  event.respondWith((async()=>{
   const cache=await caches.open(CACHE);
   const target=url.pathname===ROOT_PATH||url.pathname===ROOT_FILE_PATH?HOME:url.pathname===WORLD_PATH||url.pathname===WORLD_FILE_PATH?WORLD:null;
   try{
    const response=await fetch(new Request(request,{cache:'no-store'}));
    if(target&&response.ok)await cache.put(target,response.clone());
    return response;
   }catch{
    const cached=target&&await cache.match(target);
    if(cached)return cached;
    return new Response('<h2>Map Forge is not cached yet</h2><p>Connect once to this HTTPS site to enable offline use.</p>',{status:503,headers:{'Content-Type':'text/html; charset=utf-8'}});
   }
  })());return;
 }
 event.respondWith((async()=>{
  const cache=await caches.open(CACHE),cached=await cache.match(request);
  if(cached)return cached;
  try{const response=await fetch(request);if(response.ok)await cache.put(request,response.clone());return response}
  catch{return Response.error()}
 })());
});
