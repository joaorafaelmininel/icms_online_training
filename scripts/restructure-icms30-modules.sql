-- Reestrutura o curso ICMS3.0 (b8e6a6f7-5019-425f-8f27-d5477b78588a) de 6 para 8 módulos.
-- Não há slides, quiz ou progresso de usuário vinculados hoje — confirmado antes de rodar isto.
-- Execute no Supabase SQL Editor do projeto.

begin;

-- Módulos 1–6 existentes: novo título, limpa description/learning_outcomes/duration (ficam obsoletos)
update course_modules set
  title = '{"en": "Online Course Introduction", "es": "Introducción al Curso en Línea"}'::jsonb,
  description = null, learning_outcomes = null, duration_minutes = null, total_slides = 0,
  has_quiz = true, quiz_required = true
where course_id = 'b8e6a6f7-5019-425f-8f27-d5477b78588a' and module_number = 1;

update course_modules set
  title = '{"en": "INSARAG Coordination and Management System", "es": "Sistema de Coordinación y Gestión de INSARAG"}'::jsonb,
  description = null, learning_outcomes = null, duration_minutes = null, total_slides = 0,
  has_quiz = true, quiz_required = true
where course_id = 'b8e6a6f7-5019-425f-8f27-d5477b78588a' and module_number = 2;

update course_modules set
  title = '{"en": "Information Management and Data Collection", "es": "Gestión de la Información y Recopilación de Datos"}'::jsonb,
  description = null, learning_outcomes = null, duration_minutes = null, total_slides = 0,
  has_quiz = true, quiz_required = true
where course_id = 'b8e6a6f7-5019-425f-8f27-d5477b78588a' and module_number = 3;

update course_modules set
  title = '{"en": "ICMS3.0 suite of applications", "es": "Suite de Aplicaciones ICMS3.0"}'::jsonb,
  description = null, learning_outcomes = null, duration_minutes = null, total_slides = 0,
  has_quiz = true, quiz_required = true
where course_id = 'b8e6a6f7-5019-425f-8f27-d5477b78588a' and module_number = 4;

update course_modules set
  title = '{"en": "ICMS3.0 Field Collection", "es": "Recopilación de Campo de ICMS3.0"}'::jsonb,
  description = null, learning_outcomes = null, duration_minutes = null, total_slides = 0,
  has_quiz = true, quiz_required = true
where course_id = 'b8e6a6f7-5019-425f-8f27-d5477b78588a' and module_number = 5;

update course_modules set
  title = '{"en": "Two-Stage data collection using ArcGIS QuickCapture® and FieldMaps®", "es": "Recopilación de datos en dos etapas usando ArcGIS QuickCapture® y FieldMaps®"}'::jsonb,
  description = null, learning_outcomes = null, duration_minutes = null, total_slides = 0,
  has_quiz = true, quiz_required = true
where course_id = 'b8e6a6f7-5019-425f-8f27-d5477b78588a' and module_number = 6;

-- Módulos novos 7 e 8
insert into course_modules
  (course_id, module_number, order_index, title, description, learning_outcomes, duration_minutes,
   total_slides, has_quiz, quiz_required, quiz_passing_score, quiz_max_attempts, is_locked, prerequisites)
values
  ('b8e6a6f7-5019-425f-8f27-d5477b78588a', 7, 7,
   '{"en": "ICMS3.0 Team Module", "es": "Módulo de Equipo de ICMS3.0"}'::jsonb,
   null, null, null, 0, true, true, 70, null, true, null),
  ('b8e6a6f7-5019-425f-8f27-d5477b78588a', 8, 8,
   '{"en": "Course Summary", "es": "Resumen del Curso"}'::jsonb,
   null, null, null, 0, false, false, 70, null, true, null);

-- Atualiza a contagem de módulos no curso
update courses set total_modules = 8 where id = 'b8e6a6f7-5019-425f-8f27-d5477b78588a';

commit;

-- Conferência
select module_number, title, has_quiz, quiz_required, total_slides
from course_modules
where course_id = 'b8e6a6f7-5019-425f-8f27-d5477b78588a'
order by module_number;
