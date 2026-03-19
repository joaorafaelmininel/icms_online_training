// src/lib/certificate/pdfRenderer.ts
// PDF renderer — coordinates tuned to visually match the HTML preview

import { PDFDocument, rgb, PDFPage } from 'pdf-lib'
import fontkit from '@pdf-lib/fontkit'
import { readFileSync } from 'fs'
import { join } from 'path'
import { C, STRIPES, TRANSLATIONS, Lang } from './layout'

const PUBLIC = join(process.cwd(), 'public')
const FONTS  = join(PUBLIC, 'fonts')

// A4 landscape dimensions in pt
const PW = 841.89
const PH = 595.28

function hexRgb(h: string) {
  const n = parseInt(h.replace('#', ''), 16)
  return rgb(((n >> 16) & 255) / 255, ((n >> 8) & 255) / 255, (n & 255) / 255)
}

// Y from top → Y from bottom (pdf-lib origin)
function y(fromTop: number) { return PH - fromTop }

function wrap(text: string, font: any, size: number, maxW: number): string[] {
  const words = text.split(' ')
  const lines: string[] = []
  let cur = ''
  for (const w of words) {
    const test = cur ? `${cur} ${w}` : w
    if (font.widthOfTextAtSize(test, size) <= maxW) { cur = test }
    else { if (cur) lines.push(cur); cur = w }
  }
  if (cur) lines.push(cur)
  return lines
}

function centered(page: PDFPage, text: string, font: any, size: number, yPt: number, areaX: number, areaW: number, color: any) {
  const tw = font.widthOfTextAtSize(text, size)
  page.drawText(text, { x: areaX + (areaW - tw) / 2, y: yPt, size, font, color })
}

