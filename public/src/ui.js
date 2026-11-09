(()=>{'use strict';
const $=(s,r=document)=>r.querySelector(s),$$=(s,r=document)=>[...r.querySelectorAll(s)];
const base=document.body.dataset.base||'/',url=p=>base+p.replace(/^\//,'');
const safeStore={get:(k,f)=>{try{const v=localStorage.getItem(k);return v===null?f:JSON.parse(v);}catch{return f;}},set:(k,v)=>{try{localStorage.setItem(k,JSON.stringify(v));}catch{}}};
const escapeHTML=v=>String(v??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const icons={heart:'<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.2" aria-hidden="true"><path d="M20.8 4.6a5.5 5.5 0 0 0-7.8 0L12 5.7l-1.1-1.1a5.5 5.5 0 0 0-7.8 7.8L12 21l8.8-8.6a5.5 5.5 0 0 0 0-7.8Z"/></svg>'};
let favorites=new Set(safeStore.get('hodnett.saved.v1',[])),toastTimer,transitions,chapterController;
const catalog=()=>window.HODNETT_CATALOG||[];
function toast(message){const box=$('.toast');if(!box)return;clearTimeout(toastTimer);box.textContent=message;box.classList.add('visible');toastTimer=setTimeout(()=>box.classList.remove('visible'),3000);}
function updateSaved(){
 $$('[data-save]').forEach(b=>{const yes=favorites.has(b.dataset.save);b.setAttribute('aria-pressed',String(yes));const p=catalog().find(x=>x.id===b.dataset.save);b.setAttribute('aria-label',`${yes?'Unsave':'Save'} ${p?.title||'home'}`);});
 $$('[data-saved-count]').forEach(n=>{n.textContent=favorites.size;});
}
const price=p=>p.price===null?'':new Intl.NumberFormat('en-US',{style:'currency',currency:'USD',maximumFractionDigits:0}).format(p.price)+(p.status==='For Lease'?' / mo':'');
function savedCard(p){const E=escapeHTML;return `<article class="property-card"><div class="image-wrap"><a href="${url('properties/'+p.id+'/')}" data-atz-link>${p.cover?`<img src="${url(p.cover)}" alt="${E(p.title)}" loading="lazy">`:`<div class="archive-placeholder"><small>Past transaction</small>${E(p.title)}</div>`}</a><span class="card-status">${E(p.status)}</span><button class="save-button" data-save="${E(p.id)}" aria-pressed="true" aria-label="Unsave ${E(p.title)}">${icons.heart}</button></div><div class="card-topline"><span class="card-city">${E(p.city)}, TX</span><span class="card-price">${price(p)}</span></div><h3><a href="${url('properties/'+p.id+'/')}" data-atz-link>${E(p.title)}</a></h3></article>`;}
function renderFavorites(){const target=$('[data-favorites-grid]');if(!target)return;const rows=catalog().filter(p=>favorites.has(p.id));target.innerHTML=rows.length?rows.map(savedCard).join(''):`<div class="favorites-empty"><p>Your collection is waiting to begin.</p><p>Save a home with the heart beside its photograph, then return here to see it again.</p><a class="button" href="${url('homes/')}" data-atz-link>Explore the collection</a></div>`;updateSaved();}
function openDialog(id){const dialog=document.getElementById(id);if(!dialog)return;$$('dialog[open]').filter(d=>d!==dialog).forEach(d=>d.close());if(id==='favorites-dialog')renderFavorites();if(id==='account-dialog')renderProfile();if(!dialog.open)dialog.showModal();document.body.style.overflow='hidden';}
function closeDialog(dialog){dialog?.close();if(!document.querySelector('dialog[open]'))document.body.style.overflow='';}
let contactTemplate='';
function openContact(button={dataset:{}}){
 const copy=$('[data-contact-content]');copy.innerHTML=contactTemplate;
 const intent=button.dataset.intent||'contact',property=button.dataset.property||'';
 const form=$('[data-inquiry-form]');form.elements.intent.value=intent;form.elements.property.value=property;
 const showing=intent==='showing';$('[data-showing-fields]').hidden=!showing;form.elements.date.required=showing;form.elements.time.required=showing;
 const d=new Date();const localDate=[d.getFullYear(),String(d.getMonth()+1).padStart(2,'0'),String(d.getDate()).padStart(2,'0')].join('-');form.elements.date.min=localDate;
 if(showing){$('#contact-title').innerHTML='A private<br><em>showing.</em>';$('[data-contact-kicker]').textContent='A CLOSER LOOK';$('[data-contact-context]').textContent=property;}
 else if(intent==='valuation'){$('#contact-title').innerHTML='Your home’s<br><em>next chapter.</em>';$('[data-contact-context]').textContent='Valuation inquiry: '+property;form.elements.message.value='I would like to discuss a valuation for '+property+'.';}
 else if(intent==='similar'){$('[data-contact-context]').textContent='Find a home with the qualities you loved about '+property+'.';form.elements.message.value='I am interested in homes similar to '+property+'.';}
 else if(intent==='selling'){$('#contact-title').innerHTML='A considered<br><em>next step.</em>';$('[data-contact-context]').textContent='Tell us about your home and your plans.';}
 else if(property){$('[data-contact-context]').textContent='A conversation about '+property+'.';}
 openDialog('contact-dialog');
}
function renderProfile(){const active=safeStore.get('hodnett.profile.v1',false);const choice=$('.account-choice');choice.innerHTML=active?`<strong>Your preview collection</strong><span>You’re exploring a sample profile.</span><button class="button" data-open="favorites-dialog">View saved homes</button>`:`<strong>Preview profile</strong><span>Private presentation · no password required</span><button class="button" data-preview-signin>Continue in preview</button>`;$('[data-signout]').hidden=!active;}
function initMotion(){
 const os=matchMedia('(prefers-reduced-motion: reduce)'),toggles=$$('[data-motion-toggle]');let reduced=os.matches||safeStore.get('hodnett.motion.v1',false);
 const root=$('.chapter-story'),scene=$('[data-ats2-effect="depth"]');let frame=false;if(root&&window.AtrezzoScrollSections02)chapterController=window.AtrezzoScrollSections02.init(root,{reduced});
 const reveals=$$('.reveal');const observer=new IntersectionObserver(entries=>entries.forEach(entry=>{if(entry.isIntersecting){entry.target.classList.add('in-view');observer.unobserve(entry.target);}}),{threshold:.09});reveals.forEach(el=>observer.observe(el));
 function sync(value){reduced=value||os.matches;document.body.classList.toggle('reduced-motion',reduced);document.documentElement.classList.toggle('js-motion',!reduced);toggles.forEach(x=>{x.checked=reduced;x.disabled=os.matches;});chapterController?.setReduced(reduced);transitions?.destroy();transitions=null;if(!reduced&&window.AtrezzoTransitions)transitions=new window.AtrezzoTransitions({defaultEffect:'veil',coverColor:'#080808',coverMs:320,revealMs:500,showLabel:false});if(reduced)reveals.forEach(x=>x.classList.add('in-view'));syncChapter();}
 toggles.forEach(t=>t.addEventListener('change',()=>{safeStore.set('hodnett.motion.v1',t.checked);sync(t.checked);}));os.addEventListener('change',()=>sync(safeStore.get('hodnett.motion.v1',false)));sync(reduced);
 function syncChapter(){if(!scene)return;const enhanced=root.classList.contains('ats2-enhanced'),active=Number(scene.dataset.ats2Active||1)-1;
  $$('.ats2-depth-layer',scene).forEach((layer,i)=>{layer.inert=enhanced&&i!==active;layer.setAttribute('aria-hidden',String(enhanced&&i!==active));});$$('[data-chapter-jump]').forEach((b,i)=>b.setAttribute('aria-current',i===active?'step':'false'));
 }
 // The component writes scene progress in its rAF callback; accessibility follows on the next paint.
 const afterScroll=()=>{if(frame)return;frame=true;requestAnimationFrame(()=>requestAnimationFrame(()=>{frame=false;syncChapter();}));};window.addEventListener('scroll',afterScroll,{passive:true});window.addEventListener('resize',afterScroll,{passive:true});
 $$('[data-chapter-jump]').forEach(b=>b.addEventListener('click',()=>{const i=Number(b.dataset.chapterJump);if(root.classList.contains('ats2-enhanced')){const rect=scene.getBoundingClientRect();window.scrollTo({top:window.scrollY+rect.top+(rect.height-window.innerHeight)*[.02,.52,.98][i],behavior:reduced?'instant':'smooth'});}else{$$('.ats2-depth-layer',scene)[i].scrollIntoView({behavior:'instant'});}}));
 syncChapter();
}
function initHero(){const photos=$$('[data-hero-photo]');if(!photos.length)return;let active=0;function select(i){active=(i+photos.length)%photos.length;photos.forEach((im,n)=>{im.classList.toggle('is-active',n===active);im.setAttribute('aria-hidden',String(n!==active));});$('[data-hero-title]').textContent=photos[active].dataset.title;$('[data-hero-city]').textContent=photos[active].dataset.city+', Texas';$('[data-hero-count]').textContent=String(active+1).padStart(2,'0')+' / '+String(photos.length).padStart(2,'0');} $('[data-hero-next]').addEventListener('click',()=>select(active+1));$('[data-hero-prev]').addEventListener('click',()=>select(active-1));}
function initCollection(){
 const track=$('[data-collection-track]'),stage=$('[data-collection-stage]');
 if(!track||!stage)return;
 const section=track.closest('.collection-section');
 const panels=$$('[data-collection-panel]',track);
 const tabs=$$('[data-collection-tab]',track);
 const counter=$('[data-collection-counter]',track);
 const propertyLink=$('[data-collection-property-link]',stage);
 if(!section||!panels.length||panels.length!==tabs.length)return;
 const media=matchMedia('(min-height:700px) and (prefers-reduced-motion:no-preference)');
 const clamp=x=>Math.min(1,Math.max(0,x));
 const ease=x=>{const n=clamp(x);return n*n*(3-2*n);};
 let raf=0,active=-1;
 function paint(index,local,blend){
  const selected=blend>=.5?Math.min(panels.length-1,index+1):index;
  if(selected!==active){
   active=selected;
   counter.textContent=String(selected+1).padStart(2,'0')+' / '+String(panels.length).padStart(2,'0');
   // The understated CTA stays anchored where "Scroll to explore" used to be,
   // but always links to the home that is currently visible.
   const activeCardLink=panels[selected].querySelector('.collection-card-link');
   if(propertyLink&&activeCardLink){
    propertyLink.href=activeCardLink.href;
    propertyLink.setAttribute('aria-label',activeCardLink.getAttribute('aria-label')||'Discover this home');
   }
   tabs.forEach((tab,i)=>{tab.setAttribute('aria-selected',String(i===selected));tab.setAttribute('aria-current',i===selected?'step':'false');tab.tabIndex=i===selected?0:-1;});
   panels.forEach((panel,i)=>{const visible=i===selected;panel.inert=!visible;panel.setAttribute('aria-hidden',String(!visible));panel.style.pointerEvents=visible?'auto':'none';});
  }
  panels.forEach((panel,i)=>{
   let opacity=0,within=0;
   if(i===index){opacity=1-blend;within=local;}
   if(i===index+1&&index<panels.length-1){opacity=blend;within=0;}
   if(index===panels.length-1&&i===index){opacity=1;within=local;}
   panel.style.opacity=String(clamp(opacity));
   const photo=panel.querySelector('.collection-photo');
   if(photo&&opacity>.003){
    const scale=1.025+ease(within)*(i===panels.length-1?.060:.052);
    photo.style.transform='scale('+scale.toFixed(4)+')';
   }
  });
  tabs.forEach((tab,i)=>tab.style.setProperty('--chapter-fill',String(i<index?1:i===index?local:0)));
 }
 function update(){
  raf=0;if(!media.matches||document.hidden)return;
  const rect=track.getBoundingClientRect();
  if(rect.top>innerHeight||rect.bottom<0)return;
  const distance=Math.max(1,track.offsetHeight-stage.offsetHeight);
  const progress=clamp(-rect.top/distance);
  const position=Math.min(panels.length-0.000001,progress*panels.length);
  const index=Math.min(panels.length-1,Math.floor(position));
  const local=clamp(position-index);
  const blend=index===panels.length-1?0:ease((local-.68)/.30);
  paint(index,local,blend);
 }
 function schedule(){if(!raf)raf=requestAnimationFrame(update);}
 function goTo(index){
  if(!media.matches){panels[index]?.scrollIntoView({behavior:'instant',block:'start'});return;}
  const top=track.getBoundingClientRect().top+window.scrollY;
  const distance=Math.max(1,track.offsetHeight-stage.offsetHeight);
  const offset=((index+.16)/panels.length)*distance;
  window.scrollTo({top:top+offset,behavior:'instant'});
  schedule();
 }
 tabs.forEach((tab,i)=>{
  tab.addEventListener('click',()=>goTo(i));
  tab.addEventListener('keydown',event=>{
   let next;
   if(event.key==='ArrowRight')next=(i+1)%tabs.length;
   else if(event.key==='ArrowLeft')next=(i-1+tabs.length)%tabs.length;
   else if(event.key==='Home')next=0;
   else if(event.key==='End')next=tabs.length-1;
   else return;
   event.preventDefault();goTo(next);tabs[next].focus({preventScroll:true});
  });
 });
 function reconcile(){
  const enabled=media.matches;
  section.classList.toggle('is-cinema-active',enabled);
  if(!enabled){
   active=-1;
   panels.forEach(p=>{p.inert=false;p.setAttribute('aria-hidden','false');p.style.opacity='';p.style.pointerEvents='';p.querySelector('.collection-photo')?.style.removeProperty('transform');});
   tabs.forEach(t=>t.style.removeProperty('--chapter-fill'));
  }else{active=-1;paint(0,0,0);schedule();}
 }
 addEventListener('scroll',schedule,{passive:true});
 addEventListener('resize',schedule,{passive:true});
 addEventListener('pageshow',schedule);
 document.addEventListener('visibilitychange',schedule);
 media.addEventListener('change',reconcile);
 reconcile();
}
let gallery=[],galleryTitle='',galleryIndex=0;
function galleryPhoto(){const image=$('[data-gallery-image]');image.src=gallery[galleryIndex];image.alt=`${galleryTitle} · photograph ${galleryIndex+1}`;$('[data-gallery-counter]').textContent=String(galleryIndex+1).padStart(2,'0')+' / '+String(gallery.length).padStart(2,'0');$('[data-gallery-prev]').disabled=gallery.length<2;$('[data-gallery-next]').disabled=gallery.length<2;}
function initHeader(){
 const header=$('.site-header');if(!header)return;
 const dropdowns=$$('details[data-header-nav]',header);
 const hoverMedia=matchMedia('(hover:hover) and (pointer:fine)');
 let previous=Math.max(0,window.scrollY),frame=false,hidden=false,directionTravel=0;
 const syncHeaderHeight=()=>document.documentElement.style.setProperty('--catalog-header-height',header.offsetHeight+'px');
 const closeDropdowns=(except=null)=>dropdowns.forEach(item=>{if(item!==except)item.open=false;});
 const show=()=>{
  if(!hidden)return;
  hidden=false;header.classList.remove('is-hidden');
  document.body.classList.remove('has-hidden-header');header.inert=false;
 };
 const hide=()=>{
  // Closing an opened menu is essential: an old focused menu should never keep
  // the global header visible or prevent the Selected Homes scroll controller.
  if(hidden)return;
  closeDropdowns();
  hidden=true;header.classList.add('is-hidden');
  document.body.classList.add('has-hidden-header');header.inert=true;
 };
 document.body.classList.remove('has-hidden-header');
 header.classList.remove('is-hidden');
 header.inert=false;syncHeaderHeight();
 dropdowns.forEach(item=>{
  const summary=item.querySelector('summary');
  // Desktop: mouse enters → immediately open; mouse leaves → immediately close.
  // The entire <details>, including its absolutely-positioned panel, is the
  // hover region, so moving from the label into links does not close it.
  item.addEventListener('pointerenter',event=>{
   if(!hoverMedia.matches||event.pointerType==='touch')return;
   closeDropdowns(item);item.open=true;show();
  });
  item.addEventListener('pointerleave',event=>{
   if(!hoverMedia.matches||event.pointerType==='touch')return;
   item.open=false;
   if(document.activeElement===summary)summary.blur();
  });
  // Keep keyboard/touch activation native. An ordinary desktop mouse click
  // must not toggle shut a dropdown that is already opened by hover.
  summary?.addEventListener('click',event=>{
   if(!hoverMedia.matches||event.detail===0)return;
   event.preventDefault();closeDropdowns(item);item.open=true;show();
  });
  item.addEventListener('toggle',()=>{
   if(item.open){closeDropdowns(item);show();}
  });
  item.addEventListener('click',event=>{
   if(event.target.closest('a'))item.open=false;
  });
 });
 function update(){
  frame=false;
  const current=Math.max(0,window.scrollY),delta=current-previous;
  header.classList.toggle('is-scrolled',current>65);
  syncHeaderHeight();
  // Sum fine trackpad/wheel increments. A single scroll frame can be 1-4px,
  // so instantaneous delta thresholds must not leave the header stuck open.
  if(delta>0)directionTravel=Math.max(0,directionTravel)+delta;
  else if(delta<0)directionTravel=Math.min(0,directionTravel)+delta;
  if(current<Math.max(130,header.offsetHeight+28)){
   directionTravel=0;closeDropdowns();show();
  }else if(directionTravel>=18&&!document.querySelector('dialog[open]')){
   // Downward scroll always closes menus and hides navigation, even after focus.
   hide();directionTravel=0;
  }else if(directionTravel<=-12){
   show();directionTravel=0;
  }
  previous=current;
 }
 const schedule=()=>{if(!frame){frame=true;requestAnimationFrame(update);}};
 addEventListener('scroll',schedule,{passive:true});
 addEventListener('resize',()=>{
  closeDropdowns();directionTravel=0;syncHeaderHeight();show();previous=window.scrollY;schedule();
 },{passive:true});
 addEventListener('pageshow',()=>{
  closeDropdowns();directionTravel=0;show();previous=window.scrollY;schedule();
 });
 document.addEventListener('pointerdown',event=>{
  if(!event.target.closest('.site-header details[data-header-nav]'))closeDropdowns();
 });
 document.addEventListener('keydown',event=>{
  if(event.key!=='Escape')return;
  const current=dropdowns.find(item=>item.open);
  if(current){
   closeDropdowns();current.querySelector('summary')?.focus();
   event.preventDefault();
  }
 });
 header.addEventListener('focusin',show);
 update();
}
function init(){
 contactTemplate=$('[data-contact-content]').innerHTML;$('#video-dialog').addEventListener('close',()=>$('[data-video-frame]').replaceChildren());
 // Initialize the cinematic hero and collection independently of header menus.
 // A future navigation regression must not turn the three property chapters
 // into stacked cards or disable the original full-screen scroll experience.
 initHero();
 initCollection();
 initHeader();
 $$('dialog').forEach(dialog=>{dialog.addEventListener('close',()=>{if(!document.querySelector('dialog[open]'))document.body.style.overflow='';});dialog.addEventListener('click',event=>{if(event.target===dialog){const r=dialog.getBoundingClientRect();if(event.clientX<r.left||event.clientX>r.right||event.clientY<r.top||event.clientY>r.bottom)closeDialog(dialog);}});});
 document.addEventListener('click',async event=>{
  const close=event.target.closest('[data-close]');if(close){closeDialog(close.closest('dialog'));return;}
  const save=event.target.closest('[data-save]');if(save){event.preventDefault();const id=save.dataset.save;if(favorites.has(id)){favorites.delete(id);toast('Home removed from your collection.');}else{favorites.add(id);toast('Saved to your personal collection.');}safeStore.set('hodnett.saved.v1',[...favorites]);updateSaved();if($('#favorites-dialog').open)renderFavorites();return;}
  const contact=event.target.closest('[data-contact]');if(contact){openContact(contact);return;}
  const open=event.target.closest('[data-open]');if(open){openDialog(open.dataset.open);return;}
  if(event.target.closest('[data-preview-signin]')){safeStore.set('hodnett.profile.v1',true);renderProfile();toast('Your preview profile is ready.');return;}
  if(event.target.closest('[data-signout]')){safeStore.set('hodnett.profile.v1',false);renderProfile();return;}
  const video=event.target.closest('[data-video]');if(video){const embed=new URL(video.dataset.video);if(embed.hostname!=='www.youtube-nocookie.com')return;$('#video-title').textContent=video.dataset.videoTitle||'From the film archive';$('[data-video-frame]').replaceChildren();const iframe=document.createElement('iframe');iframe.src=embed.href;iframe.title=video.dataset.videoTitle||'Sharon Hodnett film';iframe.allow='fullscreen; picture-in-picture';iframe.allowFullscreen=true;$('[data-video-frame]').append(iframe);$('[data-video-external]').href='https://www.youtube.com/watch?v='+embed.pathname.split('/').pop();openDialog('video-dialog');return;}
  const g=event.target.closest('[data-gallery]');if(g){try{gallery=JSON.parse(g.dataset.gallery);galleryTitle=g.dataset.galleryTitle||'Property';galleryIndex=0;galleryPhoto();openDialog('gallery-dialog');}catch{toast('The gallery could not be opened.');}return;}
  if(event.target.closest('[data-gallery-prev]')){galleryIndex=(galleryIndex-1+gallery.length)%gallery.length;galleryPhoto();return;}
  if(event.target.closest('[data-gallery-next]')){galleryIndex=(galleryIndex+1)%gallery.length;galleryPhoto();return;}
  if(event.target.closest('[data-share]')){try{await navigator.clipboard.writeText(location.href);toast('Link copied. Ready to share.');}catch{toast('Copy the address from your browser to share this home.');}}
 });
 $('#gallery-dialog').addEventListener('keydown',event=>{if(event.key==='ArrowRight'&&gallery.length>1){galleryIndex=(galleryIndex+1)%gallery.length;galleryPhoto();}else if(event.key==='ArrowLeft'&&gallery.length>1){galleryIndex=(galleryIndex-1+gallery.length)%gallery.length;galleryPhoto();}});
 document.addEventListener('submit',event=>{
  const form=event.target;
  if(form.matches('[data-valuation-form]')){event.preventDefault();const address=String(new FormData(form).get('address')).trim();openContact({dataset:{intent:'valuation',property:address}});return;}
  if(!form.matches('[data-inquiry-form]'))return;
  event.preventDefault();const data=Object.fromEntries(new FormData(form));const details=[data.property,data.date?`${data.date} · ${data.time}`:'',data.name,data.email].filter(Boolean).join('\n');
  // The preview intentionally does not call a network endpoint or send lead data.
  const copy=$('[data-contact-content]');copy.innerHTML=`<div class="success-panel"><div class="eyebrow">PREPARED ON THIS DEVICE</div><h2 id="contact-title">Your next step,<br><em>considered.</em></h2><p>Your ${data.intent==='showing'?'visit request':'inquiry'} is prepared for this presentation.</p><div class="request-summary">${escapeHTML(details)}</div><p class="form-disclosure">This preview has not sent your request. In the approved website, this step will connect to the team’s selected contact service.</p><button class="button" data-close>Continue exploring</button></div>`;$('.success-panel button').focus();
 });
 document.addEventListener('hodnett:catalog-updated',updateSaved);updateSaved();initMotion();
 window.HodnettUI=Object.freeze({refreshSaved:updateSaved,openDialog});
}
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',init,{once:true});else init();
})();
