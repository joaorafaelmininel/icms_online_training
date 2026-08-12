// src/lib/certificate/data.ts
// Shared server-side lookup for certificate data — used by both the interactive
// certificate page and the PDF-generation API route, so eligibility rules and
// field derivation never drift between the two.

import type { SupabaseClient, User } from '@supabase/supabase-js'
import type { Profile } from '@/lib/types/database'
import type { Course } from '@/lib/types/courses'
import type { Lang } from './text'

type EnrollmentRow = {
  id: string
  final_exam_passed: boolean
  final_exam_best_score: number | null
  certificate_issued: boolean
  certificate_issued_at: string | null
  completed_at: string | null
}

export interface CertificateData {
  courseTitle:    { en: string; es: string }
  courseSlug:     string
  fullName:       string
  completionDate: string
  certNumber:     string
  language:       Lang
  signatureUrl:   string
  score:          number
}

/**
 * Returns the certificate data for `user` in course `slug`, or null if the
 * course doesn't exist or the user hasn't passed the final exam (not eligible).
 */
export async function getCertificateData(
  supabase: SupabaseClient,
  user: User,
  slug: string,
  langOverride?: string
): Promise<CertificateData | null> {
  const { data: course } = await supabase
    .from('courses')
    .select('id, slug, title')
    .eq('slug', slug)
    .single<Pick<Course, 'id' | 'slug' | 'title'>>()

  if (!course) return null

  const courseId = String((course as any).id)

  const { data: enrollment } = await supabase
    .from('course_enrollments')
    .select('id, final_exam_passed, final_exam_best_score, certificate_issued, certificate_issued_at, completed_at')
    .eq('user_id', user.id)
    .eq('course_id', courseId)
    .single<EnrollmentRow>()

  if (!enrollment || !enrollment.final_exam_passed) return null

  const { data: profile } = await supabase
    .from('profiles')
    .select('first_name, last_name, email, preferred_language')
    .eq('id', user.id)
    .single<Pick<Profile, 'first_name' | 'last_name' | 'email' | 'preferred_language'>>()

  const language: Lang =
    langOverride === 'es' ? 'es'
    : langOverride === 'en' ? 'en'
    : (profile?.preferred_language as Lang) ?? 'en'

  const firstName = profile?.first_name || (user.user_metadata?.first_name as string) || ''
  const lastName  = profile?.last_name  || (user.user_metadata?.last_name  as string) || ''
  const fullName  =
    [firstName, lastName].filter(Boolean).join(' ') ||
    (user.user_metadata?.full_name as string)        ||
    user.email?.split('@')[0]                        ||
    'Participant'

  const completionDate =
    enrollment.completed_at          ||
    enrollment.certificate_issued_at ||
    new Date().toISOString()

  return {
    courseTitle:    course.title,
    courseSlug:     course.slug,
    fullName,
    completionDate,
    certNumber:     `ICMS-${String(enrollment.id).substring(0, 8).toUpperCase()}`,
    language,
    signatureUrl:   '/signature-stampa.png',
    score:          enrollment.final_exam_best_score ?? 0,
  }
}
