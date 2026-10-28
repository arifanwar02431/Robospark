import { BookOpen, CalendarDays, LayoutGrid, MapPin, Plus, Send, User } from "lucide-react";
import { LogoMark } from "./logo";
import { DayTimeline, TaskCard, type TimelineItem } from "./planner";
import { cn } from "./ui";

// Pratinjau panel admin untuk halaman beranda (contoh data, bukan data asli).
const MONDAY = [
  { title: "Bahasa Inggris", chip: "07:30", lines: [{ icon: User, text: "Ms. Rina" }], reminders: [0] },
  { title: "Matematika", chip: "10:00", lines: [{ icon: MapPin, text: "Ruang 12" }], reminders: [1] },
  { title: "Rapat OSIS", chip: "13:00", lines: [{ icon: MapPin, text: "Aula" }], reminders: [3, 1] },
];
const TUESDAY = [
  { title: "Fisika", chip: "08:00", lines: [{ icon: MapPin, text: "Lab Fisika" }], reminders: [1] },
  { title: "Kerja kelompok", chip: "15:30", lines: [{ icon: User, text: "Tim 4" }], reminders: [0] },
];
const TIMELINE: TimelineItem[] = [
  { id: "a", title: "Bahasa Inggris", start: "07:30", end: "09:00", toneKey: "Bahasa Inggris" },
  { id: "b", title: "Matematika", start: "10:00", end: "11:30", toneKey: "Matematika" },
  { id: "c", title: "Istirahat", start: "12:00", end: "12:45", toneKey: "Istirahat" },
  { id: "d", title: "Rapat OSIS", start: "13:00", end: "14:30", toneKey: "Rapat OSIS" },
];

function Column({ day, date, today, items }: { day: string; date: string; today?: boolean; items: typeof MONDAY }) {
  return (
    <div className="flex min-w-0 flex-col gap-2.5 p-3">
      <div>
        <p className="text-[15px] font-bold tracking-tight text-gray-900">{day}</p>
        <p className="text-[11px] text-gray-500">{date}</p>
        <div className="mt-2 h-1 overflow-hidden rounded-full bg-gray-100">
          <div className={cn("h-full rounded-full", today ? "w-2/5 bg-brand-500" : "w-0")} />
        </div>
      </div>
      <div className="flex items-center gap-1.5 rounded-lg bg-gray-50 px-2.5 py-2 text-[11px] font-medium text-gray-400">
        <Plus className="size-3.5" /> Tambah jadwal
      </div>
      {items.map((t) => (
        <TaskCard key={t.title} title={t.title} chip={t.chip} lines={t.lines} reminders={t.reminders} toneKey={t.title} />
      ))}
    </div>
  );
}

export function AppPreview({ className }: { className?: string }) {
  return (
    <div className={cn("rounded-[28px] bg-white/55 p-2 shadow-xl ring-1 ring-white/80 backdrop-blur-sm", className)} aria-hidden>
      <div className="grid grid-cols-2 overflow-hidden rounded-[22px] bg-white text-left ring-1 ring-gray-200/80 md:grid-cols-[1fr_1fr_1.15fr] xl:grid-cols-[118px_1fr_1fr_1.15fr]">
        <div className="hidden flex-col gap-1 border-r border-gray-100 bg-gray-50/80 p-3 xl:flex">
          <div className="mb-3 flex items-center gap-2">
            <LogoMark className="size-6 rounded-md text-[11px]" />
            <span className="h-2 w-12 rounded-full bg-gray-200" />
          </div>
          {[
            { icon: LayoutGrid, label: "Hari ini", active: true },
            { icon: BookOpen, label: "Pelajaran" },
            { icon: CalendarDays, label: "Kegiatan" },
            { icon: Send, label: "Telegram" },
          ].map(({ icon: Icon, label, active }) => (
            <span
              key={label}
              className={cn(
                "flex items-center gap-2 rounded-lg px-2 py-1.5 text-[11px] font-semibold",
                active ? "bg-white text-gray-900 shadow-xs" : "text-gray-500",
              )}
            >
              <Icon className="size-3.5" /> {label}
            </span>
          ))}
        </div>
        <Column day="Senin" date="26 Oktober" today items={MONDAY} />
        <div className="border-l border-gray-100">
          <Column day="Selasa" date="27 Oktober" items={TUESDAY} />
        </div>
        <div className="hidden border-l border-gray-100 p-3 md:block">
          <p className="text-[15px] font-bold tracking-tight text-gray-900">Kalender</p>
          <p className="mb-4 text-[11px] text-gray-500">Senin, 26 Oktober</p>
          <DayTimeline items={TIMELINE} minStart={7} minEnd={15} hourPx={34} nowMinutes={11 * 60 + 10} compact />
        </div>
      </div>
    </div>
  );
}
