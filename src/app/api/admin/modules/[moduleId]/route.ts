// src/app/api/admin/modules/[moduleId]/route.ts
// PATCH: update a module's own title (course_modules.title) — separate from
// any slide's title. Admin-gated.

import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

type AdminProfile = {
  user_role: string | null
}

async function requireAdmin(supabase: ReturnType<typeof createClient>) {
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) return null

  const profileResult = await supabase
    .from('profiles')
    .select('user_role')
    .eq('id', user.id)
    .single()

  const profile = profileResult.data as AdminProfile | null

  if (!profile || profile.user_role !== 'admin') return null

  return user
}

export async function PATCH(
  req: NextRequest,
  { params }: { params: { moduleId: string } }
) {
  const supabase = createClient()

  if (!(await requireAdmin(supabase))) {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
  }

  const body = (await req.json()) as { title?: { en?: string; es?: string } }

  if (!body.title || typeof body.title.en !== 'string' || typeof body.title.es !== 'string') {
    return NextResponse.json({ error: 'Invalid title' }, { status: 400 })
  }

  const updateResult = await supabase
    .from('course_modules')
    .update({ title: body.title } as never)
    .eq('id', params.moduleId)
    .select('id, title')

  if (updateResult.error) {
    return NextResponse.json({ error: updateResult.error.message }, { status: 500 })
  }

  // A zero-row result here is a silent RLS block, not a real success —
  // Postgrest returns 200 with an empty array rather than an error when an
  // UPDATE matches zero rows.
  if (!updateResult.data || updateResult.data.length === 0) {
    return NextResponse.json(
      { error: 'Update did not affect any rows (likely blocked by a row-level security policy on course_modules)' },
      { status: 500 }
    )
  }

  return NextResponse.json({ title: body.title })
}
