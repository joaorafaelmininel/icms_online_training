// src/app/admin/final-exam/bulk-import/page.tsx
// Admin panel — paste a JSON array of final-exam questions and import them
// all in one request via /api/admin/final-exam/bulk-import.
// Protected: admin role only

import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import FinalExamBulkImportClient from '@/components/admin/FinalExamBulkImportClient'

export const dynamic = 'force-dynamic'

type Profile = {
  user_role: string | null
  first_name: string | null
}

export default async function FinalExamBulkImportPage() {
  const supabase = createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    redirect('/auth?tab=signin&redirectTo=/admin/final-exam/bulk-import')
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

  return <FinalExamBulkImportClient adminName={profile.first_name || 'Admin'} />
}
