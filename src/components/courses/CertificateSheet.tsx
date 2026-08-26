// src/components/courses/CertificateSheet.tsx
// The certificate artwork itself — shared by the interactive on-screen preview
// (CertificateClient) and the server-rendered print page used by Puppeteer to
// produce the downloadable PDF. Keeping a single component guarantees the PDF
// is pixel-identical to what the user sees on screen.

const BLUE      = '#0B4A7C'
const BLUE_LT   = '#7AC8E8'
const TEXT_DARK = '#111827'
const TEXT_MID  = '#374151'

export const CERT_WIDTH  = 1060
export const CERT_HEIGHT = 750

export interface CertificateSheetProps {
  fullName:       string
  courseText:     string
  formattedDate:  string
  certNo:         string
  signatureUrl?:  string
  line1:          string
  recLine:        string
  conf:           string
}

export default function CertificateSheet({
  fullName, courseText, formattedDate, certNo, signatureUrl,
  line1, recLine, conf,
}: CertificateSheetProps) {
  const container: React.CSSProperties = {
    width: CERT_WIDTH,
    height: CERT_HEIGHT,
    position: 'relative',
    backgroundColor: '#fff',
    fontFamily: 'var(--font-roboto), "Helvetica Neue", Arial, sans-serif',
    overflow: 'hidden',
    flexShrink: 0,
  }

  return (
    <div style={container}>

      {/* Outer border */}
      <div style={{ position: 'absolute', inset: 12, border: `2.5px solid ${BLUE}`, pointerEvents: 'none', zIndex: 5 }} />
      {/* Inner border */}
      <div style={{ position: 'absolute', inset: 18, border: `1px solid ${BLUE_LT}`, opacity: 0.55, pointerEvents: 'none', zIndex: 5 }} />

      {/* UN Emblem watermark */}
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src="/un-emblem-light.png"
        alt=""
        aria-hidden
        style={{
          position: 'absolute', top: '50%', left: '50%',
          transform: 'translate(-50%, -50%)',
          width: 280,
          height: 280,
          opacity: 0.28,
          pointerEvents: 'none', zIndex: 1,
          objectFit: 'contain',
        }}
      />

      {/* INSARAG Logo — top right */}
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src="/insarag-logo-blue.svg"
        alt="INSARAG"
        style={{
          position: 'absolute',
          top: 36,
          right: 44,
          height: 70,
          width: 'auto', zIndex: 3,
        }}
      />

      {/* Main content */}
      <div style={{
        position: 'absolute', top: 0, left: 0, right: 0, bottom: 0,
        display: 'flex', flexDirection: 'column',
        alignItems: 'center', justifyContent: 'center',
        textAlign: 'center',
        padding: '40px 80px 130px',
        zIndex: 3,
      }}>

        {/* "This certificate is awarded to" */}
        <p style={{ fontSize: 17, fontWeight: 300, color: TEXT_MID, margin: '0 0 12px', lineHeight: 1.4 }}>
          {line1}
        </p>

        {/* Full name */}
        <h1 style={{
          fontSize: 42, fontWeight: 700, color: TEXT_DARK,
          margin: '0 0 16px', lineHeight: 1.1,
          wordBreak: 'break-word', maxWidth: '90%',
        }}>
          {fullName}
        </h1>

        {/* Rule */}
        <div style={{ width: '60%', height: 2, background: BLUE, margin: '0 0 20px' }} />

        {/* "in recognition of..." */}
        <p style={{ fontSize: 15, fontWeight: 300, color: TEXT_MID, margin: '0 0 4px', lineHeight: 1.5 }}>
          {recLine}
        </p>

        {/* Course title */}
        <p style={{ fontSize: 18, fontWeight: 700, color: TEXT_DARK, margin: '0 0 4px', lineHeight: 1.4, maxWidth: '88%' }}>
          {courseText}
        </p>

        {/* Conformity */}
        <p style={{ fontSize: 14, fontWeight: 300, color: TEXT_MID, margin: '0 0 32px', lineHeight: 1.5 }}>
          {conf}
        </p>

        {/* Date + cert number */}
        <p style={{ fontSize: 14, color: TEXT_MID, margin: '0 0 5px' }}>{formattedDate}</p>
        <p style={{ fontSize: 12, fontWeight: 300, color: TEXT_MID, margin: 0 }}>{certNo}</p>
      </div>

      {/* Signature block */}
      <div style={{
        position: 'absolute',
        bottom: 44,
        right: 50,
        width: 220,
        textAlign: 'center',
        zIndex: 3,
      }}>
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={signatureUrl || '/signature-stampa.png'}
          alt="Signature"
          style={{ height: 50, display: 'block', margin: '0 auto 6px' }}
        />
        <div style={{ width: '100%', height: 1, background: TEXT_DARK, marginBottom: 6 }} />
        <p style={{ fontSize: 13, fontWeight: 700, color: BLUE, margin: 0 }}>Sebastian Rhodes Stampa</p>
        <p style={{ fontSize: 11, color: BLUE, margin: '2px 0 0' }}>Secretary INSARAG</p>
        <p style={{ fontSize: 10, fontWeight: 300, color: BLUE, margin: '2px 0 0' }}>UN Office for the Coordination of</p>
        <p style={{ fontSize: 10, fontWeight: 300, color: BLUE, margin: '1px 0 0' }}>Humanitarian Affairs (OCHA), Geneva</p>
      </div>
    </div>
  )
}
