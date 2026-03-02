// src/components/courses/CertificateClient.tsx
'use client';

import { useRef, useState, useCallback } from 'react';
import Link from 'next/link';

type Lang = 'en' | 'es';
interface LocalizedText { en: string; es: string; }

function loc(field: LocalizedText | string | null | undefined, lang: Lang): string {
  if (!field) return ''
  if (typeof field === 'string') return field
  return field[lang] || field['en'] || ''
}

const i18n = {
  en: {
    pageTitle: 'Your Certificate',
    downloading: 'Generating PDF...',
    download: 'Download PDF',
    backToCourse: 'Back to Course',
    printHint: 'You can also use Ctrl+P / Cmd+P to print directly.',
    certAwarded: 'This Certificate is awarded to',
    certRecognition: 'in recognition of the successful completion of the Online Course on the',
    certCourseName: 'INSARAG Coordination and Management System (ICMS)',
    certConformity: 'in accordance with INSARAG and ICMS Methodology and Guidelines.',
    certOnline: 'Online Training Platform',
    certSignName: 'Sebastian Rhodes Stampa',
    certSignTitle: 'Secretary INSARAG',
    certSignOrg: 'UN Office for the Coordination of',
    certSignOrg2: 'Humanitarian Affairs (OCHA), Geneva',
  },
  es: {
    pageTitle: 'Tu Certificado',
    downloading: 'Generando PDF...',
    download: 'Descargar PDF',
    backToCourse: 'Volver al Curso',
    printHint: 'También puedes usar Ctrl+P / Cmd+P para imprimir directamente.',
    certAwarded: 'Este Certificado es otorgado a',
    certRecognition: 'en reconocimiento por la exitosa finalización del Curso Online en el',
    certCourseName: 'Sistema de Coordinación y Gestión INSARAG (ICMS)',
    certConformity: 'de conformidad con la Metodología y las Directrices de INSARAG e ICMS.',
    certOnline: 'Plataforma de Capacitación Online',
    certSignName: 'Sebastian Rhodes Stampa',
    certSignTitle: 'Secretary INSARAG',
    certSignOrg: 'UN Office for the Coordination of',
    certSignOrg2: 'Humanitarian Affairs (OCHA), Geneva',
  },
};

interface Props {
  courseTitle: LocalizedText;
  courseSlug: string;
  fullName: string;
  completionDate: string;
  score: number;
  certNumber: string;
  language: Lang;
  // Optional: real signature image URL (e.g. /signature-stampa.png)
  signatureUrl?: string;
}

// ── Fixed A4 landscape dimensions at 96 dpi ──────────────────────────────────
// A4 landscape = 297mm × 210mm = 1123px × 794px at 96dpi
const CERT_W = 1123;
const CERT_H = 794;

