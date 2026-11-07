import { createHash } from "node:crypto";
import { cache } from "react";
import { createClient, type Client } from "@libsql/client";
import { decodePayload } from "./share";
import type { StoredShortLink } from "./shortlinks.types";
import type { Project } from "./types";

const TABLE = "short_links";
const ALPHABET = "0123456789abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ";
const ID_LENGTH = 10;
const LIST_LIMIT = 100;

/** Compressed projects larger than this are rejected to protect the database. */
export const MAX_PAYLOAD_LENGTH = 1_000_000;

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

/** Whether the deployment has a Turso database configured. */
export function isTursoConfigured(): boolean {
  return Boolean(process.env.TURSO_DATABASE_URL?.trim());
}

let client: Client | null = null;
let schemaReady: Promise<void> | null = null;

function getClient(): Client {
  const url = process.env.TURSO_DATABASE_URL?.trim();
  if (!url) {
    throw new Error(
      "TURSO_DATABASE_URL is not set. Add it to .env.local or the deployment environment.",
    );
  }

  if (!client) {
    client = createClient({
      url,
      authToken: process.env.TURSO_AUTH_TOKEN?.trim() || undefined,
    });
  }

  return client;
}

/**
 * Create the table on first use. `CREATE TABLE IF NOT EXISTS` is cheap and
 * keeps a fresh Turso database usable without a separate migration step.
 */
function ensureSchema(): Promise<Client> {
  if (!schemaReady) {
    const db = getClient();
    schemaReady = (async () => {
      await db.execute(`
        CREATE TABLE IF NOT EXISTS ${TABLE} (
          id         TEXT PRIMARY KEY,
          payload    TEXT NOT NULL,
          name       TEXT NOT NULL,
          size       INTEGER NOT NULL,
          created_at INTEGER NOT NULL
        )
      `);
      await db.execute(`
        CREATE INDEX IF NOT EXISTS ${TABLE}_created_at
        ON ${TABLE} (created_at DESC)
      `);
    })().catch((error) => {
      // Let the next request try again after a cold-start or network failure.
      schemaReady = null;
      throw error;
    });
  }

  return schemaReady.then(() => getClient());
}

export async function createShortLink(payload: string): Promise<string> {
  const id = shortIdForPayload(payload);
  const project = decodePayload(payload);
  const name = project?.name.trim() || "Untitled project";
  const db = await ensureSchema();

  await db.execute({
    sql: `
      INSERT INTO ${TABLE} (id, payload, name, size, created_at)
      VALUES (?, ?, ?, ?, ?)
      ON CONFLICT(id) DO UPDATE SET
        payload = excluded.payload,
        name    = excluded.name,
        size    = excluded.size
    `,
    args: [
      id,
      payload,
      name,
      Buffer.byteLength(payload, "utf8"),
      Date.now(),
    ],
  });

  return id;
}

export async function readShortPayload(id: string): Promise<string | null> {
  if (!isShortId(id)) return null;

  try {
    const db = await ensureSchema();
    const result = await db.execute({
      sql: `SELECT payload FROM ${TABLE} WHERE id = ? LIMIT 1`,
      args: [id],
    });
    const row = result.rows[0];
    return row && typeof row.payload === "string" ? row.payload : null;
  } catch (error) {
    console.error("[short-links] could not read link", error);
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

/** Newest first. */
export async function listShortLinks(): Promise<StoredShortLink[]> {
  const db = await ensureSchema();
  const result = await db.execute(
    `SELECT id, name, size, created_at FROM ${TABLE} ORDER BY created_at DESC LIMIT ${LIST_LIMIT}`,
  );

  return result.rows.map((row) => ({
    id: String(row.id),
    name: String(row.name ?? "Untitled project"),
    size: Number(row.size ?? 0),
    createdAt: Number(row.created_at ?? 0),
  }));
}

export async function deleteShortLink(id: string): Promise<boolean> {
  if (!isShortId(id)) return false;

  const db = await ensureSchema();
  const result = await db.execute({
    sql: `DELETE FROM ${TABLE} WHERE id = ?`,
    args: [id],
  });

  return result.rowsAffected > 0;
}
