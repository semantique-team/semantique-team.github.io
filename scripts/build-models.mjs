#!/usr/bin/env node
/*
 * Models build pipeline for the Semantique site.
 *
 *   content/models/<slug>.md  →  public/models/index.html   (the model gallery)
 *
 * Each model is a Markdown file with a frontmatter block:
 *
 *   ---
 *   name: ANT-4B
 *   slug: ant-4b
 *   tagline: One line
 *   summary: One paragraph, shown in the gallery.
 *   backbone: Qwen3.5-4B
 *   parameters: 4.2B
 *   trainable: 2632704
 *   checkpoint: ant-4b-2026-10-24
 *   licence: Apache-2.0
 *   status: Work in progress
 *   repo: https://github.com/semantique-team/ant-4b
 *   article: /articles/building-ant-4b-and-ant-08b.html
 *   test_accuracy: 0.739
 *   ood_accuracy: 0.597
 *   test_ece: 0.056
 *   ood_ece: 0.123
 *   latency: 372 ms warm, 14 tokens, M3
 *   order: 1
 *   ---
 *
 * The body is the longer description of the model, shown under the summary.
 *
 * A family can override the shared `_layout.html` with
 * `_layout-<family_slug>.html`; every frontmatter field is available to that
 * layout as `{{field}}`.
 *
 * A model with `status: Coming soon` is not given a page of its own. Its family
 * layout can place a release-pending card with `{{upcoming}}`, rendered from the
 * same frontmatter and body.
 *
 * Runs automatically before `npm run dev` and `npm run build` (see package.json).
 */

import { mkdir, readdir, readFile, writeFile } from 'node:fs/promises'
import path from 'node:path'
import { fileURLToPath } from 'node:url'
import { marked } from 'marked'

const root = path.resolve(fileURLToPath(new URL('..', import.meta.url)))
const sourceDir = path.join(root, 'content', 'models')
const outDir = path.join(root, 'public', 'models')
const PLAYGROUND = 'https://github.com/semantique-team/playground'

main().catch((error) => {
  console.error('[models] build failed')
  console.error(error)
  process.exitCode = 1
})

async function main() {
  const files = (await readdir(sourceDir))
    .filter((name) => name.endsWith('.md') && !name.startsWith('_'))
    .sort()

  const defaultLayout = await readFile(path.join(sourceDir, '_layout.html'), 'utf8')
  const indexLayout = await readFile(path.join(sourceDir, '_index.html'), 'utf8')

  await mkdir(outDir, { recursive: true })

  const models = []
  for (const file of files) {
    const raw = await readFile(path.join(sourceDir, file), 'utf8')
    const { data, body } = parseFrontmatter(raw)
    models.push({
      slug: data.slug || file.replace(/\.md$/, ''),
      name: data.name || data.slug || file,
      tagline: data.tagline || '',
      summary: data.summary || '',
      body: marked.parse(body, { gfm: true }).trim(),
      backbone: data.backbone || '',
      parameters: data.parameters || '',
      trainable: data.trainable || '',
      checkpoint: data.checkpoint || '',
      licence: data.licence || '',
      status: data.status || '',
      repo: data.repo || '',
      article: data.article || '',
      latency: data.latency || '',
      testAccuracy: Number(data.test_accuracy || 0),
      oodAccuracy: Number(data.ood_accuracy || 0),
      testEce: Number(data.test_ece || 0),
      oodEce: Number(data.ood_ece || 0),
      order: Number(data.order || 99),
      family: data.family || 'ANT',
      familySlug: data.family_slug || 'ant',
      familySummary: data.family_summary || '',
      type: data.type || 'decision',
      raw: data,
    })
  }

  models.sort((a, b) => a.order - b.order)

  // One page per family: /models/<family>/ holds the full family detail.
  const families = new Map()
  for (const model of models) {
    if (!families.has(model.familySlug)) families.set(model.familySlug, [])
    families.get(model.familySlug).push(model)
  }

  for (const [slug, members] of families) {
    const familyLayout = await readFamilyLayout(slug, defaultLayout)
    const published = members.filter((model) => !/coming soon/i.test(model.status))
    const primary = published[0] || members[0]
    const page = fill(familyLayout, {
      tabs: published.map((model, index) => renderTab(model, index)).join('\n          '),
      panels: published
        .map((model, index) => renderPanel(model, index, published))
        .join('\n          '),
      model_count: String(members.length),
      family_name: primary.family,
      body: primary.body,
      ...Object.fromEntries(
        Object.entries(primary.raw).map(([key, value]) => [key, escapeHtml(value)]),
      ),
      upcoming: renderUpcoming(members),
    })
    await mkdir(path.join(outDir, slug), { recursive: true })
    await writeFile(path.join(outDir, slug, 'index.html'), page, 'utf8')
  }

  // The directory at /models/: one row per family, filtered by family type.
  const familiesByType = new Map()
  for (const [, members] of families) {
    const type = members[0].type
    if (!familiesByType.has(type)) familiesByType.set(type, [])
    familiesByType.get(type).push(members)
  }
  const cardsFor = (type) =>
    (familiesByType.get(type) || []).map((members) => renderCard(members)).join('\n          ')

  await writeFile(
    path.join(outDir, 'index.html'),
    fill(indexLayout, { cards: cardsFor('decision'), stt_cards: cardsFor('stt') }),
    'utf8',
  )

  console.log(
    `[models] built ${models.length} model(s) in ${families.size} famil(y/ies) → /models/ and /models/<family>/`,
  )
}

