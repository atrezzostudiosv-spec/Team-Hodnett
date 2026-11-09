import test from 'node:test';
import assert from 'node:assert/strict';
import {renderHome} from '../scripts/home.mjs';
const cities=['southlake','westlake','colleyville','grapevine','flower-mound','keller'];
const communities=cities.map(slug=>({slug,name:slug.replace(/-/g,' '),cover:'assets/editorial/'+slug+'.webp'}));
const featured=['Example One','Example Two','Example Three'].map((title,i)=>({
 title,id:'test-'+i,city:'Southlake',price:650000+i*50000,status:'For Sale',
 beds:4,baths:3,sqft:3000,cover:'assets/example'+i+'.webp',
 gallery:['assets/example'+i+'.webp','assets/second'+i+'.webp']
}));
const recognition={images:[
 {src:'assets/editorial/award-2026.webp',alt:'Sharon Hodnett, 2026 Five Star Legends, 12-year winner.'},
 {src:'assets/editorial/award-2024.webp',alt:'Sharon Hodnett, 2024 D Magazine Top Real Estate Producer.'},
 {src:'assets/editorial/award-2025.webp',alt:'2025 Best of the Best Top 10 Real Estate Agents award'},
 {src:'assets/editorial/award-realtrends.webp',alt:'The Thousand by RealTrends'},
 {src:'assets/editorial/award-five-star.webp',alt:'Sharon Hodnett — 2025 Five Star Real Estate Agent'},
 {src:'assets/editorial/award-producers.webp',alt:'2023 DFW Real Producers Top Agent award badge'}
]};
const videos=[{id:'pZeJBjZkZU0',title:'Sharon Hodnett - A Departure from the Ordinary - Listing Presentation',cover:'assets/editorial/sharon-film.webp',url:'https://www.youtube.com/watch?v=pZeJBjZkZU0'}];
const render=()=>renderHome({featured,communities,homeArticles:[],journalCard:()=>'',mainQuote:{name:'Client',quote:'Lovely service. Everything was excellent.'},excerpt:'Lovely service.',client:{stats:[{value:'30+',label:'Years In Business'},{value:'$2.3 Billion',label:'Closed volume as an office'},{value:'1,750 +',label:'Total Transactions'}]},recognition,videos});
test('homepage flows from entry film to one Meet Sharon chapter, recognition and Team',()=>{
 const html=render();
 const order=[
  'class="hero hero-film"',
  'id="personal-connection"',
  'id="experience-in-numbers"',
  'id="awards-recognition"',
  'id="hodnett-team"',
  'id="collection"'
 ].map(needle=>html.indexOf(needle));
 assert.ok(order.every(x=>x>=0), 'every approved chapter should exist');
 assert.deepEqual([...order].sort((a,b)=>a-b),order,'story follows the agreed order');
 assert.equal((html.match(/id="personal-connection"/g)||[]).length,1);
 assert.equal((html.match(/id="hodnett-team"/g)||[]).length,1);
});
test('Meet Sharon merges the original story and film into a single portrait with a biography link',()=>{
 const html=render();
 assert.match(html,/MEET SHARON \/ A DEPARTURE FROM THE ORDINARY/);
 assert.match(html,/Experience\.<br>Perspective\.<br>A personal connection\./);
 assert.match(html,/sharon-scene-desktop\.webp/);
 assert.match(html,/href="\/about\/"/);
 assert.doesNotMatch(html,/id="sharon-story"/);
 assert.doesNotMatch(html,/data-sharon-film/);
 assert.doesNotMatch(html,/connection-film__motion/);
});
test('recognition showcases known saved badges with descriptive text and dated context',()=>{
 const html=render();
 assert.match(html,/2026 Five Star Legends/);
 assert.match(html,/2024 D Magazine Top Real Estate Producer/);
 assert.match(html,/The Thousand by RealTrends/);
 assert.match(html,/Historical recognitions are shown with their original dates/);
 assert.match(html,/href="\/awards\/"/);
});

test('The Hodnett Team keeps original full-bleed pinned image and scroll reveal',()=>{
 const html=render();
 assert.match(html,/class="team-scroll-story" data-team-scroll/);
 assert.match(html,/class="connection-scene connection-team"/);
 assert.match(html,/class="connection-photo connection-photo--team"/);
 assert.match(html,/data-team-scene/);
 assert.match(html,/class="connection-shade" aria-hidden="true"/);
 assert.match(html,/class="connection-reveal"/);
 assert.doesNotMatch(html,/class="team-editorial"/);
});

test('Experience in Numbers appears immediately after Meet Sharon with original metrics',()=>{
 const html=render();
 const meet=html.indexOf('id="personal-connection"'),numbers=html.indexOf('id="experience-in-numbers"'),awards=html.indexOf('id="awards-recognition"');
 assert.ok(meet<numbers&&numbers<awards);
 assert.equal((html.match(/id="experience-in-numbers"/g)||[]).length,1);
 assert.match(html,/data-performance-count="30\+"/);
 assert.match(html,/data-performance-count="\$2\.3 Billion"/);
 assert.match(html,/data-performance-count="1,750 \+"/);
 assert.match(html,/Closed volume as an office/);
});
test('Featured slide has one shared minimal text CTA, with fallback links and no white buttons',()=>{
 const html=render();
 assert.equal((html.match(/data-collection-property-link/g)||[]).length,1);
 assert.equal((html.match(/class="collection-text-link collection-card-link"/g)||[]).length,0);
 assert.equal((html.match(/data-collection-property-url=/g)||[]).length,3);
 assert.equal((html.match(/class="collection-property-title-link"/g)||[]).length,3);
 assert.match(html,/Discover This Home <span class="collection-text-plus"/);
 assert.doesNotMatch(html,/class="button light collection-property-link"/);
 assert.match(html,/data-collection-track/);
 assert.match(html,/data-collection-stage/);
});

test('one immersive community experience replaces the duplicated Featured Neighborhoods section',()=>{
 const html=render();
 assert.doesNotMatch(html,/featured-neighborhoods atz-service-showcase/);
 assert.doesNotMatch(html,/FEATURED NEIGHBORHOODS/);
 assert.doesNotMatch(html,/Find your place\./);
 assert.equal((html.match(/A SENSE OF PLACE/g)||[]).length,1);
 assert.equal((html.match(/<article class="atg1-index__entry(?: is-active)?"/g)||[]).length,6);
 assert.equal((html.match(/class="community-name"/g)||[]).length,6);
 const selected=html.indexOf('id="collection"');
 const community=html.indexOf('data-place-index');
 assert.ok(selected>=0&&community>selected,'immersive community section follows selected homes');
});
