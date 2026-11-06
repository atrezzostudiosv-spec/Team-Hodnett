/* ATREZZO · Hodnett Luxury. Original component integration and accessible filters. */
(()=>{'use strict';
 const $=(s,r=document)=>r.querySelector(s),$$=(s,r=document)=>[...r.querySelectorAll(s)];
 function initFilm(){
  const video=$('[data-hero-video]'),button=$('[data-hero-video-toggle]');if(!video||!button)return;
  const media=matchMedia('(prefers-reduced-motion: reduce)');let manualPause=false;
  const reduced=()=>media.matches||document.body.classList.contains('reduced-motion');
  const paint=()=>{if(reduced()){button.disabled=true;button.textContent='Motion reduced';button.setAttribute('aria-label','Background film paused for reduced motion');return;}button.disabled=false;button.innerHTML=video.paused?'Play film <span aria-hidden="true">▷</span>':'Pause film <span aria-hidden="true">Ⅱ</span>';button.setAttribute('aria-label',video.paused?'Play background film':'Pause background film');};
  const play=()=>{video.play().then(paint).catch(paint);};
  const sync=()=>{if(reduced()||manualPause||document.hidden)video.pause();else play();paint();};
  button.addEventListener('click',()=>{if(video.paused){manualPause=false;play();}else{manualPause=true;video.pause();}paint();});
  video.addEventListener('play',paint);video.addEventListener('pause',paint);media.addEventListener('change',sync);document.addEventListener('visibilitychange',sync);
  new MutationObserver(sync).observe(document.body,{attributes:true,attributeFilter:['class']});
  // Stop decoding the background film once the hero leaves the viewport.
  const visibility=new IntersectionObserver(entries=>{if(!entries[0].isIntersecting)video.pause();else sync();},{threshold:0});visibility.observe(video);
  sync();
 }
 function initPlaces(){const root=$('[data-place-index]');if(!root||!window.AtrezzoEditorialGallery01)return;const gallery=AtrezzoEditorialGallery01.init(root);const sync=()=>gallery.setReduced(document.body.classList.contains('reduced-motion')||matchMedia('(prefers-reduced-motion: reduce)').matches);new MutationObserver(sync).observe(document.body,{attributes:true,attributeFilter:['class']});sync();}
 function initConnectionStory(){
  const story=$('[data-connection-story]');if(!story)return;
  const scenes=$$('[data-connection-scene]',story),media=matchMedia('(prefers-reduced-motion: reduce)');let frame=0,near=true;
  const reduced=()=>media.matches||document.body.classList.contains('reduced-motion');
  function update(){
   frame=0;if(!near)return;
   const height=innerHeight,progress=Math.min(1,Math.max(0,-story.getBoundingClientRect().top/(height*.35)));
   story.style.setProperty('--connection-scale',String(reduced()?1:1+progress*.025));
   // Each chapter uses native scroll. Team stays pinned until its additional track is consumed:
   // the photograph zooms smoothly while its copy and CTA remain readable and stationary.
   const team=scenes.find(scene=>scene.classList.contains('connection-team'));
   if(team){
    const viewport=$('.connection-viewport',team);
    const hold=Math.max(1,team.offsetHeight-(viewport?.offsetHeight||height));
    const teamProgress=Math.min(1,Math.max(0,-team.getBoundingClientRect().top/hold));
    team.style.setProperty('--team-scale',String(reduced()?1:1+teamProgress*.055));
   }
   scenes.forEach((scene,i)=>{const r=scene.getBoundingClientRect();if(r.top<height*.85&&r.bottom>0)scene.classList.add('is-entered');if(r.top<height*(i===0?.16:.58))scene.classList.add('is-copy-ready');});
  }
  const schedule=()=>{if(!frame)frame=requestAnimationFrame(update);};
  const observer=new IntersectionObserver(entries=>{near=entries[0].isIntersecting;if(near)schedule();},{rootMargin:'100px 0px'});observer.observe(story);
  const sync=()=>{story.classList.toggle('is-reduced',reduced());if(reduced())scenes.forEach(scene=>scene.classList.add('is-entered','is-copy-ready'));near=true;schedule();};
  scenes.forEach(scene=>scene.addEventListener('focusin',()=>scene.classList.add('is-entered','is-copy-ready')));
  addEventListener('scroll',schedule,{passive:true});addEventListener('resize',schedule,{passive:true});addEventListener('pageshow',schedule);
  media.addEventListener('change',sync);new MutationObserver(sync).observe(document.body,{attributes:true,attributeFilter:['class']});
  // Scroll remains native: sticky CSS provides the visual pause, with no wheel/touch interception.
  story.classList.add('is-enhanced');sync();
 }
 function initSelects(){
  const controls=[];let opened=null;
  $$('select#filter-status,select#filter-city,select#filter-beds,select#catalog-sort').forEach((select,n)=>{
   const wrapper=document.createElement('div');wrapper.className='luxury-select';select.before(wrapper);wrapper.append(select);select.classList.add('enhanced-native-select');select.hidden=true;select.tabIndex=-1;select.setAttribute('aria-hidden','true');
   const label=document.querySelector(`label[for="${select.id}"]`);if(label){label.id=select.id+'-label';}
   const trigger=document.createElement('button');trigger.type='button';trigger.className='select-trigger';trigger.id=select.id+'-trigger';trigger.setAttribute('role','combobox');trigger.setAttribute('aria-haspopup','listbox');trigger.setAttribute('aria-expanded','false');trigger.setAttribute('aria-controls',select.id+'-options');
   const value=document.createElement('span');value.id=select.id+'-value';trigger.append(value);const arrow=document.createElement('span');arrow.className='select-chevron';arrow.setAttribute('aria-hidden','true');arrow.textContent='⌄';trigger.append(arrow);
   trigger.setAttribute('aria-labelledby',(label?label.id+' ':'')+value.id);if(label)label.htmlFor=trigger.id;
   const menu=document.createElement('div');menu.className='select-options';menu.id=select.id+'-options';menu.setAttribute('role','listbox');menu.setAttribute('aria-label',label?.textContent||'Sort properties');menu.hidden=true;
   const options=[...select.options].map((option,i)=>{const el=document.createElement('div');el.id=select.id+'-option-'+i;el.setAttribute('role','option');el.dataset.index=i;el.textContent=option.textContent;menu.append(el);return el;});
   wrapper.append(trigger,menu);let active=select.selectedIndex,typed='',typeTimer;
   function revealOption(){const option=options[active];if(!option)return;const top=option.offsetTop,bottom=top+option.offsetHeight;if(top<menu.scrollTop)menu.scrollTop=top;else if(bottom>menu.scrollTop+menu.clientHeight)menu.scrollTop=bottom-menu.clientHeight;}
   function mark(){options.forEach((el,i)=>{el.setAttribute('aria-selected',String(i===select.selectedIndex));el.classList.toggle('is-highlighted',i===active);});trigger.setAttribute('aria-activedescendant',options[active]?.id||'');}
   function close(focus=false){menu.hidden=true;trigger.setAttribute('aria-expanded','false');trigger.removeAttribute('aria-activedescendant');if(opened===api)opened=null;if(focus)trigger.focus();}
   function refresh(){value.textContent=select.selectedOptions[0]?.textContent||'';active=select.selectedIndex;mark();if(menu.hidden)trigger.removeAttribute('aria-activedescendant');}
   function open(){if(opened&&opened!==api)opened.close();menu.hidden=false;opened=api;trigger.setAttribute('aria-expanded','true');active=select.selectedIndex;mark();menu.classList.remove('opens-up');const rect=menu.getBoundingClientRect();menu.classList.toggle('opens-up',rect.bottom>innerHeight-20&&trigger.getBoundingClientRect().top>240);revealOption();}
   function choose(i){select.selectedIndex=i;refresh();close(true);select.dispatchEvent(new Event('change',{bubbles:true}));}
   const api={close,refresh};controls.push(api);
   trigger.addEventListener('click',()=>menu.hidden?open():close());
   trigger.addEventListener('keydown',event=>{
    if(event.key==='Tab'){close();return;}if(event.key==='Escape'){if(!menu.hidden){event.preventDefault();close(true);}return;}
    if(['ArrowDown','ArrowUp','Home','End','Enter',' '].includes(event.key)){
     event.preventDefault();const wasClosed=menu.hidden;
     if(wasClosed){open();if(event.key==='Enter'||event.key===' ')return;}
     if(event.key==='Enter'||event.key===' '){choose(active);return;}
     active=event.key==='Home'?0:event.key==='End'?options.length-1:Math.max(0,Math.min(options.length-1,active+(event.key==='ArrowDown'?1:-1)));mark();revealOption();
    }else if(event.key.length===1&&!event.ctrlKey&&!event.metaKey){event.preventDefault();clearTimeout(typeTimer);typed+=event.key.toLowerCase();typeTimer=setTimeout(()=>typed='',650);if(menu.hidden)open();const index=[...select.options].findIndex(o=>o.textContent.toLowerCase().startsWith(typed));if(index>=0){active=index;mark();revealOption();}}
   });
   menu.addEventListener('pointerdown',e=>e.preventDefault());menu.addEventListener('click',event=>{const option=event.target.closest('[data-index]');if(option)choose(Number(option.dataset.index));});trigger.addEventListener('blur',()=>close());select.addEventListener('change',refresh);refresh();
  });
  document.addEventListener('pointerdown',event=>{if(!event.target.closest('.luxury-select'))opened?.close();});
  document.addEventListener('hodnett:catalog-updated',()=>controls.forEach(c=>c.refresh()));
 }
 function init(){initFilm();initPlaces();initConnectionStory();initSelects();}
 if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',init,{once:true});else init();
})();
