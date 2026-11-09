import {e,U,icon,link} from './templates.mjs';

// Curated and dated source material, with no unsourced personal promises.
// Current facts: teamhodnett.com (2026 biography).
// Historical credentials: teamhodnettluxury.com/about and recognition archive.
export function renderAbout({recognition}){
 const badges=[
  '2026 Five Star Legends',
  '2024 D Magazine Top Real Estate Producer',
  'The Thousand by RealTrends',
  '2025 Five Star Real Estate Agent'
 ].map(name=>recognition.images.find(image=>image.alt.includes(name))).filter(Boolean);
 const badgeCards=badges.map((image,i)=>`
  <figure class="about-award-card"><div class="about-award-card__figure"><img src="${U(image.src)}" loading="lazy" width="180" height="130" alt="${e(image.alt)}"></div>
  <figcaption><span>0${i+1} / RECOGNITION</span>${e(image.alt)}</figcaption></figure>
 `).join('');
 const serviceCards=[
  ['01','Luxury representation','Distinctive residences, estate properties and tailored marketing for luxury buyers and sellers.'],
  ['02','New construction','Experience working with builders and developers throughout North Texas.'],
  ['03','Waterfront expertise','A focus on waterfront properties, including the Eagle Mountain Lake area.'],
  ['04','Relocation','Local guidance for buyers moving to the Dallas–Fort Worth area.'],
  ['05','Strategic presentation','Property preparation, professional imagery, digital marketing and targeted exposure.'],
  ['06','Residential & investment','Representation spanning established homes, land and investment-oriented properties.']
 ].map(([n,title,description])=>`
  <article class="about-service-card"><span>${n} / EXPERTISE</span><h3>${e(title)}</h3><p>${e(description)}</p></article>
 `).join('');
 return `
 <div class="about-atrezzo">
  <section class="about-hero" aria-labelledby="about-hero-heading">
   <div class="about-hero__photo"><img src="${U('assets/editorial/sharon.webp')}" width="1440" height="2159" alt="Sharon Hodnett, luxury real estate professional in Southlake, Texas"></div>
   <div class="about-hero__copy">
    <span class="about-kicker">THE HODNETT TEAM <i></i> SOUTHLAKE, TEXAS</span>
    <h1 id="about-hero-heading">Meet<br><em>Sharon.</em></h1>
    <p class="about-hero__lead">Nearly four decades in North Texas real estate. A personal commitment that goes beyond the closing.</p>
    <p>A native Texan, Sharon Hodnett leads The Hodnett Team at Keller Williams DFW Southlake, helping clients navigate exceptional homes, important decisions and new chapters.</p>
    <a class="about-text-link" href="#sharon-perspective">Discover her story ${icon('arrow')}</a>
    <div class="about-hero__sign"><span>SHARON HODNETT</span><span>LUXURY REAL ESTATE SPECIALIST</span></div>
   </div>
   <div class="about-hero__index" aria-hidden="true">01 / A PERSONAL PERSPECTIVE</div>
  </section>

  <section id="sharon-perspective" class="about-perspective wrap" aria-labelledby="about-perspective-title">
   <div class="about-section-marker">01 <span></span> HER STORY</div>
   <div class="about-perspective__main">
    <h2 id="about-perspective-title">A career shaped by<br><em>relationships.</em></h2>
    <div class="about-perspective__columns">
     <p>Sharon began her real estate career in 1989, following in the footsteps of her mother, a real estate broker whose example helped shape her belief in hard work, integrity and knowledgeable representation.</p>
     <p>From Southlake and Westlake to Colleyville, Keller, Grapevine, Flower Mound and Trophy Club, she combines market knowledge, negotiation experience and a considered approach to property presentation.</p>
    </div>
    <blockquote>“I want to be your Realtor for life.”<cite>— SHARON HODNETT</cite></blockquote>
   </div>
  </section>

  <section class="about-record" aria-label="Career highlights">
   <div class="about-record__lead">
    <div class="about-section-marker">02 <span></span> THE RECORD</div>
    <h2>Experience you can<br>build on.</h2>
    <p>Figures below are attributed to Sharon’s official 2026 biography. They are historical career totals, not guarantees of future performance.</p>
   </div>
   <div class="about-record__stats">
    <div class="about-stat"><strong>37<span>years</span></strong><p>Real estate experience through 2026, beginning in 1989</p></div>
    <div class="about-stat"><strong>$630<span>M+</span></strong><p>Career closed transaction volume reported in her 2026 biography</p></div>
    <div class="about-stat"><strong>1.5<span>%</span></strong><p>2026 REAL Trends Verified national ranking, as reported on her official site</p></div>
   </div>
  </section>

  <section class="about-expertise wrap" aria-labelledby="about-expertise-heading">
   <div class="about-expertise__intro">
    <div class="about-section-marker">03 <span></span> EXPERTISE</div>
    <h2 id="about-expertise-heading">A considered approach.<br><em>For every move.</em></h2>
    <p>Luxury real estate is one part of a wider practice built around listening, strategy and understanding the details that make a property distinctive.</p>
   </div>
   <div class="about-expertise__grid">${serviceCards}</div>
   <div class="about-credentials">
    <div><span>PROFESSIONAL DESIGNATIONS</span><h3>Specialized knowledge. Personal service.</h3></div>
    <p>Certified Luxury Home Marketing Specialist (CLHMS™), GUILD™ Member and Certified Residential Specialist (CRS), as described in Sharon’s current and historical professional biographies.</p>
   </div>
  </section>

  <section class="about-media" aria-labelledby="about-media-heading">
   <div class="about-media__image"><img src="${U('assets/editorial/sharon-scene-desktop.webp')}" width="2400" height="1351" loading="lazy" alt="Sharon Hodnett featured in the Team Hodnett editorial photography"></div>
   <div class="about-media__copy">
    <div class="about-section-marker">04 <span></span> MEDIA &amp; PERSPECTIVE</div>
    <h2 id="about-media-heading">An experienced<br><em>voice in real estate.</em></h2>
    <p>Sharon has shared her market perspective on television, radio and through regional real estate publications. Her appearances include <em>The Home You Want to Own</em>, associated with Channel 8, and contributions to real estate talk radio.</p>
    <p>She has also been featured in publications including D Magazine, Texas Monthly and Real Producers. These mentions reflect documented appearances and recognitions, not current endorsements.</p>
    ${link('vlog/','Explore her film archive')}
   </div>
  </section>

  <section class="about-recognition wrap" aria-labelledby="about-awards-heading">
   <div class="about-recognition__heading">
    <div><div class="about-section-marker">05 <span></span> AWARDS &amp; RECOGNITION</div><h2 id="about-awards-heading">A record of<br><em>recognition.</em></h2></div>
    <div><p>Selected awards preserved from The Hodnett Team’s archive, shown with their original years and descriptions.</p>${link('awards/','View the complete archive')}</div>
   </div>
   <div class="about-recognition__grid">${badgeCards}</div>
  </section>

  <section class="about-personal" aria-labelledby="about-personal-heading">
   <div class="about-personal__lead"><div class="about-section-marker">06 <span></span> BEYOND REAL ESTATE</div><h2 id="about-personal-heading">More than a profession.<br><em>A personal story.</em></h2></div>
   <div class="about-personal__body">
    <p>Family has always been central to Sharon’s story. A mother of five and a grandmother, she also enjoys singing, playing the piano, gardening and spending time with the people she loves.</p>
    <p>That human perspective carries into her work: real estate decisions are personal, and every client deserves attentive guidance through the details.</p>
   </div>
   <div class="about-personal__footer">ROOTED IN NORTH TEXAS <span></span> CONNECTED BY TRUST</div>
  </section>

  <section class="about-close" aria-labelledby="about-close-heading">
   <img src="${U('assets/editorial/landscape.webp')}" loading="lazy" alt="" aria-hidden="true">
   <div class="about-close__content">
    <span class="about-kicker">THE HODNETT TEAM / LET'S CONNECT</span>
    <h2 id="about-close-heading">Your next move<br>deserves perspective.</h2>
    <p>Start a conversation with Sharon about your home, your search or a place you would like to call your own.</p>
    <div class="about-close__actions"><a href="tel:+18179947152" class="about-text-link">Call (817) 994-7152 ${icon('arrow')}</a><a href="mailto:sharon@teamhodnett.com" class="about-text-link">Email Sharon ${icon('arrow')}</a></div>
   </div>
  </section>
  <p class="about-source-note wrap">Profile references: <a href="https://www.teamhodnett.com/" target="_blank" rel="noopener noreferrer">Sharon’s official 2026 biography</a>, <a href="https://teamhodnettluxury.com/about" target="_blank" rel="noopener noreferrer">her archived profile</a>, and The Hodnett Team’s historical recognition collection. Dated honors and cumulative figures should not be read as current property availability or future performance guarantees.</p>
 </div>
 `;
}
