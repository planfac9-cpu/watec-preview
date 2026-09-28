// W28: accessible process tabs and a preview of the existing calculation engine.
(() => {
  'use strict';
  const tablist = document.querySelector('.w-flow-tabs');
  if (tablist) {
    const tabs = [...tablist.querySelectorAll('[role="tab"]')];
    const panels = tabs.map(tab => document.getElementById(tab.getAttribute('aria-controls')));
    function activate(index, moveFocus = false) {
      tabs.forEach((tab, i) => {
        const selected = i === index;
        tab.setAttribute('aria-selected', String(selected));
        tab.tabIndex = selected ? 0 : -1;
        panels[i].hidden = !selected;
      });
      if (moveFocus) tabs[index].focus();
    }
    tabs.forEach((tab, i) => {
      tab.addEventListener('click', () => activate(i));
      tab.addEventListener('keydown', event => {
        const next = {ArrowRight:(i+1)%tabs.length, ArrowLeft:(i-1+tabs.length)%tabs.length, Home:0, End:tabs.length-1}[event.key];
        if (next === undefined) return;
        event.preventDefault();
        activate(next, true);
      });
    });
    activate(0);
    tablist.hidden = false;
  }
  const choices = [...document.querySelectorAll('[data-quick-tons]')];
  if (!choices.length || !window.WatecCalculator) return;
  function estimate(tons) {
    const result = window.WatecCalculator.calculate({tons, peak:1, mode:'reference'});
    choices.forEach(button => button.setAttribute('aria-pressed', String(Number(button.dataset.quickTons) === tons)));
    document.querySelector('#quick-savings').textContent = window.WatecCalculator.shortWon(result.savings).trim();
    document.querySelector('#quick-capex').textContent = window.WatecCalculator.shortWon(result.capex).trim();
    document.querySelector('#quick-payback').textContent = result.payback === null ? '산정 불가' : result.payback.toFixed(1)+'개월';
    document.querySelector('#quick-inquiry').href = 'inquiry.html?' + new URLSearchParams({care:'brine',tons:String(tons),peak:'1',mode:'reference'}).toString();
  }
  choices.forEach(button => button.addEventListener('click', () => estimate(Number(button.dataset.quickTons))));
  estimate(10);
})();
