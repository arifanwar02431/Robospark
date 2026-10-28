"use client";

import { useEffect, useMemo, useRef, useState, useTransition } from "react";
import { BookOpen, CirclePause, CirclePlay, Clock, MapPin, Pencil, Plus, Save, Search, Trash2, User } from "lucide-react";
import { Modal } from "@/components/modal";
import { TaskCard } from "@/components/planner";
import { useToast } from "@/components/toast";
import { Badge, Button, Card, EmptyState, Field, IconButton, Input, Segmented, Select, Textarea, TimeChip, cn } from "@/components/ui";
import { deleteLessonAction, saveLessonAction, toggleLessonAction } from "@/app/admin/actions";
import { durationLabel, toneFor } from "@/lib/colors";
import { DAY_NAMES } from "@/lib/date";
import type { Lesson } from "@/lib/types";
import { ConfirmDelete } from "./confirm-delete";
import { ReminderBadges, ReminderPicker } from "./reminder-picker";

type FormState = Omit<Lesson, "id">;
type View = "board" | "list";

const EMPTY: FormState = {
  subject: "",
  day_of_week: 1,
  start_time: "07:00",
  end_time: "08:30",
  teacher: "",
  room: "",
  notes: "",
  reminder_days: [1],
  active: true,
};
const DAYS = [1, 2, 3, 4, 5, 6, 7];
const toMin = (t: string) => Number(t.slice(0, 2)) * 60 + Number(t.slice(3, 5));

function totalDuration(list: Lesson[]) {
  const m = list.reduce((sum, l) => sum + Math.max(0, toMin(l.end_time) - toMin(l.start_time)), 0);
  return `${Math.floor(m / 60)}:${String(m % 60).padStart(2, "0")}`;
}

