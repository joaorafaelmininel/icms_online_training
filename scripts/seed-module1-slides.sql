-- Popula o Módulo 1 (Online Course Introduction) do curso ICMS3.0
-- (b8e6a6f7-5019-425f-8f27-d5477b78588a) com 7 slides, em EN/ES.
--
-- Este script APAGA os slides existentes do Módulo 1 antes de inserir os
-- novos — confirme que não há nada nesse módulo que você queira preservar
-- antes de rodar. Progresso de alunos (module_progress / user_progress) não
-- é afetado, apenas o conteúdo dos slides.
--
-- Execute no Supabase SQL Editor do projeto.

begin;

-- Remove os slides atuais do Módulo 1
delete from module_slides
where module_id = (
  select id from course_modules
  where course_id = 'b8e6a6f7-5019-425f-8f27-d5477b78588a' and module_number = 1
);

-- Slide 1 — Course Introduction
insert into module_slides (module_id, course_id, slide_number, layout, title, content)
values (
  (select id from course_modules where course_id = 'b8e6a6f7-5019-425f-8f27-d5477b78588a' and module_number = 1),
  'b8e6a6f7-5019-425f-8f27-d5477b78588a', 1, 'text_only',
  '{"en": "Course Introduction", "es": "Introducción al Curso"}'::jsonb,
  $j$[
    {"type": "heading", "level": 1, "text": {"en": "Welcome to the ICMS3.0 Online Course", "es": "Bienvenido al Curso en Línea de ICMS3.0"}},
    {"type": "paragraph", "text": {"en": "This course introduces the INSARAG Coordination and Management System (ICMS) 3.0, the digital platform used to collect, manage, and share information during international Urban Search and Rescue (USAR) operations coordinated under INSARAG and the UN Office for the Coordination of Humanitarian Affairs (OCHA).", "es": "Este curso presenta el Sistema de Coordinación y Gestión de INSARAG (ICMS) 3.0, la plataforma digital utilizada para recopilar, gestionar y compartir información durante las operaciones internacionales de Búsqueda y Rescate Urbano (USAR) coordinadas por INSARAG y la Oficina de las Naciones Unidas para la Coordinación de Asuntos Humanitarios (OCHA)."}},
    {"type": "paragraph", "text": {"en": "It is designed for USAR team members, On-Site Operations Coordination Centre (OSOCC) and Reception/Departure Centre (RDC) staff, and anyone who will use ICMS3.0 in the field or in a coordination cell.", "es": "Está diseñado para miembros de equipos USAR, personal del Centro de Coordinación de Operaciones en el Sitio (OSOCC) y del Centro de Recepción/Salida (RDC), y para cualquier persona que utilizará ICMS3.0 en el terreno o en una célula de coordinación."}},
    {"type": "callout", "variant": "tip", "text": {"en": "This course is self-paced. You can leave at any time and pick up exactly where you left off.", "es": "Este curso es autoguiado. Puedes salir en cualquier momento y retomarlo exactamente donde lo dejaste."}}
  ]$j$::jsonb
);

