// src/app/dashboard/layout.tsx
import { ReactNode } from 'react'
import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { getCurrentLanguage } from '@/lib/i18n/language'
import DashboardHeader from '@/components/layout/DashboardHeader'
import Footer from '@/components/layout/Footer'

type ProfileRow = {
  first_name: string | null
  last_name: string | null
  email: string | null
  avatar_url: string | null
  user_role: 'student' | 'instructor' | 'admin' | null
}

export default async function DashboardLayout({
  children,
}: {
  children: ReactNode
}) {
  const supabase = createClient()
  const language = await getCurrentLanguage()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    redirect('/auth')
  }

  const profileResult = await supabase
    .from('profiles')
    .select('first_name, last_name, email, avatar_url, user_role')
    .eq('id', user.id)
    .single()

  const profile = profileResult.data as ProfileRow | null

  const userName = profile
    ? `${profile.first_name || ''} ${profile.last_name || ''}`.trim()
    : user.email?.split('@')[0] || 'User'

  const userEmail = profile?.email || user.email || ''

  return (
    <div className="flex min-h-screen flex-col bg-gray-50">
      <DashboardHeader
        userName={userName}
        userEmail={userEmail}
        userAvatar={profile?.avatar_url}
        language={language as 'en' | 'es'}
        userId={user.id}
        userRole={profile?.user_role || 'student'}
      />
      <main className="flex-1">{children}</main>
      <Footer />
    </div>
  )
}