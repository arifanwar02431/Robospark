"use client";

import { useState, useTransition } from "react";
import { BellRing, Check, Copy, Search, Send } from "lucide-react";
import { useToast } from "@/components/toast";
import { Badge, Button } from "@/components/ui";
import { findChatsAction, runRemindersNowAction, sendTestMessageAction } from "@/app/admin/actions";
import type { TelegramChat } from "@/lib/types";

export function TelegramActions({ ready, hasToken }: { ready: boolean; hasToken: boolean }) {
  const toast = useToast();
  const [busy, setBusy] = useState<"test" | "run" | null>(null);
  const [, startTransition] = useTransition();

  const run = (kind: "test" | "run") => {
    setBusy(kind);
    startTransition(async () => {
      const res = kind === "test" ? await sendTestMessageAction() : await runRemindersNowAction();
      if (res.ok) toast({ type: "success", title: res.message ?? "Berhasil." });
      else toast({ type: "error", title: "Gagal", description: res.error });
      setBusy(null);
    });
  };

  return (
    <div className="flex flex-wrap items-center gap-3">
      <Button variant="secondary" icon={Send} loading={busy === "test"} disabled={!ready || busy !== null} onClick={() => run("test")}>
        Kirim pesan tes
      </Button>
      <Button icon={BellRing} loading={busy === "run"} disabled={!ready || busy !== null} onClick={() => run("run")}>
        Jalankan pengingat hari ini
      </Button>
      {!ready && (
        <p className="text-sm text-gray-500">
          {hasToken ? "Isi TELEGRAM_CHAT_ID dulu." : "Isi TELEGRAM_BOT_TOKEN dulu."}
        </p>
      )}
    </div>
  );
}

export function ChatIdFinder({ hasToken }: { hasToken: boolean }) {
  const toast = useToast();
  const [chats, setChats] = useState<TelegramChat[] | null>(null);
  const [copied, setCopied] = useState<number | null>(null);
  const [pending, startTransition] = useTransition();

  const find = () =>
    startTransition(async () => {
      const res = await findChatsAction();
      if (res.ok) setChats(res.data ?? []);
      else toast({ type: "error", title: "Gagal mengambil data", description: res.error });
    });

  const copy = async (id: number) => {
    try {
      await navigator.clipboard.writeText(String(id));
      setCopied(id);
      setTimeout(() => setCopied(null), 2000);
    } catch {
      toast({ type: "error", title: "Tidak bisa menyalin", description: "Salin manual: " + id });
    }
  };

  return (
    <div className="flex flex-col gap-4">
      <Button variant="secondary" icon={Search} onClick={find} loading={pending} disabled={!hasToken} className="self-start">
        Cari Chat ID
      </Button>
      {chats !== null &&
        (chats.length === 0 ? (
          <p className="rounded-lg bg-gray-50 px-4 py-3 text-sm text-gray-600 ring-1 ring-gray-200">
            Belum ada pesan masuk. Buka bot Anda di Telegram, kirim <b>/start</b>, lalu klik “Cari Chat ID” lagi.
          </p>
        ) : (
          <ul className="divide-y divide-gray-200 rounded-lg ring-1 ring-gray-200">
            {chats.map((c) => (
              <li key={c.id} className="flex items-center justify-between gap-3 px-4 py-3">
                <div className="min-w-0">
                  <p className="truncate text-sm font-medium text-gray-900">{c.name}</p>
                  <p className="font-mono text-sm text-gray-600">{c.id}</p>
                </div>
                <div className="flex items-center gap-2">
                  <Badge>{c.type === "private" ? "Pribadi" : c.type}</Badge>
                  <Button size="sm" variant="secondary" icon={copied === c.id ? Check : Copy} onClick={() => copy(c.id)}>
                    {copied === c.id ? "Disalin" : "Salin"}
                  </Button>
                </div>
              </li>
            ))}
          </ul>
        ))}
    </div>
  );
}
