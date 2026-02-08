// src/lib/actions/slides.ts
'use server';

import { createClient } from '@/lib/supabase/server';

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

  // 1. Upsert slide as completed
  const { error: slideErr } = await supabase
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
    );

  if (slideErr) return { error: slideErr.message };

  // 2. Fetch all completed slides for this module
  const { data: viewedRows } = await supabase
    .from('user_slide_progress')
    .select('slide_number')
    .eq('user_id', user.id)
    .eq('module_id', moduleId)
    .eq('is_completed', true);

  const viewedNumbers = (viewedRows || []).map(
    (r: { slide_number: number }) => r.slide_number
  );
  const allViewed = viewedNumbers.length >= totalSlides;

  // 3. Upsert module progress
  const { data: existing } = await supabase
    .from('user_module_progress')
    .select('id')
    .eq('user_id', user.id)
    .eq('module_id', moduleId)
    .maybeSingle();

  if (existing) {
    await supabase
      .from('user_module_progress')
      .update({
        current_slide: slideNumber,
        completed_slides: viewedNumbers,
        is_completed: allViewed,
        completed_at: allViewed ? new Date().toISOString() : null,
        last_accessed_at: new Date().toISOString(),
      })
      .eq('id', existing.id);
  } else {
    await supabase.from('user_module_progress').insert({
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
    });
  }

  // 4. Update enrollment status to in_progress if still enrolled
  const { data: enrollment } = await supabase
    .from('course_enrollments')
    .select('status')
    .eq('id', enrollmentId)
    .single();

  if (enrollment?.status === 'enrolled') {
    await supabase
      .from('course_enrollments')
      .update({
        status: 'in_progress',
        started_at: new Date().toISOString(),
        last_accessed_at: new Date().toISOString(),
      })
      .eq('id', enrollmentId);
  } else {
    await supabase
      .from('course_enrollments')
      .update({ last_accessed_at: new Date().toISOString() })
      .eq('id', enrollmentId);
  }

  return { viewedNumbers, allViewed };
}
