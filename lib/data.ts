import "server-only";
import { query } from "./db";
import type { EventItem, Lesson } from "./types";
import type { EventData, LessonData } from "./validation";

const LESSON_COLUMNS = `id, subject, day_of_week,
  to_char(start_time, 'HH24:MI') AS start_time,
  to_char(end_time, 'HH24:MI') AS end_time,
  teacher, room, notes, reminder_days, active`;

const EVENT_COLUMNS = `id, title, event_date,
  to_char(start_time, 'HH24:MI') AS start_time,
  to_char(end_time, 'HH24:MI') AS end_time,
  location, description, reminder_days`;

// ---------- Jadwal pelajaran ----------
export function listLessons(onlyActive = false): Promise<Lesson[]> {
  return query<Lesson>(
    `SELECT ${LESSON_COLUMNS} FROM lessons ${onlyActive ? "WHERE active" : ""}
     ORDER BY day_of_week, lessons.start_time, subject`,
  );
}

export async function createLesson(d: LessonData): Promise<void> {
  await query(
    `INSERT INTO lessons (subject, day_of_week, start_time, end_time, teacher, room, notes, reminder_days, active)
     VALUES ($1, $2, $3, $4, $5, $6, $7, $8::int[], $9)`,
    [d.subject, d.day_of_week, d.start_time, d.end_time, d.teacher, d.room, d.notes, d.reminder_days, d.active],
  );
}

export async function updateLesson(id: number, d: LessonData): Promise<boolean> {
  const rows = await query(
    `UPDATE lessons SET subject = $2, day_of_week = $3, start_time = $4, end_time = $5, teacher = $6,
       room = $7, notes = $8, reminder_days = $9::int[], active = $10, updated_at = now()
     WHERE id = $1 RETURNING id`,
    [id, d.subject, d.day_of_week, d.start_time, d.end_time, d.teacher, d.room, d.notes, d.reminder_days, d.active],
  );
  return rows.length > 0;
}

export async function setLessonActive(id: number, active: boolean): Promise<boolean> {
  const rows = await query(`UPDATE lessons SET active = $2, updated_at = now() WHERE id = $1 RETURNING id`, [id, active]);
  return rows.length > 0;
}

export async function deleteLesson(id: number): Promise<boolean> {
  const rows = await query(`DELETE FROM lessons WHERE id = $1 RETURNING id`, [id]);
  await query(`DELETE FROM reminder_log WHERE kind = 'lesson' AND ref_id = $1`, [id]);
  return rows.length > 0;
}

// ---------- Jadwal kegiatan ----------
export function listEvents(): Promise<EventItem[]> {
  return query<EventItem>(
    `SELECT ${EVENT_COLUMNS} FROM events ORDER BY event_date, events.start_time NULLS FIRST, title`,
  );
}

export function listEventsBetween(from: string, to: string): Promise<EventItem[]> {
  return query<EventItem>(
    `SELECT ${EVENT_COLUMNS} FROM events WHERE event_date BETWEEN $1 AND $2
     ORDER BY event_date, events.start_time NULLS FIRST, title`,
    [from, to],
  );
}

export async function createEvent(d: EventData): Promise<void> {
  await query(
    `INSERT INTO events (title, event_date, start_time, end_time, location, description, reminder_days)
     VALUES ($1, $2, $3, $4, $5, $6, $7::int[])`,
    [d.title, d.event_date, d.start_time, d.end_time, d.location, d.description, d.reminder_days],
  );
}

export async function updateEvent(id: number, d: EventData): Promise<boolean> {
  const rows = await query(
    `UPDATE events SET title = $2, event_date = $3, start_time = $4, end_time = $5, location = $6,
       description = $7, reminder_days = $8::int[], updated_at = now()
     WHERE id = $1 RETURNING id`,
    [id, d.title, d.event_date, d.start_time, d.end_time, d.location, d.description, d.reminder_days],
  );
  return rows.length > 0;
}

export async function deleteEvent(id: number): Promise<boolean> {
  const rows = await query(`DELETE FROM events WHERE id = $1 RETURNING id`, [id]);
  await query(`DELETE FROM reminder_log WHERE kind = 'event' AND ref_id = $1`, [id]);
  return rows.length > 0;
}

// ---------- Ringkasan & riwayat ----------
export async function getStats(today: string) {
  const [row] = await query<{ lessons: number; upcoming: number; sent7: number }>(
    `SELECT
       (SELECT count(*)::int FROM lessons WHERE active) AS lessons,
       (SELECT count(*)::int FROM events WHERE event_date >= $1) AS upcoming,
       (SELECT count(*)::int FROM reminder_log WHERE sent_at > now() - interval '7 days') AS sent7`,
    [today],
  );
  return row;
}

export type ReminderLogRow = {
  id: number;
  kind: "lesson" | "event";
  title: string;
  target_date: string;
  days_before: number;
  sent_at: string;
};

export function recentReminderLogs(limit = 20): Promise<ReminderLogRow[]> {
  return query<ReminderLogRow>(
    `SELECT r.id, r.kind, COALESCE(l.subject, e.title, '(sudah dihapus)') AS title,
            r.target_date, r.days_before,
            to_char(r.sent_at AT TIME ZONE 'Asia/Jakarta', 'YYYY-MM-DD HH24:MI') AS sent_at
     FROM reminder_log r
     LEFT JOIN lessons l ON r.kind = 'lesson' AND l.id = r.ref_id
     LEFT JOIN events  e ON r.kind = 'event'  AND e.id = r.ref_id
     ORDER BY r.sent_at DESC, r.id DESC
     LIMIT $1`,
    [limit],
  );
}
