// src/app/admin/slides/translate-patch/page.tsx
// Admin panel — apply a batch of Spanish text corrections in one click,
// instead of copy-pasting each field individually into the slide editor.
// Protected: admin role only

import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import TranslatePatchClient from '@/components/admin/TranslatePatchClient'

export const dynamic = 'force-dynamic'

type Profile = {
  user_role: string | null
  first_name: string | null
}

export default async function TranslatePatchPage() {
  const supabase = createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    redirect('/auth?tab=signin&redirectTo=/admin/slides/translate-patch')
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

  return <TranslatePatchClient adminName={profile.first_name || 'Admin'} />
}
