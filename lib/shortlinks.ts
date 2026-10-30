import { createHash } from "node:crypto";
import { cache } from "react";
import { del, head, list, put } from "@vercel/blob";
import { decodePayload } from "./share";
import type { StoredShortLink } from "./shortlinks.types";
import type { Project } from "./types";

const PREFIX = "links/";
const ALPHABET = "0123456789abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ";
const ID_LENGTH = 10;

/** Compressed projects larger than this are rejected to protect the store. */
export const MAX_PAYLOAD_LENGTH = 180_000;

/** LZ-string URI-safe output. */
export const PAYLOAD_PATTERN = /^[A-Za-z0-9+\-$=]+$/;

export function isShortId(value: string): boolean {
  return new RegExp(`^[0-9A-Za-z]{${ID_LENGTH}}$`).test(value);
}

/**
 * Content-addressed id: the same project always maps to the same short link,
 * so sharing twice never creates a duplicate record.
 */
export function shortIdForPayload(payload: string): string {
  const digest = createHash("sha256").update(payload).digest();
  let id = "";
  for (let index = 0; index < ID_LENGTH; index += 1) {
    id += ALPHABET[digest[index] % ALPHABET.length];
  }
  return id;
}

function blobPath(id: string): string {
  return `${PREFIX}${id}.json`;
}

export async function createShortLink(payload: string): Promise<string> {
  const id = shortIdForPayload(payload);
  await put(blobPath(id), JSON.stringify({ v: 1, payload }), {
    access: "public",
    addRandomSuffix: false,
    allowOverwrite: true,
    contentType: "application/json",
    cacheControlMaxAge: 60 * 60 * 24 * 365,
  });
  return id;
}

async function fetchPayload(url: string): Promise<string | null> {
  try {
    const load = async () => {
      const response = await fetch(url, { cache: "no-store" });
      return response.ok ? response : null;
    };

    let response = await load();
    if (!response) {
      // A brand new blob can take a moment to reach the public endpoint.
      await new Promise((resolve) => setTimeout(resolve, 200));
      response = await load();
    }
    if (!response) return null;

    const data = (await response.json()) as { payload?: unknown };
    return typeof data.payload === "string" ? data.payload : null;
  } catch {
    return null;
  }
}

export async function readShortPayload(id: string): Promise<string | null> {
  if (!isShortId(id)) return null;
  try {
    const meta = await head(blobPath(id));
    return await fetchPayload(meta.url);
  } catch {
    return null;
  }
}

/** One lookup per request even when metadata and the page both need it. */
export const loadShortProject = cache(
  async (id: string): Promise<Project | null> => {
    const payload = await readShortPayload(id);
    if (!payload) return null;
    return decodePayload(payload);
  },
);

const SUMMARY_LIMIT = 100;

/** Newest first. Reads each payload so the management page can show names. */
export async function listShortLinks(): Promise<StoredShortLink[]> {
  const { blobs } = await list({ prefix: PREFIX, limit: 500 });

  const recent = blobs
    .slice()
    .sort(
      (left, right) =>
        new Date(right.uploadedAt).getTime() -
        new Date(left.uploadedAt).getTime(),
    )
    .slice(0, SUMMARY_LIMIT);

  const items = await Promise.all(
    recent.map(async (blob) => {
      const id = blob.pathname.slice(PREFIX.length).replace(/\.json$/, "");
      const payload = await fetchPayload(blob.url);
      const project = payload ? decodePayload(payload) : null;
      return {
        id,
        name: project?.name ?? "Untitled project",
        size: blob.size,
        createdAt: new Date(blob.uploadedAt).getTime(),
      } satisfies StoredShortLink;
    }),
  );

  return items;
}

export async function deleteShortLink(id: string): Promise<boolean> {
  if (!isShortId(id)) return false;
  try {
    await del(blobPath(id));
    return true;
  } catch {
    return false;
  }
}
