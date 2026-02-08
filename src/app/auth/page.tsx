import { Metadata } from 'next'
import AuthClient from '@/components/auth/AuthClient'

export const metadata: Metadata = {
  title: 'Sign In - ICMS Learning',
  description: 'Sign in to your ICMS Learning account',
}

export default function AuthPage() {
  return <AuthClient />
}