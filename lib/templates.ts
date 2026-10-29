import { createStarterProject, makeFile, uid } from "./project";
import type { Project } from "./types";

export interface Template {
  id: string;
  name: string;
  description: string;
  tag: string;
  gradient: string;
  build: () => Project;
}

function project(name: string, html: string, css: string, js: string): Project {
  const h = makeFile("index.html", html, "html");
  const c = makeFile("styles.css", css, "css");
  const j = makeFile("scripts.js", js, "js");
  return { name, entryId: h.id, files: [h, c, j] };
}

const landingHtml = `<!DOCTYPE html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>Northstar — Plan less, ship more</title>
    <link rel="stylesheet" href="styles.css" />
  </head>
  <body>
    <header class="nav">
      <a class="brand" href="#">◆ northstar</a>
      <nav>
        <a href="#features">Features</a>
        <a href="#pricing">Pricing</a>
        <a class="nav-cta" href="#start">Start free</a>
      </nav>
    </header>

    <main>
      <section class="hero">
        <p class="pill">New · Realtime collaboration</p>
        <h1>Plan less.<br /><span>Ship more.</span></h1>
        <p class="sub">
          Northstar brings your roadmap, docs and releases into one calm
          workspace — so your team can focus on the work that matters.
        </p>
        <div class="actions">
          <a class="primary" href="#start">Start free trial</a>
          <a class="ghost" href="#features">See how it works</a>
        </div>
        <div class="logos">
          <span>ACME</span><span>Polaris</span><span>Nimbus</span><span>Vertex</span>
        </div>
      </section>

      <section id="features" class="features">
        <article>
          <div class="icon">⚡</div>
          <h2>Ship in days</h2>
          <p>Spin up a workspace, invite the team and publish your first release today.</p>
        </article>
        <article>
          <div class="icon">🧭</div>
          <h2>Stay aligned</h2>
          <p>One shared roadmap keeps product, design and engineering on the same page.</p>
        </article>
        <article>
          <div class="icon">🔒</div>
          <h2>Built to last</h2>
          <p>SSO, audit logs and granular roles come standard on every paid plan.</p>
        </article>
      </section>
    </main>

    <footer>© <span id="year"></span> Northstar Labs</footer>
    <script src="scripts.js"></script>
  </body>
</html>
`;

