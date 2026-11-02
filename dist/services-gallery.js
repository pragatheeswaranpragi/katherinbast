(() => {
  const catalog = document.querySelector('.services-catalog');
  if (!catalog) return;
  const filterBar = catalog.querySelector('.services-filter-bar');
  const filters = [...catalog.querySelectorAll('[data-category]')];
  const services = [...catalog.querySelectorAll('.service-catalog-item')];
  const status = catalog.querySelector('#services-result');
  function filterServices(category) {
    filters.forEach(button => button.setAttribute('aria-pressed', String(button.dataset.category === category)));
    let count = 0;
    services.forEach(item => {
      item.hidden = category !== 'all' && !item.classList.contains(`service-category-${category}`);
      if (!item.hidden) count++;
    });
    status.textContent = `${count} ${count === 1 ? 'service' : 'services'}`;
  }
  filterBar.hidden = false;
  filters.forEach(button => button.addEventListener('click', () => filterServices(button.dataset.category)));
  function revealHashTarget() {
    const item = services.find(service => `#${service.id}` === location.hash);
    if (!item?.hidden) return;
    filterServices('all');
    item.scrollIntoView({block:'start', behavior:'instant'});
  }
  window.addEventListener('hashchange', revealHashTarget);
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
