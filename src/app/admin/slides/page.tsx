// src/app/admin/slides/page.tsx
// Admin panel — manage slide media content
// Protected: admin role only

import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import SlideMediaAdmin from '@/components/admin/SlideMediaAdmin'

export const dynamic = 'force-dynamic'

export default async function AdminSlidesPage() {
  const supabase = createClient()

  // Auth + role guard
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/auth?tab=signin&redirectTo=/admin/slides')

  const { data: profile } = await supabase
    .from('profiles')
    .select('user_role, first_name')
    .eq('id', user.id)
    .single()

  if (profile?.user_role !== 'admin') redirect('/dashboard')

  // Fetch all active courses with their modules and slides
  const { data: courses } = await supabase
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

  // Sort modules and slides
  const sorted = (courses || []).map((course: any) => ({
    ...course,
    course_modules: [...(course.course_modules || [])]
      .sort((a: any, b: any) => a.module_number - b.module_number)
      .map((mod: any) => ({
        ...mod,
        module_slides: [...(mod.module_slides || [])].sort(
          (a: any, b: any) => a.slide_number - b.slide_number
        ),
      })),
  }))

  return (
    <SlideMediaAdmin
      courses={sorted}
      adminName={profile?.first_name || 'Admin'}
    />
  )
}
