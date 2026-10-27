// Native disclosures keep their semantics while their height changes gently.
(() => {
  const reduced = matchMedia('(prefers-reduced-motion: reduce)');
  const quiet = () => reduced.matches || document.documentElement.classList.contains('motion-paused');
  const running = new Map();
  function finish(details, state) {
    if (running.get(details) !== state) return;
    running.delete(details);
    state.animation.cancel();
    details.open = state.open;
    details.style.overflow = state.overflow;
  }
  function settle() {
    running.forEach((state, details) => finish(details, state));
  }
  reduced.addEventListener('change', () => { if (quiet()) settle(); });
  new MutationObserver(() => { if (quiet()) settle(); }).observe(document.documentElement, {attributes:true,attributeFilter:['class']});
  window.addEventListener('resize', settle, {passive:true});
  document.querySelectorAll('.experience-details, .faq-list>details, .partnership-card, .learning-details').forEach(details => {
    const summary = details.querySelector(':scope>summary');
    if (!summary) return;
    summary.addEventListener('click', event => {
      if (event.defaultPrevented || event.target.closest('a,button,input') || quiet() || !details.animate) return;
      event.preventDefault();
      const previous = running.get(details);
      const open = previous ? !previous.open : !details.open;
      const from = details.getBoundingClientRect().height;
      const overflow = previous ? previous.overflow : details.style.overflow;
      previous?.animation.cancel();
      details.open = true;
      const expanded = details.getBoundingClientRect().height;
      // Measure the collapsed box, including this component's padding.
      details.open = false;
      const collapsed = details.getBoundingClientRect().height;
      details.open = true;
      details.style.overflow = 'hidden';
      const animation = details.animate(
        [{height:`${from}px`},{height:`${open ? expanded : collapsed}px`}],
        {duration:300,easing:'cubic-bezier(.22,1,.36,1)',fill:'both'}
      );
      const state = {animation,open,overflow};
      running.set(details, state);
      animation.finished.then(() => finish(details, state)).catch(() => {});
    });
  });
})();
