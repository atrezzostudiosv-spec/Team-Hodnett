/* ATREZZO | Sharon's Story: safe YouTube playback and original pinned Team scene.
 *
 * Never expose a failed YouTube iframe. The editorial still remains visible
 * until YouTube's IFrame API confirms that actual video playback has started.
 * This prevents third-party "video unavailable" text appearing in the design.
 */
(()=>{
 'use strict';
 const host=document.querySelector('[data-sharon-film]');
 const teamRoot=document.querySelector('[data-team-scroll]');
 const motion=matchMedia('(prefers-reduced-motion: reduce)');
 const mobile=matchMedia('(max-width:767px)');
 const reduced=()=>motion.matches||document.body.classList.contains('reduced-motion');

 // Original The Hodnett Team visual behavior: native full-bleed sticky panel,
 // slow zoom tied to scrolling, and staggered editorial copy reveal.
 if(teamRoot){
  const scene=teamRoot.querySelector('[data-team-scene]');
  let active=false,frame=0;
  function draw(){
   frame=0;
   if(!active||!scene)return;
   const viewport=scene.querySelector('.connection-viewport');
   const sticky=viewport&&getComputedStyle(viewport).position==='sticky';
   const hold=sticky?Math.max(1,scene.offsetHeight-viewport.offsetHeight):1;
   const progress=sticky?Math.min(1,Math.max(0,-scene.getBoundingClientRect().top/hold)):0;
   scene.style.setProperty('--team-scale',String(reduced()?1:1+progress*.055));
   const rect=scene.getBoundingClientRect();
   if(rect.top<innerHeight*.85&&rect.bottom>0)scene.classList.add('is-entered');
   if(rect.top<innerHeight*.58||reduced())scene.classList.add('is-copy-ready');
  }
  function schedule(){if(!frame)frame=requestAnimationFrame(draw);}
  const seen=new IntersectionObserver(entries=>{
   active=entries.some(entry=>entry.isIntersecting);
   if(active)schedule();
  },{rootMargin:'110px 0px'});
  seen.observe(teamRoot);
  const sync=()=>{
   teamRoot.classList.toggle('is-reduced',reduced());
   if(reduced())scene?.classList.add('is-entered','is-copy-ready');
   schedule();
  };
  addEventListener('scroll',schedule,{passive:true});
  addEventListener('resize',schedule,{passive:true});
  addEventListener('pageshow',schedule);
  motion.addEventListener('change',sync);
  new MutationObserver(sync).observe(document.body,{attributes:true,attributeFilter:['class']});
  teamRoot.classList.add('is-enhanced');
  sync();
 }
 if(!host)return;

 // The source exists as a link in the original site's film archive, but
 // the owner/browser can block embedding. Start invisibly; reveal only on
 // YT.PlayerState.PLAYING, and keep the still whenever embedding fails.
 const id=host.dataset.videoId||'';
 if(!/^[\w-]{11}$/.test(id))return;
 const root=host.closest('.connection-film');
 const link=root?.querySelector('[data-sharon-film-link]');
 const browserSaveData=Boolean(navigator.connection?.saveData);
 const allowed=()=>!mobile.matches&&!reduced()&&!browserSaveData&&!document.hidden;
 let player=null,visible=false,loading=false,failed=false,played=false,watchdog=0;
 let scriptPromise=null;
 const safeLink=()=>{
  if(!link)return;
  link.href=document.body.dataset.base+'vlog/';
  link.removeAttribute('target');
  link.removeAttribute('rel');
  link.setAttribute('aria-label',"Explore Sharon Hodnett's original film archive");
  link.innerHTML='Explore Sharon’s films <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M5 19 19 5M5 5h14v14"/></svg>';
 };
 const filmLink=()=>{
  const external=link?.dataset.filmUrl;
  if(!external||!/^https:\/\/www\.youtube\.com\/watch\?v=[\w-]{11}$/.test(external))return;
  link.href=external;
  link.target='_blank';
  link.rel='noopener noreferrer';
  link.setAttribute('aria-label',"Watch Sharon Hodnett's original film on YouTube");
  link.innerHTML='Watch the full film <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M5 19 19 5M5 5h14v14"/></svg>';
 };
 function destroy(){
  clearTimeout(watchdog);
  host.classList.remove('is-playing');
  try{player?.destroy();}catch{}
  player=null;
  host.replaceChildren();
  loading=false;played=false;
  safeLink();
 }
 function fail(){
  failed=true;
  destroy();
 }
 function loadApi(){
  if(window.YT?.Player)return Promise.resolve(window.YT);
  if(scriptPromise)return scriptPromise;
  scriptPromise=new Promise((resolve,reject)=>{
   let finished=false;
   const complete=(yes)=>{
    if(finished)return;
    finished=true;clearTimeout(timeout);
    if(yes&&window.YT?.Player)resolve(window.YT);else reject(new Error('YouTube API unavailable'));
   };
   const previous=window.onYouTubeIframeAPIReady;
   window.onYouTubeIframeAPIReady=()=>{
    try{if(typeof previous==='function')previous();}catch{}
    complete(true);
   };
   const js=document.createElement('script');
   js.src='https://www.youtube.com/iframe_api';
   js.async=true;
   js.onerror=()=>complete(false);
   document.head.append(js);
   const timeout=setTimeout(()=>complete(false),10000);
  });
  return scriptPromise;
 }
 async function start(){
  if(player||loading||failed||!visible||!allowed())return;
  loading=true;
  try{
   const YT=await loadApi();
   if(!visible||!allowed()||failed){loading=false;return;}
   const element=document.createElement('div');
   host.append(element);
   player=new YT.Player(element,{
    videoId:id,
    host:'https://www.youtube-nocookie.com',
    playerVars:{
     autoplay:1,mute:1,loop:1,playlist:id,playsinline:1,
     controls:0,disablekb:1,rel:0,iv_load_policy:3,enablejsapi:1,
     origin:location.origin
    },
    events:{
     onReady:event=>{
      if(!visible||!allowed()){destroy();return;}
      try{event.target.mute();event.target.playVideo();}catch{fail();}
      // If autoplay is denied or the video is restricted, the still remains.
      watchdog=setTimeout(()=>{if(!played)fail();},12000);
     },
     onStateChange:event=>{
      if(event.data===YT.PlayerState.PLAYING){
       played=true;clearTimeout(watchdog);
       if(visible&&allowed()){host.classList.add('is-playing');filmLink();}
      }else if(event.data===YT.PlayerState.ENDED){
       try{event.target.seekTo(0,true);event.target.playVideo();}catch{}
      }
     },
     onError:fail
    }
   });
   loading=false;
  }catch{fail();}
 }
 function reconcile(){
  if(!visible||!allowed()){if(player||loading)destroy();return;}
  if(!failed)start();
 }
 const observer=new IntersectionObserver(entries=>{
  visible=entries.some(entry=>entry.isIntersecting&&entry.intersectionRatio>.1);
  reconcile();
 },{threshold:[0,.1,.25],rootMargin:'50px 0px'});
 observer.observe(root||host);
 motion.addEventListener('change',reconcile);
 mobile.addEventListener('change',reconcile);
 document.addEventListener('visibilitychange',reconcile);
 new MutationObserver(reconcile).observe(document.body,{attributes:true,attributeFilter:['class']});
 addEventListener('pagehide',destroy,{once:true});
 safeLink();
})();
