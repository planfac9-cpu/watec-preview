document.documentElement.classList.add('js');
const menu=document.querySelector('.menu-toggle');
const nav=document.querySelector('#nav');
const careSelect=document.querySelector('#care-type');
const careNames={brine:'절임염수 케어',complaint:'민원 케어'};
const requestedCare=new URLSearchParams(location.search).get('care');
if(careSelect&&Object.hasOwn(careNames,requestedCare))careSelect.value=careNames[requestedCare];
const params=new URLSearchParams(location.search);
if(careSelect && params.has('tons')) {
  const holder=document.createElement('label');holder.className='wide';holder.textContent='경제성 계산 조건';
  const field=document.createElement('textarea');field.name='경제성 계산 조건';field.rows=9;field.readOnly=true;
  try {
    const costs={};['salt','waste','water','opex'].forEach(k=>costs[k]=params.get(k));
    field.value=WatecCalculator.summary(WatecCalculator.calculate({tons:params.get('tons'),peak:params.get('peak'),mode:params.get('mode'),costs}));
    holder.append(field);document.querySelector('.form-grid').prepend(holder);
  } catch(e) {
    const note=document.createElement('p');note.className='wide calc-error';note.textContent='계산 조건이 올바르지 않습니다. 비용 계산기에서 다시 계산해 주세요.';
    document.querySelector('.form-grid').prepend(note);
  }
}
menu?.addEventListener('click',()=>{const open=menu.getAttribute('aria-expanded')!=='true';menu.setAttribute('aria-expanded',String(open));menu.setAttribute('aria-label',open?'메뉴 닫기':'메뉴 열기');menu.querySelector('span').textContent=open?'−':'＋';nav.classList.toggle('open',open)});
document.addEventListener('keydown',e=>{if(e.key==='Escape'&&menu?.getAttribute('aria-expanded')==='true'){menu.click();menu.focus()}});
if('IntersectionObserver' in window){const observer=new IntersectionObserver(items=>items.forEach(item=>{if(item.isIntersecting){item.target.classList.add('visible');observer.unobserve(item.target)}}),{threshold:.08});document.querySelectorAll('.reveal').forEach(el=>observer.observe(el))}else{document.querySelectorAll('.reveal').forEach(el=>el.classList.add('visible'))}
document.querySelector('#brief-form')?.addEventListener('submit',event=>{event.preventDefault();const form=event.currentTarget;const action=event.submitter?.value||'save';const values=[...new FormData(form)].filter(([k])=>k!=='action').map(([k,v])=>[k,String(v).trim()]);const status=document.querySelector('#form-status');if(values.every(([,v])=>!v)){status.textContent='정리할 내용을 한 항목 이상 입력해 주세요.';form.querySelector('input').focus();return}if(action==='mail'){const email=form.dataset.email||document.querySelector('#contact-email')?.textContent.trim();const get=k=>(values.find(([n])=>n===k)||[,''])[1];const subject='[WATEC 상담 요청] '+(get('상담 분야')||'상담')+(get('업체명')?' · '+get('업체명'):'');let body='와텍 상담을 요청합니다.\n\n'+values.filter(([,v])=>v).map(([k,v])=>'■ '+k+'\n'+v).join('\n\n')+'\n\n회신 받을 연락처: ';if(body.length>1800)body=body.slice(0,1800)+'\n…(내용이 길어 일부만 담았습니다. 준비서 파일을 첨부해 주세요.)';location.href='mailto:'+email+'?subject='+encodeURIComponent(subject)+'&body='+encodeURIComponent(body);status.textContent='메일 앱 열기를 요청했습니다. 작성 내용을 확인하고 메일 앱에서 보내기를 눌러야 전송됩니다. 메일 앱이 열리지 않으면 '+email+' 로 직접 보내 주세요.';return}const content='WATEC 상담 준비서\n작성 후 '+form.dataset.email+' 로 보내 주시면 상담을 준비합니다.\n\n'+values.map(([k,v])=>k+'\n'+(v||'미작성')).join('\n\n');const url=URL.createObjectURL(new Blob(['\ufeff'+content],{type:'text/plain;charset=utf-8'}));const a=document.createElement('a');a.href=url;a.download='WATEC_상담준비서.txt';a.click();setTimeout(()=>URL.revokeObjectURL(url),1000);status.textContent='상담 준비서 저장을 요청했습니다. 브라우저 다운로드 목록에서 확인해 주세요. 저장만으로는 와텍에 전달되지 않습니다.'});
document.querySelectorAll('.copy-email').forEach(btn=>btn.addEventListener('click',async()=>{const v=btn.dataset.copy;try{await navigator.clipboard.writeText(v);btn.textContent='복사됨'}catch(e){const r=document.createRange();r.selectNodeContents(document.querySelector('#contact-email'));const s=getSelection();s.removeAllRanges();s.addRange(r);btn.textContent='주소를 선택했습니다'}setTimeout(()=>btn.textContent='주소 복사',2400)}));

const waterButton=document.querySelector('.water-toggle');
if(waterButton){let playing=!matchMedia('(prefers-reduced-motion: reduce)').matches;const updateWater=()=>{document.querySelector('.diagonal-hero').classList.toggle('water-playing',playing);document.querySelector('.diagonal-hero').classList.toggle('water-paused',!playing);waterButton.textContent=playing?'물 흐름 일시정지':'물 흐름 재생';waterButton.setAttribute('aria-pressed',String(playing));};waterButton.addEventListener('click',()=>{playing=!playing;updateWater()});updateWater();}

// Keep the mobile menu state in sync after navigation or a desktop resize.
nav?.addEventListener('click',event=>{if(event.target.closest('a')&&menu?.getAttribute('aria-expanded')==='true')menu.click()});
document.addEventListener('click',event=>{if(menu?.getAttribute('aria-expanded')==='true'&&!event.target.closest('.header'))menu.click()});
matchMedia('(min-width: 981px)').addEventListener('change',event=>{if(event.matches&&menu?.getAttribute('aria-expanded')==='true')menu.click()});