const landingCss = `:root {
  --bg: #070a12;
  --panel: #0e1420;
  --ink: #f5f7ff;
  --muted: #98a2bd;
  --brand: #7c8cff;
  --brand-2: #4fd1c5;
}

* { box-sizing: border-box; }

html { scroll-behavior: smooth; }

body {
  margin: 0;
  font-family: ui-sans-serif, system-ui, -apple-system, "Segoe UI", sans-serif;
  color: var(--ink);
  background:
    radial-gradient(800px circle at 50% -10%, rgba(124, 140, 255, 0.22), transparent 60%),
    var(--bg);
  line-height: 1.6;
}

a { color: inherit; text-decoration: none; }

.nav {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 24px;
  max-width: 1120px;
  margin: 0 auto;
  padding: 24px;
}

.brand { font-weight: 800; letter-spacing: -0.02em; }

.nav nav { display: flex; align-items: center; gap: 22px; font-size: 14px; }
.nav nav a { color: var(--muted); transition: color 150ms; }
.nav nav a:hover { color: var(--ink); }

.nav-cta {
  padding: 8px 16px;
  border: 1px solid rgba(255, 255, 255, 0.16);
  border-radius: 999px;
  color: var(--ink) !important;
}

.hero {
  max-width: 900px;
  margin: 0 auto;
  padding: 72px 24px 56px;
  text-align: center;
}

.pill {
  display: inline-block;
  margin: 0 0 24px;
  padding: 6px 14px;
  border-radius: 999px;
  border: 1px solid rgba(124, 140, 255, 0.35);
  background: rgba(124, 140, 255, 0.1);
  color: #c3cbff;
  font-size: 12px;
  letter-spacing: 0.04em;
}

h1 {
  margin: 0;
  font-size: clamp(48px, 9vw, 92px);
  line-height: 0.95;
  letter-spacing: -0.045em;
}

h1 span {
  background: linear-gradient(100deg, var(--brand), var(--brand-2));
  -webkit-background-clip: text;
  background-clip: text;
  color: transparent;
}

.sub {
  max-width: 580px;
  margin: 24px auto 32px;
  color: var(--muted);
  font-size: 17px;
}

.actions { display: flex; justify-content: center; gap: 12px; flex-wrap: wrap; }

.primary, .ghost {
  display: inline-block;
  padding: 13px 24px;
  border-radius: 12px;
  font-weight: 650;
  font-size: 15px;
  transition: transform 150ms, opacity 150ms;
}

.primary { background: linear-gradient(100deg, var(--brand), #9a7cff); color: #07101f; }
.ghost { border: 1px solid rgba(255, 255, 255, 0.14); color: var(--ink); }
.primary:hover, .ghost:hover { transform: translateY(-2px); }

.logos {
  display: flex;
  justify-content: center;
  gap: 36px;
  flex-wrap: wrap;
  margin-top: 64px;
  color: #5c6684;
  font-size: 12px;
  font-weight: 700;
  letter-spacing: 0.18em;
}

.features {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(240px, 1fr));
  gap: 16px;
  max-width: 1040px;
  margin: 0 auto;
  padding: 32px 24px 72px;
}

.features article {
  padding: 28px;
  border-radius: 20px;
  border: 1px solid rgba(255, 255, 255, 0.08);
  background: linear-gradient(160deg, rgba(255, 255, 255, 0.05), transparent);
}

.icon { font-size: 24px; }
.features h2 { margin: 14px 0 8px; font-size: 19px; letter-spacing: -0.02em; }
.features p { margin: 0; color: var(--muted); font-size: 14px; }

footer {
  padding: 28px;
  text-align: center;
  color: #4d5670;
  font-size: 13px;
  border-top: 1px solid rgba(255, 255, 255, 0.06);
}

@media (max-width: 640px) {
  .nav nav a:not(.nav-cta) { display: none; }
  .hero { padding-top: 48px; }
}
`;

const landingJs = `document.querySelector("#year").textContent = new Date().getFullYear();

// A tiny scroll-reveal effect
const observer = new IntersectionObserver(
  (entries) => {
    for (const entry of entries) {
      if (entry.isIntersecting) {
        entry.target.animate(
          [{ opacity: 0, transform: "translateY(16px)" }, { opacity: 1, transform: "none" }],
          { duration: 500, easing: "ease-out", fill: "both" }
        );
        observer.unobserve(entry.target);
      }
    }
  },
  { threshold: 0.15 }
);

document.querySelectorAll(".features article").forEach((card) => observer.observe(card));
`;

const formHtml = `<!DOCTYPE html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>Create your account</title>
    <link rel="stylesheet" href="styles.css" />
  </head>
  <body>
    <main class="shell">
      <section class="intro">
        <span class="badge">JOIN US</span>
        <h1>Build something<br />people love.</h1>
        <p>Create a free account and start shipping beautiful interfaces in minutes.</p>
        <ul>
          <li>✓ Unlimited playgrounds</li>
          <li>✓ Live preview &amp; console</li>
          <li>✓ Share links that just work</li>
        </ul>
      </section>

      <form id="signup" class="form" novalidate>
        <h2>Create account</h2>
        <p class="hint">No credit card required.</p>

        <label>
          Full name
          <input name="name" id="name" type="text" placeholder="Ada Lovelace" autocomplete="name" />
          <small class="error" data-error-for="name"></small>
        </label>

        <label>
          Email
          <input name="email" id="email" type="email" placeholder="ada@example.com" autocomplete="email" />
          <small class="error" data-error-for="email"></small>
        </label>

        <label>
          Password
          <input name="password" id="password" type="password" placeholder="At least 8 characters" autocomplete="new-password" />
          <div class="meter"><span id="strength"></span></div>
          <small class="error" data-error-for="password"></small>
        </label>

        <label class="check">
          <input type="checkbox" id="terms" />
          <span>I agree to the terms of service</span>
        </label>

        <button type="submit">Create account</button>
        <p id="success" class="success" role="status"></p>
      </form>
    </main>
    <script src="scripts.js"></script>
  </body>
</html>
`;

