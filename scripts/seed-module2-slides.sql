-- Popula o início do Módulo 2 (INSARAG Coordination and Management System) do
-- curso ICMS3.0 (b8e6a6f7-5019-425f-8f27-d5477b78588a) com os 3 primeiros
-- slides, em EN/ES.
--
-- Fonte: module_02_icms_coordination_management_system.json (fornecido pelo
-- usuário). Esse arquivo só traz os slides 1-3 do Bloco A ("What is ICMS
-- 3.0", slides 1-8 de um total planejado de 47) — os blocos B (Information
-- Management, 9-25), C (ICMS 3.0 Purpose and the Four Levels, 26-45) e D
-- (ICMS 3.0 Development, 46-47) ainda precisam ser enviados e carregados
-- separadamente.
--
-- Este script APAGA os slides 1-3 existentes do Módulo 2 antes de inserir os
-- novos (idempotente — pode rodar de novo com segurança). Progresso de
-- alunos não é afetado, apenas o conteúdo dos slides.
--
-- Execute no Supabase SQL Editor do projeto.

begin;

-- Remove os slides 1-3 atuais do Módulo 2 (caso existam)
delete from module_slides
where module_id = (
  select id from course_modules
  where course_id = 'b8e6a6f7-5019-425f-8f27-d5477b78588a' and module_number = 2
)
and slide_number in (1, 2, 3);

-- Slide 1 — Module Introduction
insert into module_slides (module_id, course_id, slide_number, layout, title, content)
values (
  (select id from course_modules where course_id = 'b8e6a6f7-5019-425f-8f27-d5477b78588a' and module_number = 2),
  'b8e6a6f7-5019-425f-8f27-d5477b78588a', 1, 'text_only',
  '{"en": "Module Introduction", "es": "Introducción al Módulo"}'::jsonb,
  $j$[
    {"type": "heading", "level": 1, "text": {"en": "Module Introduction", "es": "Introducción al Módulo"}},
    {"type": "paragraph", "text": {"en": "This module introduces the INSARAG Coordination and Management System (ICMS) — the information management backbone of the INSARAG network's operational and coordination architecture. As an INSARAG-mandated system, ICMS exists to ensure that USAR teams, Reception/Departure Centres (RDC), USAR Coordination Cells (UCC), Sector Coordination Cells (SCC), Local Emergency Management Authorities (LEMA), and national authorities operate from a shared, accurate, and timely picture of the disaster response environment.", "es": "Este módulo presenta el Sistema de Coordinación y Gestión de INSARAG (ICMS) — la columna vertebral de gestión de la información de la arquitectura operativa y de coordinación de la red INSARAG. Como sistema mandatado por INSARAG, el ICMS existe para garantizar que los equipos USAR, los Centros de Recepción/Salida (RDC), las Células de Coordinación USAR (UCC), las Células de Coordinación de Sector (SCC), las Autoridades Locales de Gestión de Emergencias (LEMA) y las autoridades nacionales operen a partir de una imagen compartida, precisa y oportuna del entorno de la respuesta ante el desastre."}},
    {"type": "paragraph", "text": {"en": "You will learn what ICMS is and how it functions as a coordination tool across the INSARAG network; why information management is not a peripheral administrative task but a core operational enabler of effective USAR response; and how ICMS 3.0 represents a strategic shift in the way information is captured, processed, and shared — from fragmented, manual, paper-based processes toward an integrated digital ecosystem that captures data once and makes it available, in near real time, to every level that needs it.", "es": "Aprenderás qué es el ICMS y cómo funciona como herramienta de coordinación en toda la red INSARAG; por qué la gestión de la información no es una tarea administrativa periférica, sino un habilitador operativo central para una respuesta USAR eficaz; y cómo el ICMS 3.0 representa un cambio estratégico en la forma en que la información se captura, se procesa y se comparte — pasando de procesos fragmentados, manuales y basados en papel hacia un ecosistema digital integrado que captura los datos una sola vez y los pone a disposición, casi en tiempo real, de todos los niveles que los necesitan."}},
    {"type": "paragraph", "text": {"en": "This module is structured around four progressive blocks: first, establishing what ICMS is and its foundational role; second, grounding that role in the broader principles and mandate of information management within international disaster response; third, examining the strategic purpose of ICMS 3.0 and how it operates across the field, command, coordination, and network levels; and finally, situating ICMS 3.0 within its ongoing development as a system.", "es": "Este módulo está organizado en cuatro bloques progresivos: primero, estableciendo qué es el ICMS y su rol fundacional; segundo, fundamentando ese rol en los principios y el mandato más amplios de la gestión de la información dentro de la respuesta internacional ante desastres; tercero, examinando el propósito estratégico del ICMS 3.0 y cómo opera en los niveles de campo, mando, coordinación y red; y finalmente, situando al ICMS 3.0 dentro de su desarrollo continuo como sistema."}},
    {"type": "paragraph", "text": {"en": "By the end of this module, you will be equipped to explain, to any stakeholder in the response structure — from a field team member to a UCC coordinator — what ICMS is, why it matters, and how it supports their specific function within the broader USAR coordination effort.", "es": "Al finalizar este módulo, estarás en condiciones de explicar, a cualquier actor dentro de la estructura de respuesta — desde un miembro de equipo de campo hasta un coordinador de la UCC — qué es el ICMS, por qué es importante y cómo respalda su función específica dentro del esfuerzo más amplio de coordinación USAR."}}
  ]$j$::jsonb
);

