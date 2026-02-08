import { Metadata } from 'next'
import ResetPasswordClient from '@/components/auth/ResetPasswordClient'

export const metadata: Metadata = {
  title: 'Set New Password - ICMS Learning',
  description: 'Set your new ICMS Learning account password',
}

export default function ResetPasswordPage() {
  return <ResetPasswordClient />
}