const formCss = `* { box-sizing: border-box; }

body {
  margin: 0;
  min-height: 100vh;
  display: grid;
  place-items: center;
  padding: 24px;
  font-family: ui-sans-serif, system-ui, -apple-system, "Segoe UI", sans-serif;
  background: #0b1020;
  color: #e9ecff;
}

.shell {
  display: grid;
  grid-template-columns: 1fr 1fr;
  width: min(920px, 100%);
  border-radius: 26px;
  overflow: hidden;
  border: 1px solid rgba(255, 255, 255, 0.08);
  background: #0f1529;
  box-shadow: 0 40px 90px -40px #000;
}

.intro {
  padding: 48px;
  background:
    radial-gradient(600px circle at 0% 0%, rgba(124, 92, 255, 0.4), transparent 60%),
    linear-gradient(160deg, #141b38, #0b1022);
}

.badge { font-size: 11px; letter-spacing: 0.2em; color: #a5b4fc; font-weight: 700; }
h1 { margin: 18px 0; font-size: 36px; line-height: 1.1; letter-spacing: -0.03em; }
.intro p { color: #98a3c7; line-height: 1.6; }
.intro ul { margin: 28px 0 0; padding: 0; list-style: none; display: grid; gap: 12px; color: #c7d0ee; font-size: 14px; }

.form { padding: 44px; display: grid; gap: 16px; align-content: start; }
.form h2 { margin: 0; font-size: 24px; letter-spacing: -0.02em; }
.hint { margin: -8px 0 8px; color: #7c87a8; font-size: 13px; }

label { display: grid; gap: 7px; font-size: 13px; font-weight: 600; color: #c3cae4; }

input {
  width: 100%;
  padding: 12px 14px;
  border-radius: 10px;
  border: 1px solid rgba(255, 255, 255, 0.12);
  background: #0a0f1f;
  color: #fff;
  font: inherit;
  outline: none;
  transition: border-color 150ms, box-shadow 150ms;
}

input:focus { border-color: #818cf8; box-shadow: 0 0 0 3px rgba(129, 140, 248, 0.18); }
input::placeholder { color: #4f5a79; }

.error { color: #fb7185; font-weight: 500; min-height: 0; }
.error:empty { display: none; }

.meter { height: 4px; border-radius: 99px; background: rgba(255, 255, 255, 0.08); overflow: hidden; }
.meter span { display: block; height: 100%; width: 0; background: #f87171; transition: width 200ms, background 200ms; }

.check { display: flex; align-items: center; gap: 10px; font-weight: 500; color: #98a3c7; }
.check input { width: 16px; height: 16px; accent-color: #818cf8; }

button {
  margin-top: 6px;
  padding: 13px;
  border: 0;
  border-radius: 10px;
  font: inherit;
  font-weight: 700;
  color: #0b1020;
  background: linear-gradient(100deg, #a5b4fc, #f0abfc);
  cursor: pointer;
  transition: transform 150ms, filter 150ms;
}

button:hover { transform: translateY(-1px); filter: brightness(1.06); }

.success { margin: 0; color: #4ade80; font-size: 14px; font-weight: 600; }

@media (max-width: 760px) {
  .shell { grid-template-columns: 1fr; }
  .intro { padding: 32px; }
  .form { padding: 32px; }
}
`;

