/* ATREZZO · Voice and text property concierge. One useful destination per search. */
import {resolveAssistantDestination} from './assistant-navigation.mjs';
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
 let recognition=null,listening=false,voiceQuery=false;
 const copy={question:'Your search:',listening:'Listening…',micError:'Microphone unavailable. Type your search instead.',micDenied:'Allow microphone access in your browser, or type your search.',micRetry:'I couldn’t recognize that. Try again or type your search.',example:'Show homes in Argyle'};
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
  utterance.lang='en-US';
  utterance.rate=.96;
  window.speechSynthesis.speak(utterance);
 }
 function ask(raw,fromVoice=false){
  const question=String(raw||'').trim();
  if(!question)return;
  voiceQuery=fromVoice;
  input.value=question;
  const destination=resolveAssistantDestination(question,window.HODNETT_CATALOG||[],siteKnowledge,base,'en-US');
  heard.textContent=copy.question+' '+question;
  setStatus(destination.message);
  const arrowSvg='<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M5 19 19 5M5 5h14v14"/></svg>';
  results.innerHTML='<a class="ah-destination" data-atz-link href="'+E(destination.href)+'"><span>'+E(destination.label)+'</span><span class="ah-destination-arrow" aria-hidden="true">'+arrowSvg+'</span></a>';
  speakAnswer(destination.message);
 }
 form.addEventListener('submit',event=>{event.preventDefault();ask(input.value,false);});
 root.addEventListener('click',event=>{
  if(event.target.closest('[data-assistant-sample]'))ask(copy.example);
 });
 if(!Recognition){
  voice.disabled=true;
  voice.title='Voice recognition is not supported in this browser. Search by typing.';
 }else{
  voice.addEventListener('click',()=>{
   if(listening){recognition?.stop();return;}
   try{
    recognition=new Recognition();
    // Only English speech recognition and English spoken replies are supported.
    recognition.lang='en-US';
    recognition.interimResults=false;
    recognition.continuous=false;
    recognition.maxAlternatives=1;
    recognition.onstart=()=>{
     listening=true;voice.classList.add('is-listening');voice.setAttribute('aria-pressed','true');
     setStatus(copy.listening);
    };
    recognition.onresult=event=>{
     const transcript=event.results?.[0]?.[0]?.transcript||'';
     if(transcript.trim())ask(transcript,true);
    };
    recognition.onerror=event=>setStatus(event.error==='not-allowed'?copy.micDenied:copy.micRetry);
    recognition.onend=()=>{
     listening=false;voice.classList.remove('is-listening');voice.setAttribute('aria-pressed','false');
    };
    recognition.start();
   }catch{setStatus(copy.micError);}
  });
 }
}
