import type { PlaygroundSettings, Project, SavedProject, SessionShape } from "./types";
import { DEFAULT_SETTINGS } from "./types";
import { ensureProject, uid } from "./project";

const SESSION_KEY = "codecanvas:session:v1";
const LIBRARY_KEY = "codecanvas:library:v1";
const SETTINGS_KEY = "codecanvas:settings:v1";

function read(key: string): unknown {
  if (typeof window === "undefined") return null;
  try {
    const raw = window.localStorage.getItem(key);
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
}

function write(key: string, value: unknown): void {
  if (typeof window === "undefined") return;
  try {
    window.localStorage.setItem(key, JSON.stringify(value));
  } catch {
    /* storage can be full or blocked — the editor still works */
  }
}

export function isProject(value: unknown): value is Project {
  if (!value || typeof value !== "object") return false;
  const candidate = value as Partial<Project>;
  return (
    typeof candidate.name === "string" &&
    typeof candidate.entryId === "string" &&
    Array.isArray(candidate.files) &&
    candidate.files.every(
      (file) =>
        file &&
        typeof file.id === "string" &&
        typeof file.name === "string" &&
        typeof file.content === "string" &&
        typeof file.kind === "string",
    )
  );
}

export function loadSession(): SessionShape | null {
  const value = read(SESSION_KEY) as Partial<SessionShape> | null;
  if (!value || !isProject(value.project) || typeof value.activeFileId !== "string") {
    return null;
  }
  const project = ensureProject(value.project);
  const active =
    project.files.find((file) => file.id === value.activeFileId) ?? project.files[0];
  return { project, activeFileId: active.id };
}

export function saveSession(project: Project, activeFileId: string): void {
  write(SESSION_KEY, { project, activeFileId });
}

export function loadSettings(): PlaygroundSettings {
  const value = read(SETTINGS_KEY) as Partial<PlaygroundSettings> | null;
  if (!value) return { ...DEFAULT_SETTINGS };

  const clamp = (num: unknown, min: number, max: number, fallback: number) =>
    typeof num === "number" && Number.isFinite(num)
      ? Math.min(max, Math.max(min, num))
      : fallback;

  return {
    theme:
      value.theme === "light" || value.theme === "dark" || value.theme === "system"
        ? value.theme
        : DEFAULT_SETTINGS.theme,
    fontSize: clamp(value.fontSize, 11, 24, DEFAULT_SETTINGS.fontSize),
    tabSize: value.tabSize === 4 ? 4 : 2,
    wordWrap: Boolean(value.wordWrap),
    autoRun: value.autoRun !== false,
    showConsole: value.showConsole !== false,
    previewDevice:
      value.previewDevice === "tablet" || value.previewDevice === "mobile"
        ? value.previewDevice
        : "desktop",
    split: clamp(value.split, 25, 75, DEFAULT_SETTINGS.split),
  };
}

export function saveSettings(settings: PlaygroundSettings): void {
  write(SETTINGS_KEY, settings);
}

export function loadLibrary(): SavedProject[] {
  const value = read(LIBRARY_KEY);
  if (!Array.isArray(value)) return [];
  return value
    .filter(
      (item): item is SavedProject =>
        Boolean(item) &&
        typeof item === "object" &&
        typeof (item as SavedProject).id === "string" &&
        typeof (item as SavedProject).name === "string" &&
        typeof (item as SavedProject).updatedAt === "number" &&
        isProject((item as SavedProject).project),
    )
    .sort((a, b) => b.updatedAt - a.updatedAt);
}

export function persistLibrary(library: SavedProject[]): void {
  write(LIBRARY_KEY, library);
}

export function saveToLibrary(
  project: Project,
  name: string,
  existingId?: string | null,
): { saved: SavedProject; library: SavedProject[] } {
  const saved: SavedProject = {
    id: existingId || uid(),
    name: name.trim() || "Untitled playground",
    project: { ...project, name: name.trim() || "Untitled playground" },
    updatedAt: Date.now(),
  };

  const library = loadLibrary().filter((item) => item.id !== saved.id);
  library.unshift(saved);
  persistLibrary(library.slice(0, 60));
  return { saved, library: library.slice(0, 60) };
}

export function removeFromLibrary(id: string): SavedProject[] {
  const library = loadLibrary().filter((item) => item.id !== id);
  persistLibrary(library);
  return library;
}

export function markLibraryOpened(id: string): SavedProject[] {
  const library = loadLibrary();
  const found = library.find((item) => item.id === id);
  if (!found) return library;
  found.updatedAt = Date.now();
  const rest = library.filter((item) => item.id !== id);
  const next = [found, ...rest];
  persistLibrary(next);
  return next;
}
