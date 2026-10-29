import "server-only";
import { query, transaction } from "./db";
import {
  CLASSES,
  DEFAULT_COMPONENTS,
  DEFAULT_KKTP,
  type GradeComponent,
  type ParsedStudent,
  type Student,
  type Term,
} from "./rapor-shared";

const TERM_COLS = "id, school_year, semester, kktp::float8 AS kktp";
const COMP_COLS = "id, term_id, name, weight::float8 AS weight, position";

// ---------- Semester ----------
export async function ensureTerm(schoolYear: string, semester: 1 | 2): Promise<{ term: Term; components: GradeComponent[] }> {
  return transaction(async (q) => {
    const inserted = await q<Term>(
      `INSERT INTO terms (school_year, semester, kktp) VALUES ($1, $2, $3)
       ON CONFLICT (school_year, semester) DO NOTHING RETURNING ${TERM_COLS}`,
      [schoolYear, semester, DEFAULT_KKTP],
    );
    let term = inserted[0];
    if (term) {
      // Semester baru: salin komponen dari semester terakhir yang ada, atau pakai bawaan.
      const prev = await q<{ name: string; weight: number }>(
        `SELECT c.name, c.weight::float8 AS weight FROM grade_components c
         WHERE c.term_id = (
           SELECT t.id FROM terms t
           WHERE t.id <> $1 AND EXISTS (SELECT 1 FROM grade_components x WHERE x.term_id = t.id)
           ORDER BY t.school_year DESC, t.semester DESC LIMIT 1)
         ORDER BY c.position, c.id`,
        [term.id],
      );
      const comps = prev.length ? prev : DEFAULT_COMPONENTS;
      for (const [i, c] of comps.entries()) {
        await q(`INSERT INTO grade_components (term_id, name, weight, position) VALUES ($1, $2, $3, $4)`, [term.id, c.name, c.weight, i]);
      }
    } else {
      term = (await q<Term>(`SELECT ${TERM_COLS} FROM terms WHERE school_year = $1 AND semester = $2`, [schoolYear, semester]))[0];
    }
    const components = await q<GradeComponent>(
      `SELECT ${COMP_COLS} FROM grade_components WHERE term_id = $1 ORDER BY position, id`,
      [term.id],
    );
    return { term, components };
  });
}

export async function getTerm(termId: number): Promise<Term | null> {
  const rows = await query<Term>(`SELECT ${TERM_COLS} FROM terms WHERE id = $1`, [termId]);
  return rows[0] ?? null;
}

export async function listComponents(termId: number): Promise<GradeComponent[]> {
  return query<GradeComponent>(`SELECT ${COMP_COLS} FROM grade_components WHERE term_id = $1 ORDER BY position, id`, [termId]);
}

export async function knownSchoolYears(): Promise<string[]> {
  const rows = await query<{ y: string }>(
    `SELECT school_year AS y FROM terms UNION SELECT school_year FROM students ORDER BY 1 DESC`,
  );
  return rows.map((r) => r.y);
}

export type ComponentInput = { id: number | null; name: string; weight: number };

export async function saveComponents(termId: number, components: ComponentInput[], kktp: number): Promise<void> {
  await transaction(async (q) => {
    const keepIds = components.filter((c) => c.id !== null).map((c) => c.id as number);
    // Hapus komponen yang dibuang (nilainya ikut terhapus).
    await q(`DELETE FROM grade_components WHERE term_id = $1 AND NOT (id = ANY($2::int[]))`, [termId, keepIds]);
    for (const [i, c] of components.entries()) {
      if (c.id === null) {
        await q(`INSERT INTO grade_components (term_id, name, weight, position) VALUES ($1, $2, $3, $4)`, [termId, c.name, c.weight, i]);
      } else {
        const updated = await q(
          `UPDATE grade_components SET name = $3, weight = $4, position = $5 WHERE id = $1 AND term_id = $2 RETURNING id`,
          [c.id, termId, c.name, c.weight, i],
        );
        if (updated.length === 0) throw new Error("Komponen tidak ditemukan. Muat ulang halaman.");
      }
    }
    await q(`UPDATE terms SET kktp = $2 WHERE id = $1`, [termId, kktp]);
  });
}

