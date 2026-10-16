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
