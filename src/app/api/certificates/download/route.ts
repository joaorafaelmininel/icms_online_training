// src/app/api/certificates/download/route.ts
import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { generateCertificatePdf } from '@/lib/certificate/generateCertificatePdf'

export async function POST(req: NextRequest) {
  try {
    // ── Auth guard ──────────────────────────────────────────────────────────
    const supabase = createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await req.json()

    // ── Validate required fields ────────────────────────────────────────────
    const { fullName, courseTitle, completionDate, certNumber, language } = body
    if (!fullName || !courseTitle || !completionDate || !certNumber) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 })
    }

    // ── Generate PDF ────────────────────────────────────────────────────────
    const pdfBytes = await generateCertificatePdf({
      fullName,
      courseTitle,
      completionDate,
      certNumber,
      language: language === 'es' ? 'es' : 'en',
    })

    // ── Safe filename ───────────────────────────────────────────────────────
    const safeName = String(fullName)
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .replace(/\s+/g, '-')
      .replace(/[^a-zA-Z0-9-_]/g, '')

    return new NextResponse(Buffer.from(pdfBytes), {
      status: 200,
      headers: {
        'Content-Type':        'application/pdf',
        'Content-Disposition': `attachment; filename="ICMS-Certificate-${safeName}.pdf"`,
        'Cache-Control':       'no-store',
      },
    })

  } catch (error) {
    console.error('Certificate PDF generation failed:', error)
    return NextResponse.json({ error: 'PDF generation failed' }, { status: 500 })
  }
}
