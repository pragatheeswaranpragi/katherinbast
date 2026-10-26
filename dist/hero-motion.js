// Decorative Motion animation. Paused off-screen, in background tabs and on request.
(() => {
  const hero = document.querySelector('.split-hero');
  if (!hero || !window.Motion) return;
  const { animate } = window.Motion;
  const paths = [...hero.querySelectorAll('.marketing-branch')];
  const toggle = hero.querySelector('.hero-motion-toggle');
  const reduced = matchMedia('(prefers-reduced-motion: reduce)');
  let visible = false, paused = false, loops = [], entrance;
  const quiet = () => reduced.matches || document.documentElement.classList.contains('motion-paused');
  function sync() {
    toggle.hidden = quiet();
    const play = visible && !document.hidden && !paused && !quiet();
    if (play && !loops.length) {
      loops = paths.map((path,index) => {
        const light = hero.querySelector(`[data-light="${path.dataset.branch}"]`);
        const length = path.getTotalLength();
        const points = Array.from({length:61},(_,i) => path.getPointAtLength(length*(1-i/60)));
        return animate(light, {
          x:points.map(point=>point.x), y:points.map(point=>point.y),
          opacity:points.map((_,i)=>i<4 ? i/4 : i>53 ? (60-i)/7 : 1)
        }, {duration:3.6+(index%3)*.4,delay:[0,1.7,.5,2.3,.9,2.8,1.2,.3,2,1.5,2.6][index],repeat:Infinity,repeatDelay:2.4,ease:'linear'});
      });
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
  // Anchor each branch to its topic after responsive layout is measured.
  function layoutBranches() {
    const svg = hero.querySelector('.marketing-connections');
    const matrix = svg.getScreenCTM();
    if (!matrix) return;
    const inverse = matrix.inverse();
    const points = paths.map(path => {
      const bounds = hero.querySelector(`.marketing-topic-${path.dataset.branch}`).getBoundingClientRect();
      return new DOMPoint(bounds.x + bounds.width/2,bounds.y + bounds.height/2).matrixTransform(inverse);
    });
    const hub = hero.querySelector('.marketing-hub').getBoundingClientRect();
    const root = new DOMPoint(hub.right - 12,hub.top + hub.height/2).matrixTransform(inverse);
    paths.forEach((path,index) => {
      const point = points[index];
      // Bounded curves flow out from the source without a spine or mirrored limbs.
      const rightward = point.x > root.x;
      const reach = 45 + (index % 3) * 12;
      const controlX = point.x + (rightward ? -70 : 70);
      path.setAttribute('d',`M${point.x} ${point.y}C${controlX} ${point.y} ${root.x+reach} ${root.y} ${root.x} ${root.y}`);
    });
    loops.forEach(animation => animation.stop());
    loops = [];
    sync();
  }
  if ('ResizeObserver' in window) new ResizeObserver(layoutBranches).observe(hero.querySelector('.hero-art'));
  document.fonts.ready.then(layoutBranches);
  sync();
})();