-- Slide 2 — Using the Course Player/Platform
insert into module_slides (module_id, course_id, slide_number, layout, title, content)
values (
  (select id from course_modules where course_id = 'b8e6a6f7-5019-425f-8f27-d5477b78588a' and module_number = 1),
  'b8e6a6f7-5019-425f-8f27-d5477b78588a', 2, 'text_only',
  '{"en": "Using the Course Platform", "es": "Uso de la Plataforma del Curso"}'::jsonb,
  $j$[
    {"type": "heading", "level": 1, "text": {"en": "Using the Course Platform", "es": "Uso de la Plataforma del Curso"}},
    {"type": "paragraph", "text": {"en": "Each module is made up of a series of slides. As you move through them, the platform automatically tracks and saves your progress, so you always know exactly where you are.", "es": "Cada módulo está compuesto por una serie de diapositivas. A medida que avanzas, la plataforma registra y guarda tu progreso automáticamente, así siempre sabes exactamente en qué punto te encuentras."}},
    {"type": "list", "ordered": false, "items": [
      {"en": "Module Progress panel — the left-hand menu lists every slide in the current module and shows which ones you have already viewed.", "es": "Panel de Progreso del Módulo — el menú lateral izquierdo enumera todas las diapositivas del módulo actual y muestra cuáles ya has visto."},
      {"en": "Progress bar — shows the percentage of the current module you have completed.", "es": "Barra de progreso — muestra el porcentaje del módulo actual que has completado."},
      {"en": "Language switch — the course is available in English and Spanish; you can switch language at any time.", "es": "Cambio de idioma — el curso está disponible en inglés y español; puedes cambiar de idioma en cualquier momento."},
      {"en": "Module quiz — becomes available once every slide in the module has been viewed.", "es": "Quiz del módulo — queda disponible una vez que hayas visto todas las diapositivas del módulo."}
    ]},
    {"type": "callout", "variant": "info", "text": {"en": "Your progress is saved automatically after every slide — there is nothing you need to click to save it.", "es": "Tu progreso se guarda automáticamente después de cada diapositiva — no necesitas hacer clic en nada para guardarlo."}}
  ]$j$::jsonb
);

-- Slide 3 — Navigating Using System Buttons and Keyboard
insert into module_slides (module_id, course_id, slide_number, layout, title, content)
values (
  (select id from course_modules where course_id = 'b8e6a6f7-5019-425f-8f27-d5477b78588a' and module_number = 1),
  'b8e6a6f7-5019-425f-8f27-d5477b78588a', 3, 'text_only',
  '{"en": "Navigating the Course", "es": "Navegación del Curso"}'::jsonb,
  $j$[
    {"type": "heading", "level": 1, "text": {"en": "Navigating Using System Buttons and Keyboard", "es": "Navegación con Botones del Sistema y Teclado"}},
    {"type": "paragraph", "text": {"en": "You can move through a module's slides in whichever way is most convenient for you.", "es": "Puedes avanzar por las diapositivas de un módulo de la manera que te resulte más cómoda."}},
    {"type": "list", "ordered": false, "items": [
      {"en": "Previous / Next buttons — at the bottom of the screen, move one slide back or forward.", "es": "Botones Anterior / Siguiente — en la parte inferior de la pantalla, retroceden o avanzan una diapositiva."},
      {"en": "Arrow keys — press ← or → on your keyboard to go to the previous or next slide.", "es": "Teclas de flecha — presiona ← o → en tu teclado para ir a la diapositiva anterior o siguiente."},
      {"en": "Esc key — shows or hides the Module Progress menu.", "es": "Tecla Esc — muestra u oculta el menú de Progreso del Módulo."},
      {"en": "Click any slide — select it directly from the Module Progress menu to jump straight to it.", "es": "Clic en cualquier diapositiva — selecciónala directamente desde el menú de Progreso del Módulo para ir a ella al instante."}
    ]},
    {"type": "callout", "variant": "tip", "text": {"en": "The first time through a module, we recommend going slide by slide in order — you can always jump around freely afterward.", "es": "La primera vez que recorras un módulo, te recomendamos hacerlo en orden, diapositiva por diapositiva — después puedes moverte libremente."}}
  ]$j$::jsonb
);

