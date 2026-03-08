'use client'

import { useState, useCallback } from 'react'
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
    institution:     'INSARAG — INTERNATIONAL SEARCH AND RESCUE ADVISORY GROUP',
    certTitle:       'Certificate',
    certAwarded:     'This is to certify that',
    certRecognition: 'has successfully completed the online course on the',
    certConformity:  'in accordance with INSARAG Methodology and Guidelines.',
    dateLabel:       'Date of Completion',
    certNumber:      'Certificate No.',
    certSignName:    'Sebastian Rhodes Stampa',
    certSignTitle:   'Secretary INSARAG',
    certSignOrg:     'UN Office for the Coordination of Humanitarian Affairs (OCHA), Geneva',
    errorMsg:        'Could not generate PDF. Please try again.',
  },
  es: {
    pageTitle:       'Tu Certificado',
    downloading:     'Generando PDF...',
    download:        'Descargar PDF',
    backToCourse:    'Volver al Curso',
    backToCerts:     'Mis Certificados',
    printHint:       'Descarga una versión en PDF de tu certificado.',
    institution:     'INSARAG — GRUPO ASESOR INTERNACIONAL DE BÚSQUEDA Y RESCATE',
    certTitle:       'Certificado',
    certAwarded:     'Se certifica que',
    certRecognition: 'ha completado exitosamente el curso en línea sobre el',
    certConformity:  'de conformidad con la Metodología y las Directrices de INSARAG e ICMS.',
    dateLabel:       'Fecha de Finalización',
    certNumber:      'Certificado N.º',
    certSignName:    'Sebastian Rhodes Stampa',
    certSignTitle:   'Secretary INSARAG',
    certSignOrg:     'Oficina de la ONU para la Coordinación de Asuntos Humanitarios (OCHA), Ginebra',
    errorMsg:        'No se pudo generar el PDF. Por favor, inténtalo de nuevo.',
  },
}

interface Props {
  courseTitle: LocalizedText
  courseSlug: string
  fullName: string
  completionDate: string
  certNumber: string
  language: Lang
  signatureUrl?: string
  fromCertificates?: boolean
}

const CERT_W = 1123
const CERT_H = 794

const HEADER_H = 120
const FOOTER_H = 140
const BODY_H = CERT_H - HEADER_H - FOOTER_H

