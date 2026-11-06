/* ATREZZO · Browser voice + text discovery. Replies only from website records. */
import {interpretQuestion,findWebsiteAnswers} from './assistant-core.mjs';
import {searchProperties,formatPrice} from './search-core.mjs';
import {siteKnowledge} from '../data/knowledge.mjs';
const root=document.querySelector('[data-hodnett-assistant]');
if(root){
 const $=selector=>root.querySelector(selector);
 const base=document.body.dataset.base||'/';
 const E=value=>String(value??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
 const catalog=()=>window.HODNETT_CATALOG||[];
 const launcher=$('[data-assistant-launcher]'),panel=$('[data-assistant-panel]');
 const close=$('[data-assistant-close]'),input=$('[data-assistant-input]'),form=$('[data-assistant-form]');
 const voice=$('[data-assistant-voice]'),lang=$('[data-assistant-lang]'),status=$('[data-assistant-status]');
 const results=$('[data-assistant-results]'),heard=$('[data-assistant-heard]'),speak=$('[data-assistant-speak]');
 const Recognition=window.SpeechRecognition||window.webkitSpeechRecognition;
 let recognition=null,listening=false,voiceQuery=false;
 const spanish=()=>lang.value==='es-ES';
 const setStatus=msg=>{status.textContent=msg;};
 function open(){panel.hidden=false;launcher.setAttribute('aria-expanded','true');input.focus();}
 function shut(){panel.hidden=true;launcher.setAttribute('aria-expanded','false');if(listening)recognition?.stop();launcher.focus();}
 launcher.addEventListener('click',()=>panel.hidden?open():shut());
 close.addEventListener('click',shut);
 root.addEventListener('keydown',event=>{if(event.key==='Escape'&&!panel.hidden){event.preventDefault();shut();}});
 const params=new URLSearchParams(location.search);if(params.has('assistant')){open();input.value=params.get('assistant')||'';}
 function speakAnswer(message){
  if(!voiceQuery||!speak.checked||!('speechSynthesis' in window))return;
  window.speechSynthesis.cancel();
  const utterance=new SpeechSynthesisUtterance(message);
  utterance.lang=lang.value;utterance.rate=.95;
  window.speechSynthesis.speak(utterance);
 }
 function propsLink(query){
  const params=new URLSearchParams();
  // The /homes/ catalogue defaults to For Sale, so status= is explicit when requesting all records.
  params.set('status',query.status);
  if(query.city)params.set('city',query.city);
  if(query.query)params.set('q',query.query);
  if(query.beds)params.set('beds',String(query.beds));
  if(query.pool)params.set('pool','1');
  if(query.minPrice)params.set('min',String(query.minPrice));
  if(query.maxPrice)params.set('max',String(query.maxPrice));
  return base+'homes/?'+params.toString();
 }
 function propertyRows(query){
  const matches=searchProperties(catalog(),{status:query.status,city:query.city,pool:query.pool,beds:query.beds,minPrice:query.minPrice,maxPrice:query.maxPrice,query:query.query,sort:'featured'});
  const summary=(spanish()?
    String(matches.length)+(matches.length===1?' propiedad encontrada':' propiedades encontradas')+(query.city?' en '+query.city:'')+' en el catálogo guardado.':
    String(matches.length)+(matches.length===1?' property':' properties')+' found'+(query.city?' in '+query.city:'')+' in the archived collection.');
  setStatus(summary);
  if(!matches.length){
   results.innerHTML='<p class="ah-empty">'+E(spanish()?'No hay propiedades que coincidan con esta búsqueda en la información guardada. Esto no confirma la disponibilidad actual del MLS.':'No properties match this search in the saved catalogue. This does not confirm live MLS availability.')+'</p><a class="ah-more" href="'+E(base+'homes/?status=')+'">'+E(spanish()?'Explorar el catálogo completo':'Explore all records')+'</a>';
  }else{
   const cards=matches.slice(0,60).map(p=>'<article class="ah-property">'+
    (p.cover?'<a href="'+E(base+'properties/'+p.id+'/')+'" aria-label="'+E(p.title)+'"><img loading="lazy" src="'+E(base+p.cover)+'" alt="'+E(p.title)+'"></a>':'')+
    '<div class="ah-property-copy"><span class="ah-property-status">'+E(p.status)+'</span><a class="ah-property-name" href="'+E(base+'properties/'+p.id+'/')+'">'+E(p.title)+'</a><span class="ah-property-facts">'+E(p.city)+(p.beds!==null?' · '+E(p.beds)+' beds':'')+(p.price!==null?' · '+E(formatPrice(p.price,p.status)):'')+'</span></div></article>').join('');
   const rest=matches.length>60?'<p class="ah-hint">'+E(spanish()?'Se muestran los primeros 60 registros.':'Showing the first 60 records.')+'</p>':'';
   results.innerHTML=cards+rest+'<a class="ah-more" href="'+E(propsLink(query))+'">'+E(spanish()?'Ver todos los resultados y filtros':'View all results and filters')+' <span aria-hidden="true">↗</span></a>';
  }
  results.scrollTop=0;
  speakAnswer(summary);
 }
 function knowledgeRows(question){
  const answers=findWebsiteAnswers(question,siteKnowledge,3);
  if(!answers.length){
   const msg=spanish()?'No encontré una respuesta verificable en el contenido de esta web. Prueba con una ciudad, una dirección o consulta las secciones del sitio.':'I couldn’t verify an answer from this website. Try a city, property address or a section of the site.';
   setStatus(msg);results.innerHTML='<p class="ah-empty">'+E(msg)+'</p><a class="ah-more" href="'+E(base+'sitemap/')+'">'+E(spanish()?'Explorar el sitio':'Explore the website')+'</a>';speakAnswer(msg);return;
  }
  const msg=spanish()?'Encontré estas fuentes dentro del sitio:':'I found these relevant pages on this website:';
  setStatus(msg);
  results.innerHTML=answers.map(({entry,excerpt})=>'<article class="ah-source"><span class="ah-source-type">'+E(entry.type)+'</span><a href="'+E(base+entry.href)+'">'+E(entry.title)+'</a><p>'+E(excerpt)+'</p></article>').join('')+'<p class="ah-hint">'+E(spanish()?'Información del archivo del sitio. Comprueba fechas y datos antes de tomar decisiones.':'Website archive content. Verify dates and details before relying on them.')+'</p>';
  results.scrollTop=0;speakAnswer(msg+' '+answers[0].entry.title);
 }
 function ask(raw,fromVoice=false){
  const question=String(raw||'').trim();
  if(!question)return;
  input.value=question;heard.textContent=(spanish()?'Consulta: ':'Your question: ')+question;
  voiceQuery=fromVoice;
  const parsed=interpretQuestion(question,catalog());
  if(parsed.kind==='properties')propertyRows(parsed);else knowledgeRows(question);
 }
 form.addEventListener('submit',event=>{event.preventDefault();ask(input.value,false);});
 root.addEventListener('click',event=>{
  const sample=event.target.closest('[data-assistant-sample]');
  if(sample)ask(spanish()?'Busco casas en Argyle':'Show all homes in Argyle',false);
 });
 if(!Recognition){
  voice.disabled=true;voice.title='Voice recognition is unavailable in this browser. You can search by typing.';
  setStatus('Type a question, or use a browser that supports voice recognition.');
 }else{
  voice.addEventListener('click',()=>{
   if(listening){recognition?.stop();return;}
   try{
    recognition=new Recognition();recognition.lang=lang.value;recognition.interimResults=false;recognition.continuous=false;recognition.maxAlternatives=1;
    recognition.onstart=()=>{listening=true;voice.classList.add('is-listening');voice.setAttribute('aria-pressed','true');setStatus(spanish()?'Escuchando…':'Listening…');};
    recognition.onresult=event=>{const heardText=event.results?.[0]?.[0]?.transcript||'';ask(heardText,true);};
    recognition.onerror=event=>{const label=event.error==='not-allowed'
      ?(spanish()?'Permite el micrófono en tu navegador o escribe la consulta.':'Allow microphone access in your browser or type your question.')
      :(spanish()?'No se pudo reconocer la voz. Escribe tu consulta.':'Voice recognition was not successful. Try typing your question.');
      setStatus(label);
    };
    recognition.onend=()=>{listening=false;voice.classList.remove('is-listening');voice.setAttribute('aria-pressed','false');};
    recognition.start();
   }catch{setStatus(spanish()?'El micrófono no está disponible. Escribe tu consulta.':'Microphone unavailable. Type your search instead.');}
  });
 }
 lang.addEventListener('change',()=>{if(listening)recognition?.stop();input.placeholder=spanish()?'Ej.: Busco casas en Argyle':'e.g., Show me homes in Argyle';});
}
