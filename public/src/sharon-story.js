/* ATREZZO · Deferred cinematic film: real archived YouTube source.
 * No replay controls or sound in the background; real video remains available
 * through the explicit YouTube link. Reduced-motion and mobile use the still.
 */
(()=>{
 'use strict';
 const host=document.querySelector('[data-sharon-film]');
 if(!host)return;
 const id=host.dataset.videoId||'';
 if(!/^[\w-]{11}$/.test(id))return;
 const motion=matchMedia('(prefers-reduced-motion: reduce)');
 const mobile=matchMedia('(max-width:767px)');
 const saveData=Boolean(navigator.connection?.saveData);
 let frame=null,visible=false;
 const eligible=()=>!mobile.matches&&!motion.matches&&!document.body.classList.contains('reduced-motion')&&!saveData;
 function stop(){
  host.classList.remove('is-playing');
  if(frame){frame.remove();frame=null;}
 }
 function start(){
  if(frame||!visible||!eligible())return;
  const element=document.createElement('iframe');
  element.title='Silent background video featuring Sharon Hodnett';
  element.tabIndex=-1;
  element.setAttribute('aria-hidden','true');
  element.setAttribute('allow','autoplay; encrypted-media; picture-in-picture');
  element.setAttribute('referrerpolicy','strict-origin-when-cross-origin');
  element.setAttribute('loading','lazy');
  element.src='https://www.youtube-nocookie.com/embed/'+encodeURIComponent(id)+
   '?autoplay=1&mute=1&loop=1&playlist='+encodeURIComponent(id)+
   '&controls=0&playsinline=1&rel=0&iv_load_policy=3&disablekb=1';
  element.addEventListener('load',()=>{if(frame===element&&visible&&eligible())host.classList.add('is-playing');},{once:true});
  element.addEventListener('error',stop,{once:true});
  host.append(element);frame=element;
 }
 const reconcile=()=>{if(visible&&eligible())start();else stop();};
 const observer=new IntersectionObserver(entries=>{
  visible=entries.some(entry=>entry.isIntersecting&&entry.intersectionRatio>.1);
  reconcile();
 },{rootMargin:'50px 0px',threshold:[0,.1,.25,.5]});
 observer.observe(host.closest('.connection-film')||host);
 motion.addEventListener('change',reconcile);
 mobile.addEventListener('change',reconcile);
 new MutationObserver(reconcile).observe(document.body,{attributes:true,attributeFilter:['class']});
 addEventListener('pagehide',stop,{once:true});
})();
