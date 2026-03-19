// src/lib/certificate/layout.ts
// Single source of truth for certificate dimensions and colors.
// Both the HTML preview and PDF renderer use these exact values.
// HTML renders at W×H px; PDF renders at (W×SCALE)×(H×SCALE) pt.

export const W = 1123  // certificate width  (HTML px / PDF base unit)
export const H = 794   // certificate height (HTML px / PDF base unit)
export const SCALE = 841.89 / W  // 0.7497 — pt per px

// ─── Colors ────────────────────────────────────────────────────────────────────
export const C = {
  parchment:  '#F4EFE4',
  parchDk:    '#D0C8B8',
  blue:       '#0B4A7C',
  blueMid:    '#1A6DAF',
  blueLight:  '#5B9BC8',
  bluePale:   '#EAF2FA',
  gold:       '#B8975A',
  textDark:   '#1A2340',
  textMid:    '#3D4A6B',
  textLight:  '#8A9AB5',
  white:      '#FFFFFF',
} as const

// ─── Layout constants ──────────────────────────────────────────────────────────
// Left blue sidebar
export const SIDEBAR_X = 28
export const SIDEBAR_W = 88
export const SIDEBAR_Y = 20   // from top
export const SIDEBAR_H = H - 40  // height

// Content area (to the right of sidebar)
export const CONTENT_X = SIDEBAR_X + SIDEBAR_W + 22
export const CONTENT_W = W - CONTENT_X - 50

// Margins
export const MARGIN_T = 34
export const MARGIN_B = 26
export const FOOTER_H = 105

// Body vertical center (between header line and footer)
export const HEADER_LINE_Y = 175  // from top, where decorative line sits
export const BODY_TOP    = HEADER_LINE_Y + 14
export const BODY_BOTTOM = H - MARGIN_B - FOOTER_H
export const BODY_CY     = (BODY_TOP + BODY_BOTTOM) / 2  // ~370

// ─── Sidebar stripes ───────────────────────────────────────────────────────────
export const STRIPES = [
  { w: 32, color: C.blue      },
  { w:  6, color: C.bluePale  },
  { w: 12, color: C.blueLight },
  { w:  6, color: C.bluePale  },
  { w: 12, color: C.blueLight },
  { w:  6, color: C.bluePale  },
  { w: 14, color: C.blue      },
] as const

// ─── i18n ──────────────────────────────────────────────────────────────────────
export type Lang = 'en' | 'es'

export const TRANSLATIONS = {
  en: {
    awarded:      'This Certificate of Achievement is to acknowledge that',
    recognition:  'has successfully completed the online course on the',
    conformity:   'in accordance with INSARAG and ICMS Methodology and Guidelines.',
    issuedLabel:  'ISSUED ON',
    certNoLabel:  'CERTIFICATE NO.',
    signName:     'Sebastian Rhodes Stampa',
    signTitle:    'Secretary INSARAG',
    signOrg1:     'UN Office for the Coordination of',
    signOrg2:     'Humanitarian Affairs (OCHA), Geneva',
    insaragFull:  'INTERNATIONAL SEARCH AND RESCUE ADVISORY GROUP',
  },
  es: {
    awarded:      'Este Certificado de Logro es para reconocer que',
    recognition:  'ha completado exitosamente el curso en línea sobre el',
    conformity:   'de conformidad con la Metodología y las Directrices de INSARAG e ICMS.',
    issuedLabel:  'EMITIDO EL',
    certNoLabel:  'CERTIFICADO N.º',
    signName:     'Sebastian Rhodes Stampa',
    signTitle:    'Secretary INSARAG',
    signOrg1:     'Oficina de la ONU para la Coordinación de',
    signOrg2:     'Asuntos Humanitarios (OCHA), Ginebra',
    insaragFull:  'GRUPO ASESOR INTERNACIONAL DE BÚSQUEDA Y RESCATE',
  },
} as const