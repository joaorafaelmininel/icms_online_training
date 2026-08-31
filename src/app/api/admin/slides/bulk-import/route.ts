// src/app/api/admin/slides/bulk-import/route.ts
// POST: create multiple slides at once at the end of a module, from a pasted
// JSON array (used by the admin panel's "Import Slides" action so content
// can be loaded without hand-typing every block).
// Requires admin role.

import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import type { ContentBlock } from '@/lib/types/slides'

export const dynamic = 'force-dynamic'

type AdminProfile = {
  user_role: string | null
}

type LocalizedField = { en: string; es: string }

type ImportSlide = {
  title?: Partial<LocalizedField>
  layout?: string
  content: ContentBlock[]
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

  const body = (await req.json()) as { moduleId?: string; slides?: ImportSlide[] }

  if (!body.moduleId) {
    return NextResponse.json({ error: 'Missing moduleId' }, { status: 400 })
  }

  if (!Array.isArray(body.slides) || body.slides.length === 0) {
    return NextResponse.json({ error: 'slides must be a non-empty array' }, { status: 400 })
  }

  for (const [i, slide] of body.slides.entries()) {
    if (!Array.isArray(slide.content)) {
      return NextResponse.json({ error: `slides[${i}].content must be an array` }, { status: 400 })
    }
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

  const startNumber = ((lastSlideResult.data as { slide_number: number } | null)?.slide_number ?? 0) + 1

  const rows = body.slides.map((slide, i) => {
    const n = startNumber + i
    return {
      module_id: mod.id,
      course_id: mod.course_id,
      slide_number: n,
      title: {
        en: slide.title?.en || `Slide ${n}`,
        es: slide.title?.es || `Diapositiva ${n}`,
      },
      content: slide.content,
      layout: slide.layout || 'text_only',
    }
  })

  const insertResult = await supabase
    .from('module_slides')
    .insert(rows as never)
    .select('id, slide_number, title, content, layout, thumbnail_url')
    .order('slide_number')

  if (insertResult.error) {
    return NextResponse.json({ error: insertResult.error.message }, { status: 500 })
  }

  return NextResponse.json({ slides: insertResult.data })
}
