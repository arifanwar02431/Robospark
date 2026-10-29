import type { Metadata } from "next";
import { MateriCard } from "@/components/portal-cards";
import { PageIntro, PublicShell } from "@/components/site-chrome";
import { materiFor } from "@/content/materi";

export const metadata: Metadata = {
  title: "Materi",
  description: "Materi interaktif koding kelas 4 dan kelas 6: flowchart, variabel, percabangan, perulangan, dan latihan SAS.",
};

const KELAS = [4, 6] as const;

export default function MateriPage() {
  return (
    <PublicShell active="/materi">
      <div className="mx-auto max-w-[1200px] px-5 pt-8 pb-24 sm:px-8 sm:pt-14">
        <PageIntro title="Materi">
          Pilih kelasmu, lalu buka materinya. Semua bisa dikerjakan langsung di browser, dari laptop maupun HP.
        </PageIntro>

        <nav aria-label="Pilih kelas" className="sticky top-3 z-20 mt-8 inline-flex rounded-full bg-white/85 p-1 shadow-sm ring-1 ring-gray-200/80 backdrop-blur">
          {KELAS.map((k) => (
            <a key={k} href={`#kelas-${k}`} className="rounded-full px-5 py-2 text-[15px] font-bold text-gray-700 hover:bg-gray-900 hover:text-white">
              Kelas {k}
              <span className="ml-1.5 text-[13px] font-semibold opacity-60">{materiFor(k).length}</span>
            </a>
          ))}
        </nav>

        {KELAS.map((k) => (
          <section key={k} id={`kelas-${k}`} aria-labelledby={`judul-kelas-${k}`} className="scroll-mt-20 pt-12">
            <div className="mb-6 flex items-baseline gap-3 border-b border-gray-200/80 pb-4">
              <h2 id={`judul-kelas-${k}`} className="text-[32px] leading-none font-extrabold tracking-[-0.03em] text-gray-900">
                Kelas {k}
              </h2>
              <span className="text-[15px] font-semibold text-gray-500">{materiFor(k).length} materi</span>
            </div>
            <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
              {materiFor(k).map((m) => (
                <MateriCard key={m.slug} m={m} />
              ))}
            </div>
          </section>
        ))}
      </div>
    </PublicShell>
  );
}
