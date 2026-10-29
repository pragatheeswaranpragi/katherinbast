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

// Decorative looping motion runs only while the brands are in view.
const movingBrands = document.querySelector('.brand-marquee');
if (movingBrands && 'IntersectionObserver' in window) {
  const visibility = new IntersectionObserver(entries => {
    movingBrands.classList.toggle('motion-offscreen', !entries[0].isIntersecting);
  });
  visibility.observe(movingBrands);
}
