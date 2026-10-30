"use client";

import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import {
  Check,
  Code2,
  Copy,
  ExternalLink,
  Eye,
  FilePlus2,
  Pencil,
  Plus,
  Save,
  Share2,
  Star,
  Trash2,
} from "lucide-react";
import type {
  PlaygroundSettings,
  ProjectFile,
  SavedProject,
  ThemePreference,
} from "@/lib/types";
import type { Template } from "@/lib/templates";
import { FileKindIcon } from "./FileKindIcon";
import { Modal } from "./Modal";
import { copyText } from "@/lib/cn";
import { formatBytes, formatRelativeTime } from "@/lib/project";

/* -------------------------------------------------------------------------- */
/* Save                                                                       */
/* -------------------------------------------------------------------------- */
export function SaveDialog({
  open,
  defaultName,
  isUpdate,
  onClose,
  onSave,
}: {
  open: boolean;
  defaultName: string;
  isUpdate: boolean;
  onClose: () => void;
  onSave: (name: string) => void;
}) {
  const [name, setName] = useState(defaultName);

  useEffect(() => {
    if (open) setName(defaultName);
  }, [open, defaultName]);

  return (
    <Modal
      open={open}
      onClose={onClose}
      title={isUpdate ? "Save playground" : "Save a copy"}
      description="Playgrounds are stored in this browser only — nothing is uploaded."
      small
      footer={
        <>
          <button type="button" className="btn" onClick={onClose}>
            Cancel
          </button>
          <button
            type="button"
            className="btn btn-primary"
            onClick={() => name.trim() && onSave(name.trim())}
            disabled={!name.trim()}
          >
            <Save size={14} />
            {isUpdate ? "Save changes" : "Save playground"}
          </button>
        </>
      }
    >
      <div className="field">
        <label htmlFor="save-name">Playground name</label>
        <input
          id="save-name"
          className="input"
          value={name}
          maxLength={80}
          onChange={(event) => setName(event.target.value)}
          onKeyDown={(event) => {
            if (event.key === "Enter" && name.trim()) onSave(name.trim());
          }}
          placeholder="My awesome page"
        />
        <small>
          You can reopen it later from <strong>Saved playgrounds</strong> in the
          sidebar.
        </small>
      </div>
    </Modal>
  );
}

