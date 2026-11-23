(() => {
  'use strict';
  const production = /^(www\.)?agenticfilipino\.com$/.test(location.hostname);
  const analyticsId = 'G-2VN98ZCYR4';
  // The existing Google tag handles page views; do not emit another here.
  if (production && typeof window.gtag === 'function') {
    window.gtag('config', analyticsId, { send_page_view: false });
  }

  /* Navigation drawer */
  const menu = document.querySelector('.af-menu');
  const links = document.querySelector('.af-links');
  function closeMenu() {
    links?.classList.remove('open');
    menu?.setAttribute('aria-expanded', 'false');
  }
  menu?.addEventListener('click', () => {
    const open = links.classList.toggle('open');
    menu.setAttribute('aria-expanded', String(open));
  });
  links?.addEventListener('click', (e) => {
    if (e.target.closest('a')) closeMenu();
  });
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && menu?.getAttribute('aria-expanded') === 'true') {
      closeMenu();
      menu.focus();
    }
  });

  /* Legacy role / diagnostic buttons (preserved) */
  document.querySelectorAll('.role-item,.diag-btn').forEach((item) => {
    item.setAttribute('aria-pressed', String(item.classList.contains('active')));
    if (item.tagName !== 'BUTTON') {
      item.setAttribute('role', 'button');
      item.tabIndex = 0;
      item.addEventListener('keydown', (e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          item.click();
        }
      });
    }
    item.addEventListener('click', () =>
      document
        .querySelectorAll(item.classList.contains('role-item') ? '.role-item' : '.diag-btn')
        .forEach((el) => el.setAttribute('aria-pressed', String(el === item)))
    );
  });
  document.querySelector('#diag-cta')?.addEventListener('click', () => {
    const key = document.querySelector('.diag-btn.active')?.dataset.key;
    const sel = document.querySelector('select[name=lane]');
    if (key && sel) {
      sel.value = {
        leads: 'Lead follow-up',
        founder: 'Executive and operations',
        support: 'Customer support',
        construction: 'Construction back office',
      }[key];
    }
  });
  document.querySelector('.diag-result')?.setAttribute('aria-live', 'polite');

  if ('IntersectionObserver' in window) {
    const observer = new IntersectionObserver(
      (entries) => entries.forEach((e) => e.target.classList.toggle('offscreen', !e.isIntersecting)),
      { rootMargin: '60px' }
    );
    document.querySelectorAll('.orbit-shell,.ticker,.method-grid,.pulse-line').forEach((el) => observer.observe(el));
  }

  /* ------------------------------------------------------------------------
     INSIGHTS HUB: Instant Category Filtering + Live Search (blog.html)
     ------------------------------------------------------------------------ */
  if (document.body.classList.contains('af-blog')) {
    const grid = document.querySelector('.section .grid');
    if (grid) {
      const cards = Array.from(grid.querySelectorAll('.card'));
      const categories = [
        { key: 'all', label: 'All guides' },
        { key: 'executive', label: 'Executive & Ops' },
        { key: 'leads', label: 'Lead Follow-Up' },
        { key: 'support', label: 'Customer Support' },
        { key: 'real-estate', label: 'Real Estate' },
        { key: 'construction', label: 'Construction' },
        { key: 'ecommerce', label: 'Ecommerce' },
      ];

      const classifyCard = (card) => {
        if (card.dataset.cat) return card.dataset.cat;
        const text = `${card.querySelector('h3')?.textContent || ''} ${card.querySelector('a')?.getAttribute('href') || ''}`.toLowerCase();
        if (text.includes('construction')) return 'construction';
        if (text.includes('real estate') || text.includes('real-estate')) return 'real-estate';
        if (text.includes('ecommerce')) return 'ecommerce';
        if (text.includes('customer support') || text.includes('customer-support')) return 'support';
        if (text.includes('lead') || text.includes('appointment setter') || text.includes('speed-to-lead')) return 'leads';
        return 'executive';
      };

      const labelMap = Object.fromEntries(categories.map((c) => [c.key, c.label]));
      cards.forEach((card) => {
        const cat = classifyCard(card);
        card.dataset.cat = cat;
        if (!card.querySelector('.af-card-cat')) {
          const badge = document.createElement('span');
          badge.className = 'af-card-cat';
          badge.textContent = labelMap[cat] || 'Hiring Guide';
          const h3 = card.querySelector('h3');
          if (h3) card.insertBefore(badge, h3);
        }
      });

      const controls = document.createElement('div');
      controls.className = 'af-blog-controls';
      controls.setAttribute('role', 'region');
      controls.setAttribute('aria-label', 'Filter hiring guides');

      const pillsWrap = document.createElement('div');
      pillsWrap.className = 'af-filter-pills';
      pillsWrap.setAttribute('role', 'group');
      pillsWrap.setAttribute('aria-label', 'Topic categories');

      categories.forEach((cat) => {
        const count = cat.key === 'all' ? cards.length : cards.filter((c) => c.dataset.cat === cat.key).length;
        const btn = document.createElement('button');
        btn.type = 'button';
        btn.className = `af-filter-pill${cat.key === 'all' ? ' is-active' : ''}`;
        btn.dataset.filter = cat.key;
        btn.setAttribute('aria-pressed', String(cat.key === 'all'));
        btn.textContent = `${cat.label} (${count})`;
        pillsWrap.appendChild(btn);
      });

      const searchWrap = document.createElement('div');
      searchWrap.className = 'af-search-wrap';
      const searchIcon = document.createElement('span');
      searchIcon.className = 'af-search-icon';
      searchIcon.setAttribute('aria-hidden', 'true');
      searchIcon.textContent = '⌕';
      const searchInput = document.createElement('input');
      searchInput.type = 'search';
      searchInput.className = 'af-search-input';
      searchInput.placeholder = 'Search guides (e.g. inbox, CRM, pilot)…';
      searchInput.setAttribute('aria-label', 'Search hiring guides');
      searchWrap.append(searchIcon, searchInput);

      controls.append(pillsWrap, searchWrap);

      const status = document.createElement('p');
      status.className = 'af-blog-status';
      status.setAttribute('aria-live', 'polite');

      const empty = document.createElement('div');
      empty.className = 'af-blog-empty';
      empty.hidden = true;
      empty.innerHTML =
        '<h3>No matching guides found</h3><p>Try a broader keyword or jump straight to a custom role plan tailored to your workflow.</p><div class="actions" style="justify-content:center"><button type="button" class="button ghost" data-reset-blog>Reset filters</button><a class="button" href="/#contact">Get a free role plan</a></div>';

      grid.parentNode.insertBefore(controls, grid);
      grid.parentNode.insertBefore(status, grid);
      grid.parentNode.insertBefore(empty, grid.nextSibling);

      let activeCat = 'all';
      const applyFilter = () => {
        const q = searchInput.value.trim().toLowerCase();
        let shown = 0;
        cards.forEach((card) => {
          const catOk = activeCat === 'all' || card.dataset.cat === activeCat;
          const textOk = !q || card.textContent.toLowerCase().includes(q);
          const match = catOk && textOk;
          card.hidden = !match;
          if (match) shown += 1;
        });
        status.textContent = `Showing ${shown} of ${cards.length} hiring guides`;
        empty.hidden = shown > 0;
      };

      pillsWrap.addEventListener('click', (e) => {
        const btn = e.target.closest('.af-filter-pill');
        if (!btn) return;
        activeCat = btn.dataset.filter;
        pillsWrap.querySelectorAll('.af-filter-pill').forEach((b) => {
          const active = b === btn;
          b.classList.toggle('is-active', active);
          b.setAttribute('aria-pressed', String(active));
        });
        applyFilter();
      });

      searchInput.addEventListener('input', applyFilter);

      empty.querySelector('[data-reset-blog]')?.addEventListener('click', () => {
        activeCat = 'all';
        searchInput.value = '';
        pillsWrap.querySelectorAll('.af-filter-pill').forEach((b) => {
          const active = b.dataset.filter === 'all';
          b.classList.toggle('is-active', active);
          b.setAttribute('aria-pressed', String(active));
        });
        applyFilter();
        searchInput.focus();
      });

      applyFilter();
    }
  }

  /* ------------------------------------------------------------------------
     BLOG ARTICLES: Reading Progress Bar + Read Time & Back Breadcrumb
     ------------------------------------------------------------------------ */
  if (document.body.classList.contains('af-article')) {
    const bar = document.createElement('div');
    bar.className = 'af-read-progress';
    bar.setAttribute('aria-hidden', 'true');
    const fill = document.createElement('span');
    fill.className = 'af-read-progress__fill';
    bar.appendChild(fill);
    document.body.prepend(bar);

    let rafId = 0;
    const updateProgress = () => {
      rafId = 0;
      const max = Math.max(1, document.documentElement.scrollHeight - window.innerHeight);
      const ratio = Math.max(0, Math.min(1, window.scrollY / max));
      fill.style.transform = `scaleX(${ratio.toFixed(4)})`;
    };
    window.addEventListener(
      'scroll',
      () => {
        if (!rafId) rafId = requestAnimationFrame(updateProgress);
      },
      { passive: true }
    );
    updateProgress();

    const hero = document.querySelector('.hero');
    const article = document.querySelector('article.content') || document.querySelector('main');
    if (hero && article && !hero.querySelector('.af-article-meta')) {
      const words = (article.textContent || '').trim().split(/\s+/).filter(Boolean).length;
      const mins = Math.max(3, Math.round(words / 210));
      const meta = document.createElement('div');
      meta.className = 'af-article-meta';
      meta.innerHTML = `<a href="/blog">← All hiring guides</a><span>&bull;</span><span>${mins} min read</span><span>&bull;</span><span>Founder-led playbook</span>`;
      hero.prepend(meta);
    }
  }

  /* ------------------------------------------------------------------------
     FORMS & TOASTS (Preserves Google Ads / GA4 & application exclusion)
     ------------------------------------------------------------------------ */
  let toastTimer;
  function showToast(message) {
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
    const text = document.createElement('p');
    text.textContent = message;
    toast.append(close, text);
    toast.hidden = false;
    clearTimeout(toastTimer);
    toastTimer = setTimeout(() => {
      toast.hidden = true;
    }, 8000);
  }

  document.querySelectorAll('form[data-af-form]').forEach((form) => {
    const button = form.querySelector('button[type=submit]');
    const initial = button.textContent;
    const feedback = document.createElement('div');
    feedback.className = 'af-feedback';
    feedback.hidden = true;
    feedback.setAttribute('role', 'status');
    form.append(feedback);

    form.addEventListener('submit', async (event) => {
      event.preventDefault();
      if (button.disabled) return;
      if (!form.reportValidity()) return;
      button.disabled = true;
      button.textContent = 'Sending...';
      feedback.hidden = true;
      const controller = new AbortController();
      const timeout = setTimeout(() => controller.abort(), 15000);
      try {
        const response = await fetch(form.action, {
          method: 'POST',
          body: new FormData(form),
          headers: { Accept: 'application/json' },
          signal: controller.signal,
        });
        const data = await response.json();
        if (!response.ok || !(data.success === true || data.success === 'true')) {
          throw new Error('Unconfirmed response');
        }
        const applicant = form.dataset.afForm === 'application';
        const message = applicant
          ? 'Application submitted. We will review your profile and contact you if there is a suitable opportunity.'
          : 'Request submitted. We will review your needs and follow up with the next step.';
        form.reset();
        feedback.dataset.state = 'success';
        feedback.textContent = message;
        feedback.hidden = false;
        showToast(message);
        // Local previews and job applications must never inflate paid lead counts.
        if (!applicant && production && typeof window.gtag === 'function') {
          // Send only an identifier, never names, email addresses or form answers.
          window.gtag('event', 'generate_lead', { send_to: analyticsId, form_id: form.id || 'lead-form' });
          window.gtag('event', 'conversion', { send_to: 'AW-18276066095/0rvrCPW-qsYcEK_G2opE' });
        }
      } catch (error) {
        feedback.dataset.state = 'error';
        feedback.textContent =
          'We could not confirm your submission. Your answers are still here. Please retry, or email sales@agenticfilipino.com.';
        feedback.hidden = false;
      } finally {
        clearTimeout(timeout);
        button.disabled = false;
        button.textContent = initial;
      }
    });
  });
})();
