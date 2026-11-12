# AGENTS.md — Semantique site

Guidance for coding agents working in this repo. Read this before touching any
markup, stylesheet, or content file.

## What this is

The Semantique landing page and its generated sub-sites (articles, model pages),
built with React + TypeScript + Vite. Deployed to GitHub Pages from `main` via
`.github/workflows/deploy.yml`. Everything is static; there is no backend.

## Repo map

| Path | What it is |
| --- | --- |
| `src/App.tsx`, `src/styles.css` | The landing page and its stylesheet |
| `src/articles.generated.ts` | **Generated** article manifest (do not edit) |
| `content/articles/*.md` | Article sources (Markdown + frontmatter) |
| `content/models/*.md` | Model page sources (Markdown + frontmatter) |
| `content/**/_layout*.html`, `_index*.html` | HTML templates for the generators |
| `scripts/build-articles.mjs`, `scripts/build-models.mjs` | The generators |
| `public/articles/article.css` | Single stylesheet for all article pages |
| `public/models/models.css`, `public/models/models.js` | Styles and behaviour for `/models/` |
| `public/img/` | Charts, screenshots and diagrams actually shown on the site |
| `dist/` | Build output (gitignored) |

**Generated files — never hand-edit.** They carry a `GENERATED FILE` banner and
are rewritten from Markdown on every `npm run dev` / `npm run build`:

- `public/articles/<slug>.html`, `public/articles/index.html`, `src/articles.generated.ts`
- `public/models/index.html`, `public/models/<family_slug>/index.html`

To change one of these pages, change its Markdown in `content/`, its template in
`content/**/_layout*.html`, or the shared CSS — then run the generator.

## Commands

```sh
npm install
npm run dev        # regenerates articles + models, then Vite
npm run build      # tsc -b && vite build (regenerates first)
npm run lint       # oxlint
npm run articles   # regenerate article pages only
npm run models     # regenerate model pages only
```

Run `npm run lint` and `npm run build` before committing anything visual.

## Design system

The site is one voice across three surfaces: the landing (`src/styles.css`),
the articles (`public/articles/article.css`) and the model gallery
(`public/models/models.css`). Each surface owns its stylesheet and repeats the
shared tokens locally — there is no shared CSS file. When you add a page or a
section, copy the token block and the rules below; do not invent new values.

### The idea: "the quiet instrument"

A research-lab site that almost whispers. A narrow measure, small exact
demonstrations, generous empty space, and one warm accent used sparingly. The
restraint is the claim. Quiet means *few* things, not *small* things: the
display headline and the demonstrations are large; every screen still carries
real content at readable size in the full ink.

### House rules

Flat fills. One accent. No gradients. No shadows at rest. No hairline rules
between content. Sentence case. Monospace only in real code and in the mono
label style below. Nothing decorative that cannot justify its alignment.

Known exception: the landing's hero panel uses a subtle gradient and a drop
shadow to lift the experiment panel off the page. That is the only sanctioned
exception — do not spread it.

### Colour tokens

Dark "paper and inks" palette. Defined per stylesheet but with these canonical
values (do not introduce new colours):

| Token | Value | Use |
| --- | --- | --- |
| `--page` | `#0c0d0b` | Page ground |
| `--surface` | `#141512` | Cards, panels, stages |
| `--surface-raised` / `--surface-2` | `#191a17` / `#1b1c18` | Raised panels |
| `--line` / `--line-strong` | `#292a25` / `#393a33` | Borders (use sparingly) |
| `--text` | `#f0eee8` | Headings, primary ink |
| `--body` | `#cbc9c0` | Long-form body (articles) |
| `--ink` | `#d6d4cb` | Secondary full ink (models) |
| `--muted` | `#a5a49b` | Supporting copy |
| `--quiet` | `#77796f`–`#9a9a90` | Captions, faint labels |
| `--peach` | `#e7b99c` | **The one accent** |
| `--peach-deep` | `#d3a184` | Accent hover/pressed |
| `--cream` | `#f0debd` | Accent for links/buttons on dark |

The accent fires on exactly one element per screen region: the highlighted word
in the headline (`h1 em`), the primary button, the focus ring, the status dot.
Never colour body paragraphs with it. `::selection` is peach with `#10100e`
text — that dark value is the standard "ink on accent".

`color-scheme: dark` everywhere.

### Typography

Two families, loaded from Google Fonts at the top of each stylesheet:

- **Manrope** (400–800) — everything prose and headings. Fallback
  `'Helvetica Neue', sans-serif`.
- **DM Mono** (400/500) — via `--mono`, for code and the label style below.

