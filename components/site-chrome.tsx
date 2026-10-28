import Link from "next/link";
import { Logo } from "./logo";
import { buttonClass, cn } from "./ui";
import { SITE } from "@/lib/site";

const NAV = [
  { href: "/", label: "Beranda" },
  { href: "/materi", label: "Materi" },
];

export function SiteHeader({ active }: { active: "/" | "/materi" }) {
  return (
    <header className="relative z-30">
      <div className="mx-auto flex h-20 max-w-[1200px] items-center justify-between gap-4 px-5 sm:px-8">
        <Link href="/" aria-label="Beranda" className="rounded-lg">
          <Logo />
        </Link>
        <nav className="hidden items-center gap-1 sm:flex" aria-label="Navigasi utama">
          {NAV.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              aria-current={active === item.href ? "page" : undefined}
              className={cn(
                "rounded-full px-4 py-2 text-[15px] font-medium transition-colors",
                active === item.href ? "bg-white/70 text-gray-900 shadow-xs ring-1 ring-gray-200/70" : "text-gray-600 hover:text-gray-900",
              )}
            >
              {item.label}
            </Link>
          ))}
        </nav>
        <div className="flex items-center gap-2">
          <Link href="/admin" className="hidden rounded-full px-4 py-2 text-[15px] font-medium text-gray-700 hover:text-gray-900 sm:block">
            Masuk
          </Link>
          <Link href="/materi" className={buttonClass("primary", "md")}>
            Lihat materi
          </Link>
        </div>
      </div>
      <nav className="flex gap-1 px-4 pb-2 sm:hidden" aria-label="Navigasi utama">
        {[...NAV, { href: "/admin", label: "Masuk" }].map((item) => (
          <Link
            key={item.href}
            href={item.href}
            className={cn(
              "rounded-full px-3.5 py-1.5 text-sm font-semibold",
              active === item.href ? "bg-white text-gray-900 shadow-xs ring-1 ring-gray-200" : "text-gray-600",
            )}
          >
            {item.label}
          </Link>
        ))}
      </nav>
    </header>
  );
}

export function SiteFooter() {
  return (
    <footer className="border-t border-gray-200/70">
      <div className="mx-auto flex max-w-[1200px] flex-col items-center justify-between gap-2 px-5 py-8 text-sm text-gray-500 sm:flex-row sm:px-8">
        <p>
          © {new Date().getFullYear()} {SITE.name}
        </p>
        <nav className="flex gap-5">
          <Link href="/materi" className="hover:text-gray-800">
            Materi
          </Link>
          <Link href="/admin" className="hover:text-gray-800">
            Admin
          </Link>
        </nav>
      </div>
    </footer>
  );
}
