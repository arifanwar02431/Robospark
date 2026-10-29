import writeXlsxFile from "write-excel-file/node";
import type { Row, SheetData } from "write-excel-file/node";
import { getSession } from "@/lib/auth";
import { getExportData, type GradeSheet } from "@/lib/rapor";
import { CLASSES, computeFinal, type GradeComponent, type Term } from "@/lib/rapor-shared";

export const dynamic = "force-dynamic";

const HEADER_BG = "#FFE7D4";

function sheetFor(term: Term, className: string, components: GradeComponent[], sheet: GradeSheet): SheetData | null {
  if (sheet.students.length === 0) return null;
  const weights = components.map((c) => c.weight);
  const totalWeight = weights.reduce((a, b) => a + b, 0) || 1;

  const title: Row = [
    { value: `Nilai Rapor Kelas ${className}`, fontWeight: "bold", fontSize: 14 },
  ];
  const meta: Row = [
    { value: `Tahun Ajaran ${term.school_year}, Semester ${term.semester}, KKTP ${term.kktp}`, textColor: "#5E5751" },
  ];
  const header: Row = [
    "No",
    "NIS",
    "Nama Siswa",
    ...components.map((c) => `${c.name} (${Math.round((c.weight / totalWeight) * 1000) / 10}%)`),
    "Nilai Akhir",
    "Keterangan",
    "Deskripsi Capaian",
  ].map((value) => ({ value, fontWeight: "bold" as const, backgroundColor: HEADER_BG, wrap: true, alignVertical: "center" as const }));

  const rows: Row[] = sheet.students.map((s, i) => {
    const vals = components.map((c) => sheet.scores[s.id]?.[c.id] ?? null);
    const f = computeFinal(vals, weights);
    const status = f.value === null ? "Belum ada nilai" : !f.complete ? "Belum lengkap" : f.value >= term.kktp ? "Tuntas" : "Belum tuntas";
    return [
      { value: i + 1, type: Number },
      { value: s.nis || "", type: String },
      { value: s.name, type: String },
      ...vals.map((v) => (v === null ? null : { value: v, type: Number })),
      f.value === null ? null : { value: f.value, type: Number, fontWeight: "bold" as const, textColor: f.complete && f.value < term.kktp ? "#D92D20" : undefined },
      { value: status, type: String },
      { value: sheet.notes[s.id] ?? "", type: String, wrap: true },
    ];
  });

  return [title, meta, [], header, ...rows];
}

function columnsFor(components: GradeComponent[]) {
  return [{ width: 5 }, { width: 12 }, { width: 32 }, ...components.map(() => ({ width: 12 })), { width: 11 }, { width: 15 }, { width: 60 }];
}

export async function GET(request: Request) {
  if (!(await getSession())) return new Response("Unauthorized", { status: 401 });
  const url = new URL(request.url);
  const termId = Number(url.searchParams.get("term"));
  const kelas = url.searchParams.get("kelas") ?? "";
  if (!Number.isInteger(termId) || termId <= 0 || (kelas !== "semua" && !CLASSES.includes(kelas))) {
    return new Response("Parameter tidak valid", { status: 400 });
  }
  const data = await getExportData(termId);
  if (!data) return new Response("Semester tidak ditemukan", { status: 404 });
  const { term, components } = data;

  const classes = kelas === "semua" ? CLASSES : [kelas];
  const sheets: { sheet: string; data: SheetData; columns: { width: number }[]; stickyRowsCount: number }[] = [];
  for (const c of classes) {
    const sheet = { students: data.students.filter((s) => s.class_name === c), scores: data.scores, notes: data.notes };
    const rows = sheetFor(term, c, components, sheet);
    if (rows) sheets.push({ sheet: c, data: rows, columns: columnsFor(components), stickyRowsCount: 4 });
  }
  if (sheets.length === 0) {
    sheets.push({
      sheet: kelas === "semua" ? "Kosong" : kelas,
      data: [[{ value: "Belum ada data siswa untuk tahun ajaran ini.", type: String }]],
      columns: [{ width: 50 }],
      stickyRowsCount: 0,
    });
  }

  const buffer = await writeXlsxFile(sheets).toBuffer();
  const fileName = `Nilai-${kelas === "semua" ? "Semua-Kelas" : kelas}-${term.school_year.replace("/", "-")}-Smt${term.semester}.xlsx`;
  return new Response(new Uint8Array(buffer), {
    headers: {
      "Content-Type": "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
      "Content-Disposition": `attachment; filename="${fileName}"`,
      "Cache-Control": "no-store",
    },
  });
}
