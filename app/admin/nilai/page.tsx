import type { Metadata } from "next";
import Link from "next/link";
import { Users } from "lucide-react";
import { GradesGrid } from "@/components/admin/grades-grid";
import { ClassTabs, TermPicker } from "@/components/admin/rapor-nav";
import { PageHeader, buttonClass } from "@/components/ui";
import { requireAdmin } from "@/lib/auth";
import { todayJakarta } from "@/lib/date";
import { ensureTerm, getGradeSheet, knownSchoolYears, termProgress } from "@/lib/rapor";
import { CLASSES, buildHref, currentTerm, isValidSchoolYear, paramToYear, shiftYear } from "@/lib/rapor-shared";

export const metadata: Metadata = { title: "Nilai Rapor" };
export const dynamic = "force-dynamic";

export default async function GradesPage({
  searchParams,
}: {
  searchParams: Promise<{ ta?: string; smt?: string; kelas?: string }>;
}) {
  await requireAdmin();
  const sp = await searchParams;
  const now = currentTerm(todayJakarta());
  const schoolYear = isValidSchoolYear(paramToYear(sp.ta)) ? paramToYear(sp.ta) : now.schoolYear;
  const semester: 1 | 2 = sp.smt === "1" ? 1 : sp.smt === "2" ? 2 : schoolYear === now.schoolYear ? now.semester : 1;
  const className = CLASSES.includes(sp.kelas ?? "") ? (sp.kelas as string) : "4A";

  const { term, components } = await ensureTerm(schoolYear, semester);
  const [sheet, progress, known] = await Promise.all([
    getGradeSheet(term, className, components),
    termProgress(term, components.length),
    knownSchoolYears(),
  ]);
  const years = [...new Set([shiftYear(now.schoolYear, 1), now.schoolYear, shiftYear(now.schoolYear, -1), ...known, schoolYear])].sort().reverse();
  const badges = Object.fromEntries(CLASSES.map((c) => [c, progress[c] ? `${progress[c].complete}/${progress[c].students}` : undefined]));
  const exportBase = `/admin/nilai/export?term=${term.id}`;

  return (
    <div className="flex flex-col gap-7">
      <PageHeader
        title="Nilai rapor"
        description="Isi nilai per komponen; nilai akhir dihitung otomatis dan semua perubahan tersimpan sendiri."
        actions={
          <Link href={buildHref("/admin/siswa", { ta: schoolYear, kelas: className })} className={buttonClass("secondary")}>
            <Users className="size-4" /> Data siswa
          </Link>
        }
      />
      <div className="flex flex-col gap-4">
        <TermPicker basePath="/admin/nilai" years={years} schoolYear={schoolYear} semester={semester} kelas={className} />
        <ClassTabs basePath="/admin/nilai" schoolYear={schoolYear} semester={semester} current={className} badges={badges} />
      </div>
      <GradesGrid
        key={`${term.id}-${className}-${components.map((c) => `${c.id}:${c.weight}`).join(",")}`}
        term={term}
        className={className}
        components={components}
        students={sheet.students}
        scores={sheet.scores}
        notes={sheet.notes}
        exportHref={`${exportBase}&kelas=${className}`}
        exportAllHref={`${exportBase}&kelas=semua`}
      />
    </div>
  );
}
