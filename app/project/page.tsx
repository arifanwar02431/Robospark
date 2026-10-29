import type { Metadata } from "next";
import { ComingSoon, ProjectCard } from "@/components/portal-cards";
import { PageIntro, PublicShell } from "@/components/site-chrome";
import { PROJECTS } from "@/content/project";

export const metadata: Metadata = { title: "Project", description: "Karya dan proyek yang sedang dikerjakan." };

export default function ProjectPage() {
  return (
    <PublicShell active="/project">
      <div className="mx-auto max-w-[1200px] px-5 pt-8 pb-24 sm:px-8 sm:pt-14">
        <PageIntro title="Project">Karya dan proyek yang sedang dan sudah saya kerjakan.</PageIntro>
        <div className="mt-10">
          {PROJECTS.length ? (
            <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
              {PROJECTS.map((p) => (
                <ProjectCard key={p.slug} p={p} />
              ))}
            </div>
          ) : (
            <ComingSoon kind="project" />
          )}
        </div>
      </div>
    </PublicShell>
  );
}
