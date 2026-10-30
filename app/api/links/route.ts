import { NextResponse } from "next/server";
import { decodePayload } from "@/lib/share";
import {
  MAX_PAYLOAD_LENGTH,
  PAYLOAD_PATTERN,
  createShortLink,
} from "@/lib/shortlinks";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function POST(request: Request) {
  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON body." }, { status: 400 });
  }

  const payload =
    typeof body === "object" && body !== null
      ? (body as { payload?: unknown }).payload
      : undefined;

  if (
    typeof payload !== "string" ||
    payload.length < 8 ||
    payload.length > MAX_PAYLOAD_LENGTH ||
    !PAYLOAD_PATTERN.test(payload)
  ) {
    return NextResponse.json(
      { error: "The project payload is missing or too large." },
      { status: 400 },
    );
  }

  if (!decodePayload(payload)) {
    return NextResponse.json(
      { error: "The project payload could not be decoded." },
      { status: 400 },
    );
  }

  try {
    const id = await createShortLink(payload);
    return NextResponse.json(
      { id },
      { headers: { "cache-control": "no-store" } },
    );
  } catch (error) {
    console.error("[short-links] could not store project", error);
    return NextResponse.json(
      { error: "Short links are temporarily unavailable." },
      { status: 503 },
    );
  }
}
