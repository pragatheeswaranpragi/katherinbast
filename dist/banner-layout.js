// Fit both native text lines to the same width without stretching the glyphs.
(() => {
  const heading = document.querySelector('.hero-about #hero-heading');
  if (!heading) return;
  const lines = [...heading.querySelectorAll('.hero-heading-line > span')];
  if (lines.length !== 2) return;
  let frame;
  function fit() {
    const width = heading.clientWidth;
    if (!width) return;
    lines.forEach((line, index) => {
      const measured = line.getBoundingClientRect().width;
      if (!measured) return;
      const size = parseFloat(getComputedStyle(line).fontSize) * width / measured;
      const property = index === 0 ? '--headline-first-size' : '--headline-second-size';
      const value = `${size.toFixed(3)}px`;
      if (heading.style.getPropertyValue(property) !== value) heading.style.setProperty(property, value);
    });
  }
  function schedule() {
    cancelAnimationFrame(frame);
    frame = requestAnimationFrame(fit);
  }
  fit();
  if (document.fonts) document.fonts.ready.then(schedule);
  if ('ResizeObserver' in window) new ResizeObserver(schedule).observe(heading);
  else window.addEventListener('resize', schedule, {passive:true});
})();
