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

-- ===== Rapor =====
-- Daftar siswa per tahun ajaran (kelas 4A–4I dan 6A–6I).
CREATE TABLE IF NOT EXISTS students (
  id          SERIAL PRIMARY KEY,
  school_year TEXT        NOT NULL,             -- contoh: '2026/2027'
  class_name  TEXT        NOT NULL,             -- contoh: '4A'
  nis         TEXT        NOT NULL DEFAULT '',
  name        TEXT        NOT NULL,
  created_at  TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at  TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE INDEX IF NOT EXISTS students_class_idx ON students (school_year, class_name, name);

-- Semester (tahun ajaran + semester 1/2) beserta KKTP.
CREATE TABLE IF NOT EXISTS terms (
  id          SERIAL PRIMARY KEY,
  school_year TEXT          NOT NULL,
  semester    SMALLINT      NOT NULL CHECK (semester IN (1, 2)),
  kktp        NUMERIC(5,2)  NOT NULL DEFAULT 75,
  UNIQUE (school_year, semester)
);

-- Komponen penilaian per semester (Tugas, Praktik, UTS, UAS, ...) beserta bobotnya.
CREATE TABLE IF NOT EXISTS grade_components (
  id        SERIAL PRIMARY KEY,
  term_id   INT          NOT NULL REFERENCES terms(id) ON DELETE CASCADE,
  name      TEXT         NOT NULL,
  weight    NUMERIC(6,2) NOT NULL CHECK (weight >= 0),
  position  SMALLINT     NOT NULL DEFAULT 0
);
CREATE INDEX IF NOT EXISTS grade_components_term_idx ON grade_components (term_id, position);

CREATE TABLE IF NOT EXISTS scores (
  student_id   INT          NOT NULL REFERENCES students(id) ON DELETE CASCADE,
  component_id INT          NOT NULL REFERENCES grade_components(id) ON DELETE CASCADE,
  score        NUMERIC(5,2) NOT NULL CHECK (score >= 0 AND score <= 100),
  updated_at   TIMESTAMPTZ  NOT NULL DEFAULT now(),
  PRIMARY KEY (student_id, component_id)
);

-- Deskripsi capaian kompetensi per siswa per semester.
CREATE TABLE IF NOT EXISTS report_notes (
  student_id  INT         NOT NULL REFERENCES students(id) ON DELETE CASCADE,
  term_id     INT         NOT NULL REFERENCES terms(id) ON DELETE CASCADE,
  description TEXT        NOT NULL DEFAULT '',
  updated_at  TIMESTAMPTZ NOT NULL DEFAULT now(),
  PRIMARY KEY (student_id, term_id)
);

-- Percobaan login gagal (pembatasan brute force).
CREATE TABLE IF NOT EXISTS login_attempts (
  id         SERIAL PRIMARY KEY,
  ip         TEXT        NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE INDEX IF NOT EXISTS login_attempts_ip_idx ON login_attempts (ip, created_at);
`;
