(() => {
  'use strict';
  const production = /^(www\.)?agenticfilipino\.com$/.test(location.hostname);
  const analyticsId = 'G-2VN98ZCYR4';
  // The existing Google tag handles page views; do not emit another here.
  if (production && typeof window.gtag === 'function') {
    window.gtag('config', analyticsId, {send_page_view: false});
  }
  const menu = document.querySelector('.af-menu');
  const links = document.querySelector('.af-links');
  function closeMenu() { links?.classList.remove('open'); menu?.setAttribute('aria-expanded','false'); }
  menu?.addEventListener('click', () => { const open=links.classList.toggle('open');menu.setAttribute('aria-expanded',String(open)); });
  links?.addEventListener('click', e => { if(e.target.closest('a'))closeMenu(); });
  document.addEventListener('keydown', e => { if(e.key==='Escape' && menu?.getAttribute('aria-expanded')==='true'){closeMenu();menu.focus();} });
  document.querySelectorAll('.role-item,.diag-btn').forEach(item => {
    item.setAttribute('aria-pressed',String(item.classList.contains('active')));
    if(item.tagName!=='BUTTON'){item.setAttribute('role','button');item.tabIndex=0;item.addEventListener('keydown',e=>{if(e.key==='Enter'||e.key===' '){e.preventDefault();item.click();}});}
    item.addEventListener('click',()=>document.querySelectorAll(item.classList.contains('role-item')?'.role-item':'.diag-btn').forEach(el=>el.setAttribute('aria-pressed',String(el===item))));
  });
  document.querySelector('#diag-cta')?.addEventListener('click',()=>{const key=document.querySelector('.diag-btn.active').dataset.key;document.querySelector('select[name=lane]').value={leads:'Lead follow-up',founder:'Executive and operations',support:'Customer support',construction:'Construction back office'}[key];});
  document.querySelector('.diag-result')?.setAttribute('aria-live','polite');
  if('IntersectionObserver' in window){const observer=new IntersectionObserver(entries=>entries.forEach(e=>e.target.classList.toggle('offscreen',!e.isIntersecting)),{rootMargin:'60px'});document.querySelectorAll('.orbit-shell,.ticker,.method-grid,.pulse-line').forEach(el=>observer.observe(el));}
  let toastTimer;
  function showToast(message){let toast=document.querySelector('.af-toast');if(!toast){toast=document.createElement('aside');toast.className='af-toast';toast.setAttribute('role','status');document.body.append(toast);}toast.replaceChildren();const close=document.createElement('button');close.type='button';close.textContent='\u00d7';close.setAttribute('aria-label','Dismiss confirmation');close.onclick=()=>toast.hidden=true;const text=document.createElement('p');text.textContent=message;toast.append(close,text);toast.hidden=false;clearTimeout(toastTimer);toastTimer=setTimeout(()=>toast.hidden=true,8000);}
  document.querySelectorAll('form[data-af-form]').forEach(form => {
    const button=form.querySelector('button[type=submit]');
    const initial=button.textContent;
    const feedback=document.createElement('div');feedback.className='af-feedback';feedback.hidden=true;feedback.setAttribute('role','status');form.append(feedback);
    form.addEventListener('submit',async event=>{
      event.preventDefault();if(button.disabled)return;
      if(!form.reportValidity())return;
      button.disabled=true;button.textContent='Sending...';feedback.hidden=true;
      const controller=new AbortController();const timeout=setTimeout(()=>controller.abort(),15000);
      try{
        const response=await fetch(form.action,{method:'POST',body:new FormData(form),headers:{Accept:'application/json'},signal:controller.signal});
        const data=await response.json();
        if(!response.ok || !(data.success===true || data.success==='true'))throw new Error('Unconfirmed response');
        const applicant=form.dataset.afForm==='application';
        const message=applicant?'Application submitted. We will review your profile and contact you if there is a suitable opportunity.':'Request submitted. We will review your needs and follow up with the next step.';
        form.reset();feedback.dataset.state='success';feedback.textContent=message;feedback.hidden=false;showToast(message);
        // Local previews and job applications must never inflate paid lead counts.
        if(!applicant && production && typeof window.gtag==='function') {
          // Send only an identifier, never names, email addresses or form answers.
          window.gtag('event','generate_lead',{send_to:analyticsId,form_id:form.id || 'lead-form'});
          window.gtag('event','conversion',{send_to:'AW-18276066095/0rvrCPW-qsYcEK_G2opE'});
        }
      }catch(error){feedback.dataset.state='error';feedback.textContent='We could not confirm your submission. Your answers are still here. Please retry, or email sales@agenticfilipino.com.';feedback.hidden=false;}
      finally{clearTimeout(timeout);button.disabled=false;button.textContent=initial;}
    });
  });
})();
