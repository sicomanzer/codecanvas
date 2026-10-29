# CodeCanvas

A fast, browser-based HTML / CSS / JavaScript playground with live preview, a real console, starter templates and shareable links. Built with Next.js 15, React 19, TypeScript, Tailwind CSS v4 and CodeMirror 6.

**Live demo:** https://codecanvas-html.vercel.app _(update this line after deploying)_

## Features

- **Three languages, instant feedback** — edit HTML, CSS and JavaScript and watch the preview refresh as you type.
- **Real browser preview** — sandboxed `<iframe>` with desktop, tablet and mobile viewport presets.
- **Console panel** — `console.log`, warnings, errors and uncaught exceptions from the preview, bridged with `postMessage`.
- **Multiple files** — add HTML, CSS, JS, JSON, Markdown or text files, rename them and choose the preview entry file.
- **Starter templates** — landing page, dashboard, todo app, canvas animation, form and a 404 page.
- **Import** — split a standalone HTML file into editable HTML, CSS and JS files.
- **Autosave** — the current project is restored from `localStorage`; named copies live in **Saved playgrounds**.
- **Share by link** — the whole project is LZ-compressed into the URL fragment. No backend, database or account required.
- **Download** — export a single self-contained `.html` file with CSS and JS inlined.
- **Formatting** — Prettier for HTML, CSS, JS, JSON and Markdown.
- **Themes and settings** — dark/light themes, font size, tab size, word wrap, auto-run and keyboard shortcuts.
- **Accessible and responsive** — keyboard navigation, focus states and a mobile editor/preview switch.

## Getting started

Requirements: Node.js 20+ and npm.

```bash
npm install
npm run dev
```

Open <http://localhost:3000>.

### Scripts

| Command             | Description                        |
| ------------------- | ---------------------------------- |
| `npm run dev`       | Start the development server       |
| `npm run build`     | Create a production build          |
| `npm start`         | Serve the production build         |
| `npm run typecheck` | Run TypeScript without emitting    |

## Project structure

```
app/                  Next.js App Router pages, metadata, manifest, robots, sitemap
components/
  Ide.tsx             Main client app: state, autosave, run, files, share, splitter
  CodeEditor.tsx      CodeMirror 6 setup, themes and language compartments
  Preview.tsx         Sandboxed iframe, viewport toggles and console UI
  TopBar.tsx          Top navigation and primary actions
  dialogs.tsx         Save, share, files, library, templates, settings, shortcuts
  SiteHeader.tsx      Header for documentation pages
lib/
  preview.ts          Document assembly, console bridge and HTML export
  templates.ts        Starter content and template gallery
  storage.ts          localStorage session, settings and library persistence
  share.ts            LZ-string encode/decode and URL hash helpers
  types.ts            Shared types
  site.ts             Canonical site URL
app/globals.css       Design tokens, layout and responsive styles
```

## How sharing works

A share link stores the compressed project in the URL **fragment** (`#p=...`). Fragments are never sent to the server, so there is no storage cost and no privacy leak to the host. Anyone who opens the link gets an editable copy.

Trade-offs:

- Long projects produce long URLs. The share dialog reports the link size and recommends **Download .html** for very large projects.
- Links are snapshots. Later edits are not reflected in links that were already created.
- Browser and chat apps may truncate extremely long URLs.

### Optional: short links with Turso

The current design intentionally has no backend. If you later want permanent short links, add a small API route backed by [Turso](https://turso.tech) (libSQL):

1. `turso db create codecanvas` and `turso db tokens create codecanvas`.
2. Store `TURSO_DATABASE_URL` and `TURSO_AUTH_TOKEN` in Vercel project settings.
3. Add a `POST /api/snippets` route that stores the compressed project under a random id.
4. Change the share dialog to use `https://your-domain/s/<id>` instead of `/#p=...`.

No part of the current app needs to change for that; it is an additive feature.

## Deploying to Vercel

The repository is ready for Vercel with zero configuration.

### Dashboard

1. Push this repository to GitHub.
2. In Vercel, choose **Add New → Project** and import the repository.
3. Keep the detected Next.js defaults and deploy.
4. Add an environment variable `NEXT_PUBLIC_SITE_URL` with the production URL (for example `https://your-project.vercel.app`), then redeploy so canonical URLs, Open Graph metadata, `robots.txt` and `sitemap.xml` use the real domain.

### CLI

```bash
npm i -g vercel
vercel login
vercel          # preview deployment
vercel --prod   # production deployment
```

Set the site URL for production builds:

```bash
vercel env add NEXT_PUBLIC_SITE_URL production
vercel --prod
```

## Environment variables

| Variable               | Required | Description                                      |
| ---------------------- | -------- | ------------------------------------------------ |
| `NEXT_PUBLIC_SITE_URL` | No       | Canonical URL used in metadata, robots and sitemap. Defaults to `http://localhost:3000`. |

Copy `.env.example` to `.env.local` for local development.

## Notes and limitations

- The preview is sandboxed without `allow-same-origin`, so code inside it cannot access the editor, cookies or `localStorage`. Keep demo state in memory.
- This is a plain HTML/CSS/JS playground: there is no bundler or npm install. Load third-party libraries from a CDN with a `<script>` tag.
- Saved playgrounds and the autosaved session are per browser and per device. Clearing site data removes them.
- Share links are self-contained; there is no server-side revision history.

## License

MIT
