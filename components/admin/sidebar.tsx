"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { BookOpen, CalendarDays, ClipboardList, ExternalLink, LayoutGrid, LogOut, Menu, Send, Users, X } from "lucide-react";
import { Logo } from "@/components/logo";
import { cn } from "@/components/ui";
import { logoutAction } from "@/app/login/actions";

const GROUPS = [
  { items: [{ href: "/admin", label: "Hari ini", icon: LayoutGrid }] },
  {
    title: "Jadwal",
    items: [
      { href: "/admin/pelajaran", label: "Pelajaran", icon: BookOpen },
      { href: "/admin/kegiatan", label: "Kegiatan", icon: CalendarDays },
    ],
  },
  {
    title: "Rapor",
    items: [
      { href: "/admin/nilai", label: "Nilai", icon: ClipboardList },
      { href: "/admin/siswa", label: "Siswa", icon: Users },
    ],
  },
  { title: "Pengaturan", items: [{ href: "/admin/pengaturan", label: "Telegram & server", icon: Send }] },
];

function NavLinks({ onNavigate }: { onNavigate?: () => void }) {
  const pathname = usePathname();
  return (
    <nav className="flex flex-col gap-5" aria-label="Menu admin">
      {GROUPS.map((group, gi) => (
        <div key={gi} className="flex flex-col gap-0.5">
          {group.title && <p className="mb-1 px-3 text-xs font-semibold text-gray-400">{group.title}</p>}
          {group.items.map(({ href, label, icon: Icon }) => {
            const active = href === "/admin" ? pathname === "/admin" : pathname.startsWith(href);
            return (
              <Link
                key={href}
                href={href}
                onClick={onNavigate}
                aria-current={active ? "page" : undefined}
                className={cn(
                  "flex items-center gap-3 rounded-xl px-3 py-2 text-sm font-semibold transition-colors",
                  active ? "bg-white text-gray-900 shadow-xs ring-1 ring-gray-200/80" : "text-gray-600 hover:bg-white/60 hover:text-gray-900",
                )}
              >
                <Icon className={cn("size-[18px]", active ? "text-brand-600" : "text-gray-400")} strokeWidth={2} />
                {label}
              </Link>
            );
          })}
        </div>
      ))}
    </nav>
  );
}

function AccountCard({ username }: { username: string }) {
  return (
    <div className="flex flex-col gap-2">
      <Link
        href="/"
        target="_blank"
        className="flex items-center gap-3 rounded-xl px-3 py-2 text-sm font-semibold text-gray-600 hover:bg-white/60 hover:text-gray-900"
      >
        <ExternalLink className="size-[18px] text-gray-400" />
        Lihat website
      </Link>
      <div className="flex items-center gap-3 rounded-2xl bg-white/70 p-2.5 ring-1 ring-gray-200/70">
        <span className="flex size-9 shrink-0 items-center justify-center rounded-full bg-brand-50 text-sm font-bold text-brand-700">
          {username.charAt(0).toUpperCase()}
        </span>
        <div className="min-w-0 flex-1">
          <p className="truncate text-[13px] font-bold text-gray-900">{username}</p>
          <p className="truncate text-xs text-gray-500">Pemilik</p>
        </div>
        <form action={logoutAction}>
          <button
            type="submit"
            className="inline-flex size-8 items-center justify-center rounded-full text-gray-400 hover:bg-gray-100 hover:text-gray-700"
            aria-label="Keluar"
            title="Keluar"
          >
            <LogOut className="size-4" />
          </button>
        </form>
      </div>
    </div>
  );
}

export function Sidebar({ username }: { username: string }) {
  const [open, setOpen] = useState(false);
  const pathname = usePathname();
  useEffect(() => setOpen(false), [pathname]);

  return (
    <>
      {/* Desktop */}
      <aside className="fixed inset-y-0 left-0 z-30 hidden w-[244px] flex-col justify-between px-4 pt-6 pb-5 lg:flex">
        <div className="flex flex-col gap-8">
          <Link href="/admin" className="px-2">
            <Logo subtitle="Panel admin" />
          </Link>
          <NavLinks />
        </div>
        <AccountCard username={username} />
      </aside>

      {/* Mobile top bar */}
      <div className="sticky top-0 z-30 flex h-16 items-center justify-between border-b border-gray-200/70 bg-sand/90 px-4 backdrop-blur lg:hidden">
        <Link href="/admin">
          <Logo />
        </Link>
        <button
          onClick={() => setOpen(true)}
          className="inline-flex size-10 items-center justify-center rounded-full text-gray-600 hover:bg-white"
          aria-label="Buka menu"
        >
          <Menu className="size-5" />
        </button>
      </div>

      {open && (
        <div className="fixed inset-0 z-50 lg:hidden">
          <div className="absolute inset-0 animate-fade-in bg-gray-900/40 backdrop-blur-[2px]" onClick={() => setOpen(false)} />
          <aside className="relative flex h-full w-[290px] max-w-[85vw] animate-slide-in flex-col justify-between bg-sand px-4 pt-5 pb-5 shadow-xl">
            <div className="flex flex-col gap-8">
              <div className="flex items-center justify-between px-2">
                <Logo subtitle="Panel admin" />
                <button
                  onClick={() => setOpen(false)}
                  className="inline-flex size-9 items-center justify-center rounded-full text-gray-500 hover:bg-white"
                  aria-label="Tutup menu"
                >
                  <X className="size-5" />
                </button>
              </div>
              <NavLinks onNavigate={() => setOpen(false)} />
            </div>
            <AccountCard username={username} />
          </aside>
        </div>
      )}
    </>
  );
}
