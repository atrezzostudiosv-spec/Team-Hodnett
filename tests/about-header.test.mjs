import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {renderAbout} from '../scripts/about.mjs';
import {header,dialogs} from '../scripts/templates.mjs';

const recognition={images:[
 {src:'assets/editorial/2026.webp',alt:'Sharon Hodnett, 2026 Five Star Legends, 12-year winner.'},
 {src:'assets/editorial/2024.webp',alt:'Sharon Hodnett, 2024 D Magazine Top Real Estate Producer.'},
 {src:'assets/editorial/realtrends.webp',alt:'The Thousand by RealTrends'},
 {src:'assets/editorial/2025.webp',alt:'Sharon Hodnett — 2025 Five Star Real Estate Agent, 12-Year Winner'}
]};

test('Meet Sharon biography includes full editorial sections with source and historic context',()=>{
 const html=renderAbout({recognition});
 for(const heading of ['HER STORY','THE RECORD','EXPERTISE','MEDIA &amp; PERSPECTIVE','AWARDS &amp; RECOGNITION','BEYOND REAL ESTATE']){
  assert.ok(html.includes(heading),heading+' section missing');
 }
 assert.match(html,/37<span>years<\/span>/);
 assert.match(html,/\$630<span>M\+<\/span>/);
 assert.match(html,/2026 biography/);
 assert.match(html,/Certified Luxury Home Marketing Specialist/);
 assert.match(html,/Certified Residential Specialist/);
 assert.match(html,/Eagle Mountain Lake/);
 assert.match(html,/The Home You Want to Own/);
 assert.match(html,/piano/);
 assert.match(html,/sharon\.webp/);
 assert.match(html,/teamhodnett\.com/);
 assert.match(html,/href="tel:\+18179947152"/);
});

test('Meet Sharon recognition only uses actual referenced archival image files',()=>{
 const html=renderAbout({recognition});
 for(const image of recognition.images)assert.ok(html.includes(image.src),image.src+' missing');
 assert.match(html,/href="\/awards\/"/);
});

test('desktop navigation distinguishes collection, past transactions, and search by town',()=>{
 const html=header();
 assert.equal((html.match(/data-header-nav/g)||[]).length,2);
 assert.match(html,/Featured Properties/);
 assert.match(html,/Available Properties/);
 assert.match(html,/Past Transactions/);
 assert.match(html,/href="\/properties\/sold\/"/);
 assert.match(html,/href="\/home-search\/listings\/\?city=Westlake"/);
 assert.match(html,/href="\/home-search\/listings\/\?city=Flower%20Mound"/);
 assert.match(html,/href="\/neighborhoods\/"/);
});

test('mobile navigation includes expandable property and town groups',()=>{
 const html=dialogs({cover:'assets/test.webp',title:'Test home'});
 assert.equal((html.match(/class="menu-group"/g)||[]).length,2);
 assert.match(html,/href="\/properties\/sold\/"/);
 assert.match(html,/href="\/home-search\/listings\/\?city=Southlake"/);
 assert.match(html,/href="\/home-search\/listings\/\?city=Argyle"/);
});

test('Media & Perspective uses the approved independent Sharon portrait with responsive framing',()=>{
 const html=renderAbout({recognition});
 const media=html.match(/<section class="about-media"[\s\S]*?<\/section>/)?.[0];
 assert.ok(media,'The media section exists');
 assert.ok(media.includes('assets/editorial/sharon-media-perspective-2026.png'));
 assert.ok(media.includes('width="1254" height="1254"'));
 assert.ok(media.includes('An experienced<br><em>voice in real estate.</em>'));
 assert.ok(media.includes('Explore her film archive'));
 assert.ok(!media.includes('sharon-scene-desktop.webp'));
 const original=readFileSync(new URL('../public/assets/editorial/sharon-media-perspective-2026.png',import.meta.url));
 assert.equal(original.length,2566444);
 assert.equal(original.subarray(0,8).toString('hex'),'89504e470d0a1a0a');
 const css=readFileSync(new URL('../public/src/about-atrezzo.css',import.meta.url),'utf8');
 assert.match(css,/object-position:50% 50%/);
});
