import { z } from "zod";

const time = z.string().regex(/^([01]\d|2[0-3]):[0-5]\d$/, "Format jam tidak valid (JJ:MM).");
const optionalTime = z.union([time, z.literal("")]).optional().transform((v) => v || null);
const text = (max: number) => z.string().trim().max(max, `Maksimal ${max} karakter.`).optional().default("");

const reminderDays = (max: number) =>
  z
    .array(z.number().int().min(0, "Pengingat tidak valid.").max(max, `Pengingat maksimal H-${max}.`))
    .max(8, "Maksimal 8 pengingat.")
    .transform((days) => [...new Set(days)].sort((a, b) => b - a));

export const lessonSchema = z
  .object({
    subject: z.string().trim().min(1, "Mata pelajaran wajib diisi.").max(120, "Maksimal 120 karakter."),
    day_of_week: z.number().int().min(1, "Pilih hari.").max(7, "Pilih hari."),
    start_time: time,
    end_time: time,
    teacher: text(120),
    room: text(80),
    notes: text(500),
    // Jadwal pelajaran berulang tiap minggu, jadi pengingat maksimal H-6.
    reminder_days: reminderDays(6),
    active: z.boolean().default(true),
  })
  .refine((v) => v.end_time > v.start_time, { message: "Jam selesai harus setelah jam mulai.", path: ["end_time"] });

export const eventSchema = z
  .object({
    title: z.string().trim().min(1, "Nama kegiatan wajib diisi.").max(150, "Maksimal 150 karakter."),
    event_date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, "Tanggal wajib diisi."),
    start_time: optionalTime,
    end_time: optionalTime,
    location: text(150),
    description: text(1000),
    reminder_days: reminderDays(365),
  })
  .refine((v) => !(v.end_time && !v.start_time), { message: "Isi jam mulai terlebih dahulu.", path: ["start_time"] })
  .refine((v) => !(v.start_time && v.end_time && v.end_time <= v.start_time), {
    message: "Jam selesai harus setelah jam mulai.",
    path: ["end_time"],
  });

export type LessonInput = z.input<typeof lessonSchema>;
export type LessonData = z.output<typeof lessonSchema>;
export type EventInput = z.input<typeof eventSchema>;
export type EventData = z.output<typeof eventSchema>;

export function firstError(error: z.ZodError): string {
  return error.issues[0]?.message ?? "Data tidak valid.";
}
