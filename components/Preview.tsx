"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import {
  ChevronDown,
  ExternalLink,
  Monitor,
  RotateCw,
  Share2,
  Smartphone,
  Tablet,
  TerminalSquare,
  Trash2,
} from "lucide-react";
import type { ConsoleEntry, PreviewDevice } from "@/lib/types";
import { cn } from "@/lib/cn";

interface PreviewProps {
  doc: string;
  runId: number;
  device: PreviewDevice;
  onDeviceChange: (device: PreviewDevice) => void;
  consoleOpen: boolean;
  onToggleConsole: () => void;
  entries: ConsoleEntry[];
  onClearConsole: () => void;
  onLog: (entry: Omit<ConsoleEntry, "id">) => void;
  onReady: () => void;
  onRefresh: () => void;
  onSharePreview: () => void;
}

const DEVICES: Array<{ id: PreviewDevice; label: string; icon: typeof Monitor }> = [
  { id: "desktop", label: "Desktop", icon: Monitor },
  { id: "tablet", label: "Tablet", icon: Tablet },
  { id: "mobile", label: "Mobile", icon: Smartphone },
];

export function Preview({
  doc,
  runId,
  device,
  onDeviceChange,
  consoleOpen,
  onToggleConsole,
  entries,
  onClearConsole,
  onLog,
  onReady,
  onRefresh,
  onSharePreview,
}: PreviewProps) {
  const iframeRef = useRef<HTMLIFrameElement>(null);
  const consoleRef = useRef<HTMLDivElement>(null);
  const [loading, setLoading] = useState(true);
  const onLogRef = useRef(onLog);
  const onReadyRef = useRef(onReady);
  onLogRef.current = onLog;
  onReadyRef.current = onReady;

  useEffect(() => {
    setLoading(true);
  }, [doc, runId]);

  useEffect(() => {
    if (!consoleOpen) return;
    const node = consoleRef.current;
    if (node) node.scrollTop = node.scrollHeight;
  }, [entries, consoleOpen]);

  useEffect(() => {
    const onMessage = (event: MessageEvent) => {
      if (event.source !== iframeRef.current?.contentWindow) return;
      const data = event.data as
        | {
            __codecanvas?: boolean;
            kind?: string;
            level?: ConsoleEntry["level"];
            args?: string[];
            time?: number;
          }
        | null;
      if (!data || data.__codecanvas !== true) return;
      if (data.kind === "ready") {
        onReadyRef.current();
        return;
      }
      if (data.level) {
        onLogRef.current({
          level: data.level,
          args: Array.isArray(data.args) ? data.args : [],
          time: typeof data.time === "number" ? data.time : Date.now(),
        });
      }
    };
    window.addEventListener("message", onMessage);
    return () => window.removeEventListener("message", onMessage);
  }, []);

  const openExternal = useCallback(() => {
    const blob = new Blob([doc], { type: "text/html" });
    const url = URL.createObjectURL(blob);
    window.open(url, "_blank", "noopener,noreferrer");
    window.setTimeout(() => URL.revokeObjectURL(url), 60_000);
  }, [doc]);

  const errorCount = useMemo(
    () => entries.filter((entry) => entry.level === "error").length,
    [entries],
  );

  return (
    <section className="preview-pane" aria-label="Live preview">
      <div className="preview-toolbar">
        <span className="preview-label">
          <span className="status-dot" style={{ width: 6, height: 6 }} />
          Preview
        </span>

        <div className="preview-url" title="Preview sandbox">
          <span>/</span>
        </div>

        <div className="device-toggles" role="group" aria-label="Preview size">
          {DEVICES.map((item) => {
            const Icon = item.icon;
            return (
              <button
                key={item.id}
                type="button"
                className={cn("icon-btn", device === item.id && "is-active")}
                onClick={() => onDeviceChange(item.id)}
                title={`${item.label} preview`}
                aria-label={`${item.label} preview`}
                aria-pressed={device === item.id}
              >
                <Icon size={13} />
              </button>
            );
          })}
        </div>

        <button
          type="button"
          className="icon-btn"
          onClick={onRefresh}
          title="Refresh preview"
          aria-label="Refresh preview"
        >
          <RotateCw size={14} className={loading ? "spin" : undefined} />
        </button>
        <button
          type="button"
          className="icon-btn"
          onClick={openExternal}
          title="Open preview in a new tab"
          aria-label="Open preview in a new tab"
        >
          <ExternalLink size={14} />
        </button>
        <button
          type="button"
          className="icon-btn"
          onClick={onSharePreview}
          title="Create a preview-only link"
          aria-label="Create a preview-only link"
        >
          <Share2 size={14} />
        </button>
      </div>

      <div className="preview-stage">
        <div className="device-shell" data-device={device}>
          <iframe
            key={`${runId}-${doc.length}`}
            ref={iframeRef}
            className="preview-iframe"
            title="Rendered preview"
            srcDoc={doc}
            sandbox="allow-scripts allow-modals allow-popups allow-forms allow-downloads allow-pointer-lock"
            onLoad={() => {
              setLoading(false);
              onReady();
            }}
          />
        </div>
        {loading ? (
          <div className="preview-loading">
            <span className="spinner" />
            Rendering…
          </div>
        ) : null}
      </div>

      <div className="console" data-open={consoleOpen}>
        <div className="console-head">
          <button
            type="button"
            className="console-title"
            onClick={onToggleConsole}
            aria-expanded={consoleOpen}
          >
            <ChevronDown
              size={13}
              style={{
                transform: consoleOpen ? "none" : "rotate(-90deg)",
                transition: "transform 140ms",
              }}
            />
            <TerminalSquare size={13} />
            Console
            {entries.length ? (
              <span
                className="console-count"
                style={
                  errorCount
                    ? { color: "var(--red)", borderColor: "rgba(248,113,113,.35)" }
                    : undefined
                }
              >
                {entries.length}
              </span>
            ) : null}
          </button>

          <div style={{ flex: 1 }} />

          {consoleOpen ? (
            <>
              <span style={{ color: "var(--muted-2)", fontSize: 10.5 }}>
                sandboxed iframe
              </span>
              <button
                type="button"
                className="icon-btn"
                onClick={onClearConsole}
                title="Clear console"
                aria-label="Clear console"
                style={{ width: 26, height: 26 }}
              >
                <Trash2 size={13} />
              </button>
            </>
          ) : null}
        </div>

        {consoleOpen ? (
          <div className="console-body" role="log" aria-live="polite" ref={consoleRef}>
            {!entries.length ? (
              <div className="console-empty">
                <TerminalSquare size={18} />
                <span>
                  Console output shows up here.
                  <br />
                  Try <code style={{ color: "var(--pink)" }}>console.log(&quot;hi&quot;)</code>
                </span>
              </div>
            ) : (
              entries.map((entry) => (
                <div
                  key={entry.id}
                  className="log-row"
                  data-level={entry.level}
                >
                  <span className="log-time">
                    {new Date(entry.time).toLocaleTimeString([], {
                      hour12: false,
                      hour: "2-digit",
                      minute: "2-digit",
                      second: "2-digit",
                    })}
                  </span>
                  <span className="log-args">
                    {entry.args.length ? (
                      entry.args.map((arg, index) => (
                        <span key={index}>{arg}</span>
                      ))
                    ) : (
                      <span style={{ color: "var(--muted-2)" }}>
                        (empty message)
                      </span>
                    )}
                  </span>
                </div>
              ))
            )}
          </div>
        ) : null}
      </div>
    </section>
  );
}
