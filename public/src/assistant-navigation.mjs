/* ATREZZO · Single-destination routing for the local concierge.
   Returns website URLs only. The catalog is a dated snapshot, never live MLS. */
import {interpretQuestion,findWebsiteAnswers,normalize} from './assistant-core.mjs';
import {searchProperties} from './search-core.mjs';

const fold=value=>normalize(value).replace(/[^a-z0-9]+/g,' ').trim();
const boundary=(text,phrase)=>phrase&&(' '+text+' ').includes(' '+phrase+' ');
const streetTerm=value=>fold(value).replace(/\b(?:street|st|avenue|ave|drive|dr|road|rd|court|ct|lane|ln|trail|trl|boulevard|blvd|circle|cir|place|pl|way)\b/g,' ').replace(/\s+/g,' ').trim();
export function detectAssistantLanguage(question,browserLanguage='en'){
 const q=fold(question);
 if(/\b(busco|buscar|quiero|casas|propiedad|propiedades|comprar|vender|venta|precio|donde|cuanto|cual|muestrame|ensename|necesito|informacion|habitaciones|alquiler|poblacion|comunidad|sobre|encuentra|ver)\b/.test(q))return 'es';
 if(/\b(show|find|homes|houses|properties|listing|price|where|what|search|looking|about|community|neighborhood|rent|sale|buy|bedrooms)\b/.test(q))return 'en';
 return String(browserLanguage).toLowerCase().startsWith('es')?'es':'en';
}
function matchingAddress(question,properties=[]){
 const cleaned=fold(question),simplified=streetTerm(question);
 const candidates=properties.filter(p=>{
  const title=fold(p.title);
  if(!title||title.length<6)return false;
  const comparable=streetTerm(title);
  if(boundary(cleaned,title)||boundary(simplified,comparable))return true;
  const number=title.match(/^\d+\b/)?.[0];
  const street=comparable.replace(/^\d+\s*/,'').trim();
  // Street-only navigation is safe only if the street name uniquely identifies a listing.
  return street.length>=6&&boundary(simplified,street)&&(!number||!/\b\d{3,6}\b/.test(cleaned)||boundary(cleaned,number));
 });
 return candidates.length===1?candidates[0]:null;
}
function propertyUrl(filters,base){
 const params=new URLSearchParams();
 params.set('status',filters.status||'');
 if(filters.city)params.set('city',filters.city);
 if(filters.query)params.set('q',filters.query);
 if(filters.beds)params.set('beds',String(filters.beds));
 if(filters.pool)params.set('pool','1');
 if(filters.minPrice)params.set('min',String(filters.minPrice));
 if(filters.maxPrice)params.set('max',String(filters.maxPrice));
 return base+'homes/?'+params.toString();
}
const labels={
 es:{
  property:p=>'Encontré la ficha de '+p.title+'.',
  propertyAction:'Ver propiedad',
  homes:city=>city?'Ver las propiedades de '+city+'.':'Explora las propiedades disponibles en nuestro catálogo.',
  homesAction:'Ver propiedades',
  community:city=>'Descubre la comunidad de '+city+'.',
  communityAction:'Explorar comunidad',
  page:'Encontré la página correspondiente en nuestro sitio.',
  pageAction:'Abrir página',
  fallback:'Explora las secciones de nuestro sitio para continuar.',
  fallbackAction:'Explorar el sitio'
 },
 en:{
  property:p=>'Here is the property page for '+p.title+'.',
  propertyAction:'View property',
  homes:city=>city?'Explore homes in '+city+'.':'Explore the homes in our saved collection.',
  homesAction:'View homes',
  community:city=>'Discover the '+city+' community.',
  communityAction:'Explore community',
  page:'I found the matching page on our website.',
  pageAction:'Open page',
  fallback:'Explore the website to continue.',
  fallbackAction:'Explore the site'
 }
};
export function resolveAssistantDestination(question,properties=[],entries=[],base='/',browserLanguage='en'){
 const raw=String(question||'').trim(),language=detectAssistantLanguage(raw,browserLanguage),copy=labels[language],q=fold(raw);
 if(!raw)return {href:'',message:'',label:'',language,kind:'empty'};
 const matched=matchingAddress(raw,properties);
 if(matched)return {href:base+'properties/'+encodeURIComponent(matched.id)+'/',message:copy.property(matched),label:copy.propertyAction,language,kind:'property'};
 const parsed=interpretQuestion(raw,properties);
 const communities=entries.filter(e=>e.type==='Community guide');
 const selected=communities.find(e=>boundary(q,fold(e.title)));
 // A locality query without purchase or listing intent goes to the community guide.
 if(selected&&parsed.kind!=='properties')
  return {href:base+selected.href,message:copy.community(selected.title),label:copy.communityAction,language,kind:'community'};
 if(parsed.kind==='properties'){
  // Do not force an arbitrary listing when a city-level or multi-filter request is made.
  const matches=searchProperties(properties,{...parsed,sort:'featured'});
  return {href:propertyUrl(parsed,base),message:copy.homes(parsed.city),label:copy.homesAction,language,kind:'homes',matchCount:matches.length};
 }
 // A simple named street should still resolve to the filtered search when not unique.
 const addressPattern=/\b\d{3,6}\s+[a-z]+\b/.test(q);
 if(addressPattern)return {href:base+'homes/?'+new URLSearchParams({status:'',q:raw}).toString(),message:copy.homes(''),label:copy.homesAction,language,kind:'homes'};
 const answers=findWebsiteAnswers(raw,entries,1);
 if(answers.length)return {href:base+answers[0].entry.href,message:copy.page,label:copy.pageAction,language,kind:'page'};
 return {href:base+'sitemap/',message:copy.fallback,label:copy.fallbackAction,language,kind:'fallback'};
}
