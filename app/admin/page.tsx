import type { Metadata } from "next";
import Link from "next/link";
import { BookOpen, CalendarDays, CheckCircle2, Clock, Gauge, MapPin, Send, TriangleAlert, User } from "lucide-react";
import { DayTimeline, TaskCard, type TimelineItem } from "@/components/planner";
import { Alert, Badge, Card, CardHeader, PageHeader, buttonClass, cn } from "@/components/ui";
import { requireAdmin } from "@/lib/auth";
import { toneFor } from "@/lib/colors";
import { getDashboardData } from "@/lib/data";
import {
  DAY_NAMES,
  addDays,
  diffDays,
  formatDate,
  formatTimeRange,
  greeting,
  isoDayOfWeek,
  nowMinutesJakarta,
  reminderLabel,
  relativeDayLabel,
  todayJakarta,
} from "@/lib/date";
import { previewFrom, sentKey } from "@/lib/reminders";
import { regionInfo } from "@/lib/region";
import { telegramStatus } from "@/lib/telegram";
import type { EventItem, Lesson, ReminderPreview } from "@/lib/types";

export const metadata: Metadata = { title: "Hari ini" };
export const dynamic = "force-dynamic";

const toMin = (t: string) => Number(t.slice(0, 2)) * 60 + Number(t.slice(3, 5));
const dayMonth = new Intl.DateTimeFormat("id-ID", { day: "numeric", month: "long", timeZone: "UTC" });

type DayItem =
  | { kind: "lesson"; key: string; start: string; lesson: Lesson }
  | { kind: "event"; key: string; start: string; event: EventItem };

function itemsFor(date: string, lessons: Lesson[], events: EventItem[]): DayItem[] {
  const dow = isoDayOfWeek(date);
  return [
    ...events.filter((e) => e.event_date === date).map((e) => ({ kind: "event" as const, key: `e${e.id}`, start: e.start_time ?? "00:00", event: e })),
    ...lessons.filter((l) => l.day_of_week === dow).map((l) => ({ kind: "lesson" as const, key: `l${l.id}`, start: l.start_time, lesson: l })),
  ].sort((a, b) => a.start.localeCompare(b.start));
}

function DayColumn({ date, label, items, nowMinutes }: { date: string; label: string; items: DayItem[]; nowMinutes?: number }) {
  const lessonsOnly = items.filter((i) => i.kind === "lesson");
  const done = nowMinutes != null ? lessonsOnly.filter((i) => i.kind === "lesson" && toMin(i.lesson.end_time) <= nowMinutes).length : 0;
  return (
    <section className="flex min-w-0 flex-col gap-3 p-4 sm:p-5" aria-label={label}>
      <div>
        <div className="flex items-center justify-between gap-2">
          <h2 className="text-lg font-bold tracking-tight text-gray-900">{DAY_NAMES[isoDayOfWeek(date)]}</h2>
          <Badge color={nowMinutes != null ? "brand" : "gray"}>{label}</Badge>
        </div>
        <p className="text-[13px] text-gray-500">{dayMonth.format(new Date(`${date}T00:00:00Z`))}</p>
        <div className="mt-3 h-1 overflow-hidden rounded-full bg-gray-100">
          <div className="h-full rounded-full bg-brand-500" style={{ width: lessonsOnly.length ? `${(done / lessonsOnly.length) * 100}%` : "0%" }} />
        </div>
      </div>
      {items.length === 0 ? (
        <p className="rounded-xl bg-gray-50 px-4 py-6 text-center text-[13px] text-gray-500">Tidak ada jadwal.</p>
      ) : (
        items.map((i) =>
          i.kind === "lesson" ? (
            <TaskCard
              key={i.key}
              title={i.lesson.subject}
              chip={i.lesson.start_time}
              chipAccent={nowMinutes != null && toMin(i.lesson.start_time) <= nowMinutes && nowMinutes < toMin(i.lesson.end_time)}
              lines={[
                { icon: Clock, text: `${i.lesson.start_time}–${i.lesson.end_time}` },
                ...(i.lesson.teacher ? [{ icon: User, text: i.lesson.teacher }] : []),
                ...(i.lesson.room ? [{ icon: MapPin, text: i.lesson.room }] : []),
              ]}
              reminders={i.lesson.reminder_days}
              toneKey={i.lesson.subject}
              muted={nowMinutes != null && toMin(i.lesson.end_time) <= nowMinutes}
            />
          ) : (
            <TaskCard
              key={i.key}
              title={i.event.title}
              chip={i.event.start_time ?? "Seharian"}
              lines={[
                ...(i.event.start_time ? [{ icon: Clock, text: formatTimeRange(i.event.start_time, i.event.end_time) }] : []),
                ...(i.event.location ? [{ icon: MapPin, text: i.event.location }] : []),
              ]}
              reminders={i.event.reminder_days}
              toneKey={i.event.title}
              tag={<Badge color="blue">Kegiatan</Badge>}
            />
          ),
        )
      )}
    </section>
  );
}

