import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import vm from 'node:vm';

const source=readFileSync(new URL('../public/src/ui.js',import.meta.url),'utf8');
const extract=(start,end)=>{
 const a=source.indexOf(start),b=source.indexOf(end,a);
 assert.ok(a>=0&&b>a,'UI controller source should expose '+start);
 return source.slice(a,b);
};
const classList=()=>({
 values:new Set(),
 add(k){this.values.add(k);},
 remove(k){this.values.delete(k);},
 contains(k){return this.values.has(k);},
 toggle(k,bool){if(bool??!this.contains(k))this.add(k);else this.remove(k);}
});
const emitter=()=>({
 listeners:new Map(),
 addEventListener(name,handler){const group=this.listeners.get(name)||[];group.push(handler);this.listeners.set(name,group);},
 emit(name,event={}){for(const handler of this.listeners.get(name)||[])handler(event);}
});
const style=()=>({
 values:{},
 setProperty(name,value){this.values[name]=value;},
 removeProperty(name){delete this.values[name];}
});

function headerHarness(){
 const calls=emitter(),documentEvents=emitter(),header=emitter();
 Object.assign(header,{classList:classList(),offsetHeight:88,inert:false});
 const doc={body:{classList:classList()},documentElement:{style:style()},activeElement:null,querySelector:()=>null,...documentEvents};
 const entries=['Properties','Home Search'].map(name=>{
  const details=emitter(),summary=emitter();
  Object.assign(summary,{blur(){if(doc.activeElement===summary)doc.activeElement=null;},focus(){doc.activeElement=summary;}});
  Object.assign(details,{open:false,label:name,querySelector:selector=>selector==='summary'?summary:null});
  return {details,summary};
 });
 header.querySelectorAll=selector=>selector==='details[data-header-nav]'?entries.map(x=>x.details):[];
 const current={scrollY:0};
 const context={
  $:(selector)=>selector==='.site-header'?header:null,
  $$:(selector,element)=>element===header?header.querySelectorAll(selector):[],
  document:doc,window:current,
  matchMedia:()=>({matches:true}),
  requestAnimationFrame:callback=>callback(),
  addEventListener:(name,handler)=>calls.addEventListener(name,handler),
 };
 const fn=vm.runInNewContext('('+extract('function initHeader(){','function init(){')+')',context);
 fn();
 return {entries,header,doc,scrollTo(y){current.scrollY=y;calls.emit('scroll');},key(name){documentEvents.emit('keydown',{key:name,preventDefault(){}});},outside(){documentEvents.emit('pointerdown',{target:{closest(){return null;}}});}};
}

test('desktop dropdown opens on hover, closes on pointerleave, and never remains stuck',()=>{
 const h=headerHarness();
 const [properties,search]=h.entries;
 properties.details.emit('pointerenter',{pointerType:'mouse'});
 assert.equal(properties.details.open,true,'Properties opens without a click');
 search.details.emit('pointerenter',{pointerType:'mouse'});
 assert.equal(properties.details.open,false,'opening Home Search closes Properties');
 assert.equal(search.details.open,true);
 search.details.emit('pointerleave',{pointerType:'mouse'});
 assert.equal(search.details.open,false,'hover exit closes menu');
 properties.details.emit('pointerenter',{pointerType:'mouse'});
 h.outside();
 assert.equal(properties.details.open,false,'outside pointer closes menu');
});
test('desktop click does not close an already hover-open menu; mobile touch has no hover',()=>{
 const h=headerHarness();
 const item=h.entries[0];
 item.details.emit('pointerenter',{pointerType:'mouse'});
 let prevented=false;
 item.summary.emit('click',{detail:1,preventDefault(){prevented=true;}});
 assert.equal(prevented,true);
 assert.equal(item.details.open,true);
 item.details.emit('pointerleave',{pointerType:'touch'});
 assert.equal(item.details.open,true,'touch-pointer events must not close desktop hover state');
});
test('header hides on downscroll, closes dropdown and reappears on upscroll',()=>{
 const h=headerHarness();
 h.entries[0].details.emit('pointerenter',{pointerType:'mouse'});
 h.scrollTo(220);
 assert.equal(h.header.classList.contains('is-hidden'),true);
 assert.equal(h.doc.body.classList.contains('has-hidden-header'),true);
 assert.equal(h.entries[0].details.open,false);
 assert.equal(h.header.inert,true);
 h.scrollTo(195);
 assert.equal(h.header.classList.contains('is-hidden'),false);
 assert.equal(h.header.inert,false);
 assert.equal(h.doc.body.classList.contains('has-hidden-header'),false);
});
test('smooth trackpad increments accumulate to hide header',()=>{
 const h=headerHarness();
 h.scrollTo(170);
 for(let i=0;i<8;i++)h.scrollTo(172+i*3);
 assert.equal(h.header.classList.contains('is-hidden'),true);
});
test('header controller no longer treats one querySelector element as an iterable',()=>{
 assert.match(extract('function initHeader(){','function init(){'),/const dropdowns=\$\$\('details\[data-header-nav\]',header\)/);
 assert.ok(source.indexOf(' initCollection();\n initHeader();')>0,'cinematic controller starts independently before navigation');
});