const formJs = `const form = document.querySelector("#signup");
const password = document.querySelector("#password");
const strength = document.querySelector("#strength");
const success = document.querySelector("#success");

function setError(field, message) {
  const el = document.querySelector('[data-error-for="' + field + '"]');
  el.textContent = message || "";
  const input = document.querySelector("#" + field);
  input.style.borderColor = message ? "#fb7185" : "";
  return !message;
}

password.addEventListener("input", () => {
  const value = password.value;
  let score = 0;
  if (value.length >= 8) score++;
  if (/[A-Z]/.test(value)) score++;
  if (/[0-9]/.test(value)) score++;
  if (/[^A-Za-z0-9]/.test(value)) score++;

  const colors = ["#f87171", "#fbbf24", "#60a5fa", "#4ade80"];
  strength.style.width = Math.max(6, score * 25) + "%";
  strength.style.background = colors[Math.max(0, score - 1)];
});

form.addEventListener("submit", (event) => {
  event.preventDefault();
  success.textContent = "";

  const name = document.querySelector("#name").value.trim();
  const email = document.querySelector("#email").value.trim();
  const terms = document.querySelector("#terms").checked;

  const okName = setError("name", name.length < 2 ? "Please tell us your name." : "");
  const okEmail = setError("email", /^[^\\s@]+@[^\\s@]+\\.[^\\s@]+$/.test(email) ? "" : "Enter a valid email address.");
  const okPassword = setError("password", password.value.length < 8 ? "Use at least 8 characters." : "");

  if (!terms) {
    success.textContent = "Please accept the terms to continue.";
    success.style.color = "#fbbf24";
    return;
  }

  if (okName && okEmail && okPassword) {
    success.style.color = "#4ade80";
    success.textContent = "Welcome aboard, " + name.split(" ")[0] + "! 🎉";
    console.log("Signup payload:", { name, email });
    form.reset();
    strength.style.width = "0";
  }
});
`;

const todoHtml = `<!DOCTYPE html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>Today — a tiny todo app</title>
    <link rel="stylesheet" href="styles.css" />
  </head>
  <body>
    <main class="app">
      <header>
        <div>
          <p class="date" id="date"></p>
          <h1>Today</h1>
        </div>
        <div class="progress-ring" id="ring"><span id="percent">0%</span></div>
      </header>

      <form id="new-task">
        <input id="task-input" type="text" placeholder="Add a task and press Enter…" autocomplete="off" />
        <button type="submit" aria-label="Add task">+</button>
      </form>

      <ul id="tasks" class="tasks"></ul>

      <footer>
        <span id="counter">0 tasks</span>
        <button id="clear" class="clear" type="button">Clear completed</button>
      </footer>
    </main>
    <script src="scripts.js"></script>
  </body>
</html>
`;

const todoCss = `* { box-sizing: border-box; }

body {
  margin: 0;
  min-height: 100vh;
  display: grid;
  place-items: center;
  padding: 24px;
  font-family: ui-sans-serif, system-ui, -apple-system, "Segoe UI", sans-serif;
  background: radial-gradient(circle at 20% 0%, #1e293b, #0b0f19 60%);
  color: #e2e8f0;
}

.app {
  width: min(520px, 100%);
  padding: 32px;
  border-radius: 24px;
  background: rgba(15, 23, 42, 0.75);
  border: 1px solid rgba(148, 163, 184, 0.16);
  box-shadow: 0 30px 80px -30px #000;
  backdrop-filter: blur(16px);
}

header { display: flex; justify-content: space-between; align-items: center; }

.date { margin: 0; color: #94a3b8; font-size: 12px; letter-spacing: 0.14em; text-transform: uppercase; }
h1 { margin: 6px 0 0; font-size: 34px; letter-spacing: -0.03em; }

.progress-ring {
  width: 58px;
  height: 58px;
  display: grid;
  place-items: center;
  border-radius: 50%;
  background: conic-gradient(#818cf8 0deg, #818cf8 0deg, rgba(148, 163, 184, 0.15) 0deg);
  font-size: 12px;
  font-weight: 700;
}

.progress-ring span {
  width: 44px;
  height: 44px;
  display: grid;
  place-items: center;
  border-radius: 50%;
  background: #0f172a;
}

form { display: flex; gap: 8px; margin: 26px 0 18px; }

#task-input {
  flex: 1;
  padding: 13px 16px;
  border-radius: 12px;
  border: 1px solid rgba(148, 163, 184, 0.2);
  background: #0b1220;
  color: #fff;
  font: inherit;
  outline: none;
}

#task-input:focus { border-color: #818cf8; box-shadow: 0 0 0 3px rgba(129, 140, 248, 0.15); }

form button {
  width: 48px;
  border: 0;
  border-radius: 12px;
  font-size: 22px;
  color: #0b1020;
  background: #818cf8;
  cursor: pointer;
}

.tasks { margin: 0; padding: 0; list-style: none; display: grid; gap: 8px; }

.task {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 13px 14px;
  border-radius: 12px;
  background: rgba(148, 163, 184, 0.07);
  border: 1px solid transparent;
  animation: pop 180ms ease-out;
}

@keyframes pop {
  from { opacity: 0; transform: translateY(-4px); }
}

.task input { width: 18px; height: 18px; accent-color: #818cf8; cursor: pointer; }

.task label { flex: 1; cursor: pointer; font-size: 15px; }
.task.done label { color: #64748b; text-decoration: line-through; }

.delete {
  border: 0;
  background: none;
  color: #64748b;
  cursor: pointer;
  font-size: 16px;
  padding: 4px;
  opacity: 0;
  transition: opacity 120ms, color 120ms;
}

.task:hover .delete { opacity: 1; }
.delete:hover { color: #fb7185; }

footer {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-top: 22px;
  padding-top: 18px;
  border-top: 1px solid rgba(148, 163, 184, 0.12);
  color: #94a3b8;
  font-size: 13px;
}

.clear { border: 0; background: none; color: #94a3b8; font: inherit; cursor: pointer; }
.clear:hover { color: #e2e8f0; }
`;

