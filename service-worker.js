/* SpireWrought Map Forge V2 — mobile offline shell. Licensed Forest Kit art is never cached by this service worker. */
const CACHE='spirewrought-mapforge-v2-tiles-objects';
const HOME=new URL('./index.html',self.registration.scope).href;
const OPTIONAL=['./manifest.webmanifest','./icon-192.png','./icon-512.png'];
self.addEventListener('install',event=>event.waitUntil((async()=>{
 const cache=await caches.open(CACHE);
 const response=await fetch(new Request(HOME,{cache:'reload'}));
 if(!response.ok)throw Error('Could not cache Map Forge');
 await cache.put(HOME,response.clone());
 await Promise.allSettled(OPTIONAL.map(async path=>{
   const url=new URL(path,self.registration.scope).href;
   const r=await fetch(new Request(url,{cache:'reload'}));
   if(r.ok)await cache.put(url,r.clone());
 }));
 await self.skipWaiting();
})()));
self.addEventListener('activate',event=>event.waitUntil((async()=>{
 const keys=await caches.keys();
 await Promise.all(keys.filter(key=>key!==CACHE&&(key.startsWith('spirewrought-sprite-forge-')||key.startsWith('spirewrought-mapforge-'))).map(key=>caches.delete(key)));
 await self.clients.claim();
})()));
self.addEventListener('fetch',event=>{
 const req=event.request;if(req.method!=='GET')return;const url=new URL(req.url);if(url.origin!==self.location.origin)return;
 if(req.mode==='navigate'){
   event.respondWith((async()=>{
     const cache=await caches.open(CACHE),cached=await cache.match(HOME);
     if(cached)return cached;
     try{const r=await fetch(req);if(r.ok)await cache.put(HOME,r.clone());return r}
     catch{return new Response('<h2>Map Forge is not cached yet</h2><p>Open this site once online to enable offline use.</p>',{status:503,headers:{'Content-Type':'text/html; charset=utf-8'}})}
   })());return;
 }
 event.respondWith((async()=>{
   const cache=await caches.open(CACHE),cached=await cache.match(req);
   if(cached)return cached;
   try{const r=await fetch(req);if(r.ok)await cache.put(req,r.clone());return r}
   catch{return Response.error()}
 })());
});
self.addEventListener('message',event=>{
 if(event.data?.type==='MAP_FORGE_OFFLINE_CHECK')event.waitUntil((async()=>{
   const cache=await caches.open(CACHE);
   event.ports?.[0]?.postMessage({ready:!!(await cache.match(HOME))});
 })());
});
