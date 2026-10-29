import type { FileKind, ProjectFile } from "@/lib/types";
import { cn } from "@/lib/cn";

const LABELS: Record<FileKind, string> = {
  html: "HTML",
  css: "CSS",
  js: "JS",
  json: "{ }",
  markdown: "MD",
  text: "TXT",
};

export function FileKindIcon({
  kind,
  className,
}: {
  kind: FileKind;
  className?: string;
}) {
  return (
    <span className={cn("file-kind", `kind-${kind}`, className)} aria-hidden="true">
      {LABELS[kind]}
    </span>
  );
}

export function FileTypeLabel({ file }: { file: ProjectFile }) {
  return <FileKindIcon kind={file.kind} />;
}
