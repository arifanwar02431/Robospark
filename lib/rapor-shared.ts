// Konstanta & fungsi rapor yang aman dipakai di server maupun browser.

export const GRADE_LEVELS = [4, 6] as const;
export const SECTIONS = ["A", "B", "C", "D", "E", "F", "G", "H", "I"] as const;
export const CLASSES: string[] = GRADE_LEVELS.flatMap((g) => SECTIONS.map((s) => `${g}${s}`));

export const DEFAULT_COMPONENTS = [
  { name: "Tugas", weight: 20 },
  { name: "Praktik", weight: 30 },
  { name: "UTS", weight: 20 },
  { name: "UAS", weight: 30 },
];
export const DEFAULT_KKTP = 75;

export type Student = { id: number; school_year: string; class_name: string; nis: string; name: string };
export type Term = { id: number; school_year: string; semester: 1 | 2; kktp: number };
export type GradeComponent = { id: number; term_id: number; name: string; weight: number; position: number };

/** Tahun ajaran berjalan (WIB): Juli–Desember → tahun ini/berikutnya; Januari–Juni → tahun lalu/tahun ini. */
export function currentTerm(date: string): { schoolYear: string; semester: 1 | 2 } {
  const [y, m] = date.split("-").map(Number);
  return m >= 7 ? { schoolYear: `${y}/${y + 1}`, semester: 1 } : { schoolYear: `${y - 1}/${y}`, semester: 2 };
}

export function isValidSchoolYear(v: string): boolean {
  const m = /^(\d{4})\/(\d{4})$/.exec(v);
  return !!m && Number(m[2]) === Number(m[1]) + 1 && Number(m[1]) >= 2000 && Number(m[1]) <= 2100;
}

export function shiftYear(schoolYear: string, delta: number): string {
  const start = Number(schoolYear.slice(0, 4)) + delta;
  return `${start}/${start + 1}`;
}

/** Tahun ajaran di URL memakai tanda hubung: 2026-2027 */
export const yearToParam = (y: string) => y.replace("/", "-");
export const paramToYear = (p: string | undefined | null) => (p ? p.replace("-", "/") : "");

export function buildHref(basePath: string, params: { ta: string; smt?: number; kelas: string }) {
  const sp = new URLSearchParams({ ta: yearToParam(params.ta), kelas: params.kelas });
  if (params.smt) sp.set("smt", String(params.smt));
  return `${basePath}?${sp.toString()}`;
}

/** Ubah teks nilai (boleh pakai koma) menjadi angka 0–100, atau null jika kosong. NaN jika tidak valid. */
export function parseScore(raw: string): number | null {
  const t = raw.trim().replace(",", ".");
  if (t === "") return null;
  if (!/^\d{1,3}(\.\d{1,2})?$/.test(t)) return Number.NaN;
  const n = Number(t);
  return n >= 0 && n <= 100 ? n : Number.NaN;
}

export function formatScore(n: number | null | undefined): string {
  if (n === null || n === undefined) return "";
  return Number.isInteger(n) ? String(n) : String(Math.round(n * 100) / 100).replace(".", ",");
}

export type FinalScore = { value: number | null; filled: number; total: number; complete: boolean };

/** Nilai akhir = rata-rata berbobot dari komponen yang sudah terisi (dibulatkan). */
export function computeFinal(scores: (number | null | undefined)[], weights: number[]): FinalScore {
  let sum = 0;
  let w = 0;
  let filled = 0;
  scores.forEach((s, i) => {
    if (s === null || s === undefined || Number.isNaN(s)) return;
    filled++;
    sum += s * weights[i];
    w += weights[i];
  });
  const total = weights.length;
  if (filled === 0 || w === 0) return { value: null, filled, total, complete: false };
  // Bulatkan dulu ke 3 desimal agar 82,4999999 (galat desimal komputer) tetap dihitung 82,5 → 83.
  return { value: Math.round(Math.round((sum / w) * 1000) / 1000), filled, total, complete: filled === total };
}

// ---------- Tempel daftar siswa dari Excel ----------
export type ParsedStudent = { nis: string; name: string };

const HEADER_WORDS = /^(no\.?|nomor|nis|nisn|nama|nama siswa|nama lengkap|kelas|l\/p|jk)$/i;

/**
 * Terima teks hasil salin dari Excel/Google Sheets.
 * Format yang dikenali per baris: "Nama", "NIS<tab>Nama", "No<tab>NIS<tab>Nama", "NIS, Nama", "Nama<tab>NIS".
 */
export function parseStudentPaste(text: string): ParsedStudent[] {
  const out: ParsedStudent[] = [];
  for (const rawLine of text.split(/\r?\n/)) {
    const line = rawLine.trim();
    if (!line) continue;
    let cells = line.includes("\t") ? line.split("\t") : [line];
    if (cells.length === 1) {
      const m = /^(\d{3,20})\s*[,;|]\s*(.+)$/.exec(line) ?? /^(.+?)\s*[,;|]\s*(\d{3,20})$/.exec(line);
      if (m) cells = [m[1], m[2]];
    }
    cells = cells.map((c) => c.trim()).filter(Boolean);
    if (cells.length === 0 || cells.every((c) => HEADER_WORDS.test(c))) continue;

    const isNis = (c: string) => /^\d{4,20}$/.test(c.replace(/[.\s-]/g, ""));
    const isRowNo = (c: string) => /^\d{1,3}\.?$/.test(c);
    const nameCell = cells
      .filter((c) => !isNis(c) && !isRowNo(c) && !/^(l|p)$/i.test(c))
      .sort((a, b) => b.length - a.length)[0];
    if (!nameCell) continue;
    const nisCell = cells.find((c) => isNis(c));
    const name = nameCell.replace(/\s+/g, " ").slice(0, 120);
    out.push({ nis: (nisCell ?? "").replace(/[\s]/g, "").slice(0, 30), name });
  }
  return out;
}
