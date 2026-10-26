(() => {
  'use strict';
  const reduced = window.matchMedia('(prefers-reduced-motion: reduce)');
  const root = document.documentElement;
  const pause = document.querySelector('.motion-control');
  let paused = false;
  const quiet = () => reduced.matches || paused;
  const sync = () => {
    root.classList.toggle('motion-paused', paused);
    pause.hidden = reduced.matches;
    pause.setAttribute('aria-pressed', String(paused));
    pause.textContent = paused ? 'Enable motion' : 'Pause motion';
    if (window.ScrollTrigger) ScrollTrigger.getAll().forEach(t => quiet() ? t.disable(false) : t.enable());
    document.getAnimations().forEach(a => { if (quiet()) a.finish(); });
  };
  pause.hidden = false;
  pause.addEventListener('click', () => { paused = !paused; sync(); });
  reduced.addEventListener('change', sync);

  document.querySelectorAll('[data-signature-focus]').forEach(link => link.addEventListener('click', () => {
    const filter = document.querySelector(`[data-service-filter="${link.dataset.signatureFocus}"]`);
    if (filter) filter.click();
  }));

  const plans = [
    ['.work-heading, .focus-heading, .approach-heading, .about>div:first-child, .credential-heading, .review-section-heading, .contact>h2', 'heading'],
    ['.selected-case, .beauty-identity, .project-art, .graxi-intro', 'picture'],
    ['.people-names>li, .partner-register>div, .credential-ledger>li', 'row'],
    ['.practice-pair>article, .steps>article, .about-copy, .doctor-directory, .support-network>details, .faq details', 'copy'],
  ];
  if ('IntersectionObserver' in window) {
    const observer = new IntersectionObserver(entries => entries.forEach(entry => {
      if (!entry.isIntersecting) return;
      observer.unobserve(entry.target);
      if (quiet()) return;
      const kind = entry.target.dataset.arrival;
      const frames = kind === 'picture' ? [{clipPath:'inset(0 0 18% 0)',transform:'scale(.97)'},{clipPath:'inset(0)',transform:'none'}] : kind === 'row' ? [{opacity:.45,transform:'translateX(24px)'},{opacity:1,transform:'none'}] : kind === 'heading' ? [{clipPath:'inset(20% 0 0)',transform:'translateY(22px)'},{clipPath:'inset(0)',transform:'none'}] : [{opacity:.45,transform:'translateY(18px)'},{opacity:1,transform:'none'}];
      entry.target.animate(frames,{duration:kind==='picture'?1100:750,easing:'cubic-bezier(.16,1,.3,1)',delay:Number(entry.target.dataset.delay || 0)});
    }), {threshold:.12});
    plans.forEach(([selector,kind]) => document.querySelectorAll(selector).forEach((el,i) => { el.dataset.arrival=kind;el.dataset.delay=String((i%3)*65);observer.observe(el); }));
  }
  if (window.gsap && window.ScrollTrigger) {
    gsap.registerPlugin(ScrollTrigger);
    gsap.matchMedia().add('(prefers-reduced-motion: no-preference)', () => {
      gsap.fromTo('.paper-art',{scale:1.08,y:0},{scale:1.08,y:-18,ease:'none',scrollTrigger:{trigger:'.paper-story',start:'top bottom',end:'bottom top',scrub:true}});
    });
  }
  sync();
})();
