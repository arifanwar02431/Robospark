"use client";

import { useMemo, useState, useTransition } from "react";
import { BellRing, CalendarDays, Clock, MapPin, Pencil, Plus, Save, Search, Trash2 } from "lucide-react";
import { Modal } from "@/components/modal";
import { useToast } from "@/components/toast";
import { Badge, Button, Card, EmptyState, Field, IconButton, Input, Segmented, Textarea, cn } from "@/components/ui";
import { deleteEventAction, saveEventAction } from "@/app/admin/actions";
import { toneFor } from "@/lib/colors";
import { addDays, diffDays, formatDate, formatTimeRange, reminderLabel, relativeDayLabel } from "@/lib/date";
import type { EventItem } from "@/lib/types";
import { ConfirmDelete } from "./confirm-delete";
import { ReminderBadges, ReminderPicker } from "./reminder-picker";

type FormState = {
  title: string;
  event_date: string;
  start_time: string;
  end_time: string;
  location: string;
  description: string;
  reminder_days: number[];
};

type Tab = "upcoming" | "past" | "all";

function statusBadge(distance: number) {
  if (distance < 0) return <Badge color="gray">Selesai</Badge>;
  if (distance === 0) return <Badge color="brand" dot>Hari ini</Badge>;
  if (distance === 1) return <Badge color="warning" dot>Besok</Badge>;
  if (distance <= 7) return <Badge color="blue">{relativeDayLabel(distance)}</Badge>;
  return <Badge color="gray">{relativeDayLabel(distance)}</Badge>;
}

/** Pengingat berikutnya yang belum lewat untuk sebuah kegiatan. */
function nextReminder(event: EventItem, today: string): { date: string; days: number } | null {
  const candidates = [...event.reminder_days]
    .sort((a, b) => b - a)
    .map((d) => ({ days: d, date: addDays(event.event_date, -d) }))
    .filter((c) => c.date >= today);
  return candidates[0] ?? null;
}

const monthFmt = new Intl.DateTimeFormat("id-ID", { month: "long", year: "numeric", timeZone: "UTC" });
const weekdayFmt = new Intl.DateTimeFormat("id-ID", { weekday: "short", timeZone: "UTC" });