async function readFamilyLayout(slug, fallback) {
  try {
    return await readFile(path.join(sourceDir, `_layout-${slug}.html`), 'utf8')
  } catch (error) {
    if (error.code === 'ENOENT') return fallback
    throw error
  }
}

/* ------------------------------------------------------------------ steps */

function renderCard(members) {
  const first = members[0]
  const typeLabels = { decision: 'Decision models', stt: 'Speech-to-text models' }
  const typeLabel = typeLabels[first.type] || `${first.type.toUpperCase()} models`
  const names = members.map((model) => {
    const label = escapeHtml(model.name)
    return /coming soon/i.test(model.status)
      ? `${label} <span class="badge">Coming soon</span>`
      : label
  })
  const list =
    names.length > 1 ? `${names.slice(0, -1).join(', ')} and ${names.at(-1)}` : names[0]
  const summary = members.find((model) => model.familySummary)?.familySummary || ''

  return `<a class="family-card" href="/models/${first.familySlug}/">
            <div class="family-card-head">
              <span class="family-card-type" data-reveal>${escapeHtml(typeLabel)}</span>
              <h2 class="family-card-name" data-reveal style="--reveal-delay: 60ms">${escapeHtml(first.family)} family</h2>
              <p class="family-card-members" data-reveal style="--reveal-delay: 120ms">${list}</p>
            </div>
            <div class="family-card-body">
              <p class="family-card-summary" data-reveal style="--reveal-delay: 180ms">${escapeHtml(summary)}</p>
              <span class="family-card-cta" data-reveal style="--reveal-delay: 240ms">Open the ${escapeHtml(first.family)} family <span aria-hidden="true">→</span></span>
            </div>
          </a>`
}

function renderTab(model, index) {
  const active = index === 0 ? ' is-active' : ''
  const selected = index === 0 ? 'true' : 'false'
  return `<button
            class="tab${active}"
            type="button"
            role="tab"
            id="tab-${model.slug}"
            aria-controls="panel-${model.slug}"
            aria-selected="${selected}"
            data-model="${model.slug}"
          >
            ${escapeHtml(model.name)}
          </button>`
}