export async function renderCertificatePDF(params: {
  courseTitle: string; fullName: string; completionDate: string
  certNumber: string; language: Lang; courseSlug?: string
}): Promise<Uint8Array> {
  const { courseTitle, fullName, completionDate, certNumber, language } = params
  const T = TRANSLATIONS[language]

  const formattedDate = new Date(completionDate).toLocaleDateString(
    language === 'es' ? 'es-ES' : 'en-US',
    { year: 'numeric', month: 'long', day: 'numeric' }
  )

  const pdfDoc = await PDFDocument.create()
  pdfDoc.registerFontkit(fontkit)

  const fPlayBold   = await pdfDoc.embedFont(readFileSync(join(FONTS, 'PlayfairDisplay-Bold.ttf')))
  const fPlayItalic = await pdfDoc.embedFont(readFileSync(join(FONTS, 'PlayfairDisplay-Italic.ttf')))
  const fPlayReg    = await pdfDoc.embedFont(readFileSync(join(FONTS, 'PlayfairDisplay-Regular.ttf')))
  const fRoboBold   = await pdfDoc.embedFont(readFileSync(join(FONTS, 'Roboto-Bold.ttf')))
  const fRoboReg    = await pdfDoc.embedFont(readFileSync(join(FONTS, 'Roboto-Regular.ttf')))
  const fRoboLight  = await pdfDoc.embedFont(readFileSync(join(FONTS, 'Roboto-Light.ttf')))

  const logoImg = await pdfDoc.embedPng(readFileSync(join(PUBLIC, 'insarag-logo-blue.png')))
  const embImg  = await pdfDoc.embedPng(readFileSync(join(PUBLIC, 'un-emblem-light.png')))
  const sigImg  = await pdfDoc.embedPng(readFileSync(join(PUBLIC, 'signature-stampa.png')))

  const page = pdfDoc.addPage([PW, PH])

  // ── Layout constants (in PDF pt, mirroring HTML px proportions) ─────────────
  const SIDEBAR_X  = 21
  const SIDEBAR_W  = 66
  const SIDEBAR_Y  = 15   // from top
  const SIDEBAR_H  = PH - 30

  const CX = SIDEBAR_X + SIDEBAR_W + 16  // content left
  const CW = PW - CX - 38               // content width
  const MT = 25                          // margin top

  // Body vertical center — matches HTML: ~54% from top
  const BODY_CY = PH * 0.54             // ~321 pt from bottom = ~274 from top

  // Footer
  const FOOTER_H  = 79
  const FOOTER_TOP = PH - 22 - FOOTER_H  // ~494 pt from bottom

  // ── 1. Parchment background ─────────────────────────────────────────────────
  page.drawRectangle({ x: 0, y: 0, width: PW, height: PH, color: hexRgb(C.parchment) })

  // ── 2. Borders ──────────────────────────────────────────────────────────────
  page.drawRectangle({ x: 7.5, y: 7.5, width: PW-15, height: PH-15, borderColor: hexRgb(C.blue), borderWidth: 1.5 })
  page.drawRectangle({ x: 11,  y: 11,  width: PW-22, height: PH-22, borderColor: hexRgb(C.gold), borderWidth: 0.45, opacity: 0.55 })

  // ── 3. UN Emblem watermark ───────────────────────────────────────────────────
  const eW = 195, eH = embImg.height * (195 / embImg.width)
  page.drawImage(embImg, { x: PW * 0.52 - eW/2, y: PH * 0.48 - eH/2, width: eW, height: eH, opacity: 0.055 })

  // ── 4. Left sidebar stripes ──────────────────────────────────────────────────
  let sx = SIDEBAR_X
  for (const s of STRIPES) {
    const pw = s.w * (SIDEBAR_W / STRIPES.reduce((a, b) => a + b.w, 0))
    page.drawRectangle({ x: sx, y: y(SIDEBAR_Y + SIDEBAR_H), width: pw, height: SIDEBAR_H, color: hexRgb(s.color) })
    sx += pw
  }

  // ── 5. Logo ──────────────────────────────────────────────────────────────────
  const LOGO_H = 46
  const logoDims = logoImg.scaleToFit(150, LOGO_H)
  page.drawImage(logoImg, { x: CX, y: y(MT + LOGO_H), width: logoDims.width, height: logoDims.height })

  // INSARAG full name
  page.drawText(T.insaragFull, {
    x: CX, y: y(MT + LOGO_H + 10),
    size: 5.6, font: fRoboBold, color: hexRgb(C.blue), characterSpacing: 0.52,
  })

  // ── 6. Decorative lines ──────────────────────────────────────────────────────
  const LINE_Y = MT + LOGO_H + 22
  page.drawLine({ start: { x: CX, y: y(LINE_Y) }, end: { x: CX + CW * 0.9, y: y(LINE_Y) }, thickness: 0.45, color: hexRgb(C.blue), opacity: 0.45 })
  page.drawLine({ start: { x: CX, y: y(LINE_Y + 3) }, end: { x: CX + CW * 0.55, y: y(LINE_Y + 3) }, thickness: 0.3, color: hexRgb(C.gold), opacity: 0.6 })

  // ── 7. Body text ─────────────────────────────────────────────────────────────
  // "This Certificate of Achievement..."
  centered(page, T.awarded, fPlayItalic, 9, BODY_CY + 48, CX, CW, hexRgb(C.textMid))

  // Full name — auto-size
  let nSize = 22.5
  while (fPlayBold.widthOfTextAtSize(fullName.toUpperCase(), nSize) > CW * 0.92 && nSize > 12) nSize -= 0.5
  centered(page, fullName.toUpperCase(), fPlayBold, nSize, BODY_CY + 22, CX, CW, hexRgb(C.textDark))

  // Name underlines
  const nW  = fPlayBold.widthOfTextAtSize(fullName.toUpperCase(), nSize)
  const uW  = Math.min(nW + 30, CW * 0.82)
  const uCX = CX + CW / 2
  page.drawLine({ start: { x: uCX - uW/2, y: BODY_CY + 14 }, end: { x: uCX + uW/2, y: BODY_CY + 14 }, thickness: 1.1, color: hexRgb(C.blue) })
  page.drawLine({ start: { x: uCX - uW/2, y: BODY_CY + 11 }, end: { x: uCX + uW/2, y: BODY_CY + 11 }, thickness: 0.38, color: hexRgb(C.gold), opacity: 0.7 })

  // "has successfully completed..."
  centered(page, T.recognition, fPlayItalic, 8.25, BODY_CY + 4, CX, CW, hexRgb(C.textMid))

  // Course title
  const tLines  = wrap(courseTitle, fPlayItalic, 11.25, CW * 0.85)
  const tLineH  = 17
  tLines.forEach((line, i) => {
    const lw = fPlayItalic.widthOfTextAtSize(line, 11.25)
    page.drawText(line, { x: CX + (CW - lw) / 2, y: BODY_CY - 10 - i * tLineH, size: 11.25, font: fPlayItalic, color: hexRgb(C.textDark) })
  })

  // Conformity
  const cfLines  = wrap(T.conformity, fRoboLight, 7.1, CW * 0.82)
  const cfStartY = BODY_CY - 10 - tLines.length * tLineH - 12
  cfLines.forEach((line, i) => {
    const lw = fRoboLight.widthOfTextAtSize(line, 7.1)
    page.drawText(line, { x: CX + (CW - lw) / 2, y: cfStartY - i * 11, size: 7.1, font: fRoboLight, color: hexRgb(C.textMid) })
  })

  // ── 8. Footer ────────────────────────────────────────────────────────────────
  page.drawLine({ start: { x: CX, y: FOOTER_TOP + FOOTER_H }, end: { x: CX + CW, y: FOOTER_TOP + FOOTER_H }, thickness: 0.38, color: hexRgb(C.parchDk) })

  // Cert number (left)
  const ftTextX = CX
  page.drawText(T.certNoLabel, { x: ftTextX, y: FOOTER_TOP + FOOTER_H - 14, size: 5.25, font: fRoboReg, color: hexRgb(C.textLight), characterSpacing: 0.38 })
  page.drawText(certNumber,    { x: ftTextX, y: FOOTER_TOP + FOOTER_H - 26, size: 7.5,  font: fRoboReg, color: hexRgb(C.textMid) })
  page.drawText(T.issuedLabel, { x: ftTextX, y: FOOTER_TOP + FOOTER_H - 42, size: 5.25, font: fRoboReg, color: hexRgb(C.textLight), characterSpacing: 0.38 })
  page.drawText(formattedDate, { x: ftTextX, y: FOOTER_TOP + FOOTER_H - 56, size: 8.25, font: fPlayReg,  color: hexRgb(C.textDark) })

  // Signature (right)
  const sigBW  = 150
  const sigX   = CX + CW - sigBW
  const sigCX  = sigX + sigBW / 2
  const sigDims = sigImg.scaleToFit(112, 33)

  page.drawImage(sigImg, { x: sigCX - sigDims.width/2, y: FOOTER_TOP + FOOTER_H - 38, width: sigDims.width, height: sigDims.height })
  page.drawLine({ start: { x: sigX, y: FOOTER_TOP + FOOTER_H - 42 }, end: { x: sigX + sigBW, y: FOOTER_TOP + FOOTER_H - 42 }, thickness: 0.9, color: hexRgb(C.textDark) })

  const drawSig = (text: string, font: any, size: number, offsetFromFt: number, color: any) => {
    const tw = font.widthOfTextAtSize(text, size)
    page.drawText(text, { x: sigCX - tw/2, y: FOOTER_TOP + FOOTER_H - offsetFromFt, size, font, color })
  }
  drawSig(T.signName,  fRoboBold,  7.5,  53, hexRgb(C.textDark))
  drawSig(T.signTitle, fRoboReg,   6.38, 63, hexRgb(C.textMid))
  drawSig(T.signOrg1,  fRoboLight, 6,    72, hexRgb(C.textMid))
  drawSig(T.signOrg2,  fRoboLight, 6,    80, hexRgb(C.textMid))

  return pdfDoc.save()
}