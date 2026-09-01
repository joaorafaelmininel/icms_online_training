// src/app/api/admin/final-exam/bulk-import/route.ts
// POST: create multiple final-exam questions at once, from a pasted JSON
// array (mirrors /api/admin/slides/bulk-import). Course-level, not tied to
// a single module — each question can optionally carry a `source_module`
// number for traceability. Requires admin role.

import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export const dynamic = 'force-dynamic'

type AdminProfile = {
  user_role: string | null
}

type LocalizedField = { en: string; es: string }

type ImportOption = { id: string; text: LocalizedField }

type ImportQuestion = {
  question_text: LocalizedField
  options: ImportOption[]
  correct_answer: string
  explanation?: LocalizedField
  points?: number
  source_module?: number | null
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

  const body = (await req.json()) as { courseId?: string; questions?: ImportQuestion[] }

  if (!body.courseId) {
    return NextResponse.json({ error: 'Missing courseId' }, { status: 400 })
  }

  if (!Array.isArray(body.questions) || body.questions.length === 0) {
    return NextResponse.json({ error: 'questions must be a non-empty array' }, { status: 400 })
  }

  for (const [i, q] of body.questions.entries()) {
    if (!Array.isArray(q.options) || q.options.length === 0) {
      return NextResponse.json({ error: `questions[${i}].options must be a non-empty array` }, { status: 400 })
    }
    if (!q.correct_answer || !q.options.some((o) => o.id === q.correct_answer)) {
      return NextResponse.json({ error: `questions[${i}].correct_answer must match one of its option ids` }, { status: 400 })
    }
  }

  const courseResult = await supabase
    .from('courses')
    .select('id')
    .eq('id', body.courseId)
    .single()

  if (courseResult.error || !courseResult.data) {
    return NextResponse.json({ error: 'Course not found' }, { status: 404 })
  }

  const lastQResult = await supabase
    .from('final_exam_questions')
    .select('question_number')
    .eq('course_id', body.courseId)
    .order('question_number', { ascending: false })
    .limit(1)
    .maybeSingle()

  const startNumber = ((lastQResult.data as { question_number: number } | null)?.question_number ?? 0) + 1

  const rows = body.questions.map((q, i) => ({
    course_id: body.courseId,
    question_number: startNumber + i,
    question_text: q.question_text,
    options: q.options,
    correct_answer: q.correct_answer,
    explanation: q.explanation || null,
    points: q.points ?? 10,
    source_module: q.source_module ?? null,
  }))

  const insertResult = await supabase
    .from('final_exam_questions')
    .insert(rows as never)
    .select('id, question_number, question_text, options, correct_answer, explanation, points, source_module')
    .order('question_number')

  if (insertResult.error) {
    return NextResponse.json({ error: insertResult.error.message }, { status: 500 })
  }

  return NextResponse.json({ questions: insertResult.data })
}
