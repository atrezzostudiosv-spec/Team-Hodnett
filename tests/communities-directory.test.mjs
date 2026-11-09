import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {renderCommunities} from '../scripts/communities.mjs';

const communities=JSON.parse(readFileSync(new URL('../content/communities.json',import.meta.url),'utf8'));
const css=readFileSync(new URL('../public/src/communities-index.css',import.meta.url),'utf8');
const markup=renderCommunities({communities});
const featured=['southlake','westlake','colleyville','grapevine','flower-mound','keller'];

test('all 12 original community guides appear once with their correct links and photos',()=>{
 assert.equal(communities.length,12);
 assert.equal((markup.match(/class="ci-card ci-card--/g)||[]).length,communities.length);
 const hrefs=[...markup.matchAll(/<a class="ci-card[^"]*" href="([^"]+)"/g)].map(x=>x[1]);
 assert.equal(new Set(hrefs).size,communities.length);
 for(const place of communities){
  const expected='/neighborhoods/'+place.slug+'/';
  assert.equal(hrefs.filter(x=>x===expected).length,1,place.name+' should have exactly one card');
  assert.ok(markup.includes('src="/'+place.cover+'"'),place.name+' photo missing');
  assert.ok(markup.includes('Explore '+place.name+' community guide'),place.name+' accessible label missing');
 }
});
test('hero, selected six, further six and contact follow an intentional editorial order',()=>{
 const sections=['class="ci-hero"','id="communities-to-explore"','class="ci-spotlights"','class="ci-more"','class="ci-next"'].map(x=>markup.indexOf(x));
 assert.ok(sections.every(p=>p>=0));
 assert.deepEqual(sections,[...sections].sort((a,b)=>a-b));
 assert.equal((markup.match(/class="ci-card ci-card--large"/g)||[]).length,2);
 assert.equal((markup.match(/class="ci-card ci-card--medium"/g)||[]).length,4);
 assert.equal((markup.match(/class="ci-card ci-card--compact"/g)||[]).length,6);
 const cards=[...markup.matchAll(/<a class="ci-card[^"]*" href="\/neighborhoods\/([^/]+)\//g)].map(x=>x[1]);
 assert.deepEqual(cards.slice(0,6),featured);
 assert.deepEqual(cards.slice(6),communities.filter(c=>!featured.includes(c.slug)).sort((a,b)=>a.name.localeCompare(b.name)).map(c=>c.slug));
 assert.match(markup,/href="\/home-search\/listings\/"/);
 assert.match(markup,/href="\/contact\/"/);
});
test('ordered responsive grids, keyboard focus and reduced-motion styling',()=>{
 assert.match(css,/\.ci-spotlights__grid\{\s*display:grid/);
 assert.match(css,/grid-template-columns:repeat\(2,minmax\(0,1fr\)\)/);
 assert.match(css,/\.ci-more__grid\{\s*display:grid;grid-template-columns:repeat\(3,minmax\(0,1fr\)\)/);
 assert.match(css,/@media\(max-width:767px\)/);
 assert.match(css,/@media\(prefers-reduced-motion:reduce\)/);
 assert.match(css,/:focus-visible/);
 assert.doesNotMatch(markup,/class="community-tile"/);
 assert.doesNotMatch(markup,/average individual income|wealthiest city|100% graduation rate/i);
});
