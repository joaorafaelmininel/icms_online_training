-- Fix: admin edits to slide content/titles in Module 2 (and reportedly any
-- module) silently do not save, and a student's progress in Module 2
-- always reverts to slide 22 no matter how far they advance.
--
-- Root cause: Postgrest (Supabase's REST layer) returns a normal 200
-- success with an EMPTY result — not an error — when an UPDATE or INSERT
-- matches zero rows. That is exactly what happens when a Row Level
-- Security policy silently blocks the write: the admin panel's PATCH
-- request comes back 200, and the app code has no way to tell "nothing
-- matched" apart from "it worked," because Postgres never raises an error
-- for a blocked/no-op write, only for a query that is malformed. This is
-- also why a prior investigation of Vercel's runtime error/exception logs
-- found nothing — an RLS-blocked write of this kind was never an
-- exception, it was a quiet no-op.
--
-- (The app code was separately hardened, in the same change that ships
-- with this script, to call .select() after every write and check whether
-- any rows actually came back — so this exact failure mode will surface
-- as a real error from now on instead of disappearing. But the underlying
-- permission gap still needs to be fixed here, in the database, since RLS
-- policies are not something the Admin Panel UI can configure.)
--
-- Like the earlier module_quiz_questions / final_exam_questions fix, this
-- was very likely present since these tables' RLS was first enabled and
-- simply never exercised by a write that mattered until now — module_slides
-- rows exist today because they were seeded directly via SQL by the
-- developer, not through this PATCH endpoint; user_module_progress rows
-- for slides 1-22 succeeded during earlier testing while a broader/looser
-- policy (or no RLS at all) was in place. Run this once in the Supabase
-- SQL editor.

-- ── module_slides (admin content edits) ────────────────────────────────
alter table module_slides enable row level security;

drop policy if exists "Admins can insert module slides" on module_slides;
create policy "Admins can insert module slides"
on module_slides for insert
to authenticated
with check (
  exists (select 1 from profiles where profiles.id = auth.uid() and profiles.user_role = 'admin')
);

drop policy if exists "Admins can update module slides" on module_slides;
create policy "Admins can update module slides"
on module_slides for update
to authenticated
using (
  exists (select 1 from profiles where profiles.id = auth.uid() and profiles.user_role = 'admin')
)
with check (
  exists (select 1 from profiles where profiles.id = auth.uid() and profiles.user_role = 'admin')
);

drop policy if exists "Admins can delete module slides" on module_slides;
create policy "Admins can delete module slides"
on module_slides for delete
to authenticated
using (
  exists (select 1 from profiles where profiles.id = auth.uid() and profiles.user_role = 'admin')
);

drop policy if exists "Authenticated users can read module slides" on module_slides;
create policy "Authenticated users can read module slides"
on module_slides for select
to authenticated
using (true);

-- ── user_module_progress (per-slide "resume here" tracking) ────────────
alter table user_module_progress enable row level security;

drop policy if exists "Users can insert their own module progress" on user_module_progress;
create policy "Users can insert their own module progress"
on user_module_progress for insert
to authenticated
with check (user_id = auth.uid());

drop policy if exists "Users can update their own module progress" on user_module_progress;
create policy "Users can update their own module progress"
on user_module_progress for update
to authenticated
using (user_id = auth.uid())
with check (user_id = auth.uid());

drop policy if exists "Users can read their own module progress" on user_module_progress;
create policy "Users can read their own module progress"
on user_module_progress for select
to authenticated
using (user_id = auth.uid());

drop policy if exists "Admins can read all module progress" on user_module_progress;
create policy "Admins can read all module progress"
on user_module_progress for select
to authenticated
using (
  exists (select 1 from profiles where profiles.id = auth.uid() and profiles.user_role = 'admin')
);

-- ── user_slide_progress (individual slide "viewed" checkmarks) ─────────
alter table user_slide_progress enable row level security;

drop policy if exists "Users can insert their own slide progress" on user_slide_progress;
create policy "Users can insert their own slide progress"
on user_slide_progress for insert
to authenticated
with check (user_id = auth.uid());

drop policy if exists "Users can update their own slide progress" on user_slide_progress;
create policy "Users can update their own slide progress"
on user_slide_progress for update
to authenticated
using (user_id = auth.uid())
with check (user_id = auth.uid());

drop policy if exists "Users can read their own slide progress" on user_slide_progress;
create policy "Users can read their own slide progress"
on user_slide_progress for select
to authenticated
using (user_id = auth.uid());

-- ── course_enrollments (status / last_accessed_at bookkeeping) ─────────
alter table course_enrollments enable row level security;

drop policy if exists "Users can update their own enrollment" on course_enrollments;
create policy "Users can update their own enrollment"
on course_enrollments for update
to authenticated
using (user_id = auth.uid())
with check (user_id = auth.uid());

drop policy if exists "Users can read their own enrollment" on course_enrollments;
create policy "Users can read their own enrollment"
on course_enrollments for select
to authenticated
using (user_id = auth.uid());

drop policy if exists "Users can insert their own enrollment" on course_enrollments;
create policy "Users can insert their own enrollment"
on course_enrollments for insert
to authenticated
with check (user_id = auth.uid());

-- ── Verify ───────────────────────────────────────────────────────────────
select schemaname, tablename, policyname, cmd
from pg_policies
where tablename in (
  'module_slides', 'user_module_progress', 'user_slide_progress', 'course_enrollments'
)
order by tablename, cmd;
