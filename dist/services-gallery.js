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

  const gallery = [...document.querySelectorAll('.gallery-photo')];
  const dialog = document.querySelector('.gallery-dialog');
  if (!dialog || typeof dialog.showModal !== 'function') return;
  const image = dialog.querySelector('.gallery-full-image');
  const title = dialog.querySelector('#gallery-dialog-title');
  const position = dialog.querySelector('.gallery-position');
  let current = 0;
  let opener;
  let previousOverflow;
  function show(index) {
    current = (index + gallery.length) % gallery.length;
    const selected = gallery[current];
    image.src = selected.href;
    image.alt = selected.dataset.galleryName;
    title.textContent = selected.dataset.galleryName;
    position.textContent = `${current + 1} / ${gallery.length}`;
  }
  gallery.forEach((link, index) => link.addEventListener('click', event => {
    if (event.button !== 0 || event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) return;
    event.preventDefault();
    opener = link;
    show(index);
    previousOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    dialog.showModal();
  }));
  dialog.querySelector('.gallery-previous').addEventListener('click', () => show(current - 1));
  dialog.querySelector('.gallery-next').addEventListener('click', () => show(current + 1));
  dialog.addEventListener('keydown', event => {
    if (event.key === 'ArrowRight') { event.preventDefault(); show(current + 1); }
    if (event.key === 'ArrowLeft') { event.preventDefault(); show(current - 1); }
  });
  dialog.addEventListener('click', event => { if (event.target === dialog) dialog.close(); });
  dialog.addEventListener('close', () => {
    document.body.style.overflow = previousOverflow;
    opener?.focus({preventScroll:true});
  });
})();
