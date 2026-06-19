# Outbuild Lab

Marketing site for **Outbuild Lab** — an AI-native product studio. We design and
build with AI at full power, and bring the taste and judgment that turn model
output into products people trust.

🔗 **Live:** [outbuildlab.com](https://outbuildlab.com)

---

## Stack

- **[Astro 5](https://astro.build)** + TypeScript — static-first, ships almost no
  framework runtime
- **[GSAP](https://gsap.com)** (+ ScrollTrigger, SplitText) — the motion layer
- **[Lenis](https://lenis.darkroom.engineering)** — smooth scrolling
- **[Three.js](https://threejs.org)** — the particle-ring "O" hero
- **[@astrojs/netlify](https://docs.astro.build/en/guides/integrations-guide/netlify/)**
  — adapter so the one on-demand route can ship as a serverless function
- No CSS framework — hand-written `src/styles/global.css` with CSS custom
  properties for theming (dark + light)

## Getting started

```bash
npm install
npm run dev      # http://localhost:4321
```

| Command           | Action                                      |
| ----------------- | ------------------------------------------- |
| `npm run dev`     | Start the dev server                        |
| `npm run build`   | Production build to `dist/`                  |
| `npm run preview` | Preview the production build locally        |

## Project structure

```
src/
  components/      Header, Footer, modal, home sections, case mockups, the Lab planner
  data/            services.ts, work.ts (case studies — single source of truth)
  layouts/         Base.astro (shared <head>, theme bootstrap, OG tags)
  lib/             buildPlan.ts (the Lab's plan generator)
  pages/           index + studio/services/work/lab/founding/contact
                   work/[slug].astro  → per-product case studies
                   api/build-plan.ts  → the one server route (everything else is static)
  scripts/app.js   site-wide experience layer (GSAP/Lenis/Three, guarded per-page)
  styles/          global.css
scripts/build-og.mjs   regenerates public/og.png
public/                og.png and static assets
legacy/                the original vanilla HTML/CSS/JS version, archived for reference
```

## The Lab — "napkin → build plan"

`/lab` (and the homepage teaser) take a one-line product idea and return a build
plan — scope, stack, day-by-day timeline, risks. It runs through
`src/pages/api/build-plan.ts`:

- If `ANTHROPIC_API_KEY` is set, it asks **Claude** for the plan.
- Otherwise (or if the call fails) it falls back to the local heuristic
  generator in `src/lib/buildPlan.ts`, so the demo always works — even on a
  static deploy with no key.

To enable the real-model path in production, add `ANTHROPIC_API_KEY` to the
Netlify site's environment variables.

## Deploy

Connected to **Netlify** — every push to `main` triggers a build. The site is
static-first; only `/api/build-plan` (marked `prerender = false`) ships as a
serverless function via the Netlify adapter.

## Social image

`public/og.png` (1200×630) is generated from a script:

```bash
node scripts/build-og.mjs
```

Edit `scripts/build-og.mjs` and re-run after any brand change.

## License

See [LICENSE](LICENSE).
