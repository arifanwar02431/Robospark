// Komponen bergaya "planner": kartu jadwal & kalender harian. Aman untuk server component.
import type { ReactNode } from "react";
import { BellRing, type LucideIcon } from "lucide-react";
import { toneFor } from "@/lib/colors";
import { reminderLabel } from "@/lib/date";
import { TimeChip, cn } from "./ui";

// ---------- Kartu jadwal ----------
export function TaskCard({
  title,
  chip,
  chipAccent,
  lines = [],
  reminders,
  toneKey,
  muted,
  tag,
  actions,
  className,
}: {
  title: string;
  chip?: string | null;
  chipAccent?: boolean;
  lines?: { icon: LucideIcon; text: string }[];
  reminders?: number[];
  toneKey: string;
  muted?: boolean;
  tag?: ReactNode;
  actions?: ReactNode;
  className?: string;
}) {
  const tone = toneFor(toneKey);
  return (
    <div
      className={cn(
        "group relative rounded-xl bg-white p-3 shadow-xs ring-1 ring-gray-200/90 transition-shadow hover:shadow-md hover:ring-gray-300",
        muted && "opacity-55",
        className,
      )}
    >
      <div className="flex items-start justify-between gap-2">
        <p className="min-w-0 text-[13px] leading-snug font-semibold break-words text-gray-900">{title}</p>
        {chip && <TimeChip accent={chipAccent}>{chip}</TimeChip>}
      </div>
      {lines.length > 0 && (
        <div className="mt-1.5 flex flex-col gap-0.5">
          {lines.map(({ icon: Icon, text }, i) => (
            <p key={i} className="flex min-w-0 items-center gap-1.5 text-xs text-gray-500">
              <Icon className="size-3.5 shrink-0 text-gray-400" />
              <span className="truncate">{text}</span>
            </p>
          ))}
        </div>
      )}
      <div className="mt-2.5 flex min-h-6 items-center justify-between gap-2">
        <div className="flex min-w-0 items-center gap-1.5">
          <span className={cn("size-2 shrink-0 rounded-full", tone.dot)} />
          {reminders && reminders.length > 0 ? (
            <span className="flex min-w-0 items-center gap-1 text-[11px] font-semibold text-gray-500">
              <BellRing className={cn("size-3 shrink-0", tone.text)} />
              <span className="truncate">{[...reminders].sort((a, b) => b - a).map(reminderLabel).join(", ")}</span>
            </span>
          ) : reminders ? (
            <span className="text-[11px] font-medium text-gray-400">Tanpa pengingat</span>
          ) : null}
          {tag}
        </div>
      </div>
      {actions && (
        <div className="absolute right-2 bottom-2 hidden items-center rounded-full bg-white p-0.5 opacity-0 shadow-sm ring-1 ring-gray-200 transition-opacity group-hover:opacity-100 focus-within:opacity-100 sm:flex">
          {actions}
        </div>
      )}
    </div>
  );
}

// ---------- Kalender harian (timeline) ----------
export type TimelineItem = {
  id: string;
  title: string;
  start: string | null; // "HH:MM"
  end: string | null;
  toneKey: string;
  subtitle?: string;
};

const HOUR_PX = 52;
const toMin = (t: string) => Number(t.slice(0, 2)) * 60 + Number(t.slice(3, 5));

function hourLabel(h: number) {
  return `${String(h).padStart(2, "0")}.00`;
}

