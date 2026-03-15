# Cris Del Ninno — Portfolio 2026

Cyberpunk-minimal portfolio. Dark theme, GSAP animations, neon accents.

## Stack
- HTML5 + Tailwind CSS 3.4 (CDN, JIT)
- GSAP 3.12 + ScrollTrigger
- Vanilla JS (zero framework overhead)
- Google Fonts: Space Grotesk + DM Mono

## File Structure
```
index.html          ← Main page
style-custom.css    ← Neon vars, layout, animations CSS
gsap-animations.js  ← GSAP ScrollTrigger, hero parallax, stagger reveals
projects.js         ← 12 project entries (cat/img/title/desc/url)
README.md
```

## Deploy (30 seconds)

### Vercel
```bash
npx vercel --prod
```

### Netlify
Drag-and-drop the folder at app.netlify.com/drop

### GitHub Pages
Push to `main`, enable Pages from Settings → Pages → Deploy from branch.

## Customize

### Add/Edit projects
Edit `projects.js` — each object:
```js
{
  id: 1,
  cat: 'VIDEO',          // VIDEO | AI | VFX | MOTION
  img: 'https://...',    // 800px wide, 16:9
  title: 'Project Name',
  desc: 'Short description',
  url: 'https://...'
}
```

### Colors
In `style-custom.css`, edit `:root`:
```css
--neon: #00d4ff;   /* Main accent */
```

### Name / Bio
In `index.html` search for "Cris Del Ninno" and "about-bio".

### Social links
In `index.html` `#contact` section — update `href` attributes.

### Email
Update `href="mailto:cris@delninno.com"` and the visible text.

## Performance targets
- LCP: < 1s (fonts preloaded, images lazy)
- Lighthouse: 95+ Performance, 100 Accessibility
- Bundle: < 50KB HTML+CSS+JS (excluding CDN GSAP ~80KB gzipped)

## Accessibility
- ARIA live region on projects grid
- ARIA pressed state on filter buttons
- Keyboard navigable (tab order preserved)
- `@prefers-reduced-motion` disables all animations & custom cursor
- Semantic HTML5 landmarks (nav, main, section, article)
