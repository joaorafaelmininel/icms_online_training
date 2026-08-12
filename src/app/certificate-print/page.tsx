// src/app/certificate-print/page.tsx
// Presentational-only render target for Puppeteer. Not linked from anywhere in
// the UI — the PDF API route (which already validated the requester's identity
// and course completion) navigates here with the already-derived data as query
// params, then screenshots this exact page into a PDF via page.pdf(). Kept
// outside the /courses/[slug] tree so it isn't wrapped by that route's auth
// guard (Puppeteer has no user session/cookies).

import CertificateSheet, { CERT_WIDTH, CERT_HEIGHT } from '@/components/courses/CertificateSheet'
import { getCertificateStrings } from '@/lib/certificate/text'

export const dynamic = 'force-dynamic'

// A4 landscape at 96 CSS px/inch — a real, standard paper size so PDF viewers
// never letterbox/pad the page. The 1060×750 certificate artwork is scaled up
// (not stretched — x/y factors are within 0.02% of each other) to fill it
// exactly, with zero margin.
const A4_LANDSCAPE_W = 1122.52
const A4_LANDSCAPE_H = 793.7
const SCALE_X = A4_LANDSCAPE_W / CERT_WIDTH
const SCALE_Y = A4_LANDSCAPE_H / CERT_HEIGHT

export default function CertificatePrintPage({
  searchParams,
}: {
  searchParams: {
    name?: string
    course?: string
    date?: string
    certNumber?: string
    lang?: string
    signatureUrl?: string
  }
}) {
  const lang = searchParams.lang === 'es' ? 'es' : 'en'
  const certNumber = searchParams.certNumber || ''
  const T = getCertificateStrings(lang, certNumber)

  return (
    <div style={{ margin: 0, padding: 0, width: A4_LANDSCAPE_W, height: A4_LANDSCAPE_H, overflow: 'hidden' }}>
      {/* Reset the shared layout's body so the page sits flush at 0,0 with no
          scrollbars — this route is only ever screenshotted by Puppeteer. */}
      <style dangerouslySetInnerHTML={{ __html: `
        html, body { margin: 0 !important; padding: 0 !important; background: #fff !important; overflow: hidden !important; }
      `}} />
      <div style={{ transform: `scale(${SCALE_X}, ${SCALE_Y})`, transformOrigin: 'top left' }}>
        <CertificateSheet
          fullName={searchParams.name || ''}
          courseText={searchParams.course || ''}
          formattedDate={searchParams.date || ''}
          certNo={T.certNo}
          signatureUrl={searchParams.signatureUrl}
          line1={T.line1}
          recLine={T.recLine}
          conf={T.conf}
        />
      </div>
    </div>
  )
}
