import fs from 'fs/promises'
import path from 'path'
import { PDFDocument, rgb } from 'pdf-lib'

// eslint-disable-next-line @typescript-eslint/no-require-imports
const fontkitModule = require('@pdf-lib/fontkit')
const fontkit = fontkitModule.default ?? fontkitModule

type Lang = 'en' | 'es'
interface LocalizedText { en: string; es: string }

export interface CertificatePdfData {
  fullName: string
  courseTitle: LocalizedText | string
  completionDate: string
  certNumber: string
  language: Lang
}

function loc(field: LocalizedText | string | null | undefined, lang: Lang): string {
  if (!field) return ''
  if (typeof field === 'string') return field
  return field[lang] || field.en || ''
}

const i18n = {
  en: {
    institution:     'INSARAG — INTERNATIONAL SEARCH AND RESCUE ADVISORY GROUP',
    certTitle:       'Certificate',
    certAwarded:     'This is to certify that',
    certRecognition: 'has successfully completed the online course on the',
    certConformity:  'in accordance with INSARAG Methodology and Guidelines.',
    dateLabel:       'DATE OF COMPLETION',
    certNumber:      'CERTIFICATE NO.',
    certSignName:    'Sebastian Rhodes Stampa',
    certSignTitle:   'Secretary INSARAG',
    certSignOrg:     'UN Office for the Coordination of Humanitarian Affairs (OCHA), Geneva',
  },
  es: {
    institution:     'INSARAG — GRUPO ASESOR INTERNACIONAL DE BÚSQUEDA Y RESCATE',
    certTitle:       'Certificado',
    certAwarded:     'Se certifica que',
    certRecognition: 'ha completado exitosamente el curso en línea sobre el',
    certConformity:  'de conformidad con la Metodología y las Directrices de INSARAG.',
    dateLabel:       'FECHA DE FINALIZACIÓN',
    certNumber:      'CERTIFICADO N.º',
    certSignName:    'Sebastian Rhodes Stampa',
    certSignTitle:   'Secretary INSARAG',
    certSignOrg:     'Oficina de la ONU para la Coordinación de Asuntos Humanitarios (OCHA), Ginebra',
  },
}

function hexRgb(hex: string) {
  const h = hex.replace('#', '')
  const full = h.length === 3
    ? h.split('').map((c) => c + c).join('')
    : h

  const n = parseInt(full, 16)

  return rgb(
    ((n >> 16) & 255) / 255,
    ((n >> 8) & 255) / 255,
    (n & 255) / 255,
  )
}

function formatDate(iso: string, lang: Lang): string {
  return new Intl.DateTimeFormat(lang === 'es' ? 'es-ES' : 'en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    timeZone: 'UTC',
  }).format(new Date(iso))
}

function fitSize(
  font: any,
  text: string,
  maxWidth: number,
  startSize: number,
  minSize = 10,
): number {
  let size = startSize
  while (size >= minSize && font.widthOfTextAtSize(text, size) > maxWidth) {
    size -= 1
  }
  return size
}

function drawCentered(
  page: any,
  text: string,
  font: any,
  size: number,
  y: number,
  color: any,
  pageW: number,
) {
  const x = (pageW - font.widthOfTextAtSize(text, size)) / 2
  page.drawText(text, { x, y, size, font, color })
}

function wrapText(font: any, text: string, maxWidth: number, size: number): string[] {
  const words = text.split(' ')
  const lines: string[] = []
  let current = ''

  for (const word of words) {
    const test = current ? `${current} ${word}` : word
    if (font.widthOfTextAtSize(test, size) <= maxWidth) {
      current = test
    } else {
      if (current) lines.push(current)
      current = word
    }
  }

  if (current) lines.push(current)
  return lines
}

async function pub(relativePath: string): Promise<Uint8Array> {
  return fs.readFile(path.join(process.cwd(), 'public', relativePath))
}

