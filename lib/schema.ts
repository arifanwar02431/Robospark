// Skema database. Dijalankan otomatis (idempoten) saat aplikasi pertama kali
// mengakses database, jadi Anda tidak perlu menjalankan SQL secara manual.
export const SCHEMA_SQL = `
CREATE TABLE IF NOT EXISTS lessons (
  id            SERIAL PRIMARY KEY,
  subject       TEXT        NOT NULL,
  day_of_week   SMALLINT    NOT NULL CHECK (day_of_week BETWEEN 1 AND 7), -- 1 = Senin ... 7 = Minggu
  start_time    TIME        NOT NULL,
  end_time      TIME        NOT NULL,
  teacher       TEXT        NOT NULL DEFAULT '',
  room          TEXT        NOT NULL DEFAULT '',
  notes         TEXT        NOT NULL DEFAULT '',
  reminder_days INT[]       NOT NULL DEFAULT '{1}',
  active        BOOLEAN     NOT NULL DEFAULT TRUE,
  created_at    TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at    TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS events (
  id            SERIAL PRIMARY KEY,
  title         TEXT        NOT NULL,
  event_date    DATE        NOT NULL,
  start_time    TIME,
  end_time      TIME,
  location      TEXT        NOT NULL DEFAULT '',
  description   TEXT        NOT NULL DEFAULT '',
  reminder_days INT[]       NOT NULL DEFAULT '{1}',
  created_at    TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at    TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE INDEX IF NOT EXISTS events_event_date_idx ON events (event_date);

-- Catatan pengingat yang sudah dikirim, agar tidak terkirim dua kali.
CREATE TABLE IF NOT EXISTS reminder_log (
  id          SERIAL PRIMARY KEY,
  kind        TEXT        NOT NULL CHECK (kind IN ('lesson', 'event')),
  ref_id      INT         NOT NULL,
  target_date DATE        NOT NULL,
  days_before INT         NOT NULL,
  sent_at     TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (kind, ref_id, target_date, days_before)
);

-- Percobaan login gagal (pembatasan brute force).
CREATE TABLE IF NOT EXISTS login_attempts (
  id         SERIAL PRIMARY KEY,
  ip         TEXT        NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE INDEX IF NOT EXISTS login_attempts_ip_idx ON login_attempts (ip, created_at);
`;
