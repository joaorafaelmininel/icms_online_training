// src/lib/certificate/text.ts
// Localized certificate copy — shared by the interactive certificate page and
// the server-rendered print page, so both always show the exact same wording.

export type Lang = 'en' | 'es'

export function getCertificateStrings(lang: Lang, certNumber: string) {
  const isEs = lang === 'es'
  return {
    line1:   isEs ? 'Este Certificado es otorgado a'                               : 'This Certificate is awarded to',
    recLine: isEs ? 'en reconocimiento por la exitosa finalización del Curso en el' : 'in recognition of the successful completion of the online course on the',
    conf:    isEs ? 'de conformidad con la Metodología y las Directrices de INSARAG e ICMS.' : 'in accordance with INSARAG and ICMS Methodology and Guidelines.',
    certNo:  isEs ? `Certificado N.º: ${certNumber}` : `Certificate No.: ${certNumber}`,
  }
}

export function formatCertificateDate(isoDate: string, lang: Lang): string {
  return new Date(isoDate).toLocaleDateString(
    lang === 'es' ? 'es-ES' : 'en-US',
    { year: 'numeric', month: 'long', day: 'numeric' }
  )
}
