// src/app/courses/[slug]/modules/[number]/quiz/page.tsx
import { notFound, redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { getCurrentLanguage } from '@/lib/i18n/language'
import QuizClient from '@/components/modules/QuizClient'
import type { QuizClientQuestion } from '@/lib/types/quiz'

interface Props {
  params: { slug: string; number: string }
}

type CourseRow = {
  id: string
  slug: string
  title: any
}

type ModuleRow = {
  id: string
  course_id: string
  module_number: number
  title: any
  has_quiz: boolean | null
  quiz_required: boolean | null
  quiz_passing_score: number | null
  quiz_max_attempts: number | null
  total_slides: number | null
}

type EnrollmentRow = {
  id: string
}

type ModuleProgressRow = {
  is_completed: boolean | null
  quiz_passed: boolean | null
  quiz_best_score: number | null
  quiz_attempts_count: number | null
  completed_slides: string[] | null
}

type ModuleNumberRow = {
  module_number: number
}

export const dynamic = 'force-dynamic'

export async function generateMetadata({ params }: Props) {
  const { number } = params
  return { title: `Module ${number} Quiz — ICMS Learning Platform` }
}

export default async function QuizPage({ params }: Props) {
  const { slug, number } = params
  const moduleNumber = parseInt(number, 10)
  const supabase = createClient()
  const language = (await getCurrentLanguage()) as 'en' | 'es'

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    redirect(`/auth?redirectTo=/courses/${slug}/modules/${number}/quiz`)
  }

  const courseResult = await supabase
    .from('courses')
    .select('id, slug, title')
    .eq('slug', slug)
    .single()

  const course = courseResult.data as CourseRow | null

  if (!course) {
    notFound()
  }

  const modResult = await supabase
    .from('course_modules')
    .select(
      'id, course_id, module_number, title, has_quiz, quiz_required, quiz_passing_score, quiz_max_attempts, total_slides'
    )
    .eq('course_id', course.id)
    .eq('module_number', moduleNumber)
    .single()

  const mod = modResult.data as ModuleRow | null

  if (!mod || !mod.has_quiz) {
    notFound()
  }

  const enrollmentResult = await supabase
    .from('course_enrollments')
    .select('id')
    .eq('user_id', user.id)
    .eq('course_id', course.id)
    .maybeSingle()

  const enrollment = enrollmentResult.data as EnrollmentRow | null

  if (!enrollment) {
    redirect(`/courses/${slug}`)
  }

  const moduleProgressResult = await supabase
    .from('user_module_progress')
    .select(
      'is_completed, quiz_passed, quiz_best_score, quiz_attempts_count, completed_slides'
    )
    .eq('user_id', user.id)
    .eq('module_id', mod.id)
    .maybeSingle()

  const moduleProgress = moduleProgressResult.data as ModuleProgressRow | null

  const completedSlides = moduleProgress?.completed_slides?.length ?? 0
  const slidesComplete = completedSlides >= (mod.total_slides ?? 0)

  if (!slidesComplete) {
    redirect(`/courses/${slug}/modules/${number}`)
  }

  const alreadyPassed = moduleProgress?.quiz_passed ?? false
  const attemptsTaken = moduleProgress?.quiz_attempts_count ?? 0
  const maxAttempts = mod.quiz_max_attempts
  const attemptsRemaining = maxAttempts ? maxAttempts - attemptsTaken : null
  const canAttempt =
    !alreadyPassed && (attemptsRemaining === null || attemptsRemaining > 0)

  const { data: rawQuestions } = await supabase
    .from('module_quiz_questions')
    .select('id, question_number, question_text, question_type, options, points')
    .eq('module_id', mod.id)
    .order('question_number', { ascending: true })

  const questions: QuizClientQuestion[] = (rawQuestions || []).map((q: any) => ({
    id: q.id,
    question_number: q.question_number,
    question_text: q.question_text,
    question_type: q.question_type,
    options: q.options,
    points: q.points,
  }))

  const { data: previousAttempts } = await supabase
    .from('user_quiz_attempts')
    .select('attempt_number, score, passed, completed_at')
    .eq('user_id', user.id)
    .eq('module_id', mod.id)
    .order('attempt_number', { ascending: false })
    .limit(10)

  const allModulesResult = await supabase
    .from('course_modules')
    .select('module_number')
    .eq('course_id', course.id)
    .order('module_number', { ascending: false })
    .limit(1)

  const allModules = allModulesResult.data as ModuleNumberRow[] | null

  const maxModuleNumber = allModules?.[0]?.module_number ?? 0
  const isLastModule = moduleNumber >= maxModuleNumber

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
      bestScore={moduleProgress?.quiz_best_score ?? null}
      attemptsTaken={attemptsTaken}
      attemptsRemaining={attemptsRemaining}
      canAttempt={canAttempt}
      previousAttempts={(previousAttempts || []) as any}
      isLastModule={isLastModule}
      language={language}
    />
  )
}