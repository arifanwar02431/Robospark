import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";
import { ArrowLeft } from "lucide-react";
import { Logo } from "@/components/logo";
import { TelegramBubble } from "@/components/telegram-bubble";
import { getSession } from "@/lib/auth";
import { LoginForm } from "./login-form";

export const metadata: Metadata = { title: "Masuk Admin", robots: { index: false, follow: false } };

export default async function LoginPage({ searchParams }: { searchParams: Promise<{ next?: string }> }) {
  if (await getSession()) redirect("/admin");
  const { next } = await searchParams;

  return (
    <main className="grid min-h-dvh lg:grid-cols-[minmax(0,1fr)_minmax(0,1.05fr)]">
      <div className="flex flex-col px-5 py-8 sm:px-10 lg:px-16">
        <Link href="/" className="self-start rounded-lg" aria-label="Beranda">
          <Logo />
        </Link>
        <div className="mx-auto flex w-full max-w-[380px] flex-1 flex-col justify-center py-12">
          <h1 className="text-[34px] leading-tight font-extrabold tracking-[-0.035em] text-gray-900">Masuk ke admin</h1>
          <p className="mt-2 text-[15px] text-gray-500">Khusus pemilik website. Kelola jadwal dan pengingat Telegram Anda.</p>
          <div className="mt-9">
            <LoginForm next={next} />
          </div>
        </div>
        <Link href="/" className="inline-flex items-center gap-1.5 self-start text-sm font-semibold text-gray-500 hover:text-gray-800">
          <ArrowLeft className="size-4" />
          Kembali ke beranda
        </Link>
      </div>
      <div className="relative hidden overflow-hidden p-3 lg:block">
        <div className="bg-sunrise-strong flex h-full flex-col items-center justify-center gap-10 rounded-[32px] px-12">
          <TelegramBubble className="rotate-[-2deg]" />
          <p className="max-w-sm text-center text-[15px] leading-relaxed font-medium text-gray-700">
            Setiap pagi, jadwal yang perlu disiapkan dikirim ke Telegram Anda.
          </p>
        </div>
      </div>
    </main>
  );
}
