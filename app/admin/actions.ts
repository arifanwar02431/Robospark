"use server";

import { revalidatePath } from "next/cache";
import { getSession } from "@/lib/auth";
import * as data from "@/lib/data";
import { runReminders } from "@/lib/reminders";
import { findRecentChats, sendTelegramMessage, type TelegramChat } from "@/lib/telegram";
import type { ActionResult } from "@/lib/types";
import { eventSchema, firstError, lessonSchema, type EventInput, type LessonInput } from "@/lib/validation";
import { formatDate, todayJakarta } from "@/lib/date";

const UNAUTHORIZED: ActionResult = { ok: false, error: "Sesi Anda berakhir. Silakan masuk lagi." };

function errorMessage(err: unknown): string {
  return err instanceof Error ? err.message : "Terjadi kesalahan tak terduga.";
}

function validId(id: unknown): id is number {
  return typeof id === "number" && Number.isInteger(id) && id > 0;
}

// ---------- Jadwal pelajaran ----------
export async function saveLessonAction(id: number | null, input: LessonInput): Promise<ActionResult> {
  if (!(await getSession())) return UNAUTHORIZED;
  const parsed = lessonSchema.safeParse(input);
  if (!parsed.success) return { ok: false, error: firstError(parsed.error) };
  try {
    if (id === null) {
      await data.createLesson(parsed.data);
    } else {
      if (!validId(id)) return { ok: false, error: "ID tidak valid." };
      if (!(await data.updateLesson(id, parsed.data))) return { ok: false, error: "Jadwal tidak ditemukan." };
    }
  } catch (err) {
    return { ok: false, error: errorMessage(err) };
  }
  revalidatePath("/admin", "layout");
  return { ok: true, message: id === null ? "Jadwal pelajaran ditambahkan." : "Perubahan disimpan." };
}

export async function toggleLessonAction(id: number, active: boolean): Promise<ActionResult> {
  if (!(await getSession())) return UNAUTHORIZED;
  if (!validId(id)) return { ok: false, error: "ID tidak valid." };
  try {
    await data.setLessonActive(id, Boolean(active));
  } catch (err) {
    return { ok: false, error: errorMessage(err) };
  }
  revalidatePath("/admin", "layout");
  return { ok: true, message: active ? "Jadwal diaktifkan." : "Jadwal dinonaktifkan (pengingat berhenti)." };
}

export async function deleteLessonAction(id: number): Promise<ActionResult> {
  if (!(await getSession())) return UNAUTHORIZED;
  if (!validId(id)) return { ok: false, error: "ID tidak valid." };
  try {
    await data.deleteLesson(id);
  } catch (err) {
    return { ok: false, error: errorMessage(err) };
  }
  revalidatePath("/admin", "layout");
  return { ok: true, message: "Jadwal pelajaran dihapus." };
}

// ---------- Jadwal kegiatan ----------
export async function saveEventAction(id: number | null, input: EventInput): Promise<ActionResult> {
  if (!(await getSession())) return UNAUTHORIZED;
  const parsed = eventSchema.safeParse(input);
  if (!parsed.success) return { ok: false, error: firstError(parsed.error) };
  try {
    if (id === null) {
      await data.createEvent(parsed.data);
    } else {
      if (!validId(id)) return { ok: false, error: "ID tidak valid." };
      if (!(await data.updateEvent(id, parsed.data))) return { ok: false, error: "Kegiatan tidak ditemukan." };
    }
  } catch (err) {
    return { ok: false, error: errorMessage(err) };
  }
  revalidatePath("/admin", "layout");
  return { ok: true, message: id === null ? "Kegiatan ditambahkan." : "Perubahan disimpan." };
}

export async function deleteEventAction(id: number): Promise<ActionResult> {
  if (!(await getSession())) return UNAUTHORIZED;
  if (!validId(id)) return { ok: false, error: "ID tidak valid." };
  try {
    await data.deleteEvent(id);
  } catch (err) {
    return { ok: false, error: errorMessage(err) };
  }
  revalidatePath("/admin", "layout");
  return { ok: true, message: "Kegiatan dihapus." };
}

// ---------- Telegram ----------
export async function sendTestMessageAction(): Promise<ActionResult> {
  if (!(await getSession())) return UNAUTHORIZED;
  try {
    await sendTelegramMessage(
      `✅ <b>Tes berhasil!</b>\nBot pengingat jadwal sudah terhubung.\n<i>${formatDate(todayJakarta())}</i>`,
    );
    return { ok: true, message: "Pesan tes terkirim. Cek Telegram Anda." };
  } catch (err) {
    return { ok: false, error: errorMessage(err) };
  }
}

export async function runRemindersNowAction(): Promise<ActionResult> {
  if (!(await getSession())) return UNAUTHORIZED;
  try {
    const result = await runReminders();
    revalidatePath("/admin", "layout");
    if (result.due === 0) return { ok: true, message: "Tidak ada pengingat yang jatuh hari ini." };
    if (result.sent === 0) return { ok: true, message: "Semua pengingat hari ini sudah terkirim sebelumnya." };
    return { ok: true, message: `${result.sent} pengingat terkirim ke Telegram.` };
  } catch (err) {
    return { ok: false, error: errorMessage(err) };
  }
}

export async function findChatsAction(): Promise<ActionResult<TelegramChat[]>> {
  if (!(await getSession())) return { ok: false, error: "Sesi Anda berakhir. Silakan masuk lagi." };
  try {
    return { ok: true, data: await findRecentChats() };
  } catch (err) {
    return { ok: false, error: errorMessage(err) };
  }
}
