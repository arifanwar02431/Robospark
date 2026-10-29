import type { Metadata } from "next";
import { ComingSoon, RobotCard } from "@/components/portal-cards";
import { PageIntro, PublicShell } from "@/components/site-chrome";
import { ROBOTS } from "@/content/robot";

export const metadata: Metadata = { title: "Robot", description: "Galeri robot yang dirakit dan diprogram." };

export default function RobotPage() {
  return (
    <PublicShell active="/robot">
      <div className="mx-auto max-w-[1200px] px-5 pt-8 pb-24 sm:px-8 sm:pt-14">
        <PageIntro title="Robot">Robot yang dirakit dan diprogram, lengkap dengan komponen dan konsep koding di baliknya.</PageIntro>
        <div className="mt-10">
          {ROBOTS.length ? (
            <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
              {ROBOTS.map((r) => (
                <RobotCard key={r.slug} r={r} />
              ))}
            </div>
          ) : (
            <ComingSoon kind="robot" />
          )}
        </div>
      </div>
    </PublicShell>
  );
}
