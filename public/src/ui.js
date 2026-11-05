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
function initCollection(){const tabs=$$('[data-collection-tab]');if(!tabs.length)return;const stage=$('[data-collection-stage]');stage.id='curated-panel';stage.setAttribute('role','tabpanel');
 function select(tab){const p=catalog().find(p=>p.id===tab.dataset.collectionTab);if(!p)return;tabs.forEach((t,i)=>{t.id='curated-tab-'+i;t.setAttribute('aria-controls',stage.id);t.setAttribute('aria-selected',String(t===tab));t.tabIndex=t===tab?0:-1;});stage.setAttribute('aria-labelledby',tab.id);const im=$('[data-collection-photo]');const nextSource=url(p.cover);if(im.getAttribute('src')!==nextSource){stage.querySelectorAll('.collection-photo-outgoing').forEach(el=>el.remove());const old=im.cloneNode();old.removeAttribute('data-collection-photo');old.className='collection-photo-outgoing';old.alt='';old.setAttribute('aria-hidden','true');old.style.zIndex='1';stage.append(old);im.src=nextSource;im.alt=p.title;im.decode().catch(()=>{}).then(()=>{if(document.body.classList.contains('reduced-motion')){old.remove();return;}old.animate([{opacity:1},{opacity:0}],{duration:650,easing:'ease-out'}).finished.catch(()=>{}).finally(()=>old.remove());});}else{im.alt=p.title;}$('[data-collection-location]').textContent=p.city+', TEXAS';$('[data-collection-title]').textContent=p.title;$('[data-collection-link]').href=url('properties/'+p.id+'/');$('[data-collection-meta]').innerHTML=[price(p),p.beds>0?p.beds+' beds':p.beds===0?p.type:'',p.baths===null?'':p.baths+' baths',p.sqft===null?'':p.sqft.toLocaleString('en-US')+' sq ft'].filter(Boolean).map(v=>'<span>'+escapeHTML(v)+'</span>').join('');}
 tabs.forEach((tab,i)=>{tab.addEventListener('click',()=>select(tab));tab.addEventListener('keydown',event=>{let next;if(event.key==='ArrowRight')next=(i+1)%tabs.length;else if(event.key==='ArrowLeft')next=(i-1+tabs.length)%tabs.length;else if(event.key==='Home')next=0;else if(event.key==='End')next=tabs.length-1;else return;event.preventDefault();select(tabs[next]);tabs[next].focus();});});select(tabs[0]);}
let gallery=[],galleryTitle='',galleryIndex=0;
function galleryPhoto(){const image=$('[data-gallery-image]');image.src=gallery[galleryIndex];image.alt=`${galleryTitle} · photograph ${galleryIndex+1}`;$('[data-gallery-counter]').textContent=String(galleryIndex+1).padStart(2,'0')+' / '+String(gallery.length).padStart(2,'0');$('[data-gallery-prev]').disabled=gallery.length<2;$('[data-gallery-next]').disabled=gallery.length<2;}
function init(){
 contactTemplate=$('[data-contact-content]').innerHTML;$('#video-dialog').addEventListener('close',()=>$('[data-video-frame]').replaceChildren());
 const header=$('.site-header'),updateHeader=()=>header.classList.toggle('is-scrolled',scrollY>65);addEventListener('scroll',updateHeader,{passive:true});updateHeader();
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
 document.addEventListener('hodnett:catalog-updated',updateSaved);updateSaved();initHero();initCollection();initMotion();
 window.HodnettUI=Object.freeze({refreshSaved:updateSaved,openDialog});
}
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',init,{once:true});else init();
})();
