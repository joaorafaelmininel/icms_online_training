// src/app/courses/[slug]/final-exam/page.tsx

import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import FinalExamClient from '@/components/courses/FinalExamClient'
import type { Course, Profile } from '@/lib/types/database'
import type { FinalExamClientQuestion } from '@/lib/types/finalExam'

type Lang = 'en' | 'es'

/**
 * Tipagem LOCAL do enrollment exatamente como vem do SELECT abaixo.
 * Não depende do Database tipado do Supabase (evita `never`).
 */
type EnrollmentFinalExamRow = {
  id: string
  final_exam_unlocked: boolean
  final_exam_passed: boolean
  final_exam_best_score: number | null
  final_exam_attempts: number | null
  certificate_issued: boolean
}

export default async function FinalExamPage({
  params,
}: {
  params: { slug: string }
}) {
  const { slug } = params
  const supabase = createClient()

  /* ------------------------------------------------------------------
   * AUTH
   * ------------------------------------------------------------------ */
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    redirect(`/auth?tab=signin&redirectTo=/courses/${encodeURIComponent(slug)}/final-exam`)
  }

  /* ------------------------------------------------------------------
   * COURSE (TIPADO)
   * ------------------------------------------------------------------ */
  const { data: course } = await supabase
    .from('courses')
    .select('id, slug, title')
    .eq('slug', slug)
    .single<Pick<Course, 'id' | 'slug' | 'title'>>()

  if (!course) {
    redirect('/courses')
  }

  // Segurança extra: alguns schemas retornam id numérico
  const courseId = String((course as any).id)

  /* ------------------------------------------------------------------
   * ENROLLMENT (TIPAGEM LOCAL)
   * ------------------------------------------------------------------ */
  const { data: enrollment } = await supabase
    .from('course_enrollments')
    .select(
      'id, final_exam_unlocked, final_exam_passed, final_exam_best_score, final_exam_attempts, certificate_issued'
    )
    .eq('user_id', user.id)
    .eq('course_id', courseId)
    .single<EnrollmentFinalExamRow>()

  if (!enrollment) {
    redirect(`/courses/${slug}`)
  }

  /* ------------------------------------------------------------------
   * CHECK UNLOCK
   * ------------------------------------------------------------------ */
  let isUnlocked = enrollment.final_exam_unlocked === true

  if (!isUnlocked) {
    // Busca módulos do curso que possuem quiz
    const { data: allModules } = await supabase
      .from('course_modules')
      .select('id, has_quiz')
      .eq('course_id', courseId)

    const modulesWithQuiz = (allModules || []).filter((m: any) => m.has_quiz)

    if (modulesWithQuiz.length > 0) {
      const { data: moduleProgress } = await supabase
        .from('user_module_progress')
        .select('module_id, quiz_passed')
        .eq('user_id', user.id)
        .in(
          'module_id',
          modulesWithQuiz.map((m: any) => m.id)
        )

      const passedIds = new Set(
        (moduleProgress || [])
          .filter((p: any) => p.quiz_passed)
          .map((p: any) => p.module_id)
      )

      const allPassed = modulesWithQuiz.every((m: any) =>
        passedIds.has(m.id)
      )

      if (allPassed) {
        // ⚠️ UPDATE COM CAST LOCAL (evita `never` do Supabase)
        await (supabase as any)
          .from('course_enrollments')
          .update({ final_exam_unlocked: true })
          .eq('id', enrollment.id)

        isUnlocked = true
      }
    }
  }

  if (!isUnlocked) {
    redirect(`/courses/${slug}`)
  }

  /* ------------------------------------------------------------------
   * LANGUAGE
   * ------------------------------------------------------------------ */
  const { data: profile } = await supabase
    .from('profiles')
    .select('preferred_language')
    .eq('id', user.id)
    .single<Pick<Profile, 'preferred_language'>>()

  const language: Lang = profile?.preferred_language || 'en'

  /* ------------------------------------------------------------------
   * QUESTIONS (CLIENT SAFE — SEM RESPOSTA CORRETA)
   * ------------------------------------------------------------------ */
  const { data: rawQ } = await supabase
    .from('final_exam_questions')
    .select('id, question_number, question_text, options, points, source_module')
    .eq('course_id', courseId)
    .order('question_number')

  const questions: FinalExamClientQuestion[] = (rawQ || []).map((q: any) => ({
    id: q.id,
    question_number: q.question_number,
    question_text: q.question_text,
    options: q.options,
    points: q.points,
    source_module: q.source_module,
  }))

  /* ------------------------------------------------------------------
   * PREVIOUS ATTEMPTS
   * ------------------------------------------------------------------ */
  const { data: prevAttempts } = await supabase
    .from('user_final_exam_attempts')
    .select('attempt_number, score, passed, completed_at')
    .eq('user_id', user.id)
    .eq('course_id', courseId)
    .order('attempt_number', { ascending: false })
    .limit(10)

  const attemptsTaken = enrollment.final_exam_attempts || 0
  const maxAttempts = 3
  const alreadyPassed = enrollment.final_exam_passed || false
  const canAttempt = !alreadyPassed && attemptsTaken < maxAttempts

  /* ------------------------------------------------------------------
   * RENDER
   * ------------------------------------------------------------------ */
  return (
    <FinalExamClient
      course={{ id: course.id, slug: course.slug, title: course.title }}
      enrollmentId={enrollment.id}
      questions={questions}
      alreadyPassed={alreadyPassed}
      bestScore={enrollment.final_exam_best_score}
      attemptsTaken={attemptsTaken}
      attemptsRemaining={maxAttempts - attemptsTaken}
      maxAttempts={maxAttempts}
      canAttempt={canAttempt}
      certificateIssued={enrollment.certificate_issued}
      previousAttempts={(prevAttempts || []) as any}
      language={language}
    />
  )
}
