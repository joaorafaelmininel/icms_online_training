// src/app/certificates/page.tsx

import { redirect } from 'next/navigation'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/server'
import type { Profile } from '@/lib/types/database'

type Lang = 'en' | 'es'

interface LT {
  en: string
  es: string
}

function loc(t: LT | string | null | undefined, l: Lang): string {
  if (!t) return ''
  if (typeof t === 'string') return t
  return t[l] || t.en || ''
}

const i18n: Record<Lang, any> = {
  en: {
    title: 'My Certificates',
    subtitle: 'Certificates earned from completed courses',
    noCerts: 'No certificates yet',
    noCertsDesc: 'Complete a course and pass the final exam to earn your certificate.',
    browseCourses: 'Browse Courses',
    completed: 'Completed',
    score: 'Score',
    viewCertificate: 'View Certificate',
    certNumber: 'Certificate Nº',
    back: 'Back to Dashboard',
  },
  es: {
    title: 'Mis Certificados',
    subtitle: 'Certificados obtenidos de cursos completados',
    noCerts: 'Aún no tienes certificados',
    noCertsDesc: 'Completa un curso y aprueba el examen final para obtener tu certificado.',
    browseCourses: 'Explorar Cursos',
    completed: 'Completado',
    score: 'Puntuación',
    viewCertificate: 'Ver Certificado',
    certNumber: 'Certificado Nº',
    back: 'Volver al Panel',
  },
}

