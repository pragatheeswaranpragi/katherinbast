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

})();
