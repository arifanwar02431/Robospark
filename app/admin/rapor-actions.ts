"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";
import { getSession } from "@/lib/auth";
import * as rapor from "@/lib/rapor";
import { CLASSES, isValidSchoolYear, parseStudentPaste } from "@/lib/rapor-shared";
import type { ActionResult } from "@/lib/types";

const UNAUTHORIZED = { ok: false as const, error: "Sesi Anda berakhir. Silakan masuk lagi." };
const msg = (err: unknown) => (err instanceof Error ? err.message : "Terjadi kesalahan tak terduga.");
const validId = (id: unknown): id is number => typeof id === "number" && Number.isInteger(id) && id > 0;

function checkClass(schoolYear: string, className: string): string | null {
  if (!isValidSchoolYear(schoolYear)) return "Tahun ajaran tidak valid.";
  if (!CLASSES.includes(className)) return "Kelas tidak valid.";
  return null;
}

function refresh() {
  revalidatePath("/admin/siswa");
  revalidatePath("/admin/nilai");
}

// ---------- Siswa ----------
export async function addStudentsAction(
  schoolYear: string,
  className: string,
  text: string,
): Promise<ActionResult<{ added: number; skipped: string[] }>> {
  if (!(await getSession())) return UNAUTHORIZED;
  const bad = checkClass(schoolYear, className);
  if (bad) return { ok: false, error: bad };
  if (typeof text !== "string" || text.length > 50_000) return { ok: false, error: "Teks terlalu panjang." };
  const list = parseStudentPaste(text);
  if (list.length === 0) return { ok: false, error: "Tidak ada nama siswa yang terbaca." };
  if (list.length > 100) return { ok: false, error: "Maksimal 100 siswa sekali tempel." };
  try {
    const res = await rapor.addStudents(schoolYear, className, list);
    refresh();
    return {
      ok: true,
      data: res,
      message: res.added ? `${res.added} siswa ditambahkan ke ${className}.` : "Tidak ada siswa baru (semua sudah terdaftar).",
    };
  } catch (err) {
    return { ok: false, error: msg(err) };
  }
}

const studentSchema = z.object({
  nis: z.string().trim().max(30, "NIS maksimal 30 karakter.").regex(/^[0-9A-Za-z.\-/]*$/, "NIS hanya boleh angka/huruf."),
  name: z.string().trim().min(1, "Nama wajib diisi.").max(120, "Nama maksimal 120 karakter."),
  class_name: z.string().refine((c) => CLASSES.includes(c), "Kelas tidak valid."),
});

export async function updateStudentAction(id: number, input: z.input<typeof studentSchema>): Promise<ActionResult> {
  if (!(await getSession())) return UNAUTHORIZED;
  if (!validId(id)) return { ok: false, error: "ID tidak valid." };
  const parsed = studentSchema.safeParse(input);
  if (!parsed.success) return { ok: false, error: parsed.error.issues[0]?.message ?? "Data tidak valid." };
  try {
    if (!(await rapor.updateStudent(id, parsed.data))) return { ok: false, error: "Siswa tidak ditemukan." };
  } catch (err) {
    return { ok: false, error: msg(err) };
  }
  refresh();
  return { ok: true, message: "Data siswa disimpan." };
}

export async function deleteStudentAction(id: number): Promise<ActionResult> {
  if (!(await getSession())) return UNAUTHORIZED;
  if (!validId(id)) return { ok: false, error: "ID tidak valid." };
  try {
    await rapor.deleteStudent(id);
  } catch (err) {
    return { ok: false, error: msg(err) };
  }
  refresh();
  return { ok: true, message: "Siswa dihapus." };
}

export async function deleteClassAction(schoolYear: string, className: string): Promise<ActionResult> {
  if (!(await getSession())) return UNAUTHORIZED;
  const bad = checkClass(schoolYear, className);
  if (bad) return { ok: false, error: bad };
  try {
    const n = await rapor.deleteClass(schoolYear, className);
    refresh();
    return { ok: true, message: `${n} siswa di kelas ${className} dihapus.` };
  } catch (err) {
    return { ok: false, error: msg(err) };
  }
}

// ---------- Nilai ----------
const gradesSchema = z.object({
  scores: z
    .array(
      z.object({
        studentId: z.number().int().positive(),
        componentId: z.number().int().positive(),
        score: z.number().min(0, "Nilai minimal 0.").max(100, "Nilai maksimal 100.").nullable(),
      }),
    )
    .max(5000),
  notes: z.array(z.object({ studentId: z.number().int().positive(), description: z.string().max(1000, "Deskripsi maksimal 1000 karakter.") })).max(200),
});

export async function saveGradesAction(
  termId: number,
  className: string,
  input: z.input<typeof gradesSchema>,
): Promise<ActionResult<{ savedAt: number }>> {
  if (!(await getSession())) return UNAUTHORIZED;
  if (!validId(termId) || !CLASSES.includes(className)) return { ok: false, error: "Data tidak valid." };
  const parsed = gradesSchema.safeParse(input);
  if (!parsed.success) return { ok: false, error: parsed.error.issues[0]?.message ?? "Data tidak valid." };
  try {
    await rapor.saveGrades(
      termId,
      className,
      parsed.data.scores.map((s) => ({ ...s, score: s.score === null ? null : Math.round(s.score * 100) / 100 })),
      parsed.data.notes.map((n) => ({ ...n, description: n.description.trim() })),
    );
  } catch (err) {
    return { ok: false, error: msg(err) };
  }
  // Sengaja TIDAK memanggil revalidatePath: tabel di browser sudah memegang data terbaru,
  // jadi simpan otomatis tidak perlu memuat ulang seluruh halaman di server.
  return { ok: true, message: "Nilai tersimpan.", data: { savedAt: Date.now() } };
}

const componentsSchema = z.object({
  kktp: z.number().min(0, "KKTP minimal 0.").max(100, "KKTP maksimal 100."),
  components: z
    .array(
      z.object({
        id: z.number().int().positive().nullable(),
        name: z.string().trim().min(1, "Nama komponen wajib diisi.").max(40, "Nama komponen maksimal 40 karakter."),
        weight: z.number().min(0, "Bobot minimal 0.").max(100, "Bobot maksimal 100."),
      }),
    )
    .min(1, "Minimal satu komponen.")
    .max(12, "Maksimal 12 komponen.")
    .refine((list) => new Set(list.map((c) => c.name.toLowerCase())).size === list.length, "Nama komponen tidak boleh sama.")
    .refine((list) => list.some((c) => c.weight > 0), "Minimal satu komponen harus punya bobot."),
});

export async function saveComponentsAction(termId: number, input: z.input<typeof componentsSchema>): Promise<ActionResult> {
  if (!(await getSession())) return UNAUTHORIZED;
  if (!validId(termId)) return { ok: false, error: "Semester tidak valid." };
  const parsed = componentsSchema.safeParse(input);
  if (!parsed.success) return { ok: false, error: parsed.error.issues[0]?.message ?? "Data tidak valid." };
  try {
    await rapor.saveComponents(termId, parsed.data.components, parsed.data.kktp);
  } catch (err) {
    return { ok: false, error: msg(err) };
  }
  refresh();
  return { ok: true, message: "Komponen penilaian disimpan." };
}
