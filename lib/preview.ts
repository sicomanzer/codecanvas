import type { Project, ProjectFile } from "./types";

const CONSOLE_BRIDGE = String.raw`<script>
(function () {
  var depthLimit = 3;
  function stringify(value, depth) {
    try {
      if (typeof value === "string") return value;
      if (value === null) return "null";
      if (value === undefined) return "undefined";
      if (typeof value === "number" || typeof value === "boolean" || typeof value === "bigint") {
        return String(value);
      }
      if (typeof value === "function") {
        return "ƒ " + (value.name || "anonymous") + "()";
      }
      if (value instanceof Error) {
        return (value.name || "Error") + ": " + value.message + (value.stack ? "\n" + value.stack : "");
      }
      if (typeof Node !== "undefined" && value instanceof Node) {
        if (value.nodeType === 1) {
          var el = value;
          return "<" + el.nodeName.toLowerCase() +
            (el.id ? "#" + el.id : "") +
            (el.className && typeof el.className === "string" ? "." + el.className.trim().split(/\s+/).join(".") : "") +
            ">";
        }
        return String(value.textContent || value.nodeName);
      }
      if (depth > depthLimit) return Array.isArray(value) ? "[…]" : "{…}";
      if (typeof value === "object") {
        return JSON.stringify(value, function (key, val) {
          if (typeof val === "function") return "ƒ " + (val.name || "anonymous") + "()";
          if (typeof val === "bigint") return String(val) + "n";
          if (val instanceof Error) return val.name + ": " + val.message;
          return val;
        }, 2);
      }
      return String(value);
    } catch (error) {
      return "[unserializable value]";
    }
  }

  function send(level, args) {
    try {
      window.parent.postMessage(
        {
          __codecanvas: true,
          level: level,
          args: Array.prototype.map.call(args, function (arg) { return stringify(arg, 0); }),
          time: Date.now()
        },
        "*"
      );
    } catch (error) {
      /* the parent may be gone */
    }
  }

  ["log", "info", "warn", "error", "debug"].forEach(function (level) {
    var original = typeof console[level] === "function" ? console[level].bind(console) : function () {};
    console[level] = function () {
      send(level, arguments);
      original.apply(console, arguments);
    };
  });

  window.addEventListener("error", function (event) {
    var message = event.message || "Script error";
    if (event.lineno) message += " (line " + event.lineno + ")";
    send("error", [message]);
  });

  window.addEventListener("unhandledrejection", function (event) {
    send("error", ["Unhandled promise rejection: " + stringify(event.reason, 0)]);
  });

  document.addEventListener("DOMContentLoaded", function () {
    try {
      window.parent.postMessage(
        { __codecanvas: true, kind: "ready", title: document.title },
        "*"
      );
    } catch (error) {}
  });
})();
</script>`;

function getAttribute(tag: string, name: string): string | null {
  const match = tag.match(new RegExp(`${name}\\s*=\\s*("([^"]*)"|'([^']*)'|([^\\s>]+))`, "i"));
  if (!match) return null;
  return match[2] ?? match[3] ?? match[4] ?? "";
}

