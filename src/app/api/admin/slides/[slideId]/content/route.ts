// src/app/api/admin/slides/[slideId]/content/route.ts
// GET: return slide content blocks
// PATCH: add or replace a media block in the slide content array
// DELETE: permanently remove the slide

import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import type { ContentBlock } from '@/lib/types/slides'

type AdminProfile = {
  user_role: string | null
}

type SlideContentRow = {
  content: ContentBlock[] | null
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
  { params }: { params: { slideId: string } }
) {
  const supabase = createClient()

  if (!(await requireAdmin(supabase))) {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
  }

  const result = await supabase
    .from('module_slides')
    .select('id, slide_number, title, content, layout')
    .eq('id', params.slideId)
    .single()

  if (result.error) {
    return NextResponse.json({ error: result.error.message }, { status: 500 })
  }

  return NextResponse.json(result.data)
}

export async function PATCH(
  req: NextRequest,
  { params }: { params: { slideId: string } }
) {
  const supabase = createClient()

  if (!(await requireAdmin(supabase))) {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
  }

  const body = (await req.json()) as {
    action: 'add_block' | 'remove_block' | 'replace_content' | 'update_title'
    block?: ContentBlock
    index?: number
    content?: ContentBlock[]
    title?: { en: string; es: string }
  }

  if (body.action === 'update_title') {
    if (!body.title || typeof body.title.en !== 'string' || typeof body.title.es !== 'string') {
      return NextResponse.json({ error: 'Invalid title' }, { status: 400 })
    }

    const titleUpdateResult = await supabase
      .from('module_slides')
      .update({ title: body.title, updated_at: new Date().toISOString() } as never)
      .eq('id', params.slideId)
      .select('id')

    if (titleUpdateResult.error) {
      return NextResponse.json({ error: titleUpdateResult.error.message }, { status: 500 })
    }

    // Postgrest returns { data: [], error: null } — not an error — when an
    // UPDATE matches zero rows, which is exactly what happens when a Row
    // Level Security policy silently blocks the write: the request looks
    // like a 200 success to the admin panel even though nothing was saved.
    // .select() forces the affected rows back so we can tell the two apart.
    if (!titleUpdateResult.data || titleUpdateResult.data.length === 0) {
      return NextResponse.json(
        { error: 'Update did not affect any rows (likely blocked by a row-level security policy on module_slides)' },
        { status: 500 }
      )
    }

    return NextResponse.json({ title: body.title })
  }

  const slideResult = await supabase
    .from('module_slides')
    .select('content')
    .eq('id', params.slideId)
    .single()

  if (slideResult.error) {
    return NextResponse.json({ error: slideResult.error.message }, { status: 500 })
  }

  const slide = slideResult.data as SlideContentRow | null

  let blocks: ContentBlock[] = Array.isArray(slide?.content) ? slide.content : []

  if (body.action === 'add_block' && body.block) {
    blocks = [...blocks, body.block]
  } else if (body.action === 'remove_block' && body.index !== undefined) {
    blocks = blocks.filter((_, i) => i !== body.index)
  } else if (body.action === 'replace_content' && body.content) {
    blocks = body.content
  } else {
    return NextResponse.json(
      { error: 'Invalid action or missing payload' },
      { status: 400 }
    )
  }

  const updatePayload = {
    content: blocks,
    updated_at: new Date().toISOString(),
  }

  const updateResult = await supabase
    .from('module_slides')
    .update(updatePayload as never)
    .eq('id', params.slideId)
    .select('id')

  if (updateResult.error) {
    return NextResponse.json({ error: updateResult.error.message }, { status: 500 })
  }

  // See the comment on the update_title path above — a zero-row result
  // here is a silent RLS block, not a real success.
  if (!updateResult.data || updateResult.data.length === 0) {
    return NextResponse.json(
      { error: 'Update did not affect any rows (likely blocked by a row-level security policy on module_slides)' },
      { status: 500 }
    )
  }

  return NextResponse.json({ content: blocks })
}

export async function DELETE(
  _req: NextRequest,
  { params }: { params: { slideId: string } }
) {
  const supabase = createClient()

  if (!(await requireAdmin(supabase))) {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
  }

  // Needed after the delete to recount and correct course_modules.total_slides
  // — nothing in the app actually reads that stored counter today (every
  // page that shows a slide count derives it live from module_slides
  // instead), but it's still stale, stored data that's worth keeping
  // correct rather than leaving it to silently drift further.
  const slideForDelete = await supabase
    .from('module_slides')
    .select('module_id')
    .eq('id', params.slideId)
    .single()

  const deleteResult = await supabase
    .from('module_slides')
    .delete()
    .eq('id', params.slideId)
    .select('id')

  if (deleteResult.error) {
    return NextResponse.json({ error: deleteResult.error.message }, { status: 500 })
  }

  if (!deleteResult.data || deleteResult.data.length === 0) {
    return NextResponse.json(
      { error: 'Delete did not affect any rows (likely blocked by a row-level security policy on module_slides)' },
      { status: 500 }
    )
  }

  const moduleId = (slideForDelete.data as { module_id: string } | null)?.module_id
  if (moduleId) {
    const { count } = await supabase
      .from('module_slides')
      .select('id', { count: 'exact', head: true })
      .eq('module_id', moduleId)

    await supabase
      .from('course_modules')
      .update({ total_slides: count ?? 0 } as never)
      .eq('id', moduleId)
  }

  return NextResponse.json({ success: true })
}