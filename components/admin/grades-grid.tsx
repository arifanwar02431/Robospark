"use client";

import Link from "next/link";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { AlertCircle, Check, Cloud, Download, Loader2, Settings2, Users } from "lucide-react";
import { useToast } from "@/components/toast";
import { Button, Card, EmptyState, buttonClass, cn } from "@/components/ui";
import { saveGradesAction } from "@/app/admin/rapor-actions";
import { buildHref, computeFinal, formatScore, parseScore, type GradeComponent, type Student, type Term } from "@/lib/rapor-shared";
import { ComponentsEditor } from "./components-editor";

type Vals = Record<number, Record<number, string>>;
type Status = { kind: "idle" | "pending" | "saving" | "saved" | "error"; at?: string };

const cellKey = (s: number, c: number) => `${s}:${c}`;

export function GradesGrid({
  term,
  className,
  components,
  students,
  scores,
  notes: initialNotes,
  exportHref,
  exportAllHref,
}: {
  term: Term;
  className: string;
  components: GradeComponent[];
  students: Student[];
  scores: Record<number, Record<number, number>>;
  notes: Record<number, string>;
  exportHref: string;
  exportAllHref: string;
}) {
  const toast = useToast();
  const [vals, setVals] = useState<Vals>(() => {
    const v: Vals = {};
    for (const s of students) {
      v[s.id] = {};
      for (const c of components) v[s.id][c.id] = formatScore(scores[s.id]?.[c.id]);
    }
    return v;
  });
  const [notes, setNotes] = useState<Record<number, string>>(() => ({ ...initialNotes }));
  const [status, setStatus] = useState<Status>({ kind: "idle" });
  const [editingComponents, setEditingComponents] = useState(false);

  // Perubahan yang menunggu disimpan otomatis.
  const pendingScores = useRef(new Map<string, { studentId: number; componentId: number; score: number | null }>());
  const pendingNotes = useRef(new Map<number, string>());
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const saving = useRef(false);

  const flush = useCallback(async () => {
    if (timer.current) clearTimeout(timer.current);
    timer.current = null;
    if (saving.current) return;
    if (pendingScores.current.size === 0 && pendingNotes.current.size === 0) return;
    const scoreBatch = [...pendingScores.current.values()];
    const noteBatch = [...pendingNotes.current.entries()].map(([studentId, description]) => ({ studentId, description }));
    pendingScores.current.clear();
    pendingNotes.current.clear();
    saving.current = true;
    setStatus({ kind: "saving" });
    let res;
    try {
      res = await saveGradesAction(term.id, className, { scores: scoreBatch, notes: noteBatch });
    } catch {
      res = { ok: false as const, error: "Koneksi terputus. Perubahan akan dicoba lagi." };
    }
    saving.current = false;
    if (res.ok) {
      setStatus({ kind: "saved", at: new Date().toLocaleTimeString("id-ID", { hour: "2-digit", minute: "2-digit" }) });
    } else {
      // Kembalikan ke antrean (kecuali sudah ada perubahan yang lebih baru).
      for (const s of scoreBatch) if (!pendingScores.current.has(cellKey(s.studentId, s.componentId))) pendingScores.current.set(cellKey(s.studentId, s.componentId), s);
      for (const n of noteBatch) if (!pendingNotes.current.has(n.studentId)) pendingNotes.current.set(n.studentId, n.description);
      setStatus({ kind: "error" });
      toast({ type: "error", title: "Nilai belum tersimpan", description: res.error });
      return;
    }
    if (pendingScores.current.size || pendingNotes.current.size) void flush();
  }, [term.id, className, toast]);

  const schedule = useCallback(() => {
    setStatus({ kind: "pending" });
    if (timer.current) clearTimeout(timer.current);
    timer.current = setTimeout(() => void flush(), 900);
  }, [flush]);

  // Simpan sisa perubahan saat pindah halaman / menutup tab.
  useEffect(() => {
    const onHide = () => void flush();
    const onBeforeUnload = (e: BeforeUnloadEvent) => {
      if (pendingScores.current.size || pendingNotes.current.size || saving.current) {
        void flush();
        e.preventDefault();
      }
    };
    window.addEventListener("pagehide", onHide);
    window.addEventListener("beforeunload", onBeforeUnload);
    return () => {
      window.removeEventListener("pagehide", onHide);
      window.removeEventListener("beforeunload", onBeforeUnload);
      void flush();
    };
  }, [flush]);

  const setCell = (studentId: number, componentId: number, raw: string) => {
    setVals((v) => ({ ...v, [studentId]: { ...v[studentId], [componentId]: raw } }));
    const parsed = parseScore(raw);
    if (Number.isNaN(parsed)) {
      pendingScores.current.delete(cellKey(studentId, componentId));
      return;
    }
    pendingScores.current.set(cellKey(studentId, componentId), { studentId, componentId, score: parsed });
    schedule();
  };

  const setNote = (studentId: number, text: string) => {
    setNotes((n) => ({ ...n, [studentId]: text }));
    pendingNotes.current.set(studentId, text);
    schedule();
  };

  // ---------- Navigasi keyboard & tempel dari Excel ----------
  const gridRef = useRef<HTMLTableElement>(null);
  const focusCell = (row: number, col: number) => {
    const el = gridRef.current?.querySelector<HTMLInputElement>(`input[data-row="${row}"][data-col="${col}"]`);
    if (el) {
      el.focus();
      el.select();
    }
  };
  const onKeyDown = (e: React.KeyboardEvent<HTMLInputElement>, row: number, col: number) => {
    if (e.key === "Enter" || e.key === "ArrowDown") {
      e.preventDefault();
      focusCell(e.shiftKey && e.key === "Enter" ? row - 1 : row + 1, col);
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      focusCell(row - 1, col);
    } else if (e.key === "ArrowRight" && e.currentTarget.selectionStart === e.currentTarget.value.length) {
      focusCell(row, col + 1);
    } else if (e.key === "ArrowLeft" && e.currentTarget.selectionStart === 0) {
      focusCell(row, col - 1);
    }
  };
  const onPaste = (e: React.ClipboardEvent<HTMLInputElement>, row: number, col: number) => {
    const text = e.clipboardData.getData("text/plain");
    if (!/[\t\n]/.test(text.trim())) return; // satu nilai: biarkan tempel biasa
    e.preventDefault();
    const lines = text.replace(/\r/g, "").replace(/\n$/, "").split("\n");
    let applied = 0;
    let invalid = 0;
    lines.forEach((line, i) => {
      const student = students[row + i];
      if (!student) return;
      line.split("\t").forEach((cell, j) => {
        const comp = components[col + j];
        if (!comp) return;
        const parsed = parseScore(cell);
        if (Number.isNaN(parsed)) invalid++;
        setCell(student.id, comp.id, cell.trim());
        applied++;
      });
    });
    toast({
      type: invalid ? "error" : "success",
      title: `${applied} nilai ditempel`,
      description: invalid ? `${invalid} nilai tidak valid (harus 0–100) dan ditandai merah.` : undefined,
    });
  };

  // ---------- Ringkasan ----------
  const weights = components.map((c) => c.weight);
  const totalWeight = weights.reduce((a, b) => a + b, 0);
  const finals = useMemo(
    () =>
      Object.fromEntries(
        students.map((s) => [s.id, computeFinal(components.map((c) => parseScore(vals[s.id]?.[c.id] ?? "")), weights)]),
      ),
    [vals, students, components], // eslint-disable-line react-hooks/exhaustive-deps
  );
  const summary = useMemo(() => {
    const values = Object.values(finals).map((f) => f.value).filter((v): v is number => v !== null);
    const complete = Object.values(finals).filter((f) => f.complete).length;
    return {
      avg: values.length ? Math.round((values.reduce((a, b) => a + b, 0) / values.length) * 10) / 10 : null,
      max: values.length ? Math.max(...values) : null,
      min: values.length ? Math.min(...values) : null,
      below: Object.values(finals).filter((f) => f.complete && f.value !== null && f.value < term.kktp).length,
      complete,
    };
  }, [finals, term.kktp]);
  const invalidCount = students.reduce(
    (n, s) => n + components.filter((c) => Number.isNaN(parseScore(vals[s.id]?.[c.id] ?? ""))).length,
    0,
  );

  const statusView = (() => {
    if (invalidCount) return { icon: AlertCircle, text: `${invalidCount} nilai tidak valid`, cls: "text-error-600" };
    switch (status.kind) {
      case "pending":
        return { icon: Cloud, text: "Menunggu disimpan…", cls: "text-gray-500" };
      case "saving":
        return { icon: Loader2, text: "Menyimpan…", cls: "text-gray-500 [&>svg]:animate-spin" };
      case "saved":
        return { icon: Check, text: `Tersimpan otomatis ${status.at}`, cls: "text-success-700" };
      case "error":
        return { icon: AlertCircle, text: "Gagal menyimpan", cls: "text-error-600" };
      default:
        return { icon: Cloud, text: "Perubahan disimpan otomatis", cls: "text-gray-500" };
    }
  })();

  return (
    <>
      <div className="flex flex-wrap gap-2.5">
        {[
          { label: "Rata-rata kelas", value: summary.avg === null ? "–" : String(summary.avg).replace(".", ",") },
          { label: "Tertinggi", value: summary.max ?? "–" },
          { label: "Terendah", value: summary.min ?? "–" },
          { label: `Di bawah KKTP ${formatScore(term.kktp)}`, value: summary.below, alert: summary.below > 0 },
          { label: "Nilai lengkap", value: `${summary.complete}/${students.length}` },
        ].map((s) => (
          <span key={s.label} className="inline-flex items-baseline gap-2 rounded-full bg-white py-1.5 pr-4 pl-4 text-[13px] text-gray-600 shadow-xs ring-1 ring-gray-200/80">
            <b className={cn("text-[15px] font-extrabold tabular-nums", s.alert ? "text-error-600" : "text-gray-900")}>{s.value}</b>
            {s.label}
          </span>
        ))}
      </div>

      <Card className="overflow-hidden">
        <div className="flex flex-col gap-3 px-5 pt-5 pb-4 sm:flex-row sm:items-center sm:justify-between sm:px-6">
          <div className="min-w-0">
            <h2 className="text-lg font-bold tracking-tight text-gray-900">
              Nilai kelas {className}
              <span className="ml-2 text-sm font-medium text-gray-500">
                TA {term.school_year}, semester {term.semester}
              </span>
            </h2>
            <p className={cn("mt-0.5 flex items-center gap-1.5 text-[13px] font-medium", statusView.cls)} aria-live="polite">
              <statusView.icon className="size-3.5" /> {statusView.text}
            </p>
          </div>
          <div className="flex flex-wrap gap-2">
            <Button variant="secondary" size="sm" icon={Settings2} onClick={() => setEditingComponents(true)}>
              Komponen & bobot
            </Button>
            <a href={exportHref} className={buttonClass("secondary", "sm")} onClick={() => void flush()}>
              <Download className="size-4" /> Excel {className}
            </a>
            <a href={exportAllHref} className={buttonClass("secondary", "sm")} onClick={() => void flush()}>
              <Download className="size-4" /> Excel semua kelas
            </a>
          </div>
        </div>

        {students.length === 0 ? (
          <EmptyState
            icon={Users}
            title={`Belum ada siswa di kelas ${className}`}
            description={`Tambahkan daftar siswa kelas ${className} untuk TA ${term.school_year} terlebih dahulu.`}
            action={
              <Link href={buildHref("/admin/siswa", { ta: term.school_year, kelas: className })} className={buttonClass("primary")}>
                <Users className="size-4" /> Isi data siswa
              </Link>
            }
          />
        ) : (
          <>
            <p className="border-t border-gray-100 bg-gray-50/70 px-5 py-2.5 text-[13px] text-gray-500 sm:px-6">
              Ketik nilai 0–100 (boleh desimal pakai koma). Tekan Enter untuk turun ke baris berikutnya. Untuk mengisi cepat, salin satu kolom
              nilai dari Excel lalu tempel di sel pertama.
            </p>
            <div className="scrollbar-thin overflow-x-auto">
              <table ref={gridRef} className="w-full min-w-[760px] border-collapse text-left text-sm">
                <thead className="border-y border-gray-100 text-xs text-gray-500">
                  <tr>
                    <th className="sticky left-0 z-10 bg-white py-2.5 pr-3 pl-5 font-semibold sm:pl-6">Nama siswa</th>
                    {components.map((c) => (
                      <th key={c.id} className="w-[92px] px-2 py-2.5 text-center font-semibold">
                        <span className="block text-gray-700">{c.name}</span>
                        <span className="font-medium text-gray-400 tabular-nums">
                          {totalWeight ? `${formatScore(Math.round((c.weight / totalWeight) * 1000) / 10)}%` : "0%"}
                        </span>
                      </th>
                    ))}
                    <th className="w-[92px] bg-brand-50/60 px-2 py-2.5 text-center font-semibold text-brand-800">Nilai akhir</th>
                    <th className="min-w-[280px] px-3 py-2.5 pr-5 font-semibold sm:pr-6">Deskripsi capaian</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {students.map((s, row) => {
                    const f = finals[s.id];
                    const below = f.value !== null && f.value < term.kktp;
                    return (
                      <tr key={s.id} className="group align-top hover:bg-gray-50/50">
                        <td className="sticky left-0 z-10 bg-white py-2 pr-3 pl-5 group-hover:bg-gray-50 sm:pl-6">
                          <div className="flex items-start gap-2.5">
                            <span className="w-5 shrink-0 pt-[7px] text-right text-xs font-semibold text-gray-400 tabular-nums">{row + 1}</span>
                            <div className="min-w-0 py-1">
                              <p className="max-w-[200px] truncate text-[13px] font-semibold text-gray-900" title={s.name}>
                                {s.name}
                              </p>
                              {s.nis && <p className="text-[11px] text-gray-400 tabular-nums">{s.nis}</p>}
                            </div>
                          </div>
                        </td>
                        {components.map((c, col) => {
                          const raw = vals[s.id]?.[c.id] ?? "";
                          const bad = Number.isNaN(parseScore(raw));
                          return (
                            <td key={c.id} className="px-1.5 py-2">
                              <input
                                data-row={row}
                                data-col={col}
                                value={raw}
                                onChange={(e) => setCell(s.id, c.id, e.target.value)}
                                onKeyDown={(e) => onKeyDown(e, row, col)}
                                onPaste={(e) => onPaste(e, row, col)}
                                onFocus={(e) => e.currentTarget.select()}
                                inputMode="decimal"
                                autoComplete="off"
                                aria-label={`${c.name} ${s.name}`}
                                aria-invalid={bad || undefined}
                                className={cn(
                                  "h-9 w-full rounded-lg bg-transparent text-center text-sm font-semibold text-gray-900 tabular-nums ring-1 ring-transparent outline-none ring-inset placeholder:text-gray-300 hover:ring-gray-200 focus:bg-white focus:ring-2 focus:ring-brand-500",
                                  bad && "bg-error-50 text-error-700 ring-error-300",
                                )}
                                placeholder="–"
                              />
                            </td>
                          );
                        })}
                        <td className="bg-brand-50/40 px-2 py-2 text-center">
                          <span
                            className={cn(
                              "inline-flex h-9 min-w-12 items-center justify-center rounded-lg px-2 text-[15px] font-extrabold tabular-nums",
                              f.value === null ? "text-gray-300" : below ? "text-error-600" : "text-gray-900",
                              f.value !== null && !f.complete && "font-semibold text-gray-400 italic",
                            )}
                            title={f.value !== null && !f.complete ? `Sementara: baru ${f.filled} dari ${f.total} komponen terisi` : below ? "Di bawah KKTP" : undefined}
                          >
                            {f.value ?? "–"}
                          </span>
                        </td>
                        <td className="px-2 py-2 pr-5 sm:pr-6">
                          <AutoGrowTextarea
                            value={notes[s.id] ?? ""}
                            onChange={(v) => setNote(s.id, v)}
                            label={`Deskripsi capaian ${s.name}`}
                          />
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
            <p className="border-t border-gray-100 px-5 py-3 text-xs text-gray-500 sm:px-6">
              Nilai akhir = rata-rata berbobot dari komponen yang sudah terisi, dibulatkan. Angka miring abu-abu berarti nilai sementara
              (belum semua komponen terisi). Merah berarti di bawah KKTP.
            </p>
          </>
        )}
      </Card>

      <ComponentsEditor open={editingComponents} onClose={() => setEditingComponents(false)} term={term} components={components} />
    </>
  );
}

function AutoGrowTextarea({ value, onChange, label }: { value: string; onChange: (v: string) => void; label: string }) {
  const ref = useRef<HTMLTextAreaElement>(null);
  const fit = useCallback(() => {
    const el = ref.current;
    if (!el) return;
    el.style.height = "auto";
    el.style.height = `${el.scrollHeight}px`;
  }, []);
  useEffect(fit, [value, fit]);
  // Hitung ulang tinggi saat lebar kolom berubah (mis. tabel menyesuaikan isi atau layar diputar).
  useEffect(() => {
    const el = ref.current;
    if (!el || typeof ResizeObserver === "undefined") return;
    let lastWidth = el.clientWidth;
    const ro = new ResizeObserver(() => {
      if (el.clientWidth !== lastWidth) {
        lastWidth = el.clientWidth;
        fit();
      }
    });
    ro.observe(el);
    return () => ro.disconnect();
  }, [fit]);
  return (
    <textarea
      ref={ref}
      value={value}
      onChange={(e) => onChange(e.target.value)}
      rows={1}
      maxLength={1000}
      placeholder="Tulis deskripsi capaian…"
      aria-label={label}
      className="block min-h-9 w-full resize-none overflow-hidden rounded-lg bg-transparent px-2.5 py-2 text-[13px] leading-snug text-gray-700 ring-1 ring-transparent outline-none ring-inset placeholder:text-gray-300 hover:ring-gray-200 focus:bg-white focus:ring-2 focus:ring-brand-500"
    />
  );
}
