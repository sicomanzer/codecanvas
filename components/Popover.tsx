"use client";

import { useEffect, useLayoutEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";

interface PopoverProps {
  open: boolean;
  anchor: HTMLElement | null;
  onClose: () => void;
  children: React.ReactNode;
  align?: "start" | "end";
  minWidth?: number;
}

export function Popover({
  open,
  anchor,
  onClose,
  children,
  align = "end",
  minWidth = 210,
}: PopoverProps) {
  const ref = useRef<HTMLDivElement>(null);
  const [position, setPosition] = useState<{ top: number; left: number } | null>(
    null,
  );

  useLayoutEffect(() => {
    if (!open || !anchor) return;
    const update = () => {
      const rect = anchor.getBoundingClientRect();
      const width = ref.current?.offsetWidth ?? minWidth;
      const left =
        align === "end"
          ? Math.min(window.innerWidth - width - 8, rect.right - width)
          : Math.min(window.innerWidth - width - 8, rect.left);
      const top = Math.min(window.innerHeight - 60, rect.bottom + 6);
      setPosition({ top, left: Math.max(8, left) });
    };
    update();
    window.addEventListener("resize", update);
    window.addEventListener("scroll", update, true);
    return () => {
      window.removeEventListener("resize", update);
      window.removeEventListener("scroll", update, true);
    };
  }, [open, anchor, align, minWidth]);

  useEffect(() => {
    if (!open) return;
    const onDown = (event: MouseEvent) => {
      const target = event.target as Node;
      if (ref.current?.contains(target) || anchor?.contains(target)) return;
      onClose();
    };
    const onKey = (event: KeyboardEvent) => {
      if (event.key === "Escape") onClose();
    };
    document.addEventListener("mousedown", onDown);
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("mousedown", onDown);
      document.removeEventListener("keydown", onKey);
    };
  }, [open, anchor, onClose]);

  if (!open || typeof document === "undefined") return null;

  return createPortal(
    <div
      ref={ref}
      className="menu"
      style={{
        top: position?.top ?? -9999,
        left: position?.left ?? -9999,
        minWidth,
      }}
      role="menu"
    >
      {children}
    </div>,
    document.body,
  );
}
