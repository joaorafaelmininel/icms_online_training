// src/app/courses/[slug]/modules/[number]/page.tsx

import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import ModuleViewerClient from '@/components/modules/ModuleViewerClient'
import type { Slide } from '@/lib/types/slides'

/* ───────────────── TYPES ───────────────── */

type Lang = 'en' | 'es'

interface LocalizedField {
  en: string
  es: string
}

interface CourseRow {
  id: string
  slug: string
  title: LocalizedField
}

interface ModuleRow {
  id: string
  module_number: number
  title: LocalizedField
  total_slides: number
  has_quiz: boolean
  quiz_required: boolean
}

interface SlideRow {
  id: string
  module_id: string
  course_id: string
  slide_number: number
  title: any
  content: any
  layout: any
  thumbnail_url: string | null
  notes: string | null
  created_at: string
  updated_at: string
}

interface SlideProgressRow {
  slide_number: number
  is_completed: boolean
}

interface ModuleProgressRow {
  current_slide: number
  is_completed: boolean
  quiz_passed: boolean
}

/* ───────────────── PAGE ───────────────── */

export default async function ModulePage({
  params,
}: {
  params: { slug: string; number: string }
}) {
  const supabase = await createClient()

  const moduleNumber = Number(params.number)
  if (Number.isNaN(moduleNumber)) redirect('/courses')

  /* ───────── AUTH ───────── */

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    redirect(
      `/auth?tab=signin&redirectTo=/courses/${params.slug}/modules/${moduleNumber}`
    )
  }

  /* ───────── COURSE ───────── */

  const { data: course } = await supabase
    .from('courses')
    .select('id, slug, title')
    .eq('slug', params.slug)
    .single<CourseRow>()

  if (!course) redirect('/courses')

  /* ───────── ENROLLMENT ───────── */

  const { data: enrollment } = await supabase
    .from('course_enrollments')
    .select('id')
    .eq('user_id', user.id)
    .eq('course_id', course.id)
    .single<{ id: string }>()

  if (!enrollment) redirect(`/courses/${course.slug}`)

  /* ───────── MODULE ───────── */

  const { data: module } = await supabase
    .from('course_modules')
    .select(
      'id, module_number, title, total_slides, has_quiz, quiz_required'
    )
    .eq('course_id', course.id)
    .eq('module_number', moduleNumber)
    .single<ModuleRow>()

  if (!module) redirect(`/courses/${course.slug}`)

  /* ───────── ALL MODULES ───────── */

  const { data: allModules } = await supabase
    .from('course_modules')
    .select(
      'id, module_number, title, total_slides, has_quiz, quiz_required'
    )
    .eq('course_id', course.id)
    .order('module_number')
    .returns<ModuleRow[]>()

  /* ───────── SLIDES ───────── */

  const { data: slidesDB } = await supabase
    .from('module_slides')
    .select('*')
    .eq('module_id', module.id)
    .order('slide_number')
    .returns<SlideRow[]>()

  const slides: Slide[] =
    slidesDB?.map((s) => ({
      id: s.id,
      module_id: s.module_id,
      course_id: s.course_id,
      slide_number: s.slide_number,
      title: s.title,
      content: s.content,
      layout: s.layout,
      thumbnail_url: s.thumbnail_url,
      notes: s.notes,
      created_at: s.created_at,
      updated_at: s.updated_at,
    })) ?? []

  /* ───────── SLIDE PROGRESS ───────── */

  const { data: slideProgress } = await supabase
    .from('user_slide_progress')
    .select('slide_number, is_completed')
    .eq('user_id', user.id)
    .eq('module_id', module.id)
    .returns<SlideProgressRow[]>()

  const completedSlides =
    slideProgress
      ?.filter((s) => s.is_completed)
      .map((s) => s.slide_number) ?? []

  /* ───────── MODULE PROGRESS ───────── */

  const { data: moduleProgress } = await supabase
    .from('user_module_progress')
    .select('current_slide, is_completed, quiz_passed')
    .eq('user_id', user.id)
    .eq('module_id', module.id)
    .single<ModuleProgressRow>()

  /* ───────── LANGUAGE ───────── */

  const { data: profile } = await supabase
    .from('profiles')
    .select('preferred_language')
    .eq('id', user.id)
    .single<{ preferred_language: Lang }>()

  const language: Lang = profile?.preferred_language ?? 'en'

  /* ───────── RENDER ───────── */

  return (
    <ModuleViewerClient
      course={course}
      module={module}
      allModules={allModules ?? []}
      slides={slides}
      completedSlides={completedSlides}
      moduleProgress={moduleProgress}
      enrollmentId={enrollment.id}
      language={language}
    />
  )
}
