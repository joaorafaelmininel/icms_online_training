// src/app/api/certificates/pdf/route.ts
// Renders the certificate through a real headless Chromium and returns a PDF —
// pixel-identical to the on-screen preview because it's the exact same
// CertificateSheet component, rendered by the exact same browser engine.

import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { getCertificateData } from '@/lib/certificate/data'
import { formatCertificateDate } from '@/lib/certificate/text'
import { launchBrowser } from '@/lib/certificate/browser'

export const dynamic = 'force-dynamic'
export const runtime = 'nodejs'
export const maxDuration = 30

export async function GET(req: NextRequest) {
  const slug = req.nextUrl.searchParams.get('slug')
  const langParam = req.nextUrl.searchParams.get('lang') || undefined

  if (!slug) {
    return NextResponse.json({ error: 'Missing slug' }, { status: 400 })
  }

  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const cert = await getCertificateData(supabase, user, slug, langParam)

  if (!cert) {
    return NextResponse.json({ error: 'Certificate not available for this course' }, { status: 403 })
  }

  const courseText = cert.courseTitle[cert.language] || cert.courseTitle.en || ''
  const formattedDate = formatCertificateDate(cert.completionDate, cert.language)

  const printUrl = new URL('/certificate-print', req.nextUrl.origin)
  printUrl.searchParams.set('name', cert.fullName)
  printUrl.searchParams.set('course', courseText)
  printUrl.searchParams.set('date', formattedDate)
  printUrl.searchParams.set('certNumber', cert.certNumber)
  printUrl.searchParams.set('lang', cert.language)
  printUrl.searchParams.set('signatureUrl', cert.signatureUrl)

  let browser
  try {
    browser = await launchBrowser()
    const page = await browser.newPage()
    // Match the A4-landscape CSS px size the print page renders at (96dpi).
    await page.setViewport({ width: 1123, height: 794, deviceScaleFactor: 2 })
    await page.goto(printUrl.toString(), { waitUntil: 'networkidle0' })
    await page.evaluate(() => (document as any).fonts?.ready)

    const pdfBuffer = await page.pdf({
      format: 'a4',
      landscape: true,
      printBackground: true,
      margin: { top: 0, right: 0, bottom: 0, left: 0 },
    })

    const safeName = cert.fullName
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .replace(/\s+/g, '-')
      .replace(/[^a-zA-Z0-9-_]/g, '')

    return new NextResponse(Buffer.from(pdfBuffer), {
      headers: {
        'Content-Type': 'application/pdf',
        'Content-Disposition': `attachment; filename="ICMS-Certificate-${safeName}.pdf"`,
        'Cache-Control': 'no-store',
      },
    })
  } catch (err: any) {
    console.error('Certificate PDF generation failed:', err)
    return NextResponse.json({ error: 'PDF generation failed' }, { status: 500 })
  } finally {
    await browser?.close()
  }
}
