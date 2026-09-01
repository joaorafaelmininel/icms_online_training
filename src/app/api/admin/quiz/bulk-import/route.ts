// src/app/api/admin/quiz/bulk-import/route.ts
// POST: create multiple module-quiz questions at once, from a pasted JSON
// array (mirrors /api/admin/slides/bulk-import). Requires admin role.

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
  question_type: 'multiple_choice' | 'true_false'
  options: ImportOption[]
  correct_answer: string
  explanation?: LocalizedField
  points?: number
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

  const body = (await req.json()) as { moduleId?: string; questions?: ImportQuestion[] }

  if (!body.moduleId) {
    return NextResponse.json({ error: 'Missing moduleId' }, { status: 400 })
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

  const moduleResult = await supabase
    .from('course_modules')
    .select('id, course_id')
    .eq('id', body.moduleId)
    .single()

  if (moduleResult.error || !moduleResult.data) {
    return NextResponse.json({ error: 'Module not found' }, { status: 404 })
  }

  const mod = moduleResult.data as { id: string; course_id: string }

  const lastQResult = await supabase
    .from('module_quiz_questions')
    .select('question_number')
    .eq('module_id', mod.id)
    .order('question_number', { ascending: false })
    .limit(1)
    .maybeSingle()

  const startNumber = ((lastQResult.data as { question_number: number } | null)?.question_number ?? 0) + 1

  const rows = body.questions.map((q, i) => ({
    module_id: mod.id,
    course_id: mod.course_id,
    question_number: startNumber + i,
    question_text: q.question_text,
    question_type: q.question_type || 'multiple_choice',
    options: q.options,
    correct_answer: q.correct_answer,
    explanation: q.explanation || null,
    points: q.points ?? 20,
  }))

  const insertResult = await supabase
    .from('module_quiz_questions')
    .insert(rows as never)
    .select('id, question_number, question_text, question_type, options, correct_answer, explanation, points')
    .order('question_number')

  if (insertResult.error) {
    return NextResponse.json({ error: insertResult.error.message }, { status: 500 })
  }

  // A module's quiz is only offered to students once has_quiz is set —
  // importing questions is what turns the quiz "on" for that module.
  await supabase
    .from('course_modules')
    .update({ has_quiz: true } as never)
    .eq('id', mod.id)

  return NextResponse.json({ questions: insertResult.data })
}
