// Centered, native-scrolling video frames with progressive enhancement.
(() => {
  const carousel = document.querySelector('.video-carousel');
  if (!carousel) return;
  const viewport = carousel.querySelector('.video-carousel-viewport');
  const cards = [...carousel.querySelectorAll('.service-video-card')];
  if (!cards.length) return;
  const videos = cards.map(card => card.querySelector('video'));
  const dots = [...carousel.querySelectorAll('.video-carousel-dot')];
  const previous = carousel.querySelector('.video-carousel-previous');
  const next = carousel.querySelector('.video-carousel-next');
  const status = carousel.querySelector('.video-carousel-status');
  const reduced = matchMedia('(prefers-reduced-motion: reduce)');
  let current = Math.floor(cards.length / 2);
  let centers = [];
  let width = 0;
  let frame;
  let settle;
  const quiet = () => reduced.matches || document.documentElement.classList.contains('motion-paused');

  function activate(index) {
    const changed = index !== current;
    if (changed && cards[current]?.contains(document.activeElement)) carousel.focus({preventScroll:true});
    current = index;
    cards.forEach((card, i) => {
      const selected = i === current;
      card.classList.toggle('is-selected', selected);
      card.setAttribute('aria-hidden', String(!selected));
      videos[i].controls = selected;
      videos[i].tabIndex = selected ? 0 : -1;
      card.querySelector('.video-preview-select').hidden = selected;
      if (!selected) videos[i].pause();
      dots[i].setAttribute('aria-current', String(selected));
    });
    previous.disabled = current === 0;
    next.disabled = current === cards.length - 1;
  }
  function announce() {
    const title = cards[current].querySelector('h3').textContent;
    status.textContent = `${current + 1} / ${cards.length}`;
    status.setAttribute('aria-label', `Video ${current + 1} of ${cards.length}: ${title}`);
  }
  function render() {
    const center = viewport.scrollLeft + width / 2;
    let nearest = 0;
    let smallest = Infinity;
    cards.forEach((card, i) => {
      const delta = (centers[i] - center) / (card.offsetWidth + 22);
      const distance = Math.abs(delta);
      if (distance < smallest) { smallest = distance; nearest = i; }
      card.style.setProperty('--reel-scale', quiet() ? '1' : String(Math.max(.72, 1 - distance * .13)));
      card.style.setProperty('--reel-tilt', quiet() ? '0deg' : `${Math.max(-22, Math.min(22, -delta * 9))}deg`);
      card.style.setProperty('--reel-opacity', String(Math.max(.58, 1 - distance * .09)));
      card.style.zIndex = String(100 - Math.min(99, Math.round(distance * 10)));
    });
    if (nearest !== current) activate(nearest);
  }
  function schedule() {
    cancelAnimationFrame(frame);
    frame = requestAnimationFrame(render);
    clearTimeout(settle);
    settle = setTimeout(announce, 140);
  }
  function select(index) {
    const target = Math.max(0, Math.min(cards.length - 1, index));
    videos.forEach(video => video.pause());
    viewport.scrollTo({left:centers[target] - width / 2, behavior:quiet() ? 'instant' : 'smooth'});
  }
  function resize() {
    const measured = viewport.clientWidth;
    if (!measured || measured === width) return;
    width = measured;
    carousel.style.setProperty('--carousel-width', `${width}px`);
    carousel.style.setProperty('--reel-width', `${Math.min(250, Math.max(180, width * .63))}px`);
    carousel.classList.add('is-ready');
    centers = cards.map(card => card.offsetLeft + card.offsetWidth / 2);
    viewport.scrollLeft = centers[current] - width / 2;
    render();
    announce();
  }
  cards.forEach((card, index) => {
    card.setAttribute('aria-roledescription', 'slide');
    card.setAttribute('aria-label', `${index + 1} of ${cards.length}: ${card.querySelector('h3').textContent}`);
    card.querySelector('.video-preview-select').addEventListener('click', () => select(index));
  });
  previous.addEventListener('click', () => select(current - 1));
  next.addEventListener('click', () => select(current + 1));
  dots.forEach(dot => dot.addEventListener('click', () => select(Number(dot.dataset.videoIndex))));
  viewport.addEventListener('scroll', schedule, {passive:true});
  carousel.addEventListener('keydown', event => {
    // Native video controls retain their arrow keys for seeking and volume.
    if (event.target.closest('video')) return;
    if (event.key === 'ArrowLeft') { event.preventDefault(); select(current - 1); }
    if (event.key === 'ArrowRight') { event.preventDefault(); select(current + 1); }
    if (event.key === 'Home') { event.preventDefault(); select(0); }
    if (event.key === 'End') { event.preventDefault(); select(cards.length - 1); }
  });
  reduced.addEventListener('change', () => { resize(); render(); });
  activate(current);
  resize();
  carousel.querySelector('.video-carousel-navigation').hidden = false;
  if ('ResizeObserver' in window) new ResizeObserver(resize).observe(viewport);
  else window.addEventListener('resize', resize, {passive:true});
})();