// ---------- Siswa ----------
const STUDENT_COLS = "id, school_year, class_name, nis, name";

export function listStudents(schoolYear: string, className: string): Promise<Student[]> {
  return query<Student>(
    `SELECT ${STUDENT_COLS} FROM students WHERE school_year = $1 AND class_name = $2 ORDER BY lower(name), id`,
    [schoolYear, className],
  );
}

export async function classCounts(schoolYear: string): Promise<Record<string, number>> {
  const rows = await query<{ class_name: string; n: number }>(
    `SELECT class_name, count(*)::int AS n FROM students WHERE school_year = $1 GROUP BY class_name`,
    [schoolYear],
  );
  const out: Record<string, number> = Object.fromEntries(CLASSES.map((c) => [c, 0]));
  for (const r of rows) out[r.class_name] = r.n;
  return out;
}

export async function addStudents(
  schoolYear: string,
  className: string,
  list: ParsedStudent[],
): Promise<{ added: number; skipped: string[] }> {
  return transaction(async (q) => {
    const existing = await q<{ name: string; nis: string }>(
      `SELECT name, nis FROM students WHERE school_year = $1 AND class_name = $2`,
      [schoolYear, className],
    );
    const names = new Set(existing.map((e) => e.name.toLowerCase()));
    const nisSet = new Set(existing.map((e) => e.nis).filter(Boolean));
    const toAdd: ParsedStudent[] = [];
    const skipped: string[] = [];
    for (const s of list) {
      const key = s.name.toLowerCase();
      if (names.has(key) || (s.nis && nisSet.has(s.nis))) {
        skipped.push(s.name);
        continue;
      }
      names.add(key);
      if (s.nis) nisSet.add(s.nis);
      toAdd.push(s);
    }
    if (toAdd.length) {
      await q(
        `INSERT INTO students (school_year, class_name, nis, name)
         SELECT $1, $2, n, m FROM unnest($3::text[], $4::text[]) AS t(n, m)`,
        [schoolYear, className, toAdd.map((s) => s.nis), toAdd.map((s) => s.name)],
      );
    }
    return { added: toAdd.length, skipped };
  });
}

export async function updateStudent(id: number, data: { nis: string; name: string; class_name: string }): Promise<boolean> {
  const rows = await query(
    `UPDATE students SET nis = $2, name = $3, class_name = $4, updated_at = now() WHERE id = $1 RETURNING id`,
    [id, data.nis, data.name, data.class_name],
  );
  return rows.length > 0;
}

export async function deleteStudent(id: number): Promise<boolean> {
  const rows = await query(`DELETE FROM students WHERE id = $1 RETURNING id`, [id]);
  return rows.length > 0;
}

export async function deleteClass(schoolYear: string, className: string): Promise<number> {
  const rows = await query(`DELETE FROM students WHERE school_year = $1 AND class_name = $2 RETURNING id`, [schoolYear, className]);
  return rows.length;
}

// ---------- Nilai ----------
export type GradeSheet = {
  students: Student[];
  scores: Record<number, Record<number, number>>; // studentId -> componentId -> nilai
  notes: Record<number, string>;
};

export async function getGradeSheet(term: Term, className: string, components: GradeComponent[]): Promise<GradeSheet> {
  const students = await listStudents(term.school_year, className);
  const ids = students.map((s) => s.id);
  const scores: GradeSheet["scores"] = {};
  const notes: GradeSheet["notes"] = {};
  if (ids.length && components.length) {
    const rows = await query<{ student_id: number; component_id: number; score: number }>(
      `SELECT student_id, component_id, score::float8 AS score FROM scores
       WHERE student_id = ANY($1::int[]) AND component_id = ANY($2::int[])`,
      [ids, components.map((c) => c.id)],
    );
    for (const r of rows) (scores[r.student_id] ??= {})[r.component_id] = r.score;
  }
  if (ids.length) {
    const rows = await query<{ student_id: number; description: string }>(
      `SELECT student_id, description FROM report_notes WHERE term_id = $1 AND student_id = ANY($2::int[])`,
      [term.id, ids],
    );
    for (const r of rows) notes[r.student_id] = r.description;
  }
  return { students, scores, notes };
}

