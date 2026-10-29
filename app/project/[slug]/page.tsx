import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { AsideList, DetailPage } from "@/components/detail-page";
import { PublicShell } from "@/components/site-chrome";
import { PROJECTS } from "@/content/project";

export const dynamicParams = false;

export function generateStaticParams() {
  return PROJECTS.map((p) => ({ slug: p.slug }));
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params;
  const p = PROJECTS.find((x) => x.slug === slug);
  return p ? { title: p.title, description: p.summary } : {};
}

export default async function ProjectDetail({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const p = PROJECTS.find((x) => x.slug === slug);
  if (!p) notFound();
  return (
    <PublicShell active="/project">
      <DetailPage
        backHref="/project"
        backLabel="Semua project"
        meta={p.year ? String(p.year) : undefined}
        title={p.title}
        summary={p.summary}
        image={p.image}
        description={p.description}
        links={p.links}
        aside={<AsideList title="Kategori" items={p.tags} />}
      />
    </PublicShell>
  );
}
