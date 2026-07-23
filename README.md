# PoliGraph

A satirical political self-test that measures the **authoritarian instinct** — the readiness to use state force against other people — across six axes, then shows which historical figures and movements your answers align with. Built for live "take the test" videos.

**It's the point, not a bug, that both tribes score.** Every axis has left-baited and right-baited items; the roster spans fascists, communists, theocrats, hate movements on both wings, and civil libertarians. The quiz doesn't tell you what to think about immigration or abortion — it shows you when you've reached for the same coercive machinery you condemn in your enemies.

## Run it

Pure static site — no build, no dependencies, no backend. Any static host (GitHub Pages) serves it directly.

```bash
python -m http.server 8000   # then open http://localhost:8000
```

## How it works

- `index.html` — shell; loads the four scripts in order.
- `js/data.js` — the six axes, the question bank (principle + sourced-quote items), and the alignment roster with axis fingerprints. **Edit content here; no logic changes needed.**
- `js/scoring.js` — pure scoring, nearest-neighbour alignment matching, tier + contradiction detection.
- `js/views.js` — bar / 2D radar / 3D octahedron (orthographic, drag to rotate) / PNG result card.
- `js/app.js` — intro → pre-test → quiz (no back) → results (views, answer replay with quote unmask, alignment + historical dossier, "what this regime would take from you").

## Short vs long test

The intro offers a **24-question quick test** (4 balanced items per axis, listed in `CORE_IDS` in `app.js`) and a **72-question long test** (the whole bank, ~12 per axis) for a sharper score. The results page nudges quick-test takers toward the long version to "dial in" their score. Scoring only counts questions the taker actually saw, so the two modes are directly comparable. To move an item in or out of the quick test, edit `CORE_IDS`.

## Content rules (don't skip)

- **Every quote ships with a real, cited source.** Most viral political quotes are fabricated; one fake attribution discredits the whole thing. No source = cut it.
- **Keep axes symmetric.** For every right-baited item add a left-baited mirror. The `bait` field on each question exists so this stays auditable.
- **Alignment is mechanism-based, never identity-based.** Matches come only from the coercive axes a taker endorsed.

## Deploying updates

Assets are referenced with a `?v=N` query in `index.html` to defeat GitHub Pages' CDN/browser caching. **After changing any JS/CSS, bump every `?v=N` in `index.html`** (e.g. `?v=2` → `?v=3`) so returning visitors get the new code instead of a stale cached copy.

## Nothing is stored

No login, no analytics, no server. Answers live in memory and vanish on refresh. The result card is generated client-side and only saved if the taker clicks download.
