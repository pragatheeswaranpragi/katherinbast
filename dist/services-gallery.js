(() => {
  const catalog = document.querySelector('.services-catalog');
  if (!catalog) return;
  const filterBar = catalog.querySelector('.services-filter-bar');
  const filters = [...catalog.querySelectorAll('[data-category]')];
  const services = [...catalog.querySelectorAll('.service-catalog-item')];
  const status = catalog.querySelector('#services-result');
  const compact = matchMedia('(max-width: 760px)');
  const wide = matchMedia('(min-width: 1440px)');
  const expand = catalog.querySelector('.services-expand');
  let category = 'all';
  let expanded = false;
  function renderServices() {
    const matching = services.filter(item => category === 'all' || item.classList.contains(`service-category-${category}`));
    const limited = category === 'all' && !expanded;
    const previewLimit = compact.matches || wide.matches ? 8 : 6;
    services.forEach(item => { item.hidden = true; });
    const visible = limited ? matching.slice(0, previewLimit) : matching;
    visible.forEach(item => { item.hidden = false; });
    filters.forEach(button => button.setAttribute('aria-pressed', String(button.dataset.category === category)));
    status.textContent = limited ? `Showing ${visible.length} of ${matching.length} services` : `${matching.length} ${matching.length === 1 ? 'service' : 'services'}`;
    expand.hidden = category !== 'all';
    expand.setAttribute('aria-expanded', String(expanded));
    expand.innerHTML = expanded ? 'Show fewer services <span aria-hidden="true">−</span>' : `View all ${services.length} services <span aria-hidden="true">+</span>`;
  }
  filterBar.hidden = false;
  filters.forEach(button => button.addEventListener('click', () => {
    category = button.dataset.category;
    expanded = false;
    renderServices();
  }));
  expand.addEventListener('click', () => {
    expanded = !expanded;
    renderServices();
    if (!expanded) filterBar.scrollIntoView({block:'start',behavior:matchMedia('(prefers-reduced-motion: reduce)').matches ? 'instant' : 'smooth'});
  });
  compact.addEventListener('change', renderServices);
  wide.addEventListener('change', renderServices);
  function revealHashTarget(behavior = 'instant') {
    const item = services.find(service => `#${service.id}` === location.hash);
    if (!item) return;
    if (item.hidden) {
      category = 'all';
      expanded = true;
      renderServices();
    }
    requestAnimationFrame(() => item.scrollIntoView({block:'start',behavior}));
  }
  renderServices();
  window.addEventListener('hashchange', () => revealHashTarget());
  document.addEventListener('click', event => {
    if (event.button !== 0 || event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) return;
    const link = event.target.closest('a[href^="#"]');
    if (!link || !services.some(service => `#${service.id}` === link.hash)) return;
    event.preventDefault();
    if (location.hash !== link.hash) history.pushState(null, '', link.hash);
    const quiet = matchMedia('(prefers-reduced-motion: reduce)').matches || document.documentElement.classList.contains('motion-paused');
    revealHashTarget(quiet ? 'instant' : 'smooth');
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
