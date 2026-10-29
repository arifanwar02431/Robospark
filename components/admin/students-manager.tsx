"use client";

import { useMemo, useState, useTransition } from "react";
import { ClipboardPaste, Pencil, Search, Trash2, UserPlus, Users } from "lucide-react";
import { Modal } from "@/components/modal";
import { useToast } from "@/components/toast";
import { Badge, Button, Card, EmptyState, Field, IconButton, Input, Select, Textarea, cn } from "@/components/ui";
import { addStudentsAction, deleteClassAction, deleteStudentAction, updateStudentAction } from "@/app/admin/rapor-actions";
import { CLASSES, parseStudentPaste, type Student } from "@/lib/rapor-shared";
import { ConfirmDelete } from "./confirm-delete";

const EXAMPLE = "0012345\tAhmad Fauzi\n0012346\tBunga Lestari\nCitra Maharani";

export function StudentsManager({ students, schoolYear, className }: { students: Student[]; schoolYear: string; className: string }) {
  const toast = useToast();
  const [pending, startTransition] = useTransition();
  const [search, setSearch] = useState("");
  const [adding, setAdding] = useState(false);
  const [pasteText, setPasteText] = useState("");
  const [editing, setEditing] = useState<Student | null>(null);
  const [form, setForm] = useState({ nis: "", name: "", class_name: className });
  const [formError, setFormError] = useState<string | null>(null);
  const [deleting, setDeleting] = useState<Student | null>(null);
  const [deletingAll, setDeletingAll] = useState(false);

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    return students.filter((s) => !q || s.name.toLowerCase().includes(q) || s.nis.includes(q));
  }, [students, search]);

  const preview = useMemo(() => parseStudentPaste(pasteText), [pasteText]);
  const existingNames = useMemo(() => new Set(students.map((s) => s.name.toLowerCase())), [students]);
  const newCount = preview.filter((p) => !existingNames.has(p.name.toLowerCase())).length;

  const submitPaste = () =>
    startTransition(async () => {
      const res = await addStudentsAction(schoolYear, className, pasteText);
      if (res.ok) {
        const skipped = res.data?.skipped ?? [];
        toast({
          type: "success",
          title: res.message ?? "Tersimpan.",
          description: skipped.length ? `${skipped.length} nama dilewati karena sudah ada.` : undefined,
        });
        setAdding(false);
        setPasteText("");
      } else toast({ type: "error", title: "Gagal menambahkan", description: res.error });
    });

  const openEdit = (s: Student) => {
    setFormError(null);
    setForm({ nis: s.nis, name: s.name, class_name: s.class_name });
    setEditing(s);
  };
  const submitEdit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editing) return;
    startTransition(async () => {
      const res = await updateStudentAction(editing.id, form);
      if (res.ok) {
        toast({
          type: "success",
          title: form.class_name !== className ? `Siswa dipindah ke kelas ${form.class_name}.` : (res.message ?? "Tersimpan."),
        });
        setEditing(null);
      } else setFormError(res.error);
    });
  };

  const confirmDelete = () =>
    deleting &&
    startTransition(async () => {
      const res = await deleteStudentAction(deleting.id);
      toast(res.ok ? { type: "success", title: res.message ?? "Dihapus." } : { type: "error", title: "Gagal menghapus", description: res.error });
      setDeleting(null);
    });

  const confirmDeleteAll = () =>
    startTransition(async () => {
      const res = await deleteClassAction(schoolYear, className);
      toast(res.ok ? { type: "success", title: res.message ?? "Dihapus." } : { type: "error", title: "Gagal menghapus", description: res.error });
      setDeletingAll(false);
    });

  return (
    <>
      <Card className="overflow-hidden">
        <div className="flex flex-col gap-3 px-5 pt-5 pb-4 sm:flex-row sm:items-center sm:justify-between sm:px-6">
          <div className="flex items-center gap-2.5">
            <h2 className="text-lg font-bold tracking-tight text-gray-900">Kelas {className}</h2>
            <Badge color="brand">{students.length} siswa</Badge>
          </div>
          <div className="flex flex-wrap gap-2.5">
            {students.length > 0 && (
              <div className="relative flex-1 sm:w-56 sm:flex-none">
                <Search className="pointer-events-none absolute top-1/2 left-3.5 size-4 -translate-y-1/2 text-gray-400" />
                <Input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Cari nama atau NIS" aria-label="Cari siswa" className="h-10 rounded-full py-0 pl-10" />
              </div>
            )}
            <Button icon={UserPlus} onClick={() => setAdding(true)}>
              Tambah siswa
            </Button>
          </div>
        </div>

        {students.length === 0 ? (
          <EmptyState
            icon={Users}
            title={`Belum ada siswa di kelas ${className}`}
            description="Salin kolom NIS dan nama dari Excel, lalu tempel sekaligus. Bisa juga ketik satu nama per baris."
            action={
              <Button icon={ClipboardPaste} onClick={() => setAdding(true)}>
                Tempel daftar siswa
              </Button>
            }
          />
        ) : (
          <>
            <ol className="divide-y divide-gray-100 border-t border-gray-100">
              {filtered.map((s) => (
                <li key={s.id} className="group flex items-center gap-4 px-5 py-2.5 hover:bg-gray-50/70 sm:px-6">
                  <span className="w-7 shrink-0 text-right text-[13px] font-semibold text-gray-400 tabular-nums">
                    {students.indexOf(s) + 1}
                  </span>
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-semibold text-gray-900">{s.name}</p>
                    <p className="text-[13px] text-gray-500 tabular-nums">{s.nis ? `NIS ${s.nis}` : "NIS belum diisi"}</p>
                  </div>
                  <div className="flex shrink-0 gap-0.5 sm:opacity-0 sm:group-hover:opacity-100 sm:focus-within:opacity-100">
                    <IconButton icon={Pencil} label={`Edit ${s.name}`} onClick={() => openEdit(s)} />
                    <IconButton icon={Trash2} label={`Hapus ${s.name}`} tone="error" onClick={() => setDeleting(s)} />
                  </div>
                </li>
              ))}
              {filtered.length === 0 && <li className="px-6 py-8 text-center text-sm text-gray-500">Tidak ada siswa yang cocok.</li>}
            </ol>
            <div className="flex justify-end border-t border-gray-100 px-5 py-3 sm:px-6">
              <Button variant="tertiary" size="sm" icon={Trash2} onClick={() => setDeletingAll(true)} className="text-error-700 hover:bg-error-50 hover:text-error-700">
                Hapus semua siswa {className}
              </Button>
            </div>
          </>
        )}
      </Card>

      {/* Tempel daftar siswa */}
      <Modal
        open={adding}
        onClose={() => !pending && setAdding(false)}
        icon={ClipboardPaste}
        title={`Tambah siswa ke kelas ${className}`}
        description={`Tahun ajaran ${schoolYear}. Satu siswa per baris.`}
        size="lg"
      >
        <div className="flex flex-col gap-4 pb-5 sm:pb-6">
          <Field
            label="Tempel dari Excel atau ketik nama"
            htmlFor="paste"
            hint="Di Excel, blok kolom NIS dan Nama (boleh dengan kolom No), tekan Ctrl+C, lalu tempel di sini. NIS boleh kosong."
          >
            <Textarea
              id="paste"
              value={pasteText}
              onChange={(e) => setPasteText(e.target.value)}
              rows={8}
              placeholder={EXAMPLE}
              className="font-mono text-[13px]"
            />
          </Field>
          {preview.length > 0 && (
            <div className="rounded-2xl bg-gray-50 p-3">
              <p className="mb-2 px-1 text-[13px] font-semibold text-gray-700">
                Terbaca {preview.length} siswa
                {newCount < preview.length && <span className="font-medium text-gray-500">, {preview.length - newCount} sudah ada dan akan dilewati</span>}
              </p>
              <ol className="scrollbar-thin max-h-56 overflow-y-auto rounded-xl bg-white ring-1 ring-gray-200">
                {preview.map((p, i) => {
                  const dup = existingNames.has(p.name.toLowerCase());
                  return (
                    <li key={i} className={cn("flex items-center gap-3 border-b border-gray-100 px-3 py-1.5 text-[13px] last:border-0", dup && "text-gray-400 line-through")}>
                      <span className="w-6 text-right text-gray-400 tabular-nums">{i + 1}</span>
                      <span className="w-24 shrink-0 text-gray-500 tabular-nums">{p.nis || "–"}</span>
                      <span className="truncate font-medium">{p.name}</span>
                    </li>
                  );
                })}
              </ol>
            </div>
          )}
          <div className="flex flex-col-reverse gap-2.5 pt-1 sm:flex-row sm:justify-end">
            <Button variant="secondary" onClick={() => setAdding(false)} disabled={pending}>
              Batal
            </Button>
            <Button icon={UserPlus} onClick={submitPaste} loading={pending} disabled={newCount === 0}>
              Simpan {newCount > 0 ? `${newCount} siswa` : ""}
            </Button>
          </div>
        </div>
      </Modal>

      {/* Edit siswa */}
      <Modal open={editing !== null} onClose={() => !pending && setEditing(null)} icon={Pencil} title="Edit siswa" size="md">
        {editing && (
          <form onSubmit={submitEdit} className="flex flex-col gap-5 pb-5 sm:pb-6">
            <Field label="Nama lengkap" htmlFor="s-name" required>
              <Input id="s-name" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} maxLength={120} required />
            </Field>
            <div className="grid grid-cols-2 gap-4">
              <Field label="NIS" htmlFor="s-nis">
                <Input id="s-nis" value={form.nis} onChange={(e) => setForm({ ...form, nis: e.target.value })} maxLength={30} inputMode="numeric" />
              </Field>
              <Field label="Kelas" htmlFor="s-class" hint="Ganti untuk memindah kelas.">
                <Select id="s-class" value={form.class_name} onChange={(e) => setForm({ ...form, class_name: e.target.value })}>
                  {CLASSES.map((c) => (
                    <option key={c} value={c}>
                      {c}
                    </option>
                  ))}
                </Select>
              </Field>
            </div>
            {formError && <p className="rounded-xl bg-error-50 px-3.5 py-2.5 text-sm text-error-700">{formError}</p>}
            <div className="flex flex-col-reverse gap-2.5 sm:flex-row sm:justify-end">
              <Button type="button" variant="secondary" onClick={() => setEditing(null)} disabled={pending}>
                Batal
              </Button>
              <Button type="submit" loading={pending}>
                Simpan perubahan
              </Button>
            </div>
          </form>
        )}
      </Modal>

      <ConfirmDelete
        open={deleting !== null}
        title="Hapus siswa ini?"
        description={deleting ? `${deleting.name} beserta semua nilainya akan dihapus.` : ""}
        pending={pending}
        onCancel={() => setDeleting(null)}
        onConfirm={confirmDelete}
      />
      <ConfirmDelete
        open={deletingAll}
        title={`Hapus semua siswa ${className}?`}
        description={`${students.length} siswa di kelas ${className} (TA ${schoolYear}) beserta semua nilainya akan dihapus. Tindakan ini tidak bisa dibatalkan.`}
        pending={pending}
        onCancel={() => setDeletingAll(false)}
        onConfirm={confirmDeleteAll}
      />
    </>
  );
}
