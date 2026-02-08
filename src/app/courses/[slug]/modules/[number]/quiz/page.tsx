// src/app/courses/[slug]/modules/[number]/quiz/page.tsx
import { notFound, redirect } from 'next/navigation';
import { createClient } from '@/lib/supabase/server';
import { getCurrentLanguage } from '@/lib/i18n/language';
import QuizClient from '@/components/modules/QuizClient';
import type { QuizClientQuestion } from '@/lib/types/quiz';

interface Props {
  params: Promise<{ slug: string; number: string }>;
}

export async function generateMetadata({ params }: Props) {
  const { slug, number } = await params;
  return { title: `Module ${number} Quiz — ICMS Learning Platform` };
}

export default async function QuizPage({ params }: Props) {
  const { slug, number } = await params;
  const moduleNumber = parseInt(number);
  const supabase = await createClient();
  const language = (await getCurrentLanguage()) as 'en' | 'es';

  // Auth
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect(`/auth?redirectTo=/courses/${slug}/modules/${number}/quiz`);

  // Course
  const { data: course } = await supabase
    .from('courses')
    .select('id, slug, title')
    .eq('slug', slug)
    .single();
  if (!course) notFound();

  // Module
  const { data: mod } = await supabase
    .from('course_modules')
    .select('id, course_id, module_number, title, has_quiz, quiz_required, quiz_passing_score, quiz_max_attempts, total_slides')
    .eq('course_id', course.id)
    .eq('module_number', moduleNumber)
    .single();
  if (!mod || !mod.has_quiz) notFound();

  // Enrollment
  const { data: enrollment } = await supabase
    .from('course_enrollments')
    .select('id')
    .eq('user_id', user.id)
    .eq('course_id', course.id)
    .maybeSingle();
  if (!enrollment) redirect(`/courses/${slug}`);

  // Module progress — check slides are complete
  const { data: moduleProgress } = await supabase
    .from('user_module_progress')
    .select('is_completed, quiz_passed, quiz_best_score, quiz_attempts_count, completed_slides')
    .eq('user_id', user.id)
    .eq('module_id', mod.id)
    .maybeSingle();

  const completedSlides = moduleProgress?.completed_slides?.length || 0;
  const slidesComplete = completedSlides >= mod.total_slides;

  // If slides not complete, redirect back to module
  if (!slidesComplete) {
    redirect(`/courses/${slug}/modules/${number}`);
  }

  // If quiz already passed, still allow review
  const alreadyPassed = moduleProgress?.quiz_passed || false;

  // Check attempts remaining
  const attemptsTaken = moduleProgress?.quiz_attempts_count || 0;
  const maxAttempts = mod.quiz_max_attempts;
  const attemptsRemaining = maxAttempts ? maxAttempts - attemptsTaken : null;
  const canAttempt = !alreadyPassed && (attemptsRemaining === null || attemptsRemaining > 0);

  // Fetch questions (WITHOUT correct_answer — that stays server-side)
  const { data: rawQuestions } = await supabase
    .from('module_quiz_questions')
    .select('id, question_number, question_text, question_type, options, points')
    .eq('module_id', mod.id)
    .order('question_number', { ascending: true });

  const questions: QuizClientQuestion[] = (rawQuestions || []).map((q: any) => ({
    id: q.id,
    question_number: q.question_number,
    question_text: q.question_text,
    question_type: q.question_type,
    options: q.options,
    points: q.points,
  }));

  // Fetch previous attempts for history
  const { data: previousAttempts } = await supabase
    .from('user_quiz_attempts')
    .select('attempt_number, score, passed, completed_at')
    .eq('user_id', user.id)
    .eq('module_id', mod.id)
    .order('attempt_number', { ascending: false })
    .limit(10);

  // Check if this is the last module
  const { data: allModules } = await supabase
    .from('course_modules')
    .select('module_number')
    .eq('course_id', course.id)
    .order('module_number', { ascending: false })
    .limit(1);

  const maxModuleNumber = allModules?.[0]?.module_number || 0;
  const isLastModule = moduleNumber >= maxModuleNumber;

  return (
    <QuizClient
      course={{ id: course.id, slug: course.slug, title: course.title }}
      module={{
        id: mod.id,
        moduleNumber: mod.module_number,
        title: mod.title,
        passingScore: mod.quiz_passing_score || 70,
        maxAttempts: mod.quiz_max_attempts,
      }}
      questions={questions}
      alreadyPassed={alreadyPassed}
      bestScore={moduleProgress?.quiz_best_score || null}
      attemptsTaken={attemptsTaken}
      attemptsRemaining={attemptsRemaining}
      canAttempt={canAttempt}
      previousAttempts={(previousAttempts || []) as any}
      isLastModule={isLastModule}
      language={language}
    />
  );
}
