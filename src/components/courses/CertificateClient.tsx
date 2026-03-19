// src/components/courses/CertificateClient.tsx
'use client'

import { forwardRef, useCallback, useEffect, useMemo, useRef, useState } from 'react'
import Link from 'next/link'
import html2canvas from 'html2canvas'
import jsPDF from 'jspdf'

type Lang = 'en' | 'es'

interface LocalizedText {
  en: string
  es: string
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
  score?: number
}

type CertBodyProps = {
  fullName: string
  courseText: string
  formattedDate: string
  certNo: string
  signatureUrl?: string
  line1: string
  recLine: string
  conf: string
  BLUE: string
  BLUE_LT: string
  TEXT_DARK: string
  TEXT_MID: string
}

const ARTBOARD_WIDTH = 1404
const ARTBOARD_HEIGHT = 993

function loc(f: LocalizedText | string | null | undefined, l: Lang): string {
  if (!f) return ''
  if (typeof f === 'string') return f
  return f[l] || f.en || ''
}

function formatCertificateDate(value: string, isEs: boolean): string {
  if (!value) return ''

  let date: Date | null = null

  if (/^\d{4}-\d{2}-\d{2}$/.test(value)) {
    const [year, month, day] = value.split('-').map(Number)
    date = new Date(year, month - 1, day)
  } else {
    const parsed = new Date(value)
    if (!Number.isNaN(parsed.getTime())) {
      date = parsed
    }
  }

  if (!date || Number.isNaN(date.getTime())) {
    return value
  }

  return new Intl.DateTimeFormat(isEs ? 'es-ES' : 'en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  }).format(date)
}

function sanitizeFileName(input: string): string {
  return input
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-zA-Z0-9-_ ]/g, '')
    .trim()
    .replace(/\s+/g, '-')
    .toLowerCase()
}

async function waitForAssets(root: HTMLElement): Promise<void> {
  if ('fonts' in document) {
    try {
      await (document as Document & { fonts: FontFaceSet }).fonts.ready
    } catch {
      // ignore
    }
  }

  const images = Array.from(root.querySelectorAll('img'))

  await Promise.all(
    images.map(async (img) => {
      try {
        if (img.complete) return

        if ('decode' in img) {
          await img.decode()
          return
        }

        await new Promise<void>((resolve) => {
          img.onload = () => resolve()
          img.onerror = () => resolve()
        })
      } catch {
        // ignore
      }
    })
  )
}