const todoJs = `const tasks = [
  { id: 1, text: "Sketch the hero section", done: true },
  { id: 2, text: "Write the copy", done: false },
  { id: 3, text: "Ship it 🚀", done: false },
];

const list = document.querySelector("#tasks");
const form = document.querySelector("#new-task");
const input = document.querySelector("#task-input");
const counter = document.querySelector("#counter");
const ring = document.querySelector("#ring");
const percent = document.querySelector("#percent");
const clear = document.querySelector("#clear");

document.querySelector("#date").textContent = new Date().toLocaleDateString(
  undefined,
  { weekday: "long", month: "long", day: "numeric" }
);

function render() {
  list.innerHTML = "";

  for (const task of tasks) {
    const item = document.createElement("li");
    item.className = "task" + (task.done ? " done" : "");
    item.innerHTML =
      '<input type="checkbox" ' + (task.done ? "checked" : "") + ' aria-label="Toggle task" />' +
      "<label>" + task.text + "</label>" +
      '<button class="delete" aria-label="Delete task">✕</button>';

    item.querySelector("input").addEventListener("change", () => {
      task.done = !task.done;
      render();
    });

    item.querySelector(".delete").addEventListener("click", () => {
      const index = tasks.indexOf(task);
      tasks.splice(index, 1);
      render();
    });

    list.appendChild(item);
  }

  const done = tasks.filter((task) => task.done).length;
  const pct = tasks.length ? Math.round((done / tasks.length) * 100) : 0;
  counter.textContent = tasks.length + (tasks.length === 1 ? " task" : " tasks");
  percent.textContent = pct + "%";
  ring.style.background =
    "conic-gradient(#818cf8 " + (pct * 3.6) + "deg, rgba(148,163,184,.15) 0deg)";
}

form.addEventListener("submit", (event) => {
  event.preventDefault();
  const text = input.value.trim();
  if (!text) return;
  tasks.push({ id: Date.now(), text, done: false });
  input.value = "";
  console.log("Task added:", text);
  render();
});

clear.addEventListener("click", () => {
  for (let i = tasks.length - 1; i >= 0; i--) {
    if (tasks[i].done) tasks.splice(i, 1);
  }
  render();
});

render();
`;

const canvasHtml = `<!DOCTYPE html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>Particle playground</title>
    <link rel="stylesheet" href="styles.css" />
  </head>
  <body>
    <canvas id="stage"></canvas>
    <div class="overlay">
      <h1>Particle playground</h1>
      <p>Move your cursor. Click to burst.</p>
      <span id="fps">60 fps</span>
    </div>
    <script src="scripts.js"></script>
  </body>
</html>
`;

