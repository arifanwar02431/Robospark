import { timingSafeEqual } from "node:crypto";
import { runReminders } from "@/lib/reminders";

export const dynamic = "force-dynamic";
export const maxDuration = 60;

function authorized(request: Request): boolean {
  const secret = process.env.CRON_SECRET;
  if (!secret) return false;
  const given = Buffer.from(request.headers.get("authorization") ?? "");
  const expected = Buffer.from(`Bearer ${secret}`);
  return given.length === expected.length && timingSafeEqual(given, expected);
}

// Dipanggil Vercel Cron setiap hari (lihat vercel.json). Vercel otomatis
// menambahkan header "Authorization: Bearer <CRON_SECRET>".
export async function GET(request: Request) {
  if (!authorized(request)) {
    return Response.json({ ok: false, error: "Unauthorized" }, { status: 401 });
  }
  try {
    const result = await runReminders();
    console.log("Pengingat dijalankan:", result);
    return Response.json({ ok: true, ...result });
  } catch (err) {
    console.error("Gagal menjalankan pengingat:", err);
    return Response.json({ ok: false, error: err instanceof Error ? err.message : "Unknown error" }, { status: 500 });
  }
}
