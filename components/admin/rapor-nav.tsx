"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useTransition } from "react";
import { Loader2 } from "lucide-react";
import { Select, cn } from "@/components/ui";
import { GRADE_LEVELS, SECTIONS, buildHref } from "@/lib/rapor-shared";

/** Pilihan tahun ajaran (+ semester bila ada). */
export function TermPicker({
  basePath,
  years,
  schoolYear,
  semester,
  kelas,
}: {
  basePath: string;
  years: string[];
  schoolYear: string;
  semester?: 1 | 2;
  kelas: string;
}) {
  const router = useRouter();
  const [pending, start] = useTransition();
  const go = (ta: string, smt?: number) => start(() => router.push(buildHref(basePath, { ta, smt, kelas })));

  return (
    <div className="flex flex-wrap items-center gap-2">
      <Select
        aria-label="Tahun ajaran"
        value={schoolYear}
        onChange={(e) => go(e.target.value, semester)}
        className="h-10 w-auto! rounded-full py-0 pr-10 pl-4 font-semibold"
      >
        {years.map((y) => (
          <option key={y} value={y}>
            TA {y}
          </option>
        ))}
      </Select>
      {semester && (
        <div role="tablist" aria-label="Semester" className="inline-flex rounded-full bg-gray-100 p-1">
          {([1, 2] as const).map((s) => (
            <button
              key={s}
              role="tab"
              aria-selected={semester === s}
              onClick={() => semester !== s && go(schoolYear, s)}
              className={cn(
                "h-8 rounded-full px-3.5 text-[13px] font-semibold transition-colors",
                semester === s ? "bg-white text-gray-900 shadow-sm" : "text-gray-500 hover:text-gray-800",
              )}
            >
              Semester {s}
            </button>
          ))}
        </div>
      )}
      {pending && <Loader2 className="size-4 animate-spin text-gray-400" aria-label="Memuat" />}
    </div>
  );
}

/** Deretan tombol kelas 4A–4I dan 6A–6I. */
export function ClassTabs({
  basePath,
  schoolYear,
  semester,
  current,
  badges,
}: {
  basePath: string;
  schoolYear: string;
  semester?: number;
  current: string;
  badges?: Record<string, string | number | undefined>;
}) {
  return (
    <nav aria-label="Pilih kelas" className="flex flex-col gap-2.5">
      {GRADE_LEVELS.map((g) => (
        <div key={g} className="flex items-center gap-3">
          <span className="w-14 shrink-0 text-[13px] font-semibold text-gray-500">Kelas {g}</span>
          <div className="scrollbar-thin -mr-4 flex gap-1.5 overflow-x-auto pr-4 pb-0.5 sm:mr-0 sm:flex-wrap sm:pr-0">
            {SECTIONS.map((s) => {
              const cls = `${g}${s}`;
              const active = cls === current;
              const badge = badges?.[cls];
              return (
                <Link
                  key={cls}
                  href={buildHref(basePath, { ta: schoolYear, smt: semester, kelas: cls })}
                  aria-current={active ? "page" : undefined}
                  scroll={false}
                  className={cn(
                    "flex h-9 shrink-0 items-center gap-1.5 rounded-full px-3.5 text-[13px] font-bold transition-colors",
                    active
                      ? "bg-gray-900 text-white"
                      : "bg-white text-gray-700 shadow-xs ring-1 ring-gray-200 hover:bg-gray-50 hover:ring-gray-300",
                  )}
                >
                  {cls}
                  {badge !== undefined && badge !== 0 && badge !== "" && (
                    <span className={cn("text-[11px] font-semibold tabular-nums", active ? "text-white/70" : "text-gray-400")}>
                      {badge}
                    </span>
                  )}
                </Link>
              );
            })}
          </div>
        </div>
      ))}
    </nav>
  );
}
