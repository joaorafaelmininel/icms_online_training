// src/components/courses/CertificateClient.tsx
'use client';

import { useRef, useState, useCallback } from 'react';
import Link from 'next/link';

type Lang = 'en' | 'es';
interface LocalizedText { en: string; es: string; }

const i18n = {
  en: {
    pageTitle: 'Your Certificate',
    downloading: 'Generating PDF...',
    download: 'Download PDF',
    backToCourse: 'Back to Course',
    printHint: 'You can also use Ctrl+P / Cmd+P to print directly.',
    // Certificate text — matching official INSARAG template
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
}

export default function CertificateClient({
  courseTitle,
  courseSlug,
  fullName,
  completionDate,
  score,
  certNumber,
  language,
}: Props) {
  const t = i18n[language];
  const certRef = useRef<HTMLDivElement>(null);
  const [downloading, setDownloading] = useState(false);

  const formattedDate = new Date(completionDate).toLocaleDateString(
    language === 'es' ? 'es-ES' : 'en-US',
    { year: 'numeric', month: 'long', day: 'numeric' }
  );

  const handleDownload = useCallback(async () => {
    if (!certRef.current) return;
    setDownloading(true);

    try {
      const html2canvas = (await import('html2canvas')).default;
      const { jsPDF } = await import('jspdf');

      const el = certRef.current;
      const canvas = await html2canvas(el, {
        scale: 2,
        useCORS: true,
        allowTaint: true,
        backgroundColor: '#FFFFFF',
        width: el.scrollWidth,
        height: el.scrollHeight,
      });

      const pdf = new jsPDF({
        orientation: 'landscape',
        unit: 'mm',
        format: 'a4',
      });

      const pageWidth = pdf.internal.pageSize.getWidth();
      const pageHeight = pdf.internal.pageSize.getHeight();
      const imgData = canvas.toDataURL('image/png');

      pdf.addImage(imgData, 'PNG', 0, 0, pageWidth, pageHeight);
      pdf.save(`ICMS-Certificate-${fullName.replace(/\s+/g, '-')}.pdf`);
    } catch (err) {
      console.error('PDF generation error:', err);
      window.print();
    } finally {
      setDownloading(false);
    }
  }, [fullName]);

  // ─── Light blue from the official template ────────────────────────────
  const borderBlue = '#7EC8E3';

  return (
    <div className="min-h-screen bg-gray-100">
      {/* ── Controls (hidden on print) ────────────────────────────────── */}
      <div className="mx-auto max-w-4xl px-4 py-6 print:hidden sm:px-6">
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

      {/* ══════════════════════════════════════════════════════════════════
          CERTIFICATE — Matching official INSARAG template
      ══════════════════════════════════════════════════════════════════ */}
      <div className="mx-auto max-w-5xl px-4 pb-12 print:max-w-none print:p-0 sm:px-6">
        <div
          ref={certRef}
          className="relative mx-auto overflow-hidden bg-white shadow-2xl print:shadow-none"
          style={{
            aspectRatio: '297 / 210',
            maxWidth: '920px',
          }}
        >
          {/* ── Decorative border frame (matching INSARAG style) ──────── */}
          {/* Outer border */}
          <div
            className="absolute inset-[10px] rounded-[2px]"
            style={{ border: `3px solid ${borderBlue}` }}
          />
          {/* Inner decorative dashed border */}
          <div
            className="absolute inset-[18px] rounded-[1px]"
            style={{ border: `1.5px dashed ${borderBlue}` }}
          />
          {/* Second inner solid border */}
          <div
            className="absolute inset-[24px] rounded-[1px]"
            style={{ border: `1px solid ${borderBlue}` }}
          />

          {/* ── Content ────────────────────────────────────────────────── */}
          <div className="relative flex h-full flex-col px-16 py-10 sm:px-20 sm:py-12">

            {/* ── TOP: INSARAG Logo (right-aligned, matching template) ── */}
            <div className="flex justify-end">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src="/insarag-logo-blue.svg"
                alt="INSARAG"
                className="h-16 w-auto sm:h-20"
                crossOrigin="anonymous"
              />
            </div>

            {/* ── MIDDLE: Certificate body ─────────────────────────────── */}
            <div className="flex flex-1 flex-col items-center justify-center text-center" style={{ marginTop: '-8px' }}>
              {/* "This Certificate is awarded to" */}
              <p
                className="text-base text-gray-600 sm:text-lg"
                style={{ fontFamily: 'Roboto, "Helvetica Neue", Arial, sans-serif' }}
              >
                {t.certAwarded}
              </p>

              {/* ── Recipient name ──────────────────────────────────────── */}
              <h1
                className="mt-4 text-4xl font-normal text-gray-900 sm:text-5xl"
                style={{ fontFamily: 'Roboto, "Helvetica Neue", Arial, sans-serif' }}
              >
                {fullName}
              </h1>
              {/* Name underline */}
              <div className="mt-2 h-[2px] w-[80%] max-w-md bg-gray-800" />

              {/* ── Recognition text ────────────────────────────────────── */}
              <p
                className="mt-5 text-sm text-gray-600 sm:text-base"
                style={{ fontFamily: 'Roboto, "Helvetica Neue", Arial, sans-serif' }}
              >
                {t.certRecognition}
              </p>
              <p
                className="mt-1 text-base font-bold text-gray-900 sm:text-lg"
                style={{ fontFamily: 'Roboto, "Helvetica Neue", Arial, sans-serif' }}
              >
                {t.certCourseName}
              </p>
              <p
                className="mt-1 text-sm text-gray-600 sm:text-base"
                style={{ fontFamily: 'Roboto, "Helvetica Neue", Arial, sans-serif' }}
              >
                {t.certConformity}
              </p>

              {/* ── Date ────────────────────────────────────────────────── */}
              <p
                className="mt-5 text-sm text-gray-700 sm:text-base"
                style={{ fontFamily: 'Roboto, "Helvetica Neue", Arial, sans-serif' }}
              >
                {formattedDate}
              </p>
              <p
                className="mt-0.5 text-sm text-gray-500"
                style={{ fontFamily: 'Roboto, "Helvetica Neue", Arial, sans-serif' }}
              >
                {t.certOnline}
              </p>
            </div>

            {/* ── BOTTOM: Signature block (right-aligned) ──────────────── */}
            <div className="flex justify-end">
              <div className="text-right">
                {/* Signature placeholder (italic script) */}
                <p
                  className="mb-0 text-2xl text-gray-400"
                  style={{
                    fontFamily: '"Segoe Script", "Brush Script MT", "Dancing Script", cursive',
                    fontStyle: 'italic',
                  }}
                >
                  S. Rhodes Stampa
                </p>
                {/* Signature line */}
                <div className="ml-auto mt-0 h-[1.5px] w-44 bg-gray-800" />
                {/* Name & role */}
                <p
                  className="mt-2 text-sm font-normal text-gray-700 sm:text-base"
                  style={{ fontFamily: 'Roboto, "Helvetica Neue", Arial, sans-serif' }}
                >
                  {t.certSignName}
                </p>
                <p
                  className="text-xs text-gray-600 sm:text-sm"
                  style={{ fontFamily: 'Roboto, "Helvetica Neue", Arial, sans-serif' }}
                >
                  {t.certSignTitle}
                </p>
                <p
                  className="text-xs text-gray-600 sm:text-sm"
                  style={{ fontFamily: 'Roboto, "Helvetica Neue", Arial, sans-serif' }}
                >
                  {t.certSignOrg}
                </p>
                <p
                  className="text-xs text-gray-600 sm:text-sm"
                  style={{ fontFamily: 'Roboto, "Helvetica Neue", Arial, sans-serif' }}
                >
                  {t.certSignOrg2}
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* ── Font + Print styles ─────────────────────────────────────────── */}
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