export function EventsManager({ events, today }: { events: EventItem[]; today: string }) {
  const toast = useToast();
  const [tab, setTab] = useState<Tab>("upcoming");
  const [search, setSearch] = useState("");
  const [editing, setEditing] = useState<{ id: number | null; form: FormState } | null>(null);
  const [deleting, setDeleting] = useState<EventItem | null>(null);
  const [formError, setFormError] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();

  const upcomingCount = events.filter((e) => e.event_date >= today).length;
  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    const list = events.filter(
      (e) =>
        (tab === "all" || (tab === "upcoming" ? e.event_date >= today : e.event_date < today)) &&
        (!q || [e.title, e.location, e.description].some((v) => v.toLowerCase().includes(q))),
    );
    return tab === "past" ? list.reverse() : list;
  }, [events, tab, search, today]);

  const groups = useMemo(() => {
    const map = new Map<string, EventItem[]>();
    for (const e of filtered) {
      const key = e.event_date.slice(0, 7);
      map.set(key, [...(map.get(key) ?? []), e]);
    }
    return [...map.entries()];
  }, [filtered]);

  const openCreate = () => {
    setFormError(null);
    setEditing({
      id: null,
      form: { title: "", event_date: addDays(today, 7), start_time: "", end_time: "", location: "", description: "", reminder_days: [3, 1] },
    });
  };
  const openEdit = (e: EventItem) => {
    setFormError(null);
    setEditing({
      id: e.id,
      form: {
        title: e.title,
        event_date: e.event_date,
        start_time: e.start_time ?? "",
        end_time: e.end_time ?? "",
        location: e.location,
        description: e.description,
        reminder_days: e.reminder_days,
      },
    });
  };
  const update = (patch: Partial<FormState>) => setEditing((s) => (s ? { ...s, form: { ...s.form, ...patch } } : s));

  const submit = (ev: React.FormEvent) => {
    ev.preventDefault();
    if (!editing) return;
    startTransition(async () => {
      const res = await saveEventAction(editing.id, editing.form);
      if (res.ok) {
        toast({ type: "success", title: res.message ?? "Tersimpan." });
        setEditing(null);
      } else setFormError(res.error);
    });
  };

  const confirmDelete = () => {
    if (!deleting) return;
    startTransition(async () => {
      const res = await deleteEventAction(deleting.id);
      if (res.ok) toast({ type: "success", title: res.message ?? "Dihapus." });
      else toast({ type: "error", title: "Gagal menghapus", description: res.error });
      setDeleting(null);
    });
  };

  const formDistance = editing?.form.event_date ? diffDays(editing.form.event_date, today) : null;
  const skipped = editing && formDistance !== null ? editing.form.reminder_days.filter((d) => d > formDistance) : [];

  return (
    <>
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <Segmented<Tab>
          label="Filter kegiatan"
          value={tab}
          onChange={setTab}
          options={[
            { value: "upcoming", label: "Mendatang", count: upcomingCount },
            { value: "past", label: "Sudah lewat" },
            { value: "all", label: "Semua", count: events.length },
          ]}
        />
        <div className="flex gap-2.5">
          <div className="relative flex-1 sm:w-64 sm:flex-none">
            <Search className="pointer-events-none absolute top-1/2 left-3.5 size-4 -translate-y-1/2 text-gray-400" />
            <Input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Cari kegiatan" className="h-10 rounded-full py-0 pl-10" aria-label="Cari kegiatan" />
          </div>
          <Button icon={Plus} onClick={openCreate} className="max-sm:hidden">
            Tambah kegiatan
          </Button>
        </div>
      </div>

      {filtered.length === 0 ? (
        <Card className="mt-6">
          <EmptyState
            icon={CalendarDays}
            title={events.length === 0 ? "Belum ada kegiatan" : "Tidak ada kegiatan di sini"}
            description={
              events.length === 0
                ? "Catat ujian, rapat, atau acara penting. Pengingat dikirim ke Telegram H-berapa pun yang Anda pilih."
                : "Coba tab lain atau ubah kata kunci pencarian."
            }
            action={
              <Button icon={Plus} onClick={openCreate}>
                Tambah kegiatan
              </Button>
            }
          />
        </Card>
      ) : (
        <div className="mt-7 flex flex-col gap-9">
          {groups.map(([month, list]) => (
            <section key={month} aria-label={monthFmt.format(new Date(`${month}-01T00:00:00Z`))}>
              <div className="mb-3 flex items-baseline gap-2.5 px-1">
                <h2 className="text-lg font-bold tracking-tight text-gray-900 capitalize">{monthFmt.format(new Date(`${month}-01T00:00:00Z`))}</h2>
                <span className="text-[13px] font-medium text-gray-400">{list.length} kegiatan</span>
              </div>
              <ul className="flex flex-col gap-2.5">
                {list.map((e) => {
                  const distance = diffDays(e.event_date, today);
                  const next = distance >= 0 ? nextReminder(e, today) : null;
                  const tone = toneFor(e.title);
                  const date = new Date(`${e.event_date}T00:00:00Z`);
                  return (
                    <li key={e.id} data-event={e.title}>
                      <div
                        role="button"
                        tabIndex={0}
                        onClick={() => openEdit(e)}
                        onKeyDown={(k) => k.key === "Enter" && openEdit(e)}
                        className={cn(
                          "group flex cursor-pointer items-start gap-4 rounded-2xl bg-white p-3 shadow-xs ring-1 ring-gray-200/80 transition-shadow outline-none hover:shadow-md hover:ring-gray-300 focus-visible:ring-2 focus-visible:ring-brand-500 sm:items-center",
                          distance < 0 && "opacity-70",
                        )}
                      >
                        <div
                          className={cn(
                            "flex w-14 shrink-0 flex-col items-center justify-center rounded-xl py-2",
                            distance === 0 ? "bg-brand-600 text-white" : tone.soft,
                          )}
                        >
                          <span className="text-[11px] font-semibold capitalize opacity-80">{weekdayFmt.format(date)}</span>
                          <span className="text-[22px] leading-none font-extrabold tabular-nums">{date.getUTCDate()}</span>
                        </div>
                        <div className="min-w-0 flex-1">
                          <div className="flex flex-wrap items-center gap-2">
                            <p className="text-[15px] font-bold text-gray-900">{e.title}</p>
                            {statusBadge(distance)}
                          </div>
                          <div className="mt-1 flex flex-wrap items-center gap-x-4 gap-y-1 text-[13px] text-gray-500">
                            <span className="flex items-center gap-1.5 tabular-nums">
                              <Clock className="size-3.5 text-gray-400" />
                              {formatTimeRange(e.start_time, e.end_time)}
                            </span>
                            {e.location && (
                              <span className="flex min-w-0 items-center gap-1.5">
                                <MapPin className="size-3.5 shrink-0 text-gray-400" />
                                <span className="truncate">{e.location}</span>
                              </span>
                            )}
                          </div>
                          <div className="mt-2 flex flex-wrap items-center gap-x-3 gap-y-1.5">
                            <ReminderBadges days={e.reminder_days} />
                            {next && (
                              <span className="flex items-center gap-1 text-xs font-medium text-gray-500">
                                <BellRing className="size-3.5 text-brand-500" />
                                Berikutnya {next.date === today ? "hari ini" : formatDate(next.date, "short")}
                              </span>
                            )}
                          </div>
                        </div>
                        <div className="hidden shrink-0 gap-0.5 transition-opacity group-focus-within:opacity-100 sm:flex sm:opacity-0 sm:group-hover:opacity-100">
                          <IconButton
                            icon={Pencil}
                            label="Edit"
                            onClick={(ev) => {
                              ev.stopPropagation();
                              openEdit(e);
                            }}
                          />
                          <IconButton
                            icon={Trash2}
                            label="Hapus"
                            tone="error"
                            onClick={(ev) => {
                              ev.stopPropagation();
                              setDeleting(e);
                            }}
                          />
                        </div>
                      </div>
                    </li>
                  );
                })}
              </ul>
            </section>
          ))}
        </div>
      )}

      <Button icon={Plus} onClick={openCreate} size="lg" className="fixed right-4 bottom-5 z-20 shadow-lg sm:hidden" aria-label="Tambah kegiatan">
        Tambah
      </Button>

      <Modal
        open={editing !== null}
        onClose={() => !pending && setEditing(null)}
        icon={CalendarDays}
        title={editing?.id ? "Edit kegiatan" : "Tambah kegiatan"}
        description="Kegiatan sekali jalan pada tanggal tertentu."
        size="lg"
      >
        {editing && (
          <form onSubmit={submit} className="flex flex-col gap-5 pb-5 sm:pb-6">
            <Field label="Nama kegiatan" htmlFor="title" required>
              <Input id="title" value={editing.form.title} onChange={(e) => update({ title: e.target.value })} placeholder="mis. Ujian Tengah Semester" maxLength={150} required />
            </Field>
            <div className="grid grid-cols-1 gap-5 sm:grid-cols-3">
              <Field label="Tanggal" htmlFor="date" required>
                <Input id="date" type="date" value={editing.form.event_date} onChange={(e) => update({ event_date: e.target.value })} required />
              </Field>
              <Field label="Jam mulai" htmlFor="start" hint="Opsional">
                <Input id="start" type="time" value={editing.form.start_time} onChange={(e) => update({ start_time: e.target.value })} />
              </Field>
              <Field label="Jam selesai" htmlFor="end" hint="Opsional">
                <Input id="end" type="time" value={editing.form.end_time} onChange={(e) => update({ end_time: e.target.value })} />
              </Field>
            </div>
            <Field label="Lokasi" htmlFor="location">
              <Input id="location" value={editing.form.location} onChange={(e) => update({ location: e.target.value })} placeholder="mis. Aula utama" maxLength={150} />
            </Field>
            <Field label="Deskripsi" htmlFor="description" hint="Ikut dikirim di pesan Telegram.">
              <Textarea id="description" value={editing.form.description} onChange={(e) => update({ description: e.target.value })} rows={3} maxLength={1000} />
            </Field>
            <Field label="Pengingat Telegram" hint="Berapa hari sebelum kegiatan pengingat dikirim, sekitar pukul 06.00 WIB. Bisa lebih dari satu.">
              <ReminderPicker value={editing.form.reminder_days} onChange={(reminder_days) => update({ reminder_days })} presets={[0, 1, 3, 7, 14]} max={365} />
            </Field>
            {formDistance !== null && formDistance >= 0 && skipped.length > 0 && (
              <p className="rounded-xl bg-warning-50 px-3.5 py-2.5 text-sm text-warning-700">
                Kegiatan ini {relativeDayLabel(formDistance).toLowerCase()}, jadi pengingat{" "}
                {[...skipped].sort((a, b) => b - a).map(reminderLabel).join(", ")} sudah terlewat dan tidak akan dikirim.
              </p>
            )}
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
                    setDeleting(events.find((x) => x.id === editing.id) ?? null);
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
                {editing.id ? "Simpan perubahan" : "Tambah kegiatan"}
              </Button>
            </div>
          </form>
        )}
      </Modal>

      <ConfirmDelete
        open={deleting !== null}
        title="Hapus kegiatan ini?"
        description={deleting ? `${deleting.title} (${formatDate(deleting.event_date, "medium")}) akan dihapus beserta pengingatnya.` : ""}
        pending={pending}
        onCancel={() => setDeleting(null)}
        onConfirm={confirmDelete}
      />
    </>
  );
}
