import { Metadata } from 'next'
import EmailVerificationClient from '@/components/auth/EmailVerificationClient'

export const metadata: Metadata = {
  title: 'Verify Email - ICMS Learning',
  description: 'Verify your ICMS Learning account email address',
}

export default function EmailVerificationPage() {
  return <EmailVerificationClient />
}