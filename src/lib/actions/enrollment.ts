// src/lib/actions/enrollment.ts
'use server';

import { createClient } from '@/lib/supabase/server';
import { revalidatePath } from 'next/cache';

export async function enrollInCourse(courseId: string) {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return { success: false, error: 'Not authenticated' };
  }

  // Verificar se já está matriculado
  const { data: existing } = await supabase
    .from('course_enrollments')
    .select('id')
    .eq('user_id', user.id)
    .eq('course_id', courseId)
    .single();

  if (existing) {
    return { success: false, error: 'Already enrolled in this course' };
  }

  // Criar matrícula
  const { data: enrollment, error } = await supabase
    .from('course_enrollments')
    .insert({
      user_id: user.id,
      course_id: courseId,
      status: 'enrolled',
      progress_percentage: 0,
      current_module_number: 1,
    })
    .select('id')
    .single();

  if (error) {
    console.error('Enrollment error:', error);
    return { success: false, error: 'Failed to enroll. Please try again.' };
  }

  // Inicializar progresso do primeiro módulo
  const { data: firstModule } = await supabase
    .from('course_modules')
    .select('id')
    .eq('course_id', courseId)
    .eq('module_number', 1)
    .single();

  if (firstModule && enrollment) {
    // Slide count is derived from actual slide rows, not a stored counter —
    // stays correct as slides are added/removed later.
    const { count: slideCount } = await supabase
      .from('module_slides')
      .select('id', { count: 'exact', head: true })
      .eq('module_id', firstModule.id);

    await supabase.from('user_module_progress').insert({
      user_id: user.id,
      course_id: courseId,
      module_id: firstModule.id,
      enrollment_id: enrollment.id,
      current_slide: 1,
      total_slides: slideCount ?? 0,
      is_completed: false,
      quiz_passed: false,
      quiz_attempts_count: 0,
    });
  }

  revalidatePath('/dashboard');
  revalidatePath('/courses');
  return { success: true };
}

export async function unenrollFromCourse(courseId: string) {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return { success: false, error: 'Not authenticated' };
  }

  // Remover progresso dos módulos deste curso
  const { data: modules } = await supabase
    .from('course_modules')
    .select('id')
    .eq('course_id', courseId);

  if (modules && modules.length > 0) {
    const moduleIds = modules.map((m) => m.id);
    
    // Remover slide progress
    await supabase
      .from('user_slide_progress')
      .delete()
      .eq('user_id', user.id)
      .in('module_id', moduleIds);

    // Remover module progress
    await supabase
      .from('user_module_progress')
      .delete()
      .eq('user_id', user.id)
      .in('module_id', moduleIds);
  }

  // Remover matrícula
  const { error } = await supabase
    .from('course_enrollments')
    .delete()
    .eq('user_id', user.id)
    .eq('course_id', courseId);

  if (error) {
    console.error('Unenroll error:', error);
    return { success: false, error: 'Failed to unenroll. Please try again.' };
  }

  revalidatePath('/dashboard');
  return { success: true };
}
