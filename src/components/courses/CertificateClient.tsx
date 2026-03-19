// src/components/courses/CertificateClient.tsx
'use client'

import { useCallback } from 'react'
import Link from 'next/link'

type Lang = 'en' | 'es'
interface LocalizedText { en: string; es: string }

function loc(f: LocalizedText | string | null | undefined, l: Lang): string {
  if (!f) return ''
  if (typeof f === 'string') return f
  return f[l] || f.en || ''
}

interface Props {
  courseTitle:       LocalizedText
  courseSlug:        string
  fullName:          string
  completionDate:    string
  certNumber:        string
  language:          Lang
  signatureUrl?:     string
  fromCertificates?: boolean
  score?:            number
}

export default function CertificateClient({
  courseTitle, courseSlug, fullName, completionDate,
  certNumber, language, signatureUrl,
}: Props) {
  const isEs = language === 'es'

  const formattedDate = new Date(completionDate).toLocaleDateString(
    isEs ? 'es-ES' : 'en-US',
    { year: 'numeric', month: 'long', day: 'numeric' }
  )

  const handlePrint = useCallback(() => { window.print() }, [])

  const T = {
    line1:    isEs ? 'Este Certificado es otorgado a'                               : 'This Certificate is awarded to',
    recLine:  isEs ? 'en reconocimiento por la exitosa finalización del Curso en el' : 'in recognition of the successful completion of the online course on the',
    conf:     isEs ? 'de conformidad con la Metodología y las Directrices de INSARAG e ICMS.' : 'in accordance with INSARAG and ICMS Methodology and Guidelines.',
    certNo:   isEs ? `Certificado N.º: ${certNumber}` : `Certificate No.: ${certNumber}`,
    myCerts:  isEs ? 'Mis Certificados' : 'My Certificates',
    back:     isEs ? 'Volver al Curso'  : 'Back to Course',
    download: isEs ? 'Descargar PDF'    : 'Download PDF',
    hint:     isEs
      ? 'En el diálogo de impresión, selecciona "Guardar como PDF" y activa "Gráficos de fondo".'
      : 'In the print dialog, select "Save as PDF" and enable "Background graphics".',
  }

  const courseText = loc(courseTitle, language)
  const BLUE      = '#0B4A7C'
  const BLUE_LT   = '#7AC8E8'
  const TEXT_DARK = '#111827'
  const TEXT_MID  = '#374151'

  return (
    <>
      <style dangerouslySetInnerHTML={{ __html: `
        @page {
          size: A4 landscape;
          margin: 0;
        }
        @media print {
          * { -webkit-print-color-adjust: exact !important; print-color-adjust: exact !important; }
          body { margin: 0 !important; padding: 0 !important; }
          .no-print { display: none !important; }
          .cert-wrap { display: block !important; }

          /* Screen px → PDF pt (scale factor 0.794 = 841pt / 1060px) */
          .cert-line1    { font-size: 12pt !important; }   /* 16px * 0.794 */
          .cert-name     { font-size: 32pt !important; }   /* 42px * 0.794 */
          .cert-rule     { height:   1.5pt !important; }
          .cert-rec      { font-size: 11pt !important; }   /* 15px */
          .cert-title    { font-size: 18pt !important; }   /* 24px * 0.794 */
          .cert-conf     { font-size: 11pt !important; }   /* 15px */
          .cert-date     { font-size: 11pt !important; }   /* 15px */
          .cert-certno   { font-size:  9pt !important; }   /* 12px * 0.794 */
          .cert-sig-name { font-size: 10pt !important; }   /* 13px * 0.794 */
          .cert-sig-sub  { font-size:  9pt !important; }   /* 12px * 0.794 */
          .cert-sig-org  { font-size:  9pt !important; }   /* 11px * 0.794 */
          .cert-logo     { height:    52pt !important; }   /* 70px * 0.794 */
          .cert-sig-img  { height:    36pt !important; }   /* 48px * 0.794 */
          .cert-emblem   { width:    270pt !important; height: 270pt !important; opacity: 0.60 !important; }
        }

        @media screen {
          .cert-wrap { display: none !important; }
        }
      `}} />

      {/* ── Controls (screen only) ── */}
      <div className="no-print" style={{ minHeight:'100vh', background:'#d1d5db' }}>
        <div style={{ maxWidth:960, margin:'0 auto', padding:'24px 24px 0' }}>
          <div style={{ display:'flex', flexWrap:'wrap', alignItems:'center', justifyContent:'space-between', gap:16, marginBottom:24 }}>
            <div>
              <h1 style={{ fontSize:20, fontWeight:700, color:'#111827', margin:0 }}>
                {isEs ? 'Tu Certificado' : 'Your Certificate'}
              </h1>
              <p style={{ fontSize:12, color:'#9ca3af', margin:'4px 0 0' }}>{T.hint}</p>
            </div>
            <div style={{ display:'flex', flexWrap:'wrap', gap:12 }}>
              <Link href="/certificates" style={{ borderRadius:8, border:'1px solid #e5e7eb', background:'#fff', padding:'10px 20px', fontSize:14, fontWeight:600, color:'#4b5563', textDecoration:'none' }}>
                ← {T.myCerts}
              </Link>
              <Link href={`/courses/${courseSlug}`} style={{ borderRadius:8, border:'1px solid #e5e7eb', background:'#fff', padding:'10px 20px', fontSize:14, fontWeight:600, color:'#4b5563', textDecoration:'none' }}>
                ← {T.back}
              </Link>
              <button onClick={handlePrint} style={{ display:'flex', alignItems:'center', gap:8, borderRadius:8, background:BLUE, border:'none', padding:'10px 24px', fontSize:14, fontWeight:700, color:'#fff', cursor:'pointer' }}>
                <svg width="16" height="16" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3M3 17V7a2 2 0 012-2h6l2 2h6a2 2 0 012 2v8a2 2 0 01-2 2H5a2 2 0 01-2-2z"/>
                </svg>
                {T.download}
              </button>
            </div>
          </div>
        </div>

        {/* Screen preview */}
        <div style={{ display:'flex', justifyContent:'center', padding:'0 0 64px' }}>
          <CertBody
            fullName={fullName} courseText={courseText}
            formattedDate={formattedDate} certNo={T.certNo}
            signatureUrl={signatureUrl} line1={T.line1}
            recLine={T.recLine} conf={T.conf}
            BLUE={BLUE} BLUE_LT={BLUE_LT} TEXT_DARK={TEXT_DARK} TEXT_MID={TEXT_MID}
            screen
          />
        </div>
      </div>

      {/* ── Print version ── */}
      <div className="cert-wrap" style={{ display:'none' }}>
        <CertBody
          fullName={fullName} courseText={courseText}
          formattedDate={formattedDate} certNo={T.certNo}
          signatureUrl={signatureUrl} line1={T.line1}
          recLine={T.recLine} conf={T.conf}
          BLUE={BLUE} BLUE_LT={BLUE_LT} TEXT_DARK={TEXT_DARK} TEXT_MID={TEXT_MID}
        />
      </div>
    </>
  )
}

