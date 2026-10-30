import type { Metadata } from "next";
import Link from "next/link";
import { SiteHeader } from "@/components/SiteHeader";

export const metadata: Metadata = {
  title: "Learn HTML, CSS & JavaScript",
  description:
    "A practical guide to HTML, CSS and JavaScript, plus how the CodeCanvas editor, live preview, console and sharing work.",
  alternates: { canonical: "/learn" },
};

const sections = [
  { id: "getting-started", label: "Getting started" },
  { id: "html", label: "HTML basics" },
  { id: "css", label: "CSS basics" },
  { id: "javascript", label: "JavaScript basics" },
  { id: "preview", label: "Preview & console" },
  { id: "files", label: "Files & imports" },
  { id: "sharing", label: "Save, share & download" },
  { id: "shortcuts", label: "Keyboard shortcuts" },
  { id: "faq", label: "FAQ" },
];

export default function LearnPage() {
  return (
    <div className="doc-shell">
      <SiteHeader />

      <div className="doc-layout">
        <aside className="doc-side" aria-label="On this page">
          <div className="doc-side-title">On this page</div>
          {sections.map((section) => (
            <a key={section.id} href={`#${section.id}`}>
              {section.label}
            </a>
          ))}
        </aside>

        <article className="prose-doc">
          <h1>Learn HTML, CSS &amp; JavaScript</h1>
          <p className="lede">
            A quick, practical guide to building your first page in CodeCanvas —
            from document structure to styles, interactivity and sharing your
            work.
          </p>

          <div className="doc-hero-actions">
            <Link className="btn btn-primary btn-lg" href="/">
              Start coding
            </Link>
            <a className="btn btn-lg" href="#html">
              Read the guide
            </a>
          </div>

          <h2 id="getting-started">Getting started</h2>
          <p>
            CodeCanvas is a browser-based playground for the three languages of
            the web. The editor on the left holds your files and the preview on
            the right renders them instantly. Nothing is installed, and no
            account is required.
          </p>
          <p>Each new playground starts with three files:</p>
          <ul>
            <li>
              <code>index.html</code> — the document that gets rendered.
            </li>
            <li>
              <code>styles.css</code> — the stylesheet, linked from the HTML.
            </li>
            <li>
              <code>scripts.js</code> — the JavaScript, loaded at the end of the
              body.
            </li>
          </ul>
          <div className="callout">
            Type in any tab and watch the preview update after a short pause.
            Press <strong>Run</strong> (or <strong>Ctrl/⌘ + Enter</strong>) to
            refresh immediately and clear the console.
          </div>

          <h2 id="html">HTML basics</h2>
          <p>
            HTML describes the structure and meaning of a page. Every document
            starts with a doctype, then an <code>&lt;html&gt;</code> element
            containing a <code>&lt;head&gt;</code> for metadata and a{" "}
            <code>&lt;body&gt;</code> for visible content.
          </p>
          <pre>
            <code>{`<!DOCTYPE html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1" />
    <title>My first page</title>
    <link rel="stylesheet" href="styles.css" />
  </head>
  <body>
    <h1>Hello, world!</h1>
    <p>This is my first paragraph.</p>
    <script src="scripts.js"></script>
  </body>
</html>`}</code>
          </pre>

          <h3>Elements and attributes</h3>
          <p>
            An element usually has an opening tag, content and a closing tag.
            Attributes add extra information inside the opening tag. In{" "}
            <code>&lt;a href=&quot;/learn&quot;&gt;Guide&lt;/a&gt;</code>,{" "}
            <code>href</code> is the attribute and the link text is the content.
          </p>
          <p>Useful elements to know:</p>
          <ul>
            <li>
              Headings: <code>&lt;h1&gt;</code> through <code>&lt;h6&gt;</code>.
            </li>
            <li>
              Text: <code>&lt;p&gt;</code>, <code>&lt;strong&gt;</code>,{" "}
              <code>&lt;em&gt;</code>, <code>&lt;code&gt;</code>.
            </li>
            <li>
              Links and media: <code>&lt;a&gt;</code>, <code>&lt;img&gt;</code>,{" "}
              <code>&lt;video&gt;</code>, <code>&lt;svg&gt;</code>.
            </li>
            <li>
              Lists: <code>&lt;ul&gt;</code>, <code>&lt;ol&gt;</code>,{" "}
              <code>&lt;li&gt;</code>.
            </li>
            <li>
              Structure: <code>&lt;header&gt;</code>, <code>&lt;main&gt;</code>,{" "}
              <code>&lt;section&gt;</code>, <code>&lt;footer&gt;</code>.
            </li>
            <li>
              Forms: <code>&lt;form&gt;</code>, <code>&lt;input&gt;</code>,{" "}
              <code>&lt;select&gt;</code>, <code>&lt;button&gt;</code>.
            </li>
          </ul>

          <h3>Tables</h3>
          <p>
            Tables are for tabular data, not layout. A table contains rows (
            <code>&lt;tr&gt;</code>), header cells (<code>&lt;th&gt;</code>) and
            data cells (<code>&lt;td&gt;</code>). A{" "}
            <code>&lt;caption&gt;</code> describes the table.
          </p>
          <pre>
            <code>{`<table>
  <caption>Team scores</caption>
  <thead>
    <tr><th>Team</th><th>Points</th></tr>
  </thead>
  <tbody>
    <tr><td>Red</td><td>42</td></tr>
    <tr><td>Blue</td><td>38</td></tr>
  </tbody>
</table>`}</code>
          </pre>

          <h2 id="css">CSS basics</h2>
          <p>
            CSS controls presentation. A rule has a selector and a block of
            declarations:
          </p>
          <pre>
            <code>{`body {
  margin: 0;
  font-family: system-ui, sans-serif;
  background: #f8fafc;
}

.card {
  padding: 24px;
  border-radius: 16px;
  box-shadow: 0 20px 40px -24px rgb(15 23 42 / 0.4);
}`}</code>
          </pre>
          <p>
            Selectors can target elements (<code>p</code>), classes (`.card`),
            IDs (<code>#hero</code>), attributes (<code>[type=&quot;email&quot;]</code>)
            and states (<code>:hover</code>, <code>:focus-visible</code>). Use
            classes for reusable styles.
          </p>

          <h3>The box model</h3>
          <p>
            Every element is a box made of content, padding, border and margin.
            Setting <code>box-sizing: border-box</code> on everything makes
            widths easier to reason about — it is the first rule in most modern
            stylesheets.
          </p>

          <h3>Layout with flexbox and grid</h3>
          <p>
            Flexbox arranges items along one axis. Grid arranges them in rows and
            columns. Both handle spacing and alignment far better than floats.
          </p>
          <pre>
            <code>{`.features {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(220px, 1fr));
  gap: 16px;
}

.nav {
  display: flex;
  align-items: center;
  justify-content: space-between;
}`}</code>
          </pre>

          <h3>Responsive design</h3>
          <p>
            Start with a layout that works on a narrow screen, then add
            breakpoints with media queries. Set the viewport meta tag in the HTML
            head so phones use the real device width.
          </p>
          <pre>
            <code>{`@media (max-width: 640px) {
  .hero {
    padding: 32px 18px;
  }
  .nav-links {
    display: none;
  }
}`}</code>
          </pre>

          <h2 id="javascript">JavaScript basics</h2>
          <p>
            JavaScript makes the page interactive. Load it from your HTML with{" "}
            <code>&lt;script src=&quot;scripts.js&quot;&gt;&lt;/script&gt;</code>{" "}
            near the end of the body so the elements exist before the script runs.
          </p>
          <pre>
            <code>{`const button = document.querySelector("#cheer");
const output = document.querySelector("#output");

button.addEventListener("click", () => {
  output.textContent = "Nice work!";
  console.log("Button clicked");
});`}</code>
          </pre>
          <p>
            Use <code>document.querySelector</code> to find an element and{" "}
            <code>addEventListener</code> to react to clicks, typing, submits and
            more. Update the page with <code>textContent</code>,{" "}
            <code>classList</code>, <code>style</code> or by creating elements
            with <code>document.createElement</code>.
          </p>

          <h3>Debugging with the console</h3>
          <p>
            <code>console.log</code> prints a value, <code>console.warn</code>{" "}
            highlights a warning and <code>console.error</code> shows an error.
            Uncaught exceptions and rejected promises are reported automatically
            in the console panel.
          </p>

          <h2 id="preview">How the preview and console work</h2>
          <p>
            The preview is a real browser frame rendered from your three files. A{" "}
            <code>&lt;link&gt;</code> pointing at <code>styles.css</code> is
            replaced with that file&apos;s CSS, and a{" "}
            <code>&lt;script src=&quot;scripts.js&quot;&gt;</code> is replaced with
            the JavaScript. Any CSS or JS file that is not referenced is appended
            automatically.
          </p>
          <p>
            The frame is sandboxed, so scripts cannot reach the editor or your
            stored playgrounds. Console methods are forwarded to the panel below
            the preview, along with runtime errors. The sandbox also means frame
            scripts cannot use <code>localStorage</code> — keep demo state in
            memory.
          </p>

          <h2 id="files">Files, imports and the entry file</h2>
          <p>
            Add as many HTML, CSS, JS, JSON, Markdown or text files as you like
            from the <strong>Project files</strong> panel. One HTML file is marked
            as the preview entry (the star icon). Rename or delete files there
            too; closing a tab does not delete the file.
          </p>
          <p>
            <strong>Import file…</strong> accepts a standalone HTML document. Its
            inline <code>&lt;style&gt;</code> and{" "}
            <code>&lt;script&gt;</code> blocks are split into separate CSS and JS
            files, so everything stays editable. Importing CSS or JS on its own
            adds it to the current project.
          </p>

          <h2 id="sharing">Save, share and download</h2>
          <p>
            Your work autosaves to this browser as you type. Use{" "}
            <strong>Save</strong> to keep a named copy in{" "}
            <strong>Saved playgrounds</strong>. Local storage is per browser and
            per device, so clearing site data removes those copies.
          </p>
          <p>
            <strong>Share</strong> creates a short link such as{" "}
            <code>htmlonline.vercel.app/s/abc123</code>. Choose{" "}
            <strong>Editor</strong> to
            send an editable copy, or <strong>Preview only</strong> to send a
            clean full-screen render without the editor. Short links are stored
            on the server, so anyone with the link can open them.
          </p>
          <p>
            Prefer everything inside the URL? Switch to{" "}
            <strong>Use a long link instead</strong>. Long links compress the
            whole project into the URL fragment, need no server, and the data
            never reaches the host — but they get long for large projects. Both
            kinds of link are snapshots: later edits are not included until you
            share again.
          </p>
          <p>
            Very large projects produce very long URLs, which is why{" "}
            <strong>Download .html</strong> exists — it produces a single
            self-contained file with CSS and JS inlined.
          </p>

          <h2 id="shortcuts">Keyboard shortcuts</h2>
          <ul>
            <li>
              <strong>Ctrl/⌘ + Enter</strong> — run and refresh the preview.
            </li>
            <li>
              <strong>Ctrl/⌘ + S</strong> — save the playground.
            </li>
            <li>
              <strong>Shift + Alt + F</strong> — format the current file.
            </li>
            <li>
              <strong>Ctrl/⌘ + F</strong> — find in the current file.
            </li>
            <li>
              <strong>Ctrl/⌘ + H</strong> — find and replace.
            </li>
            <li>
              <strong>Ctrl/⌘ + /</strong> — toggle a line comment.
            </li>
            <li>
              <strong>Tab</strong> — indent; <strong>Shift + Tab</strong> —
              outdent.
            </li>
            <li>
              <strong>Esc</strong> — close a dialog, menu or search panel.
            </li>
          </ul>

          <h2 id="faq">FAQ</h2>
          <h3>Can I use React, Vue or npm packages?</h3>
          <p>
            This playground targets plain HTML, CSS and JavaScript. You can load
            libraries from a CDN with a <code>&lt;script&gt;</code> tag, but there
            is no build step or package manager.
          </p>

          <h3>Where is my code stored?</h3>
          <p>
            In your browser&apos;s local storage, plus in any share links you
            create. There is no account and no server-side database.
          </p>

          <h3>Why is the console empty?</h3>
          <p>
            The console opens with the preview. If it is collapsed, click the
            Console header. Logs clear when you press Run.
          </p>

          <h3>Can I host this myself?</h3>
          <p>
            Yes. CodeCanvas is a standard Next.js application and deploys to
            Vercel with zero configuration. See the README in the repository for
            the exact commands.
          </p>

          <p style={{ marginTop: 36 }}>
            Ready to try it? <Link href="/">Open the playground</Link> and start
            typing.
          </p>
        </article>
      </div>

      <footer className="doc-footer">
        <span>© {new Date().getFullYear()} CodeCanvas</span>
        <span style={{ display: "flex", gap: 16 }}>
          <Link href="/">Playground</Link>
          <Link href="/learn">Learn</Link>
          <a href="#getting-started">Back to top</a>
        </span>
      </footer>
    </div>
  );
}
