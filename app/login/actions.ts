"use server";

import { cookies, headers } from "next/headers";
import { redirect } from "next/navigation";
import {
  authConfigError,
  checkCredentials,
  clearFailedLogins,
  isLockedOut,
  recordFailedLogin,
} from "@/lib/auth";
import { isDbConfigured } from "@/lib/db";
import { SESSION_COOKIE, SESSION_MAX_AGE, createSessionToken } from "@/lib/session";

export type LoginState = { error?: string };

function safeNext(next: unknown): string {
  const value = typeof next === "string" ? next : "";
  return value.startsWith("/admin") && !value.startsWith("//") ? value : "/admin";
}

export async function loginAction(_prev: LoginState, formData: FormData): Promise<LoginState> {
  const configError = authConfigError();
  if (configError) return { error: configError };
  if (!isDbConfigured()) return { error: "Database belum terhubung (DATABASE_URL belum diatur)." };

  const username = String(formData.get("username") ?? "").trim();
  const password = String(formData.get("password") ?? "");
  const h = await headers();
  const ip = h.get("x-real-ip") || h.get("x-forwarded-for")?.split(",")[0]?.trim() || "unknown";

  try {
    if (await isLockedOut(ip)) {
      return { error: "Terlalu banyak percobaan gagal. Coba lagi dalam 15 menit." };
    }
    if (!checkCredentials(username, password)) {
      await recordFailedLogin(ip);
      await new Promise((r) => setTimeout(r, 700));
      return { error: "Username atau password salah." };
    }
    await clearFailedLogins(ip);
  } catch (err) {
    console.error("Login gagal:", err);
    return { error: "Tidak dapat terhubung ke database. Periksa DATABASE_URL." };
  }

  const store = await cookies();
  store.set(SESSION_COOKIE, await createSessionToken(username), {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: SESSION_MAX_AGE,
  });
  redirect(safeNext(formData.get("next")));
}

export async function logoutAction(): Promise<void> {
  const store = await cookies();
  store.delete(SESSION_COOKIE);
  redirect("/login");
}