export default function CertificateClient({
  courseTitle,
  courseSlug,
  fullName,
  completionDate,
  score,
  certNumber,
  language,
  signatureUrl,
}: Props) {
  const t = i18n[language];
  const certRef = useRef<HTMLDivElement>(null);
  const [downloading, setDownloading] = useState(false);

  const formattedDate = new Date(completionDate).toLocaleDateString(
    language === 'es' ? 'es-ES' : 'en-US',
    { year: 'numeric', month: 'long', day: 'numeric' }
  );

  // ── PDF: capture cert div at fixed pixel size → A4 landscape ─────────────
  const handleDownload = useCallback(async () => {
    if (!certRef.current) return;
    setDownloading(true);
    try {
      const html2canvas = (await import('html2canvas')).default;
      const { jsPDF } = await import('jspdf');

      // Capture at exactly CERT_W × CERT_H with scale=2 for retina quality
      const canvas = await html2canvas(certRef.current, {
        scale: 2,
        useCORS: true,
        allowTaint: true,
        backgroundColor: '#FFFFFF',
        width: CERT_W,
        height: CERT_H,
        windowWidth: CERT_W,
        windowHeight: CERT_H,
      });

      const pdf = new jsPDF({
        orientation: 'landscape',
        unit: 'mm',
        format: 'a4',
      });

      const pageW = pdf.internal.pageSize.getWidth();   // 297
      const pageH = pdf.internal.pageSize.getHeight();  // 210

      pdf.addImage(
        canvas.toDataURL('image/png'),
        'PNG',
        0, 0,
        pageW, pageH
      );

      pdf.save(`ICMS-Certificate-${fullName.replace(/\s+/g, '-')}.pdf`);
    } catch (err) {
      console.error('PDF generation error:', err);
      window.print();
    } finally {
      setDownloading(false);
    }
  }, [fullName]);

  const borderBlue = '#7EC8E3';

  return (
    <div className="min-h-screen bg-gray-100">

      {/* ── Controls (hidden on print) ───────────────────────────────────── */}
      <div className="mx-auto max-w-5xl px-4 py-6 print:hidden sm:px-6">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <h1 className="text-xl font-bold text-gray-900">{t.pageTitle}</h1>
            <p className="mt-0.5 text-xs text-gray-400">{t.printHint}</p>
          </div>
          <div className="flex gap-3">
            <Link
              href={`/courses/${courseSlug}`}
              className="rounded-lg border border-gray-200 bg-white px-5 py-2.5 text-sm font-semibold text-gray-600 transition hover:bg-gray-50"
            >
              ← {t.backToCourse}
            </Link>
            <button
              onClick={handleDownload}
              disabled={downloading}
              className="flex items-center gap-2 rounded-lg bg-[#0B4A7C] px-6 py-2.5 text-sm font-bold text-white shadow-sm transition hover:bg-[#083457] disabled:opacity-50"
            >
              {downloading ? (
                <svg className="h-4 w-4 animate-spin" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                </svg>
              ) : (
                <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3M3 17V7a2 2 0 012-2h6l2 2h6a2 2 0 012 2v8a2 2 0 01-2 2H5a2 2 0 01-2-2z" />
                </svg>
              )}
              {downloading ? t.downloading : t.download}
            </button>
          </div>
        </div>
      </div>

      {/* ══════════════════════════════════════════════════════════════════════
          CERTIFICATE — fixed 1123×794px (A4 landscape at 96dpi)
          This guarantees html2canvas captures exactly what we see.
      ══════════════════════════════════════════════════════════════════════ */}
      <div className="overflow-x-auto pb-12">
        <div
          ref={certRef}
          className="relative mx-auto overflow-hidden bg-white shadow-2xl print:shadow-none"
          style={{
            width: `${CERT_W}px`,
            height: `${CERT_H}px`,
            fontFamily: 'Roboto, "Helvetica Neue", Arial, sans-serif',
          }}
        >
          {/* ── Decorative border frame ─────────────────────────────────── */}
          <div className="absolute" style={{ inset: '10px', border: `3px solid ${borderBlue}` }} />
          <div className="absolute" style={{ inset: '18px', border: `1.5px dashed ${borderBlue}` }} />
          <div className="absolute" style={{ inset: '24px', border: `1px solid ${borderBlue}` }} />

          {/* ── Content ────────────────────────────────────────────────────── */}
          <div
            className="relative flex h-full flex-col"
            style={{ padding: '48px 80px 44px 80px' }}
          >

            {/* ── TOP: INSARAG Logo ───────────────────────────────────────── */}
            <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src="/insarag-logo-blue.svg"
                alt="INSARAG"
                style={{ height: '72px', width: 'auto' }}
                crossOrigin="anonymous"
              />
            </div>

            {/* ── MIDDLE: Certificate body ────────────────────────────────── */}
            <div
              style={{
                flex: 1,
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center',
                textAlign: 'center',
                marginTop: '-8px',
              }}
            >
              {/* "This Certificate is awarded to" */}
              <p style={{ fontSize: '17px', color: '#4B5563', margin: 0 }}>
                {t.certAwarded}
              </p>

              {/* Recipient name */}
              <h1
                style={{
                  fontSize: '52px',
                  fontWeight: 400,
                  color: '#111827',
                  margin: '16px 0 0 0',
                  lineHeight: 1.2,
                  paddingBottom: '4px',
                }}
              >
                {fullName}
              </h1>

              {/* Name underline */}
              <div style={{ height: '2px', width: '60%', maxWidth: '440px', background: '#1F2937', marginTop: '12px' }} />

              {/* Recognition text */}
              <p style={{ fontSize: '15px', color: '#4B5563', margin: '20px 0 0 0' }}>
                {t.certRecognition}
              </p>
              <p style={{ fontSize: '17px', fontWeight: 700, color: '#111827', margin: '4px 0 0 0' }}>
                {loc(courseTitle, language)}
              </p>
              <p style={{ fontSize: '15px', color: '#4B5563', margin: '4px 0 0 0' }}>
                {t.certConformity}
              </p>

              {/* Date */}
              <p style={{ fontSize: '15px', color: '#374151', margin: '20px 0 0 0' }}>
                {formattedDate}
              </p>
              <p style={{ fontSize: '13px', color: '#6B7280', margin: '2px 0 0 0' }}>
                {t.certOnline}
              </p>
            </div>

            {/* ── BOTTOM: Signature block ─────────────────────────────────── */}
            <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
              <div style={{ textAlign: 'right' }}>

                {/* Signature — image if available, otherwise cursive text */}
                {signatureUrl ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={signatureUrl}
                    alt="Signature"
                    crossOrigin="anonymous"
                    style={{ height: '56px', width: 'auto', marginLeft: 'auto', display: 'block' }}
                  />
                ) : (
                  <p
                    style={{
                      fontFamily: '"Segoe Script", "Brush Script MT", cursive',
                      fontStyle: 'italic',
                      fontSize: '26px',
                      color: '#6B7280',
                      margin: 0,
                    }}
                  >
                    S. Rhodes Stampa
                  </p>
                )}

                {/* Signature line */}
                <div style={{ height: '1.5px', width: '200px', background: '#1F2937', marginLeft: 'auto', marginTop: '4px' }} />

                {/* Name & role */}
                <p style={{ fontSize: '15px', color: '#374151', margin: '8px 0 0 0' }}>{t.certSignName}</p>
                <p style={{ fontSize: '13px', color: '#4B5563', margin: '2px 0 0 0' }}>{t.certSignTitle}</p>
                <p style={{ fontSize: '13px', color: '#4B5563', margin: '1px 0 0 0' }}>{t.certSignOrg}</p>
                <p style={{ fontSize: '13px', color: '#4B5563', margin: '1px 0 0 0' }}>{t.certSignOrg2}</p>
              </div>
            </div>

          </div>
        </div>
      </div>

      <style jsx global>{`
        @import url('https://fonts.googleapis.com/css2?family=Roboto:wght@300;400;500;700&display=swap');
        @media print {
          body { margin: 0; padding: 0; }
          @page { size: A4 landscape; margin: 0; }
        }
      `}</style>
    </div>
  );
}