/* -------------------------------------------------------------------------- */
/* Share                                                                      */
/* -------------------------------------------------------------------------- */
export function ShareDialog({
  open,
  onClose,
  url,
  previewUrl,
  payload,
  initialMode = "editor",
}: {
  open: boolean;
  onClose: () => void;
  url: string;
  previewUrl: string;
  payload: string;
  initialMode?: "editor" | "preview";
}) {
  const [mode, setMode] = useState<"editor" | "preview">(initialMode);
  const [format, setFormat] = useState<"short" | "long">("short");
  const [shortId, setShortId] = useState<string | null>(null);
  const [shortStatus, setShortStatus] = useState<
    "idle" | "loading" | "ready" | "error"
  >("idle");
  const [copied, setCopied] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const requestRef = useRef<string | null>(null);

  const origin = url.startsWith("http")
    ? url.slice(0, url.indexOf("/", url.indexOf("//") + 2))
    : "";

  const shortUrl = shortId
    ? `${origin}/s/${shortId}${mode === "editor" ? "/edit" : ""}`
    : "";
  const longUrl = mode === "preview" ? previewUrl : url;
  const activeUrl = format === "short" ? shortUrl : longUrl;
  const loadingShort = format === "short" && !shortUrl;

  useEffect(() => {
    if (open) {
      setMode(initialMode);
      setCopied(false);
    }
  }, [open, initialMode]);

  useEffect(() => {
    setShortId(null);
    setShortStatus("idle");
    requestRef.current = null;
  }, [payload]);

  useEffect(() => {
    if (!open || format !== "short" || shortId) return;
    if (requestRef.current === payload) return;
    requestRef.current = payload;

    let cancelled = false;
    setShortStatus("loading");

    fetch("/api/links", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ payload }),
    })
      .then(async (response) => {
        if (!response.ok) throw new Error(`status ${response.status}`);
        return (await response.json()) as { id?: unknown };
      })
      .then((data) => {
        if (cancelled) return;
        if (typeof data.id !== "string") throw new Error("missing id");
        setShortId(data.id);
        setShortStatus("ready");
      })
      .catch(() => {
        if (cancelled) return;
        requestRef.current = null;
        setShortStatus("error");
        setFormat("long");
      });

    return () => {
      cancelled = true;
    };
  }, [open, format, payload, shortId]);

  useEffect(() => {
    setCopied(false);
  }, [mode, format]);

  useEffect(() => {
    if (!open || !activeUrl) return;
    const timer = window.setTimeout(() => inputRef.current?.select(), 80);
    return () => window.clearTimeout(timer);
  }, [open, activeUrl]);


  const copy = async () => {
    try {
      await copyText(activeUrl);
      setCopied(true);
      window.setTimeout(() => setCopied(false), 2200);
    } catch {
      inputRef.current?.select();
    }
  };

  const nativeShare = async () => {
    try {
      if (navigator.share) {
        await navigator.share({
          title:
            mode === "preview"
              ? "CodeCanvas preview"
              : "CodeCanvas playground",
          url: activeUrl,
        });
      }
    } catch {
      /* user dismissed */
    }
  };

  const length = activeUrl.length;
  const size =
    length > 30_000
      ? "too-large"
      : length > 8_000
        ? "large"
        : length > 2_000
          ? "medium"
          : "short";
  const sizeNote: Record<typeof size, string> = {
    short: "This link is short and should work anywhere.",
    medium:
      "At this size the link is medium length: it works in browsers and most chat apps, though a few tools may wrap it.",
    large:
      "This link is long, so some chat apps may break it. Downloading the HTML file is more reliable.",
    "too-large":
      "This link is very long and may not work in every app. Download the HTML file instead for a safer copy.",
  };

  return (
    <Modal
      open={open}
      onClose={onClose}
      title="Share this playground"
      description={
        mode === "preview"
          ? format === "short"
            ? "Send a short link that opens the finished page full screen."
            : "Send a clean, full-screen preview. The CodeCanvas editor is not shown."
          : format === "short"
            ? "Send a short link that opens the project in the editor."
            : "The full project is compressed into the link — no account or server needed."
      }
      footer={
        <>
          <span className="left">
            {loadingShort
              ? "Creating short link…"
              : `${activeUrl.length.toLocaleString()} characters`}
            {format === "short" && activeUrl ? (
              <>
                {" · "}
                <Link
                  href="/links"
                  className="manage-links"
                  style={{ textDecoration: "none", marginLeft: 6 }}
                >
                  จัดการลิงก์ทั้งหมด
                </Link>
              </>
            ) : null}
          </span>
          <a
            className="btn"
            href={activeUrl || undefined}
            target="_blank"
            rel="noreferrer"
            style={{ textDecoration: "none" }}
            aria-disabled={!activeUrl || undefined}
            onClick={(event) => {
              if (!activeUrl) event.preventDefault();
            }}
          >
            <ExternalLink size={14} />
            Open
          </a>
          <button
            type="button"
            className="btn btn-primary"
            onClick={copy}
            disabled={!activeUrl}
          >
            {copied ? <Check size={14} /> : <Copy size={14} />}
            {copied ? "Copied!" : "Copy link"}
          </button>
        </>
      }
    >
      <div className="share-mode">
        <span className="share-mode-label">Link type</span>
        <div className="segmented" role="group" aria-label="Link type">
          <button
            type="button"
            className={mode === "editor" ? "is-active" : undefined}
            onClick={() => setMode("editor")}
            aria-pressed={mode === "editor"}
          >
            <Code2 size={12} />
            Editor
          </button>
          <button
            type="button"
            className={mode === "preview" ? "is-active" : undefined}
            onClick={() => setMode("preview")}
            aria-pressed={mode === "preview"}
          >
            <Eye size={12} />
            Preview only
          </button>
        </div>
      </div>

      <p className="share-mode-hint">
        {mode === "preview"
          ? "Recipients see the rendered page in full screen. The CodeCanvas editor is not shown."
          : "Recipients open the project in CodeCanvas with every file, ready to edit their own copy."}
      </p>

      <div className="field">
        <label htmlFor="share-url">
          {format === "short"
            ? mode === "preview"
              ? "Preview-only short link"
              : "Editable short link"
            : mode === "preview"
              ? "Preview-only link"
              : "Editable project link"}
        </label>
        <div className={`code-field${loadingShort ? " is-loading" : ""}`}>
          <input
            id="share-url"
            ref={inputRef}
            className="input"
            readOnly
            value={activeUrl}
            placeholder={loadingShort ? "Creating short link…" : undefined}
            onFocus={(event) => event.currentTarget.select()}
          />
        </div>
        <button
          type="button"
          className="link-btn"
          onClick={() => setFormat(format === "short" ? "long" : "short")}
        >
          {format === "short"
            ? "Use a long link instead (no server needed)"
            : "Use a short link instead"}
        </button>
        {shortStatus === "error" ? (
          <p className="share-error">
            Short links are unavailable right now, so this is a long link. It
            still works, but it can be very long.
          </p>
        ) : null}
      </div>

      <div className="share-note">
        <Share2 size={15} style={{ flex: "0 0 auto", marginTop: 1 }} />
        <span>
          {format === "short"
            ? "The project is saved on CodeCanvas so the link stays short. Anyone with the link can open it; later edits are not included until you share again."
            : (
              <>
                {mode === "preview"
                  ? "Anyone with this link sees the rendered page only. Later edits are not included until you share a new link. "
                  : "Anyone with this link can open a copy of the code. Changes they make stay on their device. "}
                {sizeNote[size]}
              </>
            )}
        </span>
      </div>

      {typeof navigator !== "undefined" && "share" in navigator ? (
        <button
          type="button"
          className="btn"
          style={{ marginTop: 12 }}
          onClick={nativeShare}
        >
          <Share2 size={14} />
          Share with another app
        </button>
      ) : null}
    </Modal>
  );
}