-- Slide 4 — Assessment and Certificate
insert into module_slides (module_id, course_id, slide_number, layout, title, content)
values (
  (select id from course_modules where course_id = 'b8e6a6f7-5019-425f-8f27-d5477b78588a' and module_number = 1),
  'b8e6a6f7-5019-425f-8f27-d5477b78588a', 4, 'text_only',
  '{"en": "Assessment and Certificate", "es": "Evaluación y Certificado"}'::jsonb,
  $j$[
    {"type": "heading", "level": 1, "text": {"en": "Assessment and Certificate", "es": "Evaluación y Certificado"}},
    {"type": "paragraph", "text": {"en": "Your understanding of each module is checked with a short quiz, and the course finishes with a final exam.", "es": "Tu comprensión de cada módulo se verifica con un breve quiz, y el curso finaliza con un examen final."}},
    {"type": "list", "ordered": false, "items": [
      {"en": "Module quizzes — unlock after you have viewed every slide in the module; a passing score of 70% is required.", "es": "Quizzes de módulo — se habilitan después de ver todas las diapositivas del módulo; se requiere una puntuación mínima del 70%."},
      {"en": "Final exam — covers the full course and requires a passing score of 70%, with up to 3 attempts.", "es": "Examen final — abarca todo el curso y requiere una puntuación mínima del 70%, con hasta 3 intentos."},
      {"en": "Certificate — once you pass the final exam, your personalized certificate is generated automatically and can be downloaded as a PDF at any time from My Certificates.", "es": "Certificado — al aprobar el examen final, tu certificado personalizado se genera automáticamente y puedes descargarlo en PDF en cualquier momento desde Mis Certificados."}
    ]},
    {"type": "callout", "variant": "warning", "text": {"en": "A module's quiz stays locked until you have viewed all of its slides, so make sure to go through the full module first.", "es": "El quiz de un módulo permanece bloqueado hasta que hayas visto todas sus diapositivas, así que asegúrate de recorrer el módulo completo primero."}}
  ]$j$::jsonb
);

-- Slide 5 — Course Purpose
insert into module_slides (module_id, course_id, slide_number, layout, title, content)
values (
  (select id from course_modules where course_id = 'b8e6a6f7-5019-425f-8f27-d5477b78588a' and module_number = 1),
  'b8e6a6f7-5019-425f-8f27-d5477b78588a', 5, 'text_only',
  '{"en": "Course Purpose", "es": "Propósito del Curso"}'::jsonb,
  $j$[
    {"type": "heading", "level": 1, "text": {"en": "Course Purpose", "es": "Propósito del Curso"}},
    {"type": "paragraph", "text": {"en": "International USAR response depends on accurate, timely, and shared information. When multiple international teams arrive in an affected country, a common system for collecting and coordinating that information is what keeps operations organized and effective.", "es": "La respuesta internacional de USAR depende de información precisa, oportuna y compartida. Cuando varios equipos internacionales llegan a un país afectado, contar con un sistema común para recopilar y coordinar esa información es lo que mantiene las operaciones organizadas y efectivas."}},
    {"type": "paragraph", "text": {"en": "This course exists to give everyone who touches ICMS3.0 — whether in the field, in an OSOCC, or in an RDC — a shared, practical understanding of the platform, so that information flows consistently across teams and coordination structures.", "es": "Este curso existe para brindar a todas las personas que utilizan ICMS3.0 — ya sea en el terreno, en un OSOCC o en un RDC — una comprensión compartida y práctica de la plataforma, de modo que la información fluya de manera consistente entre equipos y estructuras de coordinación."}},
    {"type": "callout", "variant": "info", "text": {"en": "A shared tool is only useful if everyone knows how to use it the same way — that consistency is the purpose of this training.", "es": "Una herramienta compartida solo es útil si todos saben usarla de la misma manera — esa consistencia es el propósito de esta capacitación."}}
  ]$j$::jsonb
);

-- Slide 6 — Course Objectives
insert into module_slides (module_id, course_id, slide_number, layout, title, content)
values (
  (select id from course_modules where course_id = 'b8e6a6f7-5019-425f-8f27-d5477b78588a' and module_number = 1),
  'b8e6a6f7-5019-425f-8f27-d5477b78588a', 6, 'text_only',
  '{"en": "Course Objectives", "es": "Objetivos del Curso"}'::jsonb,
  $j$[
    {"type": "heading", "level": 1, "text": {"en": "Course Objectives", "es": "Objetivos del Curso"}},
    {"type": "paragraph", "text": {"en": "By the end of this course, you will be able to:", "es": "Al finalizar este curso, serás capaz de:"}},
    {"type": "list", "ordered": true, "items": [
      {"en": "Explain the role of ICMS3.0 within INSARAG coordination and information management.", "es": "Explicar el papel de ICMS3.0 dentro de la coordinación y la gestión de la información de INSARAG."},
      {"en": "Use the ICMS3.0 suite of applications to collect and share information.", "es": "Utilizar la suite de aplicaciones de ICMS3.0 para recopilar y compartir información."},
      {"en": "Carry out field data collection using ICMS3.0 tools and workflows.", "es": "Realizar la recopilación de datos de campo utilizando las herramientas y flujos de trabajo de ICMS3.0."},
      {"en": "Apply the two-stage data collection process with ArcGIS QuickCapture® and FieldMaps®.", "es": "Aplicar el proceso de recopilación de datos en dos etapas con ArcGIS QuickCapture® y FieldMaps®."},
      {"en": "Describe how ICMS3.0 supports team-level coordination and reporting.", "es": "Describir cómo ICMS3.0 respalda la coordinación y los informes a nivel de equipo."}
    ]}
  ]$j$::jsonb
);