function CertBody({
  fullName, courseText, formattedDate, certNo, signatureUrl,
  line1, recLine, conf, BLUE, BLUE_LT, TEXT_DARK, TEXT_MID, screen: isScreen,
}: {
  fullName: string; courseText: string; formattedDate: string; certNo: string
  signatureUrl?: string; line1: string; recLine: string; conf: string
  BLUE: string; BLUE_LT: string; TEXT_DARK: string; TEXT_MID: string
  screen?: boolean
}) {
  const S = isScreen
    ? { w:1060, h:750, logo:70, emblem:360, name:42, line1:16, rec:15, title:24, conf:15, date:15, certno:12, sigImg:48, sigName:13, sigSub:12, sigOrg:11, gap:{ a:12, b:16, c:20, d:6, e:28, f:6, g:6 } }
    : { w:0,    h:0,   logo:70, emblem:360, name:42, line1:16, rec:15, title:24, conf:15, date:15, certno:12, sigImg:48, sigName:13, sigSub:12, sigOrg:11, gap:{ a:12, b:16, c:20, d:6, e:28, f:6, g:6 } }

  const container: React.CSSProperties = isScreen ? {
    width: S.w, height: S.h,
    position: 'relative',
    backgroundColor: '#fff',
    boxShadow: '0 20px 60px rgba(0,0,0,0.3)',
    fontFamily: 'Roboto, Arial, sans-serif',
    overflow: 'hidden',
    flexShrink: 0,
  } : {
    width: '297mm', height: '210mm',
    position: 'fixed', top:0, left:0,
    backgroundColor: '#fff',
    fontFamily: 'Roboto, Arial, sans-serif',
    overflow: 'hidden',
  }

  return (
    <div style={container}>

      <div style={{ position:'absolute', inset:12, border:`2.5px solid ${BLUE}`, zIndex:10, pointerEvents:'none' }} />
      <div style={{ position:'absolute', inset:18, border:`1px solid ${BLUE_LT}`, zIndex:10, pointerEvents:'none' }} />

      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img className="cert-emblem" src="/un-emblem-light.png" alt="" aria-hidden style={{
        position:'absolute', top:'50%', left:'50%',
        transform:'translate(-50%,-50%)',
        width: isScreen ? S.emblem : undefined,
        height: isScreen ? S.emblem : undefined,
        opacity: 0.60, zIndex:1, pointerEvents:'none',
      }} />

      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img className="cert-logo" src="/insarag-logo-blue.svg" alt="INSARAG" style={{
        position:'absolute', top: isScreen ? 36 : 24, right: isScreen ? 44 : 30,
        height: isScreen ? S.logo : undefined,
        width:'auto', zIndex:5,
      }} />

      <div style={{
        position:'absolute', top:0, left:0, right:0, bottom:0,
        display:'flex', flexDirection:'column',
        alignItems:'center', justifyContent:'center',
        textAlign:'center',
        padding: isScreen ? '40px 80px 130px' : '28mm 20mm 36mm',
        zIndex:3,
      }}>
        <p className="cert-line1" style={{ fontSize: isScreen ? S.line1 : undefined, fontWeight:300, color:TEXT_MID, margin:`0 0 ${isScreen ? 12 : 10}px`, lineHeight:1.4 }}>
          {line1}
        </p>
        <h1 className="cert-name" style={{ fontSize: isScreen ? S.name : undefined, fontWeight:700, color:TEXT_DARK, margin:`0 0 ${isScreen ? 16 : 12}px`, lineHeight:1.1, wordBreak:'break-word', maxWidth:'90%' }}>
          {fullName}
        </h1>
        <div className="cert-rule" style={{ width:'60%', height: isScreen ? 1.5 : undefined, background:BLUE, margin:`0 0 ${isScreen ? 20 : 16}px` }} />
        <p className="cert-rec" style={{ fontSize: isScreen ? S.rec : undefined, fontWeight:300, color:TEXT_MID, margin:`0 0 ${isScreen ? 4 : 4}px`, lineHeight:1.5 }}>
          {recLine}
        </p>
        <p className="cert-title" style={{ fontSize: isScreen ? S.title : undefined, fontWeight:700, color:TEXT_DARK, margin:`0 0 ${isScreen ? 4 : 4}px`, lineHeight:1.4, maxWidth:'88%' }}>
          {courseText}
        </p>
        <p className="cert-conf" style={{ fontSize: isScreen ? S.conf : undefined, fontWeight:300, color:TEXT_MID, margin:`0 0 ${isScreen ? 28 : 22}px`, lineHeight:1.5 }}>
          {conf}
        </p>
        <p className="cert-date" style={{ fontSize: isScreen ? S.date : undefined, color:TEXT_MID, margin:`0 0 ${isScreen ? 6 : 4}px` }}>
          {formattedDate}
        </p>
        <p className="cert-certno" style={{ fontSize: isScreen ? S.certno : undefined, fontWeight:300, color:TEXT_MID, margin:0 }}>
          {certNo}
        </p>
      </div>

      <div style={{
        position:'absolute',
        bottom: isScreen ? 44 : '8mm',
        right:  isScreen ? 50 : '15mm',
        width:  isScreen ? 220 : '18%',
        textAlign:'center', zIndex:5,
      }}>
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img className="cert-sig-img" src={signatureUrl || '/signature-stampa.png'} alt="Signature"
          style={{ height: isScreen ? S.sigImg : undefined, display:'block', margin:'0 auto 6px' }} />
        <div style={{ width:'100%', height:1, background:TEXT_DARK, marginBottom:6 }} />
        <p className="cert-sig-name" style={{ fontSize: isScreen ? S.sigName : undefined, fontWeight:700, color:BLUE, margin:0 }}>Sebastian Rhodes Stampa</p>
        <p className="cert-sig-sub"  style={{ fontSize: isScreen ? S.sigSub  : undefined, color:BLUE, margin:'2px 0 0' }}>Secretary INSARAG</p>
        <p className="cert-sig-org"  style={{ fontSize: isScreen ? S.sigOrg  : undefined, fontWeight:300, color:BLUE, margin:'2px 0 0' }}>UN Office for the Coordination of</p>
        <p className="cert-sig-org"  style={{ fontSize: isScreen ? S.sigOrg  : undefined, fontWeight:300, color:BLUE, margin:'1px 0 0' }}>Humanitarian Affairs (OCHA), Geneva</p>
      </div>
    </div>
  )
}