/* -------------------------------------------------------------------------- */
/* Files                                                                      */
/* -------------------------------------------------------------------------- */
export function FilesDialog({
  open,
  onClose,
  files,
  activeFileId,
  entryId,
  onSelect,
  onAdd,
  onRename,
  onDelete,
  onSetEntry,
}: {
  open: boolean;
  onClose: () => void;
  files: ProjectFile[];
  activeFileId: string;
  entryId: string;
  onSelect: (id: string) => void;
  onAdd: (name: string) => void;
  onRename: (id: string, name: string) => void;
  onDelete: (id: string) => void;
  onSetEntry: (id: string) => void;
}) {
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editName, setEditName] = useState("");
  const [newName, setNewName] = useState("");

  useEffect(() => {
    if (!open) {
      setEditingId(null);
      setNewName("");
    }
  }, [open]);

  const commitRename = () => {
    if (editingId && editName.trim()) {
      onRename(editingId, editName.trim());
    }
    setEditingId(null);
  };

  return (
    <Modal
      open={open}
      onClose={onClose}
      title="Project files"
      description={`${files.length} ${files.length === 1 ? "file" : "files"} · the HTML file marked as entry is rendered in the preview.`}
      wide
      footer={
        <>
          <span className="left">
            <Star size={11} style={{ display: "inline", verticalAlign: "-1px" }} />{" "}
            entry file
          </span>
          <button type="button" className="btn" onClick={onClose}>
            Done
          </button>
        </>
      }
    >
      <div className="file-list">
        {files.map((file) => {
          const isEntry = file.id === entryId;
          return (
            <div
              key={file.id}
              className={`file-row${file.id === activeFileId ? " is-active" : ""}`}
            >
              <FileKindIcon kind={file.kind} />
              {editingId === file.id ? (
                <>
                  <input
                    className="input"
                    style={{ height: 28, flex: 1 }}
                    value={editName}
                    autoFocus
                    onChange={(event) => setEditName(event.target.value)}
                    onKeyDown={(event) => {
                      if (event.key === "Enter") commitRename();
                      if (event.key === "Escape") setEditingId(null);
                    }}
                  />
                  <button
                    type="button"
                    className="icon-btn"
                    onClick={commitRename}
                    title="Save name"
                  >
                    <Check size={14} />
                  </button>
                </>
              ) : (
                <>
                  <button
                    type="button"
                    onClick={() => {
                      onSelect(file.id);
                      onClose();
                    }}
                    style={{
                      border: 0,
                      background: "transparent",
                      textAlign: "left",
                      minWidth: 0,
                      flex: 1,
                      padding: 0,
                    }}
                  >
                    <span className="file-name">{file.name}</span>
                    <span
                      style={{
                        display: "block",
                        color: "var(--muted-2)",
                        fontSize: 10.5,
                        marginTop: 2,
                      }}
                    >
                      {formatBytes(new Blob([file.content]).size)}
                      {isEntry ? " · preview entry" : ""}
                    </span>
                  </button>
                  <button
                    type="button"
                    className="icon-btn"
                    onClick={() => onSetEntry(file.id)}
                    title={isEntry ? "Already the entry file" : "Use as preview entry"}
                    aria-label="Use as preview entry"
                    style={{ color: isEntry ? "var(--amber)" : undefined }}
                  >
                    <Star size={14} fill={isEntry ? "currentColor" : "none"} />
                  </button>
                  <button
                    type="button"
                    className="icon-btn"
                    onClick={() => {
                      setEditingId(file.id);
                      setEditName(file.name);
                    }}
                    title="Rename file"
                    aria-label="Rename file"
                  >
                    <Pencil size={14} />
                  </button>
                  <button
                    type="button"
                    className="icon-btn"
                    onClick={() => onDelete(file.id)}
                    title="Delete file"
                    aria-label="Delete file"
                    disabled={files.length === 1}
                  >
                    <Trash2 size={14} />
                  </button>
                </>
              )}
            </div>
          );
        })}
      </div>

      <form
        style={{ display: "flex", gap: 8, marginTop: 14 }}
        onSubmit={(event) => {
          event.preventDefault();
          if (!newName.trim()) return;
          onAdd(newName.trim());
          setNewName("");
        }}
      >
        <input
          className="input"
          value={newName}
          onChange={(event) => setNewName(event.target.value)}
          placeholder="new-file.js"
          aria-label="New file name"
        />
        <button type="submit" className="btn" disabled={!newName.trim()}>
          <FilePlus2 size={14} />
          Add file
        </button>
      </form>
      <p style={{ color: "var(--muted-2)", fontSize: 11.5, margin: "10px 0 0" }}>
        Supported: .html, .css, .js, .json, .md, .txt. CSS and JS files are
        injected into the preview automatically.
      </p>
    </Modal>
  );
}

