// src/app/courses/[slug]/certificate/page.tsx

import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import CertificateClient from '@/components/courses/CertificateClient'
import type { Profile, Course } from '@/lib/types/database'

type Lang = 'en' | 'es'

/**
 * Tipagem LOCAL do enrollment exatamente como vem do SELECT abaixo.
 * Não depende do CourseEnrollment global (que está divergente do schema real).
 */
type EnrollmentRow = {
  id: string
  final_exam_passed: boolean
  final_exam_best_score: number | null
  certificate_issued: boolean
  certificate_issued_at: string | null
  completed_at: string | null
}

export default async function CertificatePage({
  params,
}: {
  params: { slug: string }
}) {
  const { slug } = params
  const supabase = createClient()

  // -----------------------------
  // AUTH
  // -----------------------------
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    redirect(`/auth?tab=signin&redirectTo=/courses/${encodeURIComponent(slug)}/certificate`)
  }

  // -----------------------------
  // COURSE (tipado)
  // -----------------------------
  const { data: course } = await supabase
    .from('courses')
    .select('id, slug, title')
    .eq('slug', slug)
    .single<Pick<Course, 'id' | 'slug' | 'title'>>()

  if (!course) {
    redirect('/courses')
  }

  // (segurança extra) course.id pode ser number em alguns schemas
  const courseId = String((course as any).id)

  // -----------------------------
  // ENROLLMENT (tipagem local)
  // -----------------------------
  const { data: enrollment } = await supabase
    .from('course_enrollments')
    .select(
      'id, final_exam_passed, final_exam_best_score, certificate_issued, certificate_issued_at, completed_at'
    )
    .eq('user_id', user.id)
    .eq('course_id', courseId)
    .single<EnrollmentRow>()

  if (!enrollment || !enrollment.final_exam_passed) {
    redirect(`/courses/${encodeURIComponent(slug)}`)
  }

  // -----------------------------
  // PROFILE (tipado)
  // -----------------------------
  const { data: profile } = await supabase
    .from('profiles')
    .select('first_name, last_name, email, preferred_language')
    .eq('id', user.id)
    .single<Pick<Profile, 'first_name' | 'last_name' | 'email' | 'preferred_language'>>()

  const language: Lang = profile?.preferred_language || 'en'

  const fullName =
    [profile?.first_name, profile?.last_name].filter(Boolean).join(' ') ||
    'Participant'

  const completionDate =
    enrollment.completed_at ||
    enrollment.certificate_issued_at ||
    new Date().toISOString()

  // Número determinístico baseado no enrollment id
  const certNumber = `ICMS-${String(enrollment.id).substring(0, 8).toUpperCase()}`

  // -----------------------------
  // RENDER
  // -----------------------------
  return (
    <CertificateClient
      courseTitle={course.title}
      courseSlug={course.slug}
      fullName={fullName}
      completionDate={completionDate}
      score={enrollment.final_exam_best_score ?? 0}
      certNumber={certNumber}
      language={language}
    />
  )
}
