import type { Metadata } from "next";
import { BookOpen } from "lucide-react";
import { SiteFooter, SiteHeader } from "@/components/site-chrome";
import { Card, EmptyState } from "@/components/ui";

export const metadata: Metadata = { title: "Materi" };

export default function MateriPage() {
  return (
    <div className="bg-sunrise flex min-h-dvh flex-col">
      <SiteHeader active="/materi" />
      <main className="mx-auto w-full max-w-[1200px] flex-1 px-5 pt-10 pb-20 sm:px-8 sm:pt-16">
        <div className="max-w-2xl animate-rise">
          <h1 className="text-[40px] leading-[1.05] font-extrabold tracking-[-0.032em] text-gray-900 sm:text-[52px]">Materi</h1>
          <p className="mt-5 text-[17px] leading-relaxed text-gray-600">
            Catatan dan bahan belajar yang saya kumpulkan, disusun per topik. Halaman ini sedang disiapkan.
          </p>
        </div>
        <Card className="mt-12 bg-white/80">
          <EmptyState
            icon={BookOpen}
            title="Materi pertama segera hadir"
            description="Kembali lagi nanti untuk membaca catatan dan rangkuman pelajaran."
          />
        </Card>
      </main>
      <SiteFooter />
    </div>
  );
}