/* -------------------------------------------------------------------------- */
/* Library                                                                    */
/* -------------------------------------------------------------------------- */
export function LibraryDialog({
  open,
  onClose,
  items,
  onOpenItem,
  onDeleteItem,
  onSaveCurrent,
}: {
  open: boolean;
  onClose: () => void;
  items: SavedProject[];
  onOpenItem: (item: SavedProject) => void;
  onDeleteItem: (item: SavedProject) => void;
  onSaveCurrent: () => void;
}) {
  return (
    <Modal
      open={open}
      onClose={onClose}
      title="Saved playgrounds"
      description="Stored in this browser's local storage."
      wide
      footer={
        <>
          <span className="left">{items.length} saved</span>
          <button type="button" className="btn" onClick={onClose}>
            Close
          </button>
          <button type="button" className="btn btn-primary" onClick={onSaveCurrent}>
            <Plus size={14} />
            Save current
          </button>
        </>
      }
    >
      {!items.length ? (
        <div
          style={{
            padding: "36px 20px",
            textAlign: "center",
            color: "var(--muted)",
            fontSize: 13,
            border: "1px dashed var(--border)",
            borderRadius: 12,
          }}
        >
          <Save size={22} style={{ opacity: 0.6, marginBottom: 8 }} />
          <div>No saved playgrounds yet.</div>
          <div style={{ fontSize: 11.5, marginTop: 4, color: "var(--muted-2)" }}>
            Use Save to keep a copy you can come back to.
          </div>
        </div>
      ) : (
        <div className="file-list">
          {items.map((item) => (
            <div key={item.id} className="file-row">
              <span className="file-kind kind-html">HTML</span>
              <button
                type="button"
                onClick={() => onOpenItem(item)}
                style={{
                  border: 0,
                  background: "transparent",
                  textAlign: "left",
                  minWidth: 0,
                  flex: 1,
                  padding: 0,
                }}
              >
                <span className="file-name">{item.name}</span>
                <span
                  style={{
                    display: "block",
                    color: "var(--muted-2)",
                    fontSize: 10.5,
                    marginTop: 2,
                  }}
                >
                  {item.project.files.length} files · {formatRelativeTime(item.updatedAt)}
                </span>
              </button>
              <button
                type="button"
                className="icon-btn"
                onClick={() => onOpenItem(item)}
                title="Open playground"
                aria-label="Open playground"
              >
                <ExternalLink size={14} />
              </button>
              <button
                type="button"
                className="icon-btn"
                onClick={() => onDeleteItem(item)}
                title="Delete playground"
                aria-label="Delete playground"
              >
                <Trash2 size={14} />
              </button>
            </div>
          ))}
        </div>
      )}
    </Modal>
  );
}

