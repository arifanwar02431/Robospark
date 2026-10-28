import "server-only";
import { createHash, timingSafeEqual } from "node:crypto";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { query } from "./db";
import { SESSION_COOKIE, verifySessionToken, type Session } from "./session";

export async function getSession(): Promise<Session | null> {
  const store = await cookies();
  return verifySessionToken(store.get(SESSION_COOKIE)?.value);
}

/** Untuk halaman admin: alihkan ke /login jika belum masuk. */
export async function requireAdmin(): Promise<Session> {
  const session = await getSession();
  if (!session) redirect("/login");
  return session;
}

export function authConfigError(): string | null {
  const missing: string[] = [];
  if (!process.env.ADMIN_PASSWORD) missing.push("ADMIN_PASSWORD");
  if (!process.env.AUTH_SECRET || process.env.AUTH_SECRET.length < 32) missing.push("AUTH_SECRET (min. 32 karakter)");
  return missing.length ? `Environment variable belum diatur: ${missing.join(", ")}.` : null;
}

function safeEqual(a: string, b: string): boolean {
  const ha = createHash("sha256").update(a).digest();
  const hb = createHash("sha256").update(b).digest();
  return timingSafeEqual(ha, hb);
}

export function checkCredentials(username: string, password: string): boolean {
  const expectedUser = process.env.ADMIN_USERNAME || "admin";
  const expectedPass = process.env.ADMIN_PASSWORD;
  if (!expectedPass) return false;
  // Hitung keduanya agar waktu respons tidak membocorkan mana yang salah.
  const userOk = safeEqual(username, expectedUser);
  const passOk = safeEqual(password, expectedPass);
  return userOk && passOk;
}

// ---- Pembatasan percobaan login (5 kali gagal / 15 menit per IP) ----
const MAX_FAILS = 5;
const WINDOW_MINUTES = 15;

export async function isLockedOut(ip: string): Promise<boolean> {
  const rows = await query<{ n: number }>(
    `SELECT count(*)::int AS n FROM login_attempts
     WHERE ip = $1 AND created_at > now() - make_interval(mins => $2)`,
    [ip, WINDOW_MINUTES],
  );
  return (rows[0]?.n ?? 0) >= MAX_FAILS;
}

export async function recordFailedLogin(ip: string): Promise<void> {
  await query(`INSERT INTO login_attempts (ip) VALUES ($1)`, [ip]);
  await query(`DELETE FROM login_attempts WHERE created_at < now() - interval '1 day'`);
}

export async function clearFailedLogins(ip: string): Promise<void> {
  await query(`DELETE FROM login_attempts WHERE ip = $1`, [ip]);
}
