// Two credential lanes, with accessible originals and decorative inert duplicates.
(() => {
  const section = document.querySelector('#certifications');
  if (!section) return;
  const reduced = matchMedia('(prefers-reduced-motion: reduce)');
  const pause = section.querySelector('.credential-pause');
  const issuerAnimations = new Set();
  let visible = false;
  const quiet = () => reduced.matches || document.documentElement.classList.contains('motion-paused');
  section.querySelectorAll('.credential-group').forEach(group => {
    const duplicate = group.cloneNode(true);
    duplicate.setAttribute('aria-hidden','true');
    duplicate.inert = true;
    duplicate.querySelectorAll('a,summary').forEach(item=>item.tabIndex=-1);
    group.parentElement.append(duplicate);
  });
  function sync() {
    if(quiet()) {issuerAnimations.forEach(animation=>animation.complete());issuerAnimations.clear();}
    section.classList.toggle('credentials-moving',!quiet());
    pause.hidden = quiet();
    section.querySelectorAll('.credential-group[aria-hidden]').forEach(group=>group.hidden=quiet());
  }
  pause.addEventListener('click',()=>{
    const paused = pause.getAttribute('aria-pressed')!=='true';
    pause.setAttribute('aria-pressed',String(paused));
    pause.textContent=paused?'Resume credentials':'Pause credentials';
    section.classList.toggle('is-paused',paused);
  });
  reduced.addEventListener('change',sync);
  new MutationObserver(sync).observe(document.documentElement,{attributes:true,attributeFilter:['class']});
  const updatePlayback = () => section.classList.toggle('is-offscreen',!visible||document.hidden);
  document.addEventListener('visibilitychange',updatePlayback);
  if('IntersectionObserver' in window)new IntersectionObserver(entries=>{visible=entries[0].isIntersecting;updatePlayback();},{threshold:.05}).observe(section);
  // Small issuer movement when the reader intentionally explores a credential.
  section.querySelectorAll('.credential-group:not([aria-hidden]) .learning-card').forEach(card=>{
    let animation;
    function respond(){
      if(quiet()||!window.Motion)return;
      animation?.complete();
      animation=Motion.animate(card.querySelector('.learning-issuer'),{y:[0,-3,0]},{duration:.3,ease:'easeOut'});
      issuerAnimations.add(animation);
      const current=animation;
      current.finished.then(()=>issuerAnimations.delete(current)).catch(()=>issuerAnimations.delete(current));
    }
    card.addEventListener('pointerenter',event=>{if(event.pointerType==='mouse')respond();});
    card.addEventListener('focusin',respond);
  });
  sync();
})();
