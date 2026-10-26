// Local Motion feedback for the support-network disclosures.
(() => {
  const panels=[...document.querySelectorAll('.team-panel')];
  if(!panels.length||!window.Motion)return;
  const reduced=matchMedia('(prefers-reduced-motion: reduce)');
  const quiet=()=>reduced.matches||document.documentElement.classList.contains('motion-paused');
  const active=new Set();
  const settle=()=>{if(quiet()){active.forEach(animation=>animation.complete());active.clear();}};
  reduced.addEventListener('change',settle);
  new MutationObserver(settle).observe(document.documentElement,{attributes:true,attributeFilter:['class']});
  panels.forEach(panel=>{
    let animation;
    panel.addEventListener('toggle',()=>{
      if(quiet()||!panel.open)return;
      animation?.complete();
      animation=Motion.animate(panel.querySelector('.team-content'),{opacity:[.3,1],y:[6,0]},{duration:.25,ease:'easeOut'});
      const current=animation;active.add(current);
      current.finished.then(()=>active.delete(current)).catch(()=>active.delete(current));
    });
  });
})();
