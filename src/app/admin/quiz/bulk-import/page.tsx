// src/app/admin/quiz/bulk-import/page.tsx
// Admin panel — paste a JSON array of module-quiz questions and import them
// all in one request via /api/admin/quiz/bulk-import.
// Protected: admin role only

import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import QuizBulkImportClient from '@/components/admin/QuizBulkImportClient'

export const dynamic = 'force-dynamic'

type Profile = {
  user_role: string | null
  first_name: string | null
}

export default async function QuizBulkImportPage() {
  const supabase = createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    redirect('/auth?tab=signin&redirectTo=/admin/quiz/bulk-import')
  }

  const profileResult = await supabase
    .from('profiles')
    .select('user_role, first_name')
    .eq('id', user.id)
    .single()

  const profile = profileResult.data as Profile | null

  if (!profile || profile.user_role !== 'admin') {
    redirect('/dashboard')
  }

  return <QuizBulkImportClient adminName={profile.first_name || 'Admin'} />
}
