import { Bell, CheckCheck } from "lucide-react";
import { cn } from "./ui";

/** Contoh tampilan pesan pengingat di Telegram (ilustrasi). */
export function TelegramBubble({ className }: { className?: string }) {
  return (
    <div className={cn("w-full max-w-[360px] overflow-hidden rounded-[28px] bg-white shadow-xl ring-1 ring-black/5", className)}>
      <div className="flex items-center gap-3 border-b border-gray-100 px-5 py-3.5">
        <span className="flex size-9 items-center justify-center rounded-full bg-gradient-to-br from-brand-400 to-brand-600 text-white">
          <Bell className="size-4" strokeWidth={2.4} />
        </span>
        <div>
          <p className="text-sm font-bold text-gray-900">Pengingat Jadwal</p>
          <p className="text-xs text-gray-500">bot</p>
        </div>
      </div>
      <div className="bg-[#efe9e3] px-4 py-5">
        <div className="relative max-w-[290px] rounded-2xl rounded-bl-md bg-white px-4 pt-3 pb-2 text-[13px] leading-relaxed text-gray-800 shadow-xs">
          <p className="font-bold">🔔 Pengingat Jadwal</p>
          <p className="text-gray-500 italic">Senin, 26 Oktober 2026</p>
          <p className="mt-2 font-bold">📚 Jadwal Pelajaran</p>
          <p>
            • <b>Matematika</b> — Besok
          </p>
          <p className="pl-3 text-gray-600">Sel, 27 Okt 2026 · 07:30–09:00</p>
          <p className="pl-3 text-gray-600">📝 Bawa jangka &amp; busur</p>
          <p className="mt-2 font-bold">📌 Jadwal Kegiatan</p>
          <p>
            • <b>Ujian Tengah Semester</b> — 4 hari lagi
          </p>
          <p className="pl-3 text-gray-600">Jum, 30 Okt 2026 · 08:00–10:00</p>
          <p className="pl-3 text-gray-600">📍 Gedung A</p>
          <p className="mt-1 flex items-center justify-end gap-1 text-[11px] text-gray-400">
            06.02 <CheckCheck className="size-3.5 text-c1-500" />
          </p>
        </div>
      </div>
    </div>
  );
}
