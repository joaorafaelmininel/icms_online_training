// src/app/dashboard/page.tsx
import { createClient } from '@/lib/supabase/server'
import { getCurrentLanguage } from '@/lib/i18n/language'
import { redirect } from 'next/navigation'
import DashboardClient from '@/components/dashboard/DashboardClient'
import type {
  Course,
  CourseModule,
  CourseEnrollment,
  UserModuleProgress,
  EnrolledCourseData,
  AvailableCourseData,
} from '@/lib/types/courses'

type ProfileRow = {
  first_name: string | null
  last_name: string | null
  title: string | null
}

export const metadata = {
  title: 'Dashboard — ICMS Learning Platform',
}

export default async function DashboardPage() {
  const supabase = createClient()
  const language = (await getCurrentLanguage()) as 'en' | 'es'

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) redirect('/auth')

  const profileResult = await supabase
    .from('profiles')
    .select('first_name, last_name, title')
    .eq('id', user.id)
    .single()

  const profile = profileResult.data as ProfileRow | null

  const firstName = profile?.first_name || user.email?.split('@')[0] || 'User'

  const { data: courses } = await supabase
    .from('courses')
    .select('*')
    .in('status', ['active', 'coming_soon'])
    .order('created_at', { ascending: true })

  const { data: allModules } = await supabase
    .from('course_modules')
    .select('*')
    .order('module_number', { ascending: true })

  const { data: enrollments } = await supabase
    .from('course_enrollments')
    .select('*')
    .eq('user_id', user.id)

  const { data: allProgress } = await supabase
    .from('user_module_progress')
    .select('*')
    .eq('user_id', user.id)

  const enrolledCourseIds = new Set(
    ((enrollments || []) as CourseEnrollment[]).map((e) => e.course_id)
  )

  const enrolledCourses: EnrolledCourseData[] = ((enrollments || []) as CourseEnrollment[])
    .filter(
      (e) =>
        e.status === 'enrolled' ||
        e.status === 'in_progress' ||
        e.status === 'completed'
    )
    .map((enrollment) => {
      const course = ((courses || []) as Course[]).find(
        (c) => c.id === enrollment.course_id
      )
      if (!course) return null

      const modules = ((allModules || []) as CourseModule[]).filter(
        (m) => m.course_id === enrollment.course_id
      )

      const moduleIds = new Set(modules.map((m) => m.id))

      const moduleProgress = ((allProgress || []) as UserModuleProgress[]).filter(
        (mp) => moduleIds.has(mp.module_id)
      )

      const completedModules = moduleProgress.filter((mp) => {
        const mod = modules.find((m) => m.id === mp.module_id)
        return mp.is_completed === true && (mp.quiz_passed === true || !mod?.quiz_required)
      }).length

      return {
        enrollment,
        course,
        modules,
        moduleProgress,
        completedModules,
        totalModules: modules.length,
        nextModuleNumber: completedModules + 1,
      }
    })
    .filter(Boolean) as EnrolledCourseData[]

  const availableCourses: AvailableCourseData[] = ((courses || []) as Course[]).map(
    (course) => {
      const modules = ((allModules || []) as CourseModule[]).filter(
        (m) => m.course_id === course.id
      )

      return {
        course,
        modules,
        isEnrolled: enrolledCourseIds.has(course.id),
      }
    }
  )

  return (
    <DashboardClient
      firstName={firstName}
      language={language}
      enrolledCourses={enrolledCourses}
      availableCourses={availableCourses}
    />
  )
}