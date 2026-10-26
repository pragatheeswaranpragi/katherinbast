// Decorative Motion animation. Paused off-screen, in background tabs and on request.
(() => {
  const hero = document.querySelector('.split-hero');
  if (!hero || !window.Motion) return;
  const { animate } = window.Motion;
  const ring = hero.querySelector('.hero-ring');
  const satellite = hero.querySelector('.hero-satellite');
  const toggle = hero.querySelector('.hero-motion-toggle');
  const reduced = matchMedia('(prefers-reduced-motion: reduce)');
  let visible = false, paused = false, loops = [], entrance;
  const quiet = () => reduced.matches || document.documentElement.classList.contains('motion-paused');
  function sync() {
    toggle.hidden = quiet();
    const play = visible && !document.hidden && !paused && !quiet();
    if (play && !loops.length) {
      loops = [animate(ring,{rotate:[0,360]},{duration:48,repeat:Infinity,ease:'linear'}),animate(satellite,{rotate:[0,-360]},{duration:32,repeat:Infinity,ease:'linear'})];
    }
    loops.forEach(animation => play ? animation.play() : animation.pause());
    if (quiet() && entrance) entrance.complete();
  }
  toggle.hidden = false;
  toggle.addEventListener('click', () => {
    paused = !paused;
    toggle.setAttribute('aria-pressed',String(paused));
    toggle.textContent = paused ? 'Resume animation' : 'Pause animation';
    sync();
  });
  reduced.addEventListener('change',sync);
  document.addEventListener('visibilitychange',sync);
  new MutationObserver(sync).observe(document.documentElement,{attributes:true,attributeFilter:['class']});
  if ('IntersectionObserver' in window) {
    new IntersectionObserver(entries => {visible = entries[0].isIntersecting;sync();},{threshold:.05}).observe(hero);
  }
  if (!quiet()) entrance = animate(hero.querySelector('.hero-copy'),{opacity:[.4,1],y:[14,0]},{duration:.5,ease:'easeOut'});
  sync();
})();
