import type { FileKind, Project, ProjectFile } from "./types";

export function uid(): string {
  if (typeof crypto !== "undefined" && "randomUUID" in crypto) {
    return crypto.randomUUID();
  }
  return `f-${Math.random().toString(36).slice(2)}-${Date.now().toString(36)}`;
}

export function kindFromName(name: string): FileKind {
  const ext = name.split(".").pop()?.toLowerCase() ?? "";
  if (ext === "html" || ext === "htm") return "html";
  if (ext === "css") return "css";
  if (ext === "js" || ext === "mjs" || ext === "jsx" || ext === "ts" || ext === "tsx") return "js";
  if (ext === "json") return "json";
  if (ext === "md" || ext === "markdown") return "markdown";
  return "text";
}

export function makeFile(name: string, content = "", kind?: FileKind): ProjectFile {
  return { id: uid(), name, kind: kind ?? kindFromName(name), content };
}

export function projectFileCount(project: Project): number {
  return project.files.length;
}

export function entryFile(project: Project): ProjectFile | undefined {
  return (
    project.files.find((file) => file.id === project.entryId) ??
    project.files.find((file) => file.kind === "html")
  );
}

export function ensureProject(project: Project): Project {
  if (!project.files.length) {
    return createStarterProject();
  }
  const hasEntry = project.files.some((file) => file.id === project.entryId);
  if (!hasEntry) {
    const firstHtml = project.files.find((file) => file.kind === "html");
    return { ...project, entryId: firstHtml?.id ?? project.files[0].id };
  }
  return project;
}

export function formatBytes(value: number): string {
  if (value < 1024) return `${value} B`;
  if (value < 1024 * 1024) return `${(value / 1024).toFixed(1)} KB`;
  return `${(value / (1024 * 1024)).toFixed(2)} MB`;
}

export function formatRelativeTime(timestamp: number): string {
  const delta = Date.now() - timestamp;
  if (delta < 45_000) return "just now";
  if (delta < 3_600_000) return `${Math.round(delta / 60_000)} min ago`;
  if (delta < 86_400_000) return `${Math.round(delta / 3_600_000)} hr ago`;
  if (delta < 604_800_000) return `${Math.round(delta / 86_400_000)} d ago`;
  return new Date(timestamp).toLocaleDateString();
}

export const STARTER_HTML = `<!DOCTYPE html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>Hello, CodeCanvas!</title>
    <link rel="stylesheet" href="styles.css" />
  </head>
  <body>
    <main class="card">
      <p class="eyebrow">Your first canvas</p>
      <h1 class="title">Hello, world! <span class="wave">👋</span></h1>
      <p class="lede">
        Edit the HTML, CSS or JS tabs on the left. The preview updates as you type.
      </p>

      <button id="cheer" class="button" type="button">
        Give me a compliment
      </button>
      <p id="output" class="output" aria-live="polite"></p>

      <p class="clock">Rendered on <span id="currentTime"></span></p>
    </main>

    <script src="scripts.js"></script>
  </body>
</html>
`;

export const STARTER_CSS = `:root {
  --ink: #171a2b;
  --muted: #646b85;
  --accent: #6366f1;
  --accent-2: #a855f7;
}

* {
  box-sizing: border-box;
}

body {
  margin: 0;
  min-height: 100vh;
  display: grid;
  place-items: center;
  padding: 24px;
  font-family: system-ui, -apple-system, "Segoe UI", sans-serif;
  color: var(--ink);
  background:
    radial-gradient(circle at 15% 15%, #e0e7ff 0, transparent 45%),
    radial-gradient(circle at 85% 80%, #fae8ff 0, transparent 40%),
    #f8fafc;
}

.card {
  width: min(560px, 100%);
  padding: 40px;
  border-radius: 24px;
  background: rgba(255, 255, 255, 0.82);
  border: 1px solid rgba(99, 102, 241, 0.18);
  box-shadow: 0 24px 60px -24px rgba(31, 41, 55, 0.3);
  backdrop-filter: blur(12px);
}

.eyebrow {
  margin: 0 0 12px;
  font-size: 12px;
  font-weight: 700;
  letter-spacing: 0.16em;
  text-transform: uppercase;
  color: var(--accent);
}

.title {
  margin: 0;
  font-size: clamp(32px, 6vw, 48px);
  line-height: 1.05;
  letter-spacing: -0.03em;
  background: linear-gradient(120deg, var(--accent), var(--accent-2));
  -webkit-background-clip: text;
  background-clip: text;
  color: transparent;
}

.wave {
  display: inline-block;
  animation: wave 2.2s ease-in-out infinite;
  transform-origin: 70% 70%;
}

@keyframes wave {
  0%, 60%, 100% { transform: rotate(0deg); }
  70% { transform: rotate(14deg); }
  80% { transform: rotate(-8deg); }
  90% { transform: rotate(12deg); }
}

.lede {
  margin: 16px 0 28px;
  font-size: 16px;
  line-height: 1.65;
  color: var(--muted);
}

.button {
  appearance: none;
  border: 0;
  cursor: pointer;
  padding: 13px 22px;
  border-radius: 12px;
  font: inherit;
  font-weight: 650;
  color: #fff;
  background: linear-gradient(120deg, var(--accent), var(--accent-2));
  box-shadow: 0 10px 24px -10px rgba(99, 102, 241, 0.9);
  transition: transform 150ms ease, box-shadow 150ms ease;
}

.button:hover { transform: translateY(-2px); }
.button:active { transform: translateY(0) scale(0.98); }

.output {
  min-height: 24px;
  margin: 14px 0 0;
  font-weight: 600;
  color: var(--accent);
}

.clock {
  margin: 28px 0 0;
  font-size: 13px;
  color: var(--muted);
}

@media (max-width: 480px) {
  .card { padding: 28px 22px; }
}
`;

export const STARTER_JS = `const compliments = [
  "Your HTML is beautifully semantic.",
  "That CSS is chef's kiss.",
  "You would make a great debugger.",
  "Your indentation is immaculate.",
  "Every pixel is exactly where it should be.",
  "You write code like a poet.",
];

const button = document.querySelector("#cheer");
const output = document.querySelector("#output");

button.addEventListener("click", () => {
  const compliment =
    compliments[Math.floor(Math.random() * compliments.length)];
  output.textContent = compliment;
  console.log("Compliment delivered:", compliment);
});

const time = document.querySelector("#currentTime");
time.textContent = new Date().toUTCString();
console.log("Hello from the console 👋");
`;

export function createStarterProject(): Project {
  const html = makeFile("index.html", STARTER_HTML, "html");
  const css = makeFile("styles.css", STARTER_CSS, "css");
  const js = makeFile("scripts.js", STARTER_JS, "js");
  return { name: "Hello, CodeCanvas", entryId: html.id, files: [html, css, js] };
}

export function normalizeFileName(input: string): string {
  const cleaned = input.trim().replace(/[\\/:*?"<>|]+/g, "-").replace(/\s+/g, "-");
  return cleaned.slice(0, 60);
}
