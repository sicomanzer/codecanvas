"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { AlertTriangle, CheckCircle2, Info } from "lucide-react";

export interface ToastItem {
  id: number;
  title: string;
  description?: string;
  tone?: "default" | "success" | "error";
}

export function useToasts() {
  const [toasts, setToasts] = useState<ToastItem[]>([]);
  const counter = useRef(0);
  const timers = useRef<number[]>([]);

  const dismiss = useCallback((id: number) => {
    setToasts((items) => items.filter((item) => item.id !== id));
  }, []);

  const push = useCallback(
    (title: string, options: { description?: string; tone?: ToastItem["tone"] } = {}) => {
      counter.current += 1;
      const id = counter.current;
      setToasts((items) => [
        ...items.slice(-3),
        { id, title, description: options.description, tone: options.tone },
      ]);
      const timer = window.setTimeout(() => dismiss(id), 4200);
      timers.current.push(timer);
      return id;
    },
    [dismiss],
  );

  useEffect(
    () => () => {
      for (const timer of timers.current) window.clearTimeout(timer);
    },
    [],
  );

  return { toasts, push, dismiss };
}

export function Toasts({
  toasts,
  onDismiss,
}: {
  toasts: ToastItem[];
  onDismiss: (id: number) => void;
}) {
  if (!toasts.length) return null;
  return (
    <div className="toasts" aria-live="polite" aria-atomic="false">
      {toasts.map((toast) => (
        <div key={toast.id} className="toast" data-tone={toast.tone}>
          <span className="toast-icon">
            {toast.tone === "error" ? (
              <AlertTriangle size={15} color="var(--red)" />
            ) : toast.tone === "success" ? (
              <CheckCircle2 size={15} color="var(--green)" />
            ) : (
              <Info size={15} color="var(--accent)" />
            )}
          </span>
          <div>
            <div className="toast-title">{toast.title}</div>
            {toast.description ? (
              <div className="toast-desc">{toast.description}</div>
            ) : null}
          </div>
          <button
            type="button"
            className="icon-btn"
            style={{ width: 22, height: 22, marginLeft: "auto" }}
            onClick={() => onDismiss(toast.id)}
            aria-label="Dismiss notification"
          >
            ×
          </button>
        </div>
      ))}
    </div>
  );
}
