import type { Metadata } from "next";
import { buildDocument } from "@/lib/preview";
import { loadShortProject } from "@/lib/shortlinks";
import { SharedLinkMissing } from "@/components/SharedLinkMissing";

export const dynamic = "force-dynamic";

interface PageProps {
  params: Promise<{ id: string }>;
}

export async function generateMetadata({
  params,
}: PageProps): Promise<Metadata> {
  const { id } = await params;
  const project = await loadShortProject(id);

  if (!project) {
    return {
      title: "Link not found",
      robots: { index: false, follow: false },
    };
  }

  const description = `A preview of “${project.name}” built with CodeCanvas.`;
  return {
    title: `${project.name} — preview`,
    description,
    robots: { index: false, follow: false },
    openGraph: {
      title: project.name,
      description,
      type: "article",
    },
  };
}

export default async function ShortPreviewPage({ params }: PageProps) {
  const { id } = await params;
  const project = await loadShortProject(id);

  if (!project) {
    return (
      <SharedLinkMissing
        title="This link is not available"
        description="The short link is unknown, or the shared project has been removed. Ask the person who shared it for a new link."
      />
    );
  }

  return (
    <main className="shared-preview">
      <iframe
        className="shared-preview-frame"
        title={`${project.name} — preview`}
        srcDoc={buildDocument(project, { consoleBridge: false })}
        sandbox="allow-scripts allow-modals allow-popups allow-forms allow-downloads allow-pointer-lock"
        referrerPolicy="no-referrer"
      />
    </main>
  );
}
