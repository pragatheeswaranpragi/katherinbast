// Centered, native-scrolling video frames with visible-only muted autoplay.
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
  const autoplayToggle = carousel.querySelector('.video-autoplay-toggle');
  const hint = carousel.querySelector('#video-carousel-hint');
  const reduced = matchMedia('(prefers-reduced-motion: reduce)');
  const quiet = () => reduced.matches || document.documentElement.classList.contains('motion-paused');
  let current = Math.floor(cards.length / 2);
  let centers = [];
  let width = 0;
  let frame;
  let settle;
  let scrolling = false;
  let inView = false;
  let autoplayEnabled = !quiet();
  const automaticPauses = new WeakSet();

  function pause(video) {
    if (video.paused) return;
    automaticPauses.add(video);
    video.pause();
  }
  function pauseAll() { videos.forEach(pause); }
  function updateAutoplay() {
    autoplayToggle.setAttribute('aria-pressed', String(autoplayEnabled));
    autoplayToggle.querySelector('span').textContent = autoplayEnabled ? 'Pause videos' : 'Play videos';
    hint.textContent = autoplayEnabled
      ? 'Silent videos · Swipe to explore'
      : 'Paused · Tap Play videos to continue';
  }
  function syncPlayback() {
    videos.forEach((video, index) => { if (index !== current) pause(video); });
    if (!inView || scrolling || document.hidden) { pauseAll(); return; }
    if (!autoplayEnabled) return;
    const video = videos[current];
    if (!video.paused) return;
    video.muted = true;
    // A visible play button offers a user gesture if automatic playback is declined.
    const selected = current;
    video.play().catch(error => {
      if (error.name === 'NotAllowedError' && selected === current && inView && !scrolling) {
        autoplayEnabled = false;
        updateAutoplay();
      }
    });
  }
  function activate(index) {
    const changed = index !== current;
    if (changed && cards[current]?.contains(document.activeElement)) carousel.focus({preventScroll:true});
    current = index;
    cards.forEach((card, i) => {
      const selected = i === current;
      card.classList.toggle('is-selected', selected);
      card.setAttribute('aria-hidden', String(!selected));
      videos[i].controls = false;
      videos[i].tabIndex = -1;
      card.querySelector('.video-preview-select').hidden = selected;
      if (!selected) pause(videos[i]);
      dots[i].setAttribute('aria-current', String(selected));
    });
    if (changed) {
      videos[current].muted = true;
      if (videos[current].readyState >= 1) videos[current].currentTime = 0;
    }
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
    if (!scrolling) pauseAll();
    scrolling = true;
    cancelAnimationFrame(frame);
    frame = requestAnimationFrame(render);
    clearTimeout(settle);
    settle = setTimeout(() => {
      scrolling = false;
      render();
      announce();
      syncPlayback();
    }, 160);
  }
  function select(index) {
    const target = Math.max(0, Math.min(cards.length - 1, index));
    const left = centers[target] - width / 2;
    if (target === current && Math.abs(viewport.scrollLeft - left) < 1) { syncPlayback(); return; }
    pauseAll();
    viewport.scrollTo({left, behavior:quiet() ? 'instant' : 'smooth'});
    schedule();
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
    schedule();
  }
  videos.forEach((video, index) => {
    video.muted = true;
    video.defaultMuted = true;
    video.loop = true;
    video.addEventListener('pause', () => {
      if (automaticPauses.delete(video)) return;
      // A native pause is a user choice; navigation must not restart it.
      if (index === current && autoplayEnabled) {
        autoplayEnabled = false;
        updateAutoplay();
      }
    });
  });
  cards.forEach((card, index) => {
    card.setAttribute('aria-roledescription', 'slide');
    card.setAttribute('aria-label', `${index + 1} of ${cards.length}: ${card.querySelector('h3').textContent}`);
    card.querySelector('.video-preview-select').addEventListener('click', () => select(index));
  });
  previous.addEventListener('click', () => select(current - 1));
  next.addEventListener('click', () => select(current + 1));
  dots.forEach(dot => dot.addEventListener('click', () => select(Number(dot.dataset.videoIndex))));
  autoplayToggle.addEventListener('click', () => {
    autoplayEnabled = !autoplayEnabled;
    updateAutoplay();
    if (autoplayEnabled) syncPlayback();
    else pauseAll();
  });
  viewport.addEventListener('scroll', schedule, {passive:true});
  carousel.addEventListener('keydown', event => {
    if (event.target.closest('video')) return;
    if (event.key === 'ArrowLeft') { event.preventDefault(); select(current - 1); }
    if (event.key === 'ArrowRight') { event.preventDefault(); select(current + 1); }
    if (event.key === 'Home') { event.preventDefault(); select(0); }
    if (event.key === 'End') { event.preventDefault(); select(cards.length - 1); }
  });
  reduced.addEventListener('change', () => {
    if (reduced.matches) { autoplayEnabled = false; pauseAll(); }
    updateAutoplay();
    resize();
    render();
    syncPlayback();
  });
  document.addEventListener('visibilitychange', syncPlayback);
  if ('IntersectionObserver' in window) {
    new IntersectionObserver(entries => {
      inView = entries[0].isIntersecting && entries[0].intersectionRatio >= .4;
      syncPlayback();
    }, {threshold:[0,.4,.7]}).observe(viewport);
  }
  updateAutoplay();
  activate(current);
  resize();
  carousel.querySelector('.video-carousel-navigation').hidden = false;
  autoplayToggle.hidden = false;
  if ('ResizeObserver' in window) new ResizeObserver(resize).observe(viewport);
  else window.addEventListener('resize', resize, {passive:true});
})();
