// src/components/layout/IcmsManualsSection.tsx
// Landing page section linking to official ICMS reference documentation
// (manuals, guidelines, quick reference guides). PLACEHOLDER content —
// titles, descriptions and hrefs below are examples only, swapped for the
// real manuals (and their hosted PDF URLs) once provided.

type Lang = 'en' | 'es';

interface Manual {
  id: string;
  title: { en: string; es: string };
  description: { en: string; es: string };
  href: string;
  fileSize?: string;
}

// PLACEHOLDER — replace with the real manuals, titles and PDF links.
const manuals: Manual[] = [
  {
    id: 'icms3-user-manual',
    title: { en: 'ICMS3.0 User Manual', es: 'Manual de Usuario ICMS3.0' },
    description: {
      en: 'Complete operational reference for the ICMS3.0 system — field, command, coordination, and network levels.',
      es: 'Referencia operativa completa del sistema ICMS3.0 — niveles de campo, mando, coordinación y red.',
    },
    href: '#',
    fileSize: 'PDF',
  },
  {
    id: 'insarag-guidelines',
    title: { en: 'INSARAG Guidelines', es: 'Directrices INSARAG' },
    description: {
      en: 'The five-volume set of INSARAG Guidelines, including operational forms and technical guidance notes.',
      es: 'El conjunto de cinco volúmenes de las Directrices de INSARAG, incluyendo formularios operativos y notas de orientación técnica.',
    },
    href: '#',
    fileSize: 'PDF',
  },
  {
    id: 'icms3-quick-reference',
    title: { en: 'ICMS3.0 Quick Reference Guide', es: 'Guía de Referencia Rápida ICMS3.0' },
    description: {
      en: 'A condensed field guide covering the core workflows in ArcGIS® QuickCapture and Field Maps.',
      es: 'Una guía de campo condensada que cubre los flujos de trabajo principales en ArcGIS® QuickCapture y Field Maps.',
    },
    href: '#',
    fileSize: 'PDF',
  },
];

export default function IcmsManualsSection({ language }: { language: Lang }) {
  return (
    <section
      className="relative overflow-hidden py-12"
      style={{ background: 'linear-gradient(135deg, #0B4A7C 0%, #083457 100%)' }}
    >
      <div className="absolute inset-0 bg-[url('/grid.svg')] opacity-5" />

      <div className="relative mx-auto max-w-7xl px-6">
        <div className="mx-auto max-w-2xl text-center">
          <span className="inline-block rounded-full bg-white/10 px-3 py-1 text-xs font-bold uppercase tracking-wider text-white/80">
            {language === 'en' ? 'Official Documentation' : 'Documentación Oficial'}
          </span>
          <h2 className="mt-3 text-2xl font-bold text-white md:text-3xl">
            {language === 'en' ? 'ICMS Manuals & Resources' : 'Manuales y Recursos del ICMS'}
          </h2>
          <p className="mt-2 text-sm leading-relaxed text-white/80">
            {language === 'en'
              ? 'Reference documentation to support your understanding of ICMS3.0 — download the official manuals and guides.'
              : 'Documentación de referencia para apoyar tu comprensión del ICMS3.0 — descarga los manuales y guías oficiales.'}
          </p>
        </div>

        <div className="mt-8 grid gap-4 md:grid-cols-3">
          {manuals.map((manual) => (
            <a
              key={manual.id}
              href={manual.href}
              target="_blank"
              rel="noopener noreferrer"
              className="group relative overflow-hidden rounded-xl bg-white p-4 shadow-lg transition hover:-translate-y-1 hover:shadow-2xl"
            >
              {manual.fileSize && (
                <span className="absolute right-3 top-3 rounded-full bg-gray-100 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wide text-gray-500">
                  {manual.fileSize}
                </span>
              )}

              <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-[#0B4A7C] text-white shadow">
                <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                  />
                </svg>
              </div>

              <h3 className="mt-3 text-base font-bold text-gray-900">{manual.title[language]}</h3>
              <p className="mt-1 text-xs leading-relaxed text-gray-600">{manual.description[language]}</p>

              <div className="mt-3 inline-flex items-center gap-1.5 text-xs font-bold text-[#0B4A7C]">
                {language === 'en' ? 'Download PDF' : 'Descargar PDF'}
                <svg
                  className="h-3.5 w-3.5 transition group-hover:translate-y-0.5"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v12m0 0l-4-4m4 4l4-4M4 20h16" />
                </svg>
              </div>
            </a>
          ))}
        </div>
      </div>
    </section>
  );
}
