// Motion: low-amplitude pill float, paused when not useful or not requested.
(() => {
  const art=document.querySelector('.hero-service-art');
  if(!art||!window.Motion)return;
  const reduced=matchMedia('(prefers-reduced-motion: reduce)');
  const toggle=art.querySelector('.service-pills-pause');
  const pills=[...art.querySelectorAll('.floating-service')];
  let visible=false,paused=false,animations=[];
  const quiet=()=>reduced.matches||document.documentElement.classList.contains('motion-paused');
  function sync(){
    toggle.hidden=quiet();
    if(quiet()){
      animations.forEach(animation=>animation.cancel());animations=[];
      pills.forEach(pill=>pill.style.removeProperty('transform'));
      return;
    }
    const shouldPlay=visible&&!document.hidden&&!paused;
    if(shouldPlay&&!animations.length)animations=pills.map((pill,index)=>Motion.animate(pill,{x:[0,[3,-4,2,-3,4,-2,3][index],0],y:[0,[-5,4,-3,6,-4,3,-5][index],0]},{duration:[4.1,5.3,4.7,6.2,5.7,4.4,5.9][index],delay:[0,.7,.2,1.1,.4,.9,.3][index],repeat:Infinity,ease:'easeInOut'}));
    animations.forEach(animation=>shouldPlay?animation.play():animation.pause());
  }
  toggle.addEventListener('click',()=>{
    paused=!paused;toggle.setAttribute('aria-pressed',String(paused));
    toggle.textContent=paused?'Resume floating pills':'Pause floating pills';sync();
  });
  // Keep individual links steady for precise pointer and keyboard activation.
  pills.forEach((pill,index)=>{
    const hold=()=>animations[index]?.pause();
    const release=()=>{if(!pill.matches(':hover,:focus-within'))sync();};
    pill.addEventListener('pointerenter',hold);pill.addEventListener('pointerleave',release);
    pill.addEventListener('focusin',hold);pill.addEventListener('focusout',()=>setTimeout(release,0));
  });
  reduced.addEventListener('change',sync);document.addEventListener('visibilitychange',sync);
  new MutationObserver(sync).observe(document.documentElement,{attributes:true,attributeFilter:['class']});
  if('IntersectionObserver' in window)new IntersectionObserver(entries=>{visible=entries[0].isIntersecting;sync();},{threshold:.05}).observe(art);
  sync();
})();