async function renderCertificateCanvas(element: HTMLElement): Promise<HTMLCanvasElement> {
  await waitForAssets(element)

  return html2canvas(element, {
    scale: 3,
    useCORS: true,
    backgroundColor: '#ffffff',
    logging: false,
    width: ARTBOARD_WIDTH,
    height: ARTBOARD_HEIGHT,
    windowWidth: ARTBOARD_WIDTH,
    windowHeight: ARTBOARD_HEIGHT,
    scrollX: 0,
    scrollY: 0,
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
}: Props) {
  const certificateRef = useRef<HTMLDivElement>(null)
  const previewWrapRef = useRef<HTMLDivElement>(null)

  const isEs = language === 'es'
  const [previewScale, setPreviewScale] = useState(1)
  const [isDownloading, setIsDownloading] = useState(false)
  const [previewImage, setPreviewImage] = useState<string | null>(null)
  const [isRenderingPreview, setIsRenderingPreview] = useState(false)

  const formattedDate = useMemo(
    () => formatCertificateDate(completionDate, isEs),
    [completionDate, isEs]
  )

  useEffect(() => {
    function updateScale() {
      const wrap = previewWrapRef.current
      if (!wrap) return

      const availableWidth = Math.max(wrap.clientWidth - 24, 320)
      const nextScale = Math.min(0.85, availableWidth / ARTBOARD_WIDTH)
      setPreviewScale(nextScale)
    }

    updateScale()
    window.addEventListener('resize', updateScale)

    return () => window.removeEventListener('resize', updateScale)
  }, [])

  useEffect(() => {
    let cancelled = false

    async function generatePreview() {
      const element = certificateRef.current
      if (!element) return

      try {
        setIsRenderingPreview(true)
        const canvas = await renderCertificateCanvas(element)
        const dataUrl = canvas.toDataURL('image/png')

        if (!cancelled) {
          setPreviewImage(dataUrl)
        }
      } catch (error) {
        console.error('Failed to generate certificate preview:', error)
      } finally {
        if (!cancelled) {
          setIsRenderingPreview(false)
        }
      }
    }

    generatePreview()

    return () => {
      cancelled = true
    }
  }, [fullName, courseTitle, formattedDate, certNumber, signatureUrl, language])

  const handleDownloadPdf = useCallback(async () => {
    const element = certificateRef.current
    if (!element || isDownloading) return

    try {
      setIsDownloading(true)

      const canvas = await renderCertificateCanvas(element)
      const imageData = canvas.toDataURL('image/png')

      const pdf = new jsPDF({
        orientation: 'landscape',
        unit: 'mm',
        format: 'a4',
        compress: true,
      })

      pdf.addImage(imageData, 'PNG', 0, 0, 297, 210, undefined, 'FAST')

      const fileName = `certificate-${sanitizeFileName(fullName)}-${sanitizeFileName(certNumber)}.pdf`
      pdf.save(fileName)
    } catch (error) {
      console.error('Failed to download certificate PDF:', error)
    } finally {
      setIsDownloading(false)
    }
  }, [certNumber, fullName, isDownloading])

  const T = {
    line1: isEs
      ? 'Este Certificado es otorgado a'
      : 'This Certificate is awarded to',
    recLine: isEs
      ? 'en reconocimiento por la exitosa finalización del Curso en el'
      : 'in recognition of the successful completion of the online course on the',
    conf: isEs
      ? 'de conformidad con la Metodología y las Directrices de INSARAG e ICMS.'
      : 'in accordance with INSARAG and ICMS Methodology and Guidelines.',
    certNo: isEs
      ? `Certificado N.º: ${certNumber}`
      : `Certificate No.: ${certNumber}`,
    myCerts: isEs ? 'Mis Certificados' : 'My Certificates',
    back: isEs ? 'Volver al Curso' : 'Back to Course',
    download: isEs ? 'Descargar PDF' : 'Download PDF',
    downloading: isEs ? 'Descargando...' : 'Downloading...',
    hint: isEs
      ? 'Haz clic en "Descargar PDF" para bajar el certificado directamente.'
      : 'Click "Download PDF" to download the certificate directly.',
    rendering: isEs ? 'Renderizando vista previa...' : 'Rendering preview...',
    preparing: isEs ? 'Preparando certificado...' : 'Preparing certificate...',
  }

  const courseText = loc(courseTitle, language)
  const BLUE = '#0B4A7C'
  const BLUE_LT = '#7AC8E8'
  const TEXT_DARK = '#111827'
  const TEXT_MID = '#374151'

  return (
    <>
      <style
        dangerouslySetInnerHTML={{
          __html: `
            html, body {
              margin: 0;
              padding: 0;
            }

            * {
              box-sizing: border-box;
            }

            .certificate-page {
              min-height: 100vh;
              background: #d1d5db;
            }

            .certificate-preview-wrap {
              display: flex;
              justify-content: center;
              padding: 0 24px 64px;
              overflow-x: auto;
            }

            .certificate-scale-box {
              transform-origin: top center;
              flex-shrink: 0;
            }

            .certificate-sheet {
              width: ${ARTBOARD_WIDTH}px;
              height: ${ARTBOARD_HEIGHT}px;
              position: relative;
              background: #fff;
              overflow: hidden;
              font-family: Roboto, Arial, sans-serif;
              box-shadow: 0 20px 60px rgba(0,0,0,0.3);
              flex-shrink: 0;
            }

            @media print {
              .no-print {
                display: none !important;
              }
            }
          `,
        }}
      />

      <div className="certificate-page">
        <div
          className="no-print"
          style={{ maxWidth: 960, margin: '0 auto', padding: '24px 24px 0' }}
        >
          <div
            style={{
              display: 'flex',
              flexWrap: 'wrap',
              alignItems: 'center',
              justifyContent: 'space-between',
              gap: 16,
              marginBottom: 24,
            }}
          >
            <div>
              <h1 style={{ fontSize: 20, fontWeight: 700, color: '#111827', margin: 0 }}>
                {isEs ? 'Tu Certificado' : 'Your Certificate'}
              </h1>
              <p style={{ fontSize: 12, color: '#9ca3af', margin: '4px 0 0' }}>
                {T.hint}
              </p>
            </div>

            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 12 }}>
              <Link
                href="/certificates"
                style={{
                  borderRadius: 8,
                  border: '1px solid #e5e7eb',
                  background: '#fff',
                  padding: '10px 20px',
                  fontSize: 14,
                  fontWeight: 600,
                  color: '#4b5563',
                  textDecoration: 'none',
                }}
              >
                ← {T.myCerts}
              </Link>

              <Link
                href={`/courses/${courseSlug}`}
                style={{
                  borderRadius: 8,
                  border: '1px solid #e5e7eb',
                  background: '#fff',
                  padding: '10px 20px',
                  fontSize: 14,
                  fontWeight: 600,
                  color: '#4b5563',
                  textDecoration: 'none',
                }}
              >
                ← {T.back}
              </Link>

              <button
                onClick={handleDownloadPdf}
                disabled={isDownloading}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 8,
                  borderRadius: 8,
                  background: BLUE,
                  border: 'none',
                  padding: '10px 24px',
                  fontSize: 14,
                  fontWeight: 700,
                  color: '#fff',
                  cursor: isDownloading ? 'default' : 'pointer',
                  opacity: isDownloading ? 0.8 : 1,
                }}
              >
                <svg width="16" height="16" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M12 10v6m0 0l-3-3m3 3l3-3M3 17V7a2 2 0 012-2h6l2 2h6a2 2 0 012 2v8a2 2 0 01-2 2H5a2 2 0 01-2-2z"
                  />
                </svg>
                {isDownloading ? T.downloading : T.download}
              </button>
            </div>
          </div>
        </div>

        <div ref={previewWrapRef} className="certificate-preview-wrap">
          <div
            className="certificate-scale-box"
            style={{
              width: ARTBOARD_WIDTH,
              height: ARTBOARD_HEIGHT,
              transform: `scale(${previewScale})`,
              marginBottom: -(ARTBOARD_HEIGHT * (1 - previewScale)) - 40,
            }}
          >
            {previewImage ? (
              <img
                src={previewImage}
                alt="Certificate preview"
                style={{
                  display: 'block',
                  width: ARTBOARD_WIDTH,
                  height: ARTBOARD_HEIGHT,
                  background: '#fff',
                  boxShadow: '0 20px 60px rgba(0,0,0,0.3)',
                }}
              />
            ) : (
              <div
                className="certificate-sheet"
                style={{
                  display: 'grid',
                  placeItems: 'center',
                  color: '#6b7280',
                  fontSize: 16,
                }}
              >
                {isRenderingPreview ? T.rendering : T.preparing}
              </div>
            )}
          </div>
        </div>

        <div
          aria-hidden="true"
          style={{
            position: 'fixed',
            left: '-20000px',
            top: 0,
            width: ARTBOARD_WIDTH,
            height: ARTBOARD_HEIGHT,
            pointerEvents: 'none',
          }}
        >
          <CertBody
            ref={certificateRef}
            fullName={fullName}
            courseText={courseText}
            formattedDate={formattedDate}
            certNo={T.certNo}
            signatureUrl={signatureUrl}
            line1={T.line1}
            recLine={T.recLine}
            conf={T.conf}
            BLUE={BLUE}
            BLUE_LT={BLUE_LT}
            TEXT_DARK={TEXT_DARK}
            TEXT_MID={TEXT_MID}
          />
        </div>
      </div>
    </>
  )
}

