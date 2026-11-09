import {readFile,readdir,stat,access} from 'node:fs/promises';
import path from 'node:path';
import {fileURLToPath} from 'node:url';
import {canonicalUrl,siteOrigin,sitePrefix} from './seo.mjs';

const root=path.resolve(fileURLToPath(new URL('../dist/',import.meta.url)));
const walk=async dir=>(await Promise.all((await readdir(dir,{withFileTypes:true})).map(async f=>f.isDirectory()?walk(path.join(dir,f.name)):path.join(dir,f.name)))).flat();
const files=await walk(root),htmlFiles=files.filter(f=>f.endsWith('.html'));
let checked=0,seoChecked=0;
const broken=[],canonicalSet=new Set(),sharedPhotos=new Set();

function attr(html,name,kind='name'){
 const key=kind==='property'?'property':'name';
 const tag=html.match(new RegExp('<meta\\s+'+key+'="'+name+'"\\s+content="([^"]*)"','i'));
 return tag?.[1]||null;
}
function fail(page,error){broken.push({page,error});}
for(const f of htmlFiles){
 const page=path.relative(root,f).replaceAll(path.sep,'/');
 const route=page==='index.html'?'':page.replace(/\/index\.html$/,'');
 const expected=canonicalUrl(route);
 const html=await readFile(f,'utf8');
 if(!/<h1\b/.test(html))fail(page,'Missing H1');
 if(/elite-realtor-demo|Elite Real Estate|Steve Penate/.test(html))fail(page,'Reference-site identity leaked');
 if(!/<title>[^<]+<\/title>/.test(html))fail(page,'Missing title');
 if(!attr(html,'description'))fail(page,'Missing meta description');
 const canonical=html.match(/<link\s+rel="canonical"\s+href="([^"]+)"/)?.[1];
 if(canonical!==expected)fail(page,'Incorrect canonical: '+String(canonical));
 if(canonicalSet.has(canonical))fail(page,'Duplicate canonical');
 canonicalSet.add(canonical);
 const ogUrl=attr(html,'og:url','property'),ogImage=attr(html,'og:image','property');
 if(ogUrl!==expected)fail(page,'Open Graph URL does not match canonical');
 if(!attr(html,'og:title','property')||!attr(html,'og:description','property'))fail(page,'Incomplete Open Graph title/description');
 if(attr(html,'og:image:width','property')!=='1200'||attr(html,'og:image:height','property')!=='630')fail(page,'Missing 1200x630 share image dimensions');
 if(attr(html,'og:image:type','property')!=='image/jpeg')fail(page,'Share image MIME is not JPEG');
 if(attr(html,'twitter:card')!=='summary_large_image'||!attr(html,'twitter:image'))fail(page,'Incomplete Twitter/X image card');
 if(!/<script type="application\/ld\+json">/.test(html))fail(page,'Missing structured data');
 const robots=attr(html,'robots');
 if(!robots||!robots.includes('index,follow'))fail(page,'Crawlable SEO configuration missing');
 if(ogImage){
  try{
   const parsed=new URL(ogImage);
   if(parsed.origin!==siteOrigin||!parsed.pathname.startsWith(sitePrefix)||!parsed.pathname.endsWith('.jpg'))throw Error('Expected absolute site JPEG URL');
   const relative=decodeURIComponent(parsed.pathname.slice(sitePrefix.length));
   if(relative.includes('..'))throw Error('Unsafe path');
   const local=path.join(root,relative);
   const info=await stat(local);
   if(!info.isFile()||info.size<5000)throw Error('Missing or implausibly small JPEG');
   sharedPhotos.add(relative);
  }catch(error){fail(page,'Invalid or missing share image '+ogImage+': '+error.message);}
 }else fail(page,'Missing Open Graph image');
 for(const m of html.matchAll(/(?:href|src)=["']([^"']+)["']/g)){
  const u=m[1].replaceAll('&amp;','&');
  if(/^(?:https?:|tel:|mailto:|data:|#)/.test(u))continue;
  const urlPath=u.split(/[?#]/)[0],siteBase=(process.env.SITE_BASE_PATH||'').replace(/^\/+|\/+$/g,'');
  const p=siteBase&&urlPath.startsWith('/'+siteBase+'/')?urlPath.slice(siteBase.length+1):urlPath;
  if(!p)continue;
  const target=p.startsWith('/')?path.join(root,p):path.resolve(path.dirname(f),p);
  try{
   const info=await stat(target);
   if(info.isDirectory())await access(path.join(target,'index.html'));
  }catch{broken.push({page,target:u});}
  checked++;
 }
 seoChecked++;
}
const sitemap=await readFile(path.join(root,'sitemap.xml'),'utf8');
const xmlUrls=[...sitemap.matchAll(/<loc>([^<]+)<\/loc>/g)].map(x=>x[1]);
for(const canonical of canonicalSet)if(!xmlUrls.includes(canonical))fail('sitemap.xml','Canonical absent from XML sitemap: '+canonical);
if(new Set(xmlUrls).size!==xmlUrls.length)fail('sitemap.xml','Duplicate sitemap URLs');
if(xmlUrls.length!==htmlFiles.length)fail('sitemap.xml','Expected '+htmlFiles.length+' pages, found '+xmlUrls.length);
const robots=await readFile(path.join(root,'robots.txt'),'utf8');
if(robots.includes('Disallow: /')||!robots.includes('Allow: /')||!robots.includes(siteOrigin+sitePrefix+'sitemap.xml'))fail('robots.txt','Crawler or sitemap directive invalid');
const appleIcon=await stat(path.join(root,'apple-touch-icon.png')).catch(()=>null);
if(!appleIcon||appleIcon.size<1000)fail('apple-touch-icon.png','iPhone icon missing');

const properties=JSON.parse(await readFile(new URL('../content/properties.json',import.meta.url),'utf8'));
for(const p of properties)for(const image of p.gallery){
 try{await access(path.join(root,image));}catch{broken.push({property:p.id,target:image});}
}
const result={
 html_pages:htmlFiles.length,seo_pages_validated:seoChecked,sitemap_pages:xmlUrls.length,
 social_preview_jpegs_used:sharedPhotos.size,local_references_checked:checked,
 property_records:properties.length,broken_references:broken,
 assets_bytes:(await Promise.all(files.filter(f=>!f.endsWith('.html')).map(f=>stat(f)))).reduce((n,s)=>n+s.size,0)
};
await writeResult(result);
if(broken.length)process.exitCode=1;
async function writeResult(value){
 const {writeFile}=await import('node:fs/promises');
 await writeFile(new URL('../docs/static-validation.json',import.meta.url),JSON.stringify(value,null,2)+'\n');
 console.log(JSON.stringify(value,null,2));
}
