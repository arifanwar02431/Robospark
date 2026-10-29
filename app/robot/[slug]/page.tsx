import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { AsideList, DetailPage } from "@/components/detail-page";
import { PublicShell } from "@/components/site-chrome";
import { ROBOTS } from "@/content/robot";

export const dynamicParams = false;

export function generateStaticParams() {
  return ROBOTS.map((r) => ({ slug: r.slug }));
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params;
  const r = ROBOTS.find((x) => x.slug === slug);
  return r ? { title: r.name, description: r.summary } : {};
}

export default async function RobotDetail({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const r = ROBOTS.find((x) => x.slug === slug);
  if (!r) notFound();
  return (
    <PublicShell active="/robot">
      <DetailPage
        backHref="/robot"
        backLabel="Semua robot"
        meta={[r.madeBy, r.year].filter(Boolean).join(", ") || undefined}
        title={r.name}
        summary={r.summary}
        image={r.image}
        video={r.video}
        description={r.description}
        aside={
          <>
            <AsideList title="Komponen" items={r.components} />
            <AsideList title="Konsep yang dipakai" items={r.skills} />
          </>
        }
      />
    </PublicShell>
  );
}
