// Motion 14.6.0: vanilla browser build; the site remains buildless.
(() => {
  const grid = document.querySelector('.strategy-grid');
  if (!grid || !window.Motion) return;
  const { animate } = window.Motion;
  const reduced = matchMedia('(prefers-reduced-motion: reduce)');
  const quiet = () => reduced.matches || document.documentElement.classList.contains('motion-paused');
  const running = new Set();
  function play(element, frames, options) {
    const animation = animate(element, frames, options);
    running.add(animation);
    animation.finished.then(() => running.delete(animation)).catch(() => running.delete(animation));
    return animation;
  }
  function settle() {
    if (!quiet()) return;
    running.forEach(animation => animation.complete());
    running.clear();
  }
  reduced.addEventListener('change', settle);
  new MutationObserver(settle).observe(document.documentElement, {attributes:true,attributeFilter:['class']});
  grid.querySelectorAll('.strategy-feature').forEach(feature => {
    const icon = feature.querySelector('.strategy-icon>svg');
    let iconAnimation;
    const sparkAnimations = [];
    function respond() {
      if (quiet()) return;
      if (iconAnimation) iconAnimation.complete();
      iconAnimation = play(icon, { y: [0,-4,0], rotate: [0,-6,0] }, {duration:.35,ease:'easeOut'});
      sparkAnimations.forEach(animation => animation.complete());
      sparkAnimations.length = 0;
      feature.querySelectorAll('.strategy-sparks i').forEach((spark, index) => {
        const offsets = [[-30,-18],[28,-22],[-22,28],[29,22]][index];
        sparkAnimations.push(play(spark, {x:[0,offsets[0]],y:[0,offsets[1]],opacity:[0,1,0],scale:[.5,1,.5]}, {duration:.5,delay:index*.025,ease:'easeOut'}));
      });
    }
    feature.addEventListener('pointerenter', event => { if (event.pointerType==='mouse') respond(); });
    feature.addEventListener('focus', respond);
    feature.addEventListener('pointerdown', event => { if(event.pointerType!=='mouse') respond(); });
  });
  if ('IntersectionObserver' in window) {
    const observer = new IntersectionObserver(entries => {
      if (!entries.some(entry => entry.isIntersecting)) return;
      observer.disconnect();
      if (quiet()) return;
      grid.querySelectorAll('.strategy-feature').forEach((feature,index) => {
        play(feature, {opacity:[.35,1],y:[12,0]}, {duration:.4,delay:index*.06,ease:'easeOut'});
      });
    }, {threshold:.12});
    observer.observe(grid);
  }
})();