function ReminderRows({ items, emptyText }: { items: ReminderPreview[]; emptyText: string }) {
  if (items.length === 0) return <p className="px-1 py-2 text-[13px] text-gray-500">{emptyText}</p>;
  return (
    <ul className="flex flex-col">
      {items.map((r) => (
        <li key={`${r.kind}-${r.refId}-${r.daysBefore}`} className="flex items-center gap-3 rounded-xl px-1 py-2">
          <span className={cn("size-2 shrink-0 rounded-full", toneFor(r.title).dot)} />
          <div className="min-w-0 flex-1">
            <p className="truncate text-sm font-semibold text-gray-900">{r.title}</p>
            <p className="text-[13px] text-gray-500">
              {r.kind === "lesson" ? "Pelajaran" : "Kegiatan"}, {formatDate(r.targetDate, "short")}
            </p>
          </div>
          <Badge color="brand">{reminderLabel(r.daysBefore)}</Badge>
          {r.sent && <CheckCircle2 className="size-4 shrink-0 text-success-600" aria-label="Terkirim" />}
        </li>
      ))}
    </ul>
  );
}

export default async function DashboardPage() {
  const session = await requireAdmin();
  const today = todayJakarta();
  const tomorrow = addDays(today, 1);
  const now = nowMinutesJakarta();

  // Satu query untuk seluruh dashboard (sebelumnya 9 query).
  const data = await getDashboardData(today, addDays(today, 367));
  const { lessons, events: allEvents } = data;
  const sent = new Set(data.sent.map(sentKey));
  const remindersToday = previewFrom(today, lessons, allEvents, sent);
  const remindersTomorrow = previewFrom(tomorrow, lessons, allEvents, sent);
  const events = allEvents.filter((e) => e.event_date <= addDays(today, 60));
  const stats = { lessons: lessons.length, upcoming: allEvents.length, sent7: data.sent7 };
  const tg = telegramStatus();
  const region = regionInfo();
  const todayItems = itemsFor(today, lessons, events);
  const tomorrowItems = itemsFor(tomorrow, lessons, events);
  const timeline: TimelineItem[] = todayItems.map((i) =>
    i.kind === "lesson"
      ? { id: i.key, title: i.lesson.subject, start: i.lesson.start_time, end: i.lesson.end_time, toneKey: i.lesson.subject, subtitle: i.lesson.room || undefined }
      : { id: i.key, title: i.event.title, start: i.event.start_time, end: i.event.end_time, toneKey: i.event.title, subtitle: i.event.location || undefined },
  );
  const nextEvents = events.slice(0, 5);

  return (
    <div className="flex flex-col gap-7">
      <PageHeader
        title={`${greeting(now)}, ${session.username}`}
        description={formatDate(today)}
        actions={
          <>
            <Link href="/admin/kegiatan" className={buttonClass("secondary")}>
              <CalendarDays className="size-4" /> Kegiatan
            </Link>
            <Link href="/admin/pelajaran" className={buttonClass("primary")}>
              <BookOpen className="size-4" /> Kelola pelajaran
            </Link>
          </>
        }
      />

      {region.mismatch && (
        <Alert
          color="warning"
          icon={Gauge}
          title="Admin lambat karena server dan database berjauhan"
          action={
            <Link href="/admin/pengaturan#kecepatan" className={buttonClass("secondary", "sm")}>
              Cara memperbaiki
            </Link>
          }
        >
          Server website ada di {region.server.name}, sedangkan database di {region.database.name}. Pindahkan region server ke{" "}
          {region.database.name} ({region.database.vercelCode}).
        </Alert>
      )}

      {!tg.ready && (
        <Alert
          color="warning"
          icon={TriangleAlert}
          title="Telegram belum terhubung"
          action={
            <Link href="/admin/pengaturan" className={buttonClass("secondary", "sm")}>
              Hubungkan Telegram
            </Link>
          }
        >
          Pengingat tidak terkirim sampai {tg.hasToken ? "TELEGRAM_CHAT_ID" : "TELEGRAM_BOT_TOKEN dan TELEGRAM_CHAT_ID"} diatur.
        </Alert>
      )}

      <div className="flex flex-wrap gap-2.5">
        {[
          { icon: BookOpen, value: stats.lessons, label: "pelajaran aktif", tone: "text-c3-500" },
          { icon: CalendarDays, value: stats.upcoming, label: "kegiatan mendatang", tone: "text-c1-500" },
          { icon: Send, value: stats.sent7, label: "pengingat terkirim minggu ini", tone: "text-brand-600" },
        ].map(({ icon: Icon, value, label, tone }) => (
          <span key={label} className="inline-flex items-center gap-2 rounded-full bg-white py-1.5 pr-4 pl-2 text-[13px] text-gray-600 shadow-xs ring-1 ring-gray-200/80">
            <span className="flex size-6 items-center justify-center rounded-full bg-gray-50">
              <Icon className={cn("size-3.5", tone)} />
            </span>
            <b className="text-[15px] font-extrabold text-gray-900 tabular-nums">{value}</b> {label}
          </span>
        ))}
      </div>

      <Card className="overflow-hidden">
        <div className="grid divide-y divide-gray-100 lg:grid-cols-[1fr_1fr_1.15fr] lg:divide-x lg:divide-y-0">
          <DayColumn date={today} label="Hari ini" items={todayItems} nowMinutes={now} />
          <DayColumn date={tomorrow} label="Besok" items={tomorrowItems} />
          <section className="p-4 sm:p-5" aria-label="Kalender hari ini">
            <h2 className="text-lg font-bold tracking-tight text-gray-900">Kalender</h2>
            <p className="mb-5 text-[13px] text-gray-500">Hari ini, jam per jam</p>
            <DayTimeline items={timeline} nowMinutes={now} />
          </section>
        </div>
      </Card>

      <div className="grid gap-6 lg:grid-cols-2">
        <Card>
          <CardHeader title="Pengingat Telegram" description="Dikirim otomatis sekitar pukul 06.00 WIB." />
          <div className="flex flex-col gap-4 px-4 pb-5 sm:px-5">
            <div>
              <p className="mb-1 px-1 text-[13px] font-semibold text-gray-700">Pagi ini</p>
              <ReminderRows items={remindersToday} emptyText="Tidak ada pengingat hari ini." />
            </div>
            <div className="border-t border-gray-100 pt-4">
              <p className="mb-1 px-1 text-[13px] font-semibold text-gray-700">Besok pagi</p>
              <ReminderRows items={remindersTomorrow} emptyText="Tidak ada pengingat besok." />
            </div>
          </div>
        </Card>

        <Card>
          <CardHeader
            title="Kegiatan mendatang"
            description="Lima kegiatan terdekat."
            action={
              <Link href="/admin/kegiatan" className="text-[13px] font-semibold text-brand-700 hover:text-brand-800">
                Lihat semua
              </Link>
            }
          />
          {nextEvents.length === 0 ? (
            <p className="px-6 pt-2 pb-8 text-[13px] text-gray-500">Belum ada kegiatan dalam 60 hari ke depan.</p>
          ) : (
            <ul className="flex flex-col px-3 pb-3 sm:px-4">
              {nextEvents.map((e) => {
                const d = diffDays(e.event_date, today);
                const date = new Date(`${e.event_date}T00:00:00Z`);
                return (
                  <li key={e.id} className="flex items-center gap-3.5 rounded-xl px-2 py-2.5">
                    <div className={cn("flex size-11 shrink-0 flex-col items-center justify-center rounded-xl", d === 0 ? "bg-brand-600 text-white" : toneFor(e.title).soft)}>
                      <span className="text-[10px] font-semibold capitalize opacity-80">
                        {new Intl.DateTimeFormat("id-ID", { month: "short", timeZone: "UTC" }).format(date)}
                      </span>
                      <span className="text-base leading-none font-extrabold tabular-nums">{date.getUTCDate()}</span>
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-sm font-semibold text-gray-900">{e.title}</p>
                      <p className="truncate text-[13px] text-gray-500">
                        {formatTimeRange(e.start_time, e.end_time)}
                        {e.location && `, ${e.location}`}
                      </p>
                    </div>
                    <Badge color={d === 0 ? "brand" : d === 1 ? "warning" : d <= 7 ? "blue" : "gray"}>{relativeDayLabel(d)}</Badge>
                  </li>
                );
              })}
            </ul>
          )}
        </Card>
      </div>
    </div>
  );
}
