import Link from "next/link";
import { Code2, Play } from "lucide-react";

export function SiteHeader() {
  return (
    <header className="doc-nav">
      <Link className="brand" href="/" aria-label="CodeCanvas home">
        <span className="brand-mark">
          <Code2 size={18} strokeWidth={2.4} />
        </span>
        <span className="brand-name">
          Code<b>Canvas</b>
        </span>
      </Link>

      <nav className="doc-nav-links" aria-label="Main navigation">
        <Link href="/learn">Learn</Link>
        <Link href="/learn#shortcuts">Shortcuts</Link>
        <Link href="/learn#faq">FAQ</Link>
        <Link className="btn btn-primary" href="/">
          <Play size={13} fill="currentColor" />
          Open playground
        </Link>
      </nav>
    </header>
  );
}
