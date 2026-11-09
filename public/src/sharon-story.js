/* ATREZZO · The Hodnett Team's original cinematic full-bleed scene.
   Keep the native sticky hold, progressive scroll zoom and staggered reveal.
   No YouTube requests or background player on this page. */
(()=>{
 'use strict';
 const teamRoot=document.querySelector('[data-team-scroll]');
 if(!teamRoot)return;
 const scene=teamRoot.querySelector('[data-team-scene]');
 if(!scene)return;
 const motion=matchMedia('(prefers-reduced-motion: reduce)');
 const reduced=()=>motion.matches||document.body.classList.contains('reduced-motion');
 let active=false,frame=0;
 function draw(){
  frame=0;
  if(!active)return;
  const viewport=scene.querySelector('.connection-viewport');
  const pinned=viewport&&getComputedStyle(viewport).position==='sticky';
  const hold=pinned?Math.max(1,scene.offsetHeight-viewport.offsetHeight):1;
  const progress=pinned?Math.min(1,Math.max(0,-scene.getBoundingClientRect().top/hold)):0;
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
  if(reduced())scene.classList.add('is-entered','is-copy-ready');
  schedule();
 };
 addEventListener('scroll',schedule,{passive:true});
 addEventListener('resize',schedule,{passive:true});
 addEventListener('pageshow',schedule);
 motion.addEventListener('change',sync);
 new MutationObserver(sync).observe(document.body,{attributes:true,attributeFilter:['class']});
 teamRoot.classList.add('is-enhanced');
 sync();
})();
