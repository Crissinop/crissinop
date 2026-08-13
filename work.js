/* work.js — Cris Del Ninno · project detail pages
   Principle: the page is fully usable with zero JS. Everything here is enhancement. */

(function () {
  'use strict';

  // ---- Navbar scroll state ----
  var navbar = document.getElementById('navbar');
  if (navbar) {
    window.addEventListener('scroll', function () {
      navbar.classList.toggle('scrolled', window.scrollY > 60);
    }, { passive: true });
  }

  // ---- Missing-image handling (graceful placeholder for not-yet-added screenshots) ----
  function markMissing(img) {
    var fig = img.closest('.shot') || img.closest('.proj-shot');
    if (!fig) { img.style.visibility = 'hidden'; return; }
    fig.classList.add('missing');
    if (!fig.hasAttribute('data-path')) fig.setAttribute('data-path', img.getAttribute('src') || '');
  }
  document.querySelectorAll('.shot img, .proj-shot img').forEach(function (img) {
    if (img.complete && img.naturalWidth === 0) markMissing(img);
    img.addEventListener('error', function () { markMissing(img); });
  });

  // ---- Lightbox ----
  var lb = document.getElementById('lightbox');
  if (lb) {
    var lbImg = lb.querySelector('img');
    function open(src, alt) { lbImg.src = src; lbImg.alt = alt || ''; lb.classList.add('open'); document.body.style.overflow = 'hidden'; }
    function close() { lb.classList.remove('open'); document.body.style.overflow = ''; lbImg.src = ''; }
    document.querySelectorAll('.gallery .shot').forEach(function (fig) {
      fig.addEventListener('click', function () {
        if (fig.classList.contains('missing')) return;
        var img = fig.querySelector('img');
        if (img) open(img.currentSrc || img.src, img.alt);
      });
    });
    lb.addEventListener('click', function (e) { if (e.target === lb || e.target.classList.contains('lightbox-close')) close(); });
    document.addEventListener('keydown', function (e) { if (e.key === 'Escape') close(); });
  }

  // ---- Custom cursor (reuse the shell's implementation if present) ----
  if (typeof initCursor === 'function') { try { initCursor(); } catch (e) {} }

  // ---- Reveal animations (enhancement only) ----
  var reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  if (reduced || typeof gsap === 'undefined') return; // content already visible

  if (typeof ScrollTrigger !== 'undefined') gsap.registerPlugin(ScrollTrigger);

  // Hero entrance
  var heroBits = ['.proj-eyebrow', '.proj-title', '.proj-tagline', '.proj-meta', '.stack-pills']
    .map(function (s) { return document.querySelector(s); })
    .filter(Boolean);
  gsap.from(heroBits, { opacity: 0, y: 24, duration: .7, stagger: .1, ease: 'power3.out', delay: .1 });

  var shot = document.querySelector('.proj-shot');
  if (shot) gsap.from(shot, { opacity: 0, y: 30, duration: .8, ease: 'power3.out', delay: .35 });

  // Scroll-triggered sections
  if (typeof ScrollTrigger !== 'undefined') {
    gsap.utils.toArray('.proj-section').forEach(function (sec) {
      gsap.from(sec, {
        opacity: 0, y: 30, duration: .7, ease: 'power2.out',
        scrollTrigger: { trigger: sec, start: 'top 82%', once: true }
      });
    });
    gsap.utils.toArray('.gallery .shot').forEach(function (fig, i) {
      gsap.from(fig, {
        opacity: 0, y: 30, duration: .6, ease: 'power2.out', delay: (i % 2) * .08,
        scrollTrigger: { trigger: fig, start: 'top 88%', once: true }
      });
    });
  }
})();