function renderPanel(model, index, all) {
  const other = all.find((m) => m.slug !== model.slug)
  const active = index === 0 ? ' is-active' : ''

  const specs = [
    ['Backbone', model.backbone],
    ['Parameters', model.parameters],
    ['Trainable head', model.trainable ? `${model.trainable} parameters` : ''],
    ['Checkpoint', model.checkpoint],
    ['Licence', model.licence],
    ['Status', model.status],
    ['Warm latency', model.latency],
  ].filter(([, value]) => value)

  const comparison = other
    ? `<p class="metric-compare">
        ${escapeHtml(other.name)} on the same splits: ${other.testAccuracy.toFixed(3)}
        test, ${other.oodAccuracy.toFixed(3)} out-of-distribution.
      </p>`
    : ''

  return `<div
            class="model-panel${active}"
            role="tabpanel"
            id="panel-${model.slug}"
            aria-labelledby="tab-${model.slug}"
            data-model="${model.slug}"
          >
            <div class="panel-copy">
              <h3 class="panel-name">
                ${escapeHtml(model.name)}
                <span class="panel-tagline">${escapeHtml(model.tagline)}</span>
              </h3>
              <p class="panel-summary">${escapeHtml(model.summary)}</p>
              <div class="panel-body">${model.body}</div>
              <p class="panel-links">
                <a class="text-link" href="${model.repo}">Repository</a>
                <a class="text-link" href="${model.article}">Build log</a>
                <a class="text-link" href="${PLAYGROUND}">Playground</a>
              </p>
            </div>
            <div class="panel-side">
              <dl class="spec-list">
${specs.map(([label, value]) => `                <div class="spec"><dt>${escapeHtml(label)}</dt><dd>${escapeHtml(value)}</dd></div>`).join('\n')}
              </dl>
              <div class="metrics">
                ${metric('Test accuracy, 648 rows', model.testAccuracy)}
                ${metric('Out-of-distribution, 456 rows', model.oodAccuracy)}
                <p class="metric-note">
                  Calibration error: ${model.testEce.toFixed(3)} on the test split,
                  ${model.oodEce.toFixed(3)} out of distribution.
                </p>
                ${comparison}
              </div>
            </div>
          </div>`
}

/* --------------------------------------------------------- upcoming model */

function renderUpcoming(members) {
  const upcoming = members.find((model) => /coming soon/i.test(model.status))
  if (!upcoming) return ''

  const specs = [
    ['Package', upcoming.raw.package],
    ['Status', upcoming.status],
    ['Release', upcoming.raw.release],
  ].filter(([, value]) => value)

  return `<div class="upcoming" data-reveal>
            <div class="upcoming-copy">
              <h3 class="upcoming-name">
                ${escapeHtml(upcoming.name)}
                <span class="badge">${escapeHtml(upcoming.status)}</span>
              </h3>
              <p class="upcoming-tagline">${escapeHtml(upcoming.tagline)}</p>
              <p class="upcoming-summary">${escapeHtml(upcoming.summary)}</p>
              <div class="upcoming-body">${upcoming.body}</div>
            </div>
            <div class="upcoming-side">
              <dl class="spec-list">
${specs.map(([label, value]) => `                <div class="spec"><dt>${escapeHtml(label)}</dt><dd>${escapeHtml(value)}</dd></div>`).join('\n')}
              </dl>
            </div>
          </div>`
}

function metric(label, value) {
  return `<div class="metric">
                  <div class="metric-head">
                    <span class="metric-name">${escapeHtml(label)}</span>
                    <span class="metric-value">${value.toFixed(3)}</span>
                  </div>
                  <div class="metric-track"><span class="metric-fill" style="width: ${(value * 100).toFixed(1)}%"></span></div>
                </div>`
}

/* ----------------------------------------------------------------- helpers */

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

function fill(template, vars) {
  return template.replace(/\{\{(\w+)\}\}/g, (match, key) =>
    key in vars ? String(vars[key]) : match,
  )
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
