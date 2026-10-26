const menuButton = document.querySelector('.menu-button');
const navigation = document.querySelector('#navigation');
function closeMenu() {
  menuButton.setAttribute('aria-expanded', 'false');
  navigation.classList.remove('is-open');
  menuButton.querySelector('span').textContent = '+';
}
menuButton.addEventListener('click', () => {
  const isOpen = menuButton.getAttribute('aria-expanded') === 'true';
  menuButton.setAttribute('aria-expanded', String(!isOpen));
  navigation.classList.toggle('is-open', !isOpen);
  menuButton.querySelector('span').textContent = isOpen ? '+' : '−';
});
navigation.querySelectorAll('a').forEach(link => link.addEventListener('click', closeMenu));
document.addEventListener('keydown', event => {
  if (event.key === 'Escape' && menuButton.getAttribute('aria-expanded') === 'true') {
    closeMenu();
    menuButton.focus();
  }
});
// Expertise links select the matching priority in the connected approach.
document.querySelectorAll('[data-approach]').forEach(link => {
  link.addEventListener('click', event => {
    if (event.button !== 0 || event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) return;
    document.getElementById(link.dataset.approach)?.click();
  });
});

const header = document.querySelector('.header');
const progress = document.querySelector('.reading-progress span');
const sectionLinks = [...navigation.querySelectorAll('a[href^="#"]')];
const sections = sectionLinks.map(link => ({link, section: document.querySelector(link.hash)})).filter(item => item.section);
function updateHeader() {
  header.classList.toggle('is-scrolled', window.scrollY > 12);
  const availableScroll = document.documentElement.scrollHeight - window.innerHeight;
  progress.style.transform = `scaleX(${availableScroll > 0 ? Math.min(1, Math.max(0, window.scrollY / availableScroll)) : 0})`;
  let active;
  sections.forEach(item => {
    if (item.section.getBoundingClientRect().top <= header.offsetHeight + 100) active = item.link;
  });
  sectionLinks.forEach(link => {
    if (link === active) link.setAttribute('aria-current', 'location');
    else link.removeAttribute('aria-current');
  });
}
let scheduled = false;
function scheduleHeaderUpdate() {
  if (scheduled) return;
  scheduled = true;
  requestAnimationFrame(() => {
    updateHeader();
    scheduled = false;
  });
}
window.addEventListener('scroll', scheduleHeaderUpdate, { passive: true });
window.addEventListener('resize', scheduleHeaderUpdate);
window.addEventListener('load', updateHeader);
updateHeader();

const brandMarquee = document.querySelector('.brand-marquee');
if (brandMarquee) {
const marqueeToggle = brandMarquee.querySelector('.marquee-toggle');
const marqueeMotion = window.matchMedia('(prefers-reduced-motion: reduce)');
const brandGroup = brandMarquee.querySelector('.brand-group');
if (brandGroup) {
  const duplicate = brandGroup.cloneNode(true);
  duplicate.setAttribute('aria-hidden', 'true');
  duplicate.inert = true;
  duplicate.querySelectorAll('a').forEach(link => link.setAttribute('tabindex', '-1'));
  brandGroup.parentElement.append(duplicate);
}

function updateMarqueeMotion() {
  marqueeToggle.hidden = marqueeMotion.matches;
  brandMarquee.classList.toggle('motion-enabled', !marqueeMotion.matches);
  const duplicate = brandMarquee.querySelector('.brand-group[aria-hidden]');
  if (duplicate) duplicate.hidden = marqueeMotion.matches;
}
marqueeToggle.addEventListener('click', () => {
  const paused = marqueeToggle.getAttribute('aria-pressed') !== 'true';
  brandMarquee.classList.toggle('is-paused', paused);
  marqueeToggle.setAttribute('aria-pressed', String(paused));
  marqueeToggle.setAttribute('aria-label', paused ? 'Resume brand animation' : 'Pause brand animation');
  marqueeToggle.querySelector('.marquee-toggle-label').textContent = paused ? 'Resume' : 'Pause';
  marqueeToggle.querySelector('[aria-hidden]').textContent = paused ? '▷' : 'Ⅱ';
});
marqueeMotion.addEventListener('change', updateMarqueeMotion);
updateMarqueeMotion();
}