-- Slide 2 — Terminal Learning Objectives
insert into module_slides (module_id, course_id, slide_number, layout, title, content)
values (
  (select id from course_modules where course_id = 'b8e6a6f7-5019-425f-8f27-d5477b78588a' and module_number = 2),
  'b8e6a6f7-5019-425f-8f27-d5477b78588a', 2, 'text_only',
  '{"en": "Terminal Learning Objectives", "es": "Objetivos Terminales de Aprendizaje"}'::jsonb,
  $j$[
    {"type": "heading", "level": 1, "text": {"en": "Terminal Learning Objectives", "es": "Objetivos Terminales de Aprendizaje"}},
    {"type": "paragraph", "text": {"en": "Upon successful completion of this module, you will be able to:", "es": "Al completar exitosamente este módulo, serás capaz de:"}},
    {"type": "list", "ordered": true, "items": [
      {"en": "TLO-1 — Define the INSARAG Coordination and Management System (ICMS) and describe its function as a multi-tiered, web-based coordination tool accessed via the INSARAG Hub, supporting Team, RDC, and UCC operations.", "es": "TLO-1 — Definir el Sistema de Coordinación y Gestión de INSARAG (ICMS) y describir su función como herramienta de coordinación web de múltiples niveles, a la que se accede a través del INSARAG Hub, en apoyo a las operaciones de Equipo, RDC y UCC."},
      {"en": "TLO-2 — Explain the purpose, principles, and legal mandate of information management within international USAR response, and identify the tools that compose the INSARAG information management ecosystem.", "es": "TLO-2 — Explicar el propósito, los principios y el mandato legal de la gestión de la información dentro de la respuesta internacional USAR, e identificar las herramientas que componen el ecosistema de gestión de la información de INSARAG."},
      {"en": "TLO-3 — Describe the strategic shift delivered by ICMS 3.0 — from disconnected, administration-heavy systems to an integrated data ecosystem — and explain how this shift is realized across the four operational levels: field, command and team management, coordination, and network.", "es": "TLO-3 — Describir el cambio estratégico que aporta el ICMS 3.0 — de sistemas desconectados y con alta carga administrativa hacia un ecosistema de datos integrado — y explicar cómo se materializa ese cambio en los cuatro niveles operativos: campo, mando y gestión de equipo, coordinación y red."},
      {"en": "TLO-4 — Summarize the development trajectory of the ICMS 3.0 system within the context of the INSARAG network's evolving coordination requirements.", "es": "TLO-4 — Resumir la trayectoria de desarrollo del sistema ICMS 3.0 en el contexto de los requisitos de coordinación en evolución de la red INSARAG."}
    ]}
  ]$j$::jsonb
);