export function LessonsManager({ lessons, todayDow, nowMinutes }: { lessons: Lesson[]; todayDow: number; nowMinutes: number }) {
  const toast = useToast();
  const [view, setView] = useState<View>("board");
  const [day, setDay] = useState(0);
  const [search, setSearch] = useState("");
  const [editing, setEditing] = useState<{ id: number | null; form: FormState } | null>(null);
  const [deleting, setDeleting] = useState<Lesson | null>(null);
  const [formError, setFormError] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();
  const boardRef = useRef<HTMLDivElement>(null);

  const matches = useMemo(() => {
    const q = search.trim().toLowerCase();
    return lessons.filter((l) => !q || [l.subject, l.teacher, l.room].some((v) => v.toLowerCase().includes(q)));
  }, [lessons, search]);
  const byDay = useMemo(() => {
    const map = new Map<number, Lesson[]>(DAYS.map((d) => [d, []]));
    for (const l of matches) map.get(l.day_of_week)!.push(l);
    return map;
  }, [matches]);
  const listed = day === 0 ? matches : matches.filter((l) => l.day_of_week === day);

  // Geser papan ke kolom hari ini saat pertama dibuka.
  useEffect(() => {
    const board = boardRef.current;
    const col = board?.querySelector<HTMLElement>(`[data-day="${todayDow}"]`);
    if (board && col && board.scrollWidth > board.clientWidth) board.scrollLeft = col.offsetLeft - board.offsetLeft - 4;
  }, [todayDow, view]);

  const openCreate = (dow?: number) => {
    setFormError(null);
    setEditing({ id: null, form: { ...EMPTY, day_of_week: dow ?? (day || todayDow) } });
  };
  const openEdit = (l: Lesson) => {
    setFormError(null);
    const { id, ...form } = l;
    setEditing({ id, form });
  };
  const update = (patch: Partial<FormState>) => setEditing((e) => (e ? { ...e, form: { ...e.form, ...patch } } : e));

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editing) return;
    startTransition(async () => {
      const res = await saveLessonAction(editing.id, editing.form);
      if (res.ok) {
        toast({ type: "success", title: res.message ?? "Tersimpan." });
        setEditing(null);
      } else setFormError(res.error);
    });
  };

  const confirmDelete = () => {
    if (!deleting) return;
    startTransition(async () => {
      const res = await deleteLessonAction(deleting.id);
      if (res.ok) toast({ type: "success", title: res.message ?? "Dihapus." });
      else toast({ type: "error", title: "Gagal menghapus", description: res.error });
      setDeleting(null);
    });
  };

  const toggleActive = (l: Lesson) => {
    startTransition(async () => {
      const res = await toggleLessonAction(l.id, !l.active);
      if (res.ok) toast({ type: "success", title: res.message ?? "Diperbarui." });
      else toast({ type: "error", title: "Gagal memperbarui", description: res.error });
    });
  };

  const cardActions = (l: Lesson) => (
    <>
      <IconButton
        icon={l.active ? CirclePause : CirclePlay}
        label={l.active ? "Nonaktifkan" : "Aktifkan"}
        onClick={(e) => {
          e.stopPropagation();
          toggleActive(l);
        }}
      />
      <IconButton
        icon={Pencil}
        label="Edit"
        onClick={(e) => {
          e.stopPropagation();
          openEdit(l);
        }}
      />
      <IconButton
        icon={Trash2}
        label="Hapus"
        tone="error"
        onClick={(e) => {
          e.stopPropagation();
          setDeleting(l);
        }}
      />
    </>
  );

  return (
    <>
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <Segmented<View>
          label="Tampilan"
          value={view}
          onChange={setView}
          options={[
            { value: "board", label: "Papan minggu" },
            { value: "list", label: "Daftar" },
          ]}
        />
        <div className="flex gap-2.5">
          <div className="relative flex-1 sm:w-64 sm:flex-none">
            <Search className="pointer-events-none absolute top-1/2 left-3.5 size-4 -translate-y-1/2 text-gray-400" />
            <Input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Cari pelajaran" className="h-10 rounded-full py-0 pl-10" aria-label="Cari pelajaran" />
          </div>
          <Button icon={Plus} onClick={() => openCreate()} className="max-sm:hidden">
            Tambah pelajaran
          </Button>
        </div>
      </div>

      {lessons.length === 0 ? (
        <Card className="mt-6">
          <EmptyState
            icon={BookOpen}
            title="Belum ada jadwal pelajaran"
            description="Tambahkan jadwal mingguan Anda. Pengingat dikirim ke Telegram sesuai H yang dipilih."
            action={
              <Button icon={Plus} onClick={() => openCreate()}>
                Tambah pelajaran
              </Button>
            }
          />
        </Card>
      ) : view === "board" ? (
        <div ref={boardRef} className="scrollbar-thin -mx-4 mt-6 flex snap-x gap-3 overflow-x-auto px-4 pb-4 sm:-mx-8 sm:px-8 lg:-mx-10 lg:px-10">
          {DAYS.map((d) => {
            const list = byDay.get(d)!;
            const isToday = d === todayDow;
            const done = isToday ? list.filter((l) => toMin(l.end_time) <= nowMinutes).length : 0;
            return (
              <section
                key={d}
                data-day={d}
                aria-label={`Hari ${DAY_NAMES[d]}`}
                className={cn(
                  "flex w-[248px] shrink-0 snap-start flex-col gap-2.5 rounded-2xl p-2.5 min-[1800px]:w-auto min-[1800px]:min-w-0 min-[1800px]:flex-1",
                  isToday ? "bg-brand-50/60 ring-1 ring-brand-100" : "bg-gray-50 ring-1 ring-gray-100",
                )}
              >
                <div className="px-1.5 pt-1.5">
                  <div className="flex items-center justify-between gap-2">
                    <h3 className="text-base font-bold tracking-tight text-gray-900">{DAY_NAMES[d]}</h3>
                    {list.length > 0 && <TimeChip>{totalDuration(list)}</TimeChip>}
                  </div>
                  <p className={cn("text-xs font-medium", isToday ? "text-brand-700" : "text-gray-500")}>
                    {isToday ? "Hari ini" : list.length ? `${list.length} pelajaran` : "Kosong"}
                    {isToday && list.length > 0 && `, ${done} dari ${list.length} selesai`}
                  </p>
                  <div className="mt-2.5 h-1 overflow-hidden rounded-full bg-gray-200/70">
                    <div
                      className="h-full rounded-full bg-brand-500 transition-[width]"
                      style={{ width: isToday && list.length ? `${(done / list.length) * 100}%` : "0%" }}
                    />
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => openCreate(d)}
                  className="flex items-center gap-1.5 rounded-xl px-3 py-2 text-[13px] font-medium text-gray-500 transition-colors hover:bg-white hover:text-gray-800 hover:shadow-xs"
                  aria-label={`Tambah pelajaran hari ${DAY_NAMES[d]}`}
                >
                  <Plus className="size-4" /> Tambah
                </button>
                {list.map((l) => (
                  <div
                    key={l.id}
                    role="button"
                    tabIndex={0}
                    onClick={() => openEdit(l)}
                    onKeyDown={(e) => e.key === "Enter" && openEdit(l)}
                    className="cursor-pointer rounded-xl outline-none focus-visible:ring-2 focus-visible:ring-brand-500"
                    aria-label={`Edit ${l.subject}`}
                  >
                    <TaskCard
                      title={l.subject}
                      chip={durationLabel(l.start_time, l.end_time)}
                      chipAccent={isToday && toMin(l.start_time) <= nowMinutes && nowMinutes < toMin(l.end_time)}
                      lines={[
                        { icon: Clock, text: `${l.start_time}–${l.end_time}` },
                        ...(l.teacher ? [{ icon: User, text: l.teacher }] : []),
                        ...(l.room ? [{ icon: MapPin, text: l.room }] : []),
                      ]}
                      reminders={l.reminder_days}
                      toneKey={l.subject}
                      muted={!l.active}
                      tag={!l.active ? <Badge>Nonaktif</Badge> : undefined}
                      actions={cardActions(l)}
                    />
                  </div>
                ))}
              </section>
            );
          })}
        </div>
      ) : (
        <Card className="mt-6 overflow-hidden">
          <div className="scrollbar-thin overflow-x-auto border-b border-gray-100 px-4 py-3 sm:px-5">
            <Segmented<number>
              label="Filter hari"
              value={day}
              onChange={setDay}
              options={[
                { value: 0, label: "Semua", count: matches.length },
                ...DAYS.map((d) => ({ value: d, label: DAY_NAMES[d].slice(0, 3), count: byDay.get(d)!.length })),
              ]}
            />
          </div>
          {listed.length === 0 ? (
            <EmptyState icon={Search} title="Tidak ada yang cocok" description="Coba hari lain atau ubah kata kunci pencarian." />
          ) : (
            <>
              <table className="hidden w-full text-left md:table">
                <thead className="text-xs font-semibold text-gray-500">
                  <tr>
                    <th className="px-6 py-3 font-semibold">Mata pelajaran</th>
                    <th className="px-6 py-3 font-semibold">Hari & jam</th>
                    <th className="px-6 py-3 font-semibold">Ruang</th>
                    <th className="px-6 py-3 font-semibold">Pengingat</th>
                    <th className="px-6 py-3 font-semibold">Status</th>
                    <th className="w-px px-4 py-3" />
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100 border-t border-gray-100">
                  {listed.map((l) => (
                    <tr key={l.id} className={cn("text-sm transition-colors hover:bg-gray-50/70", !l.active && "opacity-60")}>
                      <td className="px-6 py-3.5">
                        <div className="flex items-center gap-3">
                          <span className={cn("h-8 w-1 shrink-0 rounded-full", toneFor(l.subject).stripe)} />
                          <div>
                            <p className="font-semibold text-gray-900">{l.subject}</p>
                            {l.teacher && <p className="text-[13px] text-gray-500">{l.teacher}</p>}
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-3.5 text-gray-600">
                        <p className="font-semibold text-gray-900">{DAY_NAMES[l.day_of_week]}</p>
                        <p className="text-[13px] tabular-nums">
                          {l.start_time}–{l.end_time}
                        </p>
                      </td>
                      <td className="px-6 py-3.5 text-gray-600">{l.room || <span className="text-gray-300">–</span>}</td>
                      <td className="px-6 py-3.5">
                        <ReminderBadges days={l.reminder_days} />
                      </td>
                      <td className="px-6 py-3.5">
                        <button onClick={() => toggleActive(l)} disabled={pending} title="Klik untuk mengubah status">
                          <Badge color={l.active ? "success" : "gray"} dot>
                            {l.active ? "Aktif" : "Nonaktif"}
                          </Badge>
                        </button>
                      </td>
                      <td className="px-4 py-3.5">
                        <div className="flex justify-end gap-0.5">
                          <IconButton icon={Pencil} label="Edit" onClick={() => openEdit(l)} />
                          <IconButton icon={Trash2} label="Hapus" tone="error" onClick={() => setDeleting(l)} />
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
              <div className="flex flex-col gap-2.5 p-3 md:hidden">
                {listed.map((l) => (
                  <div key={l.id} role="button" tabIndex={0} onClick={() => openEdit(l)} onKeyDown={(e) => e.key === "Enter" && openEdit(l)} className="cursor-pointer">
                    <TaskCard
                      title={l.subject}
                      chip={DAY_NAMES[l.day_of_week].slice(0, 3)}
                      lines={[
                        { icon: Clock, text: `${l.start_time}–${l.end_time}` },
                        ...(l.teacher ? [{ icon: User, text: l.teacher }] : []),
                        ...(l.room ? [{ icon: MapPin, text: l.room }] : []),
                      ]}
                      reminders={l.reminder_days}
                      toneKey={l.subject}
                      muted={!l.active}
                      tag={!l.active ? <Badge>Nonaktif</Badge> : undefined}
                      actions={cardActions(l)}
                    />
                  </div>
                ))}
              </div>
            </>
          )}
        </Card>
      )}

      <Button icon={Plus} onClick={() => openCreate()} size="lg" className="fixed right-4 bottom-5 z-20 shadow-lg sm:hidden" aria-label="Tambah pelajaran">
        Tambah
      </Button>

      <Modal
        open={editing !== null}
        onClose={() => !pending && setEditing(null)}
        icon={BookOpen}
        title={editing?.id ? "Edit pelajaran" : "Tambah pelajaran"}
        description="Berulang setiap minggu pada hari yang dipilih."
        size="lg"
      >
        {editing && (
          <form onSubmit={submit} className="flex flex-col gap-5 pb-5 sm:pb-6">
            <Field label="Mata pelajaran" htmlFor="subject" required>
              <Input
                id="subject"
                value={editing.form.subject}
                onChange={(e) => update({ subject: e.target.value })}
                placeholder="mis. Matematika"
                maxLength={120}
                required
              />
            </Field>
            <div className="grid grid-cols-1 gap-5 sm:grid-cols-3">
              <Field label="Hari" htmlFor="day" required>
                <Select id="day" value={editing.form.day_of_week} onChange={(e) => update({ day_of_week: Number(e.target.value) })}>
                  {DAYS.map((d) => (
                    <option key={d} value={d}>
                      {DAY_NAMES[d]}
                    </option>
                  ))}
                </Select>
              </Field>
              <Field label="Jam mulai" htmlFor="start" required>
                <Input id="start" type="time" value={editing.form.start_time} onChange={(e) => update({ start_time: e.target.value })} required />
              </Field>
              <Field label="Jam selesai" htmlFor="end" required>
                <Input id="end" type="time" value={editing.form.end_time} onChange={(e) => update({ end_time: e.target.value })} required />
              </Field>
            </div>
            <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
              <Field label="Pengajar" htmlFor="teacher">
                <Input id="teacher" value={editing.form.teacher} onChange={(e) => update({ teacher: e.target.value })} placeholder="mis. Bu Sari" maxLength={120} />
              </Field>
              <Field label="Ruang" htmlFor="room">
                <Input id="room" value={editing.form.room} onChange={(e) => update({ room: e.target.value })} placeholder="mis. Lab Komputer" maxLength={80} />
              </Field>
            </div>
            <Field label="Catatan" htmlFor="notes" hint="Ikut dikirim di pesan Telegram, mis. barang yang harus dibawa.">
              <Textarea id="notes" value={editing.form.notes} onChange={(e) => update({ notes: e.target.value })} rows={3} maxLength={500} />
            </Field>
            <Field label="Pengingat Telegram" hint="Berapa hari sebelum pelajaran pengingat dikirim, sekitar pukul 06.00 WIB. Maksimal H-6.">
              <ReminderPicker value={editing.form.reminder_days} onChange={(reminder_days) => update({ reminder_days })} presets={[0, 1, 2]} max={6} />
            </Field>
            <label className="flex cursor-pointer items-start gap-3 rounded-2xl bg-gray-50 p-3.5">
              <input type="checkbox" checked={editing.form.active} onChange={(e) => update({ active: e.target.checked })} className="peer sr-only" />
              <span className="relative mt-0.5 h-5 w-9 shrink-0 rounded-full bg-gray-300 transition-colors peer-checked:bg-brand-600 peer-focus-visible:ring-4 peer-focus-visible:ring-brand-100 after:absolute after:top-0.5 after:left-0.5 after:size-4 after:rounded-full after:bg-white after:shadow-sm after:transition-transform peer-checked:after:translate-x-4" />
              <span>
                <span className="block text-sm font-semibold text-gray-800">Aktif</span>
                <span className="block text-[13px] text-gray-500">Matikan untuk menghentikan pengingat sementara, mis. saat libur.</span>
              </span>
            </label>
            {formError && <p className="rounded-xl bg-error-50 px-3.5 py-2.5 text-sm text-error-700">{formError}</p>}
            <div className="flex flex-col-reverse gap-2.5 pt-2 sm:flex-row sm:justify-end">
              {editing.id !== null && (
                <Button
                  type="button"
                  variant="destructive-secondary"
                  icon={Trash2}
                  className="sm:mr-auto"
                  disabled={pending}
                  onClick={() => {
                    setDeleting(lessons.find((x) => x.id === editing.id) ?? null);
                    setEditing(null);
                  }}
                >
                  Hapus
                </Button>
              )}
              <Button type="button" variant="secondary" onClick={() => setEditing(null)} disabled={pending}>
                Batal
              </Button>
              <Button type="submit" icon={Save} loading={pending}>
                {editing.id ? "Simpan perubahan" : "Tambah pelajaran"}
              </Button>
            </div>
          </form>
        )}
      </Modal>

      <ConfirmDelete
        open={deleting !== null}
        title="Hapus pelajaran ini?"
        description={deleting ? `${deleting.subject} (${DAY_NAMES[deleting.day_of_week]}, ${deleting.start_time}) akan dihapus beserta pengingatnya.` : ""}
        pending={pending}
        onCancel={() => setDeleting(null)}
        onConfirm={confirmDelete}
      />
    </>
  );
}
