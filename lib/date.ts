// Semua perhitungan tanggal memakai zona waktu Asia/Jakarta (WIB).
export const TIME_ZONE = "Asia/Jakarta";

export const DAY_NAMES = ["", "Senin", "Selasa", "Rabu", "Kamis", "Jumat", "Sabtu", "Minggu"] as const;

/** Tanggal hari ini di WIB, format YYYY-MM-DD. */
export function todayJakarta(now: Date = new Date()): string {
  return new Intl.DateTimeFormat("en-CA", {
    timeZone: TIME_ZONE,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).format(now);
}

function toUtcDate(date: string): Date {
  const [y, m, d] = date.split("-").map(Number);
  return new Date(Date.UTC(y, m - 1, d));
}

export function addDays(date: string, days: number): string {
  const dt = toUtcDate(date);
  dt.setUTCDate(dt.getUTCDate() + days);
  return dt.toISOString().slice(0, 10);
}

/** Selisih hari (a - b). */
export function diffDays(a: string, b: string): number {
  return Math.round((toUtcDate(a).getTime() - toUtcDate(b).getTime()) / 86_400_000);
}

/** Hari ISO: 1 = Senin ... 7 = Minggu. */
export function isoDayOfWeek(date: string): number {
  const day = toUtcDate(date).getUTCDay();
  return day === 0 ? 7 : day;
}

export function formatDate(date: string, style: "long" | "medium" | "short" = "long"): string {
  const opts: Intl.DateTimeFormatOptions =
    style === "long"
      ? { weekday: "long", day: "numeric", month: "long", year: "numeric" }
      : style === "medium"
        ? { weekday: "short", day: "numeric", month: "short", year: "numeric" }
        : { weekday: "short", day: "numeric", month: "short" };
  return new Intl.DateTimeFormat("id-ID", { ...opts, timeZone: "UTC" }).format(toUtcDate(date));
}

export function formatTimeRange(start?: string | null, end?: string | null): string {
  if (!start) return "Sepanjang hari";
  return end ? `${start}–${end}` : start;
}

export function reminderLabel(days: number): string {
  return days === 0 ? "Hari-H" : `H-${days}`;
}

export function relativeDayLabel(days: number): string {
  if (days === 0) return "Hari ini";
  if (days === 1) return "Besok";
  if (days === -1) return "Kemarin";
  return days > 0 ? `${days} hari lagi` : `${Math.abs(days)} hari lalu`;
}

/** Menit sejak tengah malam (WIB), mis. 07:30 → 450. */
export function nowMinutesJakarta(now: Date = new Date()): number {
  const parts = new Intl.DateTimeFormat("en-GB", {
    timeZone: TIME_ZONE,
    hour: "2-digit",
    minute: "2-digit",
    hourCycle: "h23",
  }).formatToParts(now);
  const get = (t: string) => Number(parts.find((p) => p.type === t)?.value ?? 0);
  return get("hour") * 60 + get("minute");
}

export function greeting(minutes: number): string {
  const h = Math.floor(minutes / 60);
  if (h < 11) return "Selamat pagi";
  if (h < 15) return "Selamat siang";
  if (h < 18) return "Selamat sore";
  return "Selamat malam";
}
