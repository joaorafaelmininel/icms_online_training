// src/lib/actions/slides.ts
'use server';

import { createClient } from '@/lib/supabase/server';
import { recalculateEnrollmentProgress } from './progress';

/**
 * Marks a slide as viewed and updates module progress accordingly.
 */
export async function markSlideViewed(
  moduleId: string,
  courseId: string,
  enrollmentId: string,
  slideNumber: number,
  totalSlides: number
) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) return { error: 'Not authenticated' };

  // Unconditional entry log — the only way to confirm from server-side
  // logs whether this action is even being invoked for a given slide,
  // since a client-side error before/inside the fire-and-forget
  // startTransition call would otherwise leave zero trace anywhere.
  console.log(
    `[markSlideViewed] called user=${user.id} module=${moduleId} slide=${slideNumber} total=${totalSlides} enrollment=${enrollmentId}`
  );

  // 1. Upsert slide as completed
  //
  // Postgrest returns { data: [], error: null } — not an error — when a
  // write matches zero rows, which is exactly what a Row Level Security
  // policy silently blocking the write looks like: the caller sees a
  // "success" with nothing actually persisted. .select() forces the
  // affected row(s) back so a silent RLS block can be told apart from a
  // real success instead of disappearing completely.
  const { data: slideUpsertData, error: slideErr } = await supabase
    .from('user_slide_progress')
    .upsert(
      {
        user_id: user.id,
        module_id: moduleId,
        slide_number: slideNumber,
        is_completed: true,
        completed_at: new Date().toISOString(),
      },
      { onConflict: 'user_id,module_id,slide_number' }
    )
    .select('id');

  if (slideErr) return { error: slideErr.message };

  if (!slideUpsertData || slideUpsertData.length === 0) {
    console.error(
      `[markSlideViewed] user_slide_progress upsert affected 0 rows (likely blocked by RLS) — user=${user.id}, module=${moduleId}, slide=${slideNumber}`
    );
    return { error: 'user_slide_progress write did not persist (likely blocked by row-level security)' };
  }

  // 2. Fetch all completed slides for this module
  const { data: viewedRows } = await supabase
    .from('user_slide_progress')
    .select('slide_number')
    .eq('user_id', user.id)
    .eq('module_id', moduleId)
    .eq('is_completed', true);

  // A slide can be deleted/renumbered by the admin after a student already
  // viewed it, leaving orphaned rows here for slide numbers that no longer
  // exist in the module — counting those inflates "viewed" past the
  // current total (e.g. 12/7 = 171%). Only count numbers that still exist.
  const { data: currentSlideRows } = await supabase
    .from('module_slides')
    .select('slide_number')
    .eq('module_id', moduleId);

  const currentSlideNumbers = new Set(
    (currentSlideRows || []).map((r: { slide_number: number }) => r.slide_number)
  );

  const viewedNumbers = (viewedRows || [])
    .map((r: { slide_number: number }) => r.slide_number)
    .filter((n: number) => currentSlideNumbers.has(n));
  const allViewed = viewedNumbers.length >= totalSlides;

  // 3. Upsert module progress
  const { data: existing } = await supabase
    .from('user_module_progress')
    .select('id')
    .eq('user_id', user.id)
    .eq('module_id', moduleId)
    .maybeSingle();

  if (existing) {
    const { data: moduleProgressData, error: moduleProgressErr } = await supabase
      .from('user_module_progress')
      .update({
        current_slide: slideNumber,
        completed_slides: viewedNumbers,
        is_completed: allViewed,
        completed_at: allViewed ? new Date().toISOString() : null,
        last_accessed_at: new Date().toISOString(),
      })
      .eq('id', existing.id)
      .select('id');

    if (moduleProgressErr) {
      console.error(
        `[markSlideViewed] failed to update user_module_progress (user=${user.id}, module=${moduleId}, slide=${slideNumber}):`,
        moduleProgressErr
      );
      return { error: moduleProgressErr.message };
    }

    if (!moduleProgressData || moduleProgressData.length === 0) {
      console.error(
        `[markSlideViewed] user_module_progress update affected 0 rows (likely blocked by RLS) — user=${user.id}, module=${moduleId}, slide=${slideNumber}`
      );
      return { error: 'user_module_progress write did not persist (likely blocked by row-level security)' };
    }
  } else {
    const { data: moduleProgressData, error: moduleProgressErr } = await supabase
      .from('user_module_progress')
      .insert({
        user_id: user.id,
        course_id: courseId,
        module_id: moduleId,
        enrollment_id: enrollmentId,
        current_slide: slideNumber,
        completed_slides: viewedNumbers,
        total_slides: totalSlides,
        is_completed: allViewed,
        completed_at: allViewed ? new Date().toISOString() : null,
        last_accessed_at: new Date().toISOString(),
        quiz_passed: false,
        quiz_attempts_count: 0,
      })
      .select('id');

    if (moduleProgressErr) {
      console.error(
        `[markSlideViewed] failed to insert user_module_progress (user=${user.id}, module=${moduleId}, slide=${slideNumber}):`,
        moduleProgressErr
      );
      return { error: moduleProgressErr.message };
    }

    if (!moduleProgressData || moduleProgressData.length === 0) {
      console.error(
        `[markSlideViewed] user_module_progress insert affected 0 rows (likely blocked by RLS) — user=${user.id}, module=${moduleId}, slide=${slideNumber}`
      );
      return { error: 'user_module_progress write did not persist (likely blocked by row-level security)' };
    }
  }

  // 4. Update enrollment status to in_progress if still enrolled
  const { data: enrollment } = await supabase
    .from('course_enrollments')
    .select('status')
    .eq('id', enrollmentId)
    .single();

  if (enrollment?.status === 'enrolled') {
    const { data: enrollmentData, error: enrollmentErr } = await supabase
      .from('course_enrollments')
      .update({
        status: 'in_progress',
        started_at: new Date().toISOString(),
        last_accessed_at: new Date().toISOString(),
      })
      .eq('id', enrollmentId)
      .select('id');

    if (enrollmentErr) {
      console.error(
        `[markSlideViewed] failed to update course_enrollments (user=${user.id}, enrollment=${enrollmentId}):`,
        enrollmentErr
      );
    } else if (!enrollmentData || enrollmentData.length === 0) {
      console.error(
        `[markSlideViewed] course_enrollments update affected 0 rows (likely blocked by RLS) — user=${user.id}, enrollment=${enrollmentId}`
      );
    }
  } else {
    const { data: enrollmentData, error: enrollmentErr } = await supabase
      .from('course_enrollments')
      .update({ last_accessed_at: new Date().toISOString() })
      .eq('id', enrollmentId)
      .select('id');

    if (enrollmentErr) {
      console.error(
        `[markSlideViewed] failed to update course_enrollments.last_accessed_at (user=${user.id}, enrollment=${enrollmentId}):`,
        enrollmentErr
      );
    } else if (!enrollmentData || enrollmentData.length === 0) {
      console.error(
        `[markSlideViewed] course_enrollments.last_accessed_at update affected 0 rows (likely blocked by RLS) — user=${user.id}, enrollment=${enrollmentId}`
      );
    }
  }

  // Keep the enrollment-level percentage/current-module in sync — a
  // student who has read every slide but not yet taken the quiz should
  // still see accurate (if not-yet-100%) progress on the dashboard.
  await recalculateEnrollmentProgress(supabase, user.id, courseId);

  console.log(
    `[markSlideViewed] done user=${user.id} module=${moduleId} slide=${slideNumber} -> current_slide saved as ${slideNumber}`
  );

  return { viewedNumbers, allViewed };
}
