import Link from "next/link";
import { Code2 } from "lucide-react";

export function SharedLinkMissing({
  title,
  description,
}: {
  title: string;
  description: string;
}) {
  return (
    <main className="shared-preview-state">
      <div className="shared-preview-card">
        <span className="shared-preview-icon">
          <Code2 size={22} />
        </span>
        <h1>{title}</h1>
        <p>{description}</p>
        <Link className="btn btn-primary" href="/">
          <Code2 size={14} />
          Open CodeCanvas
        </Link>
      </div>
    </main>
  );
}
