// Token sesi admin (JWT HS256). File ini tidak bergantung pada next/headers
// sehingga bisa dipakai juga oleh proxy.ts.
import { SignJWT, jwtVerify } from "jose";

export const SESSION_COOKIE = "admin_session";
export const SESSION_MAX_AGE = 60 * 60 * 24 * 7; // 7 hari

export type Session = { username: string };

function secretKey(): Uint8Array {
  const secret = process.env.AUTH_SECRET;
  if (!secret || secret.length < 32) {
    throw new Error("AUTH_SECRET belum diatur atau kurang dari 32 karakter.");
  }
  return new TextEncoder().encode(secret);
}

// Sidik jari password: jika ADMIN_PASSWORD diganti, semua sesi lama otomatis tidak berlaku.
async function passwordFingerprint(): Promise<string> {
  const data = new TextEncoder().encode(`${process.env.ADMIN_PASSWORD ?? ""}:${process.env.AUTH_SECRET ?? ""}`);
  const hash = new Uint8Array(await crypto.subtle.digest("SHA-256", data));
  return Array.from(hash.slice(0, 12), (b) => b.toString(16).padStart(2, "0")).join("");
}

export async function createSessionToken(username: string): Promise<string> {
  return new SignJWT({ pv: await passwordFingerprint() })
    .setProtectedHeader({ alg: "HS256" })
    .setSubject(username)
    .setIssuedAt()
    .setExpirationTime(`${SESSION_MAX_AGE}s`)
    .sign(secretKey());
}

export async function verifySessionToken(token: string | undefined | null): Promise<Session | null> {
  if (!token) return null;
  try {
    const { payload } = await jwtVerify(token, secretKey(), { algorithms: ["HS256"] });
    const expectedUser = process.env.ADMIN_USERNAME || "admin";
    if (payload.sub !== expectedUser) return null;
    if (payload.pv !== (await passwordFingerprint())) return null;
    return { username: payload.sub };
  } catch {
    return null;
  }
}
