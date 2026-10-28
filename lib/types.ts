export type Lesson = {
  id: number;
  subject: string;
  day_of_week: number; // 1 = Senin ... 7 = Minggu
  start_time: string; // "HH:MM"
  end_time: string;
  teacher: string;
  room: string;
  notes: string;
  reminder_days: number[];
  active: boolean;
};

export type EventItem = {
  id: number;
  title: string;
  event_date: string; // "YYYY-MM-DD"
  start_time: string | null;
  end_time: string | null;
  location: string;
  description: string;
  reminder_days: number[];
};

export type ActionResult<T = undefined> =
  | { ok: true; message?: string; data?: T }
  | { ok: false; error: string };

export type ReminderPreview = {
  kind: "lesson" | "event";
  refId: number;
  title: string;
  targetDate: string;
  daysBefore: number;
  timeText: string;
  sent: boolean;
};

export type TelegramChat = { id: number; type: string; name: string };
