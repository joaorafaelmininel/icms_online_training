// src/app/api/certificates/generate/route.ts
// Server-side PDF generation — A4 portrait, clean design matching reference model

import { NextRequest, NextResponse } from 'next/server'
import { PDFDocument, rgb, RGB } from 'pdf-lib'
import fontkit from '@pdf-lib/fontkit'
import { readFileSync } from 'fs'
import { join } from 'path'
import { Buffer } from 'buffer'
import { createClient } from '@/lib/supabase/server'

// ─── Constants ─────────────────────────────────────────────────────────────────
// A4 portrait in points
const PW = 595.28
const PH = 841.89

const BLUE = rgb(0.043, 0.29, 0.486) // #0B4A7C
const BLUE_LITE = rgb(0.4, 0.71, 0.89) // ~#66B5E3 border
const TEXT_DARK = rgb(0.102, 0.137, 0.251) // #1A2340
const TEXT_MID = rgb(0.239, 0.29, 0.42) // #3D4A6B
const SIG_BLUE = rgb(0.043, 0.29, 0.486) // same as BLUE for sig text

const PUBLIC = join(process.cwd(), 'public')
const FONTS = join(PUBLIC, 'fonts')

// Wrap text to fit maxWidth (pt)
function wrap(text: string, font: any, size: number, maxW: number): string[] {
  const words = text.split(' ')
  const lines: string[] = []
  let cur = ''

  for (const w of words) {
    const test = cur ? `${cur} ${w}` : w
    if (font.widthOfTextAtSize(test, size) <= maxW) {
      cur = test
    } else {
      if (cur) lines.push(cur)
      cur = w
    }
  }

  if (cur) lines.push(cur)

  return lines
}

// Draw text horizontally centered
function drawCenter(
  page: any,
  text: string,
  font: any,
  size: number,
  y: number,
  color: RGB,
  maxW?: number
) {
  let finalSize = size

  if (maxW) {
    while (font.widthOfTextAtSize(text, finalSize) > maxW && finalSize > 8) {
      finalSize -= 0.5
    }
  }

  const tw = font.widthOfTextAtSize(text, finalSize)
  page.drawText(text, { x: (PW - tw) / 2, y, size: finalSize, font, color })
}