const copyEmail = document.querySelector('.copy-email');
const contactStatus = document.querySelector('.contact-note');
copyEmail.addEventListener('click', async () => {
  try {
    await navigator.clipboard.writeText('katherinbast97@gmail.com');
    contactStatus.textContent = 'Email copied. Ready when you are.';
  } catch {
    contactStatus.textContent = 'Select katherinbast97@gmail.com above to copy it.';
  }
});

const connectionDialog = document.querySelector('#connection-dialog');
const connectionLinks = [...document.querySelectorAll('a[data-connect]')];
const connectionOpen = document.querySelector('.connection-open');
const connectionImage = connectionDialog.querySelector('img');
let connectionTimer;
function cancelConnectionTimer() {
  window.clearTimeout(connectionTimer);
  connectionTimer = undefined;
}
function closeConnection() {
  cancelConnectionTimer();
  if (connectionDialog.open) connectionDialog.close();
}
connectionLinks.forEach(link => link.addEventListener('click', event => {
  // Preserve browser actions such as Cmd/Ctrl-click and the direct no-JS link.
  if (event.button !== 0 || event.metaKey || event.ctrlKey || event.shiftKey || event.altKey || typeof connectionDialog.showModal !== 'function') return;
  event.preventDefault();
  if (connectionDialog.open) return;
  connectionOpen.href = link.href;
  const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  connectionDialog.style.setProperty('--connection-duration', reduceMotion ? '900ms' : '2800ms');
  connectionDialog.showModal();
  document.body.classList.add('connection-active');
  connectionTimer = window.setTimeout(() => {
    const destination = connectionOpen.href;
    closeConnection();
    window.location.assign(destination);
  }, reduceMotion ? 900 : 2800);
}));
connectionDialog.querySelector('.connection-close').addEventListener('click', closeConnection);
connectionDialog.querySelector('.connection-cancel').addEventListener('click', closeConnection);
connectionDialog.addEventListener('cancel', cancelConnectionTimer);
connectionDialog.addEventListener('close', () => {
  cancelConnectionTimer();
  document.body.classList.remove('connection-active');
});
connectionDialog.addEventListener('click', event => {
  if (event.target !== connectionDialog) return;
  const bounds = connectionDialog.getBoundingClientRect();
  if (event.clientX < bounds.left || event.clientX > bounds.right || event.clientY < bounds.top || event.clientY > bounds.bottom) closeConnection();
});
connectionOpen.addEventListener('click', cancelConnectionTimer);
connectionDialog.querySelector('.connection-alternatives a').addEventListener('click', closeConnection);
connectionImage.addEventListener('error', () => connectionImage.parentElement.classList.add('image-failed'));
if (connectionImage.complete && connectionImage.naturalWidth === 0) connectionImage.parentElement.classList.add('image-failed');

// The complete expertise list stays available without JavaScript.
const serviceFilters = document.querySelector('.service-filters');
if (serviceFilters) {
  serviceFilters.hidden = false;
  const groups = [...document.querySelectorAll('[data-service-group]')];
  const filterButtons = [...serviceFilters.querySelectorAll('button')];
  filterButtons.forEach(button => button.addEventListener('click', () => {
    const selection = button.dataset.serviceFilter;
    filterButtons.forEach(item => item.setAttribute('aria-pressed', String(item === button)));
    groups.forEach(group => { group.hidden = selection !== 'all' && group.dataset.serviceGroup !== selection; });
    document.querySelector('#service-status').textContent = selection === 'all' ? 'Showing all marketing expertise.' : 'Showing ' + button.textContent.toLowerCase() + ' expertise.';
  }));
  filterButtons.find(button => button.dataset.serviceFilter === 'strategy')?.click();
}
