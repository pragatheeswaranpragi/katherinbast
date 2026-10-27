// Short, readable entrances; content stays visible if animation is unavailable.
(() => {
  const reduced = matchMedia('(prefers-reduced-motion: reduce)');
  const quiet = () => reduced.matches || document.documentElement.classList.contains('motion-paused');
  const running = new Set();
  const targets = document.querySelectorAll('main h1, main h2, .hero-description, .hero-caption, .collaboration-summary, .review-section-heading>p, .approach-heading>p:last-child, .learning-heading>p:last-child');
  function settle() {
    if (!quiet()) return;
    running.forEach(animation => animation.cancel());
    running.clear();
  }
  reduced.addEventListener('change', settle);
  new MutationObserver(settle).observe(document.documentElement, {attributes:true,attributeFilter:['class']});
  if (!('IntersectionObserver' in window)) return;
  const observer = new IntersectionObserver(entries => {
    entries.forEach(entry => {
      if (!entry.isIntersecting) return;
      observer.unobserve(entry.target);
      if (quiet() || !entry.target.animate) return;
      const animation = entry.target.animate(
        [{opacity:.7,transform:'translateY(10px)'},{opacity:1,transform:'translateY(0)'}],
        {duration:480,easing:'cubic-bezier(.22,1,.36,1)'}
      );
      running.add(animation);
      animation.finished.then(() => { animation.cancel(); running.delete(animation); }).catch(() => running.delete(animation));
    });
  }, {threshold:.12,rootMargin:'0px 0px -12px 0px'});
  targets.forEach(element => observer.observe(element));
})();
