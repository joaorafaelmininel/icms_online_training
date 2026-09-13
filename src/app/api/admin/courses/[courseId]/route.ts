// src/app/api/admin/courses/[courseId]/route.ts
// PATCH: update a course's own description and learning_outcomes (course-level
// text, separate from any module or slide). Admin-gated.

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
  { params }: { params: { courseId: string } }
) {
  const supabase = createClient()

  if (!(await requireAdmin(supabase))) {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
  }

  const body = (await req.json()) as {
    description?: { en?: string; es?: string }
    learning_outcomes?: { en?: string; es?: string }
  }

  const update: Record<string, unknown> = {}

  if (body.description) {
    if (typeof body.description.en !== 'string' || typeof body.description.es !== 'string') {
      return NextResponse.json({ error: 'Invalid description' }, { status: 400 })
    }
    update.description = body.description
  }

  if (body.learning_outcomes) {
    if (typeof body.learning_outcomes.en !== 'string' || typeof body.learning_outcomes.es !== 'string') {
      return NextResponse.json({ error: 'Invalid learning_outcomes' }, { status: 400 })
    }
    update.learning_outcomes = body.learning_outcomes
  }

  if (Object.keys(update).length === 0) {
    return NextResponse.json({ error: 'Nothing to update' }, { status: 400 })
  }

  const updateResult = await supabase
    .from('courses')
    .update(update as never)
    .eq('id', params.courseId)
    .select('id, description, learning_outcomes')

  if (updateResult.error) {
    return NextResponse.json({ error: updateResult.error.message }, { status: 500 })
  }

  // A zero-row result here is a silent RLS block, not a real success —
  // Postgrest returns 200 with an empty array rather than an error when an
  // UPDATE matches zero rows.
  if (!updateResult.data || updateResult.data.length === 0) {
    return NextResponse.json(
      { error: 'Update did not affect any rows (likely blocked by a row-level security policy on courses)' },
      { status: 500 }
    )
  }

  return NextResponse.json(updateResult.data[0])
}
