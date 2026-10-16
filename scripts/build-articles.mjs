#!/usr/bin/env node
/*
 * Article build pipeline for the Semantique site.
 *
 *   content/articles/<slug>.md   →  public/articles/<slug>.html
 *   content/articles/*.md        →  public/articles/index.html   (all articles)
 *   content/articles/*.md        →  src/articles.generated.ts    (latest article
 *                                   and the index, consumed by the landing page)
 *
 * Articles are plain Markdown with a small frontmatter block:
 *
 *   ---
 *   title: What are System 1 models?
 *   summary: One or two sentences shown in listings.
 *   date: 2026-10-16
 *   eyebrow: Notes from the lab        # optional
 *   ---
 *
 * Files whose name starts with "_" are treated as layouts, not articles.
 *
 * A "## Sources" heading is detected and wrapped in <section class="sources">
 * so its list inherits the shared numbered style. Everything else — headings,
 * bold, lists, the Sources section — is styled once in
 * public/articles/article.css, so every article looks identical.
 *
 * Runs automatically before `npm run dev` and `npm run build` (see package.json).
 */

import { mkdir, readdir, readFile, writeFile } from 'node:fs/promises'
import path from 'node:path'
import { fileURLToPath } from 'node:url'
import { marked } from 'marked'

const root = path.resolve(fileURLToPath(new URL('..', import.meta.url)))
const sourceDir = path.join(root, 'content', 'articles')
const outDir = path.join(root, 'public', 'articles')
const manifestFile = path.join(root, 'src', 'articles.generated.ts')

const MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec']
const DEFAULT_EYEBROW = 'Notes from the lab'
const WORDS_PER_MINUTE = 220
const ARROW_SVG =
  '<svg aria-hidden="true" viewBox="0 0 16 16" fill="none"><path d="M3.25 8h9.5M8.5 3.75 12.75 8 8.5 12.25"/></svg>'

main().catch((error) => {
  console.error('[articles] build failed')
  console.error(error)
  process.exitCode = 1
})

async function main() {
  const files = (await readdir(sourceDir))
    .filter((name) => name.endsWith('.md') && !name.startsWith('_'))
    .sort()

  const layout = await readFile(path.join(sourceDir, '_layout.html'), 'utf8')
  const indexLayout = await readFile(path.join(sourceDir, '_index-layout.html'), 'utf8')

  await mkdir(outDir, { recursive: true })

  const articles = []

  for (const file of files) {
    const raw = await readFile(path.join(sourceDir, file), 'utf8')
    const { data, body } = parseFrontmatter(raw)

    const slug = data.slug || file.replace(/\.md$/, '')
    const title = data.title || slug
    const content = wrapSources(await marked.parse(body, { gfm: true }))

    const page = fill(layout, {
      title: escapeAttribute(title),
      description: escapeAttribute(data.summary || title),
      eyebrow: escapeHtml(data.eyebrow || DEFAULT_EYEBROW),
      heading: escapeHtml(title),
      date: formatDate(data.date),
      readingMinutes: String(estimateReadingMinutes(body)),
      content,
    })

    await writeFile(path.join(outDir, `${slug}.html`), page, 'utf8')

    articles.push({
      slug,
      title,
      summary: data.summary || '',
      date: data.date || '',
      displayDate: formatDate(data.date),
      readingMinutes: estimateReadingMinutes(body),
      href: `/articles/${slug}.html`,
    })
  }

  articles.sort(byNewestFirst)

  await writeFile(
    path.join(outDir, 'index.html'),
    fill(indexLayout, { items: renderIndexItems(articles) }),
    'utf8',
  )
  await writeFile(manifestFile, renderManifest(articles), 'utf8')

  console.log(
    `[articles] built ${articles.length} article(s) → public/articles/ and src/articles.generated.ts`,
  )
}

/* ------------------------------------------------------------------ steps */

