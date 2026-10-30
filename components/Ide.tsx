"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import Link from "next/link";
import {
  BookOpen,
  Code2,
  FolderTree,
  History,
  Keyboard,
  LayoutTemplate,
  Plus,
  Search,
  Settings as SettingsIcon,
  X,
} from "lucide-react";
import { CodeEditor, type CodeEditorHandle, type CursorInfo } from "./CodeEditor";
import { Preview } from "./Preview";
import { TopBar, type MobileView } from "./TopBar";
import {
  ConfirmDialog,
  FilesDialog,
  LibraryDialog,
  SaveDialog,
  SettingsDialog,
  ShareDialog,
  ShortcutsDialog,
  TemplatesDialog,
} from "./dialogs";
import { FileKindIcon } from "./FileKindIcon";
import { Toasts, useToasts } from "./Toasts";
import { DEFAULT_TEMPLATES } from "@/lib/templates";
import type { Template } from "@/lib/templates";
import { blankProject } from "@/lib/templates";
import {
  createStarterProject,
  ensureProject,
  kindFromName,
  makeFile,
  normalizeFileName,
} from "@/lib/project";
import {
  buildDocument,
  buildExportDocument,
  splitHtmlDocument,
} from "@/lib/preview";
import {
  loadLibrary,
  loadSession,
  loadSettings,
  markLibraryOpened,
  removeFromLibrary,
  saveSettings,
  saveToLibrary,
  saveSession,
} from "@/lib/storage";
import {
  buildShareUrl,
  clearShareFromLocation,
  encodeProject,
  readShareFromLocation,
  writeShareToLocation,
} from "@/lib/share";
import { cn, copyText, slugify } from "@/lib/cn";
import { DEFAULT_SETTINGS } from "@/lib/types";
import type {
  ConsoleEntry,
  FileKind,
  PlaygroundSettings,
  Project,
  ProjectFile,
  SavedProject,
  SessionShape,
} from "@/lib/types";

interface ConfirmState {
  title: string;
  description: string;
  confirmLabel: string;
  danger?: boolean;
  onConfirm: () => void;
}

function createInitialSession(): SessionShape {
  const project = createStarterProject();
  return { project, activeFileId: project.files[0].id };
}

