// src/app/api/admin/slides/[slideId]/reorder/route.ts
// PATCH: swap this slide's position with another slide in the same module —
// used by the admin panel's slide-list up/down reorder buttons. Takes the
// other slide's id directly (as currently sorted client-side) rather than
// doing arithmetic on slide_number, since slide_number isn't guaranteed to
// be a gap-free sequence (a slide can be deleted, leaving a gap) — the same
// reason student-facing navigation was fixed to work off array position
// instead of slide_number arithmetic.
// Requires admin role.

import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

type AdminProfile = {
  user_role: string | null
}

type SlideRow = {
  id: string
  module_id: string
  slide_number: number
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
  { params }: { params: { slideId: string } }
) {
  const supabase = createClient()

  if (!(await requireAdmin(supabase))) {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
  }

  const body = (await req.json()) as { swapWithSlideId?: string }

  if (!body.swapWithSlideId) {
    return NextResponse.json({ error: 'Missing swapWithSlideId' }, { status: 400 })
  }

  const slideAResult = await supabase
    .from('module_slides')
    .select('id, module_id, slide_number')
    .eq('id', params.slideId)
    .single()

  const slideBResult = await supabase
    .from('module_slides')
    .select('id, module_id, slide_number')
    .eq('id', body.swapWithSlideId)
    .single()

  if (slideAResult.error || !slideAResult.data) {
    return NextResponse.json({ error: 'Slide not found' }, { status: 404 })
  }
  if (slideBResult.error || !slideBResult.data) {
    return NextResponse.json({ error: 'Slide to swap with not found' }, { status: 404 })
  }

  const slideA = slideAResult.data as SlideRow
  const slideB = slideBResult.data as SlideRow

  if (slideA.module_id !== slideB.module_id) {
    return NextResponse.json({ error: 'Slides must belong to the same module' }, { status: 400 })
  }

  // Three-step swap through a temporary sentinel value, since slide_number
  // carries both a unique constraint per module and a "must be positive"
  // check constraint — writing B's number directly onto A while A still
  // holds it would collide, and a negative scratch value (tried first)
  // gets rejected by the check constraint. Offsetting well past any
  // realistic slide count keeps this positive and collision-free.
  const tempSlideNumber = 1_000_000 + slideA.slide_number

  const step1 = await supabase
    .from('module_slides')
    .update({ slide_number: tempSlideNumber } as never)
    .eq('id', slideA.id)
    .select('id')

  if (step1.error || !step1.data || step1.data.length === 0) {
    return NextResponse.json(
      { error: step1.error?.message || 'Reorder update did not affect any rows (likely blocked by row-level security)' },
      { status: 500 }
    )
  }

  const step2 = await supabase
    .from('module_slides')
    .update({ slide_number: slideA.slide_number } as never)
    .eq('id', slideB.id)
    .select('id')

  if (step2.error || !step2.data || step2.data.length === 0) {
    // Best-effort revert of step 1 so a failure here doesn't strand slide A at -1.
    await supabase.from('module_slides').update({ slide_number: slideA.slide_number } as never).eq('id', slideA.id)
    return NextResponse.json(
      { error: step2.error?.message || 'Reorder update did not affect any rows (likely blocked by row-level security)' },
      { status: 500 }
    )
  }

  const step3 = await supabase
    .from('module_slides')
    .update({ slide_number: slideB.slide_number } as never)
    .eq('id', slideA.id)
    .select('id')

  if (step3.error || !step3.data || step3.data.length === 0) {
    return NextResponse.json(
      { error: step3.error?.message || 'Reorder update did not affect any rows (likely blocked by row-level security)' },
      { status: 500 }
    )
  }

  return NextResponse.json({
    slides: [
      { id: slideA.id, slide_number: slideB.slide_number },
      { id: slideB.id, slide_number: slideA.slide_number },
    ],
  })
}
