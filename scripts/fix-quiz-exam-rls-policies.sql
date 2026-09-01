-- Fix: "new row violates row-level security policy for table
-- 'final_exam_questions'" (and the same issue on module_quiz_questions).
--
-- The bulk-import API routes (/api/admin/quiz/bulk-import and
-- /api/admin/final-exam/bulk-import) already check server-side that the
-- caller's profiles.user_role = 'admin' before writing anything. But that
-- check happens in application code — Postgres Row-Level Security is a
-- separate, database-level gate, and these two tables currently have no
-- policy that lets ANY user (including an admin) INSERT/UPDATE/DELETE into
-- them. Both checks have to agree; right now RLS is the one saying no.
--
-- This mirrors whatever policy already lets admins write to module_slides,
-- scoped to the same profiles.user_role = 'admin' check the routes use.
-- Run this once in the Supabase SQL editor — there is no equivalent
-- action available from the Admin Panel UI, since RLS policies are
-- database configuration, not app content.

-- ── module_quiz_questions ───────────────────────────────────────────────
alter table module_quiz_questions enable row level security;

drop policy if exists "Admins can insert module quiz questions" on module_quiz_questions;
create policy "Admins can insert module quiz questions"
on module_quiz_questions for insert
to authenticated
with check (
  exists (select 1 from profiles where profiles.id = auth.uid() and profiles.user_role = 'admin')
);

drop policy if exists "Admins can update module quiz questions" on module_quiz_questions;
create policy "Admins can update module quiz questions"
on module_quiz_questions for update
to authenticated
using (
  exists (select 1 from profiles where profiles.id = auth.uid() and profiles.user_role = 'admin')
);

drop policy if exists "Admins can delete module quiz questions" on module_quiz_questions;
create policy "Admins can delete module quiz questions"
on module_quiz_questions for delete
to authenticated
using (
  exists (select 1 from profiles where profiles.id = auth.uid() and profiles.user_role = 'admin')
);

drop policy if exists "Authenticated users can read module quiz questions" on module_quiz_questions;
create policy "Authenticated users can read module quiz questions"
on module_quiz_questions for select
to authenticated
using (true);

-- ── final_exam_questions ────────────────────────────────────────────────
alter table final_exam_questions enable row level security;

drop policy if exists "Admins can insert final exam questions" on final_exam_questions;
create policy "Admins can insert final exam questions"
on final_exam_questions for insert
to authenticated
with check (
  exists (select 1 from profiles where profiles.id = auth.uid() and profiles.user_role = 'admin')
);

drop policy if exists "Admins can update final exam questions" on final_exam_questions;
create policy "Admins can update final exam questions"
on final_exam_questions for update
to authenticated
using (
  exists (select 1 from profiles where profiles.id = auth.uid() and profiles.user_role = 'admin')
);

drop policy if exists "Admins can delete final exam questions" on final_exam_questions;
create policy "Admins can delete final exam questions"
on final_exam_questions for delete
to authenticated
using (
  exists (select 1 from profiles where profiles.id = auth.uid() and profiles.user_role = 'admin')
);

drop policy if exists "Authenticated users can read final exam questions" on final_exam_questions;
create policy "Authenticated users can read final exam questions"
on final_exam_questions for select
to authenticated
using (true);

-- ── Also required so a passed module quiz can actually unlock progress ──
-- user_quiz_attempts / user_final_exam_attempts need the same treatment:
-- a student must be able to insert their own attempt row.
alter table user_quiz_attempts enable row level security;

drop policy if exists "Users can insert their own quiz attempts" on user_quiz_attempts;
create policy "Users can insert their own quiz attempts"
on user_quiz_attempts for insert
to authenticated
with check (user_id = auth.uid());

drop policy if exists "Users can read their own quiz attempts" on user_quiz_attempts;
create policy "Users can read their own quiz attempts"
on user_quiz_attempts for select
to authenticated
using (user_id = auth.uid());

alter table user_final_exam_attempts enable row level security;

drop policy if exists "Users can insert their own final exam attempts" on user_final_exam_attempts;
create policy "Users can insert their own final exam attempts"
on user_final_exam_attempts for insert
to authenticated
with check (user_id = auth.uid());

drop policy if exists "Users can read their own final exam attempts" on user_final_exam_attempts;
create policy "Users can read their own final exam attempts"
on user_final_exam_attempts for select
to authenticated
using (user_id = auth.uid());

-- ── Verify ───────────────────────────────────────────────────────────────
select schemaname, tablename, policyname, cmd
from pg_policies
where tablename in (
  'module_quiz_questions', 'final_exam_questions',
  'user_quiz_attempts', 'user_final_exam_attempts'
)
order by tablename, cmd;
