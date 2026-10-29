import Link from "next/link";
import { LockKeyhole } from "lucide-react";
import { Logo } from "./logo";
import { cn } from "./ui";
import { SITE } from "@/lib/site";

export type NavKey = "/" | "/materi" | "/robot" | "/project";

const NAV: { href: NavKey; label: string }[] = [
  { href: "/", label: "Beranda" },
  { href: "/materi", label: "Materi" },
  { href: "/robot", label: "Robot" },
  { href: "/project", label: "Project" },
];

export function SiteHeader({ active }: { active: NavKey }) {
  return (
    <header className="relative z-30">
      <div className="mx-auto flex h-20 max-w-[1200px] items-center justify-between gap-4 px-5 sm:px-8">
        <Link href="/" aria-label="Beranda" className="rounded-lg">
          <Logo />
        </Link>
        <nav className="hidden items-center gap-1 rounded-full bg-white/60 p-1 ring-1 ring-gray-200/70 backdrop-blur md:flex" aria-label="Navigasi utama">
          {NAV.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              aria-current={active === item.href ? "page" : undefined}
              className={cn(
                "rounded-full px-4 py-1.5 text-[15px] font-semibold transition-colors",
                active === item.href ? "bg-gray-900 text-white" : "text-gray-600 hover:text-gray-900",
              )}
            >
              {item.label}
            </Link>
          ))}
        </nav>
        <Link href="/admin" className="inline-flex items-center gap-1.5 rounded-full px-3 py-2 text-sm font-semibold text-gray-600 hover:bg-white/70 hover:text-gray-900">
          <LockKeyhole className="size-4" />
          Admin
        </Link>
      </div>
      <nav className="scrollbar-thin flex gap-1 overflow-x-auto px-4 pb-2 md:hidden" aria-label="Navigasi utama">
        {NAV.map((item) => (
          <Link
            key={item.href}
            href={item.href}
            aria-current={active === item.href ? "page" : undefined}
            className={cn(
              "shrink-0 rounded-full px-3.5 py-1.5 text-sm font-semibold",
              active === item.href ? "bg-gray-900 text-white" : "text-gray-600",
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
      <div className="mx-auto flex max-w-[1200px] flex-col items-center justify-between gap-3 px-5 py-8 text-sm text-gray-500 sm:flex-row sm:px-8">
        <p>
          © {new Date().getFullYear()} {SITE.name}
        </p>
        <nav className="flex gap-5" aria-label="Tautan bawah">
          {NAV.slice(1).map((item) => (
            <Link key={item.href} href={item.href} className="hover:text-gray-800">
              {item.label}
            </Link>
          ))}
        </nav>
      </div>
    </footer>
  );
}

/** Kerangka halaman publik. */
export function PublicShell({ active, children }: { active: NavKey; children: React.ReactNode }) {
  return (
    <div className="bg-sunrise flex min-h-dvh flex-col">
      <SiteHeader active={active} />
      <main className="flex-1">{children}</main>
      <SiteFooter />
    </div>
  );
}

export function PageIntro({ title, children }: { title: string; children?: React.ReactNode }) {
  return (
    <div className="max-w-2xl animate-rise">
      <h1 className="text-[40px] leading-[1.05] font-extrabold tracking-[-0.032em] text-gray-900 sm:text-[52px]">{title}</h1>
      {children && <div className="mt-5 text-[17px] leading-relaxed text-gray-600">{children}</div>}
    </div>
  );
}
