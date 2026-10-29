"use client";

import { useEffect, useState, useTransition } from "react";
import { ArrowDown, ArrowUp, Plus, Save, Settings2, Trash2 } from "lucide-react";
import { Modal } from "@/components/modal";
import { useToast } from "@/components/toast";
import { Button, Field, IconButton, Input, cn } from "@/components/ui";
import { saveComponentsAction } from "@/app/admin/rapor-actions";
import { formatScore, parseScore, type GradeComponent, type Term } from "@/lib/rapor-shared";

type Row = { key: string; id: number | null; name: string; weight: string };

export function ComponentsEditor({
  open,
  onClose,
  term,
  components,
}: {
  open: boolean;
  onClose: () => void;
  term: Term;
  components: GradeComponent[];
}) {
  const toast = useToast();
  const [pending, startTransition] = useTransition();
  const [rows, setRows] = useState<Row[]>([]);
  const [kktp, setKktp] = useState("");
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!open) return;
    setRows(components.map((c) => ({ key: String(c.id), id: c.id, name: c.name, weight: formatScore(c.weight) })));
    setKktp(formatScore(term.kktp));
    setError(null);
  }, [open, components, term.kktp]);

  const update = (key: string, patch: Partial<Row>) => setRows((r) => r.map((x) => (x.key === key ? { ...x, ...patch } : x)));
  const move = (i: number, d: -1 | 1) =>
    setRows((r) => {
      const next = [...r];
      [next[i], next[i + d]] = [next[i + d], next[i]];
      return next;
    });

  const total = rows.reduce((sum, r) => sum + (Number.isNaN(parseScore(r.weight)) ? 0 : (parseScore(r.weight) ?? 0)), 0);
  const removed = components.filter((c) => !rows.some((r) => r.id === c.id));

  const save = () => {
    const parsedRows = rows.map((r) => ({ id: r.id, name: r.name.trim(), weight: parseScore(r.weight) }));
    if (parsedRows.some((r) => r.weight === null || Number.isNaN(r.weight))) return setError("Bobot harus berupa angka 0–100.");
    const k = parseScore(kktp);
    if (k === null || Number.isNaN(k)) return setError("KKTP harus berupa angka 0–100.");
    startTransition(async () => {
      const res = await saveComponentsAction(term.id, {
        kktp: k,
        components: parsedRows.map((r) => ({ id: r.id, name: r.name, weight: r.weight as number })),
      });
      if (res.ok) {
        toast({ type: "success", title: res.message ?? "Tersimpan." });
        onClose();
      } else setError(res.error);
    });
  };

  return (
    <Modal
      open={open}
      onClose={() => !pending && onClose()}
      icon={Settings2}
      title="Komponen penilaian"
      description={`Berlaku untuk semua kelas di TA ${term.school_year} semester ${term.semester}.`}
      size="lg"
    >
      <div className="flex flex-col gap-5 pb-5 sm:pb-6">
        <div className="flex flex-col gap-2">
          <div className="grid grid-cols-[1fr_96px_104px] gap-2 px-1 text-[13px] font-semibold text-gray-700">
            <span>Nama komponen</span>
            <span>Bobot</span>
            <span />
          </div>
          {rows.map((r, i) => (
            <div key={r.key} className="grid grid-cols-[1fr_96px_104px] items-center gap-2">
              <Input value={r.name} onChange={(e) => update(r.key, { name: e.target.value })} maxLength={40} aria-label={`Nama komponen ${i + 1}`} placeholder="mis. Praktik" />
              <Input
                value={r.weight}
                onChange={(e) => update(r.key, { weight: e.target.value })}
                inputMode="decimal"
                aria-label={`Bobot ${r.name || `komponen ${i + 1}`}`}
                className="text-center tabular-nums"
              />
              <div className="flex">
                <IconButton icon={ArrowUp} label="Naikkan" onClick={() => move(i, -1)} disabled={i === 0} className="disabled:opacity-30" />
                <IconButton icon={ArrowDown} label="Turunkan" onClick={() => move(i, 1)} disabled={i === rows.length - 1} className="disabled:opacity-30" />
                <IconButton icon={Trash2} label={`Hapus ${r.name}`} tone="error" onClick={() => setRows((x) => x.filter((y) => y.key !== r.key))} disabled={rows.length === 1} className="disabled:opacity-30" />
              </div>
            </div>
          ))}
          <div className="flex items-center justify-between gap-3 pt-1">
            <Button
              variant="secondary"
              size="sm"
              icon={Plus}
              onClick={() => setRows((r) => [...r, { key: `new-${Date.now()}`, id: null, name: "", weight: "0" }])}
              disabled={rows.length >= 12}
            >
              Tambah komponen
            </Button>
            <p className={cn("text-[13px] font-semibold tabular-nums", total === 100 ? "text-success-700" : "text-warning-700")}>
              Total bobot: {formatScore(total)}
            </p>
          </div>
          {total !== 100 && total > 0 && (
            <p className="text-[13px] text-gray-500">Total tidak harus 100. Nilai akhir tetap dihitung sesuai perbandingan bobot.</p>
          )}
        </div>

        <Field label="KKTP (Kriteria Ketercapaian Tujuan Pembelajaran)" htmlFor="kktp" hint="Nilai akhir di bawah angka ini ditandai merah.">
          <Input id="kktp" value={kktp} onChange={(e) => setKktp(e.target.value)} inputMode="decimal" className="w-28! text-center tabular-nums" />
        </Field>

        {removed.length > 0 && (
          <p className="rounded-xl bg-warning-50 px-3.5 py-2.5 text-sm text-warning-700">
            Komponen {removed.map((c) => c.name).join(", ")} akan dihapus beserta semua nilainya di semester ini.
          </p>
        )}
        {error && <p className="rounded-xl bg-error-50 px-3.5 py-2.5 text-sm text-error-700">{error}</p>}

        <div className="flex flex-col-reverse gap-2.5 sm:flex-row sm:justify-end">
          <Button variant="secondary" onClick={onClose} disabled={pending}>
            Batal
          </Button>
          <Button icon={Save} onClick={save} loading={pending}>
            Simpan komponen
          </Button>
        </div>
      </div>
    </Modal>
  );
}
