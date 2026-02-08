// src/lib/actions/finalExam.ts
'use server';

import { createClient } from '@/lib/supabase/server';
import type { FinalExamResult, FinalExamQuestionResult } from '@/lib/types/finalExam';

const PASSING_SCORE = 70;
const MAX_ATTEMPTS = 3;

export async function submitFinalExam(
  courseId: string,
  enrollmentId: string,
  answers: Record<string, string> // { questionId: selectedOptionId }
): Promise<{ result?: FinalExamResult; error?: string }> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) return { error: 'Not authenticated' };

  // ── 1. Validate enrollment ──────────────────────────────────────────────
  const { data: enrollment } = await supabase
    .from('course_enrollments')
    .select('id, final_exam_unlocked, final_exam_passed, final_exam_attempts, final_exam_best_score')
    .eq('id', enrollmentId)
    .eq('user_id', user.id)
    .single();

  if (!enrollment) return { error: 'Enrollment not found' };
  if (!enrollment.final_exam_unlocked) return { error: 'Final exam not yet unlocked. Complete all module quizzes first.' };
  if (enrollment.final_exam_passed) return { error: 'You have already passed the final exam.' };

  const attemptsTaken = enrollment.final_exam_attempts || 0;
  if (attemptsTaken >= MAX_ATTEMPTS) return { error: `Maximum attempts (${MAX_ATTEMPTS}) reached.` };

  // ── 2. Fetch questions with correct answers (server only) ───────────────
  const { data: questions, error: qErr } = await supabase
    .from('final_exam_questions')
    .select('*')
    .eq('course_id', courseId)
    .order('question_number');

  if (qErr || !questions?.length) return { error: 'Failed to load exam questions.' };

  // ── 3. Grade ────────────────────────────────────────────────────────────
  let earnedPoints = 0;
  let totalPoints = 0;

  const questionResults: FinalExamQuestionResult[] = questions.map((q) => {
    const selected = answers[q.id] || null;
    const isCorrect = selected === q.correct_answer;
    if (isCorrect) earnedPoints += q.points;
    totalPoints += q.points;

    return {
      question_id: q.id,
      question_number: q.question_number,
      selected_answer: selected,
      correct_answer: q.correct_answer,
      is_correct: isCorrect,
      explanation: q.explanation || { en: '', es: '' },
      points: q.points,
    };
  });

  const score = totalPoints > 0 ? Math.round((earnedPoints / totalPoints) * 100) : 0;
  const passed = score >= PASSING_SCORE;
  const newAttemptNumber = attemptsTaken + 1;

  // ── 4. Save attempt ─────────────────────────────────────────────────────
  const { data: attempt, error: attemptErr } = await supabase
    .from('user_final_exam_attempts')
    .insert({
      user_id: user.id,
      course_id: courseId,
      enrollment_id: enrollmentId,
      attempt_number: newAttemptNumber,
      answers: Object.entries(answers).map(([qId, ans]) => ({
        question_id: qId,
        selected: ans,
      })),
      score,
      total_points: totalPoints,
      earned_points: earnedPoints,
      passed,
    })
    .select('id')
    .single();

  if (attemptErr) return { error: 'Failed to save attempt: ' + attemptErr.message };

  // ── 5. Update enrollment ────────────────────────────────────────────────
  const bestScore = Math.max(score, enrollment.final_exam_best_score || 0);

  const enrollUpdate: Record<string, any> = {
    final_exam_attempts: newAttemptNumber,
    final_exam_best_score: bestScore,
    last_accessed_at: new Date().toISOString(),
  };

  if (passed) {
    enrollUpdate.final_exam_passed = true;
    enrollUpdate.status = 'completed';
    enrollUpdate.completed_at = new Date().toISOString();
    enrollUpdate.progress_percentage = 100;
    enrollUpdate.certificate_issued = true;
    enrollUpdate.certificate_issued_at = new Date().toISOString();
  }

  await supabase
    .from('course_enrollments')
    .update(enrollUpdate)
    .eq('id', enrollmentId);

  // ── 6. Return result ────────────────────────────────────────────────────
  return {
    result: {
      attempt_id: attempt.id,
      attempt_number: newAttemptNumber,
      score,
      total_points: totalPoints,
      earned_points: earnedPoints,
      passed,
      passing_score: PASSING_SCORE,
      questions: questionResults,
      certificate_unlocked: passed,
    },
  };
}