export function Ide() {
  const [session, setSession] = useState<SessionShape>(createInitialSession);
  const project = session.project;
  const activeFile =
    project.files.find((file) => file.id === session.activeFileId) ??
    project.files[0];

  const [closedIds, setClosedIds] = useState<Set<string>>(new Set());
  const [settings, setSettings] = useState<PlaygroundSettings>(DEFAULT_SETTINGS);
  const [hydrated, setHydrated] = useState(false);
  const [isDark, setIsDark] = useState(true);
  const [cursor, setCursor] = useState<CursorInfo>({ line: 1, column: 1 });
  const [split, setSplit] = useState(50);
  const [dragging, setDragging] = useState(false);
  const [mobileView, setMobileView] = useState<MobileView>("editor");

  const [doc, setDoc] = useState("");
  const [runId, setRunId] = useState(1);
  const [runState, setRunState] = useState<"idle" | "running" | "ready">("idle");
  const [stale, setStale] = useState(false);
  const [consoleEntries, setConsoleEntries] = useState<ConsoleEntry[]>([]);
  const [saveState, setSaveState] = useState<"saved" | "saving">("saved");

  const [library, setLibrary] = useState<SavedProject[]>([]);
  const [currentSavedId, setCurrentSavedId] = useState<string | null>(null);

  const [filesOpen, setFilesOpen] = useState(false);
  const [libraryOpen, setLibraryOpen] = useState(false);
  const [templatesOpen, setTemplatesOpen] = useState(false);
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [shortcutsOpen, setShortcutsOpen] = useState(false);
  const [saveOpen, setSaveOpen] = useState(false);
  const [saveAsMode, setSaveAsMode] = useState(false);
  const [shareOpen, setShareOpen] = useState(false);
  const [shareUrl, setShareUrl] = useState("");
  const [sharePayload, setSharePayload] = useState("");
  const [previewShareUrl, setPreviewShareUrl] = useState("");
  const [shareMode, setShareMode] = useState<"editor" | "preview">("editor");
  const [confirm, setConfirm] = useState<ConfirmState | null>(null);

  const editorRef = useRef<CodeEditorHandle>(null);
  const workspaceRef = useRef<HTMLDivElement>(null);
  const importRef = useRef<HTMLInputElement>(null);
  const logIdRef = useRef(0);
  const draggingRef = useRef(false);
  const skipAutoRunRef = useRef(true);
  const autoRunRef = useRef(settings.autoRun);
  autoRunRef.current = settings.autoRun;

  const { toasts, push, dismiss } = useToasts();

  /* ---------------------------------------------------------------------- */
  /* Boot: restore settings, session or shared project                      */
  /* ---------------------------------------------------------------------- */
  useEffect(() => {
    const storedSettings = loadSettings();
    setSettings(storedSettings);
    setSplit(storedSettings.split);
    setLibrary(loadLibrary());

    const shared = readShareFromLocation();
    const stored = shared ? null : loadSession();
    const nextSession = shared
      ? { project: shared, activeFileId: shared.entryId }
      : stored ?? createInitialSession();

    setSession(nextSession);
    setDoc(buildDocument(nextSession.project, { consoleBridge: true }));
    setRunId((value) => value + 1);
    skipAutoRunRef.current = true;
    setHydrated(true);

    if (shared) {
      setCurrentSavedId(null);
      push("Shared playground loaded", {
        description: "A copy is now in your editor. Use Share to make a new link.",
        tone: "success",
      });
    }
    // Only run on first mount.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  /* ---------------------------------------------------------------------- */
  /* Theme + settings persistence                                            */
  /* ---------------------------------------------------------------------- */
  useEffect(() => {
    if (!hydrated) return;
    const media = window.matchMedia("(prefers-color-scheme: dark)");
    const apply = () => {
      const dark =
        settings.theme === "dark" ||
        (settings.theme === "system" && media.matches);
      setIsDark(dark);
      document.documentElement.dataset.theme = dark ? "dark" : "light";
      document.documentElement.style.colorScheme = dark ? "dark" : "light";
    };
    apply();
    if (settings.theme === "system") {
      media.addEventListener("change", apply);
      return () => media.removeEventListener("change", apply);
    }
  }, [settings.theme, hydrated]);

  useEffect(() => {
    if (!hydrated) return;
    saveSettings(settings);
  }, [settings, hydrated]);

  /* ---------------------------------------------------------------------- */
  /* Autosave session                                                        */
  /* ---------------------------------------------------------------------- */
  useEffect(() => {
    if (!hydrated) return;
    setSaveState("saving");
    const timer = window.setTimeout(() => {
      saveSession(project, session.activeFileId);
      setSaveState("saved");
    }, 420);
    return () => window.clearTimeout(timer);
  }, [project, session.activeFileId, hydrated]);

  /* ---------------------------------------------------------------------- */
  /* Preview                                                                 */
  /* ---------------------------------------------------------------------- */
  const run = useCallback(
    () => {
      setDoc(buildDocument(project, { consoleBridge: true }));
      setRunId((value) => value + 1);
      setRunState("running");
      setStale(false);
      setConsoleEntries([]);
    },
    [project],
  );

  useEffect(() => {
    if (!hydrated) return;
    if (skipAutoRunRef.current) {
      skipAutoRunRef.current = false;
      return;
    }
    if (!autoRunRef.current) {
      setStale(true);
      return;
    }
    const timer = window.setTimeout(() => {
      run();
    }, 600);
    return () => window.clearTimeout(timer);
  }, [project, hydrated, run]);

  const handleReady = useCallback(() => {
    setRunState("ready");
  }, []);

  const handleLog = useCallback((entry: Omit<ConsoleEntry, "id">) => {
    logIdRef.current += 1;
    const id = logIdRef.current;
    setConsoleEntries((entries) => {
      const next = [...entries, { ...entry, id }];
      return next.length > 200 ? next.slice(next.length - 200) : next;
    });
  }, []);

  const clearConsole = useCallback(() => setConsoleEntries([]), []);

  const updateSettings = useCallback((patch: Partial<PlaygroundSettings>) => {
    setSettings((current) => ({ ...current, ...patch }));
  }, []);

  const toggleConsole = useCallback(() => {
    setSettings((current) => ({
      ...current,
      showConsole: !current.showConsole,
    }));
  }, []);

  /* ---------------------------------------------------------------------- */
  /* Project + file operations                                               */
  /* ---------------------------------------------------------------------- */
  const updateActiveContent = useCallback(
    (content: string) => {
      setSession((current) => ({
        ...current,
        project: {
          ...current.project,
          files: current.project.files.map((file) =>
            file.id === current.activeFileId ? { ...file, content } : file,
          ),
        },
      }));
    },
    [],
  );

  const selectFile = useCallback((id: string) => {
    setSession((current) => ({ ...current, activeFileId: id }));
    setClosedIds((current) => {
      if (!current.has(id)) return current;
      const next = new Set(current);
      next.delete(id);
      return next;
    });
    setMobileView("editor");
    setCursor({ line: 1, column: 1 });
  }, []);

  const applyProject = useCallback(
    (
      nextProject: Project,
      options: {
        savedId?: string | null;
        toastTitle?: string;
        toastDescription?: string;
      } = {},
    ) => {
      const normalized = ensureProject(nextProject);
      setSession({
        project: normalized,
        activeFileId: normalized.entryId,
      });
      setClosedIds(new Set());
      setCurrentSavedId(options.savedId ?? null);
      setConsoleEntries([]);
      setDoc(buildDocument(normalized, { consoleBridge: true }));
      setRunId((value) => value + 1);
      setSaveState("saved");
      setCursor({ line: 1, column: 1 });
      skipAutoRunRef.current = true;
      clearShareFromLocation();
      if (options.toastTitle) {
        push(options.toastTitle, {
          description: options.toastDescription,
          tone: "success",
        });
      }
    },
    [push],
  );

  const addFile = useCallback(
    (rawName: string) => {
      const name = normalizeFileName(rawName);
      if (!name) return;
      if (project.files.some((file) => file.name.toLowerCase() === name.toLowerCase())) {
        push("That file already exists", { tone: "error" });
        return;
      }
      const file = makeFile(name);
      setSession((current) => ({
        project: {
          ...current.project,
          files: [...current.project.files, file],
        },
        activeFileId: file.id,
      }));
      setClosedIds((current) => {
        const next = new Set(current);
        next.delete(file.id);
        return next;
      });
      setMobileView("editor");
      push(`Added ${name}`, { tone: "success" });
      window.setTimeout(() => editorRef.current?.focus(), 80);
    },
    [project.files, push],
  );

  const renameFile = useCallback(
    (id: string, rawName: string) => {
      const name = normalizeFileName(rawName);
      if (!name) return;
      if (
        project.files.some(
          (file) =>
            file.id !== id && file.name.toLowerCase() === name.toLowerCase(),
        )
      ) {
        push("Another file already uses that name", { tone: "error" });
        return;
      }
      setSession((current) => ({
        ...current,
        project: {
          ...current.project,
          files: current.project.files.map((file) =>
            file.id === id
              ? { ...file, name, kind: kindFromName(name) as FileKind }
              : file,
          ),
        },
      }));
      push("File renamed", { tone: "success" });
    },
    [project.files, push],
  );

  const deleteFile = useCallback(
    (id: string) => {
      if (project.files.length === 1) {
        push("A project needs at least one file", { tone: "error" });
        return;
      }
      const file = project.files.find((item) => item.id === id);
      if (!file) return;
      setConfirm({
        title: `Delete ${file.name}?`,
        description:
          "The file and its contents will be removed from this playground. This cannot be undone.",
        confirmLabel: "Delete file",
        danger: true,
        onConfirm: () => {
          setConfirm(null);
          setSession((current) => {
            const remaining = current.project.files.filter(
              (item) => item.id !== id,
            );
            const nextEntry =
              current.project.entryId === id
                ? remaining.find((item) => item.kind === "html")?.id ??
                  remaining[0].id
                : current.project.entryId;
            const currentIndex = current.project.files.findIndex(
              (item) => item.id === id,
            );
            const fallback =
              remaining[Math.min(currentIndex, remaining.length - 1)];
            return {
              project: {
                ...current.project,
                files: remaining,
                entryId: nextEntry,
              },
              activeFileId:
                current.activeFileId === id
                  ? fallback?.id ?? remaining[0].id
                  : current.activeFileId,
            };
          });
          setClosedIds((current) => {
            const next = new Set(current);
            next.delete(id);
            return next;
          });
          setFilesOpen(false);
          push("File deleted", { tone: "success" });
        },
      });
    },
    [project.files, push],
  );

  const setEntry = useCallback(
    (id: string) => {
      const file = project.files.find((item) => item.id === id);
      if (!file) return;
      if (file.kind !== "html") {
        push("Only HTML files can be the preview entry", {
          description: "Add an .html file or rename this one to use it.",
          tone: "error",
        });
        return;
      }
      setSession((current) => ({
        ...current,
        project: { ...current.project, entryId: id },
      }));
      push(`Preview entry set to ${file.name}`, { tone: "success" });
    },
    [project.files, push],
  );

  const closeTab = useCallback(
    (id: string) => {
      const openFiles = project.files.filter((file) => !closedIds.has(file.id));
      if (openFiles.length <= 1) {
        push("Keep at least one tab open", {
          description: "Open it again from Project files.",
          tone: "error",
        });
        return;
      }
      const index = openFiles.findIndex((file) => file.id === id);
      const fallback = openFiles[index + 1] ?? openFiles[index - 1];
      setClosedIds((current) => {
        const next = new Set(current);
        next.add(id);
        return next;
      });
      if (session.activeFileId === id && fallback) {
        setSession((current) => ({
          ...current,
          activeFileId: fallback.id,
        }));
      }
    },
    [project.files, closedIds, session.activeFileId, push],
  );

  const openFilesDialog = useCallback(() => {
    setFilesOpen(true);
    setLibraryOpen(false);
  }, []);

  const openTemplatesDialog = useCallback(() => {
    setTemplatesOpen(true);
  }, []);

  const openLibraryDialog = useCallback(() => {
    setLibraryOpen(true);
    setFilesOpen(false);
  }, []);

  /* ---------------------------------------------------------------------- */
  /* Library                                                                 */
  /* ---------------------------------------------------------------------- */
  const openSaveDialog = useCallback(
    (asNew = false) => {
      setSaveAsMode(asNew);
      setSaveOpen(true);
    },
    [],
  );

  const persistProject = useCallback(
    (name: string, asNew = false) => {
      const existingId = asNew ? null : currentSavedId;
      const { saved, library: nextLibrary } = saveToLibrary(
        project,
        name,
        existingId,
      );
      setLibrary(nextLibrary);
      setCurrentSavedId(saved.id);
      setSession((current) => ({
        ...current,
        project: { ...current.project, name },
      }));
      setSaveState("saved");
      setSaveOpen(false);
      push("Playground saved", {
        description: `“${name}” is stored in this browser.`,
        tone: "success",
      });
    },
    [project, currentSavedId, push],
  );

  const quickSave = useCallback(() => {
    if (currentSavedId) {
      persistProject(project.name, false);
    } else {
      openSaveDialog(false);
    }
  }, [currentSavedId, project.name, persistProject, openSaveDialog]);

  const openLibraryItem = useCallback(
    (item: SavedProject) => {
      setSession({
        project: item.project,
        activeFileId: item.project.entryId,
      });
      setClosedIds(new Set());
      setCurrentSavedId(item.id);
      setLibrary(markLibraryOpened(item.id));
      setLibraryOpen(false);
      setConsoleEntries([]);
      setDoc(buildDocument(item.project, { consoleBridge: true }));
      setRunId((value) => value + 1);
      setSaveState("saved");
      setCursor({ line: 1, column: 1 });
      skipAutoRunRef.current = true;
      clearShareFromLocation();
      push(`Opened “${item.name}”`, { tone: "success" });
    },
    [push],
  );

  const deleteLibraryItem = useCallback(
    (item: SavedProject) => {
      setConfirm({
        title: "Delete saved playground?",
        description: `“${item.name}” will be removed from this browser.`,
        confirmLabel: "Delete",
        danger: true,
        onConfirm: () => {
          setLibrary(removeFromLibrary(item.id));
          if (currentSavedId === item.id) setCurrentSavedId(null);
          setConfirm(null);
          push("Saved playground deleted", { tone: "success" });
        },
      });
    },
    [currentSavedId, push],
  );

  /* ---------------------------------------------------------------------- */
  /* New / templates / reset                                                 */
  /* ---------------------------------------------------------------------- */
  const startNew = useCallback(() => {
    const next = blankProject();
    applyProject(next, {
      toastTitle: "New playground created",
      toastDescription: "Start typing — everything autosaves in this browser.",
    });
    setRunState("running");
    setMobileView("editor");
  }, [applyProject]);

  const confirmStartNew = useCallback(() => {
    setConfirm({
      title: "Start a new playground?",
      description:
        "The current editor contents will be replaced. Save your work first if you want to keep it.",
      confirmLabel: "Start new",
      onConfirm: () => {
        setConfirm(null);
        startNew();
      },
    });
  }, [startNew]);

  const resetToStarter = useCallback(() => {
    setConfirm({
      title: "Reset to the starter?",
      description:
        "The editor will be replaced with the Hello CodeCanvas example.",
      confirmLabel: "Reset",
      danger: true,
      onConfirm: () => {
        setConfirm(null);
        applyProject(createStarterProject(), {
          toastTitle: "Starter restored",
        });
      },
    });
  }, [applyProject]);

  const pickTemplate = useCallback(
    (template: Template) => {
      applyProject(template.build(), {
        toastTitle: `Loaded “${template.name}”`,
        toastDescription:
          "Edit anything you like. Save a copy to keep it in your library.",
      });
      setTemplatesOpen(false);
      setMobileView("editor");
    },
    [applyProject],
  );

  /* ---------------------------------------------------------------------- */
  /* Share / download / copy / import                                        */
  /* ---------------------------------------------------------------------- */
  const openShare = useCallback(
    (mode: "editor" | "preview" = "editor") => {
      const url = writeShareToLocation(project);
      setShareUrl(url);
      setSharePayload(encodeProject(project));
      setPreviewShareUrl(buildShareUrl(project, "preview"));
      setShareMode(mode);
      setShareOpen(true);
    },
    [project],
  );

  const downloadHtml = useCallback(() => {
    const html = buildExportDocument(project);
    const blob = new Blob([html], { type: "text/html;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const anchor = document.createElement("a");
    anchor.href = url;
    anchor.download = `${slugify(project.name)}.html`;
    document.body.appendChild(anchor);
    anchor.click();
    anchor.remove();
    window.setTimeout(() => URL.revokeObjectURL(url), 2000);
    push("HTML downloaded", {
      description: "CSS and JavaScript are inlined into a single file.",
      tone: "success",
    });
  }, [project, push]);

  const copyActiveFile = useCallback(async () => {
    try {
      await copyText(activeFile.content);
      push(`${activeFile.name} copied`, { tone: "success" });
    } catch {
      push("Could not copy to the clipboard", { tone: "error" });
    }
  }, [activeFile, push]);

  const handleImport = useCallback(
    async (event: React.ChangeEvent<HTMLInputElement>) => {
      const selected = Array.from(event.target.files ?? []);
      event.target.value = "";
      if (!selected.length) return;

      const htmlFile = selected.find((file) => fileKindFromFileName(file.name) === "html");
      const others = selected.filter((file) => file !== htmlFile);

      try {
        if (htmlFile) {
          const text = await htmlFile.text();
          const split = splitHtmlDocument(text, {
            id: "",
            name: htmlFile.name,
          });
          const files = [
            makeFile(normalizeFileName(htmlFile.name) || "index.html", split.html, "html"),
          ];
          if (split.styles.length) {
            files.push(
              makeFile("styles.css", split.styles.join("\n\n"), "css"),
            );
          }
          if (split.scripts.length) {
            files.push(
              makeFile("scripts.js", split.scripts.join("\n\n"), "js"),
            );
          }
          for (const file of others) {
            const content = await file.text();
            files.push(
              makeFile(
                uniqueName(normalizeFileName(file.name), files),
                content,
                fileKindFromFileName(file.name),
              ),
            );
          }

          const title = split.title?.trim();
          applyProject(
            {
              name: title || htmlFile.name.replace(/\.html?$/i, "") || "Imported playground",
              entryId: files[0].id,
              files,
            },
            {
              toastTitle: "HTML file imported",
              toastDescription:
                "Inline styles and scripts were split into their own files.",
            },
          );
        } else {
          const added: ProjectFile[] = [];
          const takenNames = [...project.files];
          for (const file of selected) {
            const content = await file.text();
            const name = uniqueName(
              normalizeFileName(file.name),
              takenNames,
            );
            const created = makeFile(
              name,
              content,
              fileKindFromFileName(file.name),
            );
            takenNames.push(created);
            added.push(created);
          }
          if (added.length) {
            setSession((current) => ({
              ...current,
              project: {
                ...current.project,
                files: [...current.project.files, ...added],
              },
              activeFileId: added[0].id,
            }));
            push(
              `${added.length} file${added.length === 1 ? "" : "s"} imported`,
              { tone: "success" },
            );
          }
        }
      } catch (error) {
        push("Import failed", {
          description: error instanceof Error ? error.message : "Unknown error",
          tone: "error",
        });
      }
    },
    [applyProject, project.files, push],
  );

  /* ---------------------------------------------------------------------- */
  /* Format                                                                  */
  /* ---------------------------------------------------------------------- */
  const formatActiveFile = useCallback(async () => {
    const parsers: Partial<Record<FileKind, string>> = {
      html: "html",
      css: "css",
      js: "babel",
      json: "json",
      markdown: "markdown",
    };
    const parser = parsers[activeFile.kind];
    if (!parser) {
      push("No formatter for this file type", { tone: "error" });
      return;
    }

    try {
      const [prettier, htmlPlugin, postcssPlugin, babelPlugin, estreePlugin, markdownPlugin] =
        await Promise.all([
          import("prettier/standalone"),
          import("prettier/plugins/html"),
          import("prettier/plugins/postcss"),
          import("prettier/plugins/babel"),
          import("prettier/plugins/estree"),
          import("prettier/plugins/markdown"),
        ]);

      const plugins = [
        htmlPlugin.default ?? htmlPlugin,
        postcssPlugin.default ?? postcssPlugin,
        babelPlugin.default ?? babelPlugin,
        estreePlugin.default ?? estreePlugin,
        markdownPlugin.default ?? markdownPlugin,
      ];

      const formatted = await prettier.format(activeFile.content, {
        parser,
        plugins: plugins as never[],
        tabWidth: settings.tabSize,
        printWidth: 90,
        semi: true,
        singleQuote: false,
      });

      updateActiveContent(formatted);
      push(`${activeFile.name} formatted`, { tone: "success" });
    } catch (error) {
      push("Could not format this file", {
        description: error instanceof Error ? error.message.split("\n")[0] : "Unknown error",
        tone: "error",
      });
    }
  }, [activeFile, settings.tabSize, updateActiveContent, push]);

  /* ---------------------------------------------------------------------- */
  /* Splitter                                                                */
  /* ---------------------------------------------------------------------- */
  const onSplitterDown = useCallback((event: React.PointerEvent<HTMLDivElement>) => {
    event.preventDefault();
    draggingRef.current = true;
    setDragging(true);
    event.currentTarget.setPointerCapture(event.pointerId);
  }, []);

  const onSplitterMove = useCallback((event: React.PointerEvent<HTMLDivElement>) => {
    if (!draggingRef.current) return;
    const rect = workspaceRef.current?.getBoundingClientRect();
    if (!rect) return;
    const railWidth = 48;
    const ratio =
      ((event.clientX - rect.left - railWidth) / (rect.width - railWidth)) * 100;
    setSplit(Math.min(78, Math.max(22, ratio)));
  }, []);

  const onSplitterUp = useCallback((event: React.PointerEvent<HTMLDivElement>) => {
    if (!draggingRef.current) return;
    draggingRef.current = false;
    setDragging(false);
    if (event.currentTarget.hasPointerCapture(event.pointerId)) {
      event.currentTarget.releasePointerCapture(event.pointerId);
    }
    setSettings((current) => ({ ...current, split }));
  }, [split]);

  /* ---------------------------------------------------------------------- */
  /* Global keyboard shortcuts                                               */
  /* ---------------------------------------------------------------------- */
  useEffect(() => {
    const onKey = (event: KeyboardEvent) => {
      const mod = event.metaKey || event.ctrlKey;
      if (mod && event.key === "Enter") {
        event.preventDefault();
        run();
        return;
      }
      if (mod && !event.shiftKey && event.key.toLowerCase() === "s") {
        event.preventDefault();
        quickSave();
        return;
      }
      if (
        event.shiftKey &&
        event.altKey &&
        event.key.toLowerCase() === "f"
      ) {
        event.preventDefault();
        void formatActiveFile();
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [run, quickSave, formatActiveFile]);

  /* ---------------------------------------------------------------------- */
  /* Render                                                                  */
  /* ---------------------------------------------------------------------- */
  const visibleFiles = project.files.filter((file) => !closedIds.has(file.id));
  const fileSize = new Blob([activeFile.content]).size;

  return (
    <div className="app">
      <TopBar
        isDark={isDark}
        running={runState === "running"}
        mobileView={mobileView}
        onMobileView={setMobileView}
        onRun={() => run()}
        onSave={quickSave}
        onSaveAs={() => openSaveDialog(true)}
        onShare={() => openShare("editor")}
        onNew={confirmStartNew}
        onOpenFiles={openFilesDialog}
        onOpenTemplates={openTemplatesDialog}
        onOpenLibrary={openLibraryDialog}
        onOpenSettings={() => setSettingsOpen(true)}
        onOpenShortcuts={() => setShortcutsOpen(true)}
        onFormat={() => void formatActiveFile()}
        onDownload={downloadHtml}
        onImport={() => importRef.current?.click()}
        onReset={resetToStarter}
        onToggleTheme={() =>
          updateSettings({ theme: isDark ? "light" : "dark" })
        }
      />

      <div className="workspace" data-mobile-view={mobileView} ref={workspaceRef}>
        <aside className="rail" aria-label="Workspace actions">
          <button
            type="button"
            className="icon-btn"
            onClick={openFilesDialog}
            title="Project files"
            aria-label="Project files"
          >
            <FolderTree size={17} />
          </button>
          <button
            type="button"
            className="icon-btn"
            onClick={openTemplatesDialog}
            title="Templates"
            aria-label="Templates"
          >
            <LayoutTemplate size={17} />
          </button>
          <button
            type="button"
            className="icon-btn"
            onClick={() => editorRef.current?.openSearch()}
            title="Find in file"
            aria-label="Find in file"
          >
            <Search size={17} />
          </button>
          <div className="rail-spacer" />
          <button
            type="button"
            className="icon-btn"
            onClick={openLibraryDialog}
            title="Saved playgrounds"
            aria-label="Saved playgrounds"
          >
            <History size={17} />
          </button>
          <button
            type="button"
            className="icon-btn"
            onClick={() => setShortcutsOpen(true)}
            title="Keyboard shortcuts"
            aria-label="Keyboard shortcuts"
          >
            <Keyboard size={17} />
          </button>
          <Link
            className="icon-btn"
            href="/learn"
            title="Learn HTML, CSS and JavaScript"
            aria-label="Learn HTML, CSS and JavaScript"
          >
            <BookOpen size={17} />
          </Link>
          <button
            type="button"
            className="icon-btn"
            onClick={() => setSettingsOpen(true)}
            title="Settings"
            aria-label="Settings"
          >
            <SettingsIcon size={17} />
          </button>
        </aside>

        <section
          className="editor-pane"
          style={{ width: `${split}%`, flex: "0 0 auto" }}
          aria-label="Code editor"
        >
          <div className="tabsbar" role="tablist" aria-label="Open files">
            {visibleFiles.map((file) => (
              <div
                key={file.id}
                className={cn(
                  "tab",
                  file.id === activeFile.id && "is-active",
                )}
                role="tab"
                aria-selected={file.id === activeFile.id}
              >
                <button
                  type="button"
                  className="tab-main"
                  onClick={() => selectFile(file.id)}
                  title={file.name}
                >
                  <FileKindIcon kind={file.kind} className="tab-kind" />
                  <span className="tab-name">{file.name}</span>
                  {file.id === project.entryId ? (
                    <span className="tab-entry" title="Preview entry" />
                  ) : null}
                </button>
                {visibleFiles.length > 1 ? (
                  <button
                    type="button"
                    className="tab-close"
                    onClick={() => closeTab(file.id)}
                    aria-label={`Close ${file.name}`}
                    title="Close tab (file stays in project)"
                  >
                    <X size={12} />
                  </button>
                ) : null}
              </div>
            ))}
            <button
              type="button"
              className="tab-add"
              onClick={openFilesDialog}
              title="Add a file"
              aria-label="Add a file"
            >
              <Plus size={15} />
            </button>
          </div>

          <CodeEditor
            key={activeFile.id}
            ref={editorRef}
            value={activeFile.content}
            kind={activeFile.kind}
            isDark={isDark}
            fontSize={settings.fontSize}
            tabSize={settings.tabSize}
            wordWrap={settings.wordWrap}
            onChange={updateActiveContent}
            onCursor={setCursor}
          />

          <div className="statusbar">
            <span className="status-item">
              <span
                className={cn(
                  "status-dot",
                  (saveState === "saving" || runState === "running") && "busy",
                )}
              />
              {runState === "running"
                ? "Rendering…"
                : saveState === "saving"
                  ? "Saving…"
                  : "Saved locally"}
            </span>
            {!settings.autoRun && stale ? (
              <button
                type="button"
                className="status-item"
                onClick={() => run()}
                style={{
                  border: 0,
                  background: "transparent",
                  color: "var(--amber)",
                  font: "inherit",
                  padding: 0,
                }}
              >
                Preview out of date — press Run
              </button>
            ) : null}
            <span className="status-spacer" />
            <span className="status-item hide-sm">
              {formatBytes(fileSize)}
            </span>
            <span className="status-item">Ln {cursor.line}, Col {cursor.column}</span>
            <span className="status-item hide-sm">Spaces: {settings.tabSize}</span>
            <span className="status-item hide-sm">UTF-8</span>
            <button
              type="button"
              className="status-link"
              onClick={copyActiveFile}
              title="Copy this file"
            >
              Copy file
            </button>
          </div>
        </section>

        <div
          className={cn("splitter", dragging && "dragging")}
          role="separator"
          aria-label="Resize editor and preview"
          aria-orientation="vertical"
          onPointerDown={onSplitterDown}
          onPointerMove={onSplitterMove}
          onPointerUp={onSplitterUp}
          onPointerCancel={onSplitterUp}
          onDoubleClick={() => setSplit(50)}
          title="Drag to resize · double-click to reset"
        />

        <Preview
          doc={doc}
          runId={runId}
          device={settings.previewDevice}
          onDeviceChange={(device) => updateSettings({ previewDevice: device })}
          consoleOpen={settings.showConsole}
          onToggleConsole={toggleConsole}
          entries={consoleEntries}
          onClearConsole={clearConsole}
          onLog={handleLog}
          onReady={handleReady}
          onRefresh={() => run()}
          onSharePreview={() => openShare("preview")}
        />
      </div>

      <input
        ref={importRef}
        type="file"
        accept=".html,.htm,.css,.js,.mjs,.json,.md,.markdown,.txt"
        multiple
        hidden
        onChange={handleImport}
      />

      <SaveDialog
        open={saveOpen}
        defaultName={project.name}
        isUpdate={Boolean(currentSavedId) && !saveAsMode}
        onClose={() => setSaveOpen(false)}
        onSave={(name) => persistProject(name, saveAsMode)}
      />

      <ShareDialog
        open={shareOpen}
        onClose={() => setShareOpen(false)}
        url={shareUrl}
        previewUrl={previewShareUrl}
        payload={sharePayload}
        initialMode={shareMode}
      />

      <FilesDialog
        open={filesOpen}
        onClose={() => setFilesOpen(false)}
        files={project.files}
        activeFileId={activeFile.id}
        entryId={project.entryId}
        onSelect={selectFile}
        onAdd={addFile}
        onRename={renameFile}
        onDelete={deleteFile}
        onSetEntry={setEntry}
      />

      <LibraryDialog
        open={libraryOpen}
        onClose={() => setLibraryOpen(false)}
        items={library}
        onOpenItem={openLibraryItem}
        onDeleteItem={deleteLibraryItem}
        onSaveCurrent={() => {
          setLibraryOpen(false);
          openSaveDialog(false);
        }}
      />

      <TemplatesDialog
        open={templatesOpen}
        onClose={() => setTemplatesOpen(false)}
        templates={DEFAULT_TEMPLATES}
        onPick={pickTemplate}
      />

      <SettingsDialog
        open={settingsOpen}
        onClose={() => setSettingsOpen(false)}
        settings={settings}
        onChange={updateSettings}
        onReset={() => setSettings({ ...DEFAULT_SETTINGS })}
      />

      <ShortcutsDialog
        open={shortcutsOpen}
        onClose={() => setShortcutsOpen(false)}
      />

      <ConfirmDialog
        open={Boolean(confirm)}
        title={confirm?.title ?? ""}
        description={confirm?.description ?? ""}
        confirmLabel={confirm?.confirmLabel ?? "Confirm"}
        danger={confirm?.danger}
        onClose={() => setConfirm(null)}
        onConfirm={() => confirm?.onConfirm()}
      />

      <Toasts toasts={toasts} onDismiss={dismiss} />
    </div>
  );
}

/* -------------------------------------------------------------------------- */
/* Helpers                                                                    */
/* -------------------------------------------------------------------------- */
function fileKindFromFileName(name: string): FileKind {
  const kind = kindFromName(name);
  return kind;
}

function uniqueName(name: string, files: Array<{ name: string }>): string {
  if (!files.some((file) => file.name.toLowerCase() === name.toLowerCase())) {
    return name;
  }
  const dot = name.lastIndexOf(".");
  const base = dot > 0 ? name.slice(0, dot) : name;
  const ext = dot > 0 ? name.slice(dot) : "";
  let index = 2;
  while (
    files.some(
      (file) => file.name.toLowerCase() === `${base}-${index}${ext}`.toLowerCase(),
    )
  ) {
    index += 1;
  }
  return `${base}-${index}${ext}`;
}

function formatBytes(value: number): string {
  if (value < 1024) return `${value} B`;
  return `${(value / 1024).toFixed(1)} KB`;
}
