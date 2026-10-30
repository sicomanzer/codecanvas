"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Code2, MonitorPlay } from "lucide-react";
import { buildDocument } from "@/lib/preview";
import { readShareFromLocation } from "@/lib/share";
import type { Project } from "@/lib/types";

type PreviewState =
  | { status: "loading" }
  | { status: "ready"; project: Project; doc: string }
  | { status: "invalid" };

export function PreviewShare() {
  const [state, setState] = useState<PreviewState>({ status: "loading" });

  useEffect(() => {
    const load = () => {
      const project = readShareFromLocation();
      if (!project) {
        setState({ status: "invalid" });
        return;
      }
      setState({
        status: "ready",
        project,
        doc: buildDocument(project, { consoleBridge: false }),
      });
      document.title = `${project.name} · CodeCanvas preview`;
    };

    load();
    window.addEventListener("hashchange", load);
    return () => window.removeEventListener("hashchange", load);
  }, []);

  if (state.status === "loading") {
    return (
      <main className="shared-preview-state" aria-live="polite">
        <span className="spinner" />
        <span>Loading preview…</span>
      </main>
    );
  }

  if (state.status === "invalid") {
    return (
      <main className="shared-preview-state">
        <div className="shared-preview-card">
          <span className="shared-preview-icon">
            <MonitorPlay size={22} />
          </span>
          <h1>This preview link is incomplete</h1>
          <p>
            The link does not contain a project. Ask the person who shared it
            for a new preview-only link.
          </p>
          <Link className="btn btn-primary" href="/">
            <Code2 size={14} />
            Open CodeCanvas
          </Link>
        </div>
      </main>
    );
  }

  return (
    <main className="shared-preview">
      <iframe
        className="shared-preview-frame"
        title={`${state.project.name} — preview`}
        srcDoc={state.doc}
        sandbox="allow-scripts allow-modals allow-popups allow-forms allow-downloads allow-pointer-lock"
        referrerPolicy="no-referrer"
      />
    </main>
  );
}