-- Slide 3 — Enabling Learning Objectives
insert into module_slides (module_id, course_id, slide_number, layout, title, content)
values (
  (select id from course_modules where course_id = 'b8e6a6f7-5019-425f-8f27-d5477b78588a' and module_number = 2),
  'b8e6a6f7-5019-425f-8f27-d5477b78588a', 3, 'text_only',
  '{"en": "Enabling Learning Objectives", "es": "Objetivos Habilitantes de Aprendizaje"}'::jsonb,
  $j$[
    {"type": "heading", "level": 1, "text": {"en": "Enabling Learning Objectives", "es": "Objetivos Habilitantes de Aprendizaje"}},
    {"type": "paragraph", "text": {"en": "To achieve the Terminal Learning Objectives above, you will be able to:", "es": "Para alcanzar los Objetivos Terminales de Aprendizaje anteriores, serás capaz de:"}},

    {"type": "heading", "level": 3, "text": {"en": "TLO-1 — What ICMS Is", "es": "TLO-1 — Qué es el ICMS"}},
    {"type": "list", "ordered": true, "items": [
      {"en": "ELO-1.1 — Identify the defining characteristics of ICMS as a multi-tiered, web-based information management tool.", "es": "ELO-1.1 — Identificar las características definitorias del ICMS como herramienta de gestión de la información web de múltiples niveles."},
      {"en": "ELO-1.2 — Describe the access mechanism by which USAR teams and coordination entities log in to ICMS through the INSARAG Hub.", "es": "ELO-1.2 — Describir el mecanismo de acceso mediante el cual los equipos USAR y las entidades de coordinación inician sesión en el ICMS a través del INSARAG Hub."},
      {"en": "ELO-1.3 — Explain how ICMS supports Team, RDC, and UCC functions through interconnected dashboards, standardized forms, and linked applications — spanning the continuum from field data collection to command-level awareness and coordination-cell reporting.", "es": "ELO-1.3 — Explicar cómo el ICMS respalda las funciones de Equipo, RDC y UCC a través de paneles interconectados, formularios estandarizados y aplicaciones vinculadas — abarcando el continuo desde la recopilación de datos de campo hasta la conciencia situacional a nivel de mando y los informes de la célula de coordinación."},
      {"en": "ELO-1.4 — Describe how ICMS dashboards provide a visual, consolidated summary of operations for relevant stakeholders, including LEMA and the On-Site Operations Coordination Centre (OSOCC).", "es": "ELO-1.4 — Describir cómo los paneles del ICMS proporcionan un resumen visual y consolidado de las operaciones para los actores relevantes, incluyendo la LEMA y el Centro de Coordinación de Operaciones en el Sitio (OSOCC)."}
    ]},

    {"type": "heading", "level": 3, "text": {"en": "TLO-2 — Information Management Principles and Mandate", "es": "TLO-2 — Principios y Mandato de la Gestión de la Información"}},
    {"type": "list", "ordered": true, "items": [
      {"en": "ELO-2.1 — Explain how effective information management enables better prioritisation, clearer situational awareness, and more effective allocation of scarce resources during a USAR response.", "es": "ELO-2.1 — Explicar cómo una gestión de la información eficaz permite una mejor priorización, una conciencia situacional más clara y una asignación más eficaz de los recursos escasos durante una respuesta USAR."},
      {"en": "ELO-2.2 — Distinguish information management as an operational enabler — not an administrative overhead — within the response structure.", "es": "ELO-2.2 — Distinguir la gestión de la información como un habilitador operativo — no como una carga administrativa — dentro de la estructura de respuesta."},
      {"en": "ELO-2.3 — Describe how information management connects national authorities, LEMA, UCC/SCC, RDC, team leadership, and field elements into a coherent coordination chain.", "es": "ELO-2.3 — Describir cómo la gestión de la información conecta a las autoridades nacionales, la LEMA, la UCC/SCC, el RDC, el liderazgo de equipo y los elementos de campo en una cadena de coordinación coherente."},
      {"en": "ELO-2.4 — State the legal basis for international USAR information-sharing and coordination, as mandated under UN General Assembly Resolution 57/150 (2002).", "es": "ELO-2.4 — Indicar la base legal para el intercambio de información y la coordinación internacional USAR, según lo establecido en la Resolución 57/150 de la Asamblea General de las Naciones Unidas (2002)."},
      {"en": "ELO-2.5 — Identify each component of the INSARAG information management ecosystem and its specific function: INSARAG.ORG, the INSARAG Online Training Platform, ICMS across the INSARAG network, the Global Disaster Alert and Coordination System (GDACS), and the Virtual On-Site Operations Coordination Centre (VOSOCC).", "es": "ELO-2.5 — Identificar cada componente del ecosistema de gestión de la información de INSARAG y su función específica: INSARAG.ORG, la Plataforma de Capacitación en Línea de INSARAG, el ICMS en toda la red INSARAG, el Sistema Global de Alerta y Coordinación en Casos de Desastre (GDACS) y el Centro Virtual de Coordinación de Operaciones en el Sitio (VOSOCC)."}
    ]},

    {"type": "heading", "level": 3, "text": {"en": "TLO-3 — The ICMS 3.0 Strategic Shift and the Four Levels", "es": "TLO-3 — El Cambio Estratégico del ICMS 3.0 y los Cuatro Niveles"}},
    {"type": "list", "ordered": true, "items": [
      {"en": "ELO-3.1 — Describe the transition from complex, administration-heavy field forms and disconnected systems toward a simple, integrated ecosystem.", "es": "ELO-3.1 — Describir la transición desde formularios de campo complejos y con alta carga administrativa, y sistemas desconectados, hacia un ecosistema simple e integrado."},
      {"en": "ELO-3.2 — Explain the \"capture once, use everywhere\" principle underpinning ICMS 3.0 data architecture.", "es": "ELO-3.2 — Explicar el principio de \"capturar una vez, usar en todas partes\" que sustenta la arquitectura de datos del ICMS 3.0."},
      {"en": "ELO-3.3 — Describe the shift from manual reporting processes to automated reporting outputs.", "es": "ELO-3.3 — Describir el cambio de procesos de generación de informes manuales hacia resultados de informes automatizados."},
      {"en": "ELO-3.4 — Explain how ICMS 3.0 scales across all incident types, rather than being optimised solely for large-scale events.", "es": "ELO-3.4 — Explicar cómo el ICMS 3.0 se adapta a todo tipo de incidentes, en lugar de estar optimizado únicamente para eventos de gran escala."},
      {"en": "ELO-3.5 — Identify the field-level capabilities of ICMS 3.0, including two-stage data capture (via tools such as QuickCapture and Field Maps), GPS anchoring, and offline functionality.", "es": "ELO-3.5 — Identificar las capacidades del ICMS 3.0 a nivel de campo, incluyendo la captura de datos en dos etapas (mediante herramientas como QuickCapture y Field Maps), el anclaje GPS y la funcionalidad sin conexión."},
      {"en": "ELO-3.6 — Identify the command and team management-level capabilities of ICMS 3.0, including the Command Point view for team leaders, squad management functions, situational awareness tools, and automated reporting outputs.", "es": "ELO-3.6 — Identificar las capacidades del ICMS 3.0 a nivel de mando y gestión de equipo, incluyendo la vista Command Point para los líderes de equipo, las funciones de gestión de escuadras, las herramientas de conciencia situacional y los resultados de informes automatizados."},
      {"en": "ELO-3.7 — Identify the coordination-level capabilities of ICMS 3.0, including the common operating picture for the RDC and UCC, sector management, tasking, and triage prioritisation.", "es": "ELO-3.7 — Identificar las capacidades del ICMS 3.0 a nivel de coordinación, incluyendo el panorama operativo común para el RDC y la UCC, la gestión de sectores, la asignación de tareas y la priorización del triaje."},
      {"en": "ELO-3.8 — Explain how the network level, through the INSARAG Hub, provides a single event entry point with role-based access — ensuring the right information reaches the right people at the right time.", "es": "ELO-3.8 — Explicar cómo el nivel de red, a través del INSARAG Hub, proporciona un único punto de entrada al evento con acceso basado en roles — garantizando que la información correcta llegue a las personas correctas en el momento correcto."}
    ]},

    {"type": "heading", "level": 3, "text": {"en": "TLO-4 — Development of ICMS 3.0", "es": "TLO-4 — Desarrollo del ICMS 3.0"}},
    {"type": "list", "ordered": true, "items": [
      {"en": "ELO-4.1 — Summarize the key milestones and design rationale in the development and evolution of the ICMS 3.0 system.", "es": "ELO-4.1 — Resumir los principales hitos y la lógica de diseño en el desarrollo y la evolución del sistema ICMS 3.0."}
    ]}
  ]$j$::jsonb
);

commit;

-- Conferência
select slide_number, title, layout, jsonb_array_length(content) as blocks
from module_slides
where module_id = (
  select id from course_modules
  where course_id = 'b8e6a6f7-5019-425f-8f27-d5477b78588a' and module_number = 2
)
order by slide_number;
