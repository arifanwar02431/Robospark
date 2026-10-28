import type { Metadata } from "next";
import { LessonsManager } from "@/components/admin/lessons-manager";
import { PageHeader } from "@/components/ui";
import { requireAdmin } from "@/lib/auth";
import { listLessons } from "@/lib/data";
import { isoDayOfWeek, nowMinutesJakarta, todayJakarta } from "@/lib/date";

export const metadata: Metadata = { title: "Jadwal Pelajaran" };
export const dynamic = "force-dynamic";

export default async function LessonsPage() {
  await requireAdmin();
  const lessons = await listLessons();
  return (
    <div className="flex flex-col gap-7">
      <PageHeader
        title="Jadwal pelajaran"
        description="Jadwal mingguan Anda. Klik kartu untuk mengubah, atau atur pengingat Telegram per pelajaran."
      />
      <div>
        <LessonsManager lessons={lessons} todayDow={isoDayOfWeek(todayJakarta())} nowMinutes={nowMinutesJakarta()} />
      </div>
    </div>
  );
}
