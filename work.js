/* =============================================================================
   work.js — project case-study pages
   Loads alongside app.js (which handles reveals, navbar and cursor).
   This file owns only the gallery lightbox and missing-image handling.
   ============================================================================= */

(() => {
  'use strict';

  const reduce = () => matchMedia('(prefers-reduced-motion: reduce)').matches;

  /* ---------------------------------------------------------------------------
     Missing screenshots degrade to a labelled placeholder instead of a broken
     image icon, and stop being clickable.
     ------------------------------------------------------------------------- */
  const markMissing = (img) => {
    const fig = img.closest('.shot, .proj-shot');
    if (!fig) { img.style.visibility = 'hidden'; return; }
    fig.classList.add('missing');
  };

  document.querySelectorAll('.shot img, .proj-shot img').forEach((img) => {
    if (img.complete && img.naturalWidth === 0) markMissing(img);
    img.addEventListener('error', () => markMissing(img), { once: true });
  });

  /* ---------------------------------------------------------------------------
     Lightbox
     ------------------------------------------------------------------------- */
  const lb = document.getElementById('lightbox');
  if (!lb) return;

  const lbImg     = lb.querySelector('img');
  const lbCaption = lb.querySelector('.lightbox-text');
  const lbCount   = lb.querySelector('.lightbox-count');
  const btnClose  = lb.querySelector('.lightbox-close');
  const btnPrev   = lb.querySelector('.lightbox-nav.prev');
  const btnNext   = lb.querySelector('.lightbox-nav.next');

  const items = [...document.querySelectorAll('.gallery .shot')]
    .filter((fig) => !fig.classList.contains('missing'))
    .map((fig) => ({
      trigger: fig.querySelector('.shot-btn'),
      src:     fig.querySelector('img')?.currentSrc || fig.querySelector('img')?.src || '',
      alt:     fig.querySelector('img')?.alt || '',
      caption: fig.querySelector('figcaption')?.textContent.trim() || ''
    }))
    .filter((it) => it.trigger && it.src);

  if (!items.length) { lb.remove(); return; }

  let index = 0;
  let lastFocused = null;

  const show = (i) => {
    index = (i + items.length) % items.length;
    const it = items[index];
    lbImg.src = it.src;
    lbImg.alt = it.alt;
    if (lbCaption) lbCaption.textContent = it.caption;
    if (lbCount)   lbCount.textContent = `${index + 1} / ${items.length}`;
  };

  /* Hiding the scrollbar shifts the whole page left by its width. Compensating
     with padding keeps the layout perfectly still. */
  const lockScroll = () => {
    const gap = innerWidth - document.documentElement.clientWidth;
    document.body.style.overflow = 'hidden';
    if (gap > 0) document.body.style.paddingRight = `${gap}px`;
  };
  const unlockScroll = () => {
    document.body.style.overflow = '';
    document.body.style.paddingRight = '';
  };

  const open = (i) => {
    lastFocused = document.activeElement;
    show(i);
    lb.classList.add('open');
    lb.removeAttribute('aria-hidden');
    lockScroll();
    btnClose?.focus();
  };

  const close = () => {
    lb.classList.remove('open');
    lb.setAttribute('aria-hidden', 'true');
    unlockScroll();
    lastFocused?.focus?.();

    /* Clear the source only once the fade-out has finished, so the image does
       not vanish mid-transition. transitionend instead of a magic setTimeout
       that has to be kept in sync with the CSS by hand. */
    const clear = () => { if (!lb.classList.contains('open')) { lbImg.src = ''; lbImg.alt = ''; } };
    if (reduce()) clear();
    else lb.addEventListener('transitionend', clear, { once: true });
  };

  items.forEach((it, i) => it.trigger.addEventListener('click', () => open(i)));

  lb.addEventListener('click', (e) => { if (e.target === lb) close(); });
  btnClose?.addEventListener('click', close);
  btnPrev?.addEventListener('click', () => show(index - 1));
  btnNext?.addEventListener('click', () => show(index + 1));

  /* Single dialog with a known, tiny set of focusables — an explicit cycle is
     clearer and cheaper here than a generic focus-trap query. */
  const focusables = [btnPrev, btnNext, btnClose].filter(Boolean);

  document.addEventListener('keydown', (e) => {
    if (!lb.classList.contains('open')) return;

    if (e.key === 'Escape')     { e.preventDefault(); close(); return; }
    if (e.key === 'ArrowLeft')  { e.preventDefault(); show(index - 1); return; }
    if (e.key === 'ArrowRight') { e.preventDefault(); show(index + 1); return; }

    if (e.key === 'Tab' && focusables.length) {
      const first = focusables[0];
      const last  = focusables[focusables.length - 1];
      if (e.shiftKey && document.activeElement === first) { e.preventDefault(); last.focus(); }
      else if (!e.shiftKey && document.activeElement === last) { e.preventDefault(); first.focus(); }
    }
  });

  if (items.length < 2) { btnPrev?.remove(); btnNext?.remove(); if (lbCount) lbCount.hidden = true; }
})();