function Divider({ color, width = '300px' }: { color: string; width?: string }) {
  return (
    <div
      style={{
        display: 'flex',
        alignItems: 'center',
        gap: 8,
        width,
        margin: '10px auto',
      }}
    >
      <div style={{ flex: 1, height: 1, background: color, opacity: 0.45 }} />
      <span
        style={{
          color,
          opacity: 0.65,
          fontSize: 10,
          lineHeight: 1,
          fontFamily: '"Roboto", sans-serif',
        }}
      >
        ◆
      </span>
      <div style={{ flex: 1, height: 1, background: color, opacity: 0.45 }} />
    </div>
  )
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
}: Props) {
  const t = i18n[language]
  const [downloading, setDownloading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const formattedDate = new Date(completionDate).toLocaleDateString(
    language === 'es' ? 'es-ES' : 'en-US',
    { year: 'numeric', month: 'long', day: 'numeric' },
  )

  const handleDownload = useCallback(async () => {
    setDownloading(true)
    setError(null)

    try {
      const res = await fetch('/api/certificates/download', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          fullName,
          courseTitle,
          completionDate,
          certNumber,
          language,
        }),
      })

      if (!res.ok) {
        throw new Error(`Server error: ${res.status}`)
      }

      const blob = await res.blob()
      const url = URL.createObjectURL(blob)

      const safeName = fullName
        .normalize('NFD')
        .replace(/[\u0300-\u036f]/g, '')
        .replace(/\s+/g, '-')
        .replace(/[^a-zA-Z0-9-_]/g, '')

      const a = document.createElement('a')
      a.href = url
      a.download = `ICMS-Certificate-${safeName}.pdf`

      document.body.appendChild(a)
      a.click()
      a.remove()

      URL.revokeObjectURL(url)
    } catch (err) {
      console.error('PDF download error:', err)
      setError(t.errorMsg)
    } finally {
      setDownloading(false)
    }
  }, [fullName, courseTitle, completionDate, certNumber, language, t.errorMsg])

  const blue = '#4A90C4'
  const darkBlue = '#1B4F8A'
  const textDark = '#1B2A4A'

  return (
    <div className="min-h-screen bg-gray-200">
      <div className="mx-auto max-w-5xl px-4 py-6 print:hidden sm:px-6">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <h1 className="text-xl font-bold text-gray-900">{t.pageTitle}</h1>
            <p className="mt-0.5 text-xs text-gray-400">{t.printHint}</p>
          </div>

          <div className="flex flex-wrap gap-3">
            {fromCertificates && (
              <Link
                href="/certificates"
                className="rounded-lg border border-gray-200 bg-white px-5 py-2.5 text-sm font-semibold text-gray-600 transition hover:bg-gray-50"
              >
                ← {t.backToCerts}
              </Link>
            )}

            <Link
              href={`/courses/${courseSlug}`}
              className="rounded-lg border border-gray-200 bg-white px-5 py-2.5 text-sm font-semibold text-gray-600 transition hover:bg-gray-50"
            >
              ← {t.backToCourse}
            </Link>

            <button
              onClick={handleDownload}
              disabled={downloading}
              className="flex items-center gap-2 rounded-lg bg-[#1B4F8A] px-6 py-2.5 text-sm font-bold text-white shadow-sm transition hover:bg-[#163f6e] disabled:opacity-50"
            >
              {downloading ? (
                <svg className="h-4 w-4 animate-spin" fill="none" viewBox="0 0 24 24">
                  <circle
                    className="opacity-25"
                    cx="12"
                    cy="12"
                    r="10"
                    stroke="currentColor"
                    strokeWidth="4"
                  />
                  <path
                    className="opacity-75"
                    fill="currentColor"
                    d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"
                  />
                </svg>
              ) : (
                <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M12 10v6m0 0l-3-3m3 3l3-3M3 17V7a2 2 0 012-2h6l2 2h6a2 2 0 012 2v8a2 2 0 01-2 2H5a2 2 0 01-2-2z"
                  />
                </svg>
              )}

              {downloading ? t.downloading : t.download}
            </button>
          </div>
        </div>

        {error && <p className="mt-3 text-sm text-red-600">{error}</p>}
      </div>

      <div className="overflow-x-auto pb-16">
        <div
          style={{
            position: 'relative',
            margin: '0 auto',
            width: CERT_W,
            height: CERT_H,
            backgroundColor: '#fff',
            overflow: 'hidden',
            boxShadow: '0 25px 50px -12px rgba(0,0,0,0.25)',
            boxSizing: 'border-box',
          }}
        >
          <svg
            style={{ position: 'absolute', inset: 0, zIndex: 3, pointerEvents: 'none' }}
            width={CERT_W}
            height={CERT_H}
          >
            <rect
              x={12}
              y={12}
              width={CERT_W - 24}
              height={CERT_H - 24}
              stroke={darkBlue}
              strokeWidth={2.5}
              fill="none"
            />
            <rect
              x={18}
              y={18}
              width={CERT_W - 36}
              height={CERT_H - 36}
              stroke={blue}
              strokeWidth={0.8}
              opacity={0.5}
              fill="none"
            />
          </svg>

          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src="/un-emblem.svg"
            alt=""
            aria-hidden="true"
            style={{
              position: 'absolute',
              top: '50%',
              left: '50%',
              transform: 'translate(-50%,-50%)',
              width: 380,
              height: 'auto',
              opacity: 0.08,
              pointerEvents: 'none',
              zIndex: 1,
              filter: 'invert(30%) sepia(80%) saturate(400%) hue-rotate(185deg)',
            }}
          />

          <div
            style={{
              position: 'absolute',
              top: 0,
              left: 0,
              right: 0,
              height: HEADER_H,
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              zIndex: 2,
              borderBottom: '1px solid #E2E8F0',
              backgroundColor: '#fff',
            }}
          >
            <div
              style={{
                position: 'absolute',
                top: 0,
                left: 0,
                right: 0,
                height: 6,
                background: darkBlue,
              }}
            />

            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src="/insarag-logo-blue.svg"
              alt="INSARAG"
              style={{ height: 52, width: 'auto', marginTop: 4 }}
            />

            <p
              style={{
                fontSize: 10,
                color: darkBlue,
                margin: '6px 0 0',
                letterSpacing: '0.08em',
                textTransform: 'uppercase',
                fontFamily: '"Roboto", sans-serif',
                fontWeight: 600,
              }}
            >
              {t.institution}
            </p>
          </div>

          <div
            style={{
              position: 'absolute',
              top: HEADER_H,
              left: 0,
              right: 0,
              height: BODY_H,
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              textAlign: 'center',
              padding: '0 90px',
              zIndex: 2,
            }}
          >
            <h1
              style={{
                fontSize: 68,
                fontWeight: 700,
                color: textDark,
                fontFamily: '"Playfair Display", Georgia, serif',
                margin: 0,
                lineHeight: 1,
              }}
            >
              {t.certTitle}
            </h1>

            <Divider color={blue} width="300px" />

            <p
              style={{
                fontSize: 13,
                color: '#64748B',
                margin: '8px 0 0',
                fontFamily: '"Roboto", sans-serif',
                letterSpacing: '0.02em',
              }}
            >
              {t.certAwarded}
            </p>

            <h2
              style={{
                fontSize: 40,
                fontWeight: 700,
                color: textDark,
                fontFamily: '"Playfair Display", Georgia, serif',
                margin: '4px 0 0',
                lineHeight: 1.15,
                maxWidth: 820,
                wordBreak: 'break-word',
              }}
            >
              {fullName}
            </h2>

            <div style={{ width: '60%', maxWidth: 420, margin: '6px auto 0' }}>
              <div style={{ height: 2, background: darkBlue }} />
              <div style={{ height: 1, background: blue, opacity: 0.4, marginTop: 3 }} />
            </div>

            <p
              style={{
                fontSize: 13,
                color: '#64748B',
                margin: '12px 0 0',
                fontFamily: '"Roboto", sans-serif',
              }}
            >
              {t.certRecognition}
            </p>

            <p
              style={{
                fontSize: 19,
                fontWeight: 700,
                color: textDark,
                fontFamily: '"Playfair Display", Georgia, serif',
                margin: '4px auto 0',
                maxWidth: 500,
                lineHeight: 1.3,
              }}
            >
              {loc(courseTitle, language)}
            </p>

            <p
              style={{
                fontSize: 11,
                color: '#64748B',
                margin: '7px auto 0',
                fontFamily: '"Roboto", sans-serif',
                maxWidth: 460,
                lineHeight: 1.55,
              }}
            >
              {t.certConformity}
            </p>
          </div>

          <div
            style={{
              position: 'absolute',
              bottom: 0,
              left: 0,
              right: 0,
              height: FOOTER_H,
              borderTop: '1px solid #E2E8F0',
              zIndex: 2,
              backgroundColor: '#fff',
            }}
          >
            <div
              style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                height: '100%',
                padding: '0 60px',
                paddingBottom: 6,
              }}
            >
              <div style={{ textAlign: 'left', minWidth: 140 }}>
                <p
                  style={{
                    fontSize: 9.5,
                    color: '#94A3B8',
                    margin: 0,
                    fontFamily: '"Roboto", sans-serif',
                    letterSpacing: '0.06em',
                    textTransform: 'uppercase',
                  }}
                >
                  {t.certNumber}
                </p>
                <p
                  style={{
                    fontSize: 11.5,
                    color: '#475569',
                    margin: '3px 0 0',
                    fontFamily: '"Roboto", sans-serif',
                  }}
                >
                  {certNumber}
                </p>
              </div>

              <div style={{ textAlign: 'center' }}>
                {signatureUrl ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={signatureUrl}
                    alt="Signature"
                    style={{ height: 46, display: 'block', margin: '0 auto 4px' }}
                  />
                ) : (
                  <p
                    style={{
                      fontFamily: '"Segoe Script","Brush Script MT",cursive',
                      fontStyle: 'italic',
                      fontSize: 24,
                      color: '#334155',
                      margin: '0 0 4px',
                      lineHeight: 1,
                    }}
                  >
                    S. Rhodes Stampa
                  </p>
                )}

                <div
                  style={{
                    width: 180,
                    height: 1.5,
                    background: '#1B2A4A',
                    margin: '0 auto',
                  }}
                />

                <p
                  style={{
                    fontSize: 12.5,
                    fontWeight: 700,
                    color: textDark,
                    margin: '5px 0 0',
                    fontFamily: '"Roboto", sans-serif',
                  }}
                >
                  {t.certSignName}
                </p>

                <p
                  style={{
                    fontSize: 11,
                    color: '#475569',
                    margin: '2px 0 0',
                    fontFamily: '"Roboto", sans-serif',
                  }}
                >
                  {t.certSignTitle}
                </p>

                <p
                  style={{
                    fontSize: 10.5,
                    color: '#64748B',
                    margin: '1px 0 0',
                    fontFamily: '"Roboto", sans-serif',
                    lineHeight: 1.4,
                  }}
                >
                  {t.certSignOrg}
                </p>
              </div>

              <div style={{ textAlign: 'right', minWidth: 140 }}>
                <p
                  style={{
                    fontSize: 9.5,
                    color: '#94A3B8',
                    margin: 0,
                    fontFamily: '"Roboto", sans-serif',
                    letterSpacing: '0.06em',
                    textTransform: 'uppercase',
                  }}
                >
                  {t.dateLabel}
                </p>

                <p
                  style={{
                    fontSize: 12.5,
                    color: textDark,
                    margin: '4px 0 0',
                    fontFamily: '"Roboto", sans-serif',
                    fontWeight: 500,
                  }}
                >
                  {formattedDate}
                </p>
              </div>
            </div>

            <div
              style={{
                position: 'absolute',
                bottom: 0,
                left: 0,
                right: 0,
                height: 3,
                background: blue,
              }}
            />
          </div>
        </div>
      </div>

      <style jsx global>{`
        @import url('https://fonts.googleapis.com/css2?family=Playfair+Display:wght@400;700&family=Roboto:wght@300;400;500;700&display=swap');

        @media print {
          body {
            margin: 0;
            padding: 0;
          }

          @page {
            size: A4 landscape;
            margin: 0;
          }
        }
      `}</style>
    </div>
  )
}