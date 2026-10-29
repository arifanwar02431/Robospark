import type { Metadata } from "next";
import { MateriList } from "@/components/materi-list";
import { PageIntro, PublicShell } from "@/components/site-chrome";
import { MATERI } from "@/content/materi";

export const metadata: Metadata = {
  title: "Materi",
  description: "Materi interaktif flowchart, variabel, percabangan, dan perulangan untuk kelas 4 dan 6.",
};

export default function MateriPage() {
  return (
    <PublicShell active="/materi">
      <div className="mx-auto max-w-[1200px] px-5 pt-8 pb-24 sm:px-8 sm:pt-14">
        <PageIntro title="Materi">
          Materi interaktif yang sudah dipelajari di kelas. Pilih kelasmu, lalu buka materinya. Semua bisa dikerjakan langsung di browser,
          dari laptop maupun HP.
        </PageIntro>
        <div className="mt-10">
          <MateriList items={MATERI} />
        </div>
      </div>
    </PublicShell>
  );
}
