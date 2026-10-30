# CodeCanvas

A fast, browser-based HTML / CSS / JavaScript playground with live preview, a real console, starter templates and shareable links. Built with Next.js 15, React 19, TypeScript, Tailwind CSS v4 and CodeMirror 6.

**Live demo:** https://htmlonline.vercel.app

## Features

- **Three languages, instant feedback** — edit HTML, CSS and JavaScript and watch the preview refresh as you type.
- **Real browser preview** — sandboxed `<iframe>` with desktop, tablet and mobile viewport presets.
- **Console panel** — `console.log`, warnings, errors and uncaught exceptions from the preview, bridged with `postMessage`.
- **Multiple files** — add HTML, CSS, JS, JSON, Markdown or text files, rename them and choose the preview entry file.
- **Starter templates** — landing page, dashboard, todo app, canvas animation, form and a 404 page.
- **Import** — split a standalone HTML file into editable HTML, CSS and JS files.
- **Autosave** — the current project is restored from `localStorage`; named copies live in **Saved playgrounds**.
- **Share by link** — send a **short link** (`/s/abc123`) that opens either the editor or a clean full-screen preview. Short links are stored in Vercel Blob; a long, server-free link is one click away if you prefer everything in the URL.
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
app/preview/          Full-screen preview-only share route
app/s/[id]/           Short share links: preview page and /edit redirect
app/api/links/        Creates short links in Vercel Blob
components/
  Ide.tsx             Main client app: state, autosave, run, files, share, splitter
  CodeEditor.tsx      CodeMirror 6 setup, themes and language compartments
  Preview.tsx         Sandboxed iframe, viewport toggles and console UI
  PreviewShare.tsx    Preview-only share page and invalid-link handling
  OpenInEditor.tsx    Loads a short editor link into the playground
  TopBar.tsx          Top navigation and primary actions
  dialogs.tsx         Save, share, files, library, templates, settings, shortcuts
  SiteHeader.tsx      Header for documentation pages
lib/
  preview.ts          Document assembly, console bridge and HTML export
  templates.ts        Starter content and template gallery
  storage.ts          localStorage session, settings and library persistence
  share.ts            LZ-string encode/decode and URL hash helpers
  shortlinks.ts       Content-addressed ids and Vercel Blob storage
  types.ts            Shared types
  site.ts             Canonical site URL
app/globals.css       Design tokens, layout and responsive styles
```

## How sharing works

Two link styles are available in the share dialog.

### Short links (default)

`https://htmlonline.vercel.app/s/abc123defg` — the compressed project is stored in a Vercel Blob store and the URL stays short.

- Ids are **content-addressed**: the same project always produces the same id, so sharing twice never creates duplicates.
- `/s/<id>` renders the entry HTML full screen, without the editor UI.
- `/s/<id>/edit` opens the project in the editor with every file.
- The share dialog falls back to a long link when the store is unreachable, so sharing keeps working.
- Projects larger than ~180 KB compressed are rejected to protect storage.

### Long links

`/#p=...` and `/preview#p=...` carry the compressed project in the URL **fragment**. Fragments are never sent to the server, so these links need no storage and work even if the backend is down.

- **Editor link** (`/#p=...`) — opens the project in CodeCanvas with every file, ready to edit.
- **Preview only** (`/preview#p=...`) — renders the entry HTML full screen without the editor UI.

Trade-offs of long links:

- Long projects produce long URLs. The share dialog reports the link size and recommends **Download .html** for very large projects.
- Browser and chat apps may truncate extremely long URLs.

Both kinds of link are snapshots. Later edits are not reflected in links that were already created.

> Short links are stored on the hosting provider. Anyone with the link can open it, and the payload is readable by the site operator. Use **Download .html** or long links when the code must stay only in the URL.

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
| `BLOB_STORE_ID`        | For short links | Added automatically when a Vercel Blob store is connected to the project. Locally, run `vercel dev` so the blob client can use Vercel OIDC credentials. |

Copy `.env.example` to `.env.local` for local development. Without a connected blob store the app still works: the share dialog reports that short links are unavailable and falls back to the long link.

## Notes and limitations

- The preview is sandboxed without `allow-same-origin`, so code inside it cannot access the editor, cookies or `localStorage`. Keep demo state in memory.
- This is a plain HTML/CSS/JS playground: there is no bundler or npm install. Load third-party libraries from a CDN with a `<script>` tag.
- Saved playgrounds and the autosaved session are per browser and per device. Clearing site data removes them.
- Short links are stored on the server and there is no revision history; long links keep everything in the URL.

## License

MIT
