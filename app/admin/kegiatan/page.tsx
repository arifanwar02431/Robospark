import type { Metadata } from "next";
import { EventsManager } from "@/components/admin/events-manager";
import { PageHeader } from "@/components/ui";
import { requireAdmin } from "@/lib/auth";
import { listEvents } from "@/lib/data";
import { todayJakarta } from "@/lib/date";

export const metadata: Metadata = { title: "Jadwal Kegiatan" };
export const dynamic = "force-dynamic";

export default async function EventsPage() {
  await requireAdmin();
  const events = await listEvents();
  return (
    <div className="flex flex-col gap-7">
      <PageHeader
        title="Jadwal kegiatan"
        description="Ujian, rapat, dan acara pada tanggal tertentu. Klik kegiatan untuk mengubahnya."
      />
      <div>
        <EventsManager events={events} today={todayJakarta()} />
      </div>
    </div>
  );
}