function parseFrontmatter(raw) {
  const match = raw.match(/^---\r?\n([\s\S]*?)\r?\n---[ \t]*\r?\n?/)
  if (!match) {
    return { data: {}, body: raw }
  }

  const data = {}
  for (const line of match[1].split(/\r?\n/)) {
    const separator = line.indexOf(':')
    if (separator === -1) continue

    const key = line.slice(0, separator).trim()
    let value = line.slice(separator + 1).trim()
    if (isQuoted(value)) {
      value = value.slice(1, -1)
    }
    if (key) {
      data[key] = value
    }
  }

  return { data, body: raw.slice(match[0].length) }
}

/** Wrap the trailing "## Sources" section so the shared numbered style applies. */
function wrapSources(html) {
  const match = html.match(/<h2[^>]*>\s*Sources\s*<\/h2>/i)
  if (!match) return html
  return `${html.slice(0, match.index)}<section class="sources">${html.slice(match.index)}</section>`
}

function renderIndexItems(articles) {
  if (articles.length === 0) {
    return '        <p class="index-empty">No articles yet.</p>'
  }

  return articles
    .map(
      (article) => `        <a class="index-item" href="${article.href}">
          <span class="index-item-head">
            <span class="index-item-title">${escapeHtml(article.title)}</span>
            <span class="index-item-date">${article.displayDate}</span>
          </span>
          <span class="index-item-summary">${escapeHtml(article.summary)}</span>
          <span class="index-item-more">${article.readingMinutes} min read ${ARROW_SVG}</span>
        </a>`,
    )
    .join('\n')
}

function renderManifest(articles) {
  const entries = articles
    .map(
      (article) => `  {
    slug: ${quote(article.slug)},
    title: ${quote(article.title)},
    summary: ${quote(article.summary)},
    date: ${quote(article.date)},
    displayDate: ${quote(article.displayDate)},
    readingMinutes: ${article.readingMinutes},
    href: ${quote(article.href)},
  },`,
    )
    .join('\n')

  return `// AUTO-GENERATED by scripts/build-articles.mjs — do not edit by hand.
// Source of truth: content/articles/*.md

export type Article = {
  slug: string
  title: string
  summary: string
  /** Publication date, ISO (YYYY-MM-DD). */
  date: string
  /** Human-readable date, e.g. "16 Oct 2026". */
  displayDate: string
  readingMinutes: number
  /** Public path, e.g. "/articles/system-one-models.html". */
  href: string
}

/** Published articles, newest first. Consumed by the landing page. */
export const articles: Article[] = [
${entries}
]
`
}

/* ----------------------------------------------------------------- helpers */

function fill(template, vars) {
  return template.replace(/\{\{(\w+)\}\}/g, (match, key) =>
    key in vars ? String(vars[key]) : match,
  )
}

function byNewestFirst(a, b) {
  if (a.date !== b.date) return a.date < b.date ? 1 : -1
  return a.title.localeCompare(b.title)
}

function formatDate(iso) {
  const match = /^(\d{4})-(\d{2})-(\d{2})$/.exec(iso || '')
  if (!match) return iso || ''

  const [, year, month, day] = match
  return `${Number(day)} ${MONTHS[Number(month) - 1] ?? month} ${year}`
}

function estimateReadingMinutes(markdown) {
  const words = markdown
    .replace(/```[\s\S]*?```/g, ' ')
    .replace(/`[^`]*`/g, ' ')
    .replace(/[#>*_~[\]()!|-]/g, ' ')
    .split(/\s+/)
    .filter(Boolean).length

  return Math.max(1, Math.round(words / WORDS_PER_MINUTE))
}

function isQuoted(value) {
  return (
    value.length > 1 &&
    ((value.startsWith('"') && value.endsWith('"')) || (value.startsWith("'") && value.endsWith("'")))
  )
}

function escapeHtml(value) {
  return String(value).replaceAll('&', '&amp;').replaceAll('<', '&lt;').replaceAll('>', '&gt;')
}

function escapeAttribute(value) {
  return escapeHtml(value).replaceAll('"', '&quot;')
}

function quote(value) {
  return JSON.stringify(String(value))
}