const canvasCss = `* { box-sizing: border-box; }

body {
  margin: 0;
  overflow: hidden;
  background: #05060c;
  font-family: ui-sans-serif, system-ui, -apple-system, "Segoe UI", sans-serif;
}

canvas { display: block; width: 100vw; height: 100vh; }

.overlay {
  position: fixed;
  left: 32px;
  bottom: 28px;
  color: #e6e9ff;
  pointer-events: none;
}

h1 { margin: 0; font-size: 26px; letter-spacing: -0.03em; }
p { margin: 6px 0 10px; color: #7f8ab5; font-size: 14px; }
#fps { font-size: 11px; letter-spacing: 0.16em; color: #4f5a80; text-transform: uppercase; }
`;

const canvasJs = `const canvas = document.querySelector("#stage");
const ctx = canvas.getContext("2d");
const cursor = { x: innerWidth / 2, y: innerHeight / 2 };
const particles = [];
const colors = ["#818cf8", "#f0abfc", "#4fd1c5", "#fbbf24"];

function resize() {
  canvas.width = innerWidth * devicePixelRatio;
  canvas.height = innerHeight * devicePixelRatio;
  ctx.setTransform(devicePixelRatio, 0, 0, devicePixelRatio, 0, 0);
}
resize();
addEventListener("resize", resize);

function spawn(x, y, amount = 14) {
  for (let i = 0; i < amount; i++) {
    const angle = Math.random() * Math.PI * 2;
    const speed = Math.random() * 2.4 + 0.4;
    particles.push({
      x, y,
      vx: Math.cos(angle) * speed,
      vy: Math.sin(angle) * speed,
      life: 1,
      size: Math.random() * 2.4 + 1,
      color: colors[Math.floor(Math.random() * colors.length)],
    });
  }
}

addEventListener("pointermove", (event) => {
  cursor.x = event.clientX;
  cursor.y = event.clientY;
  spawn(cursor.x, cursor.y, 1);
});

addEventListener("pointerdown", (event) => spawn(event.clientX, event.clientY, 40));

let last = performance.now();
let frames = 0;
let fpsTimer = 0;
const fpsEl = document.querySelector("#fps");

function frame(now) {
  const dt = Math.min(32, now - last) / 16.67;
  last = now;

  ctx.fillStyle = "rgba(5, 6, 12, 0.22)";
  ctx.fillRect(0, 0, innerWidth, innerHeight);

  for (let i = particles.length - 1; i >= 0; i--) {
    const p = particles[i];
    p.x += p.vx * dt;
    p.y += p.vy * dt;
    p.vy += 0.012 * dt;
    p.vx *= 0.995;
    p.life -= 0.012 * dt;

    if (p.life <= 0) {
      particles.splice(i, 1);
      continue;
    }

    ctx.globalAlpha = Math.max(0, p.life);
    ctx.fillStyle = p.color;
    ctx.beginPath();
    ctx.arc(p.x, p.y, p.size * p.life + 0.4, 0, Math.PI * 2);
    ctx.fill();
  }

  ctx.globalAlpha = 1;

  // Soft glow that follows the pointer
  const glow = ctx.createRadialGradient(cursor.x, cursor.y, 0, cursor.x, cursor.y, 180);
  glow.addColorStop(0, "rgba(129, 140, 248, 0.10)");
  glow.addColorStop(1, "rgba(129, 140, 248, 0)");
  ctx.fillStyle = glow;
  ctx.fillRect(0, 0, innerWidth, innerHeight);

  frames++;
  fpsTimer += now - (frame.prev ?? now);
  frame.prev = now;
  if (fpsTimer > 700) {
    fpsEl.textContent = Math.round((frames * 1000) / fpsTimer) + " fps";
    frames = 0;
    fpsTimer = 0;
  }

  requestAnimationFrame(frame);
}

requestAnimationFrame(frame);
console.log("Canvas ready — move your mouse!");
`;

