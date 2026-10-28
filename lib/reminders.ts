import "server-only";
import { query } from "./db";
import { listEventsBetween, listLessons } from "./data";
import {
  addDays,
  diffDays,
  formatDate,
  formatTimeRange,
  isoDayOfWeek,
  relativeDayLabel,
  todayJakarta,
} from "./date";
import { escapeHtml, sendTelegramMessage } from "./telegram";
import type { EventItem, Lesson, ReminderPreview } from "./types";

type Due = {
  kind: "lesson" | "event";
  refId: number;
  targetDate: string;
  daysBefore: number;
  lesson?: Lesson;
  event?: EventItem;
};

const key = (k: string, id: number, date: string, d: number) => `${k}:${id}:${date}:${d}`;

/** Hitung semua pengingat yang jatuh pada tanggal `date` (YYYY-MM-DD, WIB). */
export async function computeDueReminders(date: string): Promise<Due[]> {
  const [lessons, events] = await Promise.all([
    listLessons(true),
    listEventsBetween(date, addDays(date, 366)),
  ]);
  const due: Due[] = [];

  for (const lesson of lessons) {
    for (const d of lesson.reminder_days) {
      const target = addDays(date, d);
      if (isoDayOfWeek(target) === lesson.day_of_week) {
        due.push({ kind: "lesson", refId: lesson.id, targetDate: target, daysBefore: d, lesson });
      }
    }
  }
  for (const event of events) {
    const distance = diffDays(event.event_date, date);
    if (event.reminder_days.includes(distance)) {
      due.push({ kind: "event", refId: event.id, targetDate: event.event_date, daysBefore: distance, event });
    }
  }

  const time = (x: Due) => x.lesson?.start_time ?? x.event?.start_time ?? "00:00";
  return due.sort((a, b) => a.targetDate.localeCompare(b.targetDate) || time(a).localeCompare(time(b)));
}

async function sentKeys(dates: string[]): Promise<Set<string>> {
  if (dates.length === 0) return new Set();
  const rows = await query<{ kind: string; ref_id: number; target_date: string; days_before: number }>(
    `SELECT kind, ref_id, target_date, days_before FROM reminder_log WHERE target_date = ANY($1::date[])`,
    [[...new Set(dates)]],
  );
  return new Set(rows.map((r) => key(r.kind, r.ref_id, r.target_date, r.days_before)));
}

/** Pratinjau pengingat untuk suatu tanggal, beserta status sudah terkirim atau belum. */
export async function previewReminders(date: string): Promise<ReminderPreview[]> {
  const due = await computeDueReminders(date);
  const sent = await sentKeys(due.map((d) => d.targetDate));
  return due.map((d) => ({
    kind: d.kind,
    refId: d.refId,
    title: d.lesson?.subject ?? d.event?.title ?? "",
    targetDate: d.targetDate,
    daysBefore: d.daysBefore,
    timeText: d.lesson
      ? formatTimeRange(d.lesson.start_time, d.lesson.end_time)
      : formatTimeRange(d.event?.start_time, d.event?.end_time),
    sent: sent.has(key(d.kind, d.refId, d.targetDate, d.daysBefore)),
  }));
}

function lessonLine(d: Due): string {
  const l = d.lesson!;
  const lines = [
    `• <b>${escapeHtml(l.subject)}</b> — ${relativeDayLabel(d.daysBefore)}`,
    `   ${formatDate(d.targetDate, "medium")} · ${formatTimeRange(l.start_time, l.end_time)}`,
  ];
  const meta = [l.teacher && `👤 ${escapeHtml(l.teacher)}`, l.room && `📍 ${escapeHtml(l.room)}`].filter(Boolean);
  if (meta.length) lines.push(`   ${meta.join(" · ")}`);
  if (l.notes) lines.push(`   📝 ${escapeHtml(truncate(l.notes, 200))}`);
  return lines.join("\n");
}

function eventLine(d: Due): string {
  const e = d.event!;
  const lines = [
    `• <b>${escapeHtml(e.title)}</b> — ${relativeDayLabel(d.daysBefore)}`,
    `   ${formatDate(e.event_date, "medium")} · ${formatTimeRange(e.start_time, e.end_time)}`,
  ];
  if (e.location) lines.push(`   📍 ${escapeHtml(e.location)}`);
  if (e.description) lines.push(`   📝 ${escapeHtml(truncate(e.description, 200))}`);
  return lines.join("\n");
}

function truncate(text: string, max: number): string {
  return text.length > max ? `${text.slice(0, max - 1)}…` : text;
}

export function buildReminderMessage(date: string, items: Due[]): string {
  const lessons = items.filter((i) => i.kind === "lesson");
  const events = items.filter((i) => i.kind === "event");
  const parts = [`🔔 <b>Pengingat Jadwal</b>`, `<i>${formatDate(date)}</i>`];
  if (lessons.length) parts.push("", `📚 <b>Jadwal Pelajaran</b>`, ...lessons.map(lessonLine));
  if (events.length) parts.push("", `📌 <b>Jadwal Kegiatan</b>`, ...events.map(eventLine));
  return parts.join("\n");
}

export type RunResult = { date: string; due: number; sent: number; alreadySent: number };

/**
 * Kirim pengingat untuk tanggal `date`. Aman dijalankan berulang kali:
 * setiap pengingat "diklaim" dulu di reminder_log, jadi tidak akan terkirim dua kali.
 */
export async function runReminders(date: string = todayJakarta()): Promise<RunResult> {
  const due = await computeDueReminders(date);
  if (due.length === 0) return { date, due: 0, sent: 0, alreadySent: 0 };

  const claimed = await query<{ kind: string; ref_id: number; target_date: string; days_before: number }>(
    `INSERT INTO reminder_log (kind, ref_id, target_date, days_before)
     SELECT * FROM unnest($1::text[], $2::int[], $3::date[], $4::int[])
     ON CONFLICT DO NOTHING
     RETURNING kind, ref_id, target_date, days_before`,
    [due.map((d) => d.kind), due.map((d) => d.refId), due.map((d) => d.targetDate), due.map((d) => d.daysBefore)],
  );
  const claimedKeys = new Set(claimed.map((r) => key(r.kind, r.ref_id, r.target_date, r.days_before)));
  const toSend = due.filter((d) => claimedKeys.has(key(d.kind, d.refId, d.targetDate, d.daysBefore)));

  if (toSend.length > 0) {
    try {
      await sendTelegramMessage(buildReminderMessage(date, toSend));
    } catch (err) {
      // Gagal kirim: lepaskan klaim agar bisa dicoba lagi.
      await query(
        `DELETE FROM reminder_log r USING unnest($1::text[], $2::int[], $3::date[], $4::int[]) AS c(kind, ref_id, target_date, days_before)
         WHERE r.kind = c.kind AND r.ref_id = c.ref_id AND r.target_date = c.target_date AND r.days_before = c.days_before`,
        [toSend.map((d) => d.kind), toSend.map((d) => d.refId), toSend.map((d) => d.targetDate), toSend.map((d) => d.daysBefore)],
      );
      throw err;
    }
  }

  // Bersihkan catatan lama.
  await query(`DELETE FROM reminder_log WHERE target_date < $1::date - 120`, [date]);
  return { date, due: due.length, sent: toSend.length, alreadySent: due.length - toSend.length };
}
