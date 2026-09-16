// src/app/api/admin/slides/translate-patch/route.ts
// POST: apply a batch of Spanish text corrections in one request. Each patch
// replaces the full `content` array of one slide (identified by course slug +
// module number + slide number, since the read-only export endpoint doesn't
// expose slide ids) — the caller is expected to submit the slide's complete,
// corrected content array (media blocks included, unchanged) rather than a
// partial diff, so this never has to guess which blocks were meant to survive.
// Admin-gated, same requireAdmin pattern as the other admin slide routes.

import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import type { ContentBlock } from '@/lib/types/slides'

type AdminProfile = {
  user_role: string | null
}

type FieldEdit = {
  blockIndex: number
  lang: 'en' | 'es'
  value: string
}

type Patch = {
  moduleNumber: number
  slideNumber: number
  // Either a full content array to replace outright (use when the caller has
  // verified the slide's current full content, media URLs included), or a
  // list of individual text-field edits applied against whatever content is
  // currently stored (use when the caller only knows the text that needs
  // fixing and must not risk mistyping a media URL it never touches).
  content?: ContentBlock[]
  fields?: FieldEdit[]
  title?: { en: string; es: string }
}

type PatchResult = {
  moduleNumber: number
  slideNumber: number
  status: 'ok' | 'error'
  message?: string
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

  const body = (await req.json()) as {
    courseSlug?: string
    patches?: Patch[]
  }

  if (!body.courseSlug || !Array.isArray(body.patches) || body.patches.length === 0) {
    return NextResponse.json({ error: 'Missing courseSlug or patches' }, { status: 400 })
  }

  const courseResult = await supabase
    .from('courses')
    .select('id')
    .eq('slug', body.courseSlug)
    .single()

  if (courseResult.error || !courseResult.data) {
    return NextResponse.json({ error: 'Course not found' }, { status: 404 })
  }

  const courseId = (courseResult.data as { id: string }).id

  const results: PatchResult[] = []

  for (const patch of body.patches) {
    const { moduleNumber, slideNumber, content, fields, title } = patch

    if (
      typeof moduleNumber !== 'number' ||
      typeof slideNumber !== 'number' ||
      (!Array.isArray(content) && !Array.isArray(fields))
    ) {
      results.push({ moduleNumber, slideNumber, status: 'error', message: 'Invalid patch shape' })
      continue
    }

    const moduleResult = await supabase
      .from('course_modules')
      .select('id')
      .eq('course_id', courseId)
      .eq('module_number', moduleNumber)
      .single()

    if (moduleResult.error || !moduleResult.data) {
      results.push({ moduleNumber, slideNumber, status: 'error', message: 'Module not found' })
      continue
    }

    const moduleId = (moduleResult.data as { id: string }).id

    let finalContent: ContentBlock[] | null = null

    if (Array.isArray(content)) {
      // Same null/malformed-block guard as the single-slide content route —
      // a bad block here would otherwise crash the admin panel and the
      // student view alike.
      finalContent = content.filter(
        (b): b is ContentBlock => !!b && typeof b === 'object' && typeof (b as { type?: unknown }).type === 'string'
      )
    } else if (Array.isArray(fields)) {
      const currentResult = await supabase
        .from('module_slides')
        .select('content')
        .eq('module_id', moduleId)
        .eq('slide_number', slideNumber)
        .single()

      if (currentResult.error || !currentResult.data) {
        results.push({ moduleNumber, slideNumber, status: 'error', message: 'Slide not found' })
        continue
      }

      const currentContent = (
        (currentResult.data as { content: ContentBlock[] | null }).content ?? []
      ).slice() as Array<ContentBlock & { text?: { en: string; es: string } }>

      let fieldError: string | null = null
      for (const edit of fields) {
        const block = currentContent[edit.blockIndex] as
          | (ContentBlock & { text?: { en: string; es: string } })
          | undefined
        if (!block || !block.text || (edit.lang !== 'en' && edit.lang !== 'es')) {
          fieldError = `Invalid field edit at blockIndex ${edit.blockIndex}`
          break
        }
        block.text = { ...block.text, [edit.lang]: edit.value }
      }

      if (fieldError) {
        results.push({ moduleNumber, slideNumber, status: 'error', message: fieldError })
        continue
      }

      finalContent = currentContent
    }

    if (!finalContent) {
      results.push({ moduleNumber, slideNumber, status: 'error', message: 'Nothing to update' })
      continue
    }

    const updatePayload: Record<string, unknown> = {
      content: finalContent,
      updated_at: new Date().toISOString(),
    }

    if (title && typeof title.en === 'string' && typeof title.es === 'string') {
      updatePayload.title = title
    }

    const updateResult = await supabase
      .from('module_slides')
      .update(updatePayload as never)
      .eq('module_id', moduleId)
      .eq('slide_number', slideNumber)
      .select('id')

    if (updateResult.error) {
      results.push({ moduleNumber, slideNumber, status: 'error', message: updateResult.error.message })
      continue
    }

    // A zero-row result here is a silent RLS block or a missing slide, not a
    // real success — Postgrest returns 200 with an empty array either way.
    if (!updateResult.data || updateResult.data.length === 0) {
      results.push({
        moduleNumber,
        slideNumber,
        status: 'error',
        message: 'Update matched no rows (slide not found, or blocked by RLS)',
      })
      continue
    }

    results.push({ moduleNumber, slideNumber, status: 'ok' })
  }

  return NextResponse.json({ results })
}
