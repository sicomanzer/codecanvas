import { createHash } from "node:crypto";
import { cache } from "react";
import { head, put } from "@vercel/blob";
import { decodePayload } from "./share";
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

export async function readShortPayload(id: string): Promise<string | null> {
  if (!isShortId(id)) return null;
  try {
    const meta = await head(blobPath(id));
    const load = async () => {
      const response = await fetch(meta.url, { cache: "no-store" });
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

/** One lookup per request even when metadata and the page both need it. */
export const loadShortProject = cache(
  async (id: string): Promise<Project | null> => {
    const payload = await readShortPayload(id);
    if (!payload) return null;
    return decodePayload(payload);
  },
);