export type ScoreChange = { studentId: number; componentId: number; score: number | null };
export type NoteChange = { studentId: number; description: string };

export async function saveGrades(term: Term, className: string, scores: ScoreChange[], notes: NoteChange[]): Promise<void> {
  await transaction(async (q) => {
    // Pastikan semua siswa & komponen memang milik kelas dan semester ini.
    const studentIds = [...new Set([...scores.map((s) => s.studentId), ...notes.map((n) => n.studentId)])];
    if (studentIds.length) {
      const ok = await q<{ n: number }>(
        `SELECT count(*)::int AS n FROM students WHERE id = ANY($1::int[]) AND school_year = $2 AND class_name = $3`,
        [studentIds, term.school_year, className],
      );
      if (ok[0].n !== studentIds.length) throw new Error("Data siswa berubah. Muat ulang halaman lalu coba lagi.");
    }
    const compIds = [...new Set(scores.map((s) => s.componentId))];
    if (compIds.length) {
      const ok = await q<{ n: number }>(
        `SELECT count(*)::int AS n FROM grade_components WHERE id = ANY($1::int[]) AND term_id = $2`,
        [compIds, term.id],
      );
      if (ok[0].n !== compIds.length) throw new Error("Komponen nilai berubah. Muat ulang halaman lalu coba lagi.");
    }

    const upserts = scores.filter((s) => s.score !== null);
    const removals = scores.filter((s) => s.score === null);
    if (upserts.length) {
      await q(
        `INSERT INTO scores (student_id, component_id, score)
         SELECT * FROM unnest($1::int[], $2::int[], $3::numeric[])
         ON CONFLICT (student_id, component_id) DO UPDATE SET score = EXCLUDED.score, updated_at = now()`,
        [upserts.map((s) => s.studentId), upserts.map((s) => s.componentId), upserts.map((s) => s.score)],
      );
    }
    if (removals.length) {
      await q(
        `DELETE FROM scores s USING unnest($1::int[], $2::int[]) AS d(sid, cid)
         WHERE s.student_id = d.sid AND s.component_id = d.cid`,
        [removals.map((s) => s.studentId), removals.map((s) => s.componentId)],
      );
    }
    if (notes.length) {
      await q(
        `INSERT INTO report_notes (student_id, term_id, description)
         SELECT sid, $1, d FROM unnest($2::int[], $3::text[]) AS t(sid, d)
         ON CONFLICT (student_id, term_id) DO UPDATE SET description = EXCLUDED.description, updated_at = now()`,
        [term.id, notes.map((n) => n.studentId), notes.map((n) => n.description)],
      );
    }
  });
}

/** Jumlah siswa & nilai terisi per kelas untuk satu semester (untuk ringkasan). */
export async function termProgress(term: Term, componentCount: number): Promise<Record<string, { students: number; complete: number }>> {
  const rows = await query<{ class_name: string; students: number; complete: number }>(
    `SELECT s.class_name, count(*)::int AS students,
            count(*) FILTER (WHERE (SELECT count(*) FROM scores sc JOIN grade_components c ON c.id = sc.component_id
                                     WHERE sc.student_id = s.id AND c.term_id = $2) >= $3 AND $3 > 0)::int AS complete
     FROM students s WHERE s.school_year = $1 GROUP BY s.class_name`,
    [term.school_year, term.id, componentCount],
  );
  return Object.fromEntries(rows.map((r) => [r.class_name, { students: r.students, complete: r.complete }]));
}
