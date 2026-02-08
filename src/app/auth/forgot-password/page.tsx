import { Metadata } from 'next'
import ForgotPasswordClient from '@/components/auth/ForgotPasswordClient'

export const metadata: Metadata = {
  title: 'Reset Password - ICMS Learning',
  description: 'Reset your ICMS Learning account password',
}

export default function ForgotPasswordPage() {
  return <ForgotPasswordClient />
}