import {readFile,readdir,stat,access} from 'node:fs/promises';
import path from 'node:path';
import {fileURLToPath} from 'node:url';
const root=path.resolve(fileURLToPath(new URL('../dist/',import.meta.url)));
const walk=async dir=>(await Promise.all((await readdir(dir,{withFileTypes:true})).map(async f=>f.isDirectory()?walk(path.join(dir,f.name)):path.join(dir,f.name)))).flat();
const files=await walk(root),htmlFiles=files.filter(f=>f.endsWith('.html'));let checked=0;const broken=[];
for(const f of htmlFiles){const text=await readFile(f,'utf8');if(!/<h1\b/.test(text))broken.push({page:path.relative(root,f),error:'Missing H1'});if(/elite-realtor-demo|Elite Real Estate|Steve Penate/.test(text))broken.push({page:path.relative(root,f),error:'Reference-site identity leaked'});
 for(const m of text.matchAll(/(?:href|src)=["']([^"']+)["']/g)){
  const u=m[1].replaceAll('&amp;','&');if(/^(?:https?:|tel:|mailto:|data:|#)/.test(u))continue;
  const p=u.split(/[?#]/)[0];if(!p)continue;
  const target=p.startsWith('/')?path.join(root,p):path.resolve(path.dirname(f),p);
  try{const info=await stat(target);if(info.isDirectory())await access(path.join(target,'index.html'));}catch{broken.push({page:path.relative(root,f),target:u});}
  checked++;
 }
}
const properties=JSON.parse(await readFile(new URL('../content/properties.json',import.meta.url),'utf8'));
for(const p of properties)for(const file of p.gallery){try{await access(path.join(root,file));}catch{broken.push({property:p.id,target:file});}}
const result={html_pages:htmlFiles.length,local_references_checked:checked,property_records:properties.length,broken_references:broken,assets_bytes:(await Promise.all(files.filter(f=>!f.endsWith('.html')).map(f=>stat(f)))).reduce((n,s)=>n+s.size,0)};
await writeResult(result);if(broken.length)process.exitCode=1;
async function writeResult(value){const {writeFile}=await import('node:fs/promises');await writeFile(new URL('../docs/static-validation.json',import.meta.url),JSON.stringify(value,null,2)+'\n');console.log(JSON.stringify(value,null,2));}
