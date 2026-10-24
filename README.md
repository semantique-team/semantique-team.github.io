# Semantique

The source for the Semantique landing page, built with React, TypeScript, and Vite.

## Local development

```sh
npm install
npm run dev
```

Create a production build with `npm run build` and preview it with `npm run preview`.

The GitHub Actions workflow deploys the `main` branch to GitHub Pages.

## Articles

Articles live in `content/articles/` as Markdown with a small frontmatter block:

```md
---
title: What are System 1 models?
summary: One or two sentences shown in the article lists.
date: 2026-10-16
---

The article body, in plain Markdown. End with a `## Sources` list.
```

Then run `npm run articles`. From the Markdown alone it regenerates:

- `public/articles/<slug>.html` — the article page;
- `public/articles/index.html` — the list of every article, served at `/articles/`;
- `src/articles.generated.ts` — the manifest read by the landing page.

The landing links to and shows only the **newest** article; the dedicated page at
`/articles/` lists them all.

Every article shares one layout (`content/articles/_layout.html`) and one
stylesheet (`public/articles/article.css`), so headings, bold text, lists and the
trailing `## Sources` section are styled once and inherited everywhere. There is
no per-article HTML to maintain.

`npm run dev` and `npm run build` run the generator automatically, so adding a
Markdown file is usually all you need to do.

## Models

The model gallery at `/models/` is generated the same way, from `content/models/`:

```md
---
name: ANT-4B
slug: ant-4b
tagline: One line under the name.
summary: One paragraph, shown in the gallery.
backbone: Qwen3.5-4B
parameters: 4.2B
trainable: 2632704
checkpoint: ant-4b-2026-10-24
licence: Apache-2.0
status: Work in progress
repo: https://github.com/semantique-team/ant-4b
article: /articles/building-ant-4b-and-ant-08b.html
test_accuracy: 0.739
ood_accuracy: 0.597
test_ece: 0.056
ood_ece: 0.123
latency: 372 ms warm, 14 tokens, M3
order: 1
---

The longer description of the model.
```

`npm run models` writes `public/models/index.html` from that Markdown plus the
layout in `content/models/_layout.html`. The gallery is styled by
`public/models/models.css` and behaves with `public/models/models.js`: the model
switcher, the section entrances and the diagram caption. Without JavaScript the
page still shows every model, one after the other.

The numbers come from the model repositories themselves (`runs/*/metrics.json`
in `semantique-team/ant-4b` and `semantique-team/ant-08b`); the charts and the
playground screenshot are copied into `public/img/`.
