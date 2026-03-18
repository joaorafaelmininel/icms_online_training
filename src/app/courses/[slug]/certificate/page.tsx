// src/app/courses/[slug]/certificate/page.tsx

import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { getCurrentLanguage } from '@/lib/i18n/language'
import CertificateClient from '@/components/courses/CertificateClient'
import type { Profile, Course } from '@/lib/types/database'

// Force dynamic rendering — prevents Next.js 14 from caching searchParams
export const dynamic = 'force-dynamic'

type Lang = 'en' | 'es'

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
  searchParams,
}: {
  params: { slug: string }
  searchParams: { lang?: string; from?: string }
}) {
  const { slug } = params
  const supabase = await createClient()

  // AUTH
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) {
    redirect(`/auth?tab=signin&redirectTo=/courses/${encodeURIComponent(slug)}/certificate`)
  }

  // COURSE
  const { data: course } = await supabase
    .from('courses')
    .select('id, slug, title')
    .eq('slug', slug)
    .single<Pick<Course, 'id' | 'slug' | 'title'>>()

  if (!course) redirect('/courses')

  const courseId = String((course as any).id)

  // ENROLLMENT
  const { data: enrollment } = await supabase
    .from('course_enrollments')
    .select('id, final_exam_passed, final_exam_best_score, certificate_issued, certificate_issued_at, completed_at')
    .eq('user_id', user.id)
    .eq('course_id', courseId)
    .single<EnrollmentRow>()

  if (!enrollment || !enrollment.final_exam_passed) {
    redirect(`/courses/${encodeURIComponent(slug)}`)
  }

  // PROFILE
  const { data: profile } = await supabase
    .from('profiles')
    .select('first_name, last_name, email, preferred_language')
    .eq('id', user.id)
    .single<Pick<Profile, 'first_name' | 'last_name' | 'email' | 'preferred_language'>>()

  // Language resolution — three sources in priority order:
  // 1. ?lang= query param (explicit, set by certificates/page.tsx from the cookie)
  // 2. cookie via getCurrentLanguage() (reflects what the navbar switcher set)
  // 3. profile.preferred_language (DB fallback)
  // 4. 'en' hard fallback
  const cookieLang = await getCurrentLanguage()
  const language: Lang =
    searchParams.lang === 'es' ? 'es'
    : searchParams.lang === 'en' ? 'en'
    : cookieLang === 'es' ? 'es'
    : (profile?.preferred_language as Lang) ?? 'en'

  // Whether the user came from /certificates
  const fromCertificates = searchParams.from === 'certificates'

  // NAME
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

  const certNumber   = `ICMS-${String(enrollment.id).substring(0, 8).toUpperCase()}`
  const signatureUrl = '/signature-stampa.png'

  return (
    <CertificateClient
      courseTitle={course.title}
      courseSlug={course.slug}
      fullName={fullName}
      completionDate={completionDate}
      score={enrollment.final_exam_best_score ?? 0}
      certNumber={certNumber}
      language={language}
      signatureUrl={signatureUrl}
      fromCertificates={fromCertificates}
    />
  )
}
