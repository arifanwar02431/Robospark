// Warna otomatis untuk setiap mata pelajaran / kegiatan (berdasarkan namanya),
// sehingga jadwal yang sama selalu tampil dengan warna yang sama.
export type Tone = {
  dot: string; // titik kecil
  soft: string; // latar lembut + teks
  block: string; // blok di kalender
  stripe: string; // garis tepi
  text: string; // teks berwarna
};

const TONES: Tone[] = [
  { dot: "bg-c1-500", soft: "bg-c1-50 text-c1-900", block: "bg-c1-300 text-c1-900", stripe: "bg-c1-500", text: "text-c1-500" },
  { dot: "bg-c2-500", soft: "bg-c2-50 text-c2-900", block: "bg-c2-300 text-c2-900", stripe: "bg-c2-500", text: "text-c2-500" },
  { dot: "bg-c3-500", soft: "bg-c3-50 text-c3-900", block: "bg-c3-300 text-c3-900", stripe: "bg-c3-500", text: "text-c3-500" },
  { dot: "bg-c4-500", soft: "bg-c4-50 text-c4-900", block: "bg-c4-300 text-c4-900", stripe: "bg-c4-500", text: "text-c4-500" },
  { dot: "bg-c5-500", soft: "bg-c5-50 text-c5-900", block: "bg-c5-300 text-c5-900", stripe: "bg-c5-500", text: "text-c5-500" },
  { dot: "bg-c6-500", soft: "bg-c6-50 text-c6-900", block: "bg-c6-300 text-c6-900", stripe: "bg-c6-500", text: "text-c6-500" },
];

export function toneFor(name: string): Tone {
  let h = 0;
  for (const ch of name.trim().toLowerCase()) h = (h * 31 + ch.charCodeAt(0)) >>> 0;
  return TONES[h % TONES.length];
}

/** Durasi "HH:MM" → "H:MM" seperti 1:30 */
export function durationLabel(start: string, end: string): string {
  const toMin = (t: string) => Number(t.slice(0, 2)) * 60 + Number(t.slice(3, 5));
  const d = Math.max(0, toMin(end) - toMin(start));
  return `${Math.floor(d / 60)}:${String(d % 60).padStart(2, "0")}`;
}
