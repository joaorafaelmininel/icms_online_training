// src/components/courses/CertificateClient.tsx
'use client'

import { useCallback } from 'react'
import Link from 'next/link'

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

const BLUE     = '#0B4A7C'
const BLUE_LT  = '#7AC8E8'
const TEXT_DARK = '#111827'
const TEXT_MID  = '#374151'

export default function CertificateClient({
  courseTitle, courseSlug, fullName, completionDate,
  certNumber, language, signatureUrl,
}: Props) {
  const isEs = language === 'es'

  const formattedDate = new Date(completionDate).toLocaleDateString(
    isEs ? 'es-ES' : 'en-US',
    { year: 'numeric', month: 'long', day: 'numeric' }
  )

  const handlePrint = useCallback(() => { window.print() }, [])

  const T = {
    line1:    isEs ? 'Este Certificado es otorgado a'                               : 'This Certificate is awarded to',
    recLine:  isEs ? 'en reconocimiento por la exitosa finalización del Curso en el' : 'in recognition of the successful completion of the online course on the',
    conf:     isEs ? 'de conformidad con la Metodología y las Directrices de INSARAG e ICMS.' : 'in accordance with INSARAG and ICMS Methodology and Guidelines.',
    certNo:   isEs ? `Certificado N.º: ${certNumber}` : `Certificate No.: ${certNumber}`,
    myCerts:  isEs ? 'Mis Certificados' : 'My Certificates',
    back:     isEs ? 'Volver al Curso'  : 'Back to Course',
    download: isEs ? 'Descargar PDF'    : 'Download PDF',
    hint:     isEs
      ? 'En el diálogo, selecciona "Guardar como PDF" y activa "Gráficos de fondo".'
      : 'In the dialog, select "Save as PDF" and enable "Background graphics".',
  }

  const courseText = loc(courseTitle, language)

  return (
    <>
      {/* ── Global print CSS ── */}
      <style dangerouslySetInnerHTML={{ __html: `
        @page {
          size: A4 landscape;
          margin: 0;
        }

        @media print {
          * {
            -webkit-print-color-adjust: exact !important;
            print-color-adjust: exact !important;
          }
          html, body {
            margin: 0 !important;
            padding: 0 !important;
            background: white !important;
          }
          .cert-no-print {
            display: none !important;
          }
          .cert-preview-wrap {
            display: none !important;
          }
          .cert-printable {
            display: block !important;
          }
        }

        @media screen {
          .cert-printable {
            display: none !important;
          }
        }
      `}} />

      {/* ── Controls — hidden on print ── */}
      <div className="cert-no-print" style={{ minHeight: '100vh', background: '#d1d5db' }}>
        <div style={{ maxWidth: 900, margin: '0 auto', padding: '24px 24px 0' }}>
          <div style={{ display: 'flex', flexWrap: 'wrap', alignItems: 'center', justifyContent: 'space-between', gap: 16, marginBottom: 24 }}>
            <div>
              <h1 style={{ fontSize: 20, fontWeight: 700, color: '#111827', margin: 0 }}>
                {isEs ? 'Tu Certificado' : 'Your Certificate'}
              </h1>
              <p style={{ fontSize: 12, color: '#9ca3af', margin: '4px 0 0' }}>{T.hint}</p>
            </div>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 12 }}>
              <Link href="/certificates" style={{ borderRadius: 8, border: '1px solid #e5e7eb', background: '#fff', padding: '10px 20px', fontSize: 14, fontWeight: 600, color: '#4b5563', textDecoration: 'none' }}>
                ← {T.myCerts}
              </Link>
              <Link href={`/courses/${courseSlug}`} style={{ borderRadius: 8, border: '1px solid #e5e7eb', background: '#fff', padding: '10px 20px', fontSize: 14, fontWeight: 600, color: '#4b5563', textDecoration: 'none' }}>
                ← {T.back}
              </Link>
              <button onClick={handlePrint} style={{ display: 'flex', alignItems: 'center', gap: 8, borderRadius: 8, background: BLUE, border: 'none', padding: '10px 24px', fontSize: 14, fontWeight: 700, color: '#fff', cursor: 'pointer' }}>
                <svg width="16" height="16" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3M3 17V7a2 2 0 012-2h6l2 2h6a2 2 0 012 2v8a2 2 0 01-2 2H5a2 2 0 01-2-2z"/>
                </svg>
                {T.download}
              </button>
            </div>
          </div>
        </div>

        {/* Screen preview */}
        <div className="cert-preview-wrap" style={{ display: 'flex', justifyContent: 'center', padding: '0 24px 64px', overflowX: 'auto' }}>
          <CertificateSheet
            fullName={fullName} courseText={courseText} formattedDate={formattedDate}
            certNo={T.certNo} signatureUrl={signatureUrl} line1={T.line1}
            recLine={T.recLine} conf={T.conf}
            screen
          />
        </div>
      </div>

      {/* ── Print version — only visible when printing ── */}
      <div className="cert-printable">
        <CertificateSheet
          fullName={fullName} courseText={courseText} formattedDate={formattedDate}
          certNo={T.certNo} signatureUrl={signatureUrl} line1={T.line1}
          recLine={T.recLine} conf={T.conf}
        />
      </div>
    </>
  )
}

