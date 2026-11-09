/* ATREZZO · experience numbers.
 * Counts are animated only when visible; the HTML always contains the actual
 * archived values, and each visual counter keeps its final ARIA label.
 */
export function parseCountValue(value){
 const original=String(value??'').trim();
 const match=original.match(/^([^\d]*)([\d,]+(?:\.\d+)?)(.*)$/s);
 if(!match)return null;
 const [,prefix,number,suffix]=match;
 const target=Number(number.replace(/,/g,''));
 if(!Number.isFinite(target)||target<0)return null;
 const decimals=(number.split('.')[1]||'').length;
 const formatter=new Intl.NumberFormat('en-US',{
  minimumFractionDigits:decimals,
  maximumFractionDigits:decimals
 });
 return {
  original,target,
  format(value){
   const n=Math.max(0,Math.min(target,value));
   return prefix+formatter.format(n)+suffix;
  }
 };
}

function initializeCounters(){
 const section=document.querySelector('[data-performance-section]');
 if(!section)return;
 const counters=[...section.querySelectorAll('[data-performance-count]')].map(element=>({
  element,parsed:parseCountValue(element.dataset.performanceCount)
 })).filter(entry=>entry.parsed);
 if(!counters.length||typeof IntersectionObserver!=='function')return;
 const motion=window.matchMedia('(prefers-reduced-motion: reduce)');
 let started=false;
 const finalize=()=>counters.forEach(({element,parsed})=>{element.textContent=parsed.original;});
 const play=()=>{
  if(started)return;
  started=true;observer.disconnect();
  if(motion.matches||document.body.classList.contains('reduced-motion')){
   finalize();
   return;
  }
  const duration=1800;
  let startTime=null;
  const tick=now=>{
   if(motion.matches||document.body.classList.contains('reduced-motion')){
    finalize();return;
   }
   if(startTime===null)startTime=now;
   const progress=Math.min(1,(now-startTime)/duration);
   const ease=1-Math.pow(1-progress,3);
   for(const {element,parsed} of counters){
    element.textContent=progress===1?parsed.original:parsed.format(parsed.target*ease);
   }
   if(progress<1)requestAnimationFrame(tick);
  };
  requestAnimationFrame(tick);
 };
 const observer=new IntersectionObserver(entries=>{
  if(entries.some(entry=>entry.isIntersecting))play();
 },{threshold:0.22,rootMargin:'0px 0px -5% 0px'});
 observer.observe(section);
}

if(typeof document!=='undefined'){
 if(document.readyState==='loading'){
  document.addEventListener('DOMContentLoaded',initializeCounters,{once:true});
 }else initializeCounters();
}