const CertBody = forwardRef<HTMLDivElement, CertBodyProps>(function CertBody(
  {
    fullName,
    courseText,
    formattedDate,
    certNo,
    signatureUrl,
    line1,
    recLine,
    conf,
    BLUE,
    BLUE_LT,
    TEXT_DARK,
    TEXT_MID,
  },
  ref
) {
  return (
    <div ref={ref} className="certificate-sheet">
      <div
        style={{
          position: 'absolute',
          inset: 14,
          border: `3px solid ${BLUE}`,
          zIndex: 10,
          pointerEvents: 'none',
        }}
      />
      <div
        style={{
          position: 'absolute',
          inset: 21,
          border: `1px solid ${BLUE_LT}`,
          zIndex: 10,
          pointerEvents: 'none',
        }}
      />

      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src="/un-emblem-light.png"
        alt=""
        aria-hidden
        style={{
          position: 'absolute',
          top: '50%',
          left: '50%',
          transform: 'translate(-50%, -50%)',
          width: 470,
          height: 470,
          opacity: 0.32,
          zIndex: 1,
          pointerEvents: 'none',
        }}
      />

      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src="/insarag-logo-blue.svg"
        alt="INSARAG"
        style={{
          position: 'absolute',
          top: 44,
          right: 52,
          height: 74,
          width: 'auto',
          zIndex: 5,
        }}
      />

      <div
        style={{
          position: 'absolute',
          inset: 0,
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          textAlign: 'center',
          padding: '120px 110px 160px',
          zIndex: 3,
        }}
      >
        <p
          style={{
            fontSize: 24,
            fontWeight: 300,
            color: TEXT_MID,
            margin: '0 0 8px',
            lineHeight: 1.4,
          }}
        >
          {line1}
        </p>

        <h1
          style={{
            fontSize: 64,
            fontWeight: 700,
            color: TEXT_DARK,
            margin: '0 0 18px',
            lineHeight: 1.1,
            letterSpacing: '-0.008em',
            wordBreak: 'break-word',
            maxWidth: '90%',
          }}
        >
          {fullName}
        </h1>

        <div
          style={{
            width: '48%',
            height: 2,
            background: BLUE,
            margin: '0 0 26px',
          }}
        />

        <p
          style={{
            fontSize: 21,
            fontWeight: 300,
            color: TEXT_MID,
            margin: '0 0 6px',
            lineHeight: 1.45,
          }}
        >
          {recLine}
        </p>

        <p
          style={{
            fontSize: 31,
            fontWeight: 700,
            color: TEXT_DARK,
            margin: '0 0 6px',
            lineHeight: 1.26,
            maxWidth: '88%',
          }}
        >
          {courseText}
        </p>

        <p
          style={{
            fontSize: 21,
            fontWeight: 300,
            color: TEXT_MID,
            margin: '0 0 30px',
            lineHeight: 1.45,
          }}
        >
          {conf}
        </p>

        <p
          style={{
            fontSize: 21,
            color: TEXT_MID,
            margin: '0 0 6px',
            lineHeight: 1.35,
          }}
        >
          {formattedDate}
        </p>

        <p
          style={{
            fontSize: 17,
            fontWeight: 300,
            color: TEXT_MID,
            margin: 0,
            lineHeight: 1.35,
          }}
        >
          {certNo}
        </p>
      </div>

      <div
        style={{
          position: 'absolute',
          bottom: 36,
          right: 68,
          width: 275,
          textAlign: 'center',
          zIndex: 5,
        }}
      >
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={signatureUrl || '/signature-stampa.png'}
          alt="Signature"
          style={{
            height: 62,
            display: 'block',
            margin: '0 auto 8px',
            width: 'auto',
          }}
        />

        <div
          style={{
            width: '100%',
            height: 1,
            background: TEXT_DARK,
            marginBottom: 8,
          }}
        />

        <p
          style={{
            fontSize: 18,
            fontWeight: 700,
            color: BLUE,
            margin: 0,
            lineHeight: 1.3,
          }}
        >
          Sebastian Rhodes Stampa
        </p>

        <p
          style={{
            fontSize: 16,
            color: BLUE,
            margin: '4px 0 0',
            lineHeight: 1.3,
          }}
        >
          Secretary INSARAG
        </p>

        <p
          style={{
            fontSize: 14,
            fontWeight: 300,
            color: BLUE,
            margin: '8px 0 0',
            lineHeight: 1.3,
          }}
        >
          UN Office for the Coordination of
        </p>

        <p
          style={{
            fontSize: 14,
            fontWeight: 300,
            color: BLUE,
            margin: '2px 0 0',
            lineHeight: 1.3,
          }}
        >
          Humanitarian Affairs (OCHA), Geneva
        </p>
      </div>
    </div>
  )
})

CertBody.displayName = 'CertBody'