// ─── Main handler ───────────────────────────────────────────────────────────────
export async function POST(req: NextRequest) {
  try {
    const supabase = createClient()

    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { courseTitle, fullName, completionDate, certNumber, language } =
      (await req.json()) as {
        courseTitle: string
        fullName: string
        completionDate: string
        certNumber: string
        language: 'en' | 'es'
        courseSlug?: string
      }

    const isEs = language === 'es'
    const formattedDate = new Date(completionDate).toLocaleDateString(
      isEs ? 'es-ES' : 'en-US',
      { year: 'numeric', month: 'long', day: 'numeric' }
    )

    // ── Build PDF ──────────────────────────────────────────────────────────────
    const pdfDoc = await PDFDocument.create()
    pdfDoc.registerFontkit(fontkit)

    const fBold = await pdfDoc.embedFont(readFileSync(join(FONTS, 'Roboto-Bold.ttf')))
    const fReg = await pdfDoc.embedFont(readFileSync(join(FONTS, 'Roboto-Regular.ttf')))
    const fLight = await pdfDoc.embedFont(readFileSync(join(FONTS, 'Roboto-Light.ttf')))

    const logoImg = await pdfDoc.embedPng(readFileSync(join(PUBLIC, 'insarag-logo-blue.png')))
    const embImg = await pdfDoc.embedPng(readFileSync(join(PUBLIC, 'un-emblem-light.png')))
    const sigImg = await pdfDoc.embedPng(readFileSync(join(PUBLIC, 'signature-stampa.png')))

    const page = pdfDoc.addPage([PW, PH])

    // 1. White background
    page.drawRectangle({ x: 0, y: 0, width: PW, height: PH, color: rgb(1, 1, 1) })

    // 2. Outer border (INSARAG blue)
    page.drawRectangle({
      x: 14,
      y: 14,
      width: PW - 28,
      height: PH - 28,
      borderColor: BLUE,
      borderWidth: 2.5,
    })

    // 3. Inner border (light blue)
    page.drawRectangle({
      x: 20,
      y: 20,
      width: PW - 40,
      height: PH - 40,
      borderColor: BLUE_LITE,
      borderWidth: 1,
    })

    // 4. UN Emblem watermark — centered in the page
    const eSize = 220
    page.drawImage(embImg, {
      x: (PW - eSize) / 2,
      y: PH / 2 - eSize / 2 - 20,
      width: eSize,
      height: eSize,
      opacity: 0.08,
    })

    // 5. INSARAG Logo — top right
    const logoH = 56
    const logoDims = logoImg.scaleToFit(200, logoH)
    page.drawImage(logoImg, {
      x: PW - 30 - logoDims.width,
      y: PH - 30 - logoDims.height,
      width: logoDims.width,
      height: logoDims.height,
    })

    // ── Text content ─────────────────────────────────────────────────────────
    const bodyTop = PH - 30 - logoH - 50

    const line1 = isEs
      ? 'Este Certificado es otorgado a'
      : 'This Certificate is awarded to'
    drawCenter(page, line1, fLight, 14, bodyTop, TEXT_MID)

    let nameSize = 36
    while (fBold.widthOfTextAtSize(fullName, nameSize) > PW - 80 && nameSize > 20) {
      nameSize -= 0.5
    }
    drawCenter(page, fullName, fBold, nameSize, bodyTop - 54, TEXT_DARK, PW - 80)

    const ruleY = bodyTop - 68
    page.drawLine({
      start: { x: 30, y: ruleY },
      end: { x: PW - 30, y: ruleY },
      thickness: 1,
      color: BLUE,
    })

    const midY = ruleY - 40
    const recLine1 = isEs
      ? 'en reconocimiento por la exitosa finalización del Curso en el'
      : 'in recognition of the successful completion of the online course on the'
    drawCenter(page, recLine1, fLight, 13, midY, TEXT_MID)

    const titleLines = wrap(courseTitle, fBold, 14, PW - 100)
    titleLines.forEach((line, i) => {
      const tw = fBold.widthOfTextAtSize(line, 14)
      page.drawText(line, {
        x: (PW - tw) / 2,
        y: midY - 22 - i * 20,
        size: 14,
        font: fBold,
        color: TEXT_DARK,
      })
    })

    const confText = isEs
      ? 'de conformidad con la Metodología y las Directrices de INSARAG e ICMS.'
      : 'in accordance with INSARAG and ICMS Methodology and Guidelines.'
    const confY = midY - 22 - titleLines.length * 20 - 8
    drawCenter(page, confText, fLight, 12, confY, TEXT_MID)

    const dateY = confY - 46
    drawCenter(page, formattedDate, fReg, 12, dateY, TEXT_MID)

    const certLabel = `${isEs ? 'Certificado N.º' : 'Certificate No.'}: ${certNumber}`
    drawCenter(page, certLabel, fLight, 10, dateY - 18, TEXT_MID)

    // ── Signature block — bottom right ───────────────────────────────────────
    const sigBW = 180
    const sigX = PW - 30 - sigBW
    const sigCX = sigX + sigBW / 2
    const sigBaseY = 140

    const sigDims = sigImg.scaleToFit(130, 40)
    page.drawImage(sigImg, {
      x: sigCX - sigDims.width / 2,
      y: sigBaseY + 20,
      width: sigDims.width,
      height: sigDims.height,
    })

    page.drawLine({
      start: { x: sigX, y: sigBaseY + 16 },
      end: { x: sigX + sigBW, y: sigBaseY + 16 },
      thickness: 0.8,
      color: TEXT_DARK,
    })

    const drawSig = (
      text: string,
      font: any,
      size: number,
      dy: number,
      color: RGB
    ) => {
      const tw = font.widthOfTextAtSize(text, size)
      page.drawText(text, { x: sigCX - tw / 2, y: sigBaseY - dy, size, font, color })
    }

    drawSig('Sebastian Rhodes Stampa', fBold, 10, 2, SIG_BLUE)
    drawSig('Secretary INSARAG', fReg, 9, 15, SIG_BLUE)
    drawSig('UN Office for the Coordination of', fLight, 8.5, 27, SIG_BLUE)
    drawSig('Humanitarian Affairs (OCHA), Geneva', fLight, 8.5, 38, SIG_BLUE)

    // ── Output ────────────────────────────────────────────────────────────────
    const pdfBytes = await pdfDoc.save()
    const safeName = fullName
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .replace(/\s+/g, '-')
      .replace(/[^a-zA-Z0-9-_]/g, '')

    return new NextResponse(Buffer.from(pdfBytes), {
      headers: {
        'Content-Type': 'application/pdf',
        'Content-Disposition': `attachment; filename="ICMS-Certificate-${safeName}.pdf"`,
        'Cache-Control': 'no-store',
      },
    })
  } catch (err: any) {
    console.error('Certificate error:', err)
    return NextResponse.json({ error: err.message }, { status: 500 })
  }
}