/* =============================================================================
   app.js — Crissinop
   -----------------------------------------------------------------------------
   ~6 KB, zero dependencies. Everything here is enhancement: if this file fails to
   download, parse or run, the page stays fully readable and navigable.
   ============================================================================= */

(() => {
  'use strict';

  const root     = document.documentElement;
  const mqReduce = matchMedia('(prefers-reduced-motion: reduce)');
  const mqFine   = matchMedia('(hover: hover) and (pointer: fine)');
  const reduce   = () => mqReduce.matches;

  /* Tells the <head> watchdog enhancement is alive, so it keeps the `.js` class
     instead of stripping it and forcing everything visible. */
  root.dataset.enhanced = '1';

  /* ---------------------------------------------------------------------------
     1. REVEALS  ([data-reveal] fades and rises, [data-slot] climbs out of a slot)
     ------------------------------------------------------------------------- */
  const revealables = document.querySelectorAll('[data-reveal], [data-slot]');

  if (reduce() || !('IntersectionObserver' in window)) {
    revealables.forEach((el) => el.classList.add('is-in'));
  } else {
    const io = new IntersectionObserver((entries, obs) => {
      for (const entry of entries) {
        if (!entry.isIntersecting) continue;
        entry.target.classList.add('is-in');
        obs.unobserve(entry.target);      /* fires once — re-animating on every
                                             scroll-by is an interface fighting
                                             its own reader */
      }
    }, { rootMargin: '0px 0px -10% 0px', threshold: 0.05 });

    revealables.forEach((el) => {
      /* Stagger siblings inside a [data-reveal-group]. Written once at setup, so
         there is no per-frame style recalculation. */
      const group = el.closest('[data-reveal-group]');
      if (group) {
        const i = [...group.querySelectorAll('[data-reveal]')].indexOf(el);
        if (i > 0) el.style.setProperty('--reveal-delay', `${Math.min(i, 6) * 55}ms`);
      }
      io.observe(el);
    });
  }

  /* ---------------------------------------------------------------------------
     2. NAVBAR
     ------------------------------------------------------------------------- */
  const navbar     = document.getElementById('navbar');
  const scrollHint = document.querySelector('.scroll-hint');

  if (navbar) {
    let ticking = false;
    const onScroll = () => {
      if (ticking) return;
      ticking = true;
      requestAnimationFrame(() => {
        navbar.classList.toggle('scrolled', scrollY > 40);
        if (scrollHint) scrollHint.dataset.hidden = scrollY > 120 ? 'true' : 'false';
        ticking = false;
      });
    };
    addEventListener('scroll', onScroll, { passive: true });
    onScroll();
  }

  const navLinks = [...document.querySelectorAll('.nav-links a[href^="#"]')];
  const sections = navLinks.map((a) => document.querySelector(a.getAttribute('href'))).filter(Boolean);

  if (sections.length && 'IntersectionObserver' in window) {
    const spy = new IntersectionObserver((entries) => {
      /* Take the entry nearest the top of the viewport rather than the last to
         fire, or fast scrolling lights up the wrong link. */
      const visible = entries
        .filter((e) => e.isIntersecting)
        .sort((a, b) => a.boundingClientRect.top - b.boundingClientRect.top)[0];
      if (!visible) return;
      navLinks.forEach((a) => {
        if (a.getAttribute('href') === `#${visible.target.id}`) a.setAttribute('aria-current', 'true');
        else a.removeAttribute('aria-current');
      });
    }, { rootMargin: '-45% 0px -45% 0px' });
    sections.forEach((s) => spy.observe(s));
  }

  /* Anchor clicks must move keyboard focus too, or keyboard and screen-reader
     users scroll visually while focus stays behind in the navbar. */
  document.addEventListener('click', (e) => {
    const link = e.target.closest('a[href^="#"]');
    if (!link) return;
    const id = link.getAttribute('href');
    if (id.length < 2) return;
    const target = document.querySelector(id);
    if (!target) return;
    e.preventDefault();
    target.scrollIntoView({ behavior: reduce() ? 'auto' : 'smooth', block: 'start' });
    target.setAttribute('tabindex', '-1');
    target.focus({ preventScroll: true });
    history.replaceState(null, '', id);
  });

  /* ---------------------------------------------------------------------------
     3. PROJECT FILTER
     ------------------------------------------------------------------------- */
  const filterBar = document.querySelector('.filter-bar');
  const grid      = document.getElementById('projects-grid');

  if (filterBar && grid) {
    const buttons = [...filterBar.querySelectorAll('.filter-btn')];
    const cards   = [...grid.querySelectorAll('.project-card')];
    const status  = document.getElementById('filter-status');
    const empty   = grid.querySelector('.empty-state');
    let generation = 0;

    const commit = (value) => {
      let shown = 0;
      cards.forEach((card) => {
        const on = value === 'ALL' || card.dataset.cat === value;
        card.classList.toggle('is-hidden', !on);
        if (on) shown++;
      });
      if (empty) empty.hidden = shown > 0;
      if (status) status.textContent = shown === 1 ? '1 project shown' : `${shown} projects shown`;
    };

    /* Fallback for browsers without View Transitions. Transitions, not keyframes,
       so a second click mid-flight retargets instead of restarting from zero. */
    const softFade = (value) => {
      const gen = ++generation;
      cards.filter((c) => !c.classList.contains('is-hidden'))
           .forEach((c) => { c.style.transition = 'opacity 110ms linear'; c.style.opacity = '0'; });

      setTimeout(() => {
        if (gen !== generation) return;
        commit(value);
        const incoming = cards.filter((c) => !c.classList.contains('is-hidden'));
        incoming.forEach((c) => { c.style.transition = 'none'; c.style.opacity = '0'; });
        void grid.offsetHeight;                        /* flush so the fade-in plays */
        incoming.forEach((c, i) => {
          c.style.transition = `opacity 220ms var(--ease-out) ${Math.min(i, 5) * 40}ms`;
          c.style.opacity = '1';
        });
        setTimeout(() => {
          if (gen !== generation) return;
          cards.forEach((c) => { c.style.transition = ''; c.style.opacity = ''; });
        }, 500);
      }, 110);
    };

    const apply = (value, { animate = true } = {}) => {
      buttons.forEach((b) => b.setAttribute('aria-pressed', String(b.dataset.filter === value)));
      if (!animate || reduce()) { commit(value); return; }

      if (typeof document.startViewTransition === 'function') {
        /* Names live only for the duration of the transition — leaving them on
           would also capture the cards during page-to-page navigation. The
           generation check stops an aborted run's cleanup from stripping the
           names the next one just set. */
        const gen = ++generation;
        cards.forEach((c, i) => { c.style.viewTransitionName = `card-${i}`; });
        const t = document.startViewTransition(() => commit(value));
        t.finished.catch(() => {}).finally(() => {
          if (gen !== generation) return;
          cards.forEach((c) => { c.style.viewTransitionName = ''; });
        });
      } else {
        softFade(value);
      }
    };

    filterBar.addEventListener('click', (e) => {
      const btn = e.target.closest('.filter-btn');
      if (!btn || btn.getAttribute('aria-pressed') === 'true') return;
      apply(btn.dataset.filter);
      const url = new URL(location.href);
      if (btn.dataset.filter === 'ALL') url.searchParams.delete('filter');
      else url.searchParams.set('filter', btn.dataset.filter.toLowerCase());
      history.replaceState(null, '', url);
    });

    /* Deep-linkable: /?filter=apps opens already filtered, so the view is shareable. */
    const initial = (new URL(location.href).searchParams.get('filter') || 'ALL').toUpperCase();
    if (buttons.some((b) => b.dataset.filter === initial)) apply(initial, { animate: false });
  }

  /* ---------------------------------------------------------------------------
     4. STAT COUNTERS
     ------------------------------------------------------------------------- */
  const counters = [...document.querySelectorAll('.stat-num[data-count]')];
  if (counters.length) {
    if (reduce() || !('IntersectionObserver' in window)) {
      counters.forEach((el) => { el.textContent = el.dataset.count + (el.dataset.suffix || ''); });
    } else {
      const countUp = (el) => {
        const target = Number(el.dataset.count) || 0;
        const suffix = el.dataset.suffix || '';
        const t0 = performance.now();
        const step = (now) => {
          const p = Math.min((now - t0) / 1100, 1);
          const eased = p === 1 ? 1 : 1 - Math.pow(2, -10 * p);   /* easeOutExpo */
          el.textContent = Math.round(target * eased) + suffix;
          if (p < 1) requestAnimationFrame(step);
        };
        requestAnimationFrame(step);
      };
      const co = new IntersectionObserver((entries, obs) => {
        for (const e of entries) {
          if (!e.isIntersecting) continue;
          countUp(e.target);
          obs.unobserve(e.target);
        }
      }, { threshold: 0.4 });
      counters.forEach((el) => co.observe(el));
    }
  }

  /* ---------------------------------------------------------------------------
     5. CURSOR — one sphere, one transform
     -----------------------------------------------------------------------------
     Position is written straight from the pointer with no easing, because a
     custom cursor that trails the real one reads as lag, not as style. The only
     state is a scale over interactive targets, and it is guarded by a
     changed-target check: the class is touched only when the resolved target
     actually differs, so no hover instability anywhere on the page can make it
     strobe.
     ------------------------------------------------------------------------- */
  const initCursor = () => {
    const dot = document.getElementById('cursor');
    if (!dot) return;

    root.classList.add('cursor-on');
    let seen = false, lastHot = null;

    addEventListener('pointermove', (e) => {
      if (e.pointerType !== 'mouse') return;
      dot.style.transform = `translate3d(${e.clientX}px, ${e.clientY}px, 0)`;
      if (!seen) { seen = true; root.classList.add('cursor-ready'); }

      const hot = e.target instanceof Element
        ? e.target.closest('a, button, [role="button"], .project-card')
        : null;
      if (hot !== lastHot) {
        root.classList.toggle('cursor-hot', !!hot);
        lastHot = hot;
      }
    }, { passive: true });

    /* Leaving the document clears everything, so nothing can be left latched. */
    document.addEventListener('mouseleave', () => {
      root.classList.remove('cursor-ready', 'cursor-hot');
      lastHot = null;
    });
    document.addEventListener('mouseenter', () => { if (seen) root.classList.add('cursor-ready'); });
  };

  /* ---------------------------------------------------------------------------
     6. MASTHEAD DECK — 3D tilt
     -----------------------------------------------------------------------------
     Decorative pointer tracking, which is exactly where a lerp beats a direct
     binding: raw pointer position feels mechanical because it carries no inertia.
     The deck already holds a rest rotation in CSS; this modulates around it and
     settles back to it when the pointer leaves.

     The transform is written onto the deck itself. Driving it from a custom
     property on a shared parent would inherit into every letter and depth layer
     and force a style recalculation across all of them on each frame.
     ------------------------------------------------------------------------- */
  const initDeck = () => {
    const hero = document.getElementById('hero');
    const deck = document.querySelector('.deck');
    const glow = document.querySelector('.hero-bg-glow');
    if (!hero || !deck) return;

    const BASE_X = 7, BASE_Y = -11;      /* must match the CSS rest pose */

    /* Two different rates, and that asymmetry is the point.
       Following the pointer has to be quick (0.07) or the slab feels disconnected
       from the hand. Returning to rest has no hand behind it, so the same rate
       reads as a snap — the object recoiling rather than coasting. Dropping to
       0.018 makes the return a long settle: the slab keeps drifting for about a
       second after the pointer has gone, then stops. Slow where nothing is
       driving, fast where the user is. */
    const FOLLOW = 0.07, SETTLE = 0.035;
    let tx = 0, ty = 0, cx = 0, cy = 0, live = false, k = FOLLOW;

    const loop = () => {
      cx += (tx - cx) * k;
      cy += (ty - cy) * k;

      deck.style.transform =
        `rotateX(${(BASE_X - cy * 13).toFixed(3)}deg) rotateY(${(BASE_Y + cx * 20).toFixed(3)}deg)`;
      if (glow) glow.style.transform = `translate3d(${(cx * 28).toFixed(2)}px, ${(cy * 28).toFixed(2)}px, 0)`;

      /* 0.003 of normalised travel is about 0.06deg of rotation — below anything
         the eye can resolve. Stopping there ends the invisible tail instead of
         spending another two seconds of frames on it. */
      if (Math.abs(tx - cx) < 0.003 && Math.abs(ty - cy) < 0.003) { live = false; return; }
      requestAnimationFrame(loop);
    };
    const kick = () => { if (!live) { live = true; requestAnimationFrame(loop); } };

    hero.addEventListener('pointermove', (e) => {
      if (e.pointerType !== 'mouse') return;
      k  = FOLLOW;
      tx = e.clientX / innerWidth  - 0.5;
      ty = e.clientY / innerHeight - 0.5;
      kick();
    }, { passive: true });

    /* Drift back to the rest pose instead of snapping to it. */
    hero.addEventListener('pointerleave', () => { k = SETTLE; tx = 0; ty = 0; kick(); }, { passive: true });
  };

  if (mqFine.matches && !reduce()) {
    initCursor();
    initDeck();
  }
})();
