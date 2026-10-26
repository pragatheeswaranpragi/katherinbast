// Motion entrances and issuer micro-interactions; no looping credential motion.
(() => {
  const section = document.querySelector('#certifications');
  if (!section || !window.Motion) return;
  const reduced = matchMedia('(prefers-reduced-motion: reduce)');
  const quiet = () => reduced.matches || document.documentElement.classList.contains('motion-paused');
  const animations = new Set();
  function play(element, frames, options) {
    const animation = Motion.animate(element,frames,options);
    animations.add(animation);
    animation.finished.then(()=>animations.delete(animation)).catch(()=>animations.delete(animation));
    return animation;
  }
  function settle() {if(quiet()) {animations.forEach(a=>a.complete());animations.clear();}}
  reduced.addEventListener('change',settle);
  new MutationObserver(settle).observe(document.documentElement,{attributes:true,attributeFilter:['class']});
  section.querySelectorAll('.learning-card').forEach((card,index)=>{
    const issuer = card.querySelector('.learning-issuer');
    let feedback;
    function respond() {
      if(quiet()) return;
      if(feedback) feedback.complete();
      feedback = play(issuer,{y:[0,-3,0]},{duration:.3,ease:'easeOut'});
    }
    card.addEventListener('pointerenter',event=>{if(event.pointerType==='mouse')respond();});
    card.addEventListener('focusin',respond);
    if('IntersectionObserver' in window) {
      const observer = new IntersectionObserver(entries=>{
        if(!entries.some(entry=>entry.isIntersecting))return;
        observer.disconnect();
        if(!quiet())play(card,{opacity:[.25,1],y:[16,0]},{duration:.45,delay:(index%3)*.07,ease:'easeOut'});
      },{threshold:.1});
      observer.observe(card);
    }
  });
})();
