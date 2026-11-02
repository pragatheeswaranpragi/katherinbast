(() => {
  const catalog = document.querySelector('.services-catalog');
  if (!catalog) return;
  const filterBar = catalog.querySelector('.services-filter-bar');
  const filters = [...catalog.querySelectorAll('[data-category]')];
  const services = [...catalog.querySelectorAll('.service-catalog-item')];
  const status = catalog.querySelector('#services-result');
  const compact = matchMedia('(max-width: 760px)');
  const wide = matchMedia('(min-width: 1440px)');
  const studio = matchMedia('(min-width: 1100px)');
  const reduced = matchMedia('(prefers-reduced-motion: reduce)');
  const quiet = () => reduced.matches || document.documentElement.classList.contains('motion-paused');
  const expand = catalog.querySelector('.services-expand');
  const detail = catalog.querySelector('.service-detail');
  const detailCopy = detail.querySelector('.service-detail-copy');
  const selectionStatus = catalog.querySelector('#service-selection-status');
  const pager = catalog.querySelector('.service-pager');
  const previousPage = pager.querySelector('.service-page-previous');
  const nextPage = pager.querySelector('.service-page-next');
  const pageSize = 6;
  const descriptions = {
    'brand-strategy': ['Clarify what your brand stands for and give it a voice people can recognize.', ['Positioning', 'Brand voice', 'Personal branding']],
    'market-research': ['Understand your audience, explore your competitive landscape and find a clearer direction for your brand.', ['Audience insights', 'Competitor review', 'Opportunity mapping']],
    'social-media': ['Build a social presence with relevant stories, thoughtful content and a consistent voice.', ['Content planning', 'Social channels', 'Brand storytelling']],
    'seo-sem': ['Connect your brand with people who are already searching for what you offer.', ['Search visibility', 'Keyword planning', 'Paid search']],
    'performance-marketing': ['Bring campaign planning, creative and measurement together around your marketing goals.', ['Campaign strategy', 'Paid media', 'Performance review']],
    'paid-ads': ['Plan purposeful advertising across Meta, Google and YouTube, with a message shaped for each platform.', ['Platform planning', 'Ad creative', 'Campaign management']],
    'lead-generation': ['Create a clearer path from first interest to enquiry, then keep the conversation going.', ['Lead campaigns', 'Email content', 'Follow-up journeys']],
    'analytics-reporting': ['Turn campaign data into a clearer picture of what is working and what needs attention.', ['Marketing reports', 'Campaign insights', 'ROAS analysis']],
    'brand-reputation': ['Support a consistent brand presence and a thoughtful approach to the conversations around it.', ['Review management', 'Brand consistency', 'Reputation monitoring']],
    'local-seo': ['Help nearby audiences discover your business with a clear, useful local search presence.', ['Business profile', 'Local search', 'Listing consistency']],
    'local-marketing': ['Shape your marketing around the places and communities that matter to your business.', ['Location insights', 'Local audiences', 'Area campaigns']],
    'influencer-marketing': ['Bring the right voices into your brand story through purposeful creator and celebrity collaborations.', ['Talent coordination', 'Campaign briefs', 'Collaborations']],
    'affiliate-marketing': ['Explore partnerships that introduce your brand to relevant audiences and shared opportunities.', ['Partner planning', 'Cross-promotion', 'Affiliate campaigns']],
    'offline-marketing': ['Take your brand into the real world with messaging and marketing that work beyond the screen.', ['Offline campaigns', 'Local outreach', 'Brand touchpoints']],
    'brand-identity': ['Give your brand a recognizable visual language, from the first impression to everyday communication.', ['Visual identity', 'Brand guidelines', 'Graphic design']],
    'print-design': ['Translate your brand into print and packaging that feel considered, clear and connected.', ['Brochures', 'Packaging', 'Print collateral']],
    'content-creation': ['Find the words and stories that express your brand and make your message easier to connect with.', ['Brand copy', 'Content writing', 'Creative concepts']],
    'photo-video': ['Bring your ideas into focus through photography, video production and thoughtful editing.', ['Photography', 'Videography', 'Video editing']],
    'website-development': ['Create a website or landing page that introduces your brand clearly and gives visitors a useful next step.', ['Website design', 'Landing pages', 'Responsive development']],
    'ecommerce': ['Shape an online store around your products, your brand and the way people shop.', ['Store development', 'Product pages', 'Shopping journeys']],
    'website-maintenance': ['Keep your website useful and up to date, with ongoing attention to content, search and maintenance.', ['Website updates', 'Technical SEO', 'Site maintenance']],
    'conversion-optimization': ['Look closely at the visitor journey and make the path to action clearer and easier to follow.', ['Journey review', 'Page improvements', 'Conversion testing']],
    'conversion-tracking': ['Understand how visitors move through your website and connect their actions with your marketing activity.', ['Website analytics', 'Event tracking', 'Conversion insights']],
    'event-marketing': ['Connect planning, promotion and on-ground coordination to create a considered brand experience.', ['Event planning', 'Event promotion', 'On-ground coordination']]
  };
  let category = 'all';
  let expanded = false;
  let page = 0;
  let selected = null;
  let detailAnimation;
  const categoryOf = item => [...item.classList].find(name => name.startsWith('service-category-')).replace('service-category-', '');
  const matchingServices = () => services.filter(item => category === 'all' || categoryOf(item) === category);

  function chooseService(item, announce = false) {
    if (selected === item) return;
    selected = item;
    services.forEach(service => service.querySelector('.service-select').setAttribute('aria-pressed', String(service === item)));
    const title = item.querySelector('h3').textContent;
    const [description, points] = descriptions[item.id];
    detail.querySelector('#service-detail-title').textContent = title;
    detail.querySelector('.service-detail-number').textContent = item.querySelector('.service-card-number').textContent;
    detail.querySelector('.service-detail-category').textContent = item.querySelector('.service-card-category').textContent.trim();
    detail.querySelector('.service-detail-description').textContent = description;
    detail.querySelector('.service-detail-points').replaceChildren(...points.map(point => {
      const li = document.createElement('li');
      li.textContent = point;
      return li;
    }));
    detail.querySelector('.service-detail-cta').setAttribute('aria-label', `Discuss ${title}`);
    if (announce) selectionStatus.textContent = `Selected service: ${title}`;
    detailAnimation?.cancel();
    if (studio.matches && !quiet() && announce && detailCopy.animate) {
      const animation = detailCopy.animate([{opacity:.65,transform:'translateY(6px)'},{opacity:1,transform:'none'}],{duration:220,easing:'cubic-bezier(.22,1,.36,1)'});
      detailAnimation = animation;
      animation.finished.then(() => { if (detailAnimation === animation) detailAnimation = null; }).catch(() => {});
    }
  }

  services.forEach(item => {
    const button = document.createElement('button');
    button.type = 'button';
    button.className = 'service-select';
    button.dataset.serviceId = item.id;
    button.setAttribute('aria-controls', 'service-detail');
    button.setAttribute('aria-pressed', 'false');
    button.innerHTML = '<span class="service-select-number" aria-hidden="true"></span><span class="service-select-title"></span><span class="service-select-arrow" aria-hidden="true"><svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6"><path d="M5 19 19 5M5 5h14v14"/></svg></span>';
    button.querySelector('.service-select-number').textContent = item.querySelector('.service-card-number').textContent;
    button.querySelector('.service-select-title').textContent = item.querySelector('h3').textContent;
    button.addEventListener('click', () => chooseService(item, true));
    button.addEventListener('focus', () => chooseService(item, true));
    button.addEventListener('keydown', event => {
      const visible = services.filter(service => !service.hidden);
      const index = visible.indexOf(item);
      const keys = {ArrowDown:(index + 1) % visible.length, ArrowUp:(index + visible.length - 1) % visible.length, Home:0, End:visible.length - 1};
      if (event.key in keys) {
        event.preventDefault();
        visible[keys[event.key]].querySelector('.service-select').focus();
      }
    });
    item.append(button);
  });

  function renderServices(announce = false) {
    const matching = matchingServices();
    page = Math.max(0, Math.min(page, Math.ceil(matching.length / pageSize) - 1));
    const limited = category === 'all' && !expanded;
    const previewLimit = compact.matches || wide.matches ? 8 : 6;
    const start = studio.matches ? page * pageSize : 0;
    const visible = studio.matches ? matching.slice(start, start + pageSize) : limited ? matching.slice(0, previewLimit) : matching;
    services.forEach(item => { item.hidden = !visible.includes(item); });
    filters.forEach(button => button.setAttribute('aria-pressed', String(button.dataset.category === category)));
    status.textContent = studio.matches
      ? `${start + 1}–${start + visible.length} of ${matching.length} services`
      : limited ? `Showing ${visible.length} of ${matching.length} services` : `${matching.length} ${matching.length === 1 ? 'service' : 'services'}`;
    expand.hidden = studio.matches || category !== 'all';
    expand.setAttribute('aria-expanded', String(expanded));
    expand.innerHTML = expanded ? 'Show fewer services <span aria-hidden="true">−</span>' : `View all ${services.length} services <span aria-hidden="true">+</span>`;
    catalog.querySelectorAll('.studio-only').forEach(item => { item.hidden = !studio.matches; });
    detail.hidden = !studio.matches;
    pager.hidden = !studio.matches || matching.length <= pageSize;
    previousPage.disabled = page === 0;
    nextPage.disabled = start + pageSize >= matching.length;
    pager.querySelector('.service-page-position').textContent = `${String(start + 1).padStart(2, '0')}–${String(start + visible.length).padStart(2, '0')} / ${matching.length}`;
    catalog.querySelector('.service-menu-category').textContent = category === 'all' ? 'All services' : filters.find(button => button.dataset.category === category).firstChild.textContent.trim();
    if (studio.matches && !visible.includes(selected)) chooseService(visible[0], announce);
  }
  catalog.classList.add('services-studio-ready');
  filterBar.hidden = false;
  filters.forEach(button => {
    const label = button.firstChild.textContent.trim();
    const count = button.dataset.category === 'all' ? services.length : services.filter(item => categoryOf(item) === button.dataset.category).length;
    if (!button.querySelector('span')) {
      const countLabel = document.createElement('span');
      countLabel.className = 'studio-category-count';
      countLabel.setAttribute('aria-hidden', 'true');
      countLabel.textContent = count;
      button.append(countLabel);
    }
    button.setAttribute('aria-label', `${label}, ${count} ${count === 1 ? 'service' : 'services'}`);
    button.addEventListener('click', () => {
      category = button.dataset.category;
      expanded = false;
      page = 0;
      selected = null;
      renderServices(true);
    });
  });
  expand.addEventListener('click', () => {
    expanded = !expanded;
    renderServices();
    if (!expanded) filterBar.scrollIntoView({block:'start',behavior:quiet() ? 'instant' : 'smooth'});
  });
  function changePage(delta) {
    page += delta;
    renderServices(true);
  }
  previousPage.addEventListener('click', () => changePage(-1));
  nextPage.addEventListener('click', () => changePage(1));
  compact.addEventListener('change', () => renderServices());
  wide.addEventListener('change', () => renderServices());
  studio.addEventListener('change', () => {
    detailAnimation?.cancel();
    const focused = document.activeElement.closest('.service-select');
    if (focused && !studio.matches) expanded = true;
    renderServices();
    if (focused && !studio.matches) focused.closest('li').querySelector('a').focus({preventScroll:true});
  });
  function stopDetailMotion() { if (quiet()) detailAnimation?.cancel(); }
  reduced.addEventListener('change', stopDetailMotion);
  new MutationObserver(stopDetailMotion).observe(document.documentElement, {attributes:true,attributeFilter:['class']});

  function revealHashTarget(behavior = 'instant', focus = false) {
    const item = services.find(service => `#${service.id}` === location.hash);
    if (!item) return;
    if (studio.matches) {
      if (!matchingServices().includes(item)) category = categoryOf(item);
      page = Math.floor(matchingServices().indexOf(item) / pageSize);
      renderServices();
      chooseService(item);
    } else if (item.hidden) {
      category = 'all';
      expanded = true;
      renderServices();
    }
    requestAnimationFrame(() => {
      (studio.matches ? catalog.querySelector('.services-studio') : item).scrollIntoView({block:'start',behavior});
      if (focus) item.querySelector(studio.matches ? '.service-select' : 'a').focus({preventScroll:true});
    });
  }
  renderServices();
  window.addEventListener('hashchange', () => revealHashTarget());
  document.addEventListener('click', event => {
    if (event.button !== 0 || event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) return;
    const link = event.target.closest('a[href^="#"]');
    if (!link || !services.some(service => `#${service.id}` === link.hash)) return;
    event.preventDefault();
    if (location.hash !== link.hash) history.pushState(null, '', link.hash);
    revealHashTarget(quiet() ? 'instant' : 'smooth', true);
  });
  revealHashTarget();

  // Browser-level saving deterrents stay scoped to the Services Gallery.
  // These do not prevent OS screenshots, recording, or direct media requests.
  const gallery = document.querySelector('.service-video-gallery');
  gallery?.addEventListener('contextmenu', event => event.preventDefault());
  gallery?.addEventListener('dragstart', event => {
    if (event.target.closest('.service-video-card')) event.preventDefault();
  });

  // Gallery assets contain no audio tracks; also keep the player locked silent.
  function keepSilent(video) {
    if (!video.muted) video.muted = true;
    if (video.volume !== 0) video.volume = 0;
    video.defaultMuted = true;
  }
  // Avoid simultaneous playback during automatic or manual viewing.
  const videos = [...document.querySelectorAll('.service-gallery-video')];
  videos.forEach(video => {
    keepSilent(video);
    video.addEventListener('volumechange', () => keepSilent(video));
    video.addEventListener('play', () => {
      keepSilent(video);
      videos.forEach(other => { if (other !== video) other.pause(); });
    });
  });
})();