/* -------------------------------------------------------------------------- */
/* Templates                                                                  */
/* -------------------------------------------------------------------------- */
export function TemplatesDialog({
  open,
  onClose,
  templates,
  onPick,
}: {
  open: boolean;
  onClose: () => void;
  templates: Template[];
  onPick: (template: Template) => void;
}) {
  return (
    <Modal
      open={open}
      onClose={onClose}
      title="Start from a template"
      description="A quick way to explore working HTML, CSS and JavaScript."
      wide
      footer={
        <>
          <span className="left">Picking a template replaces the editor contents.</span>
          <button type="button" className="btn" onClick={onClose}>
            Cancel
          </button>
        </>
      }
    >
      <div className="template-grid">
        {templates.map((template) => (
          <button
            key={template.id}
            type="button"
            className="template-card"
            onClick={() => onPick(template)}
          >
            <div
              className="template-art"
              style={{ background: template.gradient }}
            >
              <span className="template-tag">{template.tag}</span>
            </div>
            <div className="template-info">
              <h3>{template.name}</h3>
              <p>{template.description}</p>
            </div>
          </button>
        ))}
      </div>
    </Modal>
  );
}

/* -------------------------------------------------------------------------- */
/* Settings                                                                   */
/* -------------------------------------------------------------------------- */
export function SettingsDialog({
  open,
  onClose,
  settings,
  onChange,
  onReset,
}: {
  open: boolean;
  onClose: () => void;
  settings: PlaygroundSettings;
  onChange: (patch: Partial<PlaygroundSettings>) => void;
  onReset: () => void;
}) {
  const themes: Array<{ id: ThemePreference; label: string }> = [
    { id: "light", label: "Light" },
    { id: "dark", label: "Dark" },
    { id: "system", label: "System" },
  ];

  return (
    <Modal
      open={open}
      onClose={onClose}
      title="Settings"
      description="Preferences are saved in this browser."
      footer={
        <>
          <button
            type="button"
            className="btn btn-ghost left"
            onClick={onReset}
            style={{ color: "var(--muted)" }}
          >
            Reset defaults
          </button>
          <button type="button" className="btn btn-primary" onClick={onClose}>
            Done
          </button>
        </>
      }
    >
      <div className="field">
        <span className="field-label">Appearance</span>
        <div className="segmented" style={{ width: "fit-content" }}>
          {themes.map((theme) => (
            <button
              key={theme.id}
              type="button"
              className={settings.theme === theme.id ? "is-active" : undefined}
              onClick={() => onChange({ theme: theme.id })}
            >
              {theme.label}
            </button>
          ))}
        </div>
      </div>

      <div className="field">
        <label htmlFor="font-size">
          Editor font size <span style={{ color: "var(--muted)" }}>({settings.fontSize}px)</span>
        </label>
        <input
          id="font-size"
          type="range"
          min={11}
          max={24}
          step={1}
          value={settings.fontSize}
          onChange={(event) =>
            onChange({ fontSize: Number(event.target.value) })
          }
          style={{ accentColor: "var(--accent)" }}
        />
      </div>

      <div className="field">
        <span className="field-label">Tab size</span>
        <div className="segmented" style={{ width: "fit-content" }}>
          {[2, 4].map((size) => (
            <button
              key={size}
              type="button"
              className={settings.tabSize === size ? "is-active" : undefined}
              onClick={() => onChange({ tabSize: size })}
            >
              {size} spaces
            </button>
          ))}
        </div>
      </div>

      <div className="switch">
        <div className="switch-text">
          <strong>Auto-run</strong>
          <span>Refresh the preview shortly after you stop typing.</span>
        </div>
        <button
          type="button"
          className="toggle"
          role="switch"
          aria-checked={settings.autoRun}
          aria-label="Auto-run"
          onClick={() => onChange({ autoRun: !settings.autoRun })}
        />
      </div>

      <div className="switch">
        <div className="switch-text">
          <strong>Word wrap</strong>
          <span>Wrap long lines instead of scrolling sideways.</span>
        </div>
        <button
          type="button"
          className="toggle"
          role="switch"
          aria-checked={settings.wordWrap}
          aria-label="Word wrap"
          onClick={() => onChange({ wordWrap: !settings.wordWrap })}
        />
      </div>

      <div className="switch">
        <div className="switch-text">
          <strong>Show console</strong>
          <span>Open the JavaScript console under the preview.</span>
        </div>
        <button
          type="button"
          className="toggle"
          role="switch"
          aria-checked={settings.showConsole}
          aria-label="Show console"
          onClick={() => onChange({ showConsole: !settings.showConsole })}
        />
      </div>
    </Modal>
  );
}

