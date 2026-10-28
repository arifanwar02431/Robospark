import Link from "next/link";
import { Search } from "lucide-react";
import { FeaturedIcon, buttonClass } from "@/components/ui";

export default function NotFound() {
  return (
    <main className="flex min-h-dvh flex-col items-center justify-center px-4 text-center">
      <FeaturedIcon icon={Search} size="lg" color="gray" />
      <p className="mt-6 text-sm font-semibold text-brand-700">404</p>
      <h1 className="mt-2 text-3xl font-semibold tracking-tight text-gray-900">Halaman tidak ditemukan</h1>
      <p className="mt-3 text-base text-gray-600">Maaf, halaman yang Anda cari tidak ada atau sudah dipindahkan.</p>
      <Link href="/" className={buttonClass("primary", "lg", "mt-8")}>
        Kembali ke beranda
      </Link>
    </main>
  );
}
