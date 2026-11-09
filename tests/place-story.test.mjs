import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import vm from 'node:vm';
import {renderHome} from '../scripts/home.mjs';

const source=readFileSync(new URL('../public/src/vendor/editorial-gallery.js',import.meta.url),'utf8');
const css=readFileSync(new URL('../public/src/place-immersive.css',import.meta.url),'utf8');
const classList=(initial=[])=>{
 const values=new Set(initial);
 return {
  contains:name=>values.has(name),
  toggle(name,state){const desired=state??!values.has(name);if(desired)values.add(name);else values.delete(name);},
  add:name=>values.add(name),
  remove:name=>values.delete(name)
 };
};
function galleryHarness(){
 let scroll=0;
 const callbacks=[],events={};
 const intro={getBoundingClientRect:()=>({top:-scroll,height:1035,bottom:1035-scroll})};
 const introPhoto={classList:classList(['is-active'])};
 const entries=Array.from({length:6},(_,i)=>({
  classList:classList(),addEventListener(){},
  getBoundingClientRect:()=>({top:1035+1548*i-scroll,height:1548,bottom:1035+1548*(i+1)-scroll})
 }));
 const photos=Array.from({length:6},()=>({classList:classList()}));
 const indexNumber={textContent:'NORTH TEXAS'};
 const style={values:{},setProperty(k,v){this.values[k]=v;}};
 const root={
  classList:classList(['atg1','is-immersive']),style,
  querySelector:selector=>({
   '.place-index-intro':intro,'.atg1-index__intro-photo':introPhoto,
   '[data-atg1-index-number]':indexNumber
  })[selector]||null,
  querySelectorAll:selector=>({
   '.atg1-index__entry':entries,
   '.atg1-index__photo:not(.atg1-index__intro-photo)':photos
  })[selector]||[]
 };
 const window={
  innerWidth:1500,innerHeight:900,
  matchMedia:()=>({matches:false,addEventListener(){}}),
  addEventListener:(name,fn)=>{events[name]=fn;},
  requestAnimationFrame:fn=>{callbacks.push(fn);return callbacks.length;},
  cancelAnimationFrame(){}
 };
 vm.runInNewContext(source,{window,document:{},AbortController});
 const gallery=window.AtrezzoEditorialGallery01.init(root);
 const flush=()=>{while(callbacks.length)callbacks.shift()();};
 flush();
 return {gallery,root,photos,introPhoto,entries,indexNumber,style,
  scrollTo(y){scroll=y;events.scroll?.();flush();}
 };
}

test('intro photograph is a unique asset, not Southlake first community picture',()=>{
 const code=readFileSync(new URL('../scripts/home.mjs',import.meta.url),'utf8');
 assert.match(code,/placeIntroImage='assets\/editorial\/landscape\.webp'/);
 assert.match(code,/atg1-index__intro-photo is-active/);
 assert.match(code,/places\.map\(c=>[^;]*atg1-index__photo/);
 assert.match(code,/atg1-index__entry-content/);
});
test('introduction stays visible before Southlake, then each town advances on scroll',()=>{
 const x=galleryHarness();
 assert.equal(x.introPhoto.classList.contains('is-active'),true);
 assert.equal(x.photos[0].classList.contains('is-active'),false);
 assert.equal(x.indexNumber.textContent,'NORTH TEXAS');
 x.scrollTo(500);
 assert.equal(x.introPhoto.classList.contains('is-active'),false);
 assert.equal(x.photos[0].classList.contains('is-active'),true);
 assert.equal(x.indexNumber.textContent,'01 / 06');
 x.scrollTo(2200);
 assert.equal(x.photos[0].classList.contains('is-active'),false);
 assert.equal(x.photos[1].classList.contains('is-active'),true);
 assert.equal(x.indexNumber.textContent,'02 / 06');
 assert.ok(+x.style.values['--place-photo-zoom']>=1.028);
});
test('native scrolling retains longer 1.5-viewport reading holds and reduced-motion fallback',()=>{
 assert.match(css,/min-height:172svh/);
 assert.match(css,/min-height:150svh/);
 assert.match(css,/\.atg1-index__entry-content\{\s*position:sticky/);
 assert.match(css,/\.atg1-index__entry-content\{\s*position:static!important/);
});
