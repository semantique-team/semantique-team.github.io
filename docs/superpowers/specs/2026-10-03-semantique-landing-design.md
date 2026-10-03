# Semantique organization landing page

Date: 2026-10-03
Status: Design approved in chat; awaiting written review.

## Goal

Create a public, English-language landing page for the Semantique organization at https://semantique-team.github.io. It should introduce Semantique as a small AI engineering lab, describe its current exploration, introduce its two founders, and leave room for future articles.

## Audience and message

The audience is people discovering the organization and its work. The page should communicate that Semantique is a lab for exploring creative applications of large language models to solve problems. Its current experiment is the creation of System 1 models using open-source models.

The site copy is in English. Do not invent projects, clients, outcomes, or claims beyond the facts above.

## Page structure

The site is a responsive single page with anchor navigation:

1. **Hero** — Semantique wordmark, a concise positioning line, and navigation to Lab, About, and Articles.
2. **Lab** — Explain the lab's purpose and its current work on System 1 models with open-source models.
3. **About** — A small section introducing Roberto Zanolli and Tancredi Bosi, with the LinkedIn links supplied by the user:
   - https://www.linkedin.com/in/roberto-zanolli-2003-bo/
   - https://www.linkedin.com/in/tancredi-bosi-747004298/
4. **Articles** — A deliberately empty section with a brief, restrained empty state. It must be easy to populate later.
5. **Footer** — Organization name and simple in-page navigation.

## Visual direction

Use a dark-first palette and typography inspired by the Vira reference at https://www.vira.build/#core-features: deep charcoal surfaces, muted light text, balanced contrast, generous spacing, and expressive headings. Treat the reference as visual direction only; do not copy its text, assets, or distinctive components.

Use the user-supplied assets: the spider-only mark (favicon.png) as the icon, and the spider plus Semantique wordmark (logo.svg) as the full logo.

Keep the layout restrained and editorial so the organization and its work remain the focus. Support narrow and wide screens and retain readable contrast and keyboard-accessible navigation.

## Technical approach

- Use Vite, React, and TypeScript for a static single-page application.
- Keep the page content in focused React components or data structures, without adding routing or backend services.
- Use a Vite base path suitable for an organization root site at semantique-team.github.io.
- Add a GitHub Actions workflow that builds the application and publishes the generated static output to GitHub Pages.
- Keep article content as an empty, clearly extensible section.

## Out of scope

- Additional routes, a backend, a CMS, analytics, contact forms, or article publishing functionality.
- Claims or biography details not supplied by the user.
- A custom domain or changes to organization-wide GitHub settings.

## Acceptance criteria

- The page is in English and presents only the organization facts supplied above.
- The page contains the Lab, About, and empty Articles sections and the two supplied LinkedIn links.
- The supplied icon and wordmark are used in their intended roles.
- The project uses React and TypeScript and can be built as a static site with Vite.
- A GitHub Actions workflow publishes the built site to the organization root GitHub Pages URL.
- The visual treatment follows the approved Vira-inspired direction while remaining Semantique-branded.
