// src/lib/actions/quiz.ts
'use server';

import { createClient } from '@/lib/supabase/server';
import type { QuizResult, QuestionResult } from '@/lib/types/quiz';

interface SubmitQuizInput {
  moduleId: string;
  courseId: string;
  answers: Record<string, string>;  // {"1": "a", "2": "c", ...}
  timeSpentSeconds: number;
}

export async function submitQuiz(input: SubmitQuizInput): Promise<{
  success: boolean;
  result?: QuizResult;
  error?: string;
}> {
  try {
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) return { success: false, error: 'Not authenticated' };

    // 1. Get module settings
    const { data: mod } = await supabase
      .from('course_modules')
      .select('id, has_quiz, quiz_passing_score, quiz_max_attempts')
      .eq('id', input.moduleId)
      .single();

    if (!mod || !mod.has_quiz) {
      return { success: false, error: 'Quiz not available for this module' };
    }

    // 2. Check attempt count
    const { data: previousAttempts } = await supabase
      .from('user_quiz_attempts')
      .select('id')
      .eq('user_id', user.id)
      .eq('module_id', input.moduleId);

    const attemptCount = previousAttempts?.length || 0;

    if (mod.quiz_max_attempts && attemptCount >= mod.quiz_max_attempts) {
      return { success: false, error: 'Maximum attempts reached' };
    }

    // 3. Check if already passed
    const { data: moduleProgress } = await supabase
      .from('user_module_progress')
      .select('quiz_passed')
      .eq('user_id', user.id)
      .eq('module_id', input.moduleId)
      .maybeSingle();

    if (moduleProgress?.quiz_passed) {
      return { success: false, error: 'Quiz already passed' };
    }

    // 4. Fetch questions with correct answers
    const { data: questions } = await supabase
      .from('module_quiz_questions')
      .select('*')
      .eq('module_id', input.moduleId)
      .order('question_number', { ascending: true });

    if (!questions || questions.length === 0) {
      return { success: false, error: 'No questions found' };
    }

    // 5. Grade
    let earnedPoints = 0;
    let totalPoints = 0;
    const results: QuestionResult[] = [];

    for (const q of questions) {
      totalPoints += q.points;
      const selected = input.answers[String(q.question_number)] || '';
      const isCorrect = selected === q.correct_answer;

      if (isCorrect) earnedPoints += q.points;

      results.push({
        questionNumber: q.question_number,
        selectedAnswer: selected,
        correctAnswer: q.correct_answer,
        isCorrect,
        explanation: q.explanation,
      });
    }

    const score = totalPoints > 0 ? Math.round((earnedPoints / totalPoints) * 100) : 0;
    const passed = score >= (mod.quiz_passing_score || 70);
    const newAttemptNumber = attemptCount + 1;
    const attemptsRemaining = mod.quiz_max_attempts
      ? mod.quiz_max_attempts - newAttemptNumber
      : null;

    // 6. Save attempt
    await supabase.from('user_quiz_attempts').insert({
      user_id: user.id,
      module_id: input.moduleId,
      course_id: input.courseId,
      attempt_number: newAttemptNumber,
      answers: input.answers,
      score,
      total_points: totalPoints,
      earned_points: earnedPoints,
      passed,
      time_spent_seconds: input.timeSpentSeconds,
    });

    // 7. Update module progress
    const updateData: Record<string, any> = {
      quiz_attempts_count: newAttemptNumber,
      updated_at: new Date().toISOString(),
    };

    if (passed) {
      updateData.quiz_passed = true;
      updateData.quiz_best_score = score;
      updateData.is_completed = true;
      updateData.completed_at = new Date().toISOString();
    } else {
      // Update best score if higher
      if (moduleProgress?.quiz_best_score == null || score > (moduleProgress as any).quiz_best_score) {
        updateData.quiz_best_score = score;
      }
    }

    const { data: existingProgress } = await supabase
      .from('user_module_progress')
      .select('id, quiz_best_score')
      .eq('user_id', user.id)
      .eq('module_id', input.moduleId)
      .maybeSingle();

    if (existingProgress) {
      // Only update best score if new score is higher
      if (!passed && existingProgress.quiz_best_score != null && score <= existingProgress.quiz_best_score) {
        delete updateData.quiz_best_score;
      }
      await supabase
        .from('user_module_progress')
        .update(updateData)
        .eq('id', existingProgress.id);
    }

    // 8. If passed, update enrollment progress
    if (passed) {
      // Count total completed modules
      const { data: allProgress } = await supabase
        .from('user_module_progress')
        .select('is_completed')
        .eq('user_id', user.id)
        .eq('course_id', input.courseId);

      const completedCount = (allProgress || []).filter((p: any) => p.is_completed).length;

      const { data: totalModules } = await supabase
        .from('course_modules')
        .select('id')
        .eq('course_id', input.courseId);

      const totalCount = totalModules?.length || 0;
      const progressPct = totalCount > 0 ? Math.round((completedCount / totalCount) * 100) : 0;
      const allComplete = completedCount >= totalCount && totalCount > 0;

      await supabase
        .from('course_enrollments')
        .update({
          progress_percentage: progressPct,
          current_module_number: completedCount + 1,
          final_exam_unlocked: allComplete,
          status: allComplete ? 'completed' : 'in_progress',
          updated_at: new Date().toISOString(),
        })
        .eq('user_id', user.id)
        .eq('course_id', input.courseId);
    }

    return {
      success: true,
      result: {
        passed,
        score,
        earnedPoints,
        totalPoints,
        correctAnswers: results.filter((r) => r.isCorrect).length,
        totalQuestions: questions.length,
        attemptNumber: newAttemptNumber,
        attemptsRemaining,
        results,
      },
    };
  } catch (error) {
    console.error('Quiz submission error:', error);
    return { success: false, error: 'An unexpected error occurred' };
  }
}
