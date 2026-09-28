/* WATEC R05. All monetary values are KRW; source basis is visible on economics.html. */
(function (root) {
  'use strict';
  const baseline = {salt:234650000, waste:16600000, water:1760000, opex:10625000};
  const costKeys = ['salt','waste','water','opex'];
  function number(value, min, max, label) {
    if (value === null || value === undefined || String(value).trim() === '') throw new Error(label+'을(를) 입력해 주세요.');
    const n = Number(value);
    if (!Number.isFinite(n) || n < min || n > max) throw new Error(label+': '+min+'~'+max+' 범위로 입력해 주세요.');
    return n;
  }
  function calculate(input) {
    const tons = number(input.tons, .1, 60, '하루 염수량');
    const peak = number(input.peak, 1, 3, '성수기 배수');
    if (![1,1.5,2,3].includes(peak)) throw new Error('성수기 배수를 목록에서 선택해 주세요.');
    const mode = input.mode || 'reference';
    if (!['reference','custom'].includes(mode)) throw new Error('비용 기준을 선택해 주세요.');
    const costs = {};
    costKeys.forEach(k => { costs[k] = mode === 'custom' ? number(input.costs?.[k],0,100000000000,'연간 비용') : baseline[k]*tons/20; });
    const required = Math.ceil(tons*peak/5)*5;
    const full = Math.floor(required/20), rest = required%20;
    const models = [];
    if (full) models.push({size:20,count:full});
    if (rest) {
      const size = rest <= 5 ? 5 : rest <= 10 ? 10 : 20;
      const same = models.find(m=>m.size===size);
      if (same) same.count++; else models.push({size,count:1});
    }
    const prices = {5:100000000,10:120000000,20:160000000};
    const capex = models.reduce((sum,m)=>sum+prices[m.size]*m.count,0);
    const capacity = models.reduce((sum,m)=>sum+m.size*m.count,0);
    const rows = [
      {name:'소금',before:costs.salt,after:costs.salt*.46},
      {name:'폐수 처리',before:costs.waste,after:costs.waste*.1},
      {name:'용수',before:costs.water,after:costs.water*.1},
      {name:'추가 운전·관리',before:0,after:costs.opex}
    ].map(r=>({...r,saved:r.before-r.after}));
    const before = rows.reduce((s,r)=>s+r.before,0), after = rows.reduce((s,r)=>s+r.after,0);
    const savings = before-after;
    return {tons,peak,mode,costs,required,capacity,models,capex,rows,before,after,savings,payback:savings>0?capex/savings*12:null};
  }
  const won = n => Math.round(n).toLocaleString('ko-KR')+'원';
  function shortWon(n) {
    const sign = n < 0 ? '−' : '';
    const man = Math.round(Math.abs(n)/10000);
    const eok = Math.floor(man/10000), remainder = man%10000;
    if (!man && n) return won(n);
    return sign+(eok?eok+'억 ':'')+(remainder?remainder.toLocaleString('ko-KR')+'만 ':(!eok?'0 ':''))+'원';
  }
  function summary(r) {
    return ['WATEC 경제성 참고 시뮬레이션',
      '하루 염수량: '+r.tons+'톤 / 성수기: '+r.peak+'배',
      '비용 기준: '+(r.mode==='custom'?'직접 입력한 연간 지출':'농식품부 2024 공개 자료 비례 환산'),
      '연간 소금비 '+won(r.costs.salt)+' / 폐수비 '+won(r.costs.waste)+' / 용수비 '+won(r.costs.water)+' / 추가 운영비 '+won(r.costs.opex),
      '소요 용량: '+r.required+'톤/일 / 구성 용량: '+r.capacity+'톤/일',
      '설치비(부가세 별도): '+won(r.capex),
      '예상 연간 순 절감액: '+won(r.savings),
      '단순 회수기간: '+(r.payback===null?'산정 불가':r.payback.toFixed(1)+'개월'),
      '가정: 소금비 54%, 폐수·용수비 각 90% 감소. 성수기 배수는 설비 규모에만 반영. 정부 지원금 미반영.',
      '예상 결과이며 확정 견적·절감 실적·회수기간 보장이 아닙니다.'].join('\n');
  }
  const api = {calculate,won,shortWon,summary};
  if (typeof module !== 'undefined' && module.exports) module.exports = api;
  root.WatecCalculator = api;
  if (typeof document === 'undefined' || !document.querySelector('#calculator')) return;
  const $ = id=>document.getElementById(id);
  let current = null;
  function read() {
    const costs = {};
    costKeys.forEach(k=>{const v=$(k+'-cost').value;costs[k]=v.trim()===''?'':Number(v)*10000;});
    return {tons:$('tons').value,peak:$('peak').value,mode:$('cost-mode').value,costs};
  }
  function tableRow(name,values,total=false) {
    const tr=document.createElement('tr'); if(total)tr.className='total';
    const th=document.createElement('th');th.scope='row';th.textContent=name;tr.append(th);
    values.forEach(v=>{const td=document.createElement('td');td.textContent=won(v);if(v<0)td.className='negative';tr.append(td);});
    return tr;
  }
  function run() {
    document.querySelectorAll('[data-tons]').forEach(button=>button.setAttribute('aria-pressed',String(Number(button.dataset.tons)===Number($('tons').value))));
    $('custom-costs').hidden=$('cost-mode').value!=='custom';
    $('calc-error').textContent='';
    document.querySelectorAll('#calculator [aria-invalid]').forEach(el=>el.removeAttribute('aria-invalid'));
    try {
      current=calculate(read()); const r=current;
      $('result-capacity').textContent=r.capacity+'톤/일';
      $('result-model').textContent='소요 '+r.required+'톤/일 · '+r.models.map(m=>m.size+'톤 '+m.count+'대').join(' + ');
      $('result-capex').textContent=shortWon(r.capex);
      $('result-savings').textContent=shortWon(r.savings);
      $('result-payback').textContent=r.payback===null?'산정 불가':r.payback.toFixed(1)+'개월';
      $('result-note').textContent=(r.mode==='custom'?'입력한 연간 지출':'공개 자료를 사용량에 비례해 환산한 비용')+'에 가정한 감소 비율을 적용한 결과입니다.'+(r.savings<=0?' 현재 조건에서는 추가 운전·관리비가 절감액 이상이므로 투자 회수기간을 계산할 수 없습니다.':'');
      const body=$('cost-rows');body.replaceChildren();
      r.rows.forEach(row=>body.append(tableRow(row.name,[row.before,row.after,row.saved])));
      body.append(tableRow('합계',[r.before,r.after,r.savings],true));
      $('calc-to-brief').disabled=false;
    } catch(e) {
      current=null;
      ['capacity','capex','savings','payback'].forEach(k=>$('result-'+k).textContent='—');
      $('result-model').textContent='';$('result-note').textContent='입력 조건을 확인하면 결과가 표시됩니다.';
      $('cost-rows').replaceChildren();$('calc-to-brief').disabled=true;$('calc-error').textContent=e.message;
      document.querySelectorAll('#calculator input').forEach(el=>{if(!el.closest('[hidden]')&&(!el.value||!el.validity.valid))el.setAttribute('aria-invalid','true');});
    }
  }
  $('calculator').addEventListener('input',run);
  $('calculator').addEventListener('change',run);
  document.querySelectorAll('[data-tons]').forEach(button=>button.addEventListener('click',()=>{$('tons').value=button.dataset.tons;run();}));
  $('calc-to-brief').addEventListener('click',()=>{
    if(!current)return;
    const q=new URLSearchParams({care:'brine',tons:String(current.tons),peak:String(current.peak),mode:current.mode});
    if(current.mode==='custom')costKeys.forEach(k=>q.set(k,String(current.costs[k])));
    location.href='inquiry.html?'+q.toString();
  });
  run();
})(typeof globalThis !== 'undefined' ? globalThis : this);
