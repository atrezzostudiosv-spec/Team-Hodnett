/* ATREZZO | Community guides directory: 12 sourced, accessible destinations. */
import {e,U,icon} from './templates.mjs';
const featured=['southlake','westlake','colleyville','grapevine','flower-mound','keller'];
const descriptions={
 'southlake':'Town Square, residential neighborhoods and the Southlake way of life.',
 'westlake':'Distinctive residential settings and a quieter North Texas pace.',
 'colleyville':'Residential neighborhoods, local character and community life.',
 'grapevine':'Historic Main Street, Lake Grapevine and year-round traditions.',
 'flower-mound':'Explore the neighborhoods and everyday life of Flower Mound.',
 'keller':'Parks, trails and a variety of places to call home.',
 'coppell':'Discover the residential neighborhoods and character of Coppell.',
 'highland-park':'A neighborhood perspective on Highland Park.',
 'irving-las-colinas':'An introduction to Irving and the Las Colinas area.',
 'north-dallas':'Explore North Dallas and the Preston Hollow area.',
 'trophy-club':'Golf, parks, trails and a planned residential community.',
 'university-park':'A closer look at the residential landscape of University Park.'
};
const number=n=>String(n).padStart(2,'0');
function card(c,index,size){
 const caption=descriptions[c.slug]||'Discover a community and its local perspective.';
 return `<a class="ci-card ci-card--${size}" href="${U('neighborhoods/'+c.slug+'/')}" data-atz-link aria-label="Explore ${e(c.name)} community guide">
  <div class="ci-card__visual">
   <img src="${U(c.cover)}" alt="" width="1200" height="800" loading="lazy" decoding="async">
   <span class="ci-card__count">${number(index+1)} / 12</span>
   <span class="ci-card__visual-action" aria-hidden="true">${icon('arrow')}</span>
  </div>
  <div class="ci-card__content">
   <div class="ci-card__heading"><h3>${e(c.name)}</h3><span class="ci-card__arrow" aria-hidden="true">${icon('arrow')}</span></div>
   <p>${e(caption)}</p>
   <span class="ci-card__link">EXPLORE COMMUNITY</span>
  </div>
 </a>`;
}
export function renderCommunities({communities}){
 const bySlug=new Map(communities.map(c=>[c.slug,c]));
 const chosen=featured.map(slug=>bySlug.get(slug)).filter(Boolean);
 const others=communities.filter(c=>!featured.includes(c.slug)).sort((a,b)=>a.name.localeCompare(b.name));
 const total=chosen.length+others.length;
 if(!total)return '<section class="ci-empty"><h1>Community guides</h1><p>No community guides are available.</p></section>';
 return `<div class="ci-page">
  <section class="ci-hero" aria-labelledby="ci-title">
   <div class="ci-hero__story">
    <div class="ci-hero__eyebrow"><span class="ci-line"></span> THE HODNETT TEAM <span class="ci-separator">/</span> NORTH TEXAS</div>
    <h1 id="ci-title">A sense<br>of <em>place.</em></h1>
    <p>Discover the communities, neighborhoods and local perspectives that make North Texas feel like home.</p>
    <a class="ci-hero__explore" href="#communities-to-explore">Explore the communities <span aria-hidden="true">↘</span></a>
    <div class="ci-hero__foot">
     <span>${number(total)} AREA GUIDES</span>
     <span>SOUTHLAKE &amp; DALLAS–FORT WORTH</span>
    </div>
   </div>
   <div class="ci-hero__visual">
    <img src="${U('assets/editorial/landscape.webp')}" alt="Editorial view of a North Texas residential landscape" width="1600" height="1000" fetchpriority="high" decoding="async">
    <span class="ci-hero__visual-label">LOCAL PERSPECTIVE <span aria-hidden="true">↗</span></span>
   </div>
  </section>
  <div class="ci-introduction" id="communities-to-explore">
   <div class="ci-introduction__eyebrow">01 <span class="ci-line"></span> OUR COMMUNITIES</div>
   <div class="ci-introduction__body">
    <h2>Find a place<br>that feels <em>your own.</em></h2>
    <p>Explore the communities The Hodnett Team knows and serves. Each guide offers a starting point for understanding the place behind an address.</p>
   </div>
  </div>
  <section class="ci-spotlights" aria-labelledby="ci-spotlight-title">
   <div class="ci-section-head">
    <div><span class="ci-section-kicker">A CLOSER LOOK</span><h2 id="ci-spotlight-title">Selected communities.</h2></div>
    <span class="ci-section-range">01 — ${number(chosen.length)} <span> / ${number(total)}</span></span>
   </div>
   <div class="ci-spotlights__grid">${chosen.map((c,i)=>card(c,i,i<2?'large':'medium')).join('')}</div>
  </section>
  <section class="ci-more" aria-labelledby="ci-more-title">
   <div class="ci-more__inner">
    <div class="ci-section-head">
     <div><span class="ci-section-kicker">EXPLORE FURTHER</span><h2 id="ci-more-title">More places to discover.</h2></div>
     <span class="ci-section-range">${number(chosen.length+1)} — ${number(total)} <span> / ${number(total)}</span></span>
    </div>
    <div class="ci-more__grid">${others.map((c,i)=>card(c,chosen.length+i,'compact')).join('')}</div>
   </div>
  </section>
  <section class="ci-next" aria-labelledby="ci-next-title">
   <span class="ci-section-kicker">THE NEXT CHAPTER</span>
   <div class="ci-next__body">
    <h2 id="ci-next-title">Your next address.<br>Your next story.</h2>
    <div class="ci-next__aside"><p>Explore the homes available across North Texas or start a conversation about the community that feels right for you.</p>
     <div class="ci-next__links">
      <a href="${U('home-search/listings/')}" data-atz-link>Search homes ${icon('arrow')}</a>
      <a href="${U('contact/')}" data-atz-link>Let's connect ${icon('arrow')}</a>
     </div>
    </div>
   </div>
  </section>
 </div>`;
}
