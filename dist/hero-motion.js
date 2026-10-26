// Decorative Motion animation. Paused off-screen, in background tabs and on request.
(() => {
  const hero = document.querySelector('.split-hero');
  if (!hero || !window.Motion) return;
  const { animate } = window.Motion;
  const paths = [...hero.querySelectorAll('.marketing-branch')];
  const toggle = hero.querySelector('.hero-motion-toggle');
  const reduced = matchMedia('(prefers-reduced-motion: reduce)');
  let visible = false, paused = false, loops = [], entrance;
  const quiet = () => reduced.matches || document.documentElement.classList.contains('motion-paused');
  function sync() {
    toggle.hidden = quiet();
    const play = visible && !document.hidden && !paused && !quiet();
    if (play && !loops.length) {
      loops = paths.map((path,index) => {
        const light = hero.querySelector(`[data-light="${path.dataset.branch}"]`);
        const length = path.getTotalLength();
        const points = Array.from({length:61},(_,i) => path.getPointAtLength(length*i/60));
        return animate(light, {
          x:points.map(point=>point.x), y:points.map(point=>point.y),
          opacity:points.map((_,i)=>i<4 ? i/4 : i>53 ? (60-i)/7 : 1)
        }, {duration:3.6+(index%3)*.4,delay:[0,1.7,.5,2.3,.9,2.8,1.2,.3,2,1.5,2.6][index],repeat:Infinity,repeatDelay:2.4,ease:'linear'});
      });
    }
    loops.forEach(animation => play ? animation.play() : animation.pause());
    if (quiet() && entrance) entrance.complete();
  }
  toggle.hidden = false;
  toggle.addEventListener('click', () => {
    paused = !paused;
    toggle.setAttribute('aria-pressed',String(paused));
    toggle.textContent = paused ? 'Resume animation' : 'Pause animation';
    sync();
  });
  reduced.addEventListener('change',sync);
  document.addEventListener('visibilitychange',sync);
  new MutationObserver(sync).observe(document.documentElement,{attributes:true,attributeFilter:['class']});
  if ('IntersectionObserver' in window) {
    new IntersectionObserver(entries => {visible = entries[0].isIntersecting;sync();},{threshold:.05}).observe(hero);
  }
  // Banner text entrance is owned by text-motion.js.
  // Anchor each branch to its topic after responsive layout is measured.
  function layoutBranches() {
    const svg = hero.querySelector('.marketing-connections');
    const matrix = svg.getScreenCTM();
    if (!matrix) return;
    const inverse = matrix.inverse();
    const rect = element => element.getBoundingClientRect();
    const toPoint = (x,y) => new DOMPoint(x,y).matrixTransform(inverse);
    const root = rect(hero.querySelector('.marketing-hub'));
    const nodes = paths.map(path=>rect(hero.querySelector(`.marketing-topic-${path.dataset.branch}`)));
    const parents = [6,9,0,-1,3,7,3,8,6,4,2];
    const first = 3;
    function rounded(points) {
      let d=`M${points[0].x} ${points[0].y}`;
      for(let i=1;i<points.length-1;i++){
        const previous=points[i-1],current=points[i],next=points[i+1];
        const before=Math.hypot(current.x-previous.x,current.y-previous.y);
        const after=Math.hypot(next.x-current.x,next.y-current.y);
        if(!before||!after)continue;
        const radius=Math.min(9,before/2,after/2);
        const a={x:current.x+(previous.x-current.x)*radius/before,y:current.y+(previous.y-current.y)*radius/before};
        const b={x:current.x+(next.x-current.x)*radius/after,y:current.y+(next.y-current.y)*radius/after};
        d+=`L${a.x} ${a.y}Q${current.x} ${current.y} ${b.x} ${b.y}`;
      }
      return d+`L${points.at(-1).x} ${points.at(-1).y}`;
    }
    paths.forEach((path,index)=>{
      const accent=[8,7,5].includes(index)?'#56836e':[6,0,2,10].includes(index)?'#5979a0':'#a66072';
      path.style.stroke=accent;
      const light=hero.querySelector(`[data-light="${path.dataset.branch}"]`);
      light.querySelectorAll('circle').forEach((circle,i)=>{if(i<2)circle.setAttribute('fill',accent);});
      const target=nodes[index];
      const source=index===first?root:nodes[parents[index]];
      const sameLane=Math.abs(source.left-target.left)<20||index===first;
      let points;
      if(sameLane){
        const start=toPoint(source.left+source.width/2,source.bottom+2);
        const end=toPoint(target.left+target.width/2,target.top-3);
        const middle=(start.y+end.y)/2;
        points=[start,{x:start.x,y:middle},{x:end.x,y:middle},end];
      }else{
        const start=toPoint(source.right+2,source.top+source.height/2);
        const end=toPoint(target.left-3,target.top+target.height/2);
        const middle=(start.x+end.x)/2;
        points=[start,{x:middle,y:start.y},{x:middle,y:end.y},end];
      }
      path.setAttribute('d',rounded(points));
    });
    loops.forEach(animation => animation.stop());
    loops = [];
    sync();
  }
  if ('ResizeObserver' in window) new ResizeObserver(layoutBranches).observe(hero.querySelector('.workflow-surface'));
  const viewport=hero.querySelector('.workflow-viewport');
  viewport.addEventListener('focusin',event=>{
    const topic=event.target.closest('.marketing-topic');
    if(!topic||!topic.matches(':focus-visible'))return;
    const left=topic.offsetLeft,right=left+topic.offsetWidth;
    if(left<viewport.scrollLeft||right>viewport.scrollLeft+viewport.clientWidth){
      viewport.scrollTo({left:Math.max(0,left-(viewport.clientWidth-topic.offsetWidth)/2),behavior:'instant'});
    }
  });
  document.fonts.ready.then(layoutBranches);
  sync();
})();