/* -------------------------------------------------------------------------- */
/* Shortcuts                                                                  */
/* -------------------------------------------------------------------------- */
const SHORTCUTS: Array<{ label: string; keys: string[] }> = [
  { label: "Run preview", keys: ["Ctrl/⌘", "Enter"] },
  { label: "Save playground", keys: ["Ctrl/⌘", "S"] },
  { label: "Format current file", keys: ["Shift", "Alt", "F"] },
  { label: "Find in file", keys: ["Ctrl/⌘", "F"] },
  { label: "Replace in file", keys: ["Ctrl/⌘", "H"] },
  { label: "Comment line", keys: ["Ctrl/⌘", "/"] },
  { label: "Indent / outdent", keys: ["Tab"] },
  { label: "Undo / redo", keys: ["Ctrl/⌘", "Z"] },
  { label: "Close dialog or menu", keys: ["Esc"] },
];

export function ShortcutsDialog({
  open,
  onClose,
}: {
  open: boolean;
  onClose: () => void;
}) {
  return (
    <Modal
      open={open}
      onClose={onClose}
      title="Keyboard shortcuts"
      description="Work faster without leaving the editor."
      small
      footer={
        <button type="button" className="btn btn-primary" onClick={onClose}>
          Got it
        </button>
      }
    >
      <div className="shortcut-grid">
        {SHORTCUTS.map((shortcut) => (
          <div key={shortcut.label} className="shortcut-row">
            <span>{shortcut.label}</span>
            <span className="shortcut-keys">
              {shortcut.keys.map((key) => (
                <kbd key={key} className="kbd">
                  {key}
                </kbd>
              ))}
            </span>
          </div>
        ))}
      </div>
    </Modal>
  );
}

/* -------------------------------------------------------------------------- */
/* Confirm                                                                    */
/* -------------------------------------------------------------------------- */
export function ConfirmDialog({
  open,
  title,
  description,
  confirmLabel,
  danger,
  onClose,
  onConfirm,
}: {
  open: boolean;
  title: string;
  description: string;
  confirmLabel: string;
  danger?: boolean;
  onClose: () => void;
  onConfirm: () => void;
}) {
  return (
    <Modal
      open={open}
      onClose={onClose}
      title={title}
      description={description}
      small
      footer={
        <>
          <button type="button" className="btn" onClick={onClose}>
            Cancel
          </button>
          <button
            type="button"
            className={danger ? "btn" : "btn btn-primary"}
            onClick={onConfirm}
            style={
              danger
                ? { color: "var(--red)", borderColor: "rgba(248,113,113,.4)" }
                : undefined
            }
          >
            {confirmLabel}
          </button>
        </>
      }
    >
      <div className="share-note">
        <Star size={14} style={{ flex: "0 0 auto", marginTop: 1, opacity: 0 }} />
        <span>This action can&apos;t be undone in the current session.</span>
      </div>
    </Modal>
  );
}
