/* gsap-animations.js — Cris Del Ninno Portfolio */

function initAnimations() {
  // Register GSAP plugins
  gsap.registerPlugin(ScrollTrigger);

  const prefersReduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  if (prefersReduced) return;

  // ---- Hero entrance sequence ----
  const heroTl = gsap.timeline({ defaults: { ease: 'power3.out' } });
  heroTl
    .to('.hero-eyebrow', { opacity: 1, y: 0, duration: 0.8, delay: 0.3 })
    .to('.hero-name',    { opacity: 1, y: 0, duration: 1,   }, '-=0.4')
    .to('.hero-pills',   { opacity: 1, y: 0, duration: 0.7, }, '-=0.5')
    .to('.explore-btn',  { opacity: 1, y: 0, duration: 0.6, }, '-=0.4')
    .to('.scroll-hint',  { opacity: 1,       duration: 0.8, }, '-=0.2');

  // Set initial states for hero elements
  gsap.set(['.hero-eyebrow', '.hero-name', '.hero-pills', '.explore-btn'], {
    y: 30, opacity: 0
  });
  gsap.set('.scroll-hint', { opacity: 0 });

  // ---- Hero parallax on scroll ----
  ScrollTrigger.create({
    trigger: '#hero',
    start: 'top top',
    end: 'bottom top',
    scrub: 1.5,
    onUpdate: (self) => {
      const p = self.progress;
      gsap.set('.hero-name',    { y: p * 80, opacity: 1 - p * 1.5 });
      gsap.set('.hero-bg-glow', { scale: 1 + p * 0.3 });
      gsap.set('.hero-grid',    { opacity: 1 - p * 2 });
    }
  });

  // ---- Work section reveal ----
  gsap.set(['.section-label', '.section-title', '.filter-bar'], { opacity: 0, y: 20 });
  ScrollTrigger.batch(['.section-label', '.section-title', '.filter-bar'], {
    start: 'top 85%',
    onEnter: (els) => gsap.to(els, { opacity: 1, y: 0, duration: 0.7, stagger: 0.15, ease: 'power2.out' }),
    once: true
  });

  // ---- Project cards stagger reveal ----
  function revealCards(cards) {
    gsap.fromTo(cards,
      { opacity: 0, y: 40 },
      { opacity: 1, y: 0, duration: 0.7, stagger: 0.08, ease: 'power2.out',
        scrollTrigger: { trigger: '.projects-grid', start: 'top 80%', once: true }
      }
    );
  }
  revealCards(gsap.utils.toArray('.project-card'));

  // ---- About section ----
  gsap.set('.about-name', { opacity: 0, x: -30 });
  gsap.set('.about-bio',  { opacity: 0, x: -20 });
  gsap.set('.about-tags', { opacity: 0, y: 15 });
  gsap.set('.about-right',{ opacity: 0, x: 30 });

  ScrollTrigger.create({
    trigger: '#about',
    start: 'top 75%',
    once: true,
    onEnter: () => {
      const tl = gsap.timeline({ defaults: { ease: 'power3.out' } });
      tl.to('.about-name',  { opacity: 1, x: 0, duration: 0.9 })
        .to('.about-bio',   { opacity: 1, x: 0, duration: 0.7 }, '-=0.5')
        .to('.about-tags',  { opacity: 1, y: 0,  duration: 0.6 }, '-=0.4')
        .to('.about-right', { opacity: 1, x: 0,  duration: 0.9 }, '-=0.7');
    }
  });

  // ---- Contact section ----
  gsap.set(['.contact-title', '.contact-sub', '.contact-email', '.social-links'], {
    opacity: 0, y: 25
  });
  ScrollTrigger.create({
    trigger: '#contact',
    start: 'top 80%',
    once: true,
    onEnter: () => {
      gsap.to(['.contact-title', '.contact-sub', '.contact-email', '.social-links'], {
        opacity: 1, y: 0, duration: 0.8, stagger: 0.15, ease: 'power2.out'
      });
    }
  });

  // ---- Stat numbers counter ----
  ScrollTrigger.create({
    trigger: '.about-stats',
    start: 'top 80%',
    once: true,
    onEnter: () => {
      document.querySelectorAll('.stat-num[data-count]').forEach(el => {
        const target = parseInt(el.dataset.count);
        const suffix = el.dataset.suffix || '';
        gsap.fromTo({ val: 0 }, { val: target },
          { duration: 1.5, ease: 'power2.out',
            onUpdate: function() { el.textContent = Math.round(this.targets()[0].val) + suffix; }
          }
        );
      });
    }
  });
}

// ---- Filter Logic with GSAP ----
function initFilters() {
  const filterBtns = document.querySelectorAll('.filter-btn');
  const cards = document.querySelectorAll('.project-card');

  filterBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      // Update active state
      filterBtns.forEach(b => b.classList.remove('active'));
      btn.classList.add('active');

      const filter = btn.dataset.filter;

      // Animate out all
      gsap.to(Array.from(cards).filter(c => !c.classList.contains('hidden')), {
        opacity: 0, scale: 0.95, duration: 0.25, stagger: 0.04, ease: 'power2.in',
        onComplete: () => {
          // Show/hide
          cards.forEach(card => {
            const match = filter === 'ALL' || card.dataset.cat === filter;
            card.classList.toggle('hidden', !match);
          });
          // Animate in visible
          const visible = Array.from(cards).filter(c => !c.classList.contains('hidden'));
          gsap.fromTo(visible,
            { opacity: 0, scale: 0.95, y: 20 },
            { opacity: 1, scale: 1, y: 0, duration: 0.5, stagger: 0.06, ease: 'power2.out' }
          );
        }
      });
    });
  });
}

// ---- Custom Cursor ----
function initCursor() {
  if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
  if ('ontouchstart' in window) return;

  const cursor = document.getElementById('cursor');
  const trail  = document.getElementById('cursor-trail');
  if (!cursor || !trail) return;

  let mx = 0, my = 0, tx = 0, ty = 0;

  document.addEventListener('mousemove', e => {
    mx = e.clientX; my = e.clientY;
    gsap.to(cursor, { x: mx, y: my, duration: 0.1 });
  });

  // Trail with slight lag
  gsap.ticker.add(() => {
    tx += (mx - tx) * 0.12;
    ty += (my - ty) * 0.12;
    gsap.set(trail, { x: tx, y: ty });
  });

  document.addEventListener('mouseleave', () => {
    gsap.to([cursor, trail], { opacity: 0, duration: 0.3 });
  });
  document.addEventListener('mouseenter', () => {
    gsap.to([cursor, trail], { opacity: 1, duration: 0.3 });
  });
}