function baseName(path: string): string {
  const clean = path.split(/[?#]/)[0];
  const parts = clean.split(/[\\/]/);
  return parts[parts.length - 1] ?? clean;
}

function escapeAttribute(value: string): string {
  return value.replace(/&/g, "&amp;").replace(/"/g, "&quot;");
}

function safeInlineScript(code: string): string {
  return code.replace(/<\/script/gi, "<\\/script");
}

function safeInlineStyle(code: string): string {
  return code.replace(/<\/style/gi, "<\\/style");
}

function injectIntoHead(html: string, snippet: string): string {
  const headOpen = html.match(/<head\b[^>]*>/i);
  if (headOpen) {
    return html.replace(headOpen[0], `${headOpen[0]}\n${snippet}`);
  }
  const htmlOpen = html.match(/<html\b[^>]*>/i);
  if (htmlOpen) {
    return html.replace(htmlOpen[0], `${htmlOpen[0]}\n<head>\n${snippet}\n</head>`);
  }
  return `${snippet}\n${html}`;
}

function injectBeforeBodyEnd(html: string, snippet: string): string {
  const bodyClose = /<\/body\s*>/i;
  if (bodyClose.test(html)) {
    return html.replace(bodyClose, `${snippet}\n</body>`);
  }
  return `${html}\n${snippet}`;
}

function findByPath(files: ProjectFile[], src: string): ProjectFile | undefined {
  const target = baseName(src);
  return files.find((file) => file.name === src) ?? files.find((file) => baseName(file.name) === target);
}

export function buildDocument(
  project: Project,
  options: { consoleBridge?: boolean; entryId?: string } = {},
): string {
  const entry =
    project.files.find((file) => file.id === (options.entryId ?? project.entryId)) ??
    project.files.find((file) => file.kind === "html");

  if (!entry) {
    return `<!DOCTYPE html><html><head><meta charset="utf-8"><style>
      body{margin:0;min-height:100vh;display:grid;place-items:center;font-family:system-ui,sans-serif;background:#0b0d13;color:#8b93ad}
      div{text-align:center;padding:32px;border:1px dashed #2a3042;border-radius:16px}
      strong{display:block;color:#e7e9f2;font-size:18px;margin-bottom:8px}
    </style></head><body><div><strong>No HTML file yet</strong>Add an HTML file to see a preview.</div></body></html>`;
  }

  let html = entry.content || "";
  const cssFiles = project.files.filter((file) => file.kind === "css");
  const jsFiles = project.files.filter((file) => file.kind === "js");
  const usedCss = new Set<string>();
  const usedJs = new Set<string>();

  html = html.replace(/<link\b[^>]*>/gi, (tag) => {
    const href = getAttribute(tag, "href");
    if (!href) return tag;
    const file = findByPath(cssFiles, href);
    if (!file) return tag;
    usedCss.add(file.id);
    return `<style data-source="${escapeAttribute(file.name)}">\n${safeInlineStyle(file.content)}\n</style>`;
  });

  html = html.replace(/<script\b[^>]*>[\s\S]*?<\/script\s*>/gi, (tag) => {
    const src = getAttribute(tag, "src");
    if (!src) return tag;
    const file = findByPath(jsFiles, src);
    if (!file) return tag;
    usedJs.add(file.id);
    return `<script data-source="${escapeAttribute(file.name)}">\n${safeInlineScript(file.content)}\n</script>`;
  });

  const extraCss = cssFiles.filter((file) => !usedCss.has(file.id));
  if (extraCss.length) {
    const block = extraCss
      .map(
        (file) =>
          `<style data-source="${escapeAttribute(file.name)}">\n${safeInlineStyle(file.content)}\n</style>`,
      )
      .join("\n");
    html = injectIntoHead(html, block);
  }

  const extraJs = jsFiles.filter((file) => !usedJs.has(file.id));
  if (extraJs.length) {
    const block = extraJs
      .map(
        (file) =>
          `<script data-source="${escapeAttribute(file.name)}">\n${safeInlineScript(file.content)}\n</script>`,
      )
      .join("\n");
    html = injectBeforeBodyEnd(html, block);
  }

  if (options.consoleBridge) {
    html = injectIntoHead(html, CONSOLE_BRIDGE);
  }

  return html;
}

export function buildExportDocument(project: Project): string {
  return buildDocument(project, { consoleBridge: false });
}

/** Pull inline styles and scripts out of an HTML document into their own files. */
export function splitHtmlDocument(
  html: string,
  htmlFile: { id: string; name: string },
): { html: string; styles: string[]; scripts: string[]; title?: string } {
  const styles: string[] = [];
  const scripts: string[] = [];

  let cleaned = html.replace(/<style\b[^>]*>([\s\S]*?)<\/style\s*>/gi, (_match, code: string) => {
    if (code.trim()) styles.push(code.trim());
    return "";
  });

  cleaned = cleaned.replace(/<script\b([^>]*)>([\s\S]*?)<\/script\s*>/gi, (match, attrs: string, code: string) => {
    const src = attrs.match(/\bsrc\s*=\s*("[^"]*"|'[^']*'|[^\s>]+)/i);
    if (!src && code.trim()) {
      scripts.push(code.trim());
      return "";
    }
    return match;
  });

  const titleMatch = html.match(/<title[^>]*>([\s\S]*?)<\/title>/i);
  return {
    html: cleaned,
    styles,
    scripts,
    title: titleMatch?.[1]?.trim(),
  };
}
