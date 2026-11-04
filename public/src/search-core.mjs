const fold=value=>String(value??'').normalize('NFD').replace(/[\u0300-\u036f]/g,'').toLowerCase();
const amount=text=>{const value=fold(text).replace(/[$,\s]/g,'');const match=value.match(/^(\d+(?:\.\d+)?)([mk])?$/);return match?Number(match[1])*(match[2]==='m'?1000000:match[2]==='k'?1000:1):null;};
export function parseQuery(input=''){
 let query=fold(input);const parsed={maxPrice:null,minPrice:null,beds:0,status:'',tokens:[]};
 query=query.replace(/(?:under|below|up to|max(?:imum)?)\s*\$?\s*([\d,.]+\s*[mk]?)/g,(_,v)=>{parsed.maxPrice=amount(v);return ' ';});
 query=query.replace(/(?:over|above|from|min(?:imum)?)\s*\$?\s*([\d,.]+\s*[mk]?)/g,(_,v)=>{parsed.minPrice=amount(v);return ' ';});
 query=query.replace(/(\d+)\s*\+?\s*(?:bedrooms?|beds?|br)\b/g,(_,v)=>{parsed.beds=Number(v);return ' ';});
 if(/\b(?:sold|past transactions?)\b/.test(query)){parsed.status='Sold';query=query.replace(/\b(?:sold|past transactions?)\b/g,' ');}
 if(/\bfor sale\b/.test(query)){parsed.status='For Sale';query=query.replace(/\bfor sale\b/g,' ');}
 parsed.tokens=query.replace(/[^a-z0-9\s-]/g,' ').split(/\s+/).filter(v=>v&&!['in','with','and','a','an','the','homes','home','houses','house','properties','property'].includes(v));
 return parsed;
}
export function searchProperties(properties,filters={}){
 const parsed=parseQuery(filters.query);const status=parsed.status||filters.status||'';
 const max=parsed.maxPrice??(Number(filters.maxPrice)||null),min=parsed.minPrice??(Number(filters.minPrice)||null),beds=Math.max(parsed.beds,Number(filters.beds)||0);
 const results=properties.filter(p=>{
  if(status&&p.status!==status)return false;
  if(filters.city&&fold(p.city)!==fold(filters.city))return false;
  if(beds&&(p.beds??-1)<beds)return false;
  if(filters.pool&&!p.has_pool)return false;
  if(min!==null&&(p.price===null||p.price<min))return false;
  if(max!==null&&(p.price===null||p.price>max))return false;
  const haystack=fold([p.title,p.address,p.city,p.zip,p.type,p.search_text,p.has_pool?'pool':''].join(' '));
  return parsed.tokens.every(token=>haystack.includes(token));
 });
 const sort=filters.sort||'featured';
 results.sort((a,b)=>{
  if(sort==='price-asc')return (a.price??Infinity)-(b.price??Infinity)||a.title.localeCompare(b.title);
  if(sort==='price-desc')return (b.price??-Infinity)-(a.price??-Infinity)||a.title.localeCompare(b.title);
  if(sort==='beds')return (b.beds??-1)-(a.beds??-1)||a.title.localeCompare(b.title);
  if(sort==='newest')return String(b.lastmod).localeCompare(String(a.lastmod))||a.title.localeCompare(b.title);
  const rank=p=>p.status==='For Sale'?3:p.status==='Pending'?2:p.status==='For Lease'?1:0;
  return rank(b)-rank(a)||(b.price??-Infinity)-(a.price??-Infinity)||a.title.localeCompare(b.title);
 });
 return results;
}
export function readFilters(params,defaults={}){
 return {query:params.get('q')||'',city:params.get('city')||defaults.city||'',status:params.has('status')?params.get('status'):(defaults.status??'For Sale'),minPrice:params.get('min')||'',maxPrice:params.get('max')||'',beds:params.get('beds')||'',pool:params.get('pool')==='1',sort:params.get('sort')||'featured'};
}
export const formatPrice=(value,status='')=>value===null?'Price not published':new Intl.NumberFormat('en-US',{style:'currency',currency:'USD',maximumFractionDigits:0}).format(value)+(status==='For Lease'?' / mo':'');
