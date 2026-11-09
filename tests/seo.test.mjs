import {readFileSync} from 'node:fs';
import test from 'node:test';
import assert from 'node:assert/strict';
import {createHash} from 'node:crypto';
import {makeSeo,canonicalUrl,socialPhotoPath,socialPhotoUrl,generateSitemap} from '../scripts/seo.mjs';
import {shell} from '../scripts/templates.mjs';

test('canonical URLs use the public HTTPS GitHub Pages site and preserved path prefix',()=>{
 const home=canonicalUrl('');
 assert.match(home,/^https:\/\/atrezzostudiosv-spec\.github\.io\/Team-Hodnett\/$/);
 assert.equal(canonicalUrl('neighborhoods/southlake'),home+'neighborhoods/southlake/');
 assert.equal(canonicalUrl('properties/123/'),home+'properties/123/');
});
test('social preview file fingerprint is stable between Node and the Pillow generator',()=>{
 const source='assets/editorial/southlake.webp';
 const expected=createHash('sha1').update(source,'utf8').digest('hex').slice(0,16);
 assert.equal(socialPhotoPath(source),'assets/social/'+expected+'.jpg');
 assert.equal(socialPhotoUrl(source),canonicalUrl('')+socialPhotoPath(source));
});
test('every page includes absolute JPEG Open Graph and iPhone-compatible Twitter cards',()=>{
 const body=makeSeo({title:'Explore Southlake',description:'Distinctive local living.',route:'neighborhoods/southlake',image:'assets/editorial/southlake.webp'});
 for(const tag of ['rel="canonical"','name="robots" content="index,follow','property="og:url"','property="og:title"','property="og:description"','property="og:image"','property="og:image:secure_url"','property="og:image:type" content="image/jpeg"','property="og:image:width" content="1200"','property="og:image:height" content="630"','name="twitter:card" content="summary_large_image"','name="twitter:image"']){
  assert.ok(body.includes(tag),'Expected SEO tag: '+tag);
 }
 assert.ok(body.includes(canonicalUrl('neighborhoods/southlake')));
 assert.ok(body.includes(socialPhotoUrl('assets/editorial/southlake.webp')));
 assert.match(body,/"@type":"RealEstateAgent"/);
 assert.match(body,/"@type":"WebPage"/);
 assert.match(body,/"@type":"BreadcrumbList"/);
 assert.doesNotMatch(body,/noindex|nofollow|Disallow/);
});
test('metadata escapes user-facing property data safely without ending the JSON-LD block',()=>{
 const html=makeSeo({title:'12 <Great> & "Nice" Court',description:'A <script> complex & beautiful property.',route:'properties/example'});
 assert.match(html,/12 &lt;Great&gt; &amp; &quot;Nice&quot; Court/);
 assert.match(html,/"@context":"https:\/\/schema\.org"/);
 assert.doesNotMatch(html,/<script> complex/);
});
test('site shell includes iPhone app icon and SEO only once',()=>{
 const html=shell({title:'Home',description:'Test description',body:'<h1>Sample</h1>',featured:{cover:'assets/editorial/landscape.webp',title:'Sample'}});
 assert.equal((html.match(/rel="canonical"/g)||[]).length,1);
 assert.equal((html.match(/property="og:image"/g)||[]).length,1);
 assert.match(html,/rel="apple-touch-icon"/);
 assert.doesNotMatch(html,/content="noindex,nofollow"/);
});
test('image sitemap includes distinct page URLs and deduplicates repeats',()=>{
 const xml=generateSitemap([{route:'',image:'assets/editorial/landscape.webp'},{route:'neighborhoods/southlake',image:'assets/editorial/southlake.webp'},{route:'neighborhoods/southlake',image:'assets/editorial/southlake.webp'}]);
 assert.equal((xml.match(/<url>/g)||[]).length,2);
 assert.equal((xml.match(/<image:image>/g)||[]).length,2);
 assert.match(xml,/sitemaps\.org\/schemas\/sitemap/);
 assert.match(xml,/https:\/\/atrezzostudiosv-spec\.github\.io\/Team-Hodnett\/neighborhoods\/southlake\//);
});

test('homepage and brand preview defaults use Sharon’s approved portrait',()=>{
 const selected='assets/social/sharon-hodnett-editorial-share.jpg';
 const homepage=makeSeo({title:'Luxury Real Estate in North Texas',description:'The Hodnett Team',route:''});
 const biography=makeSeo({title:'Meet Sharon',description:'A career rooted in North Texas',route:'about',image:selected});
 assert.ok(homepage.includes('property="og:image" content="'+socialPhotoUrl(selected)+'"'));
 assert.ok(biography.includes('property="og:image" content="'+socialPhotoUrl(selected)+'"'));
 assert.ok(homepage.includes('"image":"'+socialPhotoUrl(selected)+'"'));
 assert.ok(!homepage.includes(socialPhotoUrl('assets/editorial/landscape.webp')));
});
test('property and community shared links retain their own photography',()=>{
 const propertyPhoto='assets/properties/example-house.webp';
 const townPhoto='assets/editorial/southlake.webp';
 const listing=makeSeo({title:'Example home',description:'Southlake listing',route:'properties/example-house',image:propertyPhoto});
 const town=makeSeo({title:'Southlake',description:'Community guide',route:'neighborhoods/southlake',image:townPhoto});
 assert.ok(listing.includes('property="og:image" content="'+socialPhotoUrl(propertyPhoto)+'"'));
 assert.ok(town.includes('property="og:image" content="'+socialPhotoUrl(townPhoto)+'"'));
});

test('the uploaded exact artwork is committed and used without text re-overlay',()=>{
 const approved='assets/social/sharon-hodnett-editorial-share.jpg';
 const bytes=readFileSync(new URL('../public/'+approved,import.meta.url));
 assert.ok(bytes.length>60000,'Social artwork should be a real image file');
 assert.equal(bytes[0],0xff);
 assert.equal(bytes[1],0xd8);
 assert.equal(socialPhotoPath(approved),approved,'Approved artwork should not be hashed or regenerated');
 const page=makeSeo({title:'Meet Sharon',description:'North Texas luxury real estate',route:'about'});
 assert.match(page,/property="og:image" content="https:\/\/atrezzostudiosv-spec.github.io\/Team-Hodnett\/assets\/social\/sharon-hodnett-editorial-share\.jpg"/);
 assert.match(page,/name="twitter:image" content="https:\/\/atrezzostudiosv-spec.github.io\/Team-Hodnett\/assets\/social\/sharon-hodnett-editorial-share\.jpg"/);
});
