import "server-only";
import type { TelegramChat } from "./types";

export type { TelegramChat };

const API_BASE = process.env.TELEGRAM_API_BASE || "https://api.telegram.org";
const MAX_LENGTH = 4000; // batas Telegram 4096 karakter per pesan

export function telegramStatus() {
  const token = process.env.TELEGRAM_BOT_TOKEN ?? "";
  const chatId = process.env.TELEGRAM_CHAT_ID ?? "";
  return {
    hasToken: token.length > 0,
    hasChatId: chatId.length > 0,
    maskedChatId: chatId ? chatId.replace(/^(-?\d{2})\d*(\d{2})$/, "$1••••$2") : "",
    ready: token.length > 0 && chatId.length > 0,
  };
}

export function escapeHtml(text: string): string {
  return text.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
}

async function callTelegram<T>(method: string, body?: Record<string, unknown>): Promise<T> {
  const token = process.env.TELEGRAM_BOT_TOKEN;
  if (!token) throw new Error("TELEGRAM_BOT_TOKEN belum diatur.");
  const res = await fetch(`${API_BASE}/bot${token}/${method}`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body ?? {}),
    cache: "no-store",
  });
  const data = (await res.json().catch(() => null)) as { ok: boolean; result?: T; description?: string } | null;
  if (!data?.ok) {
    throw new Error(`Telegram menolak permintaan: ${data?.description ?? `HTTP ${res.status}`}`);
  }
  return data.result as T;
}

/** Pecah teks panjang di batas baris agar tidak melebihi batas Telegram. */
export function splitMessage(text: string, limit = MAX_LENGTH): string[] {
  if (text.length <= limit) return [text];
  const chunks: string[] = [];
  let current = "";
  for (const line of text.split("\n")) {
    if ((current + "\n" + line).length > limit && current) {
      chunks.push(current);
      current = line;
    } else {
      current = current ? `${current}\n${line}` : line;
    }
  }
  if (current) chunks.push(current);
  return chunks;
}

export async function sendTelegramMessage(html: string): Promise<void> {
  const chatId = process.env.TELEGRAM_CHAT_ID;
  if (!chatId) throw new Error("TELEGRAM_CHAT_ID belum diatur.");
  for (const chunk of splitMessage(html)) {
    await callTelegram("sendMessage", {
      chat_id: chatId,
      text: chunk,
      parse_mode: "HTML",
      link_preview_options: { is_disabled: true },
    });
  }
}

/** Ambil daftar chat yang baru-baru ini mengirim pesan ke bot (untuk mencari Chat ID). */
export async function findRecentChats(): Promise<TelegramChat[]> {
  type Update = {
    message?: { chat: { id: number; type: string; title?: string; first_name?: string; last_name?: string; username?: string } };
    my_chat_member?: { chat: { id: number; type: string; title?: string } };
  };
  const updates = await callTelegram<Update[]>("getUpdates", { limit: 100, allowed_updates: ["message", "my_chat_member"] });
  const chats = new Map<number, TelegramChat>();
  for (const u of updates) {
    const chat = u.message?.chat ?? u.my_chat_member?.chat;
    if (!chat) continue;
    const c = chat as { id: number; type: string; title?: string; first_name?: string; last_name?: string; username?: string };
    const name = c.title || [c.first_name, c.last_name].filter(Boolean).join(" ") || (c.username ? `@${c.username}` : "Tanpa nama");
    chats.set(c.id, { id: c.id, type: c.type, name });
  }
  return [...chats.values()];
}
