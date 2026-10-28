import "server-only";
import { Pool, types } from "pg";
import { attachDatabasePool } from "@vercel/functions";
import { SCHEMA_SQL } from "./schema";

// Kembalikan kolom DATE sebagai string "YYYY-MM-DD" (tanpa geser zona waktu).
types.setTypeParser(1082, (value: string) => value);

type GlobalDb = { pool?: Pool; schemaReady?: Promise<void> };
const g = globalThis as unknown as { __db?: GlobalDb };
g.__db ??= {};
const state = g.__db;

// Neon (Vercel Marketplace) mengisi DATABASE_URL; beberapa integrasi lain memakai POSTGRES_URL.
function connectionUrl(): string | undefined {
  return process.env.DATABASE_URL || process.env.POSTGRES_URL;
}

export function isDbConfigured(): boolean {
  return Boolean(connectionUrl());
}

function getPool(): Pool {
  if (state.pool) return state.pool;
  const connectionString = connectionUrl();
  if (!connectionString) {
    throw new Error("DATABASE_URL belum diatur. Hubungkan database di Vercel > Storage.");
  }
  const pool = new Pool({ connectionString, max: 5, idleTimeoutMillis: 5_000 });
  // Menutup koneksi idle dengan benar saat fungsi Vercel di-suspend.
  attachDatabasePool(pool);
  state.pool = pool;
  return pool;
}

function ensureSchema(): Promise<void> {
  state.schemaReady ??= getPool()
    .query(SCHEMA_SQL)
    .then(() => undefined)
    .catch((err) => {
      state.schemaReady = undefined;
      throw err;
    });
  return state.schemaReady;
}

export async function query<T = Record<string, unknown>>(
  text: string,
  params: unknown[] = [],
): Promise<T[]> {
  await ensureSchema();
  const result = await getPool().query(text, params);
  return result.rows as T[];
}
