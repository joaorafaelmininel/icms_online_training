// src/lib/actions/progress.ts
// Single source of truth for "is this module actually done" and for keeping
// course_enrollments' aggregate fields (progress_percentage,
// current_module_number, final_exam_unlocked, status) in sync with it.
//
// A module only counts as done once its slides are viewed AND its quiz is
// passed (when one is required) — never from slide-viewing alone. Both
// markSlideViewed and submitQuiz call this after they touch
// user_module_progress, so the dashboard/course-overview percentage never
// goes stale waiting on a quiz attempt that may not happen for a while.
import { createClient } from '@/lib/supabase/server';

type SupabaseClient = Awaited<ReturnType<typeof createClient>>;

export async function recalculateEnrollmentProgress(
  supabase: SupabaseClient,
  userId: string,
  courseId: string
) {
  const { data: modules } = await supabase
    .from('course_modules')
    .select('id, module_number, quiz_required')
    .eq('course_id', courseId)
    .order('module_number', { ascending: true });

  const moduleList = (modules || []) as {
    id: string;
    module_number: number;
    quiz_required: boolean | null;
  }[];

  if (moduleList.length === 0) return;

  const { data: progressRows } = await supabase
    .from('user_module_progress')
    .select('module_id, is_completed, quiz_passed')
    .eq('user_id', userId)
    .eq('course_id', courseId);

  const progressByModule = new Map(
    (progressRows || []).map((p: any) => [p.module_id, p])
  );

  let completedCount = 0;
  let firstIncomplete: number | null = null;

  for (const mod of moduleList) {
    const progress = progressByModule.get(mod.id) as
      | { is_completed: boolean; quiz_passed: boolean }
      | undefined;
    const trueCompleted =
      !!progress?.is_completed && (progress.quiz_passed || !mod.quiz_required);

    if (trueCompleted) {
      completedCount++;
    } else if (firstIncomplete === null) {
      firstIncomplete = mod.module_number;
    }
  }

  const totalCount = moduleList.length;
  const allComplete = completedCount >= totalCount;
  const progressPct = Math.round((completedCount / totalCount) * 100);

  const { data: enrollment } = await supabase
    .from('course_enrollments')
    .select('id, status, final_exam_unlocked')
    .eq('user_id', userId)
    .eq('course_id', courseId)
    .maybeSingle<{ id: string; status: string; final_exam_unlocked: boolean }>();

  if (!enrollment) return;

  await supabase
    .from('course_enrollments')
    .update({
      progress_percentage: progressPct,
      current_module_number: firstIncomplete ?? totalCount,
      final_exam_unlocked: enrollment.final_exam_unlocked || allComplete,
      status: allComplete
        ? 'completed'
        : enrollment.status === 'completed'
          ? 'completed'
          : 'in_progress',
      updated_at: new Date().toISOString(),
    } as never)
    .eq('id', enrollment.id);
}
