// Preserve old Services bookmarks while keeping the portfolio on a single page.
(() => {
  const fragment = location.hash.slice(1);
  const target = fragment === 'catalog' ? 'services' : fragment || document.body.dataset.serviceTarget || 'services';
  location.replace(`/${target ? '#' + target : ''}`);
})();
