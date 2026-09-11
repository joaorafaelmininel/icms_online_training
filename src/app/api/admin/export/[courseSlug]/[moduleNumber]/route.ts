// src/app/api/admin/export/[courseSlug]/[moduleNumber]/route.ts
// GET: read-only export of a module's current slide content, straight from
// the database — used for content review (e.g. proofreading text before
// launch). Admin-gated, same requireAdmin check pattern as the other admin
// slide routes. No writes happen here.

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

export async function GET(
  _req: NextRequest,
  { params }: { params: { courseSlug: string; moduleNumber: string } }
) {
  const supabase = createClient()

  if (!(await requireAdmin(supabase))) {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
  }

  const moduleNumber = Number(params.moduleNumber)
  if (Number.isNaN(moduleNumber)) {
    return NextResponse.json({ error: 'Invalid module number' }, { status: 400 })
  }

  const courseResult = await supabase
    .from('courses')
    .select('id, slug, title')
    .eq('slug', params.courseSlug)
    .single()

  if (courseResult.error || !courseResult.data) {
    return NextResponse.json({ error: 'Course not found' }, { status: 404 })
  }

  const course = courseResult.data as { id: string; slug: string; title: unknown }

  const moduleResult = await supabase
    .from('course_modules')
    .select('id, module_number, title')
    .eq('course_id', course.id)
    .eq('module_number', moduleNumber)
    .single()

  if (moduleResult.error || !moduleResult.data) {
    return NextResponse.json({ error: 'Module not found' }, { status: 404 })
  }

  const mod = moduleResult.data as { id: string; module_number: number; title: unknown }

  const slidesResult = await supabase
    .from('module_slides')
    .select('slide_number, title, content')
    .eq('module_id', mod.id)
    .order('slide_number', { ascending: true })

  if (slidesResult.error) {
    return NextResponse.json({ error: slidesResult.error.message }, { status: 500 })
  }

  return NextResponse.json({
    course: { slug: course.slug, title: course.title },
    module: { module_number: mod.module_number, title: mod.title },
    exported_at: new Date().toISOString(),
    slide_count: slidesResult.data?.length ?? 0,
    slides: slidesResult.data,
  })
}
