import LZString from "lz-string";
import type { FileKind, Project } from "./types";
import { ensureProject } from "./project";

const PREFIX = "#p=";
const QUERY = "p";

export function encodeProject(project: Project): string {
  const entryIndex = Math.max(
    0,
    project.files.findIndex((file) => file.id === project.entryId),
  );
  const compact = {
    n: project.name,
    e: entryIndex,
    f: project.files.map((file) => [file.name, file.kind, file.content]),
  };
  return LZString.compressToEncodedURIComponent(JSON.stringify(compact));
}

interface CompactProject {
  n?: string;
  e?: number;
  f?: [string, string, string][];
}

export function decodePayload(payload: string): Project | null {
  try {
    const json = LZString.decompressFromEncodedURIComponent(payload);
    if (!json) return null;
    const data = JSON.parse(json) as CompactProject;
    if (!data || !Array.isArray(data.f)) return null;

    const files = data.f
      .filter(
        (entry) =>
          Array.isArray(entry) &&
          typeof entry[0] === "string" &&
          typeof entry[1] === "string" &&
          typeof entry[2] === "string",
      )
      .map((entry) => ({
        id: cryptoId(),
        name: entry[0].slice(0, 60),
        kind: entry[1] as FileKind,
        content: entry[2],
      }));

    if (!files.length) return null;

    const entryIndex =
      typeof data.e === "number" && data.e >= 0 && data.e < files.length ? data.e : 0;

    return ensureProject({
      name:
        typeof data.n === "string" && data.n.trim() ? data.n.slice(0, 80) : "Shared playground",
      entryId: files[entryIndex]?.id ?? files[0].id,
      files,
    });
  } catch {
    return null;
  }
}

let counter = 0;
function cryptoId(): string {
  if (typeof crypto !== "undefined" && "randomUUID" in crypto) {
    return crypto.randomUUID();
  }
  counter += 1;
  return `shared-${Date.now().toString(36)}-${counter}`;
}

export function readShareFromLocation(): Project | null {
  if (typeof window === "undefined") return null;
  const hash = window.location.hash;
  if (hash.startsWith(PREFIX)) {
    return decodePayload(hash.slice(PREFIX.length));
  }
  const params = new URLSearchParams(window.location.search);
  const query = params.get(QUERY);
  if (query) return decodePayload(query);
  return null;
}

export function buildShareUrl(
  project: Project,
  mode: "editor" | "preview" = "editor",
): string {
  const encoded = encodeProject(project);
  const path = mode === "preview" ? "/preview" : window.location.pathname;
  return `${window.location.origin}${path}${PREFIX}${encoded}`;
}

export function writeShareToLocation(project: Project): string {
  const encoded = encodeProject(project);
  const url = `${window.location.origin}${window.location.pathname}${PREFIX}${encoded}`;
  window.history.replaceState(null, "", `${PREFIX}${encoded}`);
  return url;
}

export function clearShareFromLocation(): void {
  if (typeof window === "undefined") return;
  if (window.location.hash) {
    window.history.replaceState(null, "", window.location.pathname);
  }
}
