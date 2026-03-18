// src/components/courses/CertificateClient.tsx
'use client'

import { useState, useCallback, useRef } from 'react'
import Link from 'next/link'

type Lang = 'en' | 'es'
interface LocalizedText { en: string; es: string }

function loc(field: LocalizedText | string | null | undefined, lang: Lang): string {
  if (!field) return ''
  if (typeof field === 'string') return field
  return field[lang] || field.en || ''
}

const i18n = {
  en: {
    pageTitle:       'Your Certificate',
    downloading:     'Generating PDF...',
    download:        'Download PDF',
    backToCourse:    'Back to Course',
    backToCerts:     'My Certificates',
    printHint:       'Download a PDF version of your certificate.',
    certAwarded:     'This Certificate of Achievement is to acknowledge that',
    certRecognition: 'has successfully completed the online course on the',
    certConformity:  'in accordance with INSARAG and ICMS Methodology and Guidelines.',
    issuedLabel:     'Issued on',
    certNumberLabel: 'Certificate No.',
    certSignName:    'Sebastian Rhodes Stampa',
    certSignTitle:   'Secretary INSARAG',
    certSignOrg1:    'UN Office for the Coordination of',
    certSignOrg2:    'Humanitarian Affairs (OCHA), Geneva',
    insaragFull:     'INTERNATIONAL SEARCH AND RESCUE ADVISORY GROUP',
    ochaFull:        'UN OFFICE FOR THE COORDINATION OF\nHUMANITARIAN AFFAIRS',
    errorMsg:        'Could not generate PDF. Please try again.',
  },
  es: {
    pageTitle:       'Tu Certificado',
    downloading:     'Generando PDF...',
    download:        'Descargar PDF',
    backToCourse:    'Volver al Curso',
    backToCerts:     'Mis Certificados',
    printHint:       'Descarga una versión en PDF de tu certificado.',
    certAwarded:     'Este Certificado de Logro es para reconocer que',
    certRecognition: 'ha completado exitosamente el curso en línea sobre el',
    certConformity:  'de conformidad con la Metodología y las Directrices de INSARAG e ICMS.',
    issuedLabel:     'Emitido el',
    certNumberLabel: 'Certificado N.º',
    certSignName:    'Sebastian Rhodes Stampa',
    certSignTitle:   'Secretary INSARAG',
    certSignOrg1:    'Oficina de la ONU para la Coordinación de',
    certSignOrg2:    'Asuntos Humanitarios (OCHA), Ginebra',
    insaragFull:     'GRUPO ASESOR INTERNACIONAL DE BÚSQUEDA Y RESCATE',
    ochaFull:        'OFICINA DE LA ONU PARA LA COORDINACIÓN DE\nASUNTOS HUMANITARIOS',
    errorMsg:        'No se pudo generar el PDF. Por favor, inténtalo de nuevo.',
  },
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

// A4 landscape at 96 dpi
const CERT_W = 1123
const CERT_H = 794

async function toBase64(url: string): Promise<string> {
  const res  = await fetch(url)
  const blob = await res.blob()
  return new Promise((resolve, reject) => {
    const reader = new FileReader()
    reader.onload  = () => resolve(reader.result as string)
    reader.onerror = reject
    reader.readAsDataURL(blob)
  })
}

export default function CertificateClient({
  courseTitle,
  courseSlug,
  fullName,
  completionDate,
  certNumber,
  language,
  signatureUrl,
  fromCertificates = false,
  score,
}: Props) {
  const t       = i18n[language]
  const certRef = useRef<HTMLDivElement>(null)
  const [downloading, setDownloading] = useState(false)
  const [error,       setError      ] = useState<string | null>(null)

  const formattedDate = new Date(completionDate).toLocaleDateString(
    language === 'es' ? 'es-ES' : 'en-US',
    { year: 'numeric', month: 'long', day: 'numeric' },
  )

  const handleDownload = useCallback(async () => {
    const el = certRef.current
    if (!el) return
    setDownloading(true)
    setError(null)
    let clone: HTMLDivElement | null = null

    try {
      const html2canvas = (await import('html2canvas')).default
      const { jsPDF }   = await import('jspdf')

      // Pre-fetch all images as base64
      const [emblemB64, logoB64, sigB64] = await Promise.all([
        toBase64('/un-emblem-light.png'),
        toBase64('/insarag-logo-blue.svg'),
        signatureUrl ? toBase64(signatureUrl) : Promise.resolve(''),
      ])

      clone = el.cloneNode(true) as HTMLDivElement

      // Swap image srcs for base64 in the clone
      clone.querySelectorAll('img').forEach((img) => {
        const src = img.getAttribute('src') || ''
        if (src.includes('un-emblem'))     { img.src = emblemB64 }
        else if (src.includes('insarag-logo')) img.src = logoB64
        else if (signatureUrl && src === signatureUrl) img.src = sigB64
      })

      Object.assign(clone.style, {
        position: 'fixed', top: '0px', left: `-${CERT_W + 200}px`,
        width: `${CERT_W}px`, height: `${CERT_H}px`,
        zIndex: '-999', overflow: 'hidden', boxShadow: 'none', margin: '0',
      })

      document.body.appendChild(clone)
      await new Promise(r => setTimeout(r, 200))

      const canvas = await html2canvas(clone, {
        scale: 1.5, useCORS: true, allowTaint: false,
        backgroundColor: '#F4EFE4',
        width: CERT_W, height: CERT_H,
        windowWidth: CERT_W, windowHeight: CERT_H,
        x: 0, y: 0, scrollX: 0, scrollY: 0, logging: false,
      })

      const pdf = new jsPDF({ orientation: 'landscape', unit: 'mm', format: 'a4', compress: true })
      pdf.addImage(
        canvas.toDataURL('image/jpeg', 0.88), 'JPEG',
        0, 0, pdf.internal.pageSize.getWidth(), pdf.internal.pageSize.getHeight(),
      )

      const safeName = fullName
        .normalize('NFD').replace(/[\u0300-\u036f]/g, '')
        .replace(/\s+/g, '-').replace(/[^a-zA-Z0-9-_]/g, '')
      pdf.save(`ICMS-Certificate-${safeName}.pdf`)

    } catch (err) {
      console.error('PDF error:', err)
      setError(t.errorMsg)
    } finally {
      if (clone && document.body.contains(clone)) document.body.removeChild(clone)
      setDownloading(false)
    }
  }, [fullName, signatureUrl, t.errorMsg])

  // Design tokens — INSARAG palette
  const insaragBlue  = '#0B4A7C'
  const insaragLight = '#1A6DAF'
  const accentGold   = '#B8975A'
  const parchment    = '#F4EFE4'
  const parchmentDark = '#E8E0D0'
  const textDark     = '#1A2340'
  const textMid      = '#3D4A6B'

  // Ribbon stripe widths (left → right, inside 110px total)
  // Lighter, less saturated stripe colors
  const ribbonBlue1 = '#2E6DA4'
  const ribbonBlue2 = '#5B9BC8'
  const stripes = [
    { w: 30, color: ribbonBlue1  },
    { w:  5, color: '#EAF2FA'    },
    { w: 10, color: ribbonBlue2  },
    { w:  5, color: '#EAF2FA'    },
    { w: 10, color: ribbonBlue2  },
    { w:  5, color: '#EAF2FA'    },
    { w: 10, color: ribbonBlue2  },
    { w:  5, color: '#EAF2FA'    },
    { w: 10, color: ribbonBlue1  },
  ]
  const ribbonW          = 90
  const ribbonMarginTop  = 20
  const ribbonMarginBot  = 30
  const ribbonH          = CERT_H - ribbonMarginTop - ribbonMarginBot
  const pointH           = 34
  const ribbonPath = `M 0 0 L ${ribbonW} 0 L ${ribbonW} ${ribbonH - pointH} L ${ribbonW / 2} ${ribbonH} L 0 ${ribbonH - pointH} Z`

  return (
    <div className="min-h-screen bg-gray-300">

      {/* ── Controls ──────────────────────────────────────────────────────── */}
      <div className="mx-auto max-w-5xl px-4 py-6 print:hidden sm:px-6">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <h1 className="text-xl font-bold text-gray-900">{t.pageTitle}</h1>
            <p className="mt-0.5 text-xs text-gray-400">{t.printHint}</p>
          </div>
          <div className="flex flex-wrap gap-3">
            <Link href="/certificates"
              className="rounded-lg border border-gray-200 bg-white px-5 py-2.5 text-sm font-semibold text-gray-600 transition hover:bg-gray-50">
              ← {t.backToCerts}
            </Link>
            <Link href={`/courses/${courseSlug}`}
              className="rounded-lg border border-gray-200 bg-white px-5 py-2.5 text-sm font-semibold text-gray-600 transition hover:bg-gray-50">
              ← {t.backToCourse}
            </Link>
            <button onClick={handleDownload} disabled={downloading}
              className="flex items-center gap-2 rounded-lg bg-[#0B4A7C] px-6 py-2.5 text-sm font-bold text-white shadow-sm transition hover:bg-[#083457] disabled:opacity-50">
              {downloading ? (
                <svg className="h-4 w-4 animate-spin" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                </svg>
              ) : (
                <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                    d="M12 10v6m0 0l-3-3m3 3l3-3M3 17V7a2 2 0 012-2h6l2 2h6a2 2 0 012 2v8a2 2 0 01-2 2H5a2 2 0 01-2-2z" />
                </svg>
              )}
              {downloading ? t.downloading : t.download}
            </button>
          </div>
        </div>
        {error && <p className="mt-3 text-sm text-red-600">{error}</p>}
      </div>

      {/* ══ CERTIFICATE ═══════════════════════════════════════════════════════ */}
      <div className="overflow-x-auto pb-16">
        <div
          ref={certRef}
          style={{
            position: 'relative',
            margin: '0 auto',
            width: CERT_W,
            height: CERT_H,
            backgroundColor: parchment,
            overflow: 'hidden',
            boxShadow: '0 25px 60px -10px rgba(0,0,0,0.35)',
            boxSizing: 'border-box',
            fontFamily: '"Georgia", "Times New Roman", serif',
          }}
        >

          {/* ── Subtle parchment texture overlay ──────────────────────────── */}
          <div style={{
            position: 'absolute', inset: 0, zIndex: 0,
            background: `repeating-linear-gradient(
              0deg,
              transparent,
              transparent 3px,
              rgba(0,0,0,0.012) 3px,
              rgba(0,0,0,0.012) 4px
            )`,
          }} />

          {/* ── UN emblem watermark ──────────────────────────────────────── */}
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src="/un-emblem.svg"
            alt=""
            aria-hidden="true"
            style={{
              position:      'absolute',
              top:           '50%',
              left:          '55%',
              transform:     'translate(-50%, -50%)',
              width:          420,
              height:        'auto',
              opacity:        0.06,
              pointerEvents: 'none',
              zIndex:         1,
              filter:        'brightness(0) saturate(100%) invert(40%) sepia(90%) saturate(500%) hue-rotate(170deg) brightness(1.1)',
            }}
          />

          {/* ── Outer border ──────────────────────────────────────────────── */}
          <div style={{
            position: 'absolute', inset: 10, zIndex: 4, pointerEvents: 'none',
            border: `2.5px solid ${insaragBlue}`,
          }} />
          <div style={{
            position: 'absolute', inset: 15, zIndex: 4, pointerEvents: 'none',
            border: `0.75px solid ${accentGold}`, opacity: 0.6,
          }} />

          {/* ── LEFT RIBBON ───────────────────────────────────────────────── */}
          <svg
            style={{ position: 'absolute', top: ribbonMarginTop, left: 28, zIndex: 3, pointerEvents: 'none' }}
            width={ribbonW}
            height={ribbonH}
          >
            <defs>
              <clipPath id="ribbonClip">
                <path d={ribbonPath} />
              </clipPath>
            </defs>

            {/* Drop shadow behind ribbon */}
            <filter id="ribbonShadow">
              <feDropShadow dx="3" dy="0" stdDeviation="4" floodOpacity="0.25" />
            </filter>

            {/* Stripe layers clipped to ribbon shape */}
            <g clipPath="url(#ribbonClip)" filter="url(#ribbonShadow)">
              {(() => {
                let x = 0
                return stripes.map((s, i) => {
                  const rect = (
                    <rect key={i} x={x} y={0} width={s.w} height={ribbonH} fill={s.color} />
                  )
                  x += s.w
                  return rect
                })
              })()}
            </g>

            {/* Ribbon outline */}
            <path d={ribbonPath} fill="none" stroke="rgba(0,0,0,0.15)" strokeWidth="1" />
          </svg>

          {/* ── MAIN CONTENT (left-padded past ribbon) ────────────────────── */}
          <div style={{
            position: 'absolute', top: 0, left: ribbonW + 28 + 24, right: 0, bottom: 0,
            zIndex: 2,
            display: 'flex', flexDirection: 'column',
            padding: '36px 54px 28px 20px',
          }}>

            {/* ── HEADER: two logos + vertical divider ──────────────────── */}
            {/* INSARAG logo only — slightly larger */}
            <div style={{ marginBottom: 24 }}>
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src="/insarag-logo-blue.svg"
                alt="INSARAG"
                style={{ height: 72, width: 'auto' }}
              />
              <p style={{
                fontSize: 10, fontWeight: 600, color: insaragBlue,
                letterSpacing: '0.08em', margin: '6px 0 0',
                fontFamily: '"Roboto", Arial, sans-serif',
                textTransform: 'uppercase', lineHeight: 1.4,
              }}>
                {t.insaragFull}
              </p>
            </div>

            {/* ── Decorative line under header ──────────────────────────── */}
            <div style={{ height: 1, background: `linear-gradient(to right, ${insaragBlue}, ${accentGold}, transparent)`, marginBottom: 32, opacity: 0.5 }} />

            {/* ── BODY ──────────────────────────────────────────────────── */}
            <div style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', textAlign: 'center' }}>

              {/* Awarded phrase */}
              <p style={{
                fontSize: 16, color: textMid, margin: '0 0 14px',
                fontFamily: '"Georgia", serif', fontStyle: 'italic',
                letterSpacing: '0.02em',
              }}>
                {t.certAwarded}
              </p>

              {/* Name */}
              <h1 style={{
                fontSize: 38, fontWeight: 700, color: textDark,
                fontFamily: '"Playfair Display", "Georgia", serif',
                margin: '0 0 6px', lineHeight: 1.15,
                letterSpacing: '0.04em',
                textTransform: 'uppercase',
                paddingBottom: '4px',
              }}>
                {fullName}
              </h1>

              {/* Name underline */}
              <div style={{ width: '70%', maxWidth: 460, margin: '0 auto 22px' }}>
                <div style={{ height: 2, background: insaragBlue }} />
                <div style={{ height: 1, background: accentGold, marginTop: 3, opacity: 0.7 }} />
              </div>

              {/* Recognition + course */}
              <p style={{
                fontSize: 15, color: textMid, margin: '0 0 8px',
                fontFamily: '"Georgia", serif', fontStyle: 'italic',
              }}>
                {t.certRecognition}
              </p>

              <p style={{
                fontSize: 20, fontWeight: 700, color: textDark,
                fontFamily: '"Playfair Display", "Georgia", serif',
                margin: '0 0 6px', lineHeight: 1.3, maxWidth: 520,
                fontStyle: 'italic',
              }}>
                {loc(courseTitle, language)}
              </p>

              <p style={{
                fontSize: 12.5, color: textMid, margin: '0',
                fontFamily: '"Georgia", serif',
                maxWidth: 460, lineHeight: 1.6,
              }}>
                {t.certConformity}
              </p>
            </div>

            {/* ── FOOTER ────────────────────────────────────────────────── */}
            <div style={{
              display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end',
              marginTop: 16,
              borderTop: `1px solid ${parchmentDark}`,
              paddingTop: 14,
            }}>

              {/* Left: cert number + issued date */}
              <div style={{ textAlign: 'left' }}>
                <p style={{ fontSize: 9, color: '#8A9AB5', margin: 0, fontFamily: '"Roboto", sans-serif', letterSpacing: '0.08em', textTransform: 'uppercase' }}>
                  {t.certNumberLabel}
                </p>
                <p style={{ fontSize: 11, color: textMid, margin: '2px 0 10px', fontFamily: '"Roboto", sans-serif', letterSpacing: '0.04em' }}>
                  {certNumber}
                </p>
                <p style={{ fontSize: 9, color: '#8A9AB5', margin: 0, fontFamily: '"Roboto", sans-serif', letterSpacing: '0.08em', textTransform: 'uppercase' }}>
                  {t.issuedLabel}
                </p>
                <p style={{ fontSize: 12, color: textDark, margin: '2px 0 0', fontFamily: '"Georgia", serif', fontWeight: 600 }}>
                  {formattedDate}
                </p>
              </div>

              {/* Right: signature block */}
              <div style={{ textAlign: 'center' }}>
                {signatureUrl ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={signatureUrl} alt="Signature"
                    style={{ height: 48, display: 'block', margin: '0 auto 6px' }} />
                ) : (
                  <p style={{ fontFamily: '"Segoe Script","Brush Script MT",cursive', fontStyle: 'italic', fontSize: 26, color: textDark, margin: '0 0 6px', lineHeight: 1 }}>
                    S. Rhodes Stampa
                  </p>
                )}
                <div style={{ width: 200, height: 1.5, background: textDark, margin: '0 auto' }} />
                <p style={{ fontSize: 13, fontWeight: 700, color: textDark, margin: '5px 0 0', fontFamily: '"Roboto", sans-serif' }}>{t.certSignName}</p>
                <p style={{ fontSize: 11, color: textMid, margin: '1px 0 0', fontFamily: '"Roboto", sans-serif' }}>{t.certSignTitle}</p>
                <p style={{ fontSize: 10.5, color: textMid, margin: '1px 0 0', fontFamily: '"Roboto", sans-serif', lineHeight: 1.4 }}>{t.certSignOrg1}</p>
                <p style={{ fontSize: 10.5, color: textMid, margin: '0', fontFamily: '"Roboto", sans-serif', lineHeight: 1.4 }}>{t.certSignOrg2}</p>
              </div>
            </div>

          </div>{/* end main content */}

        </div>
      </div>

      <style jsx global>{`
        @import url('https://fonts.googleapis.com/css2?family=Playfair+Display:ital,wght@0,400;0,700;1,400;1,700&family=Roboto:wght@300;400;500;700&display=swap');
        @media print {
          body { margin: 0; padding: 0; }
          @page { size: A4 landscape; margin: 0; }
        }
      `}</style>
    </div>
  )
}
