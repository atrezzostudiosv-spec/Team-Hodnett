/* Team Hodnett | canonical metadata and share previews.
 * SITE_ORIGIN and SITE_BASE_PATH can be overridden when the site moves
 * from GitHub Pages to an owned domain. The default targets the live Pages URL.
 */
import {createHash} from 'node:crypto';

export const siteOrigin=(process.env.SITE_ORIGIN||'https://atrezzostudiosv-spec.github.io').replace(/\/+$/,'');
export const sitePrefix='/'+(process.env.SITE_BASE_PATH||'Team-Hodnett').replace(/^\/+|\/+$/g,'')+'/';
const esc=value=>String(value??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const escXml=esc;
export function canonicalUrl(route=''){
 const path=String(route).replace(/^\/+|\/+$/g,'');
 return siteOrigin+sitePrefix+(path?path+'/':'');
}
export function socialPhotoPath(source){
 const key=String(source||'assets/editorial/landscape.webp');
 return 'assets/social/'+createHash('sha1').update(key,'utf8').digest('hex').slice(0,16)+'.jpg';
}
export function socialPhotoUrl(source){
 return siteOrigin+sitePrefix+socialPhotoPath(source);
}
export function makeSeo({title,description,route='',image='assets/editorial/landscape.webp',kind='website',indexable=true}){
 const cleanTitle=String(title||'The Hodnett Team').trim();
 const fullTitle=cleanTitle.includes('Sharon Hodnett')?cleanTitle:cleanTitle+' | Sharon Hodnett';
 const cleanDescription=String(description||'Explore North Texas homes and communities with The Hodnett Team.').trim().replace(/\s+/g,' ');
 const canonical=canonicalUrl(route);
 const imageUrl=socialPhotoUrl(image);
 const robots=indexable?'index,follow,max-image-preview:large,max-snippet:-1,max-video-preview:-1':'noindex,follow,max-image-preview:large';
 const category=route.startsWith('neighborhoods/')?'Community guide':route.startsWith('properties/')?'Property':route.startsWith('blog/')?'Journal':'Website';
 const crumbs=[{'@type':'ListItem',position:1,name:'Home',item:canonicalUrl('')}];
 const parent=category==='Community guide'?'neighborhoods':category==='Property'?'homes':category==='Journal'?'blog':null;
 if(parent){
  crumbs.push({'@type':'ListItem',position:2,name:parent==='neighborhoods'?'Communities':parent==='homes'?'Properties':'Journal',item:canonicalUrl(parent)});
 }
 if(route)crumbs.push({'@type':'ListItem',position:crumbs.length+1,name:cleanTitle,item:canonical});
 const orgId=canonicalUrl('')+'#real-estate-team';
 const entities=[
  {'@type':'RealEstateAgent','@id':orgId,name:'The Hodnett Team | Sharon Hodnett',url:canonicalUrl(''),telephone:'+1-817-994-7152',image:socialPhotoUrl('assets/editorial/landscape.webp'),areaServed:[{'@type':'Place',name:'Southlake, Texas'},{'@type':'Place',name:'Dallas–Fort Worth, Texas'}]},
  {'@type':'WebSite','@id':canonicalUrl('')+'#website',url:canonicalUrl(''),name:'Sharon Hodnett | The Hodnett Team',inLanguage:'en-US',publisher:{'@id':orgId}},
  {'@type':'WebPage','@id':canonical+'#webpage',url:canonical,name:fullTitle,description:cleanDescription,inLanguage:'en-US',isPartOf:{'@id':canonicalUrl('')+'#website'},primaryImageOfPage:{'@type':'ImageObject',url:imageUrl,width:1200,height:630}}
 ];
 if(crumbs.length>1)entities.push({'@type':'BreadcrumbList','@id':canonical+'#breadcrumbs',itemListElement:crumbs});
 const jsonLd=JSON.stringify({'@context':'https://schema.org','@graph':entities}).replace(/</g,'\\u003c');
 return [
  '<link rel="canonical" href="'+esc(canonical)+'">',
  '<meta name="robots" content="'+esc(robots)+'">',
  '<meta property="og:type" content="'+(kind==='article'?'article':'website')+'">',
  '<meta property="og:site_name" content="Sharon Hodnett | The Hodnett Team">',
  '<meta property="og:locale" content="en_US">',
  '<meta property="og:url" content="'+esc(canonical)+'">',
  '<meta property="og:title" content="'+esc(fullTitle)+'">',
  '<meta property="og:description" content="'+esc(cleanDescription)+'">',
  '<meta property="og:image" content="'+esc(imageUrl)+'">',
  '<meta property="og:image:secure_url" content="'+esc(imageUrl)+'">',
  '<meta property="og:image:type" content="image/jpeg">',
  '<meta property="og:image:width" content="1200">',
  '<meta property="og:image:height" content="630">',
  '<meta property="og:image:alt" content="'+esc(cleanTitle+' | The Hodnett Team')+'">',
  '<meta name="twitter:card" content="summary_large_image">',
  '<meta name="twitter:title" content="'+esc(fullTitle)+'">',
  '<meta name="twitter:description" content="'+esc(cleanDescription)+'">',
  '<meta name="twitter:image" content="'+esc(imageUrl)+'">',
  '<meta name="twitter:image:alt" content="'+esc(cleanTitle+' | The Hodnett Team')+'">',
  '<script type="application/ld+json">'+jsonLd+'</script>'
 ].join('');
}
export function generateSitemap(items){
 const dedup=new Map();
 for(const {route,indexable=true,image} of items){
  if(indexable)dedup.set(canonicalUrl(route),image);
 }
 const urls=[...dedup].map(([url,image])=>'<url><loc>'+escXml(url)+'</loc>'+(image?'<image:image><image:loc>'+escXml(socialPhotoUrl(image))+'</image:loc></image:image>':'')+'</url>');
 return '<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9" xmlns:image="http://www.google.com/schemas/sitemap-image/1.1">\n'+urls.join('\n')+'\n</urlset>\n';
}
