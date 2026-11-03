import { NextResponse } from "next/server";
import { deleteShortLink, isTursoConfigured } from "@/lib/shortlinks";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

export async function DELETE(
  _request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id } = await params;

  if (!isTursoConfigured()) {
    return NextResponse.json(
      {
        error:
          "Short links are not configured on this deployment. Set TURSO_DATABASE_URL and TURSO_AUTH_TOKEN.",
      },
      { status: 503 },
    );
  }

  try {
    const ok = await deleteShortLink(id);
    if (!ok) {
      return NextResponse.json(
        { error: "Short link not found or could not be deleted." },
        { status: 404 },
      );
    }
    return NextResponse.json({ ok: true }, { status: 200 });
  } catch (error) {
    console.error("[short-links] could not delete link", error);
    return NextResponse.json(
      { error: "Short links are temporarily unavailable." },
      { status: 503 },
    );
  }
}
