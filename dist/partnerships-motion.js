// Motion powers the bento entrance, icon feedback and opened partnership details.
(() => {
  const grid=document.querySelector('.partnership-bento');
  if(!grid||!window.Motion)return;
  const reduced=matchMedia('(prefers-reduced-motion: reduce)');
  const quiet=()=>reduced.matches||document.documentElement.classList.contains('motion-paused');
  const running=new Set();
  function play(element,frames,options){
    const animation=Motion.animate(element,frames,options);running.add(animation);
    animation.finished.then(()=>running.delete(animation)).catch(()=>running.delete(animation));
    return animation;
  }
  const settle=()=>{if(quiet()){running.forEach(animation=>animation.complete());running.clear();}};
  reduced.addEventListener('change',settle);
  new MutationObserver(settle).observe(document.documentElement,{attributes:true,attributeFilter:['class']});
  grid.querySelectorAll('.partnership-card').forEach((card,index)=>{
    let feedback;
    const icon=card.querySelector('.partnership-monogram');
    function respond(){if(quiet())return;feedback?.complete();feedback=play(icon,{scale:[1,1.07,1],y:[0,-2,0]},{duration:.3,ease:'easeOut'});}
    card.addEventListener('pointerenter',event=>{if(event.pointerType==='mouse')respond();});
    card.addEventListener('focusin',respond);
    card.addEventListener('toggle',()=>{
      if(card.open&&!quiet())play(card.querySelector('.partnership-card-detail'),{opacity:[.3,1],y:[8,0]},{duration:.2,ease:'easeOut'});
    });
    if('IntersectionObserver' in window){
      const observer=new IntersectionObserver(entries=>{
        if(!entries.some(entry=>entry.isIntersecting))return;observer.disconnect();
        if(!quiet())play(card,{opacity:[.3,1],y:[18,0]},{duration:.4,delay:index*.05,ease:'easeOut'});
      },{threshold:.1});observer.observe(card);
    }
  });
})();
