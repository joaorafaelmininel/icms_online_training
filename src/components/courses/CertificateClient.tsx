'use client';

import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import Link from 'next/link';

type Lang = 'en' | 'es';

interface LocalizedText {
  en: string;
  es: string;
}

function loc(field: LocalizedText | string | null | undefined, lang: Lang): string {
  if (!field) return '';
  if (typeof field === 'string') return field;
  return field[lang] || field.en || '';
}

const i18n = {
  en: {
    pageTitle: 'Your Certificate',
    downloading: 'Generating PDF...',
    download: 'Download PDF',
    backToCourse: 'Back to Course',
    printHint: 'The PDF is generated from the same file shown on screen.',
    institution: 'INSARAG — INTERNATIONAL SEARCH AND RESCUE ADVISORY GROUP',
    certTitle: 'Certificate',
    certAwarded: 'This is to certify that',
    certRecognition: 'has successfully completed the online course on the',
    certConformity: 'in accordance with INSARAG and ICMS Methodology and Guidelines.',
    dateLabel: 'DATE OF COMPLETION',
    certNumber: 'CERTIFICATE NO.',
    certSignName: 'Sebastian Rhodes Stampa',
    certSignTitle: 'Secretary INSARAG',
    certSignOrg: 'UN Office for the Coordination of Humanitarian Affairs (OCHA), Geneva',
    loadingCertificate: 'Loading certificate...',
  },
  es: {
    pageTitle: 'Tu Certificado',
    downloading: 'Generando PDF...',
    download: 'Descargar PDF',
    backToCourse: 'Volver al Curso',
    printHint: 'El PDF se genera a partir del mismo fichero mostrado en pantalla.',
    institution: 'INSARAG — GRUPO ASESOR INTERNACIONAL DE BÚSQUEDA Y RESCATE',
    certTitle: 'Certificado',
    certAwarded: 'Se certifica que',
    certRecognition: 'ha completado exitosamente el curso en línea sobre el',
    certConformity: 'de conformidad con la Metodología y las Directrices de INSARAG e ICMS.',
    dateLabel: 'FECHA DE FINALIZACIÓN',
    certNumber: 'CERTIFICADO N.º',
    certSignName: 'Sebastian Rhodes Stampa',
    certSignTitle: 'Secretary INSARAG',
    certSignOrg: 'Oficina de la ONU para la Coordinación de Asuntos Humanitarios (OCHA), Ginebra',
    loadingCertificate: 'Cargando certificado...',
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
  signatureUrl?: string;
}

const CERT_W = 1123;
const CERT_H = 794;

const BLUE = '#4A90C4';
const DARK_BLUE = '#1B4F8A';
const TEXT_DARK = '#1B2A4A';
const MUTED = '#64748B';
const LIGHT = '#94A3B8';
const BORDER = '#E2E8F0';

function escapeXml(value: string): string {
  return value
    .replace(/&/g, '&amp;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&apos;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;');
}

function formatCertificateDate(date: string, language: Lang): string {
  return new Date(date).toLocaleDateString(language === 'es' ? 'es-ES' : 'en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });
}

function wrapTextByApproxLength(text: string, maxCharsPerLine: number, maxLines = 2): string[] {
  const words = text.trim().split(/\s+/);
  const lines: string[] = [];
  let current = '';

  for (const word of words) {
    const candidate = current ? `${current} ${word}` : word;
    if (candidate.length <= maxCharsPerLine) {
      current = candidate;
    } else {
      if (current) lines.push(current);
      current = word;
      if (lines.length === maxLines - 1) break;
    }
  }

  if (current && lines.length < maxLines) {
    lines.push(current);
  }

  const consumedWords = lines.join(' ').split(/\s+/).filter(Boolean).length;
  if (consumedWords < words.length && lines.length > 0) {
    const remaining = words.slice(consumedWords).join(' ');
    lines[lines.length - 1] = `${lines[lines.length - 1]} ${remaining}`.trim();
  }

  return lines.slice(0, maxLines);
}

function buildCourseTitleTspans(courseTitle: string): string {
  const lines = wrapTextByApproxLength(courseTitle, 34, 2);
  const firstDy = 0;
  const secondDy = 30;

  return lines
    .map((line, index) => {
      const dy = index === 0 ? firstDy : secondDy;
      return `<tspan x="561.5" dy="${dy}">${escapeXml(line)}</tspan>`;
    })
    .join('');
}

function buildSignatureBlock(signatureDataUrl?: string): string {
  if (signatureDataUrl) {
    return `
      <image
        href="${escapeXml(signatureDataUrl)}"
        x="486"
        y="640"
        width="150"
        height="50"
        preserveAspectRatio="xMidYMid meet"
      />
    `;
  }

  return `
    <text
      x="561.5"
      y="676"
      text-anchor="middle"
      font-family="cursive"
      font-style="italic"
      font-size="26"
      fill="#334155"
    >
      S. Rhodes Stampa
    </text>
  `;
}

function buildCertificateSvg(params: {
  t: typeof i18n.en;
  fullName: string;
  courseTitle: string;
  formattedDate: string;
  certNumber: string;
  logoDataUrl: string;
  emblemDataUrl: string;
  signatureDataUrl?: string;
}) {
  const {
    t,
    fullName,
    courseTitle,
    formattedDate,
    certNumber,
    logoDataUrl,
    emblemDataUrl,
    signatureDataUrl,
  } = params;

  const safeName = escapeXml(fullName);
  const safeInstitution = escapeXml(t.institution);
  const safeAwarded = escapeXml(t.certAwarded);
  const safeRecognition = escapeXml(t.certRecognition);
  const safeConformity = escapeXml(t.certConformity);
  const safeDate = escapeXml(formattedDate);
  const safeCertNumber = escapeXml(certNumber);
  const safeCertNumberLabel = escapeXml(t.certNumber);
  const safeDateLabel = escapeXml(t.dateLabel);
  const safeSignName = escapeXml(t.certSignName);
  const safeSignTitle = escapeXml(t.certSignTitle);
  const safeSignOrg = escapeXml(t.certSignOrg);

  const courseTitleTspans = buildCourseTitleTspans(courseTitle);
  const signatureBlock = buildSignatureBlock(signatureDataUrl);

  return `
  <svg
    xmlns="http://www.w3.org/2000/svg"
    xmlns:xlink="http://www.w3.org/1999/xlink"
    width="${CERT_W}"
    height="${CERT_H}"
    viewBox="0 0 ${CERT_W} ${CERT_H}"
    role="img"
    aria-label="INSARAG Certificate"
  >
    <defs>
      <style>
        .playfair {
          font-family: "Playfair Display", Georgia, serif;
        }
        .roboto {
          font-family: Roboto, Arial, sans-serif;
        }
      </style>
    </defs>

    <rect x="0" y="0" width="${CERT_W}" height="${CERT_H}" fill="#FFFFFF" />

    <rect x="12" y="12" width="${CERT_W - 24}" height="${CERT_H - 24}" fill="none" stroke="${DARK_BLUE}" stroke-width="2.5" />
    <rect x="18" y="18" width="${CERT_W - 36}" height="${CERT_H - 36}" fill="none" stroke="${BLUE}" stroke-width="0.8" opacity="0.5" />

    <image
      href="${escapeXml(emblemDataUrl)}"
      xlink:href="${escapeXml(emblemDataUrl)}"
      x="351.5"
      y="187"
      width="420"
      height="420"
      opacity="0.07"
      preserveAspectRatio="xMidYMid meet"
    />

    <rect x="0" y="0" width="${CERT_W}" height="6" fill="${DARK_BLUE}" />
    <line x1="0" y1="130" x2="${CERT_W}" y2="130" stroke="${BORDER}" stroke-width="1" />
    <line x1="0" y1="644" x2="${CERT_W}" y2="644" stroke="${BORDER}" stroke-width="1" />
    <rect x="0" y="${CERT_H - 3}" width="${CERT_W}" height="3" fill="${BLUE}" />

    <image
      href="${escapeXml(logoDataUrl)}"
      xlink:href="${escapeXml(logoDataUrl)}"
      x="396"
      y="24"
      width="331"
      height="58"
      preserveAspectRatio="xMidYMid meet"
    />

    <text
      x="561.5"
      y="106"
      text-anchor="middle"
      class="roboto"
      font-size="10.5"
      font-weight="600"
      letter-spacing="1.2"
      fill="${DARK_BLUE}"
    >
      ${safeInstitution}
    </text>

    <text
      x="561.5"
      y="275"
      text-anchor="middle"
      class="playfair"
      font-size="80"
      font-weight="700"
      fill="${TEXT_DARK}"
    >
      ${escapeXml(t.certTitle)}
    </text>

    <line x1="391.5" y1="298" x2="536" y2="298" stroke="${BLUE}" stroke-width="1" opacity="0.45" />
    <polygon points="561.5,295 566.5,300 561.5,305 556.5,300" fill="${BLUE}" opacity="0.65" />
    <line x1="587" y1="298" x2="731.5" y2="298" stroke="${BLUE}" stroke-width="1" opacity="0.45" />

    <text
      x="561.5"
      y="338"
      text-anchor="middle"
      class="roboto"
      font-size="14"
      fill="${MUTED}"
      letter-spacing="0.3"
    >
      ${safeAwarded}
    </text>

    <text
      x="561.5"
      y="388"
      text-anchor="middle"
      class="playfair"
      font-size="46"
      font-weight="700"
      fill="${TEXT_DARK}"
    >
      ${safeName}
    </text>

    <line x1="196.5" y1="416" x2="926.5" y2="416" stroke="${DARK_BLUE}" stroke-width="2" />
    <line x1="196.5" y1="420" x2="926.5" y2="420" stroke="${BLUE}" stroke-width="1" opacity="0.4" />

    <text
      x="561.5"
      y="454"
      text-anchor="middle"
      class="roboto"
      font-size="14"
      fill="${MUTED}"
    >
      ${safeRecognition}
    </text>

    <text
      x="561.5"
      y="486"
      text-anchor="middle"
      class="playfair"
      font-size="21"
      font-weight="700"
      fill="${TEXT_DARK}"
    >
      ${courseTitleTspans}
    </text>

    <text
      x="561.5"
      y="528"
      text-anchor="middle"
      class="roboto"
      font-size="12"
      fill="${MUTED}"
    >
      ${safeConformity}
    </text>

    <text
      x="60"
      y="705"
      class="roboto"
      font-size="10"
      fill="${LIGHT}"
      font-weight="500"
      letter-spacing="1"
    >
      ${safeCertNumberLabel}
    </text>

    <text
      x="60"
      y="724"
      class="roboto"
      font-size="12"
      fill="#475569"
    >
      ${safeCertNumber}
    </text>

    ${signatureBlock}

    <line x1="471.5" y1="706" x2="651.5" y2="706" stroke="${TEXT_DARK}" stroke-width="1.5" />

    <text
      x="561.5"
      y="725"
      text-anchor="middle"
      class="roboto"
      font-size="13"
      font-weight="700"
      fill="${TEXT_DARK}"
    >
      ${safeSignName}
    </text>

    <text
      x="561.5"
      y="744"
      text-anchor="middle"
      class="roboto"
      font-size="11.5"
      fill="#475569"
    >
      ${safeSignTitle}
    </text>

    <text
      x="561.5"
      y="760"
      text-anchor="middle"
      class="roboto"
      font-size="11"
      fill="${MUTED}"
    >
      ${safeSignOrg}
    </text>

    <text
      x="${CERT_W - 60}"
      y="705"
      text-anchor="end"
      class="roboto"
      font-size="10"
      fill="${LIGHT}"
      font-weight="500"
      letter-spacing="1"
    >
      ${safeDateLabel}
    </text>

    <text
      x="${CERT_W - 60}"
      y="724"
      text-anchor="end"
      class="roboto"
      font-size="13"
      font-weight="500"
      fill="${TEXT_DARK}"
    >
      ${safeDate}
    </text>
  </svg>
  `;
}

async function svgStringToCanvas(
  svgString: string,
  width: number,
  height: number,
  scale = 2
): Promise<HTMLCanvasElement> {
  const svgBlob = new Blob([svgString], { type: 'image/svg+xml;charset=utf-8' });
  const url = URL.createObjectURL(svgBlob);

  try {
    const img = await new Promise<HTMLImageElement>((resolve, reject) => {
      const image = new Image();
      image.crossOrigin = 'anonymous';
      image.onload = () => resolve(image);
      image.onerror = reject;
      image.src = url;
    });

    const canvas = document.createElement('canvas');
    canvas.width = width * scale;
    canvas.height = height * scale;

    const ctx = canvas.getContext('2d');
    if (!ctx) {
      throw new Error('Could not get canvas context.');
    }

    ctx.setTransform(scale, 0, 0, scale, 0, 0);
    ctx.fillStyle = '#FFFFFF';
    ctx.fillRect(0, 0, width, height);
    ctx.drawImage(img, 0, 0, width, height);

    return canvas;
  } finally {
    URL.revokeObjectURL(url);
  }
}

async function fetchAsDataUrl(url: string): Promise<string> {
  const response = await fetch(url, { cache: 'force-cache' });
  if (!response.ok) {
    throw new Error(`Failed to fetch asset: ${url}`);
  }

  const blob = await response.blob();

  return await new Promise<string>((resolve, reject) => {
    const reader = new FileReader();
    reader.onloadend = () => resolve(reader.result as string);
    reader.onerror = reject;
    reader.readAsDataURL(blob);
  });
}

async function preloadCertificateAssets(signatureUrl?: string) {
  const [logoDataUrl, emblemDataUrl, signatureDataUrl] = await Promise.all([
    fetchAsDataUrl('/insarag-logo-blue.svg'),
    fetchAsDataUrl('/un-emblem.svg'),
    signatureUrl ? fetchAsDataUrl(signatureUrl) : Promise.resolve<string | undefined>(undefined),
  ]);

  return {
    logoDataUrl,
    emblemDataUrl,
    signatureDataUrl,
  };
}

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
  const certificateWrapperRef = useRef<HTMLDivElement>(null);
  const [downloading, setDownloading] = useState(false);
  const [certificateSvg, setCertificateSvg] = useState<string>('');
  const [assetsReady, setAssetsReady] = useState(false);

  const formattedDate = useMemo(
    () => formatCertificateDate(completionDate, language),
    [completionDate, language]
  );

  const resolvedCourseTitle = useMemo(
    () => loc(courseTitle, language),
    [courseTitle, language]
  );

  useEffect(() => {
    let cancelled = false;

    async function loadAssetsAndBuildSvg() {
      try {
        setAssetsReady(false);

        const assets = await preloadCertificateAssets(signatureUrl);

        const svg = buildCertificateSvg({
          t,
          fullName,
          courseTitle: resolvedCourseTitle,
          formattedDate,
          certNumber,
          logoDataUrl: assets.logoDataUrl,
          emblemDataUrl: assets.emblemDataUrl,
          signatureDataUrl: assets.signatureDataUrl,
        });

        if (!cancelled) {
          setCertificateSvg(svg);
          setAssetsReady(true);
        }
      } catch (error) {
        console.error('Failed to preload certificate assets:', error);
        if (!cancelled) {
          setCertificateSvg('');
          setAssetsReady(false);
        }
      }
    }

    loadAssetsAndBuildSvg();

    return () => {
      cancelled = true;
    };
  }, [t, fullName, resolvedCourseTitle, formattedDate, certNumber, signatureUrl]);

  const handleDownload = useCallback(async () => {
    if (!certificateSvg) return;

    setDownloading(true);

    try {
      await document.fonts.ready;

      const { jsPDF } = await import('jspdf');

      const canvas = await svgStringToCanvas(certificateSvg, CERT_W, CERT_H, 3);
      const imgData = canvas.toDataURL('image/png', 1.0);

      const pdf = new jsPDF({
        orientation: 'landscape',
        unit: 'mm',
        format: 'a4',
        compress: true,
      });

      const pageW = pdf.internal.pageSize.getWidth();
      const pageH = pdf.internal.pageSize.getHeight();

      pdf.addImage(imgData, 'PNG', 0, 0, pageW, pageH, undefined, 'FAST');
      pdf.save(`ICMS-Certificate-${fullName.replace(/\s+/g, '-')}.pdf`);
    } catch (error) {
      console.error('PDF generation error:', error);
      window.print();
    } finally {
      setDownloading(false);
    }
  }, [certificateSvg, fullName]);

  return (
    <div className="min-h-screen bg-gray-200">
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
              disabled={downloading || !assetsReady || !certificateSvg}
              className="flex items-center gap-2 rounded-lg bg-[#1B4F8A] px-6 py-2.5 text-sm font-bold text-white shadow-sm transition hover:bg-[#163f6e] disabled:opacity-50"
            >
              {downloading ? (
                <>
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
                  {t.downloading}
                </>
              ) : (
                <>
                  <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M12 10v6m0 0l-3-3m3 3l3-3M3 17V7a2 2 0 012-2h6l2 2h6a2 2 0 012 2v8a2 2 0 01-2 2H5a2 2 0 01-2-2z"
                    />
                  </svg>
                  {t.download}
                </>
              )}
            </button>
          </div>
        </div>
      </div>

      <div className="overflow-x-auto pb-16">
        <div
          ref={certificateWrapperRef}
          className="mx-auto overflow-hidden bg-white shadow-2xl"
          style={{
            width: CERT_W,
            height: CERT_H,
          }}
        >
          {certificateSvg ? (
            <div dangerouslySetInnerHTML={{ __html: certificateSvg }} />
          ) : (
            <div className="flex h-full items-center justify-center text-sm text-gray-500">
              {t.loadingCertificate}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}