export function DayTimeline({
  items,
  nowMinutes,
  minStart = 7,
  minEnd = 17,
  hourPx = HOUR_PX,
  compact,
}: {
  items: TimelineItem[];
  nowMinutes?: number | null;
  minStart?: number;
  minEnd?: number;
  hourPx?: number;
  compact?: boolean;
}) {
  const timed = items
    .filter((i) => i.start)
    .map((i) => {
      const s = toMin(i.start!);
      const e = i.end ? Math.max(toMin(i.end), s + 15) : s + 60;
      return { ...i, s, e, lane: 0, lanes: 1 };
    })
    .sort((a, b) => a.s - b.s || b.e - a.e);
  const allDay = items.filter((i) => !i.start);

  // Bagi jadwal yang bertabrakan ke beberapa lajur.
  let cluster: typeof timed = [];
  let clusterEnd = -1;
  let laneEnds: number[] = [];
  const flush = () => {
    for (const c of cluster) c.lanes = laneEnds.length;
    cluster = [];
    laneEnds = [];
  };
  for (const t of timed) {
    if (t.s >= clusterEnd) flush();
    let lane = laneEnds.findIndex((end) => end <= t.s);
    if (lane === -1) {
      lane = laneEnds.length;
      laneEnds.push(t.e);
    } else laneEnds[lane] = t.e;
    t.lane = lane;
    cluster.push(t);
    clusterEnd = Math.max(clusterEnd, t.e);
  }
  flush();

  const startHour = Math.min(minStart, ...timed.map((t) => Math.floor(t.s / 60)));
  const endHour = Math.max(minEnd, ...timed.map((t) => Math.ceil(t.e / 60)));
  const hours = Array.from({ length: endHour - startHour + 1 }, (_, i) => startHour + i);
  const top = (min: number) => ((min - startHour * 60) / 60) * hourPx;
  const showNow = nowMinutes != null && nowMinutes >= startHour * 60 && nowMinutes <= endHour * 60;

  return (
    <div>
      {allDay.length > 0 && (
        <div className="mb-3 flex flex-wrap gap-1.5 pl-12">
          {allDay.map((a) => (
            <span key={a.id} className={cn("rounded-md px-2 py-1 text-[11px] font-semibold", toneFor(a.toneKey).block)}>
              {a.title}
            </span>
          ))}
        </div>
      )}
      <div className="relative" style={{ height: (endHour - startHour) * hourPx }}>
        {hours.map((h) => (
          <div key={h} className="absolute inset-x-0 border-t border-gray-100" style={{ top: top(h * 60) }}>
            <span className="absolute -top-[7px] left-0 w-10 bg-white pr-1 text-right text-[10px] font-medium text-gray-400 tabular-nums">
              {hourLabel(h)}
            </span>
          </div>
        ))}
        <div className="absolute inset-y-0 right-1 left-12">
          {timed.map((t) => {
            const tone = toneFor(t.toneKey);
            const height = Math.max(((t.e - t.s) / 60) * hourPx - 3, 20);
            return (
              <div
                key={t.id}
                className={cn("absolute overflow-hidden rounded-lg px-2 py-1", tone.block)}
                style={{
                  top: top(t.s) + 1,
                  height,
                  left: `calc(${(t.lane / t.lanes) * 100}% + ${t.lane ? 2 : 0}px)`,
                  width: `calc(${100 / t.lanes}% - ${t.lanes > 1 ? 2 : 0}px)`,
                }}
                title={`${t.title} ${t.start}${t.end ? `–${t.end}` : ""}`}
              >
                <span className={cn("absolute inset-y-1 left-1 w-[3px] rounded-full", tone.stripe)} />
                <p className={cn("truncate pl-2 font-bold", compact ? "text-[10px]" : "text-[11.5px]")}>{t.title}</p>
                {height > 34 && (
                  <p className={cn("truncate pl-2 opacity-80 tabular-nums", compact ? "text-[9.5px]" : "text-[11px]")}>
                    {t.start}
                    {t.end ? `–${t.end}` : ""}
                    {t.subtitle ? `, ${t.subtitle}` : ""}
                  </p>
                )}
              </div>
            );
          })}
        </div>
        {showNow && (
          <div className="pointer-events-none absolute right-0 left-11 flex items-center" style={{ top: top(nowMinutes!) }}>
            <span className="-ml-1 size-2 rounded-full bg-brand-600" />
            <span className="h-[2px] flex-1 bg-brand-600" />
          </div>
        )}
      </div>
    </div>
  );
}
