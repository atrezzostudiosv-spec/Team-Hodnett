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
const render=()=>renderHome({featured,communities,homeArticles:[],journalCard:()=>'',mainQuote:{name:'Client',quote:'Lovely service. Everything was excellent.'},excerpt:'Lovely service.',client:{stats:[]},recognition,videos});
test('homepage preserves the entry film and follows it with Meet Sharon, video, genuine awards, and team',()=>{
 const html=render();
 const order=[
  'class="hero hero-film"',
  'MEET SHARON',
  'id="sharon-story"',
  'id="awards-recognition"',
  'id="hodnett-team"',
  'id="collection"'
 ].map(needle=>html.indexOf(needle));
 assert.ok(order.every(x=>x>=0), 'all expected chapters must be present');
 assert.deepEqual([...order].sort((a,b)=>a-b),order,'chapters follow the agreed narrative order');
 assert.equal((html.match(/id="hodnett-team"/g)||[]).length,1);
});
test('cinematic video uses known archived film and links directly to the source',()=>{
 const html=render();
 assert.match(html,/data-video-id="pZeJBjZkZU0"/);
 assert.match(html,/https:\/\/www\.youtube\.com\/watch\?v=pZeJBjZkZU0/);
 assert.match(html,/class="connection-film__motion"/);
 assert.match(html,/class="connection-photo connection-photo--team connection-film__poster"/);
});
test('recognition showcases known saved badges with descriptive text and dated context',()=>{
 const html=render();
 assert.match(html,/2026 Five Star Legends/);
 assert.match(html,/2024 D Magazine Top Real Estate Producer/);
 assert.match(html,/The Thousand by RealTrends/);
 assert.match(html,/Historical recognitions are shown with their original dates/);
 assert.match(html,/href="\/awards\/"/);
});
