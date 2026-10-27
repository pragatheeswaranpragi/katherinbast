// Restore the palette before CSS paints; controls work on home and service pages.
(() => {
  const key='katherin-colour-theme';
  const root=document.documentElement;
  let theme='classic';
  try{if(localStorage.getItem(key)==='colourful')theme='colourful';}catch{}
  function apply(value,persist=false){
    theme=value==='colourful'?'colourful':'classic';
    root.dataset.theme=theme;
    document.querySelectorAll('[data-theme-choice]').forEach(button=>button.setAttribute('aria-pressed',String(button.dataset.themeChoice===theme)));
    const meta=document.querySelector('meta[name="theme-color"]');
    if(meta)meta.content=theme==='colourful'?'#fffdf8':'#fbf7f5';
    if(persist){try{localStorage.setItem(key,theme);}catch{}}
  }
  apply(theme);
  function init(){
    document.querySelectorAll('.theme-switch').forEach(control=>control.hidden=false);
    document.querySelectorAll('[data-theme-choice]').forEach(button=>button.addEventListener('click',()=>apply(button.dataset.themeChoice,true)));
    apply(theme);
  }
  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',init,{once:true});else init();
  window.addEventListener('storage',event=>{if(event.key===key)apply(event.newValue);});
})();
