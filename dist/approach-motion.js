// Linked priorities: Motion transitions, with visible-only automatic playback.
(() => {
  const section = document.querySelector('.approach-studio');
  if (!section) return;
  const buttons = [...section.querySelectorAll('.priority-choice')];
  const tiles = [...section.querySelectorAll('.capability-tile')];
  const line = section.querySelector('.priority-indicator');
  const progress = section.querySelector('.priority-progress');
  const pause = section.querySelector('.approach-pause');
  const status = section.querySelector('#approach-status');
  const reduced = matchMedia('(prefers-reduced-motion: reduce)');
  const animations = new Set();
  let initialized = false;
  let current = 0, visible = false, hovered = false, focused = false, userPaused = false, timer;
  const motion = window.Motion;
  const quiet = () => reduced.matches || document.documentElement.classList.contains('motion-paused');
  const canPlay = () => motion && visible && !document.hidden && !quiet() && !hovered && !focused && !userPaused;
  function stopAnimations() { animations.forEach(a => a.stop()); animations.clear(); }
  function animate(element, frames, options) {
    if (!motion || quiet()) return;
    const animation = motion.animate(element, frames, options);
    animations.add(animation);
    animation.finished.then(() => animations.delete(animation)).catch(() => animations.delete(animation));
    return animation;
  }
  function positionLine(transition = false) {
    const y = buttons[current].offsetTop + buttons[current].offsetHeight - 1;
    if (transition && motion && !quiet()) animate(line, {transform: `translateY(${y}px)`}, {duration:.3,ease:'easeOut'});
    else line.style.transform = `translateY(${y}px)`;
  }
  function schedule() {
    clearTimeout(timer);
    // The moving line also shows time to the next priority.
    if (progress.animation) { progress.animation.stop(); animations.delete(progress.animation); }
    progress.style.transform = 'scaleX(1)';
    if (!canPlay()) return;
    progress.animation = animate(progress, {scaleX:[0,1]}, {duration:6,ease:'linear'});
    timer = setTimeout(() => choose((current + 1) % buttons.length), 6000);
  }
  function choose(index, announce = false) {
    if (initialized && current === index) {
      if (announce) status.textContent = buttons[current].textContent.trim();
      schedule();
      return;
    }
    initialized = true;
    const changed = current !== index;
    current = index;
    stopAnimations();
    const active = new Set(buttons[current].dataset.capabilities.split(' '));
    buttons.forEach((button,i) => button.setAttribute('aria-pressed', String(i === current)));
    tiles.forEach(tile => {
      const selected = active.has(tile.dataset.capability);
      const wasSelected = tile.classList.contains('is-active');
      tile.classList.toggle('is-active', selected);
      if (changed && wasSelected !== selected && !quiet()) {
        animate(tile, {opacity:selected ? [.42,1] : [1,.42],y:selected ? [0,-5] : [-5,0]}, {duration:.35,ease:'easeOut'});
      } else { tile.style.opacity = selected ? '1' : '.42'; tile.style.transform = selected && !quiet() ? 'translateY(-5px)' : 'none'; }
    });
    positionLine(changed);
    if (announce) status.textContent = buttons[current].textContent.trim();
    schedule();
  }
  section.classList.add('approach-enhanced');
  buttons.forEach((button,index) => {
    button.disabled = false;
    button.addEventListener('pointerenter', event => { if (event.pointerType === 'mouse') choose(index); });
    button.addEventListener('focus', () => choose(index));
    button.addEventListener('click', () => choose(index, true));
    button.addEventListener('keydown', event => {
      const keys = {ArrowDown:(index+1)%buttons.length,ArrowUp:(index+buttons.length-1)%buttons.length,Home:0,End:buttons.length-1};
      if (event.key in keys) { event.preventDefault(); buttons[keys[event.key]].focus(); }
    });
  });
  section.addEventListener('pointerenter', event => { if(event.pointerType==='mouse') { hovered = true; schedule(); } });
  section.addEventListener('pointerleave', () => { hovered = false; schedule(); });
  section.addEventListener('focusin', () => { focused = true; schedule(); });
  section.addEventListener('focusout', () => { setTimeout(() => { focused = section.contains(document.activeElement); schedule(); },0); });
  pause.hidden = !motion;
  pause.addEventListener('click', () => {
    userPaused = !userPaused;
    pause.setAttribute('aria-pressed', String(userPaused));
    pause.textContent = userPaused ? 'Resume animation' : 'Pause animation';
    schedule();
  });
  function syncMotion() {
    pause.hidden = !motion || quiet();
    if (quiet()) { stopAnimations(); initialized = false; choose(current); }
    else schedule();
  }
  reduced.addEventListener('change', syncMotion);
  new MutationObserver(syncMotion).observe(document.documentElement,{attributes:true,attributeFilter:['class']});
  document.addEventListener('visibilitychange', schedule);
  if ('IntersectionObserver' in window) {
    new IntersectionObserver(entries => { visible = entries[0].isIntersecting; schedule(); },{threshold:.15}).observe(section);
  }
  if ('ResizeObserver' in window) new ResizeObserver(() => positionLine()).observe(section.querySelector('.priority-list'));
  choose(0);
  syncMotion();
})();