export async function generateCertificatePdf(data: CertificatePdfData): Promise<Uint8Array> {
  const t = i18n[data.language]
  const courseTitle = loc(data.courseTitle, data.language)
  const dateStr = formatDate(data.completionDate, data.language)

  const [
    playfairBytes,
    robotoRegBytes,
    robotoMedBytes,
    robotoBoldBytes,
    logoBytes,
    emblemBytes,
    sigBytes,
  ] = await Promise.all([
    pub('fonts/PlayfairDisplay-Bold.ttf'),
    pub('fonts/Roboto-Regular.ttf'),
    pub('fonts/Roboto-Medium.ttf'),
    pub('fonts/Roboto-Bold.ttf'),
    pub('certificates/insarag-logo-blue.png'),
    pub('certificates/un-emblem-light.png'),
    pub('certificates/signature.png'),
  ])

  const doc = await PDFDocument.create()
  doc.registerFontkit(fontkit)

  const W = 841.89
  const H = 595.28
  const page = doc.addPage([W, H])

  const fPlayfair = await doc.embedFont(playfairBytes)
  const fReg = await doc.embedFont(robotoRegBytes)
  const fMed = await doc.embedFont(robotoMedBytes)
  const fBold = await doc.embedFont(robotoBoldBytes)

  const imgLogo = await doc.embedPng(logoBytes)
  const imgEmblem = await doc.embedPng(emblemBytes)
  const imgSig = await doc.embedPng(sigBytes)

  const cBlue = hexRgb('#4A90C4')
  const cDarkBlue = hexRgb('#1B4F8A')
  const cTextDark = hexRgb('#1B2A4A')
  const cSlate = hexRgb('#64748B')
  const cLight = hexRgb('#94A3B8')
  const cLine = hexRgb('#E2E8F0')

  const HEADER_H = 90
  const FOOTER_H = 105
  const headerLineY = H - HEADER_H
  const footerLineY = FOOTER_H
  const bodyMidY = (headerLineY + footerLineY) / 2 + 2
  const CX = W / 2

  page.drawRectangle({
    x: 0,
    y: 0,
    width: W,
    height: H,
    color: rgb(1, 1, 1),
  })

  page.drawRectangle({
    x: 12,
    y: 12,
    width: W - 24,
    height: H - 24,
    borderColor: cDarkBlue,
    borderWidth: 2,
    color: rgb(1, 1, 1),
  })

  page.drawRectangle({
    x: 18,
    y: 18,
    width: W - 36,
    height: H - 36,
    borderColor: cBlue,
    borderWidth: 0.8,
    opacity: 0.5,
    color: rgb(1, 1, 1),
  })

  page.drawRectangle({
    x: 0,
    y: H - 6,
    width: W,
    height: 6,
    color: cDarkBlue,
  })

  page.drawRectangle({
    x: 0,
    y: 0,
    width: W,
    height: 3,
    color: cBlue,
  })

  page.drawLine({
    start: { x: 0, y: headerLineY },
    end: { x: W, y: headerLineY },
    thickness: 0.8,
    color: cLine,
  })

  page.drawLine({
    start: { x: 0, y: footerLineY },
    end: { x: W, y: footerLineY },
    thickness: 0.8,
    color: cLine,
  })

  const eDims = imgEmblem.scale(1.05)
  page.drawImage(imgEmblem, {
    x: (W - eDims.width) / 2,
    y: (H - eDims.height) / 2 - 10,
    width: eDims.width,
    height: eDims.height,
    opacity: 1,
  })

  const logoW = 134
  const logoH = (imgLogo.height / imgLogo.width) * logoW
  page.drawImage(imgLogo, {
    x: (W - logoW) / 2,
    y: H - 65,
    width: logoW,
    height: logoH,
  })

  drawCentered(page, t.institution, fBold, 7.5, H - 83, cDarkBlue, W)

  drawCentered(page, t.certTitle, fPlayfair, 50, bodyMidY + 58, cTextDark, W)

  const divY = bodyMidY + 34
  const divHalf = 115

  page.drawLine({
    start: { x: CX - divHalf, y: divY },
    end: { x: CX - 8, y: divY },
    thickness: 0.8,
    color: cBlue,
    opacity: 0.45,
  })

  page.drawLine({
    start: { x: CX + 8, y: divY },
    end: { x: CX + divHalf, y: divY },
    thickness: 0.8,
    color: cBlue,
    opacity: 0.45,
  })

  page.drawText('◆', {
    x: CX - 3.5,
    y: divY - 3.5,
    size: 6,
    font: fReg,
    color: cBlue,
    opacity: 0.65,
  })

  drawCentered(page, t.certAwarded, fReg, 10, bodyMidY + 8, cSlate, W)

  const nameSize = fitSize(fPlayfair, data.fullName, W - 100, 36, 20)
  drawCentered(page, data.fullName, fPlayfair, nameSize, bodyMidY - 26, cTextDark, W)

  const ulW = Math.min(
    fPlayfair.widthOfTextAtSize(data.fullName, nameSize) + 80,
    420,
  )

  page.drawLine({
    start: { x: CX - ulW / 2, y: bodyMidY - 42 },
    end: { x: CX + ulW / 2, y: bodyMidY - 42 },
    thickness: 1.8,
    color: cDarkBlue,
  })

  page.drawLine({
    start: { x: CX - ulW / 2, y: bodyMidY - 47 },
    end: { x: CX + ulW / 2, y: bodyMidY - 47 },
    thickness: 0.8,
    color: cBlue,
    opacity: 0.4,
  })

  drawCentered(page, t.certRecognition, fReg, 10, bodyMidY - 66, cSlate, W)

  const courseSize = fitSize(fPlayfair, courseTitle, W - 100, 18, 11)
  const courseLines = wrapText(fPlayfair, courseTitle, W - 100, courseSize)
  const courseLineHeight = courseSize * 1.35
  const courseStartY = bodyMidY - 90

  courseLines.forEach((line, i) => {
    drawCentered(
      page,
      line,
      fPlayfair,
      courseSize,
      courseStartY - i * courseLineHeight,
      cTextDark,
      W,
    )
  })

  const conformityY =
    courseStartY - (courseLines.length - 1) * courseLineHeight - 22

  drawCentered(page, t.certConformity, fReg, 8.5, conformityY, cSlate, W)

  page.drawText(t.certNumber, {
    x: 42,
    y: footerLineY - 40,
    size: 7,
    font: fMed,
    color: cLight,
  })

  page.drawText(data.certNumber, {
    x: 42,
    y: footerLineY - 60,
    size: 9.5,
    font: fReg,
    color: cSlate,
  })

  const dlW = fMed.widthOfTextAtSize(t.dateLabel, 7)
  const dvW = fMed.widthOfTextAtSize(dateStr, 10)

  page.drawText(t.dateLabel, {
    x: W - 42 - dlW,
    y: footerLineY - 38,
    size: 7,
    font: fMed,
    color: cLight,
  })

  page.drawText(dateStr, {
    x: W - 42 - dvW,
    y: footerLineY - 48,
    size: 10,
    font: fMed,
    color: cTextDark,
  })

  const sigW = 110
  const sigH = (imgSig.height / imgSig.width) * sigW

  page.drawImage(imgSig, {
  x: CX - sigW / 2,
  y: footerLineY - 42,
  width: sigW,
  height: sigH,
})

page.drawLine({
  start: { x: CX - 66, y: footerLineY - 48 },
  end: { x: CX + 66, y: footerLineY - 48 },
  thickness: 1.2,
  color: cTextDark,
})

drawCentered(page, t.certSignName, fBold, 9.5, footerLineY - 58, cTextDark, W)
drawCentered(page, t.certSignTitle, fReg, 8, footerLineY - 70, cSlate, W)
drawCentered(page, t.certSignOrg, fReg, 7.5, footerLineY - 81, cSlate, W)

  return doc.save()
}