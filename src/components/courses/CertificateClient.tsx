// src/components/courses/CertificateClient.tsx
'use client'

import { useCallback, useState } from 'react'
import Link from 'next/link'
import CertificateSheet from './CertificateSheet'

type Lang = 'en' | 'es'
interface LocalizedText { en: string; es: string }

function loc(f: LocalizedText | string | null | undefined, l: Lang): string {
  if (!f) return ''
  if (typeof f === 'string') return f
  return f[l] || f.en || ''
}

interface Props {
  courseTitle:       LocalizedText
  courseSlug:        string
  fullName:          string
  completionDate:    string
  certNumber:        string
  language:          Lang
  signatureUrl?:     string
  fromCertificates?: boolean
  score?:            number
}

const BLUE = '#0B4A7C'

export default function CertificateClient({
  courseTitle, courseSlug, fullName, completionDate,
  certNumber, language, signatureUrl,
}: Props) {
  const isEs = language === 'es'
  const [generating, setGenerating] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const formattedDate = new Date(completionDate).toLocaleDateString(
    isEs ? 'es-ES' : 'en-US',
    { year: 'numeric', month: 'long', day: 'numeric' }
  )

  const T = {
    line1:      isEs ? 'Este Certificado es otorgado a'                               : 'This Certificate is awarded to',
    recLine:    isEs ? 'en reconocimiento por la exitosa finalización del Curso en el' : 'in recognition of the successful completion of the online course on the',
    conf:       isEs ? 'de conformidad con la Metodología y las Directrices de INSARAG e ICMS.' : 'in accordance with INSARAG and ICMS Methodology and Guidelines.',
    certNo:     isEs ? `Certificado N.º: ${certNumber}` : `Certificate No.: ${certNumber}`,
    myCerts:    isEs ? 'Mis Certificados' : 'My Certificates',
    back:       isEs ? 'Volver al Curso'  : 'Back to Course',
    download:   isEs ? 'Descargar PDF'    : 'Download PDF',
    generating: isEs ? 'Generando PDF...' : 'Generating PDF...',
    hint:       isEs
      ? 'El PDF descargado es idéntico a la vista previa que se muestra abajo.'
      : 'The downloaded PDF is identical to the preview shown below.',
    errorMsg:   isEs ? 'No se pudo generar el PDF. Inténtalo de nuevo.' : 'Failed to generate the PDF. Please try again.',
  }

  const courseText = loc(courseTitle, language)

  const handleDownload = useCallback(async () => {
    if (generating) return
    setGenerating(true)
    setError(null)

    try {
      const url = `/api/certificates/pdf?slug=${encodeURIComponent(courseSlug)}&lang=${language}`
      const res = await fetch(url)

      if (!res.ok) {
        const data = await res.json().catch(() => null)
        throw new Error(data?.error || `Request failed (${res.status})`)
      }

      const blob = await res.blob()
      const objectUrl = URL.createObjectURL(blob)

      const safeName = fullName
        .normalize('NFD')
        .replace(/[\u0300-\u036f]/g, '')
        .replace(/\s+/g, '-')
        .replace(/[^a-zA-Z0-9-_]/g, '')

      const a = document.createElement('a')
      a.href = objectUrl
      a.download = `ICMS-Certificate-${safeName}.pdf`
      document.body.appendChild(a)
      a.click()
      a.remove()
      URL.revokeObjectURL(objectUrl)
    } catch (err: any) {
      console.error('Certificate PDF generation failed:', err)
      setError(T.errorMsg)
    } finally {
      setGenerating(false)
    }
  }, [courseSlug, language, fullName, generating, T.errorMsg])

  return (
    <div style={{ minHeight: '100vh', background: '#d1d5db' }}>
      <div style={{ maxWidth: 900, margin: '0 auto', padding: '24px 24px 0' }}>
        <div style={{ display: 'flex', flexWrap: 'wrap', alignItems: 'center', justifyContent: 'space-between', gap: 16, marginBottom: 24 }}>
          <div>
            <h1 style={{ fontSize: 20, fontWeight: 700, color: '#111827', margin: 0 }}>
              {isEs ? 'Tu Certificado' : 'Your Certificate'}
            </h1>
            <p style={{ fontSize: 12, color: '#9ca3af', margin: '4px 0 0' }}>{T.hint}</p>
            {error && (
              <p style={{ fontSize: 12, color: '#dc2626', margin: '4px 0 0' }}>{error}</p>
            )}
          </div>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 12 }}>
            <Link href="/certificates" style={{ borderRadius: 8, border: '1px solid #e5e7eb', background: '#fff', padding: '10px 20px', fontSize: 14, fontWeight: 600, color: '#4b5563', textDecoration: 'none' }}>
              ← {T.myCerts}
            </Link>
            <Link href={`/courses/${courseSlug}`} style={{ borderRadius: 8, border: '1px solid #e5e7eb', background: '#fff', padding: '10px 20px', fontSize: 14, fontWeight: 600, color: '#4b5563', textDecoration: 'none' }}>
              ← {T.back}
            </Link>
            <button
              onClick={handleDownload}
              disabled={generating}
              style={{
                display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8, borderRadius: 8,
                background: BLUE, border: 'none', padding: '10px 24px', fontSize: 14,
                fontWeight: 700, color: '#fff', minWidth: 190,
                cursor: generating ? 'default' : 'pointer',
                opacity: generating ? 0.7 : 1,
              }}
            >
              {generating ? (
                <svg width="16" height="16" viewBox="0 0 24 24" style={{ animation: 'cert-spin 0.8s linear infinite' }}>
                  <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" opacity="0.25" />
                  <path d="M4 12a8 8 0 018-8" stroke="currentColor" strokeWidth="4" fill="none" strokeLinecap="round" />
                </svg>
              ) : (
                <svg width="16" height="16" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3M3 17V7a2 2 0 012-2h6l2 2h6a2 2 0 012 2v8a2 2 0 01-2 2H5a2 2 0 01-2-2z"/>
                </svg>
              )}
              {generating ? T.generating : T.download}
            </button>
          </div>
        </div>
      </div>

      <style dangerouslySetInnerHTML={{ __html: `
        @keyframes cert-spin { to { transform: rotate(360deg); } }
      `}} />

      {/* Certificate preview — the exact same component (CertificateSheet) is
          rendered server-side by Puppeteer to produce the downloaded PDF. */}
      <div style={{ display: 'flex', justifyContent: 'center', padding: '0 24px 64px', overflowX: 'auto' }}>
        <div style={{ boxShadow: '0 25px 60px -10px rgba(0,0,0,0.35)', flexShrink: 0 }}>
          <CertificateSheet
            fullName={fullName} courseText={courseText} formattedDate={formattedDate}
            certNo={T.certNo} signatureUrl={signatureUrl} line1={T.line1}
            recLine={T.recLine} conf={T.conf}
          />
        </div>
      </div>
    </div>
  )
}
