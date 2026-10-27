// Native disclosure keeps Services usable without JavaScript.
const servicesMenus = [...document.querySelectorAll('.services-menu')];
servicesMenus.forEach(menu => {
  menu.addEventListener('keydown', event => {
    if (event.key === 'Escape') { menu.open = false; menu.querySelector('summary').focus(); }
  });
  document.addEventListener('click', event => { if (!menu.contains(event.target)) menu.open = false; });
});
// Service pages use the same mobile navigation without loading home-only scripts.
if (document.body.classList.contains('service-page')) {
  const button = document.querySelector('.menu-button');
  const navigation = document.querySelector('#navigation');
  const close = () => { navigation.classList.remove('is-open'); button.setAttribute('aria-expanded', 'false'); button.querySelector('span').textContent = '+'; navigation.querySelectorAll('details[open]').forEach(menu => { menu.open = false; }); };
  button.addEventListener('click', () => {
    const open = button.getAttribute('aria-expanded') !== 'true';
    if (!open) { close(); return; }
    button.setAttribute('aria-expanded', 'true'); navigation.classList.add('is-open'); button.querySelector('span').textContent = '−';
  });
  document.addEventListener('keydown', event => { if (event.key === 'Escape' && button.getAttribute('aria-expanded') === 'true') { close(); button.focus(); } });
}
// Keep both versions of the navigation tidy when moving between viewports.
const sharedHeader = document.querySelector('.header');
const sharedMenuButton = sharedHeader?.querySelector('.menu-button');
const closeSharedNavigation = () => {
  if (sharedMenuButton?.getAttribute('aria-expanded') === 'true') sharedMenuButton.click();
};
document.addEventListener('click', event => {
  if (sharedHeader && !sharedHeader.contains(event.target)) closeSharedNavigation();
});
matchMedia('(min-width: 961px)').addEventListener('change', event => {
  if (event.matches) closeSharedNavigation();
});
if (document.body.classList.contains('service-page') && sharedHeader) {
  const syncHeader = () => sharedHeader.classList.toggle('is-scrolled', window.scrollY > 12);
  window.addEventListener('scroll', syncHeader, {passive:true});
  syncHeader();
}
const explorer = document.querySelector('.service-explorer');
if (explorer) {
  explorer.hidden = false;
  const choices = [...explorer.querySelectorAll('.service-choice')];
  const title = explorer.querySelector('#service-live-title');
  const message = explorer.querySelector('#service-live-message');
  function select(button, announce) {
    if (button.getAttribute('aria-pressed') === 'true') return;
    choices.forEach(item => item.setAttribute('aria-pressed', String(item === button)));
    title.textContent = button.childNodes[1].textContent;
    message.textContent = button.dataset.serviceMessage;
    explorer.querySelector('#service-live-link').href = button.dataset.serviceUrl;
    if (announce) explorer.querySelector('#service-live-status').textContent = title.textContent + '. ' + message.textContent;
    if (!matchMedia('(prefers-reduced-motion: reduce)').matches && !document.documentElement.classList.contains('motion-paused') && title.animate) {
      title.animate([{opacity: .3, transform: 'translateY(8px)'},{opacity:1,transform:'translateY(0)'}],{duration:280,easing:'ease-out'});
    }
  }
  choices.forEach(button => {
    button.addEventListener('pointerenter', event => { if (event.pointerType === 'mouse') select(button, false); });
    button.addEventListener('focus', () => select(button, false));
    button.addEventListener('click', () => select(button, true));
  });
}

// Brand experience: one shared area, with all content available without JS.
const experienceSelector = document.querySelector('.experience-selector');
if (experienceSelector) {
  const choices = [...experienceSelector.querySelectorAll('button')];
  const panels = choices.map(button => document.getElementById(button.getAttribute('aria-controls')));
  const choose = (index, animate = false) => {
    const panel = panels[index];
    const changed = panel.hidden;
    choices.forEach((button, i) => button.setAttribute('aria-pressed', String(i === index)));
    panels.forEach((item, i) => { item.hidden = i !== index; });
    if (matchMedia('(max-width: 600px)').matches) {
      experienceSelector.scrollTo({left: choices[index].offsetLeft - experienceSelector.offsetLeft - 4, behavior: 'instant'});
    }
    if (animate && changed && !matchMedia('(prefers-reduced-motion: reduce)').matches && !document.documentElement.classList.contains('motion-paused')) {
      panel.animate([{opacity:.25,transform:'translateY(12px)'},{opacity:1,transform:'translateY(0)'}], {duration:200,easing:'ease-out'});
    }
  };
  experienceSelector.hidden = false;
  experienceSelector.closest('#work').classList.add('experience-enhanced');
  const fromHash = () => {
    const index = panels.findIndex(panel => '#' + panel.id === location.hash);
    if (index !== -1) choose(index);
  };
  choose(0);
  fromHash();
  window.addEventListener('hashchange', fromHash);
  // Reveal before native fragment navigation measures the target.
  document.querySelectorAll('a[href^="#"]').forEach(link => link.addEventListener('click', () => {
    const index = panels.findIndex(panel => '#' + panel.id === link.hash);
    if (index !== -1) choose(index);
  }));
  choices.forEach((button, index) => {
    button.addEventListener('click', () => choose(index, true));
    button.addEventListener('pointerenter', event => { if (event.pointerType === 'mouse') choose(index, true); });
    button.addEventListener('focus', () => choose(index, true));
    button.addEventListener('keydown', event => {
      const keys = {ArrowRight:(index+1)%choices.length,ArrowLeft:(index+choices.length-1)%choices.length,Home:0,End:choices.length-1};
      if (event.key in keys) { event.preventDefault(); choices[keys[event.key]].focus(); choose(keys[event.key], true); }
    });
  });
}
// Decorative looping motion runs only while the brands are in view.
const movingBrands = document.querySelector('.brand-marquee');
if (movingBrands && 'IntersectionObserver' in window) {
  const visibility = new IntersectionObserver(entries => {
    movingBrands.classList.toggle('motion-offscreen', !entries[0].isIntersecting);
  });
  visibility.observe(movingBrands);
}
