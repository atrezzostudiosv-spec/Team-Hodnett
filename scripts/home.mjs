import {e,U,icon,link,price,stats,detailURL,closing} from './templates.mjs';
export function renderHome({featured,communities,homeArticles,journalCard,mainQuote,excerpt,client,recognition,videos}){
 const places=['southlake','westlake','colleyville','grapevine','flower-mound','keller'].map(slug=>communities.find(c=>c.slug===slug));
 const descriptions={southlake:'A local perspective on Southlake, from the town square to the places you call home.',westlake:'Discover Westlake and a different pace of North Texas living.',colleyville:'Explore the neighborhoods and local character of Colleyville.',grapevine:'A closer look at Grapevine, its Main Street and the surrounding community.','flower-mound':'Get to know Flower Mound and the possibilities around your next move.',keller:'Explore Keller with a perspective rooted in the local community.'};
 const placeImage=c=>c.cover||'assets/editorial/'+c.slug+'.webp';

 const sharonFilm=videos.find(v=>v.id==='pZeJBjZkZU0');
 const chosenAwards=[
  '2026 Five Star Legends',
  '2024 D Magazine Top Real Estate Producer',
  '2025 Best of the Best Top 10',
  'The Thousand by RealTrends',
  '2025 Five Star Real Estate Agent',
  '2023 DFW Real Producers Top Agent'
 ].map(label=>recognition.images.find(item=>item.alt.includes(label))).filter(Boolean);
 const awardFigures=chosenAwards.map(item=>'<figure class="sharon-award"><img src="'+U(item.src)+'" width="180" height="112" loading="lazy" alt="'+e(item.alt)+'"><figcaption>'+e(item.alt)+'</figcaption></figure>').join('');


 const featuredPanels=featured.map((p,i)=>`<article class="collection-panel" id="collection-panel-${i+1}" data-collection-panel role="tabpanel" aria-labelledby="collection-tab-${i+1}" aria-hidden="false">
  <div class="collection-image-wrap"><img class="collection-photo" src="${U(p.cover)}" alt="${e(p.title)}, ${e(p.city)}" loading="${i===0?'eager':'lazy'}" decoding="async"></div>
  <div class="collection-scrim" aria-hidden="true"></div>
  <div class="collection-overlay">
   <div class="collection-property-copy"><div class="eyebrow">${e(p.city)}, TEXAS</div><h3>${e(p.title)}</h3><div class="collection-meta"><span>${price(p.price,p.status)}</span>${stats(p).map(t=>`<span>${e(t)}</span>`).join('')}</div></div>
   <a class="button light collection-property-link" href="${U(detailURL(p))}" data-atz-link>Discover This Home ${icon('arrow')}</a>
  </div>
 </article>`).join('');
 const featuredNavigation=featured.map((p,i)=>`<button class="collection-tab" type="button" role="tab" id="collection-tab-${i+1}" data-collection-tab="${i}" aria-selected="${i===0?'true':'false'}" aria-controls="collection-panel-${i+1}" tabindex="${i===0?0:-1}">
  <span class="collection-tab-rule" aria-hidden="true"></span><span class="collection-tab-title">${e(p.title)}</span><span class="collection-tab-city">${e(p.city)}, Texas</span>
 </button>`).join('');
 return `<section class="hero hero-film" aria-label="Sharon Hodnett, Southlake and Dallas–Fort Worth"><div class="hero-film-media"><video class="hero-video" data-hero-video muted loop playsinline preload="metadata" poster="${U('assets/video/sharon-poster.jpg')}" aria-label="A film from Sharon Hodnett’s original website"><source media="(max-width:767px)" src="${U('assets/video/sharon-mobile.mp4')}" type="video/mp4"><source src="${U('assets/video/sharon-original.webm')}" type="video/webm"><source src="${U('assets/video/sharon-original.mp4')}" type="video/mp4"></video></div><div class="hero-content"><div class="eyebrow">SHARON HODNETT / NORTH TEXAS REAL ESTATE</div><h1>Find your<br>extraordinary.</h1><p>Distinctive homes. A personal approach.</p>${link('homes/','Explore the collection')}</div><div class="hero-bottom"><a class="scroll-cue" href="#perspective"><span></span>A DIFFERENT PERSPECTIVE</a><div class="hero-film-controls"><span>SOUTHLAKE &amp; DALLAS–FORT WORTH</span><button class="video-toggle" type="button" data-hero-video-toggle aria-label="Play background film">Play film <span aria-hidden="true">▷</span></button></div></div></section>
 <div class="connection-story" data-connection-story id="perspective">
 <section class="connection-scene connection-sharon" id="personal-connection" aria-labelledby="connection-title" data-connection-scene>
  <div class="connection-viewport">
   <picture class="connection-photo connection-photo--sharon"><source media="(max-width:767px)" srcset="${U('assets/editorial/sharon-scene-mobile.webp')}"><img src="${U('assets/editorial/sharon-scene-desktop.webp')}" width="1672" height="941" loading="lazy" alt="Sharon Hodnett, The Hodnett Team"></picture>
   <div class="connection-shade" aria-hidden="true"></div>
   <div class="connection-copy"><div class="eyebrow connection-reveal">MEET SHARON</div><h2 class="connection-reveal" id="connection-title">Experience.<br>With perspective.</h2><p class="connection-reveal">Sharon represents buyers and sellers across Southlake and Dallas–Fort Worth. Her approach brings together local knowledge, considered property presentation and an understanding of what comes next.</p><div class="connection-reveal">${link('about/','Meet Sharon')}</div></div>
  </div>
 </section>
 <section class="connection-scene connection-team connection-film" id="sharon-story" aria-labelledby="sharon-story-title" data-connection-scene>
  <div class="connection-viewport connection-film__viewport">
   <img class="connection-photo connection-photo--team connection-film__poster" src="${U(sharonFilm.cover)}" alt="Sharon Hodnett film still" loading="lazy">
   <div class="connection-film__motion" data-sharon-film data-video-id="${e(sharonFilm.id)}" aria-hidden="true"></div>
   <div class="connection-shade" aria-hidden="true"></div>
   <div class="connection-copy connection-film__copy"><div class="eyebrow connection-reveal">SHARON'S STORY / ON FILM</div><h2 class="connection-reveal" id="sharon-story-title">A closer look.<br>A personal story.</h2><p class="connection-reveal">Hear Sharon share the experience and perspective behind her approach to real estate.</p><div class="connection-reveal"><a class="line-link" href="${e(sharonFilm.url)}" target="_blank" rel="noopener noreferrer" aria-label="Watch Sharon Hodnett's original film on YouTube">Watch Sharon’s film ${icon('arrow')}</a></div></div>
  </div>
 </section>
 </div>
 <section class="sharon-awards" id="awards-recognition" aria-labelledby="sharon-awards-title">
  <div class="sharon-awards__intro wrap"><div><span class="eyebrow">AWARDS &amp; RECOGNITION</span><h2 id="sharon-awards-title">Recognition.<br>Over the years.</h2></div><div class="sharon-awards__aside"><p>A selection of honors documented in The Hodnett Team’s original archives.</p>${link('awards/','View all recognition')}</div></div>
  <div class="sharon-awards__window" aria-label="Selected historical awards"><div class="sharon-awards__track"><div class="sharon-awards__set">${awardFigures}</div><div class="sharon-awards__set" aria-hidden="true">${awardFigures}</div></div></div>
  <p class="sharon-awards__note wrap">Historical recognitions are shown with their original dates and descriptions.</p>
 </section>
 <section class="team-editorial" id="hodnett-team" aria-labelledby="team-scene-title">
  <div class="team-editorial__image"><img src="${U(featured[0].gallery[1]||featured[0].cover)}" loading="lazy" alt="A home represented by The Hodnett Team"></div>
  <div class="team-editorial__copy"><div class="eyebrow">THE HODNETT TEAM</div><h2 id="team-scene-title">A place that feels<br>entirely your own.</h2><p>From the first conversation to your next address, discover a personal perspective on buying and selling in Southlake and Dallas–Fort Worth.</p>${link('properties/sale/','Explore our homes')}</div>
 </section>
 <section class="collection-section" id="collection" aria-labelledby="selected-homes-heading">
  <div class="collection-intro wrap"><div><div class="eyebrow">SELECTED HOMES</div><h2 id="selected-homes-heading">The exceptional.<br>Up close.</h2></div><p>Discover three distinctive homes represented by The Hodnett Team.</p></div>
  <div class="collection-scroll-track" data-collection-track>
   <div class="collection-stage" data-collection-stage aria-label="Selected properties">
    <div class="collection-frames">${featuredPanels}</div>
    <div class="collection-image-index">SELECTED HOMES / THE HODNETT TEAM</div>
    <div class="collection-image-counter" data-collection-counter aria-hidden="true">01 / 03</div>
    <div class="collection-bottom">
     <div class="collection-bottom-top"><span>SCROLL TO EXPLORE</span><a class="collection-all-homes" href="${U('homes/')}" data-atz-link>Explore All Homes ${icon('arrow')}</a></div>
     <div class="collection-tabs" role="tablist" aria-label="Choose a featured home">${featuredNavigation}</div>
    </div>
   </div>
  </div>
  <div class="collection-fallback-link wrap">${link('homes/','Explore All Homes')}</div>
 </section>
 <section class="featured-neighborhoods atz-service-showcase" data-atz-service-showcase aria-labelledby="featured-places-title"><div class="neighborhoods-lead wrap"><div class="eyebrow">FEATURED NEIGHBORHOODS</div><div><h2 id="featured-places-title">Find your place.</h2><p>Three communities. A world of possibility.</p></div></div><div data-atz-panels><div class="atz-panels">${places.slice(0,3).map((c,i)=>`<article class="atz-panel${i===0?' is-active':''}" data-atz-service-panel><img loading="lazy" src="${U(placeImage(c))}" alt="${e(c.name)} community photograph"><button class="atz-panel-toggle" type="button" data-atz-panel-toggle aria-controls="neighborhood-copy-${i}" aria-expanded="${i===0}"><span class="atz-micro">0${i+1} / NORTH TEXAS</span><span class="atz-panel-toggle-bottom"><span class="atz-panel-title">${e(c.name)}</span><span class="atz-panel-plus" aria-hidden="true">+</span></span></button><div class="atz-panel-content" data-atz-panel-content id="neighborhood-copy-${i}"><p>${e(descriptions[c.slug])}</p><a class="atz-outline-link" href="${U('neighborhoods/'+c.slug+'/')}" data-atz-link>Explore ${e(c.name)} ${icon('arrow')}</a></div></article>`).join('')}</div></div><div class="neighborhoods-end wrap"><span>Explore the places behind the properties.</span>${link('neighborhoods/','All communities')}</div></section>
 <section class="atg1 place-index" data-place-index aria-labelledby="local-life-title">
  <div class="atg1-index">
   <div class="atg1-index__layout">
    <div class="atg1-index__stage" aria-hidden="true">
     ${places.map((c,i)=>`<img class="atg1-index__photo${i===0?' is-active':''}" loading="lazy" decoding="async" src="${U(placeImage(c))}" alt="">`).join('')}
     <div class="atg1-index__stage-meta"><span>LOCAL PERSPECTIVE</span><span data-atg1-index-number>01 / 06</span></div>
     
    </div>
    <div class="atg1-index__content">
     <div class="place-index-intro"><div class="eyebrow">A SENSE OF PLACE</div><h2 id="local-life-title">Local life.<br>Lasting connection.</h2><p>Discover a personal perspective on the communities of North Texas.</p></div>
     <div class="atg1-index__entries">
      ${places.map((c,i)=>`<article class="atg1-index__entry${i===0?' is-active':''}" id="local-${c.slug}">
       <div class="atg1-index__entry-header"><span>0${i+1} / THE COMMUNITY</span>${icon('arrow')}</div>
       <h3><a class="community-name" href="${U('neighborhoods/'+c.slug+'/')}" data-atz-link>${e(c.name)}</a></h3>
       <img class="atg1-index__mobile-photo" loading="lazy" src="${U(placeImage(c))}" alt="Illustrative community photograph for ${e(c.name)}">
       <p>${e(descriptions[c.slug])}</p>
       <a class="place-guide-link" href="${U('neighborhoods/'+c.slug+'/')}" data-atz-link>Explore the area ${icon('arrow')}</a>
      </article>`).join('')}
     </div>
    </div>
   </div>
  <p class="place-photo-credits">Flower Mound photography: <a href="https://commons.wikimedia.org/wiki/File:Sunrise_on_a_foggy_cold_day_in_Flower_Mound_(52692865160).jpg" target="_blank" rel="noopener noreferrer">Shiva Shenoy</a>, <a href="https://creativecommons.org/licenses/by/2.0/" target="_blank" rel="noopener noreferrer">CC BY 2.0</a>. Resized and converted to WebP.</p>
 </section>
 <section class="performance-section" aria-labelledby="performance-title"><div class="performance-heading wrap"><div class="eyebrow">EXPERIENCE IN NUMBERS</div><h2 id="performance-title">A record that<br>speaks for itself.</h2><p>Selected achievements published on Sharon’s original website.</p></div><div class="performance-grid wrap">${client.stats.map(s=>`<div class="performance-stat"><strong>${e(s.value)}</strong><span>${e(s.label)}</span></div>`).join('')}</div><p class="performance-source wrap">Historical figures from the original website. Office totals, award periods and the stated 2022 / 2023 dates retain their original scope.</p></section>
 <section class="quote-section home-quote"><div class="eyebrow">IN OUR CLIENTS’ WORDS</div><blockquote>“${e(excerpt)}”</blockquote><cite>${e(mainQuote.name)}</cite><p>${link('testimonials/','Read client stories')}</p></section>
 <section class="journal-section wrap"><div class="section-heading"><div><div class="eyebrow">THE JOURNAL</div><h2>A local perspective.</h2></div>${link('blog/','All stories')}</div><div class="journal-grid">${homeArticles.map(journalCard).join('')}</div></section>
 <section class="home-closing"><img class="home-closing-photo" loading="lazy" src="${U('assets/editorial/landscape.webp')}" alt=""><div class="eyebrow">YOUR NEXT CHAPTER</div><h2>Let’s make<br><em>your next move.</em></h2><button class="button outline" data-contact>Start a conversation ${icon('arrow')}</button></section>`;
}
