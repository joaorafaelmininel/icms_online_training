// src/app/api/admin/slides/[slideId]/content/route.ts
// GET: return slide content blocks
// PATCH: add or replace a media block in the slide content array

import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import type { ContentBlock } from '@/lib/types/slides'

async function requireAdmin(supabase: ReturnType<typeof createClient>) {
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return null
  const { data: profile } = await supabase
    .from('profiles').select('user_role').eq('id', user.id).single()
  if (profile?.user_role !== 'admin') return null
  return user
}

export async function GET(
  _req: NextRequest,
  { params }: { params: { slideId: string } }
) {
  const supabase = createClient()
  if (!await requireAdmin(supabase)) {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
  }

  const { data, error } = await supabase
    .from('module_slides')
    .select('id, slide_number, title, content, layout')
    .eq('id', params.slideId)
    .single()

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json(data)
}

export async function PATCH(
  req: NextRequest,
  { params }: { params: { slideId: string } }
) {
  const supabase = createClient()
  if (!await requireAdmin(supabase)) {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
  }

  const body = await req.json() as {
    action:  'add_block' | 'remove_block' | 'replace_content'
    block?:  ContentBlock
    index?:  number
    content?: ContentBlock[]
  }

  // Fetch current content
  const { data: slide, error: fetchErr } = await supabase
    .from('module_slides')
    .select('content')
    .eq('id', params.slideId)
    .single()

  if (fetchErr) return NextResponse.json({ error: fetchErr.message }, { status: 500 })

  let blocks: ContentBlock[] = Array.isArray(slide.content) ? slide.content : []

  if (body.action === 'add_block' && body.block) {
    blocks = [...blocks, body.block]
  } else if (body.action === 'remove_block' && body.index !== undefined) {
    blocks = blocks.filter((_, i) => i !== body.index)
  } else if (body.action === 'replace_content' && body.content) {
    blocks = body.content
  } else {
    return NextResponse.json({ error: 'Invalid action or missing payload' }, { status: 400 })
  }

  const { error: updateErr } = await supabase
    .from('module_slides')
    .update({ content: blocks, updated_at: new Date().toISOString() })
    .eq('id', params.slideId)

  if (updateErr) return NextResponse.json({ error: updateErr.message }, { status: 500 })
  return NextResponse.json({ content: blocks })
}
