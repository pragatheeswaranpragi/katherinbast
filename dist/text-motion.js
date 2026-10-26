// Motion ghost reveal: short blur/opacity transitions on text, never continuous filters.
(() => {
  if(!window.Motion)return;
  const reduced=matchMedia('(prefers-reduced-motion: reduce)');
  const quiet=()=>reduced.matches||document.documentElement.classList.contains('motion-paused');
  const running=new Map();
  const targets=[...document.querySelectorAll('main h1, main h2, main h3, .hero-description, .hero-caption, .section-intro, .about-copy>p, .collaboration-summary, .review-section-heading>p, .approach-heading>p:last-child, .learning-heading>p:last-child, #contact>p:first-of-type')]
    .filter(el=>!el.closest('[aria-hidden="true"],.sr-only,[role="status"]'));
  function resetWords(words){
    const reset=()=>words.forEach(word=>{word.style.removeProperty('filter');word.style.removeProperty('transform');word.style.removeProperty('opacity');});
    reset();
    // Motion commits final styles after completion; release those on the next rendered frame too.
    requestAnimationFrame(()=>requestAnimationFrame(reset));
  }
  function clear(animation,words){
    animation.cancel();
    resetWords(words);
  }
  function settle(){
    if(!quiet())return;
    running.forEach((words,animation)=>clear(animation,words));
    running.clear();
  }
  reduced.addEventListener('change',settle);
  new MutationObserver(settle).observe(document.documentElement,{attributes:true,attributeFilter:['class']});
  function split(element){
    if(element.dataset.smokeReady)return [...element.querySelectorAll('.smoke-word')];
    const walker=document.createTreeWalker(element,NodeFilter.SHOW_TEXT,{
      acceptNode(node){return node.textContent.trim()&&!node.parentElement.closest('.sr-only,[aria-hidden="true"],.smoke-word')?NodeFilter.FILTER_ACCEPT:NodeFilter.FILTER_REJECT;}
    });
    const nodes=[];while(walker.nextNode())nodes.push(walker.currentNode);
    nodes.forEach(node=>{
      const fragment=document.createDocumentFragment();
      node.textContent.split(/(\s+)/).forEach(part=>{
        if(!part)return;
        if(/^\s+$/.test(part)){fragment.append(document.createTextNode(part));return;}
        const span=document.createElement('span');span.className='smoke-word';span.textContent=part;fragment.append(span);
      });
      node.replaceWith(fragment);
    });
    element.dataset.smokeReady='true';
    return [...element.querySelectorAll('.smoke-word')];
  }
  function reveal(element){
    if(quiet())return;
    const words=split(element);if(!words.length)return;
    const animation=Motion.animate(words,{
      opacity:[.08,1],filter:['blur(4px)','blur(0px)'],y:[7,0]
    },{duration:1,delay:index=>Math.min(index*.025,.2),ease:'easeInOut'});
    running.set(animation,words);
    animation.finished.then(()=>{
      animation.cancel();
      resetWords(words);
      running.delete(animation);
    }).catch(()=>running.delete(animation));
  }
  if('IntersectionObserver' in window){
    const observer=new IntersectionObserver(entries=>{
      entries.forEach(entry=>{
        if(!entry.isIntersecting)return;
        observer.unobserve(entry.target);
        reveal(entry.target);
      });
    },{threshold:.18,rootMargin:'0px 0px -20px 0px'});
    targets.forEach(element=>observer.observe(element));
  }
})();
