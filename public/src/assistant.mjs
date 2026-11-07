/* ATREZZO · Voice and text property concierge. One useful destination per search. */
import {resolveAssistantDestination,detectAssistantLanguage} from './assistant-navigation.mjs';
import {siteKnowledge} from '../data/knowledge.mjs';
const root=document.querySelector('[data-hodnett-assistant]');
if(root){
 const $=selector=>root.querySelector(selector);
 const base=document.body.dataset.base||'/';
 const E=value=>String(value??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
 const launcher=$('[data-assistant-launcher]'),panel=$('[data-assistant-panel]');
 const close=$('[data-assistant-close]'),input=$('[data-assistant-input]'),form=$('[data-assistant-form]');
 const voice=$('[data-assistant-voice]'),status=$('[data-assistant-status]');
 const results=$('[data-assistant-results]'),heard=$('[data-assistant-heard]'),speak=$('[data-assistant-speak]');
 const Recognition=window.SpeechRecognition||window.webkitSpeechRecognition;
 const browserLanguage=navigator.language||document.documentElement.lang||'en-US';
 let recognition=null,listening=false,voiceQuery=false,language='en';
 const copy={
  en:{question:'Your search:',listening:'Listening…',micError:'Microphone unavailable. Type your search instead.',micDenied:'Allow microphone access in your browser, or type your search.',micRetry:'I couldn’t recognize that. Try again or type your search.',initial:'Where would you like to go?',example:'Show homes in Argyle'},
  es:{question:'Tu búsqueda:',listening:'Escuchando…',micError:'El micrófono no está disponible. Escribe tu búsqueda.',micDenied:'Permite el micrófono en el navegador o escribe tu búsqueda.',micRetry:'No pude reconocer la voz. Vuelve a intentarlo o escribe tu búsqueda.',initial:'¿Qué te gustaría explorar?',example:'Busco casas en Argyle'}
 };
 const setStatus=message=>{status.textContent=message;};
 function open(){panel.hidden=false;launcher.setAttribute('aria-expanded','true');input.focus();}
 function shut(){panel.hidden=true;launcher.setAttribute('aria-expanded','false');if(listening)recognition?.stop();launcher.focus();}
 launcher.addEventListener('click',()=>panel.hidden?open():shut());
 close.addEventListener('click',shut);
 root.addEventListener('keydown',event=>{if(event.key==='Escape'&&!panel.hidden){event.preventDefault();shut();}});
 const params=new URLSearchParams(location.search);
 if(params.has('assistant')){open();input.value=params.get('assistant')||'';}
 function speakAnswer(message){
  if(!voiceQuery||!speak.checked||!('speechSynthesis' in window))return;
  window.speechSynthesis.cancel();
  const utterance=new SpeechSynthesisUtterance(message);
  utterance.lang=language==='es'?'es-ES':'en-US';
  utterance.rate=.96;
  window.speechSynthesis.speak(utterance);
 }
 function ask(raw,fromVoice=false){
  const question=String(raw||'').trim();
  if(!question)return;
  voiceQuery=fromVoice;
  input.value=question;
  const destination=resolveAssistantDestination(question,window.HODNETT_CATALOG||[],siteKnowledge,base,browserLanguage);
  language=destination.language;
  heard.textContent=copy[language].question+' '+question;
  setStatus(destination.message);
  results.innerHTML='<a class="ah-destination" data-atz-link href="'+E(destination.href)+'"><span>'+E(destination.label)+'</span><span class="ah-destination-arrow" aria-hidden="true">↗</span></a>';
  speakAnswer(destination.message);
 }
 form.addEventListener('submit',event=>{event.preventDefault();ask(input.value,false);});
 root.addEventListener('click',event=>{
  if(event.target.closest('[data-assistant-sample]'))ask(copy[detectAssistantLanguage('',browserLanguage)].example);
 });
 if(!Recognition){
  voice.disabled=true;
  voice.title='Voice recognition is not supported in this browser. Search by typing.';
 }else{
  voice.addEventListener('click',()=>{
   if(listening){recognition?.stop();return;}
   try{
    recognition=new Recognition();
    // The browser controls recognition locale. No language selector is required.
    // The reply language is inferred from the recognized words.
    recognition.lang=browserLanguage;
    recognition.interimResults=false;
    recognition.continuous=false;
    recognition.maxAlternatives=1;
    recognition.onstart=()=>{
     listening=true;voice.classList.add('is-listening');voice.setAttribute('aria-pressed','true');
     setStatus(copy[language].listening);
    };
    recognition.onresult=event=>{
     const transcript=event.results?.[0]?.[0]?.transcript||'';
     if(transcript.trim())ask(transcript,true);
    };
    recognition.onerror=event=>setStatus(event.error==='not-allowed'?copy[language].micDenied:copy[language].micRetry);
    recognition.onend=()=>{
     listening=false;voice.classList.remove('is-listening');voice.setAttribute('aria-pressed','false');
    };
    recognition.start();
   }catch{setStatus(copy[language].micError);}
  });
 }
}
