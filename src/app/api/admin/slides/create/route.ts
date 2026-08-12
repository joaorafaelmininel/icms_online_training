// src/app/api/admin/slides/create/route.ts
// POST: create a new blank slide at the end of a module
// Requires admin role

import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export const dynamic = 'force-dynamic'

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

export async function POST(req: NextRequest) {
  const supabase = createClient()

  if (!(await requireAdmin(supabase))) {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
  }

  const body = (await req.json()) as { moduleId?: string }

  if (!body.moduleId) {
    return NextResponse.json({ error: 'Missing moduleId' }, { status: 400 })
  }

  const moduleResult = await supabase
    .from('course_modules')
    .select('id, course_id')
    .eq('id', body.moduleId)
    .single()

  if (moduleResult.error || !moduleResult.data) {
    return NextResponse.json({ error: 'Module not found' }, { status: 404 })
  }

  const mod = moduleResult.data as { id: string; course_id: string }

  const lastSlideResult = await supabase
    .from('module_slides')
    .select('slide_number')
    .eq('module_id', mod.id)
    .order('slide_number', { ascending: false })
    .limit(1)
    .maybeSingle()

  const nextNumber = ((lastSlideResult.data as { slide_number: number } | null)?.slide_number ?? 0) + 1

  const insertResult = await supabase
    .from('module_slides')
    .insert({
      module_id: mod.id,
      course_id: mod.course_id,
      slide_number: nextNumber,
      title: { en: `Slide ${nextNumber}`, es: `Diapositiva ${nextNumber}` },
      content: [],
      layout: 'text_only',
    } as never)
    .select('id, slide_number, title, content, layout, thumbnail_url')
    .single()

  if (insertResult.error) {
    return NextResponse.json({ error: insertResult.error.message }, { status: 500 })
  }

  return NextResponse.json(insertResult.data)
}
