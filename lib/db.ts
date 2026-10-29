import "server-only";
import { Pool, types } from "pg";
import { attachDatabasePool, waitUntil } from "@vercel/functions";
import { SCHEMA_SQL } from "./schema";

// Kembalikan kolom DATE sebagai string "YYYY-MM-DD" (tanpa geser zona waktu).
types.setTypeParser(1082, (value: string) => value);

type GlobalDb = { pool?: Pool; schema?: Promise<void>; schemaStarted?: boolean };
const g = globalThis as unknown as { __db?: GlobalDb };
g.__db ??= {};
const state = g.__db;

// Neon lewat Vercel bisa memberi nama variabel berbeda tergantung "Custom Prefix" saat Connect:
// DATABASE_URL (tanpa prefix), STORAGE_URL (prefix bawaan "STORAGE"), POSTGRES_URL, atau <PREFIX>_URL lain.
const PREFERRED_KEYS = ["DATABASE_URL", "POSTGRES_URL", "STORAGE_URL", "STORAGE_DATABASE_URL", "STORAGE_POSTGRES_URL"];
const isPostgresUrl = (v: string | undefined): v is string => !!v && /^postgres(ql)?:\/\//i.test(v.trim());

export function connectionUrl(): string | undefined {
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
  const pool = new Pool({
    connectionString,
    max: 5,
    // Koneksi yang sudah terbuka dipakai ulang selama 20 detik, jadi klik berikutnya
    // tidak perlu membuka koneksi baru (yang butuh beberapa kali bolak-balik ke database).
    idleTimeoutMillis: 20_000,
    connectionTimeoutMillis: 15_000,
    keepAlive: true,
  });
  pool.on("error", (err) => console.error("Koneksi database terputus:", err.message));
  // Menutup koneksi idle dengan benar saat fungsi Vercel di-suspend.
  attachDatabasePool(pool);
  state.pool = pool;
  return pool;
}

/** Terapkan skema (CREATE ... IF NOT EXISTS). Aman dijalankan berkali-kali. */
function runSchema(): Promise<void> {
  state.schema ??= getPool()
    .query(SCHEMA_SQL)
    .then(() => undefined)
    .catch((err) => {
      state.schema = undefined;
      throw err;
    });
  return state.schema;
}

/**
 * Skema diterapkan sekali per instance di latar belakang, tanpa menahan query pertama.
 * Jika sebuah query gagal karena tabel/kolom belum ada, query itu menunggu skema lalu diulang.
 */
function warmSchema() {
  if (state.schemaStarted) return;
  state.schemaStarted = true;
  const p = runSchema().catch((err) => console.error("Gagal menyiapkan tabel:", err));
  try {
    waitUntil(p);
  } catch {
    /* di luar Vercel: abaikan */
  }
}

const MISSING_SCHEMA = new Set(["42P01", "42703"]); // tabel / kolom belum ada
const isMissingSchema = (err: unknown) =>
  typeof err === "object" && err !== null && MISSING_SCHEMA.has(String((err as { code?: string }).code));

async function withSchema<R>(fn: () => Promise<R>): Promise<R> {
  warmSchema();
  try {
    return await fn();
  } catch (err) {
    if (!isMissingSchema(err)) throw err;
    await runSchema();
    return fn();
  }
}

export type TxQuery = <T = Record<string, unknown>>(text: string, params?: unknown[]) => Promise<T[]>;

/** Jalankan beberapa query dalam satu transaksi (semua berhasil, atau semua dibatalkan). */
export async function transaction<R>(fn: (q: TxQuery) => Promise<R>): Promise<R> {
  return withSchema(async () => {
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
  });
}

export async function query<T = Record<string, unknown>>(text: string, params: unknown[] = []): Promise<T[]> {
  return withSchema(async () => (await getPool().query(text, params)).rows as T[]);
}

/** Waktu satu kali bolak-balik ke database (ms), diukur pada koneksi yang sudah terbuka. */
export async function dbPing(): Promise<number> {
  const pool = getPool();
  await pool.query("SELECT 1"); // buka/hangatkan koneksi
  const start = performance.now();
  await pool.query("SELECT 1");
  return Math.round(performance.now() - start);
}
