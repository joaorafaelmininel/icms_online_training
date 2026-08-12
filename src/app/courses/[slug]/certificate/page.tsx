// src/app/courses/[slug]/certificate/page.tsx

import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { getCurrentLanguage } from '@/lib/i18n/language'
import { getCertificateData } from '@/lib/certificate/data'
import CertificateClient from '@/components/courses/CertificateClient'

// Force dynamic rendering — prevents Next.js 14 from caching searchParams
export const dynamic = 'force-dynamic'

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

  // Language resolution — three sources in priority order:
  // 1. ?lang= query param (explicit, set by certificates/page.tsx from the cookie)
  // 2. cookie via getCurrentLanguage() (reflects what the navbar switcher set)
  // 3. profile.preferred_language (DB fallback, handled inside getCertificateData)
  const cookieLang = await getCurrentLanguage()
  const langOverride = searchParams.lang === 'es' || searchParams.lang === 'en'
    ? searchParams.lang
    : cookieLang

  const cert = await getCertificateData(supabase, user, slug, langOverride)

  if (!cert) redirect(`/courses/${encodeURIComponent(slug)}`)

  // Whether the user came from /certificates
  const fromCertificates = searchParams.from === 'certificates'

  return (
    <CertificateClient
      courseTitle={cert.courseTitle}
      courseSlug={cert.courseSlug}
      fullName={cert.fullName}
      completionDate={cert.completionDate}
      score={cert.score}
      certNumber={cert.certNumber}
      language={cert.language}
      signatureUrl={cert.signatureUrl}
      fromCertificates={fromCertificates}
    />
  )
}
