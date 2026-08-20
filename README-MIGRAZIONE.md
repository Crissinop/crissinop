# Migrazione — sito Cris Del Ninno

## 1. File da sostituire

| File | Azione |
| --- | --- |
| `index.html` | sostituire |
| `style-custom.css` | sostituire |
| `work.css` | sostituire |
| `work.js` | sostituire |
| `work/mnema/index.html` | sostituire |
| `work/margin/index.html` | sostituire |
| `work/neon-breach-echoes/index.html` | sostituire |
| `app.js` | **nuovo** |
| `gsap-animations.js` | **eliminare** |
| `projects.js` | **eliminare** |

Le cartelle `media/` restano invariate: tutti i path referenziati sono identici a prima.

## 2. Dipendenze rimosse

| Prima | Peso | Ora |
| --- | --- | --- |
| `cdn.tailwindcss.com` | ~90 KB JS + compilazione CSS a runtime | rimosso (usava 4 classi utility) |
| `gsap.min.js` | ~45 KB | rimosso |
| `ScrollTrigger.min.js` | ~25 KB | rimosso |
| `projects.js` + render client-side | 1 KB + un tick di JS prima del paint | card statiche in HTML |
| — | — | `app.js`, ~5 KB, zero dipendenze |

JS di terze parti in produzione: **0 byte**. Restano solo i font Google.

## 3. Da completare prima del deploy — bloccanti

1. **Email** — `index.html`, sezione contatti: sostituire `hello@delninno.com` in **due** punti
   (`href="mailto:…"` e `data-copy="…"`). Il build precedente non aveva alcun recapito.
2. **Link Instagram** — puntava a `https://instagram.com/` senza handle. Completare o eliminare l'icona.
3. **`og:image`** — esportare `media/images/og.png` a 1200×630 e confermare il dominio in `CNAME`.
4. **Screenshot mancanti** — le immagini non presenti degradano in un placeholder
   "Screenshot coming soon" e non sono più cliccabili (prima mostravano l'icona di immagine rotta).

## 4. Da completare — non bloccanti

- `work/margin/` e `work/neon-breach-echoes/`: metadati `data-todo` e tagline. La tabella dello
  stack è commentata invece che riempita di trattini — riattivarla quando ci sono i valori reali.
- Statistiche in `#about`: i tre numeri restano quelli precedenti. Verificarli.

## 5. Verifica

```bash
python3 -m http.server 8080     # dalla root del sito
```

| Test | Atteso |
| --- | --- |
| DevTools → Network → Disable JavaScript | pagina completamente leggibile e navigabile |
| Bloccare `app.js` (Network → Block request URL) | dopo 2,5 s tutto visibile (watchdog) |
| DevTools → Rendering → Emulate `prefers-reduced-motion: reduce` | nessun movimento, colori e opacità ancora attivi |
| DevTools → Device toolbar (touch) | descrizione e CTA delle card sempre visibili, nessun cursore custom |
| Tab dall'alto | skip link → nav → filtri → card → lightbox, focus ring sempre visibile |
| Lightbox aperto | `Esc` chiude, `←`/`→` navigano, focus torna alla miniatura, la pagina non si sposta |
| `/?filter=apps` | apre già filtrato |
| Lighthouse mobile | LCP atteso < 1,2 s (prima era vincolato al caricamento della CDN GSAP) |

Le animazioni vanno riviste a 2–5× di durata (DevTools → Animations → 25%) e con occhi
freschi il giorno dopo: il timing è l'unica cosa che non si giudica dal codice.
