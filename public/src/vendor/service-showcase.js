/* ATREZZO SERVICE SHOWCASE 01 — original, dependency-free, native-scroll module.
   Public API: window.AtrezzoServiceShowcase.init(rootElement?); .destroy(rootElement?) */
(function(){'use strict';
 const mounted=new WeakMap();
 const reduced=()=>window.matchMedia('(prefers-reduced-motion: reduce)').matches;
 const $$=(root,sel)=>Array.from(root.querySelectorAll(sel));
 function mount(root){
  if(!root || mounted.has(root))return;
  const clean=[];
  root.classList.add('has-js');
  function listen(target,type,handler,opts){target.addEventListener(type,handler,opts);clean.push(()=>target.removeEventListener(type,handler,opts));}
  // 01. Atlas: observe reading positions, switch decorative stage. All copy remains in document.
  const atlas=root.querySelector('[data-atz-atlas]');
  if(atlas){
   const items=$$(atlas,'[data-atz-atlas-item]');
   const pics=$$(atlas,'[data-atz-atlas-photo]');
   const buttons=$$(atlas,'[data-atz-atlas-jump]');
   const title=atlas.querySelector('[data-atz-atlas-title]');
   const number=atlas.querySelector('[data-atz-atlas-number]');
   let active=-1, scheduled=false;
   function update(index){
    if(index===active||index<0||index>=items.length)return;
    active=index;
    pics.forEach((p,i)=>{p.classList.toggle('is-active',i===index);p.setAttribute('aria-hidden','true')});
    buttons.forEach((b,i)=>{if(i===index)b.setAttribute('aria-current','true');else b.removeAttribute('aria-current')});
    if(title)title.textContent=items[index].getAttribute('data-stage-title')||'';
    if(number)number.textContent=String(index+1).padStart(2,'0');
   }
   function calculate(){
    scheduled=false;
    if(window.innerWidth<768)return;
    const target=window.innerHeight*.5;
    let best=0,distance=Infinity;
    items.forEach((el,i)=>{const r=el.getBoundingClientRect();const center=(r.top+r.bottom)/2;const score=r.top<=target&&r.bottom>=target?0:Math.abs(center-target);if(score<distance){distance=score;best=i}});
    update(best);
   }
   const schedule=()=>{if(!scheduled){scheduled=true;requestAnimationFrame(calculate)}};
   listen(window,'scroll',schedule,{passive:true});listen(window,'resize',schedule,{passive:true});
   listen(window,'pageshow',schedule);
   buttons.forEach((b,i)=>listen(b,'click',()=>items[i]?.scrollIntoView({behavior:reduced()?'auto':'smooth',block:'center'})));
   update(0);schedule();
  }
  // 02. Focus: click or arrow-key selection, not wheel hijacking.
  const focus=root.querySelector('[data-atz-focus]');
  if(focus){
   const tabs=$$(focus,'[data-atz-focus-switch]');
   const photos=$$(focus,'[data-atz-focus-photo]');
   const panels=$$(focus,'[data-atz-focus-detail]');
   let active=0;
   const selected=focus.querySelector('[data-atz-focus-number]');
   function activate(i){
    if(i<0||i>=tabs.length)return;
    const old=active;active=i;
    tabs.forEach((b,n)=>b.setAttribute('aria-pressed',String(n===i)));
    photos.forEach((p,n)=>{p.classList.toggle('is-active',n===i);p.classList.toggle('is-leaving',n===old&&old!==i)});
    panels.forEach((p,n)=>{const on=n===i;p.classList.toggle('is-active',on);p.setAttribute('aria-hidden',String(!on));p.inert=!on});
    if(selected)selected.textContent=String(i+1).padStart(2,'0');
   }
   tabs.forEach((b,i)=>{
    listen(b,'click',()=>activate(i));
    listen(b,'keydown',e=>{if(e.key==='ArrowRight'||e.key==='ArrowDown'||e.key==='ArrowLeft'||e.key==='ArrowUp'){e.preventDefault();const next=(i+(e.key==='ArrowRight'||e.key==='ArrowDown'?1:-1)+tabs.length)%tabs.length;tabs[next].focus();activate(next)}});
   });activate(0);
  }
  // 03. Service panels: single selected full-bleed band, no trapped focus.
  const accord=root.querySelector('[data-atz-panels]');
  if(accord){
   const panels=$$(accord,'[data-atz-service-panel]');
   const buttons=panels.map(el=>el.querySelector('[data-atz-panel-toggle]'));
   function activate(i){
    panels.forEach((p,n)=>{
     const isActive=n===i;
     p.classList.toggle('is-active',isActive);
     const b=buttons[n];if(b)b.setAttribute('aria-expanded',String(isActive));
     const content=p.querySelector('[data-atz-panel-content]');
     if(content){content.inert=!isActive;content.setAttribute('aria-hidden',String(!isActive))}
    });
   }
   buttons.forEach((b,i)=>{
    if(!b)return;
    listen(b,'click',()=>activate(i));
    listen(b,'keydown',e=>{
      if(e.key==='ArrowRight'||e.key==='ArrowDown'||e.key==='ArrowLeft'||e.key==='ArrowUp'){
       e.preventDefault();const next=(i+(e.key==='ArrowRight'||e.key==='ArrowDown'?1:-1)+buttons.length)%buttons.length;
       buttons[next].focus();activate(next);
      }
    });
   });activate(0);
  }
  mounted.set(root,()=>{clean.forEach(fn=>fn());root.classList.remove('has-js');$$ (root,'[data-atz-focus-detail],[data-atz-panel-content]').forEach(n=>{n.inert=false;n.setAttribute('aria-hidden','false')})});
 }
 function destroy(root){if(!root)return;const fn=mounted.get(root);if(fn){fn();mounted.delete(root)}}
 function init(target=document){
  if(target.matches && target.matches('[data-atz-service-showcase]'))mount(target);
  else $$(target,'[data-atz-service-showcase]').forEach(mount);
 }
 window.AtrezzoServiceShowcase={init,destroy,version:'1.0.0'};
 if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',()=>init(),{once:true});
 else init();
})();
