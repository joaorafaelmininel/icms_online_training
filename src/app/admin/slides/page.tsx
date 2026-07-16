// src/app/admin/slides/page.tsx
// Admin panel — manage slide media content
// Protected: admin role only

import type { ComponentProps } from 'react'
import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import SlideMediaAdmin from '@/components/admin/SlideMediaAdmin'

export const dynamic = 'force-dynamic'

type Profile = {
  user_role: string | null
  first_name: string | null
}

type LocalizedLike = {
  en?: string
  es?: string
}

type RawSlide = {
  id: string
  slide_number: number
  title: string | LocalizedLike | null
  content: unknown
  layout: string | null
  thumbnail_url: string | null
}

type RawModule = {
  id: string
  module_number: number
  title: string | LocalizedLike | null
  total_slides: number | null
  module_slides: RawSlide[] | null
}

type RawCourse = {
  id: string
  slug: string
  title: string | LocalizedLike | null
  course_modules: RawModule[] | null
}

type SlideMediaAdminProps = ComponentProps<typeof SlideMediaAdmin>
type AdminCourses = SlideMediaAdminProps['courses']
type AdminCourse = AdminCourses[number]
type AdminModule = AdminCourse['course_modules'][number]
type AdminSlide = AdminModule['module_slides'][number]

function normalizeLocalizedField(
  value: string | LocalizedLike | null | undefined
): { en: string; es: string } {
  if (!value) {
    return { en: '', es: '' }
  }

  if (typeof value === 'string') {
    return { en: value, es: value }
  }

  return {
    en: value.en ?? value.es ?? '',
    es: value.es ?? value.en ?? '',
  }
}

function normalizeSlide(slide: RawSlide): AdminSlide {
  return {
    ...slide,
    title: normalizeLocalizedField(slide.title),
  } as AdminSlide
}

function normalizeModule(mod: RawModule): AdminModule {
  const slides = [...(mod.module_slides ?? [])]
    .sort((a, b) => a.slide_number - b.slide_number)
    .map(normalizeSlide)

  return {
    id: mod.id,
    module_number: mod.module_number,
    title: normalizeLocalizedField(mod.title),
    total_slides: mod.total_slides ?? slides.length,
    module_slides: slides,
  } as AdminModule
}

function normalizeCourse(course: RawCourse): AdminCourse {
  const modules = [...(course.course_modules ?? [])]
    .sort((a, b) => a.module_number - b.module_number)
    .map(normalizeModule)

  return {
    id: course.id,
    slug: course.slug,
    title: normalizeLocalizedField(course.title),
    course_modules: modules,
  } as AdminCourse
}

export default async function AdminSlidesPage() {
  const supabase = createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    redirect('/auth?tab=signin&redirectTo=/admin/slides')
  }

  const profileResult = await supabase
    .from('profiles')
    .select('user_role, first_name')
    .eq('id', user.id)
    .single()

  const profile = profileResult.data as Profile | null

  if (!profile || profile.user_role !== 'admin') {
    redirect('/dashboard')
  }

  const coursesResult = await supabase
    .from('courses')
    .select(`
      id, slug, title,
      course_modules (
        id, module_number, title, total_slides,
        module_slides (
          id, slide_number, title, content, layout, thumbnail_url
        )
      )
    `)
    .eq('is_active', true)
    .order('created_at')

  const rawCourses = (coursesResult.data as RawCourse[] | null) ?? []
  const sorted: AdminCourses = rawCourses.map(normalizeCourse)

  return (
    <SlideMediaAdmin
      courses={sorted}
      adminName={profile.first_name || 'Admin'}
    />
  )
}