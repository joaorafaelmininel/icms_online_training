-- Fix: module 2 (and possibly other modules) have slide_number values that
-- skip some numbers — e.g. Module 2 has only 42 rows, but its last two are
-- numbered 43 and 44 instead of 41 and 42, meaning two numbers earlier in
-- the sequence are missing entirely.
--
-- Root cause (data, not app code): the bulk-import endpoint numbers new
-- slides as (current max slide_number in the module) + 1, 2, 3... If a
-- slide was ever created and later deleted between two import batches, or
-- an import partially retried, the numbering can end up with a gap even
-- though the actual row count is lower than the highest number.
--
-- This gap silently broke Next/Prev navigation and clicking a slide by
-- number in the app (already patched in the code to navigate by position
-- instead of doing arithmetic on slide_number — commit follows this
-- script), but the confusing numbers themselves (and the mismatch between
-- "40/42" progress and a slide labeled "44") only get fixed here, in the
-- data.
--
-- This renumbers every module's slides to a contiguous 1..N sequence in
-- their existing order — safe to run any time, including on modules that
-- are already contiguous (no-op for those). Run once in the Supabase SQL
-- editor.

-- Step 1: bump every slide_number out of the way first, so step 2 can't
-- collide with a still-in-place row sharing the same (module_id,
-- slide_number) pair mid-update.
update module_slides
set slide_number = slide_number + 100000
where course_id = 'b8e6a6f7-5019-425f-8f27-d5477b78588a';

-- Step 2: reassign contiguous 1..N per module, preserving existing order.
with ranked as (
  select id,
         row_number() over (partition by module_id order by slide_number) as rn
  from module_slides
  where course_id = 'b8e6a6f7-5019-425f-8f27-d5477b78588a'
)
update module_slides ms
set slide_number = ranked.rn
from ranked
where ms.id = ranked.id;

-- ── Verify ───────────────────────────────────────────────────────────────
-- slide_count should equal max_slide_number for every module below — if
-- any row shows them different, that module still has a gap.
select
  cm.module_number,
  cm.title->>'en' as module_title,
  count(*) as slide_count,
  max(ms.slide_number) as max_slide_number
from module_slides ms
join course_modules cm on cm.id = ms.module_id
where ms.course_id = 'b8e6a6f7-5019-425f-8f27-d5477b78588a'
group by cm.module_number, cm.title
order by cm.module_number;
