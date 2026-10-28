# Engineering Handbook

An engineering handbook a small team can adopt as-is: how we onboard, write and review code, ship,
run production and make architecture decisions. Written in Markdown, built into a fast static site
with [Astro 7](https://astro.build) and [Starlight](https://starlight.astro.build).

## Features

- **~18 pages of real content**, ready to adapt:
  - **Onboarding:** first week, dev environment setup, access checklist
  - **Engineering practices:** code review guide, branching and Conventional Commits, testing strategy, API design guidelines (REST, errors, pagination, versioning)
  - **Operations:** on-call guide, incident response runbook with severity levels, postmortem template, deployment checklist, rollback runbook
  - **Architecture:** system overview with a Mermaid diagram, ADR process, two example ADRs
  - **Security:** secrets handling, dependency updates
- Sidebar navigation generated from the content folders
- Full-text search with [Pagefind](https://pagefind.app), indexed at build time (press <kbd>/</kbd>)
- Dark / light / auto theme
- "Edit page" links to GitHub, when `PUBLIC_REPO_URL` is set
- Last-updated date on each page, from Git history
- A helpful 404 page
- A link checker that verifies every internal link and `#anchor` in the built site

## Local development

Requires Node.js 22.23.4 or newer (Astro 7's minimum).

```bash
npm install
cp .env.example .env     # optional: enables edit links
npm run dev              # http://localhost:5111
```

Content lives in `src/content/docs/`. Each folder is a sidebar section; order pages with
`sidebar.order` in the frontmatter. Mermaid diagrams use the `<Mermaid code={...} />` component in
`.mdx` files (see `architecture/system-overview.mdx`).

| Script            | What it does                                                      |
| ----------------- | ----------------------------------------------------------------- |
| `npm run dev`     | Dev server with hot reload on port 5111                           |
| `npm run build`   | Static build into `dist/`, including the Pagefind search index    |
| `npm run preview` | Serves `dist/` locally to check the production build              |
| `npm run check`   | Type-checks the project (`astro check`)                           |
| `npm test`        | Unit tests, plus a link check over `dist/` (**run the build first**) |

## Environment variables

All variables are **optional** and read at **build time**: they're baked into the generated HTML,
so changing them requires a rebuild. There are no runtime variables.

| Name                 | Required | Example                            | Build or runtime | Purpose                                                        |
| -------------------- | -------- | ---------------------------------- | ---------------- | -------------------------------------------------------------- |
| `PUBLIC_REPO_URL`    | No       | `https://github.com/acme/handbook` | Build            | Enables "Edit page" links and the GitHub header icon           |
| `PUBLIC_REPO_BRANCH` | No       | `main` (default)                   | Build            | Branch the edit links point to                                 |
| `PUBLIC_SITE_URL`    | No       | `https://handbook.example.com`     | Build            | Astro `site`: canonical URLs, Open Graph URLs and `sitemap-index.xml` |

Invalid values (for example a URL without `https://`) fail the build with a clear message.

## Deploying

This is a **static site**: there is no server process and no `start` script. Build it, then serve
`dist/` with any static file server or CDN.

- **Install:** `npm ci`
- **Build:** `npm run build` (output: `dist/`)
- **Serve:** any static server pointed at `dist/` (nginx, Caddy, S3 + CDN, GitHub Pages, Netlify...). Locally: `npm run preview`.
- **Port:** whatever your static server listens on. The dev server uses 5111.
- **Env vars:** build time only (see above). Nothing is needed at runtime.
- **Routing:** multi-page output (`/section/page/index.html`). **No SPA fallback**: configure the server to serve `404.html` for unknown paths with a 404 status.
- **Last-updated dates** come from `git log`, so build from a Git checkout with history (a shallow clone shows the date of the latest commit only). Without `.git`, the dates are simply omitted.

Example nginx config:

```nginx
server {
  listen 80;
  root /usr/share/nginx/html;
  location / {
    try_files $uri $uri/ $uri.html =404;
  }
  error_page 404 /404.html;
}
```

## License

MIT
