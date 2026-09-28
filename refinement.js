// Progressive enhancement: with JavaScript off all component details remain readable.
(() => {
  document.querySelectorAll('[data-r-tabs]').forEach(explorer => {
    const list = explorer.querySelector('[role="tablist"]');
    const tabs = [...list.querySelectorAll('[role="tab"]')];
    const panels = tabs.map(tab => document.getElementById(tab.getAttribute('aria-controls')));
    function select(index, focus = false) {
      tabs.forEach((tab, i) => {
        tab.setAttribute('aria-selected', String(index === i));
        tab.tabIndex = index === i ? 0 : -1;
        panels[i].hidden = index !== i;
      });
      if (focus) tabs[index].focus();
    }
    tabs.forEach((tab, i) => {
      tab.addEventListener('click', () => select(i));
      tab.addEventListener('keydown', event => {
        const targets = {ArrowRight:(i+1)%tabs.length,ArrowLeft:(i-1+tabs.length)%tabs.length,Home:0,End:tabs.length-1};
        if (!Object.hasOwn(targets, event.key)) return;
        event.preventDefault();
        select(targets[event.key], true);
      });
    });
    select(0);
    explorer.dataset.enhanced = 'true';
    list.hidden = false;
  });
})();