// ─── Certificate Sheet ─────────────────────────────────────────────────────────

function CertificateSheet({
  fullName, courseText, formattedDate, certNo, signatureUrl,
  line1, recLine, conf, screen: isScreen,
}: {
  fullName: string; courseText: string; formattedDate: string; certNo: string
  signatureUrl?: string; line1: string; recLine: string; conf: string
  screen?: boolean
}) {
  // Screen: fixed px — Print: 100% of A4 landscape (297×210mm)
  const W = isScreen ? 1060 : undefined
  const H = isScreen ? 750  : undefined

  const container: React.CSSProperties = isScreen ? {
    width: W, height: H,
    position: 'relative',
    backgroundColor: '#fff',
    boxShadow: '0 25px 60px -10px rgba(0,0,0,0.35)',
    fontFamily: '"Roboto", "Helvetica Neue", Arial, sans-serif',
    overflow: 'hidden',
    flexShrink: 0,
  } : {
    // Print: fills A4 landscape exactly
    width:    '297mm',
    height:   '210mm',
    position: 'relative',
    backgroundColor: '#fff',
    fontFamily: '"Roboto", "Helvetica Neue", Arial, sans-serif',
    overflow: 'hidden',
    pageBreakAfter: 'avoid',
  }

  // Font sizes: screen uses px, print uses pt (px * 0.75)
  const fs = (px: number) => isScreen ? px : `${Math.round(px * 0.75)}pt`
  const sp = (px: number) => isScreen ? px : `${Math.round(px * 0.75)}pt`

  return (
    <div style={container}>

      {/* Outer border */}
      <div style={{ position: 'absolute', inset: isScreen ? 12 : '4mm', border: `${isScreen ? 2.5 : 2}px solid ${BLUE}`, pointerEvents: 'none', zIndex: 5 }} />
      {/* Inner border */}
      <div style={{ position: 'absolute', inset: isScreen ? 18 : '6mm', border: `1px solid ${BLUE_LT}`, opacity: 0.55, pointerEvents: 'none', zIndex: 5 }} />

      {/* UN Emblem watermark */}
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src="/un-emblem-light.png"
        alt=""
        aria-hidden
        style={{
          position: 'absolute', top: '50%', left: '50%',
          transform: 'translate(-50%, -50%)',
          width: isScreen ? 280 : '26%',
          height: isScreen ? 280 : '26%',
          opacity: 0.28,
          pointerEvents: 'none', zIndex: 1,
          objectFit: 'contain',
        }}
      />

      {/* INSARAG Logo — top right */}
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src="/insarag-logo-blue.svg"
        alt="INSARAG"
        style={{
          position: 'absolute',
          top:    isScreen ? 36 : '5%',
          right:  isScreen ? 44 : '5%',
          height: isScreen ? 70 : '9%',
          width: 'auto', zIndex: 3,
        }}
      />

      {/* Main content */}
      <div style={{
        position: 'absolute', top: 0, left: 0, right: 0, bottom: 0,
        display: 'flex', flexDirection: 'column',
        alignItems: 'center', justifyContent: 'center',
        textAlign: 'center',
        padding: isScreen ? '40px 80px 130px' : '3% 8% 17%',
        zIndex: 3,
      }}>

        {/* "This certificate is awarded to" */}
        <p style={{ fontSize: fs(17), fontWeight: 300, color: TEXT_MID, margin: `0 0 ${sp(12)}`, lineHeight: 1.4 }}>
          {line1}
        </p>

        {/* Full name */}
        <h1 style={{
          fontSize: fs(42), fontWeight: 700, color: TEXT_DARK,
          margin: `0 0 ${sp(16)}`, lineHeight: 1.1,
          wordBreak: 'break-word', maxWidth: '90%',
        }}>
          {fullName}
        </h1>

        {/* Rule */}
        <div style={{ width: '60%', height: isScreen ? 1.5 : '0.2%', background: BLUE, margin: `0 0 ${sp(20)}` }} />

        {/* "in recognition of..." */}
        <p style={{ fontSize: fs(15), fontWeight: 300, color: TEXT_MID, margin: `0 0 ${sp(4)}`, lineHeight: 1.5 }}>
          {recLine}
        </p>

        {/* Course title */}
        <p style={{ fontSize: fs(18), fontWeight: 700, color: TEXT_DARK, margin: `0 0 ${sp(4)}`, lineHeight: 1.4, maxWidth: '88%' }}>
          {courseText}
        </p>

        {/* Conformity */}
        <p style={{ fontSize: fs(14), fontWeight: 300, color: TEXT_MID, margin: `0 0 ${sp(32)}`, lineHeight: 1.5 }}>
          {conf}
        </p>

        {/* Date + cert number */}
        <p style={{ fontSize: fs(14), color: TEXT_MID, margin: `0 0 ${sp(5)}` }}>{formattedDate}</p>
        <p style={{ fontSize: fs(12), fontWeight: 300, color: TEXT_MID, margin: 0 }}>{certNo}</p>
      </div>

      {/* Signature block */}
      <div style={{
        position: 'absolute',
        bottom: isScreen ? 44 : '5%',
        right:  isScreen ? 50 : '5%',
        width:  isScreen ? 220 : '19%',
        textAlign: 'center',
        zIndex: 3,
      }}>
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={signatureUrl || '/signature-stampa.png'}
          alt="Signature"
          style={{ height: isScreen ? 50 : '6%', display: 'block', margin: '0 auto 6px' }}
        />
        <div style={{ width: '100%', height: isScreen ? 1 : '0.15%', background: TEXT_DARK, marginBottom: isScreen ? 6 : '1%' }} />
        <p style={{ fontSize: fs(13), fontWeight: 700, color: BLUE, margin: 0 }}>Sebastian Rhodes Stampa</p>
        <p style={{ fontSize: fs(11), color: BLUE, margin: `${sp(2)} 0 0` }}>Secretary INSARAG</p>
        <p style={{ fontSize: fs(10), fontWeight: 300, color: BLUE, margin: `${sp(2)} 0 0` }}>UN Office for the Coordination of</p>
        <p style={{ fontSize: fs(10), fontWeight: 300, color: BLUE, margin: `${sp(1)} 0 0` }}>Humanitarian Affairs (OCHA), Geneva</p>
      </div>
    </div>
  )
}
