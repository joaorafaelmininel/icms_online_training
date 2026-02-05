'use client'


import { useSearchParams } from 'next/navigation'
import AuthCard from '@/components/AuthCard'
import '@/styles/auth.css'


export default function AuthPage() {
const params = useSearchParams()
const tab = params.get('tab') === 'signup' ? 'signup' : 'signin'


return (
<main className="auth-bg">
<AuthCard defaultTab={tab} />
</main>
)
}