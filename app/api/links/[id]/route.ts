import { NextResponse } from "next/server";
import { deleteShortLink } from "@/lib/shortlinks";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

export async function DELETE(
  _request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id } = await params;
  const ok = await deleteShortLink(id);
  if (!ok) {
    return NextResponse.json(
      { error: "Short link not found or could not be deleted." },
      { status: 404 },
    );
  }
  return NextResponse.json({ ok: true }, { status: 200 });
}
