// Shared native-dialog portrait viewer, with keyboard navigation.
(() => {
  const gallery = [...document.querySelectorAll('.gallery-photo')];
  const dialog = document.querySelector('.gallery-dialog');
  if (!gallery.length || !dialog || typeof dialog.showModal !== 'function') return;
  const image = dialog.querySelector('.gallery-full-image');
  const title = dialog.querySelector('#gallery-dialog-title');
  const position = dialog.querySelector('.gallery-position');
  let current = 0;
  let opener;
  let previousOverflow;
  function show(index) {
    current = (index + gallery.length) % gallery.length;
    const selected = gallery[current];
    dialog.querySelector('.gallery-full-svg')?.remove();
    const source = selected.querySelector('.gallery-source-svg');
    image.hidden = Boolean(source);
    if (source) {
      const portrait = source.cloneNode(true);
      portrait.setAttribute('class', 'gallery-full-svg');
      portrait.setAttribute('preserveAspectRatio', 'xMidYMid meet');
      portrait.querySelectorAll('clipPath[id]').forEach(clip => {
        const previousId = clip.id;
        clip.id = `viewer-${previousId}`;
        portrait.querySelectorAll('[clip-path]').forEach(element => {
          if (element.getAttribute('clip-path') === `url(#${previousId})`) element.setAttribute('clip-path', `url(#${clip.id})`);
        });
      });
      image.after(portrait);
    } else {
      image.src = selected.href;
      image.alt = selected.dataset.galleryName;
    }
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
