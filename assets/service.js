/* ==========================================================================
   Agentic Filipino — Service Landing Pages Interaction & Lead Engine
   ========================================================================== */

(() => {
  'use strict';

  const prefersReduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const production = /^(www\.)?agenticfilipino\.com$/.test(location.hostname);
  const analyticsId = 'G-2VN98ZCYR4';

  if (production && typeof window.gtag === 'function') {
    window.gtag('config', analyticsId, { send_page_view: false });
  }

  /* Nav & Mobile Drawer */
  const nav = document.getElementById('nav');
  const navMenu = document.getElementById('nav-menu');
  const navSheet = document.getElementById('navsheet');

  const setDrawer = (open) => {
    if (!navMenu || !navSheet) return;
    navMenu.setAttribute('aria-expanded', String(open));
    navSheet.classList.toggle('is-open', open);
    navSheet.setAttribute('aria-hidden', String(!open));
    document.body.style.overflow = open ? 'hidden' : '';
  };

  navMenu?.addEventListener('click', () => {
    setDrawer(navMenu.getAttribute('aria-expanded') !== 'true');
  });

  navSheet?.addEventListener('click', (e) => {
    if (e.target.closest('a')) setDrawer(false);
  });

  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && navMenu?.getAttribute('aria-expanded') === 'true') {
      setDrawer(false);
      navMenu.focus();
    }
  });

  window.addEventListener(
    'scroll',
    () => {
      nav?.classList.toggle('is-scrolled', window.scrollY > 20);
    },
    { passive: true }
  );

  /* Scroll Reveals */
  const reveals = document.querySelectorAll('.reveal');
  if ('IntersectionObserver' in window && !prefersReduced) {
    const obs = new IntersectionObserver(
      (entries) => {
        entries.forEach((e) => {
          if (e.isIntersecting) {
            e.target.classList.add('is-in');
            obs.unobserve(e.target);
          }
        });
      },
      { threshold: 0.1 }
    );
    reveals.forEach((el) => obs.observe(el));
  } else {
    reveals.forEach((el) => el.classList.add('is-in'));
  }

  /* Tier quick-select prefill into inquiry form */
  document.querySelectorAll('[data-pick-tier]').forEach((btn) => {
    btn.addEventListener('click', () => {
      const val = btn.dataset.pickTier;
      const tierInput = document.querySelector('select[name="tier"]') || document.querySelector('input[name="offer"]');
      if (tierInput && val) tierInput.value = val;
    });
  });

  /* Toast & FormSubmit Lead Handling + Google Ads/GA4 Conversion Tracking */
  let toastTimer;
  const showToast = (message) => {
    let toast = document.querySelector('.af-toast');
    if (!toast) {
      toast = document.createElement('aside');
      toast.className = 'af-toast';
      toast.setAttribute('role', 'status');
      document.body.append(toast);
    }
    toast.replaceChildren();
    const close = document.createElement('button');
    close.type = 'button';
    close.textContent = '\u00d7';
    close.setAttribute('aria-label', 'Dismiss confirmation');
    close.onclick = () => {
      toast.hidden = true;
    };
    const p = document.createElement('p');
    p.textContent = message;
    toast.append(close, p);
    toast.hidden = false;
    clearTimeout(toastTimer);
    toastTimer = setTimeout(() => {
      toast.hidden = true;
    }, 8000);
  };

  document.querySelectorAll('form[data-af-form="lead"]').forEach((form) => {
    const button = form.querySelector('button[type="submit"]');
    const feedback = form.querySelector('.af-feedback');
    if (!button) return;

    form.addEventListener('submit', async (event) => {
      event.preventDefault();
      if (button.disabled) return;
      if (!form.reportValidity()) return;

      const initialHTML = button.innerHTML;
      button.disabled = true;
      button.textContent = 'Sending request…';
      if (feedback) feedback.hidden = true;

      const controller = new AbortController();
      const timeout = setTimeout(() => controller.abort(), 15000);

      try {
        const res = await fetch(form.action, {
          method: 'POST',
          body: new FormData(form),
          headers: { Accept: 'application/json' },
          signal: controller.signal,
        });
        const data = await res.json();
        if (!res.ok || !(data.success === true || data.success === 'true')) {
          throw new Error('Unconfirmed response');
        }

        const msg =
          'Request received. We will review your workflow and email you the next step within 24–48 hours.';
        form.reset();
        if (feedback) {
          feedback.dataset.state = 'success';
          feedback.textContent = msg;
          feedback.hidden = false;
        }
        showToast(msg);

        if (production && typeof window.gtag === 'function') {
          window.gtag('event', 'generate_lead', { send_to: analyticsId, form_id: form.id || 'service-lead-form' });
          window.gtag('event', 'conversion', { send_to: 'AW-18276066095/0rvrCPW-qsYcEK_G2opE' });
        }
      } catch {
        if (feedback) {
          feedback.dataset.state = 'error';
          feedback.textContent =
            'We could not confirm your submission. Your details are still here — please retry or email sales@agenticfilipino.com.';
          feedback.hidden = false;
        }
      } finally {
        clearTimeout(timeout);
        button.disabled = false;
        button.innerHTML = initialHTML;
      }
    });
  });
})();
