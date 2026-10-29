"use client";

import { useRef, useState } from "react";
import Link from "next/link";
import {
  BookOpen,
  Code2,
  Download,
  FolderTree,
  History,
  Keyboard,
  LayoutTemplate,
  Moon,
  MoreVertical,
  Play,
  Plus,
  RefreshCcw,
  Save,
  Settings,
  Share2,
  Sun,
  Upload,
  Wand2,
} from "lucide-react";
import { Popover } from "./Popover";
import { cn } from "@/lib/cn";

export type MobileView = "editor" | "preview";

interface TopBarProps {
  isDark: boolean;
  running: boolean;
  mobileView: MobileView;
  onMobileView: (view: MobileView) => void;
  onRun: () => void;
  onSave: () => void;
  onSaveAs: () => void;
  onShare: () => void;
  onNew: () => void;
  onOpenFiles: () => void;
  onOpenTemplates: () => void;
  onOpenLibrary: () => void;
  onOpenSettings: () => void;
  onOpenShortcuts: () => void;
  onFormat: () => void;
  onDownload: () => void;
  onImport: () => void;
  onReset: () => void;
  onToggleTheme: () => void;
}

export function TopBar({
  isDark,
  running,
  mobileView,
  onMobileView,
  onRun,
  onSave,
  onSaveAs,
  onShare,
  onNew,
  onOpenFiles,
  onOpenTemplates,
  onOpenLibrary,
  onOpenSettings,
  onOpenShortcuts,
  onFormat,
  onDownload,
  onImport,
  onReset,
  onToggleTheme,
}: TopBarProps) {
  const moreRef = useRef<HTMLButtonElement>(null);
  const [menuOpen, setMenuOpen] = useState(false);

  const closeMenu = () => setMenuOpen(false);
  const run = (action: () => void) => () => {
    closeMenu();
    action();
  };

  return (
    <header className="topbar">
      <Link className="brand" href="/" aria-label="CodeCanvas home">
        <span className="brand-mark">
          <Code2 size={18} strokeWidth={2.4} />
        </span>
        <span className="brand-name">
          Code<b>Canvas</b>
        </span>
      </Link>

      <div className="topbar-center">
        <span className="lang-badge hide-sm" title="HTML5 playground">
          <span className="lang-dot" />
          HTML5
        </span>

        <button
          type="button"
          className="btn btn-primary btn-run"
          onClick={onRun}
          title="Run (Ctrl/⌘ + Enter)"
        >
          <Play size={13} fill="currentColor" />
          <span className="run-label">{running ? "Running" : "Run"}</span>
          <span className="kbd hide-sm" style={{ background: "rgba(0,0,0,.18)", borderColor: "transparent", color: "rgba(255,255,255,.8)" }}>
            ⌘↵
          </span>
        </button>

        <button
          type="button"
          className="btn hide-sm"
          onClick={onSave}
          title="Save to this browser (Ctrl/⌘ + S)"
        >
          <Save size={13} />
          Save
        </button>

        <button
          type="button"
          className="icon-btn hide-sm"
          onClick={onShare}
          title="Create a share link"
          aria-label="Create a share link"
        >
          <Share2 size={15} />
        </button>

        <button
          ref={moreRef}
          type="button"
          className={cn("icon-btn", menuOpen && "is-active")}
          onClick={() => setMenuOpen((value) => !value)}
          title="More actions"
          aria-label="More actions"
          aria-haspopup="menu"
          aria-expanded={menuOpen}
        >
          <MoreVertical size={16} />
        </button>

        <div className="segmented mobile-switch" role="group" aria-label="View">
          <button
            type="button"
            className={cn(mobileView === "editor" && "is-active")}
            onClick={() => onMobileView("editor")}
          >
            Code
          </button>
          <button
            type="button"
            className={cn(mobileView === "preview" && "is-active")}
            onClick={() => onMobileView("preview")}
          >
            Preview
          </button>
        </div>
      </div>

      <div className="topbar-right">
        <button
          type="button"
          className="icon-btn hide-xs"
          onClick={onToggleTheme}
          title={isDark ? "Switch to light theme" : "Switch to dark theme"}
          aria-label="Toggle color theme"
        >
          {isDark ? <Sun size={16} /> : <Moon size={16} />}
        </button>
        <button
          type="button"
          className="icon-btn hide-xs"
          onClick={onOpenSettings}
          title="Editor settings"
          aria-label="Editor settings"
        >
          <Settings size={16} />
        </button>
        <Link className="btn btn-ghost hide-sm" href="/learn">
          <BookOpen size={14} />
          Learn
        </Link>
      </div>

      <Popover
        open={menuOpen}
        anchor={moreRef.current}
        onClose={closeMenu}
        minWidth={230}
      >
        <div className="menu-label">Playground</div>
        <button type="button" className="menu-item" onClick={run(onNew)}>
          <Plus size={14} />
          New playground
        </button>
        <button type="button" className="menu-item" onClick={run(onOpenFiles)}>
          <FolderTree size={14} />
          Project files
        </button>
        <button type="button" className="menu-item" onClick={run(onOpenLibrary)}>
          <History size={14} />
          Saved playgrounds
        </button>
        <button type="button" className="menu-item" onClick={run(onOpenTemplates)}>
          <LayoutTemplate size={14} />
          Templates
        </button>

        <div className="menu-sep" />
        <div className="menu-label">Document</div>
        <button type="button" className="menu-item" onClick={run(onSaveAs)}>
          <Save size={14} />
          Save as…
        </button>
        <button type="button" className="menu-item" onClick={run(onFormat)}>
          <Wand2 size={14} />
          Format file
          <span className="menu-hint">⇧⌥F</span>
        </button>
        <button type="button" className="menu-item" onClick={run(onDownload)}>
          <Download size={14} />
          Download .html
        </button>
        <button type="button" className="menu-item" onClick={run(onImport)}>
          <Upload size={14} />
          Import file…
        </button>

        <div className="menu-sep" />
        <button type="button" className="menu-item" onClick={run(onOpenSettings)}>
          <Settings size={14} />
          Settings
        </button>
        <button type="button" className="menu-item" onClick={run(onOpenShortcuts)}>
          <Keyboard size={14} />
          Keyboard shortcuts
        </button>
        <button type="button" className="menu-item" onClick={run(onReset)}>
          <RefreshCcw size={14} />
          Reset to starter
        </button>
      </Popover>
    </header>
  );
}
