"use client";

import { useEffect } from "react";

export function OpenInEditor({ payload }: { payload: string }) {
  useEffect(() => {
    window.location.replace(`/#p=${payload}`);
  }, [payload]);

  return (
    <main className="shared-preview-state" aria-live="polite">
      <span className="spinner" />
      <span>Opening the editor…</span>
    </main>
  );
}
