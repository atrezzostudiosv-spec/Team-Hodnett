/* ATREZZO · Local, citation-led property and page search. No external AI service. */
export const normalize = value => String(value ?? '').normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase();
const clean = value => normalize(value).replace(/[^a-z0-9\s.-]/g, ' ').replace(/\s+/g, ' ').trim();
const stop = new Set([
  'a','an','the','and','or','for','with','in','near','of','on','to','is','are','what','where','which','how',
  'show','find','search','looking','look','me','my','i','want','please','can','you','do','have','about','all','any',
  'una','uno','unas','unos','el','la','los','las','en','de','del','para','por','con','y','o','que','cual','cuales','como',
  'quiero','busco','buscar','muestra','muestrame','mostrar','necesito','dame','tienes','hay','ver','todas','todos','me',
  'casa','casas','hogar','hogares','vivienda','viviendas','propiedad','propiedades','inmuebles',
  'home','homes','house','houses','property','properties','listing','listings','available','disponibles','disponible',
  'encontrar','saber','informacion','propertys'
]);
const words = text => clean(text).split(/\s+/).filter(t => t.length > 1 && !stop.has(t));
const numbers = {one:1,two:2,three:3,four:4,five:5,six:6,seven:7,eight:8,uno:1,una:1,dos:2,tres:3,cuatro:4,cinco:5,seis:6,siete:7,ocho:8};
const amount = (value,scale='') => {
 const number=Number(String(value).replace(/,/g,''));
 if(!Number.isFinite(number))return null;
 return number*(scale.match(/m|million|millon/) ? 1000000:scale.match(/k|thousand|mil/) ? 1000:1);
};
function matchMoney(source,phrase){
 const r=new RegExp('(?:'+phrase+')\\s*(?:\\$|usd\\s*)?([\\d,.]+)\\s*(millones?|millions?|million|millon|m|mil|thousand|k)?\\b','i');
 const hit=source.match(r);
 return hit?amount(hit[1],hit[2]||''):null;
}
const escapePattern = value => String(value).replace(/[-/\\^$*+?.()|[\]{}]/g,'\\$&');
export function interpretQuestion(question,properties=[]){
 const q=normalize(question).trim();
 const cities=[...new Set(properties.map(p=>p.city).filter(Boolean))].sort((a,b)=>b.length-a.length);
 const city=cities.find(c=>new RegExp('(^|[^a-z])'+escapePattern(normalize(c))+'([^a-z]|$)').test(q))||'';
 const houseWords=/\b(casa|casas|vivienda|viviendas|propiedad|propiedades|inmueble|inmuebles|home|homes|house|houses|property|properties|listing|listings|compra|comprar|venta|vender|rent|rental|lease|alquiler|alquilar|bed|beds|bedroom|bedrooms|habitaciones|habitacion|recamaras|recamara|dormitorios|dormitorio|piscina|alberca|pool|mls)\b/i;
 const address=properties.find(p=> {
  const title=normalize(p.title);return title.length>=7&&q.includes(title);
 });
 const priceQuestion=/\b(price|precio|cost|cuanto cuesta|how much)\b/.test(q);
 const hasMoney=/\$\s*\d|\b(?:menos de|under|below|up to|hasta|more than|over|above|mas de)\s*(?:\$|\d)/i.test(q);
 const propertyIntent=Boolean(address||houseWords.test(q)||hasMoney||(city&&(/\b(show|find|busco|busca|muestra|list|listame|give me|quiero ver)\b/.test(q)&&!/\b(about|sobre|information|informacion|guide|guia)\b/.test(q))));
 if(!propertyIntent)return {kind:'knowledge',question:q};
 let residual=q;
 if(city)residual=residual.replace(new RegExp(escapePattern(normalize(city)),'i'),' ');
 const isSold=/\b(sold|vendid[ao]s?|past sales|ventas anteriores)\b/.test(q);
 const isRent=/\b(for rent|for lease|rental|alquiler|alquilar|renta|arrendar)\b/.test(q);
 const isSale=/\b(for sale|en venta|a la venta|comprar|buy|compra)\b/.test(q);
 const status=isSold?'Sold':isRent?'For Lease':isSale?'For Sale':'';
 const pool=/\b(piscina|alberca|pool|swimming)\b/.test(q);
 const bedMatch=q.match(/\b(\d+|one|two|three|four|five|six|seven|eight|uno|una|dos|tres|cuatro|cinco|seis|siete|ocho)\s*\+?\s*(beds?|bedrooms?|habitaciones?|recamaras?|dormitorios?|cuartos?)\b/);
 const beds=bedMatch ? (Number(bedMatch[1])||numbers[bedMatch[1]]||0):0;
 const maxPrice=matchMoney(q,'under|below|up to|less than|maximum|max|menos de|hasta|por debajo de|no mas de');
 const minPrice=matchMoney(q,'over|above|more than|minimum|min|mas de|desde|a partir de');
 const zipMatch=q.match(/\b\d{5}\b/);
 residual=residual
  .replace(/\b(?:under|below|up to|less than|maximum|max|menos de|hasta|por debajo de|no mas de|over|above|more than|minimum|min|mas de|desde|a partir de)\s*(?:\$|usd\s*)?[\d,.]+\s*(?:millones?|millions?|million|millon|m|mil|thousand|k)?\b/g,' ')
  .replace(/\b(?:\d+|one|two|three|four|five|six|seven|eight|uno|una|dos|tres|cuatro|cinco|seis|siete|ocho)\s*\+?\s*(?:beds?|bedrooms?|habitaciones?|recamaras?|dormitorios?|cuartos?)\b/g,' ')
  .replace(/\b(?:piscina|alberca|pool|swimming|en venta|for sale|for rent|for lease|rental|alquiler|renta|arrendar|sold|vendidos?|vendidas?|past sales|compra|comprar|buy)\b/g,' ');
 const terms=words(residual);
 // City, property-type words and filters are removed; street names and ZIPs are retained.
 const query=terms.join(' ');
 return {kind:'properties',city,status,pool,beds,maxPrice,minPrice,query,question:q,priceQuestion,zip:zipMatch?.[0]||''};
}
export function findWebsiteAnswers(question,entries=[],limit=3){
 const tokens=[...new Set(words(question))];
 if(!tokens.length)return [];
 const results=entries.map(e=>{
  const heading=normalize(e.title),summary=normalize(e.description),text=normalize(e.text);
  const score=tokens.reduce((n,t)=>n+(heading.includes(t)?8:0)+(summary.includes(t)?4:0)+(text.includes(t)?1:0),0);
  const snippets=String(e.text||e.description||'').split(/\n+/).map(s=>s.trim()).filter(s=>s.length>35);
  const excerpt=snippets.sort((a,b)=>{
   const relevance=s=>tokens.reduce((n,t)=>n+(normalize(s).includes(t)?1:0),0);
   return relevance(b)-relevance(a);
  })[0]||e.description||'';
  return {entry:e,score,excerpt:excerpt.slice(0,360)};
 }).filter(x=>x.score>0).sort((a,b)=>b.score-a.score);
 return results.slice(0,limit);
}
