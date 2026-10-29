import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { HeroFlowchart } from "@/components/hero-flowchart";
import { ComingSoon, MateriRow, ProjectCard, RobotCard } from "@/components/portal-cards";
import { PublicShell } from "@/components/site-chrome";
import { buttonClass } from "@/components/ui";
import { materiFor } from "@/content/materi";
import { PROJECTS } from "@/content/project";
import { ROBOTS } from "@/content/robot";
import { SITE } from "@/lib/site";

function SectionHead({ title, text, href, linkLabel }: { title: string; text: string; href: string; linkLabel: string }) {
  return (
    <div className="mb-8 flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
      <div className="max-w-xl">
        <h2 className="text-[30px] leading-tight font-extrabold tracking-[-0.03em] text-gray-900 sm:text-[36px]">{title}</h2>
        <p className="mt-2 text-base text-gray-600">{text}</p>
      </div>
      <Link href={href} className="inline-flex shrink-0 items-center gap-1.5 text-[15px] font-bold text-brand-700 hover:text-brand-800">
        {linkLabel} <ArrowRight className="size-4" />
      </Link>
    </div>
  );
}

export default function HomePage() {
  const kelas = [
    { k: 4 as const, items: materiFor(4) },
    { k: 6 as const, items: materiFor(6) },
  ];

  return (
    <PublicShell active="/">
      <section className="mx-auto grid max-w-[1200px] items-center gap-10 px-5 pt-6 pb-20 sm:px-8 lg:grid-cols-[minmax(0,1.05fr)_minmax(0,0.95fr)] lg:gap-16 lg:pt-12 lg:pb-28">
        <div className="animate-rise">
          <p className="text-[15px] font-bold text-brand-700">{SITE.name}</p>
          <h1 className="mt-4 text-[42px] leading-[1.04] font-extrabold tracking-[-0.035em] text-gray-900 sm:text-[58px]">
            Belajar logika koding, satu langkah demi satu langkah.
          </h1>
          <p className="mt-6 max-w-[34rem] text-[17px] leading-relaxed text-gray-600">{SITE.tagline}</p>
          <div className="mt-9 flex flex-wrap items-center gap-3">
            <Link href="/materi" className={buttonClass("primary", "lg")}>
              Mulai belajar
            </Link>
            <Link href="/robot" className={buttonClass("secondary", "lg")}>
              Lihat robot
            </Link>
          </div>
          <dl className="mt-12 flex gap-10 border-t border-gray-200/80 pt-6">
            {[
              { n: kelas[0].items.length, l: "materi kelas 4" },
              { n: kelas[1].items.length, l: "materi kelas 6" },
              { n: 350, l: "soal latihan SAS" },
            ].map((s) => (
              <div key={s.l}>
                <dt className="sr-only">{s.l}</dt>
                <dd className="text-[28px] leading-none font-extrabold tracking-tight text-gray-900 tabular-nums">{s.n}</dd>
                <dd className="mt-1.5 text-sm text-gray-500">{s.l}</dd>
              </div>
            ))}
          </dl>
        </div>
        <div className="mx-auto w-full max-w-[460px] lg:max-w-none">
          <HeroFlowchart />
          <p className="mt-3 text-center text-sm text-gray-500">Klik salah satu bentuk untuk membuka materinya.</p>
        </div>
      </section>

      <section className="mx-auto max-w-[1200px] px-5 pb-24 sm:px-8" aria-labelledby="materi-title">
        <SectionHead
          title="Materi"
          text="Dipisah per kelas. Setiap materi berisi penjelasan, latihan, game, dan kuis yang bisa langsung dikerjakan di browser."
          href="/materi"
          linkLabel="Semua materi"
        />
        <div className="grid gap-5 lg:grid-cols-2">
          {kelas.map(({ k, items }) => (
            <div key={k} className="rounded-3xl bg-white/70 p-3 shadow-xs ring-1 ring-gray-200/80">
              <div className="flex items-baseline justify-between px-3 pt-3 pb-2">
                <h3 className="text-[22px] font-extrabold tracking-[-0.02em] text-gray-900">Kelas {k}</h3>
                <Link href={`/materi#kelas-${k}`} className="text-sm font-bold text-brand-700 hover:text-brand-800">
                  Detail <span className="sr-only">materi kelas {k}</span>
                </Link>
              </div>
              <div className="flex flex-col">
                {items.map((m) => (
                  <MateriRow key={m.slug} m={m} />
                ))}
              </div>
            </div>
          ))}
        </div>
      </section>

      <section className="mx-auto grid max-w-[1200px] gap-12 px-5 pb-24 sm:px-8 lg:grid-cols-2 lg:gap-8">
        <div>
          <SectionHead title="Robot" text="Robot yang dirakit dan diprogram." href="/robot" linkLabel="Galeri robot" />
          {ROBOTS.length ? (
            <div className="grid gap-5">{ROBOTS.slice(0, 1).map((r) => <RobotCard key={r.slug} r={r} />)}</div>
          ) : (
            <ComingSoon kind="robot" compact />
          )}
        </div>
        <div>
          <SectionHead title="Project" text="Karya dan proyek yang sedang dikerjakan." href="/project" linkLabel="Semua project" />
          {PROJECTS.length ? (
            <div className="grid gap-5">{PROJECTS.slice(0, 1).map((p) => <ProjectCard key={p.slug} p={p} />)}</div>
          ) : (
            <ComingSoon kind="project" compact />
          )}
        </div>
      </section>
    </PublicShell>
  );
}
