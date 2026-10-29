import type { Metadata } from "next";
import Link from "next/link";
import { ClipboardList } from "lucide-react";
import { ClassTabs, TermPicker } from "@/components/admin/rapor-nav";
import { StudentsManager } from "@/components/admin/students-manager";
import { PageHeader, buttonClass } from "@/components/ui";
import { requireAdmin } from "@/lib/auth";
import { todayJakarta } from "@/lib/date";
import { getStudentsPage } from "@/lib/rapor";
import { CLASSES, buildHref, currentTerm, isValidSchoolYear, paramToYear, shiftYear } from "@/lib/rapor-shared";

export const metadata: Metadata = { title: "Data Siswa" };
export const dynamic = "force-dynamic";

export default async function StudentsPage({ searchParams }: { searchParams: Promise<{ ta?: string; kelas?: string }> }) {
  await requireAdmin();
  const sp = await searchParams;
  const now = currentTerm(todayJakarta());
  const schoolYear = isValidSchoolYear(paramToYear(sp.ta)) ? paramToYear(sp.ta) : now.schoolYear;
  const className = CLASSES.includes(sp.kelas ?? "") ? (sp.kelas as string) : "4A";

  const { students, counts, years: known } = await getStudentsPage(schoolYear, className);
  const years = [...new Set([shiftYear(now.schoolYear, 1), now.schoolYear, shiftYear(now.schoolYear, -1), ...known, schoolYear])].sort().reverse();
  const total = Object.values(counts).reduce((a, b) => a + b, 0);

  return (
    <div className="flex flex-col gap-7">
      <PageHeader
        title="Data siswa"
        description={`${total} siswa terdaftar di TA ${schoolYear}. Daftar siswa berlaku untuk semester 1 dan 2.`}
        actions={
          <Link href={buildHref("/admin/nilai", { ta: schoolYear, smt: schoolYear === now.schoolYear ? now.semester : 1, kelas: className })} className={buttonClass("secondary")}>
            <ClipboardList className="size-4" /> Isi nilai {className}
          </Link>
        }
      />
      <div className="flex flex-col gap-4">
        <TermPicker basePath="/admin/siswa" years={years} schoolYear={schoolYear} kelas={className} />
        <ClassTabs basePath="/admin/siswa" schoolYear={schoolYear} current={className} badges={counts} />
      </div>
      <StudentsManager key={`${schoolYear}-${className}`} students={students} schoolYear={schoolYear} className={className} />
    </div>
  );
}