const pricingHtml = `<!DOCTYPE html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>Simple pricing</title>
    <link rel="stylesheet" href="styles.css" />
  </head>
  <body>
    <main>
      <header>
        <p class="eyebrow">PRICING</p>
        <h1>Simple plans for every stage</h1>
        <p class="sub">Start free, upgrade when you outgrow it. Cancel anytime.</p>
        <label class="toggle">
          <span>Monthly</span>
          <input type="checkbox" id="yearly" />
          <span>Yearly <em>−20%</em></span>
        </label>
      </header>

      <section class="plans">
        <article>
          <h2>Starter</h2>
          <p class="price"><span>$0</span>/mo</p>
          <p class="desc">For side projects and learning.</p>
          <ul>
            <li>3 playgrounds</li>
            <li>Live preview</li>
            <li>Community support</li>
          </ul>
          <a href="#">Get started</a>
        </article>

        <article class="featured">
          <span class="tag">MOST POPULAR</span>
          <h2>Pro</h2>
          <p class="price"><span data-monthly="12" data-yearly="10">$12</span>/mo</p>
          <p class="desc">For makers shipping real products.</p>
          <ul>
            <li>Unlimited playgrounds</li>
            <li>Custom domains</li>
            <li>Version history</li>
            <li>Priority support</li>
          </ul>
          <a href="#">Start free trial</a>
        </article>

        <article>
          <h2>Team</h2>
          <p class="price"><span data-monthly="29" data-yearly="23">$29</span>/mo</p>
          <p class="desc">For teams that build together.</p>
          <ul>
            <li>Everything in Pro</li>
            <li>Shared libraries</li>
            <li>Roles &amp; permissions</li>
            <li>SSO and audit logs</li>
          </ul>
          <a href="#">Contact sales</a>
        </article>
      </section>
    </main>
    <script src="scripts.js"></script>
  </body>
</html>
`;

const pricingCss = `* { box-sizing: border-box; }

body {
  margin: 0;
  min-height: 100vh;
  font-family: ui-sans-serif, system-ui, -apple-system, "Segoe UI", sans-serif;
  color: #0f172a;
  background:
    radial-gradient(700px circle at 50% 0%, #e0e7ff, transparent 60%),
    #f8fafc;
  padding: 56px 24px;
}

main { max-width: 1100px; margin: 0 auto; }
header { text-align: center; }

.eyebrow { color: #6366f1; font-size: 12px; font-weight: 800; letter-spacing: 0.2em; margin: 0 0 12px; }
h1 { margin: 0; font-size: clamp(32px, 5vw, 48px); letter-spacing: -0.04em; }
.sub { color: #64748b; margin: 12px 0 26px; }

.toggle {
  display: inline-flex;
  align-items: center;
  gap: 10px;
  padding: 6px 14px;
  border-radius: 999px;
  background: #fff;
  border: 1px solid #e2e8f0;
  font-size: 13px;
  font-weight: 600;
  color: #475569;
  cursor: pointer;
}

.toggle input { accent-color: #6366f1; }
.toggle em { font-style: normal; color: #16a34a; font-size: 11px; }

.plans {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
  gap: 18px;
  margin-top: 44px;
  align-items: start;
}

.plans article {
  position: relative;
  padding: 30px;
  border-radius: 20px;
  background: #fff;
  border: 1px solid #e2e8f0;
  box-shadow: 0 18px 40px -30px rgba(15, 23, 42, 0.4);
}

.plans .featured {
  border: 1px solid #6366f1;
  box-shadow: 0 30px 60px -30px rgba(99, 102, 241, 0.55);
  transform: translateY(-8px);
}

.tag {
  position: absolute;
  top: -10px;
  left: 28px;
  padding: 4px 10px;
  border-radius: 999px;
  font-size: 10px;
  font-weight: 800;
  letter-spacing: 0.08em;
  color: #fff;
  background: #6366f1;
}

h2 { margin: 0; font-size: 18px; }
.price { margin: 16px 0 4px; font-size: 14px; color: #64748b; }
.price span { font-size: 42px; font-weight: 800; letter-spacing: -0.04em; color: #0f172a; }
.desc { margin: 0 0 20px; color: #64748b; font-size: 14px; }

ul { list-style: none; margin: 0 0 26px; padding: 0; display: grid; gap: 11px; font-size: 14px; color: #334155; }
li::before { content: "✓"; color: #6366f1; font-weight: 800; margin-right: 9px; }

a {
  display: block;
  text-align: center;
  padding: 12px;
  border-radius: 11px;
  border: 1px solid #cbd5e1;
  color: #0f172a;
  text-decoration: none;
  font-weight: 650;
  font-size: 14px;
  transition: 150ms;
}

a:hover { border-color: #94a3b8; transform: translateY(-1px); }
.featured a { background: #6366f1; border-color: #6366f1; color: #fff; }
`;

