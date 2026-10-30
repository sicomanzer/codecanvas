import type { Metadata } from "next";
import { OpenInEditor } from "@/components/OpenInEditor";
import { SharedLinkMissing } from "@/components/SharedLinkMissing";
import { readShortPayload } from "@/lib/shortlinks";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Opening project",
  robots: { index: false, follow: false },
};

export default async function ShortEditPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const payload = await readShortPayload(id);

  if (!payload) {
    return (
      <SharedLinkMissing
        title="This link is not available"
        description="The short link is unknown, or the shared project has been removed. Ask the person who shared it for a new link."
      />
    );
  }

  return <OpenInEditor payload={payload} />;
}