function collectionHarness(enabled=true){
 const calls=emitter(),media=emitter(),doc=emitter(),section={classList:classList()};
 const stage={offsetHeight:900};
 let top=0;
 const track={offsetHeight:3900,closest:()=>section,getBoundingClientRect:()=>({top,bottom:top+3900})};
 const counter={textContent:''};
 const propertyLink={href:'',attrs:{},setAttribute(name,value){this.attrs[name]=value;}};
 const panels=Array.from({length:3},(_,i)=>{
  const photo={style:style()};
  const cardLink={href:'https://example.test/properties/test-'+i+'/',getAttribute:()=> 'Discover Test Home '+i};
  return {inert:false,aria:{},style:style(),photo,cardLink,setAttribute(name,value){this.aria[name]=value;},
   querySelector:sel=>sel==='.collection-photo'?photo:sel==='.collection-card-link'?cardLink:null};
 });
 const tabs=Array.from({length:3},()=>({
  attrs:{},style:style(),tabIndex:0,
  ...emitter(),setAttribute(name,value){this.attrs[name]=value;},focus(){}
 }));
 Object.assign(media,{matches:enabled});
 Object.assign(doc,{hidden:false});
 const selectors={
  '[data-collection-track]':track,'[data-collection-stage]':stage,'[data-collection-counter]':counter,
  '[data-collection-property-link]':propertyLink
 };
 const current={scrollY:0,scrollTo:({top:y})=>{current.scrollY=y;}};
 const context={
  $:(selector)=>selectors[selector]??null,
  $$:(selector)=>selector==='[data-collection-panel]'?panels:selector==='[data-collection-tab]'?tabs:[],
  matchMedia:()=>media,document:doc,window:current,innerHeight:900,
  requestAnimationFrame:fn=>fn(),
  addEventListener:(name,fn)=>calls.addEventListener(name,fn)
 };
 const fn=vm.runInNewContext('('+extract('function initCollection(){','let gallery=[]')+')',context);
 fn();
 return {section,panels,tabs,counter,propertyLink,media,advance(progress){
  top=-(track.offsetHeight-stage.offsetHeight)*progress;
  calls.emit('scroll');
 }};
}

test('Selected Homes restores one fixed full-screen stage with three scroll chapters',()=>{
 const x=collectionHarness(true);
 assert.equal(x.section.classList.contains('is-cinema-active'),true);
 assert.equal(x.counter.textContent,'01 / 03');
 assert.equal(x.panels[0].aria['aria-hidden'],'false');
 assert.equal(x.panels[1].aria['aria-hidden'],'true');
 x.advance(.51);
 assert.equal(x.counter.textContent,'02 / 03');
 assert.equal(x.panels[1].aria['aria-hidden'],'false');
 x.advance(.90);
 assert.equal(x.counter.textContent,'03 / 03');
 assert.equal(x.panels[2].aria['aria-hidden'],'false');
 assert.match(x.panels[2].photo.style.transform,/^scale\(/);
});
test('Selected Homes retains an accessible stacked fallback when motion is reduced',()=>{
 const x=collectionHarness(false);
 assert.equal(x.section.classList.contains('is-cinema-active'),false);
 assert.ok(x.panels.every(p=>p.inert===false));
 assert.ok(x.panels.every(p=>p.aria['aria-hidden']==='false'));
});

test('one fixed Discover This Home link follows the correct featured home during scroll',()=>{
 const x=collectionHarness(true);
 assert.match(x.propertyLink.href,/test-0\/$/);
 x.advance(.51);
 assert.match(x.propertyLink.href,/test-1\/$/);
 assert.equal(x.propertyLink.attrs['aria-label'],'Discover Test Home 1');
 x.advance(.90);
 assert.match(x.propertyLink.href,/test-2\/$/);
 assert.equal(x.propertyLink.attrs['aria-label'],'Discover Test Home 2');
});
