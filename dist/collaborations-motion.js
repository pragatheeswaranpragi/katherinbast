// One-time grid entrance; all names remain visible without JavaScript.
(() => {
  const grid=document.querySelector('.collaboration-grid');
  if(!grid||!window.Motion||!('IntersectionObserver' in window))return;
  const reduced=matchMedia('(prefers-reduced-motion: reduce)');
  const quiet=()=>reduced.matches||document.documentElement.classList.contains('motion-paused');
  const animations=new Set();
  const settle=()=>{if(quiet()){animations.forEach(a=>a.complete());animations.clear();}};
  reduced.addEventListener('change',settle);
  new MutationObserver(settle).observe(document.documentElement,{attributes:true,attributeFilter:['class']});
  const observer=new IntersectionObserver(entries=>{
    if(!entries.some(entry=>entry.isIntersecting))return;
    observer.disconnect();
    if(quiet())return;
    grid.querySelectorAll('.collaboration-tile').forEach((tile,index)=>{
      const animation=Motion.animate(tile,{opacity:[.3,1],y:[14,0]},{duration:.4,delay:index*.045,ease:'easeOut'});
      animations.add(animation);
      animation.finished.then(()=>animations.delete(animation)).catch(()=>animations.delete(animation));
    });
  },{threshold:.12});
  observer.observe(grid);
})();
