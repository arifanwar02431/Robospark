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

// Neon lewat Vercel bisa memberi nama variabel berbeda tergantung "Custom Prefix" saat Connect:
// DATABASE_URL (tanpa prefix), STORAGE_URL (prefix bawaan "STORAGE"), POSTGRES_URL, atau <PREFIX>_URL lain.
const PREFERRED_KEYS = ["DATABASE_URL", "POSTGRES_URL", "STORAGE_URL", "STORAGE_DATABASE_URL", "STORAGE_POSTGRES_URL"];
const isPostgresUrl = (v: string | undefined): v is string => !!v && /^postgres(ql)?:\/\//i.test(v.trim());

function connectionUrl(): string | undefined {
  for (const key of PREFERRED_KEYS) {
    const value = process.env[key];
    if (isPostgresUrl(value)) return value.trim();
  }
  // Cadangan: variabel apa pun berakhiran _URL yang berisi alamat Postgres (koneksi pooled diutamakan).
  const keys = Object.keys(process.env)
    .filter((k) => k.endsWith("_URL") && !/UNPOOLED|NON_POOLING|NO_SSL/.test(k))
    .sort();
  for (const key of keys) {
    const value = process.env[key];
    if (isPostgresUrl(value)) return value.trim();
  }
  return undefined;
}

export function isDbConfigured(): boolean {
  return Boolean(connectionUrl());
}

function getPool(): Pool {
  if (state.pool) return state.pool;
  const connectionString = connectionUrl();
  if (!connectionString) {
    throw new Error("Alamat database belum diatur. Isi DATABASE_URL di Vercel → Settings → Environment Variables.");
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

export type TxQuery = <T = Record<string, unknown>>(text: string, params?: unknown[]) => Promise<T[]>;

/** Jalankan beberapa query dalam satu transaksi (semua berhasil, atau semua dibatalkan). */
export async function transaction<R>(fn: (q: TxQuery) => Promise<R>): Promise<R> {
  await ensureSchema();
  const client = await getPool().connect();
  try {
    await client.query("BEGIN");
    const q: TxQuery = async (text, params = []) => (await client.query(text, params)).rows;
    const result = await fn(q);
    await client.query("COMMIT");
    return result;
  } catch (err) {
    await client.query("ROLLBACK").catch(() => {});
    throw err;
  } finally {
    client.release();
  }
}

export async function query<T = Record<string, unknown>>(
  text: string,
  params: unknown[] = [],
): Promise<T[]> {
  await ensureSchema();
  const result = await getPool().query(text, params);
  return result.rows as T[];
}
