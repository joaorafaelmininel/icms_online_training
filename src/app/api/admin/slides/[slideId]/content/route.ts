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
    action: 'add_block' | 'remove_block' | 'replace_content'
    block?: ContentBlock
    index?: number
    content?: ContentBlock[]
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

  if (updateResult.error) {
    return NextResponse.json({ error: updateResult.error.message }, { status: 500 })
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

  const deleteResult = await supabase
    .from('module_slides')
    .delete()
    .eq('id', params.slideId)

  if (deleteResult.error) {
    return NextResponse.json({ error: deleteResult.error.message }, { status: 500 })
  }

  return NextResponse.json({ success: true })
}