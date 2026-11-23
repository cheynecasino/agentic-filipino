/* ==========================================================================
   Agentic Filipino — Scroll Choreography & Interactive Widgets Engine
   Zero external dependencies, zero console errors, 60fps requestAnimationFrame
   ========================================================================== */

(() => {
  'use strict';

  const prefersReduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const production = /^(www\.)?agenticfilipino\.com$/.test(location.hostname);
  const analyticsId = 'G-2VN98ZCYR4';

  if (production && typeof window.gtag === 'function') {
    window.gtag('config', analyticsId, { send_page_view: false });
  }

  const fmtUSD = (n) =>
    new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      maximumFractionDigits: 0,
    }).format(Math.round(n));

  /* ------------------------------------------------------------------------
     00. PRELOADER CURTAIN (runs once per session, skips on hash/repeat visits)
     ------------------------------------------------------------------------ */
  const loader = document.getElementById('loader');
  const loaderPct = document.getElementById('loader-pct');
  const loaderStatus = document.getElementById('loader-status');
  const loaderCircle = document.getElementById('loader-circle');

  if (loader) {
    let seenIntro = false;
    try {
      seenIntro = sessionStorage.getItem('af_seen_intro') === '1';
    } catch (_) {}

    if (prefersReduced || seenIntro || Boolean(location.hash)) {
      loader.classList.add('is-done');
    } else {
      try {
        sessionStorage.setItem('af_seen_intro', '1');
      } catch (_) {}
      const stages = ['MAPPING WORKFLOWS', 'CHECKING FOUR SIGNALS', 'SHORTLIST READY'];
      let pct = 0;
      const start = performance.now();
      const duration = 520;

      const tickLoader = (now) => {
        const t = Math.min(1, (now - start) / duration);
        const eased = 1 - Math.pow(1 - t, 3);
        pct = Math.round(eased * 100);
        if (loaderPct) loaderPct.textContent = `${pct}%`;
        if (loaderCircle) loaderCircle.style.strokeDashoffset = String(264 - (264 * pct) / 100);
        if (loaderStatus) {
          loaderStatus.textContent = pct < 40 ? stages[0] : pct < 82 ? stages[1] : stages[2];
        }
        if (t < 1) {
          requestAnimationFrame(tickLoader);
        } else {
          setTimeout(() => loader.classList.add('is-done'), 100);
        }
      };
      requestAnimationFrame(tickLoader);
    }
  }

  /* ------------------------------------------------------------------------
     00b. FLOATING NAV + MOBILE DRAWER + SCROLL PROGRESS RAIL
     ------------------------------------------------------------------------ */
  const nav = document.getElementById('nav');
  const navMenu = document.getElementById('nav-menu');
  const navSheet = document.getElementById('navsheet');
  const scrollFill = document.getElementById('scroll-fill');

  const setDrawer = (open) => {
    if (!navMenu || !navSheet) return;
    navMenu.setAttribute('aria-expanded', String(open));
    navSheet.classList.toggle('is-open', open);
    navSheet.setAttribute('aria-hidden', String(!open));
    document.body.style.overflow = open ? 'hidden' : '';
  };

  navMenu?.addEventListener('click', () => {
    const isOpen = navMenu.getAttribute('aria-expanded') === 'true';
    setDrawer(!isOpen);
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

  let maxScrollMeters = 0;
  let lastY = window.scrollY;

  const updateScrollUI = () => {
    const y = window.scrollY;
    const maxScroll = Math.max(1, document.documentElement.scrollHeight - window.innerHeight);
    const ratio = Math.min(1, Math.max(0, y / maxScroll));

    if (scrollFill) scrollFill.style.width = `${(ratio * 100).toFixed(2)}%`;
    if (nav) nav.classList.toggle('is-scrolled', y > 24);

    maxScrollMeters += Math.abs(y - lastY) / 3780;
    lastY = y;
    const distEl = document.getElementById('rcpt-dist');
    if (distEl) distEl.textContent = `${maxScrollMeters.toFixed(1)} m`;

    updateHowSticky();
  };

  window.addEventListener('scroll', updateScrollUI, { passive: true });

  /* Scroll Reveal Observer */
  const revealEls = document.querySelectorAll('.reveal');
  if ('IntersectionObserver' in window && !prefersReduced) {
    const revObs = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add('is-in');
            revObs.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.1, rootMargin: '0px 0px -30px 0px' }
    );
    revealEls.forEach((el) => revObs.observe(el));
  } else {
    revealEls.forEach((el) => el.classList.add('is-in'));
  }

  /* ------------------------------------------------------------------------
     01. HERO LIVE INTERACTIVE DEVICE TABS
     ------------------------------------------------------------------------ */
  const heroTabs = document.querySelectorAll('[data-device-tab]');
  const heroViews = document.querySelectorAll('[data-device-view]');

  heroTabs.forEach((tab) => {
    tab.addEventListener('click', () => {
      const target = tab.dataset.deviceTab;
      heroTabs.forEach((t) => {
        const active = t === tab;
        t.classList.toggle('is-active', active);
        t.setAttribute('aria-selected', String(active));
      });
      heroViews.forEach((v) => {
        v.classList.toggle('is-active', v.dataset.deviceView === target);
      });
    });
  });

  /* ------------------------------------------------------------------------
     02. PINNED 4-STEP SCROLL SHOWCASE (#how)
     ------------------------------------------------------------------------ */
  const howSteps = [
    {
      title: 'Start with the <em>pressure point,</em> not a job title.',
      copy: 'Most agencies dump ten generic resumes in your inbox. We start by isolating the exact workflow leaking attention, defining clear outcomes before we screen a single candidate.',
      badge: 'FREE ROLE PLAN · 24–48 HOUR RESPONSE',
      tilt: -3.2,
    },
    {
      title: 'Four signals <em>before</em> the shortlist.',
      copy: 'Every candidate is tested on judgment under pressure, concise English communication, workflow fluency, and founder-led client readiness — so you review a tiny, defensible shortlist.',
      badge: '140 APPLICANTS → 1 VETTED PARTNER',
      tilt: 1.8,
    },
    {
      title: 'A handoff that <em>actually sticks.</em>',
      copy: 'We structure the first 14 days around documented playbooks, clear approval boundaries, and crisp daily digests so onboarding never becomes another job for the founder.',
      badge: 'DAY 1–14 GUIDED RAMP · US OVERLAP',
      tilt: -2.1,
    },
    {
      title: 'Clearer ownership, <em>every single week.</em>',
      copy: 'Recurring admin, warm leads, support queues, and back-office records stay moving without reminders — and you can scale seamlessly from a $180 pilot to a dedicated partner.',
      badge: 'PILOT → PART-TIME → FULL-TIME → POD',
      tilt: 2.4,
    },
  ];

  const howSection = document.getElementById('how');
  const howRing = document.getElementById('how-ring');
  const howDevice = document.getElementById('how-device');
  const howCounter = document.getElementById('how-counter');
  const howTitle = document.getElementById('how-title');
  const howCopy = document.getElementById('how-copy');
  const howBadge = document.getElementById('how-badge');
  const howScreens = document.querySelectorAll('[data-how-screen]');
  const howSegs = document.querySelectorAll('[data-how-jump]');
  const howFills = document.querySelectorAll('[data-how-fill]');

  let currentHowIdx = 0;

  const renderHowStep = (idx, segProgress = 1) => {
    if (idx !== currentHowIdx) {
      currentHowIdx = idx;
      const step = howSteps[idx];
      if (howCounter) howCounter.innerHTML = `${idx + 1}<span> / 4</span>`;
      if (howTitle) howTitle.innerHTML = step.title;
      if (howCopy) howCopy.textContent = step.copy;
      if (howBadge) howBadge.innerHTML = `<i></i><span>${step.badge}</span>`;
      howScreens.forEach((s) => s.classList.toggle('is-active', Number(s.dataset.howScreen) === idx));
      howSegs.forEach((s) => s.classList.toggle('is-active', Number(s.dataset.howJump) === idx));
      if (howDevice && window.innerWidth >= 960) {
        howDevice.style.transform = `rotate(${step.tilt}deg)`;
      }
    }

    howFills.forEach((fill, i) => {
      const w = i < idx ? 100 : i === idx ? Math.round(segProgress * 100) : 0;
      fill.style.width = `${w}%`;
    });
  };

  function updateHowSticky() {
    if (!howSection || window.innerWidth < 960) return;
    const rect = howSection.getBoundingClientRect();
    const travel = Math.max(1, howSection.offsetHeight - window.innerHeight);
    const raw = Math.min(1, Math.max(0, -rect.top / travel));

    if (howRing && !prefersReduced) {
      howRing.style.transform = `rotate(${(raw * 110).toFixed(2)}deg)`;
    }

    const scaled = raw * 4;
    const idx = Math.min(3, Math.floor(scaled));
    const localProgress = idx === 3 && raw >= 0.995 ? 1 : Math.min(1, scaled - idx);
    renderHowStep(idx, localProgress);
  }

  howSegs.forEach((btn) => {
    btn.addEventListener('click', () => {
      const idx = Number(btn.dataset.howJump);
      if (window.innerWidth >= 960 && howSection) {
        const travel = Math.max(1, howSection.offsetHeight - window.innerHeight);
        const targetY = howSection.offsetTop + (idx / 4) * travel + 24;
        window.scrollTo({ top: targetY, behavior: 'smooth' });
      } else {
        renderHowStep(idx, 1);
      }
    });
  });

  renderHowStep(0, 0.25);

  /* ------------------------------------------------------------------------
     04. MOBILE STORY CAROUSEL INDICATOR (#story)
     ------------------------------------------------------------------------ */
  const storyTrack = document.getElementById('story-track');
  const storyIndicator = document.getElementById('story-indicator');

  storyTrack?.addEventListener(
    'scroll',
    () => {
      if (!storyIndicator) return;
      const cards = storyTrack.querySelectorAll('.story-card');
      if (!cards.length) return;
      const cardW = cards[0].offsetWidth + 16;
      const idx = Math.min(cards.length, Math.max(1, Math.round(storyTrack.scrollLeft / cardW) + 1));
      storyIndicator.textContent = `${idx} / ${cards.length} • SWIPE`;
    },
    { passive: true }
  );

  /* ------------------------------------------------------------------------
     05. INTERACTIVE WORKLOAD DIAGNOSTIC (#diagnostic)
     ------------------------------------------------------------------------ */
  const diagData = {
    leads: {
      question: 'Leads go cold before we reply',
      num: 'Signal 01 / 04',
      title: 'Your response system needs an owner.',
      copy: 'When inquiries wait, revenue leaks before sales gets a chance. Your first hire should protect speed-to-lead, follow-up discipline, and CRM visibility.',
      role: 'Lead follow-up specialist',
      outcome: 'Every qualified lead gets a next step',
      tools: 'Inbox + CRM + Calendar',
      lane: 'Lead follow-up',
    },
    founder: {
      question: 'Everything still routes through me',
      num: 'Signal 02 / 04',
      title: 'The founder is still the operating system.',
      copy: 'When reminders, coordination, inboxes, and small decisions route through one person, growth adds pressure instead of capacity.',
      role: 'Executive operations partner',
      outcome: 'Recurring work moves without reminders',
      tools: 'Inbox + Calendar + SOPs',
      lane: 'Executive and operations',
    },
    support: {
      question: 'Customer support gets reactive',
      num: 'Signal 03 / 04',
      title: 'Customer care needs a dependable rhythm.',
      copy: 'Reactive support creates slow replies, inconsistent handoffs, and avoidable churn. Your first hire should own the queue and keep service consistent.',
      role: 'Customer support specialist',
      outcome: 'Faster, calmer customer responses',
      tools: 'Help desk + Email + KB',
      lane: 'Customer support',
    },
    construction: {
      question: 'Our back office is chaotic',
      num: 'Signal 04 / 04',
      title: 'The field needs a calmer back office.',
      copy: 'Scheduling, estimate follow-up, paperwork, and client updates should never pull owners and project leaders away from job delivery.',
      role: 'Construction admin coordinator',
      outcome: 'Cleaner estimates, schedules & job files',
      tools: 'Jobber / CRM + Email + Docs',
      lane: 'Construction back office',
    },
  };

  let diagTimer = null;
  let activeDiagKey = 'leads';

  const typeQuestion = (text) => {
    const el = document.getElementById('diag-typed');
    if (!el) return;
    if (diagTimer) clearInterval(diagTimer);
    if (prefersReduced) {
      el.textContent = text;
      return;
    }
    el.textContent = '';
    let i = 0;
    diagTimer = setInterval(() => {
      i += 1;
      el.textContent = text.slice(0, i);
      if (i >= text.length) clearInterval(diagTimer);
    }, 20);
  };

  document.querySelectorAll('[data-diag]').forEach((btn) => {
    btn.addEventListener('click', () => {
      const key = btn.dataset.diag;
      const d = diagData[key];
      if (!d) return;
      activeDiagKey = key;
      document.querySelectorAll('[data-diag]').forEach((b) => b.classList.toggle('is-active', b === btn));
      typeQuestion(d.question);
      ['num', 'title', 'copy', 'role', 'outcome', 'tools'].forEach((field) => {
        const node = document.getElementById(`diag-${field}`);
        if (node) node.textContent = d[field];
      });
    });
  });

  document.getElementById('diag-cta')?.addEventListener('click', () => {
    const laneSelect = document.getElementById('af-lane');
    if (laneSelect && diagData[activeDiagKey]) {
      laneSelect.value = diagData[activeDiagKey].lane;
    }
  });

  /* ------------------------------------------------------------------------
     06. LIVE ROI FORECAST CALCULATOR (#forecast) + SHARED STATE FOR RECEIPT
     ------------------------------------------------------------------------ */
  const state = {
    hours: 15,
    rate: 75,
    budget: 1200,
    grossMonthly: 4871,
    netMonthly: 3671,
    delegatedCount: 0,
    delegatedHours: 0,
    billing: 'monthly',
    tier: 'fulltime',
  };

  const hoursIn = document.getElementById('f-hours');
  const rateIn = document.getElementById('f-rate');
  const budgetIn = document.getElementById('f-budget');

  const updateForecast = () => {
    if (!hoursIn || !rateIn || !budgetIn) return;
    const h = Number(hoursIn.value);
    const r = Number(rateIn.value);
    const b = Number(budgetIn.value);
    const gross = h * r * 4.33;
    const net = gross - b;
    const annual = net * 12;

    state.hours = h;
    state.rate = r;
    state.budget = b;
    state.grossMonthly = gross;
    state.netMonthly = net;

    const setText = (id, val) => {
      const el = document.getElementById(id);
      if (el) el.textContent = val;
    };

    setText('f-hours-out', `${h} hrs`);
    setText('f-rate-out', `${fmtUSD(r)}/hr`);
    setText('f-budget-out', fmtUSD(b));
    setText('f-phone-net', `${net >= 0 ? '' : '-'}${fmtUSD(Math.abs(net))}`);
    setText('f-phone-hrs', `${Math.round(h * 4.33)} hrs / mo freed`);
    setText('f-phone-tier', b <= 1500 ? 'Part-Time fit' : b <= 2600 ? 'Full-Time fit' : 'Team Pod fit');
    setText('f-phone-gross', fmtUSD(gross));
    setText('f-phone-cost', `-${fmtUSD(b)}`);
    setText('f-annual', `${annual >= 0 ? '+' : '-'}${fmtUSD(Math.abs(annual))}`);
    setText('f-row-gross', fmtUSD(gross));
    setText('f-row-cost', `-${fmtUSD(b)}`);
    setText('f-row-net', `${net >= 0 ? '' : '-'}${fmtUSD(Math.abs(net))}`);

    const bar = document.getElementById('f-phone-bar');
    if (bar) {
      const pct = Math.min(100, Math.max(12, Math.round((gross / (gross + b)) * 100)));
      bar.style.width = `${pct}%`;
    }

    // Redraw smooth 12-month SVG curve
    const topY = Math.max(18, Math.min(112, 120 - (Math.max(0, annual) / 140000) * 102));
    const midY = (132 + topY) / 2 - 10;
    const pathD = `M12 132 Q 160 ${midY.toFixed(1)}, 348 ${topY.toFixed(1)}`;
    const areaD = `${pathD} L348 132 L12 132 Z`;
    document.getElementById('f-chart-line')?.setAttribute('d', pathD);
    document.getElementById('f-chart-area')?.setAttribute('d', areaD);
    document.getElementById('f-chart-dot')?.setAttribute('cy', topY.toFixed(1));

    const note = document.getElementById('f-note');
    if (note) {
      note.textContent =
        net >= 0
          ? `After your ${fmtUSD(b)}/mo budget, the model shows ${fmtUSD(net)}/mo in reclaimed founder capacity (4.33 wks/mo).`
          : `Planned budget is ${fmtUSD(Math.abs(net))}/mo above modeled time value. Consider starting with our $180 20-hour pilot first.`;
    }

    updateReceipt();
  };

  [hoursIn, rateIn, budgetIn].forEach((el) => el?.addEventListener('input', updateForecast));

  /* ------------------------------------------------------------------------
     07. LIVE PARTICLE SANKEY ATTENTION FLOW (#flow)
     ------------------------------------------------------------------------ */
  const flowCanvas = document.getElementById('flow-canvas');
  let flowMode = 'leaks';
  let flowBlend = 0; // 0 = leaks, 1 = partner

  const flowTargets = [
    { name: 'Deep Strategic Growth', color: '#41EAD4', leak: 14, partner: 34 },
    { name: 'Client Delivery & Sales', color: '#EAE1D3', leak: 12, partner: 11 },
    { name: 'Inbox & Scheduling', color: '#D6A244', leak: 7, partner: 1 },
    { name: 'Lead Follow-Up & CRM', color: '#E08A5E', leak: 6, partner: 1 },
    { name: 'Support & Back Office', color: '#C2693A', leak: 7, partner: 2 },
    { name: 'Context Switching', color: '#8E9EA6', leak: 4, partner: 1 },
  ];

  const updateFlowText = () => {
    const isPartner = flowMode === 'partner';
    flowTargets.forEach((t, i) => {
      const el = document.querySelector(`[data-flow-val="${i}"]`);
      if (el) el.textContent = `${isPartner ? t.partner : t.leak} hrs`;
    });
    const strat = document.getElementById('flow-strategic');
    const drag = document.getElementById('flow-drag');
    const cap = document.getElementById('flow-caption');
    if (strat) strat.textContent = isPartner ? '34 hrs' : '14 hrs';
    if (drag) drag.textContent = isPartner ? '5 hrs' : '24 hrs';
    if (cap) {
      cap.textContent = isPartner
        ? 'With an embedded Agentic Filipino partner, 19+ hours every week re-route directly back into revenue, sales, and vision.'
        : 'Nearly half the founder’s week disappears into reactive follow-up, inbox sorting, and back-office cleanup.';
    }
  };

  document.querySelectorAll('.flow-btn').forEach((btn) => {
    btn.addEventListener('click', () => {
      flowMode = btn.dataset.mode;
      document.querySelectorAll('.flow-btn').forEach((b) => b.classList.toggle('is-active', b === btn));
      updateFlowText();
    });
  });

  if (flowCanvas && flowCanvas.getContext) {
    const ctx = flowCanvas.getContext('2d');
    const particles = [];
    const COUNT = prefersReduced ? 110 : 320;
    let flowVisible = false;

    const pickLane = (blend) => {
      const weights = flowTargets.map((t) => t.leak + (t.partner - t.leak) * blend);
      const total = weights.reduce((a, b) => a + b, 0);
      let r = Math.random() * total;
      for (let i = 0; i < weights.length; i++) {
        r -= weights[i];
        if (r <= 0) return i;
      }
      return 0;
    };

    for (let i = 0; i < COUNT; i++) {
      particles.push({
        t: Math.random(),
        speed: 0.0028 + Math.random() * 0.0038,
        lane: pickLane(0),
        spread: (Math.random() - 0.5) * 18,
        size: 1.5 + Math.random() * 2.2,
      });
    }

    const resizeFlow = () => {
      const rect = flowCanvas.parentElement.getBoundingClientRect();
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      flowCanvas.width = Math.max(240, rect.width * dpr);
      flowCanvas.height = Math.max(220, rect.height * dpr);
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    };
    resizeFlow();
    window.addEventListener('resize', resizeFlow);

    const obs = new IntersectionObserver(
      (entries) => {
        flowVisible = entries[0]?.isIntersecting ?? false;
      },
      { rootMargin: '80px' }
    );
    obs.observe(flowCanvas);

    const drawFlow = () => {
      if (flowVisible) {
        const w = flowCanvas.clientWidth;
        const h = flowCanvas.clientHeight;
        const targetBlend = flowMode === 'partner' ? 1 : 0;
        flowBlend += (targetBlend - flowBlend) * 0.06;

        ctx.clearRect(0, 0, w, h);

        // Draw subtle guide ribbons
        const yPad = 24;
        const laneY = flowTargets.map((_, i) => yPad + (i / (flowTargets.length - 1)) * (h - yPad * 2));
        const startYCenter = h / 2;

        flowTargets.forEach((t, i) => {
          const weight = t.leak + (t.partner - t.leak) * flowBlend;
          const sy = startYCenter + (i - 2.5) * 26;
          const ey = laneY[i];
          ctx.beginPath();
          ctx.moveTo(6, sy);
          ctx.bezierCurveTo(w * 0.42, sy, w * 0.58, ey, w - 6, ey);
          ctx.strokeStyle = t.color;
          ctx.globalAlpha = 0.08 + (weight / 50) * 0.16;
          ctx.lineWidth = Math.max(2, weight * 1.1);
          ctx.stroke();
        });

        ctx.globalAlpha = 1;

        particles.forEach((p) => {
          p.t += p.speed;
          if (p.t >= 1) {
            p.t = 0;
            p.lane = pickLane(flowBlend);
          }
          const t = p.t;
          const inv = 1 - t;
          const sy = startYCenter + (p.lane - 2.5) * 26 + p.spread * 0.55;
          const ey = laneY[p.lane] + p.spread * 0.7;
          const cx1 = w * 0.42;
          const cx2 = w * 0.58;

          const x = inv * inv * inv * 6 + 3 * inv * inv * t * cx1 + 3 * inv * t * t * cx2 + t * t * t * (w - 6);
          const y = inv * inv * inv * sy + 3 * inv * inv * t * sy + 3 * inv * t * t * ey + t * t * t * ey;

          ctx.beginPath();
          ctx.arc(x, y, p.size, 0, Math.PI * 2);
          ctx.fillStyle = flowTargets[p.lane].color;
          ctx.globalAlpha = 0.4 + Math.sin(t * Math.PI) * 0.55;
          ctx.fill();
        });
        ctx.globalAlpha = 1;
      }
      requestAnimationFrame(drawFlow);
    };
    requestAnimationFrame(drawFlow);
  }

  /* ------------------------------------------------------------------------
     08. INTERACTIVE BOTTLENECK GRAVEYARD (#graveyard)
     ------------------------------------------------------------------------ */
  const bottlenecks = [
    { title: 'Chasing Cold Estimates', hrs: 4.0, sub: 'Still open from 2 weeks ago' },
    { title: 'Late-Night Inbox Triage', hrs: 4.5, sub: 'Unread count keeps climbing' },
    { title: 'Manual CRM Hygiene', hrs: 3.5, sub: 'Half the notes are missing' },
    { title: 'Calendar Ping-Pong', hrs: 2.5, sub: 'Six emails for one 15-min call' },
    { title: 'Order Status Replies', hrs: 3.0, sub: 'Copy-pasting tracking numbers' },
    { title: 'Job Record Filing', hrs: 3.5, sub: 'Photos & invoices in 4 folders' },
    { title: 'Support Queue Sorting', hrs: 4.0, sub: 'Same 10 customer questions' },
    { title: 'Vendor Follow-Ups', hrs: 2.0, sub: 'Waiting on delivery ETAs' },
    { title: 'SKU & Listing Updates', hrs: 3.0, sub: 'Catalog backlog every week' },
    { title: 'Weekly KPI Spreadsheets', hrs: 2.5, sub: 'Sunday night manual exports' },
    { title: 'Lead List Enrichment', hrs: 3.0, sub: 'Tab-hopping before outreach' },
    { title: 'Onboarding Doc Chasing', hrs: 2.0, sub: 'Nudging clients for files' },
  ];

  const clearedSet = new Set();
  const graveGrid = document.getElementById('grave-grid');
  const graveDotsWrap = document.getElementById('grave-dots');

  const renderGraveTally = () => {
    let totalHrs = 0;
    clearedSet.forEach((idx) => {
      totalHrs += bottlenecks[idx].hrs;
    });
    state.delegatedCount = clearedSet.size;
    state.delegatedHours = totalHrs;

    const hrsEl = document.getElementById('grave-hrs');
    const annualEl = document.getElementById('grave-annual');
    const labelEl = document.getElementById('grave-count-label');

    if (hrsEl) hrsEl.textContent = totalHrs.toFixed(1).replace(/\.0$/, '');
    if (annualEl) annualEl.textContent = fmtUSD(totalHrs * state.rate * 52);
    if (labelEl) labelEl.textContent = `${clearedSet.size} OF ${bottlenecks.length} DELEGATED`;

    document.querySelectorAll('.grave-dot').forEach((dot, i) => {
      dot.classList.toggle('is-lit', i < clearedSet.size);
    });

    updateReceipt();
  };

  if (graveGrid) {
    if (graveDotsWrap) {
      const label = document.getElementById('grave-count-label');
      bottlenecks.forEach(() => {
        const dot = document.createElement('i');
        dot.className = 'grave-dot';
        graveDotsWrap.insertBefore(dot, label);
      });
    }

    bottlenecks.forEach((item, idx) => {
      const btn = document.createElement('button');
      btn.type = 'button';
      btn.className = 'stone';
      btn.setAttribute('aria-pressed', 'false');
      btn.innerHTML = `
        <span class="stone__eyebrow">R.I.P. BUSYWORK</span>
        <span class="stone__title">${item.title}</span>
        <span class="stone__hrs">${item.hrs.toFixed(1)} hrs/wk</span>
        <span class="stone__sub">${item.sub}</span>
        <span class="stone__stamp" aria-hidden="true"><span>DELEGATED</span></span>
      `;
      btn.addEventListener('click', () => {
        if (clearedSet.has(idx)) {
          clearedSet.delete(idx);
          btn.classList.remove('is-cleared');
          btn.setAttribute('aria-pressed', 'false');
        } else {
          clearedSet.add(idx);
          btn.classList.add('is-cleared');
          btn.setAttribute('aria-pressed', 'true');
        }
        renderGraveTally();
      });
      graveGrid.appendChild(btn);
    });
  }

  document.getElementById('grave-all')?.addEventListener('click', () => {
    document.querySelectorAll('#grave-grid .stone').forEach((btn, idx) => {
      clearedSet.add(idx);
      btn.classList.add('is-cleared');
      btn.setAttribute('aria-pressed', 'true');
    });
    renderGraveTally();
  });

  document.getElementById('grave-reset')?.addEventListener('click', () => {
    clearedSet.clear();
    document.querySelectorAll('#grave-grid .stone').forEach((btn) => {
      btn.classList.remove('is-cleared');
      btn.setAttribute('aria-pressed', 'false');
    });
    renderGraveTally();
  });

  /* ------------------------------------------------------------------------
     09. DRAGGABLE 3D TOOLS ORBIT (#orbit)
     ------------------------------------------------------------------------ */
  const orbitTools = [
    { abbr: 'Sl', name: 'Slack', ring: 0, note: 'Daily 3-line status briefs & quick team coordination' },
    { abbr: 'HS', name: 'HubSpot', ring: 0, note: 'Speed-to-lead replies, deal stages & clean CRM notes' },
    { abbr: 'Sh', name: 'Shopify', ring: 0, note: 'Order inquiries, returns admin & catalog maintenance' },
    { abbr: 'QB', name: 'QuickBooks', ring: 0, note: 'Invoice organization, job file prep & follow-ups' },
    { abbr: 'Jb', name: 'Jobber', ring: 1, note: 'Construction estimate follow-ups & schedule updates' },
    { abbr: 'SF', name: 'Salesforce', ring: 1, note: 'Pipeline hygiene, task queues & lead enrichment' },
    { abbr: 'Gm', name: 'Gmail', ring: 1, note: 'Inbox triage, draft replies & priority flagging' },
    { abbr: 'No', name: 'Notion', ring: 1, note: 'Living SOPs, checklists & weekly ops trackers' },
    { abbr: 'Zd', name: 'Zendesk', ring: 2, note: 'Email & chat ticket triage under your SLA' },
    { abbr: 'As', name: 'Asana', ring: 2, note: 'Project timelines, reminders & handoff visibility' },
    { abbr: 'Gc', name: 'Calendar', ring: 2, note: 'Booking, reschedules & founder focus blocks' },
    { abbr: 'FB', name: 'FollowUp', ring: 2, note: 'Real estate CRM cleanup & approved-script outreach' },
  ];

  const orbitStage = document.getElementById('orbit-stage');
  const orbitNodesWrap = document.getElementById('orbit-nodes');
  const orbitTooltip = document.getElementById('orbit-tooltip');

  if (orbitStage && orbitNodesWrap) {
    const nodeEls = orbitTools.map((tool, i) => {
      const el = document.createElement('button');
      el.type = 'button';
      el.className = 'orbit-node';
      el.innerHTML = `<span class="orbit-node__abbr">${tool.abbr}</span><span class="orbit-node__name">${tool.name}</span>`;
      const showTip = () => {
        if (orbitTooltip) orbitTooltip.textContent = `${tool.name} — ${tool.note}`;
      };
      el.addEventListener('mouseenter', showTip);
      el.addEventListener('focus', showTip);
      el.addEventListener('click', showTip);
      orbitNodesWrap.appendChild(el);
      return { el, tool, baseAngle: (i / orbitTools.length) * Math.PI * 2 };
    });

    let angle = 0;
    let velocity = prefersReduced ? 0 : 0.0022;
    let dragging = false;
    let lastX = 0;
    let orbitVisible = false;

    const obs = new IntersectionObserver(
      (entries) => {
        orbitVisible = entries[0]?.isIntersecting ?? false;
      },
      { rootMargin: '80px' }
    );
    obs.observe(orbitStage);

    orbitStage.addEventListener('pointerdown', (e) => {
      dragging = true;
      lastX = e.clientX;
      velocity = 0;
    });

    window.addEventListener('pointermove', (e) => {
      if (!dragging) return;
      const dx = e.clientX - lastX;
      lastX = e.clientX;
      velocity = dx * 0.0065;
      angle += velocity;
    });

    window.addEventListener('pointerup', () => {
      dragging = false;
    });

    const layoutOrbit = () => {
      if (orbitVisible || dragging) {
        if (!dragging) {
          angle += velocity;
          const baseSpeed = prefersReduced ? 0 : 0.0022;
          velocity += (baseSpeed - velocity) * 0.035;
        }
        const w = orbitStage.clientWidth;
        const scaleW = Math.min(1, w / 1080);
        const radii = [
          { rx: 450 * scaleW, ry: 145 * Math.max(0.68, scaleW) },
          { rx: 320 * scaleW, ry: 108 * Math.max(0.68, scaleW) },
          { rx: 192 * scaleW, ry: 72 * Math.max(0.68, scaleW) },
        ];

        nodeEls.forEach((item) => {
          const r = radii[item.tool.ring];
          const dir = item.tool.ring === 1 ? -1 : 1;
          const a = item.baseAngle + angle * dir;
          const x = Math.cos(a) * r.rx;
          const y = Math.sin(a) * r.ry;
          const depth = (Math.sin(a) + 1) / 2; // 0 back, 1 front
          const scale = 0.78 + depth * 0.3;
          item.el.style.transform = `translate3d(${x.toFixed(1)}px, ${y.toFixed(1)}px, 0) scale(${scale.toFixed(3)})`;
          item.el.style.zIndex = String(Math.round(depth * 10) + 1);
          item.el.style.opacity = (0.62 + depth * 0.38).toFixed(2);
        });
      }
      requestAnimationFrame(layoutOrbit);
    };
    requestAnimationFrame(layoutOrbit);
  }

  /* ------------------------------------------------------------------------
     10. DEEP BRAND VETTING VAULT CANVAS + HOLD-TO-FILTER (#vault)
     ------------------------------------------------------------------------ */
  const vaultCanvas = document.getElementById('vault-canvas');
  const vaultHold = document.getElementById('vault-hold');
  const vaultHoldLabel = document.getElementById('vault-hold-label');
  const vReviewed = document.getElementById('v-reviewed');
  const vPassed = document.getElementById('v-passed');
  const vFinal = document.getElementById('v-final');
  const vaultNote = document.getElementById('vault-note');

  let vaultHolding = false;
  let vaultProgress = 0; // 0..1

  const setHolding = (active) => {
    vaultHolding = active;
    vaultHold?.classList.toggle('is-holding', active);
    if (vaultHoldLabel) {
      vaultHoldLabel.textContent = active
        ? 'Filtering 4 signals…'
        : vaultProgress >= 0.99
          ? 'Shortlist locked · Run again'
          : 'Hold to run 4-stage filter';
    }
  };

  vaultHold?.addEventListener('pointerdown', () => {
    if (vaultProgress >= 0.99) vaultProgress = 0;
    setHolding(true);
  });
  window.addEventListener('pointerup', () => setHolding(false));
  vaultHold?.addEventListener('pointerleave', () => setHolding(false));
  vaultHold?.addEventListener('keydown', (e) => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      if (vaultProgress >= 0.99) vaultProgress = 0;
      setHolding(true);
      setTimeout(() => setHolding(false), 1800);
    }
  });

  if (vaultCanvas && vaultCanvas.getContext) {
    const ctx = vaultCanvas.getContext('2d');
    const dots = Array.from({ length: 72 }, (_, i) => ({
      x: Math.random() * 0.28,
      y: 0.14 + Math.random() * 0.72,
      speed: 0.002 + Math.random() * 0.003,
      passStage: i % 18 === 0 ? 4 : i % 6 === 0 ? 3 : i % 3 === 0 ? 2 : 1,
      size: 2.2 + Math.random() * 2.2,
    }));

    let vaultVisible = false;
    const obs = new IntersectionObserver(
      (entries) => {
        vaultVisible = entries[0]?.isIntersecting ?? false;
      },
      { rootMargin: '80px' }
    );
    obs.observe(vaultCanvas);

    const resizeVault = () => {
      const rect = vaultCanvas.parentElement.getBoundingClientRect();
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      vaultCanvas.width = Math.max(240, rect.width * dpr);
      vaultCanvas.height = Math.max(220, rect.height * dpr);
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    };
    resizeVault();
    window.addEventListener('resize', resizeVault);

    const gates = [0.3, 0.5, 0.7, 0.87];
    const gateLabels = ['THINK', 'SAY', 'DO', 'OWN'];

    const drawVault = () => {
      if (vaultVisible) {
        const w = vaultCanvas.clientWidth;
        const h = vaultCanvas.clientHeight;

        if (vaultHolding) {
          vaultProgress = Math.min(1, vaultProgress + 0.012);
          const reviewed = Math.round(vaultProgress * 140);
          const passed = Math.round(vaultProgress * 9);
          const fin = vaultProgress > 0.88 ? 1 : 0;
          if (vReviewed) vReviewed.textContent = String(reviewed);
          if (vPassed) vPassed.textContent = String(passed);
          if (vFinal) vFinal.textContent = String(fin);
          if (vaultNote) {
            vaultNote.textContent =
              fin === 1
                ? '140 applicants screened. 1 founder-trusted partner ready for Day 1.'
                : 'Running real-world judgment, communication, and workflow gates…';
          }
          if (vaultProgress >= 1) setHolding(false);
        }

        ctx.clearRect(0, 0, w, h);

        // Draw 4 vetting rings
        gates.forEach((gx, idx) => {
          const x = gx * w;
          const r = 74 - idx * 11;
          ctx.beginPath();
          ctx.ellipse(x, h / 2, 14, r, 0, 0, Math.PI * 2);
          ctx.strokeStyle = idx === 3 ? '#D6A244' : '#41EAD4';
          ctx.globalAlpha = vaultHolding ? 0.55 : 0.25;
          ctx.lineWidth = 1.6;
          ctx.stroke();

          ctx.globalAlpha = 0.75;
          ctx.fillStyle = '#A6B9C0';
          ctx.font = '500 10px "DM Mono", monospace';
          ctx.textAlign = 'center';
          ctx.fillText(gateLabels[idx], x, h - 14);
        });

        // Animate applicant particles filtering through gates
        const mult = vaultHolding ? 3.2 : 1;
        dots.forEach((d) => {
          d.x += d.speed * mult;
          const maxGateX = gates[d.passStage - 1];
          if (d.passStage < 4 && d.x > maxGateX) {
            d.x = 0.02;
            d.y = 0.14 + Math.random() * 0.72;
          } else if (d.x > 0.96) {
            d.x = 0.02;
            d.y = 0.14 + Math.random() * 0.72;
          }

          // Funnel y gently toward center as x advances
          const funnelY = h / 2 + (d.y - 0.5) * h * Math.max(0.12, 1 - d.x * 0.88);
          ctx.beginPath();
          ctx.arc(d.x * w, funnelY, d.passStage === 4 ? 4 : d.size, 0, Math.PI * 2);
          ctx.fillStyle = d.passStage === 4 ? '#D6A244' : d.x > 0.45 ? '#41EAD4' : '#C2693A';
          ctx.globalAlpha = d.passStage === 4 ? 0.95 : 0.52;
          ctx.fill();
        });
        ctx.globalAlpha = 1;
      }
      requestAnimationFrame(drawVault);
    };
    requestAnimationFrame(drawVault);
  }

  /* ------------------------------------------------------------------------
     11. INTERACTIVE TIERS MENU + LIVE FOUNDER RECEIPT (#pricing)
     ------------------------------------------------------------------------ */
  const tiers = {
    pilot: {
      name: 'Workflow Pilot',
      monthly: 180,
      quarterly: 180,
      unit: ' / 20 hrs',
      metaMonthly: 'ONE-TIME 20-HOUR PILOT • NO PAYMENT TO INQUIRE',
      metaQuarterly: 'ONE-TIME 20-HOUR PILOT • SCOPE CONFIRMED FIRST',
      formVal: 'Workflow Pilot ($180 / 20 hrs)',
    },
    parttime: {
      name: 'Part-Time Partner',
      monthly: 1200,
      quarterly: 1080,
      unit: ' / mo',
      metaMonthly: '20 HRS / WEEK • BILLED MONTHLY',
      metaQuarterly: '20 HRS / WEEK • BILLED QUARTERLY (SAVE 10%)',
      formVal: 'Part-Time Partner ($1,200/mo)',
    },
    fulltime: {
      name: 'Full-Time Embedded',
      monthly: 2200,
      quarterly: 1980,
      unit: ' / mo',
      metaMonthly: '40 HRS / WEEK • FOUNDER-LED ONBOARDING',
      metaQuarterly: '40 HRS / WEEK • BILLED QUARTERLY (SAVE 10%)',
      formVal: 'Full-Time Embedded ($2,200/mo)',
    },
    pod: {
      name: 'Team Pod',
      monthly: 3900,
      quarterly: 3510,
      unit: ' / mo',
      metaMonthly: '2 DEDICATED ROLES • PRIORITY COVERAGE',
      metaQuarterly: '2 DEDICATED ROLES • BILLED QUARTERLY (SAVE 10%)',
      formVal: 'Team Pod ($3,900/mo)',
    },
  };

  const renderPricing = () => {
    const isQ = state.billing === 'quarterly';
    Object.entries(tiers).forEach(([key, t]) => {
      const price = isQ ? t.quarterly : t.monthly;
      const priceEl = document.querySelector(`[data-tier-price="${key}"]`);
      if (priceEl) priceEl.innerHTML = `${fmtUSD(price)}<span>${t.unit}</span>`;
      const metaEl = document.querySelector(`[data-tier-meta="${key}"]`);
      if (metaEl) metaEl.textContent = isQ ? t.metaQuarterly : t.metaMonthly;
    });

    const selected = tiers[state.tier];
    const cta = document.getElementById('tier-cta');
    if (cta && selected) {
      cta.innerHTML = `Start with ${selected.name} <span class="btn__arrow">→</span>`;
    }

    updateReceipt();
  };

  document.querySelectorAll('[data-billing]').forEach((btn) => {
    btn.addEventListener('click', () => {
      state.billing = btn.dataset.billing;
      document.querySelectorAll('[data-billing]').forEach((b) => b.classList.toggle('is-active', b === btn));
      renderPricing();
    });
  });

  document.querySelectorAll('[data-tier]').forEach((opt) => {
    opt.addEventListener('click', () => {
      state.tier = opt.dataset.tier;
      document.querySelectorAll('[data-tier]').forEach((o) => {
        const active = o === opt;
        o.classList.toggle('is-selected', active);
        o.setAttribute('aria-checked', String(active));
      });
      const tierSelect = document.getElementById('af-tier');
      if (tierSelect && tiers[state.tier]) {
        tierSelect.value = tiers[state.tier].formVal;
      }
      renderPricing();
    });
  });

  document.getElementById('tier-cta')?.addEventListener('click', () => {
    const tierSelect = document.getElementById('af-tier');
    const selected = tiers[state.tier];
    if (tierSelect && selected) {
      tierSelect.value = selected.formVal;
    }
  });

  document.querySelectorAll('[data-lane-pick]').forEach((link) => {
    link.addEventListener('click', () => {
      const laneSelect = document.getElementById('af-lane');
      if (laneSelect) laneSelect.value = link.dataset.lanePick;
    });
  });

  function updateReceipt() {
    const selected = tiers[state.tier];
    const tierCost = state.billing === 'quarterly' ? selected.quarterly : selected.monthly;
    const delegatedMonthlyVal = state.delegatedHours * state.rate * 4.33;
    const effectiveGross = Math.max(state.grossMonthly, delegatedMonthlyVal);
    const net = effectiveGross - tierCost;

    const setText = (id, val) => {
      const el = document.getElementById(id);
      if (el) el.textContent = val;
    };

    setText('rcpt-tasks-count', String(state.delegatedCount));
    setText('rcpt-tasks-val', `+${fmtUSD(delegatedMonthlyVal)}`);
    setText('rcpt-roi-val', `+${fmtUSD(state.grossMonthly)}`);
    setText('rcpt-tier-name', selected.name);
    setText('rcpt-tier-cost', `-${fmtUSD(tierCost)}`);
    setText('rcpt-net', `${net >= 0 ? '+' : '-'}${fmtUSD(Math.abs(net))}`);
    updateBriefSync(selected, tierCost);
  }

  function updateBriefSync(selected, tierCost) {
    const chipText = document.getElementById('brief-sync-text');
    const hiddenBrief = document.getElementById('af-brief-hidden');
    if (!chipText && !hiddenBrief) return;
    const tasks = Array.from(clearedSet).map((i) => bottlenecks[i].title);
    const taskNote = tasks.length ? `${tasks.length} task${tasks.length > 1 ? 's' : ''} (${tasks.slice(0, 3).join(', ')}${tasks.length > 3 ? '…' : ''})` : `${state.hours} hrs/wk modeled`;
    const summary = `${selected.name} (${fmtUSD(tierCost)}${selected.unit}, ${state.billing}) • ${taskNote} • ~${fmtUSD(state.grossMonthly)}/mo founder time modeled`;
    if (chipText) {
      chipText.innerHTML = `<strong>Auto-attached role brief:</strong> ${selected.name} (${state.billing}) &bull; ${taskNote}`;
    }
    if (hiddenBrief) {
      hiddenBrief.value = `${summary}${tasks.length ? ` | All selected tasks: ${tasks.join('; ')}` : ''}`;
    }
  }

  /* ------------------------------------------------------------------------
     12a. INTERACTIVE DAY 1–30 LAUNCH PLAYBOOK TABS
     ------------------------------------------------------------------------ */
  const playbookData = [
    {
      we: 'Cheyne reviews your backlog, defines clear day-one responsibilities, sets tool access boundaries, and builds the role scorecard before we screen a single candidate.',
      you: 'One 15-minute alignment call (or a short Loom/email) showing what keeps landing back on your plate each week.',
      out: 'A written 1-page Role Plan & 30-day delegation sequence—confirmed before you ever pay a dollar.',
    },
    {
      we: 'We run our 4-signal screen—written judgment, live US-client tone, real workflow scenario tests, and founder review—filtering 100+ applicants down to 2–3 finalists.',
      you: 'Meet your top 2–3 pre-vetted finalists in concise 20-minute calls and choose who feels natural with your team.',
      out: 'A clean shortlist with scored test samples and timezone overlap confirmed—zero resume floods.',
    },
    {
      we: 'We kick off your partner inside your tools with least-privilege access, establish an 8:00 AM priority check-in + 5:00 PM wrap digest, and stay on standby for fast calibration.',
      you: 'Share your top recurring tasks and give quick 2-minute async feedback on their first few drafts.',
      out: 'Immediate inbox, CRM, or backlog relief in Week 2 plus clean living SOPs started from Day 1.',
    },
    {
      we: 'We run a 30-day founder review checking response speed, error rate, and documentation depth—expanding their owned workflows cleanly as trust compounds.',
      you: 'Reclaim 15–30+ hours every single week for sales, leadership, and unplugged evenings while operations run smoothly.',
      out: 'An embedded long-term Filipino partner backed by our ongoing support and free replacement guarantee.',
    },
  ];

  const pbTabs = document.querySelectorAll('[data-playbook]');
  pbTabs.forEach((tab) => {
    tab.addEventListener('click', () => {
      const idx = Number(tab.dataset.playbook) || 0;
      const item = playbookData[idx];
      if (!item) return;
      pbTabs.forEach((t) => {
        const active = t === tab;
        t.classList.toggle('is-active', active);
        t.setAttribute('aria-selected', String(active));
      });
      const elWe = document.getElementById('pb-we');
      const elYou = document.getElementById('pb-you');
      const elOut = document.getElementById('pb-out');
      if (elWe) elWe.textContent = item.we;
      if (elYou) elYou.textContent = item.you;
      if (elOut) elOut.textContent = item.out;
    });
  });

  // Live session timer + date on receipt
  const sessionStart = Date.now();
  const dateEl = document.getElementById('rcpt-date');
  if (dateEl) {
    const d = new Date();
    dateEl.textContent = d.toLocaleDateString('en-US', { day: '2-digit', month: 'short' }).toUpperCase();
  }
  setInterval(() => {
    const sec = Math.floor((Date.now() - sessionStart) / 1000);
    const m = String(Math.floor(sec / 60)).padStart(2, '0');
    const s = String(sec % 60).padStart(2, '0');
    const el = document.getElementById('rcpt-time');
    if (el) el.textContent = `${m}:${s}`;
  }, 1000);

  // Download custom role brief (.txt)
  document.getElementById('download-brief')?.addEventListener('click', () => {
    const selected = tiers[state.tier];
    const tierCost = state.billing === 'quarterly' ? selected.quarterly : selected.monthly;
    const delegatedList = Array.from(clearedSet)
      .map((i) => `- ${bottlenecks[i].title} (${bottlenecks[i].hrs} hrs/wk)`)
      .join('\n');

    const brief = [
      'AGENTIC FILIPINO — FOUNDER ROLE BRIEF',
      '=====================================',
      `Selected Tier: ${selected.name} (${fmtUSD(tierCost)}${selected.unit}, ${state.billing})`,
      `Modeled Weekly Founder Hours Reclaimed: ${state.hours} hrs/wk @ ${fmtUSD(state.rate)}/hr`,
      `Modeled Monthly Time Value: ${fmtUSD(state.grossMonthly)}`,
      '',
      'Tasks Selected for Delegation:',
      delegatedList || '- (Select tasks in the Bottleneck Graveyard or share your workflow in our inquiry form)',
      '',
      'Next Step:',
      'Email sales@agenticfilipino.com or book a call at https://calendly.com/cheynecasino/new-meeting',
      'Scope and availability are confirmed before payment.',
    ].join('\n');

    const blob = new Blob([brief], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'agentic-filipino-role-brief.txt';
    document.body.appendChild(a);
    a.click();
    a.remove();
    setTimeout(() => URL.revokeObjectURL(url), 1000);
  });

  /* ------------------------------------------------------------------------
     13. FIRST-TOUCH ATTRIBUTION + MOBILE STICKY CTA + FORMSUBMIT ENGINE
     ------------------------------------------------------------------------ */
  const getAttribution = () => {
    const key = 'af_attrib_v1';
    try {
      const existing = JSON.parse(sessionStorage.getItem(key) || 'null');
      const params = new URLSearchParams(location.search);
      const fresh = {
        utm_source: params.get('utm_source') || '',
        utm_medium: params.get('utm_medium') || '',
        utm_campaign: params.get('utm_campaign') || '',
        utm_content: params.get('utm_content') || '',
        utm_term: params.get('utm_term') || '',
        gclid: params.get('gclid') || '',
        landing_page: location.pathname + location.search,
        referrer: document.referrer || 'direct',
      };
      if (!existing) {
        sessionStorage.setItem(key, JSON.stringify(fresh));
        return fresh;
      }
      if (fresh.gclid || fresh.utm_source || fresh.utm_campaign) {
        const merged = { ...existing, ...Object.fromEntries(Object.entries(fresh).filter(([, v]) => Boolean(v))) };
        sessionStorage.setItem(key, JSON.stringify(merged));
        return merged;
      }
      return existing;
    } catch {
      return { landing_page: location.pathname, referrer: document.referrer || 'direct' };
    }
  };
  getAttribution();

  /* Mobile Sticky CTA Bar (glides in after hero, hides on #contact & #footer) */
  if (!document.querySelector('.af-mobile-sticky')) {
    const stickyBar = document.createElement('div');
    stickyBar.className = 'af-mobile-sticky';
    stickyBar.setAttribute('aria-label', 'Quick hiring actions');
    stickyBar.innerHTML =
      '<a class="af-mobile-sticky__primary" href="#contact">Free role plan →</a><a class="af-mobile-sticky__secondary" href="https://calendly.com/cheynecasino/new-meeting" target="_blank" rel="noopener noreferrer">Book call</a>';
    document.body.append(stickyBar);

    let blocked = false;
    const syncSticky = () => {
      stickyBar.classList.toggle('is-visible', window.scrollY > 560 && !blocked);
    };
    window.addEventListener('scroll', syncSticky, { passive: true });
    if ('IntersectionObserver' in window) {
      const vis = new Set();
      const targets = [document.getElementById('contact'), document.getElementById('footer')].filter(Boolean);
      const io = new IntersectionObserver(
        (entries) => {
          entries.forEach((e) => {
            if (e.isIntersecting) vis.add(e.target);
            else vis.delete(e.target);
          });
          blocked = vis.size > 0;
          syncSticky();
        },
        { threshold: 0.08 }
      );
      targets.forEach((t) => io.observe(t));
    }
  }

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

  const leadForm = document.getElementById('lead-form');
  const leadSubmit = document.getElementById('lead-submit');
  const formFeedback = document.getElementById('form-feedback');

  leadForm?.addEventListener('submit', async (event) => {
    event.preventDefault();
    if (!leadSubmit || leadSubmit.disabled) return;
    if (!leadForm.reportValidity()) return;

    const initialHTML = leadSubmit.innerHTML;
    leadSubmit.disabled = true;
    leadSubmit.textContent = 'Sending request…';
    if (formFeedback) formFeedback.hidden = true;

    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 15000);

    try {
      const formData = new FormData(leadForm);
      const attrib = getAttribution();
      if (attrib.utm_source) formData.set('attribution_source', attrib.utm_source);
      if (attrib.utm_medium) formData.set('attribution_medium', attrib.utm_medium);
      if (attrib.utm_campaign) formData.set('attribution_campaign', attrib.utm_campaign);
      if (attrib.utm_term) formData.set('attribution_term', attrib.utm_term);
      if (attrib.gclid) formData.set('attribution_gclid', attrib.gclid);
      if (attrib.landing_page) formData.set('first_landing_page', attrib.landing_page);
      formData.set('submitted_page', location.pathname);
      if (attrib.referrer) formData.set('first_referrer', attrib.referrer);

      const response = await fetch(leadForm.action, {
        method: 'POST',
        body: formData,
        headers: { Accept: 'application/json' },
        signal: controller.signal,
      });
      const data = await response.json();
      if (!response.ok || !(data.success === true || data.success === 'true')) {
        throw new Error('Unconfirmed response');
      }

      const message =
        'Request received. Cheyne will review your bottleneck and follow up within 24–48 hours with a practical role plan.';
      leadForm.reset();
      if (formFeedback) {
        formFeedback.dataset.state = 'success';
        formFeedback.textContent = message;
        formFeedback.hidden = false;
      }
      showToast(message);

      if (production && typeof window.gtag === 'function') {
        window.gtag('event', 'generate_lead', { send_to: analyticsId, form_id: 'lead-form' });
        window.gtag('event', 'conversion', { send_to: 'AW-18276066095/0rvrCPW-qsYcEK_G2opE' });
      }
    } catch {
      if (formFeedback) {
        formFeedback.dataset.state = 'error';
        formFeedback.textContent =
          'We could not confirm your submission right now. Your details are still here — please retry or email sales@agenticfilipino.com.';
        formFeedback.hidden = false;
      }
    } finally {
      clearTimeout(timeout);
      leadSubmit.disabled = false;
      leadSubmit.innerHTML = initialHTML;
    }
  });

  // Initial state render
  updateForecast();
  renderPricing();
  updateFlowText();
  updateScrollUI();
})();
