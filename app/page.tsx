import Link from "next/link";
import { AppPreview } from "@/components/app-preview";
import { LogoMark } from "@/components/logo";
import { SiteFooter, SiteHeader } from "@/components/site-chrome";
import { TelegramBubble } from "@/components/telegram-bubble";
import { buttonClass } from "@/components/ui";
import { SITE } from "@/lib/site";

const STEPS = [
  { title: "Catat jadwal", text: "Pelajaran mingguan, atau kegiatan pada tanggal tertentu." },
  { title: "Pilih kapan diingatkan", text: "Hari-H, H-1, H-7, atau berapa hari pun sebelumnya." },
  { title: "Terima pesan tiap pagi", text: "Sekitar pukul 06.00 WIB, semua pengingat hari itu datang dalam satu pesan." },
];

export default function HomePage() {
  return (
    <div className="bg-sunrise flex min-h-dvh flex-col">
      <SiteHeader active="/" />
      <main className="flex-1">
        <section className="mx-auto grid max-w-[1200px] items-center gap-12 px-5 pt-8 pb-20 sm:px-8 lg:grid-cols-[minmax(0,0.92fr)_minmax(0,1.25fr)] lg:gap-14 lg:pt-14 lg:pb-28">
          <div className="animate-rise">
            <span className="inline-flex items-center gap-2 rounded-full bg-white/80 py-1 pr-3.5 pl-1 text-[13px] font-semibold text-gray-700 shadow-xs ring-1 ring-gray-200/70">
              <LogoMark className="size-6 rounded-full text-[11px]" />
              Website pribadi {SITE.name}
            </span>
            <h1 className="mt-6 text-[42px] leading-[1.04] font-extrabold tracking-[-0.032em] text-gray-900 sm:text-[56px] lg:text-[60px]">
              Belajar terus, tanpa ada jadwal yang terlewat.
            </h1>
            <p className="mt-6 max-w-[33rem] text-[17px] leading-relaxed text-gray-600">
              Di sini saya berbagi materi yang sedang saya pelajari, sekaligus mengatur jadwal pelajaran dan kegiatan.
              Setiap jadwal mengirim pengingat ke Telegram beberapa hari sebelumnya.
            </p>
            <div className="mt-9 flex flex-wrap items-center gap-3">
              <Link href="/materi" className={buttonClass("primary", "lg")}>
                Lihat materi
              </Link>
              <Link href="/admin" className={buttonClass("secondary", "lg")}>
                Masuk admin
              </Link>
            </div>
          </div>
          <AppPreview className="animate-rise [animation-delay:150ms]" />
        </section>

        <section className="mx-auto max-w-[1200px] px-5 pb-24 sm:px-8">
          <div className="grid items-center gap-12 rounded-[32px] bg-white/75 p-6 shadow-xs ring-1 ring-gray-200/70 sm:p-10 lg:grid-cols-[1.05fr_1fr] lg:p-14">
            <div>
              <h2 className="max-w-md text-[30px] leading-[1.1] font-extrabold tracking-[-0.03em] text-gray-900 sm:text-[38px]">
                Pengingatnya datang sendiri.
              </h2>
              <p className="mt-4 max-w-md text-base leading-relaxed text-gray-600">
                Tidak perlu membuka website setiap hari. Bot Telegram pribadi mengirim ringkasan jadwal yang perlu
                disiapkan.
              </p>
              <ol className="mt-9 flex flex-col gap-6">
                {STEPS.map((s, i) => (
                  <li key={s.title} className="flex gap-4">
                    <span className="flex size-9 shrink-0 items-center justify-center rounded-full bg-brand-50 text-sm font-extrabold text-brand-700 ring-1 ring-brand-100">
                      {i + 1}
                    </span>
                    <div>
                      <p className="text-[15px] font-bold text-gray-900">{s.title}</p>
                      <p className="mt-0.5 text-sm text-gray-600">{s.text}</p>
                    </div>
                  </li>
                ))}
              </ol>
            </div>
            <div className="flex justify-center rounded-[28px] bg-sand px-4 py-10 sm:px-10">
              <TelegramBubble />
            </div>
          </div>
        </section>
      </main>
      <SiteFooter />
    </div>
  );
}