-- Slide 7 — Course Structure
insert into module_slides (module_id, course_id, slide_number, layout, title, content)
values (
  (select id from course_modules where course_id = 'b8e6a6f7-5019-425f-8f27-d5477b78588a' and module_number = 1),
  'b8e6a6f7-5019-425f-8f27-d5477b78588a', 7, 'text_only',
  '{"en": "Course Structure", "es": "Estructura del Curso"}'::jsonb,
  $j$[
    {"type": "heading", "level": 1, "text": {"en": "Course Structure", "es": "Estructura del Curso"}},
    {"type": "paragraph", "text": {"en": "This course is organized into 8 modules. Each one ends with a short quiz, and the course finishes with a final exam and certificate.", "es": "Este curso está organizado en 8 módulos. Cada uno termina con un breve quiz, y el curso finaliza con un examen final y un certificado."}},
    {"type": "list", "ordered": true, "items": [
      {"en": "Module 1 — Online Course Introduction: how to use this platform, and what to expect from the course.", "es": "Módulo 1 — Introducción al Curso en Línea: cómo usar esta plataforma y qué esperar del curso."},
      {"en": "Module 2 — INSARAG Coordination and Management System: what ICMS3.0 is and its role in USAR coordination.", "es": "Módulo 2 — Sistema de Coordinación y Gestión de INSARAG: qué es ICMS3.0 y su papel en la coordinación USAR."},
      {"en": "Module 3 — Information Management and Data Collection: core concepts behind managing information during a response.", "es": "Módulo 3 — Gestión de la Información y Recopilación de Datos: conceptos centrales sobre la gestión de información durante una respuesta."},
      {"en": "Module 4 — ICMS3.0 Suite of Applications: an overview of the tools that make up ICMS3.0.", "es": "Módulo 4 — Suite de Aplicaciones de ICMS3.0: una visión general de las herramientas que componen ICMS3.0."},
      {"en": "Module 5 — ICMS3.0 Field Collection: collecting information directly in the field.", "es": "Módulo 5 — Recopilación de Campo de ICMS3.0: recopilación de información directamente en el terreno."},
      {"en": "Module 6 — Two-Stage Data Collection using ArcGIS QuickCapture® and FieldMaps®: a closer look at this specific workflow.", "es": "Módulo 6 — Recopilación de Datos en Dos Etapas usando ArcGIS QuickCapture® y FieldMaps®: un vistazo más de cerca a este flujo de trabajo específico."},
      {"en": "Module 7 — ICMS3.0 Team Module: coordinating and reporting at the team level.", "es": "Módulo 7 — Módulo de Equipo de ICMS3.0: coordinación e informes a nivel de equipo."},
      {"en": "Module 8 — Course Summary: a recap of the full course before your final exam.", "es": "Módulo 8 — Resumen del Curso: un repaso de todo el curso antes de tu examen final."}
    ]},
    {"type": "callout", "variant": "tip", "text": {"en": "You will need to complete each module's quiz before moving on to the next one.", "es": "Deberás completar el quiz de cada módulo antes de avanzar al siguiente."}}
  ]$j$::jsonb
);

commit;

-- Conferência
select slide_number, title, layout, jsonb_array_length(content) as blocks
from module_slides
where module_id = (
  select id from course_modules
  where course_id = 'b8e6a6f7-5019-425f-8f27-d5477b78588a' and module_number = 1
)
order by slide_number;