Type scale (actual values in use — reuse, don't rescale):

| Role | Size | Weight | Tracking |
| --- | --- | --- | --- |
| Hero `h1` | `clamp(3.65rem, 7.2vw, 6.65rem)` | 600 | `-0.085em`, line-height `0.98` |
| Section `h2` | `clamp(2.6rem, 4.6vw, 4.4rem)` | 600 | `-0.075em` |
| Article `h1` | `clamp(2.6rem, 6vw, 4.2rem)` | 600 | `-0.075em` |
| Lead paragraph | 17px | 400 | — |
| Body | 14–15px | 400 | line-height ~1.8 |
| Hero description | `clamp(15px, 1.4vw, 17px)` | 400 | line-height 1.8 |
| Links / buttons | 13–15px | 700 | — |
| Mono label | 9–10px | 400 | `0.11em`, uppercase |

Hierarchy comes from size, weight and ink-vs-muted colour — never from boxes or
rules. Negative tracking on display sizes only.

### Layout

- Content shell: `--shell: min(1160px, calc(100% - 64px))`, centred via
  `.page-shell`. Steps down to `min(720px, calc(100% - 48px))` at ≤900px and
  `calc(100% - 40px)` at ≤640px.
- Articles use a narrower reading measure: `--measure: 720px` (`.shell`), with
  `.shell--wide` at 880px for figures.
- Sticky site header: 78px tall, `backdrop-filter: blur(18px)` over
  `rgb(12 13 11 / 88%)`, matching `scroll-padding-top: 94px` on `:root`.
- Breakpoints in use: 900px, 640px, 380px. Add no others without a reason.
- Vertical rhythm is generous: 100px+ between sections, and empty space is
  composed — keep column edges exact.

### Components

- **Primary button** (`.button`): peach fill, `#10100e` text, `border-radius: 3px`,
  `min-height: 46px`, `padding: 0 22px`, 15px/700. Hover lightens to `#f1c9ae`;
  active `translateY(1px)`.
- **Text link with arrow** (`.text-link`): 13px/700 in cream or peach, a 16px
  inline SVG arrow (`stroke-width: 1.4`, round caps) that slides `translateX(3px)`
  on hover over `160ms ease`.
- **Mono label** (`.eyebrow`, `.micro-label`, …): DM Mono, uppercase,
  `letter-spacing: 0.11em`, 9–10px, often preceded by a `//` slash glyph in the
  accent or muted ink. Use for section eyebrows and panel labels only.
- **Cards/panels** (`.hero-panel`, `.focus-card`): `--surface` fill, 1px
  `--line` border, `border-radius: 3px`, no shadow at rest.
- **Status dot**: 7px round dot in `#cfb782`, used beside the hero eyebrow.

Icons are always inline SVG strokes inheriting `currentColor` — no icon fonts,
no emoji.

### Motion

Almost still. Only hover transitions (~160ms ease: colour shifts, 3px arrow
slides) and section entrance fades (opt-in via `prefers-reduced-motion:
no-preference`). **Every animation must be disabled under
`prefers-reduced-motion: reduce`** — each stylesheet already has that block;
extend it when you add motion. Never autoplay looping media without a reduced-
motion fallback.

### Accessibility (do not regress)

- `a:focus-visible` / `button:focus-visible`: `2px solid var(--peach)` outline,
  offset 4–5px. Never remove it.
- Skip link (`.skip-link`) to `#main` on every page.
- Images carry meaningful `alt` (decorative ones `alt=""`).
- Body text stays ≥14px in the full ink; muted ink is for supporting copy only.

### Imagery

Precise, not loud: real charts and cropped interface details at column width,
each doing one job. All visual assets shown on the site live in `public/img/`
(charts, playground screenshot, architecture diagram). No stock hero
photography, no decorative illustration.

## Content workflow

**Articles** — `content/articles/<slug>.md` with frontmatter `title`,
`summary`, `date`. End every article with a `## Sources` list. `npm run
articles` regenerates the page, the `/articles/` index and
`src/articles.generated.ts`. The landing shows only the newest article.

**Models** — `content/models/<slug>.md` with the frontmatter documented in
`README.md` (family, tagline, metrics, repo, …). `npm run models` regenerates
the `/models/` directory and one page per family from
`content/models/_layout-<family_slug>.html` or the shared
`content/models/_layout.html`. Metrics come from the model repos' published
artifacts (`runs/*/metrics.json` for ANT; `runs/E-031/MODEL_CARD.md` and
`runs/E-031/release-0.8.1.json` for Moth); never round or invent numbers.

Template changes go in `content/**/_layout*.html`. A family can override the
shared `content/models/_layout.html` with `content/models/_layout-<family_slug>.html`
(Moth uses `_layout-moth.html`); every frontmatter field is available in that
layout as `{{field}}`. That is the intended leverage point.

## Commit style

Conventional commits as in the history: `feat(fe): …`, `fix(fe): …`,
`docs: …`. Keep the working tree clean of generated noise (`dist/`,
`.taste-skill/` are gitignored). Always `git pull` before starting; `main` is
what deploys.
