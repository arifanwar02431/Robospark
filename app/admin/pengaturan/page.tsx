import type { Metadata } from "next";
import { History } from "lucide-react";
import { ChatIdFinder, TelegramActions } from "@/components/admin/telegram-panel";
import { Badge, Card, CardHeader, EmptyState, PageHeader } from "@/components/ui";
import { requireAdmin } from "@/lib/auth";
import { recentReminderLogs } from "@/lib/data";
import { formatDate, reminderLabel } from "@/lib/date";
import { telegramStatus } from "@/lib/telegram";

export const metadata: Metadata = { title: "Telegram" };
export const dynamic = "force-dynamic";

function StatusRow({ label, ok, okText, badText, detail, mono }: { label: string; ok: boolean; okText: string; badText: string; detail?: string; mono?: boolean }) {
  return (
    <div className="flex items-center justify-between gap-4 py-3.5">
      <div className="min-w-0">
        <p className="text-sm font-medium text-gray-700">{label}</p>
        {detail && <p className={`truncate text-sm text-gray-500 ${mono ? "font-mono" : ""}`}>{detail}</p>}
      </div>
      <Badge color={ok ? "success" : "error"} dot>
        {ok ? okText : badText}
      </Badge>
    </div>
  );
}

const STEPS = [
  <>
    Buka <b>@BotFather</b> di Telegram, kirim <code className="font-mono">/newbot</code>, lalu ikuti petunjuknya. Salin token yang diberikan.
  </>,
  <>
    Di Vercel → Project → <b>Settings → Environment Variables</b>, isi <code className="font-mono">TELEGRAM_BOT_TOKEN</code>, lalu redeploy.
  </>,
  <>
    Buka bot Anda di Telegram dan kirim <b>/start</b>. Kemudian klik <b>Cari Chat ID</b> di bawah.
  </>,
  <>
    Salin Chat ID Anda ke <code className="font-mono">TELEGRAM_CHAT_ID</code> di Vercel, redeploy, lalu klik <b>Kirim pesan tes</b>.
  </>,
];

export default async function SettingsPage() {
  await requireAdmin();
  const status = telegramStatus();
  const logs = await recentReminderLogs(20);
  const cronReady = Boolean(process.env.CRON_SECRET);

  return (
    <div className="flex flex-col gap-7">
      <PageHeader title="Telegram" description="Hubungkan bot Telegram dan pantau pengingat yang sudah terkirim." />

      <div className="grid gap-6 lg:grid-cols-5">
        <Card className="lg:col-span-2">
          <CardHeader title="Status koneksi" description="Dibaca dari environment variable Vercel." />
          <div className="divide-y divide-gray-100 px-5 sm:px-6">
            <StatusRow label="Bot token" ok={status.hasToken} okText="Terpasang" badText="Belum diatur" />
            <StatusRow label="Chat ID" ok={status.hasChatId} okText="Terpasang" badText="Belum diatur" detail={status.maskedChatId || undefined} mono />
            <StatusRow label="Cron otomatis" ok={cronReady} okText="Aktif" badText="CRON_SECRET kosong" detail="Setiap hari ± 06.00–06.59 WIB" />
          </div>
          <div className="border-t border-gray-100 px-5 py-4 sm:px-6">
            <TelegramActions ready={status.ready} hasToken={status.hasToken} />
          </div>
        </Card>

        <Card className="lg:col-span-3">
          <CardHeader title="Cara menghubungkan" description="Hanya perlu dilakukan sekali." />
          <div className="flex flex-col gap-6 px-5 pt-2 pb-5 sm:px-6">
            <ol className="flex flex-col gap-4">
              {STEPS.map((step, i) => (
                <li key={i} className="flex gap-3 text-sm text-gray-600">
                  <span className="flex size-6 shrink-0 items-center justify-center rounded-full bg-brand-50 text-xs font-extrabold text-brand-700">
                    {i + 1}
                  </span>
                  <span className="pt-0.5">{step}</span>
                </li>
              ))}
            </ol>
            <ChatIdFinder hasToken={status.hasToken} />
          </div>
        </Card>
      </div>

      <Card className="overflow-hidden">
        <CardHeader title="Riwayat pengingat" description="20 pengingat terakhir yang terkirim ke Telegram." />
        {logs.length === 0 ? (
          <EmptyState icon={History} title="Belum ada riwayat" description="Pengingat yang terkirim akan tercatat di sini." />
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full min-w-[560px] text-left text-sm">
              <thead className="border-y border-gray-100 text-xs text-gray-500">
                <tr>
                  <th className="px-6 py-3 font-semibold">Jadwal</th>
                  <th className="px-6 py-3 font-semibold">Jenis</th>
                  <th className="px-6 py-3 font-semibold">Untuk tanggal</th>
                  <th className="px-6 py-3 font-semibold">Terkirim</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {logs.map((log) => (
                  <tr key={log.id}>
                    <td className="px-6 py-3.5 font-semibold text-gray-900">{log.title}</td>
                    <td className="px-6 py-3.5">
                      <Badge color={log.kind === "lesson" ? "brand" : "blue"}>{log.kind === "lesson" ? "Pelajaran" : "Kegiatan"}</Badge>
                    </td>
                    <td className="px-6 py-3.5 text-gray-600">
                      {formatDate(log.target_date, "medium")} <span className="text-gray-400">({reminderLabel(log.days_before)})</span>
                    </td>
                    <td className="px-6 py-3.5 whitespace-nowrap text-gray-600 tabular-nums">
                      {formatDate(log.sent_at.slice(0, 10), "short")}, {log.sent_at.slice(11)} WIB
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </Card>
    </div>
  );
}