const pricingJs = `const yearly = document.querySelector("#yearly");
const prices = document.querySelectorAll(".price span");

yearly.addEventListener("change", () => {
  for (const price of prices) {
    price.textContent = "$" + price.dataset[yearly.checked ? "yearly" : "monthly"];
  }
  console.log("Billing period:", yearly.checked ? "yearly" : "monthly");
});
`;

export const TEMPLATES: Template[] = [
  {
    id: "starter",
    name: "Hello, CodeCanvas",
    description: "A friendly starting point with HTML, CSS and a little JavaScript.",
    tag: "Starter",
    gradient: "linear-gradient(135deg, #6366f1, #a855f7)",
    build: createStarterProject,
  },
  {
    id: "landing",
    name: "SaaS landing page",
    description: "Dark, modern hero with feature cards and a scroll animation.",
    tag: "Marketing",
    gradient: "linear-gradient(135deg, #0ea5e9, #6366f1)",
    build: () => project("Northstar landing", landingHtml, landingCss, landingJs),
  },
  {
    id: "signup",
    name: "Sign-up form",
    description: "Two-column layout with client-side validation and password strength.",
    tag: "Forms",
    gradient: "linear-gradient(135deg, #f43f5e, #a855f7)",
    build: () => project("Create account form", formHtml, formCss, formJs),
  },
  {
    id: "todo",
    name: "Todo app",
    description: "Add, complete and clear tasks with a live progress ring.",
    tag: "App",
    gradient: "linear-gradient(135deg, #14b8a6, #0ea5e9)",
    build: () => project("Today todo app", todoHtml, todoCss, todoJs),
  },
  {
    id: "canvas",
    name: "Particle playground",
    description: "A pointer-reactive canvas animation with an FPS meter.",
    tag: "Canvas",
    gradient: "linear-gradient(135deg, #8b5cf6, #ec4899)",
    build: () => project("Particle playground", canvasHtml, canvasCss, canvasJs),
  },
  {
    id: "pricing",
    name: "Pricing table",
    description: "Three plans with a monthly / yearly toggle. Light and airy.",
    tag: "UI",
    gradient: "linear-gradient(135deg, #f59e0b, #ef4444)",
    build: () => project("Simple pricing", pricingHtml, pricingCss, pricingJs),
  },
];

export const DEFAULT_TEMPLATES = TEMPLATES;

export function blankProject(): Project {
  const html = makeFile(
    "index.html",
    `<!DOCTYPE html>\n<html lang="en">\n  <head>\n    <meta charset="UTF-8" />\n    <meta name="viewport" content="width=device-width, initial-scale=1.0" />\n    <title>New playground</title>\n    <link rel="stylesheet" href="styles.css" />\n  </head>\n  <body>\n    <h1>Hello there 👋</h1>\n    <script src="scripts.js"></script>\n  </body>\n</html>\n`,
    "html",
  );
  const css = makeFile("styles.css", "body {\n  font-family: system-ui, sans-serif;\n  padding: 32px;\n}\n", "css");
  const js = makeFile("scripts.js", 'console.log("Ready to build.");\n', "js");
  return { name: `Playground ${new Date().toLocaleDateString()}`, entryId: html.id, files: [html, css, js] };
}

export { uid };