export default async function CertificatesPage() {
  const supabase = createClient()

  /* ------------------------------------------------------------------
   * AUTH
   * ------------------------------------------------------------------ */
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    redirect('/auth?tab=signin&redirectTo=/certificates')
  }

  /* ------------------------------------------------------------------
   * LANGUAGE (PROFILE)
   * ------------------------------------------------------------------ */
  const { data: profile } = await supabase
    .from('profiles')
    .select('preferred_language')
    .eq('id', user.id)
    .single<Pick<Profile, 'preferred_language'>>()

  const language: Lang = profile?.preferred_language || 'en'
  const t = i18n[language]

  /* ------------------------------------------------------------------
   * CERTIFICATES / ENROLLMENTS
   * ------------------------------------------------------------------ */
  const { data: enrollments } = await supabase
    .from('course_enrollments')
    .select(`
      id,
      final_exam_best_score,
      completed_at,
      certificate_issued_at,
      course_id,
      courses (
        id,
        slug,
        title,
        thumbnail_url
      )
    `)
    .eq('user_id', user.id)
    .eq('certificate_issued', true)
    .order('completed_at', { ascending: false })

  const certs = (enrollments || []).map((e: any) => ({
    id: e.id,
    courseSlug: e.courses?.slug || '',
    courseTitle: e.courses?.title || { en: '', es: '' },
    thumbnail: e.courses?.thumbnail_url || null,
    score: e.final_exam_best_score ?? 0,
    completedAt: e.completed_at || e.certificate_issued_at || '',
    certNumber: `ICMS-${String(e.id).substring(0, 8).toUpperCase()}`,
  }))

  /* ------------------------------------------------------------------
   * RENDER
   * ------------------------------------------------------------------ */
  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-50 to-white">
      <div className="mx-auto max-w-4xl px-4 py-10 sm:px-6 sm:py-14">
        {/* Header */}
        <div className="mb-8 flex flex-wrap items-start justify-between gap-4">
          <div>
            <h1 className="text-2xl font-extrabold text-gray-900 sm:text-3xl">
              {t.title}
            </h1>
            <p className="mt-1 text-sm text-gray-500">{t.subtitle}</p>
          </div>

          <Link
            href="/dashboard"
            className="rounded-lg border border-gray-200 bg-white px-5 py-2.5 text-sm font-semibold text-gray-600 transition hover:bg-gray-50"
          >
            ← {t.back}
          </Link>
        </div>

        {certs.length === 0 ? (
          /* EMPTY STATE */
          <div className="rounded-xl border-2 border-dashed border-gray-200 bg-white p-10 text-center">
            <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-gray-100">
              <svg
                className="h-8 w-8 text-gray-300"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M9 12l2 2 4-4M7.835 4.697a3.42 3.42 0 001.946-.806 3.42 3.42 0 014.438 0 3.42 3.42 0 001.946.806 3.42 3.42 0 013.138 3.138 3.42 3.42 0 00.806 1.946 3.42 3.42 0 010 4.438 3.42 3.42 0 00-.806 1.946 3.42 3.42 0 01-3.138 3.138 3.42 3.42 0 00-1.946.806 3.42 3.42 0 01-4.438 0 3.42 3.42 0 00-1.946-.806 3.42 3.42 0 01-3.138-3.138 3.42 3.42 0 00-.806-1.946 3.42 3.42 0 010-4.438 3.42 3.42 0 00.806-1.946 3.42 3.42 0 013.138-3.138z"
                />
              </svg>
            </div>

            <h3 className="text-lg font-bold text-gray-700">{t.noCerts}</h3>
            <p className="mx-auto mt-1 max-w-sm text-sm text-gray-400">
              {t.noCertsDesc}
            </p>

            <Link
              href="/courses"
              className="mt-5 inline-block rounded-lg bg-[#0B4A7C] px-6 py-2.5 text-sm font-bold text-white transition hover:bg-[#083457]"
            >
              {t.browseCourses}
            </Link>
          </div>
        ) : (
          /* CERTIFICATE LIST */
          <div className="space-y-4">
            {certs.map((cert) => {
              const dateStr = cert.completedAt
                ? new Date(cert.completedAt).toLocaleDateString(
                    language === 'es' ? 'es-ES' : 'en-US',
                    { year: 'numeric', month: 'long', day: 'numeric' }
                  )
                : ''

              return (
                <div
                  key={cert.id}
                  className="overflow-hidden rounded-xl border border-gray-200 bg-white shadow-sm transition hover:shadow-md"
                >
                  <div className="flex items-center gap-5 p-5">
                    {/* Icon */}
                    <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-xl bg-[#0B4A7C]/10">
                      <svg
                        className="h-7 w-7 text-[#0B4A7C]"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M9 12l2 2 4-4M7.835 4.697a3.42 3.42 0 001.946-.806 3.42 3.42 0 014.438 0 3.42 3.42 0 001.946.806 3.42 3.42 0 013.138 3.138 3.42 3.42 0 00.806 1.946 3.42 3.42 0 010 4.438 3.42 3.42 0 00-.806 1.946 3.42 3.42 0 01-3.138 3.138 3.42 3.42 0 00-1.946.806 3.42 3.42 0 01-4.438 0 3.42 3.42 0 00-1.946-.806 3.42 3.42 0 01-3.138-3.138 3.42 3.42 0 00-.806-1.946 3.42 3.42 0 010-4.438 3.42 3.42 0 00.806-1.946 3.42 3.42 0 013.138-3.138z"
                        />
                      </svg>
                    </div>

                    {/* Info */}
                    <div className="min-w-0 flex-1">
                      <h3 className="text-base font-bold text-gray-900">
                        {loc(cert.courseTitle, language)}
                      </h3>
                      <div className="mt-1 flex flex-wrap items-center gap-3 text-xs text-gray-500">
                        <span>
                          {t.completed}: {dateStr}
                        </span>
                        <span>·</span>
                        <span>
                          {t.score}: {cert.score}%
                        </span>
                        <span>·</span>
                        <span className="font-mono text-gray-400">
                          {t.certNumber}: {cert.certNumber}
                        </span>
                      </div>
                    </div>

                    {/* Action */}
                    <Link
                      href={`/courses/${cert.courseSlug}/certificate`}
                      className="flex shrink-0 items-center gap-2 rounded-lg bg-[#0B4A7C] px-5 py-2.5 text-sm font-bold text-white shadow-sm transition hover:bg-[#083457]"
                    >
                      {t.viewCertificate}
                    </Link>
                  </div>
                </div>
              )
            })}
          </div>
        )}
      </div>
    </div>
  )
}
