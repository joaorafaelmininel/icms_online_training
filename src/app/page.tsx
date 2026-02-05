import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";
import Link from "next/link";
import { getCurrentLanguage, t } from "@/lib/i18n/language";
import { landing, common } from "@/lib/i18n/translations";
import HeroCarousel from "@/components/layout/HeroCarousel";

export default async function HomePage() {
  const language = await getCurrentLanguage();

  return (
    <div className="bg-white">
      <Header />

      {/* HERO CAROUSEL */}
      <HeroCarousel language={language} />

      {/* TEEX-STYLE CARDS SECTION (moved here: after HeroCarousel, before About) */}
      <section className="border-y border-gray-200 bg-gray-50">
        <div className="mx-auto max-w-7xl px-6 py-12">
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-5">
            {/* Card 1 */}
            <div className="relative overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-sm transition hover:shadow-lg">
              <div className="absolute inset-0 bg-gradient-to-b from-gray-50 to-white" />
              <div className="relative p-6 text-center">
                <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-[#0B4A7C] text-white shadow">
                  <svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253"
                    />
                  </svg>
                </div>
                <h4 className="mt-4 text-sm font-bold uppercase tracking-wide text-gray-900">
                  {language === "en"
                    ? "INSARAG Frameworks & Tools"
                    : "Marcos y Herramientas INSARAG"}
                </h4>
                <p className="mt-3 text-sm leading-relaxed text-gray-600">
                  {language === "en"
                    ? "INSARAG-aligned content to support a shared operational understanding across teams."
                    : "Contenido alineado con INSARAG para apoyar una comprensión operativa común entre equipos."}
                </p>
              </div>
            </div>

            {/* Card 2 */}
            <div className="relative overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-sm transition hover:shadow-lg">
              <div className="absolute inset-0 bg-gradient-to-b from-gray-50 to-white" />
              <div className="relative p-6 text-center">
                <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-[#0B4A7C] text-white shadow">
                  <svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M21 12a9 9 0 11-18 0 9 9 0 0118 0zM3.6 9h16.8M3.6 15h16.8"
                    />
                  </svg>
                </div>
                <h4 className="mt-4 text-sm font-bold uppercase tracking-wide text-gray-900">
                  {language === "en" ? "Global USAR Community" : "Comunidad USAR Global"}
                </h4>
                <p className="mt-3 text-sm leading-relaxed text-gray-600">
                  {language === "en"
                    ? "A learning space designed for INSARAG teams worldwide, respecting regional contexts."
                    : "Un espacio de aprendizaje para equipos INSARAG en todo el mundo, respetando contextos regionales."}
                </p>
              </div>
            </div>

            {/* Card 3 */}
            <div className="relative overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-sm transition hover:shadow-lg">
              <div className="absolute inset-0 bg-gradient-to-b from-gray-50 to-white" />
              <div className="relative p-6 text-center">
                <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-[#0B4A7C] text-white shadow">
                  <svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
                    />
                  </svg>
                </div>
                <h4 className="mt-4 text-sm font-bold uppercase tracking-wide text-gray-900">
                  {language === "en"
                    ? "Flexible Online Learning"
                    : "Aprendizaje Flexible en Línea"}
                </h4>
                <p className="mt-3 text-sm leading-relaxed text-gray-600">
                  {language === "en"
                    ? "Self-paced courses accessible anytime, adapted to operational routines and time zones."
                    : "Cursos a tu ritmo, accesibles en cualquier momento, adaptados a rutinas operativas y husos horarios."}
                </p>
              </div>
            </div>

            {/* Card 4 */}
            <div className="relative overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-sm transition hover:shadow-lg">
              <div className="absolute inset-0 bg-gradient-to-b from-gray-50 to-white" />
              <div className="relative p-6 text-center">
                <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-[#0B4A7C] text-white shadow">
                  <svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M14.7 6.3a1 1 0 010 1.4l-7 7a1 1 0 01-1.4-1.4l7-7a1 1 0 011.4 0zM8 16l-1 4 4-1 9-9a2 2 0 00-2.8-2.8l-9 9z"
                    />
                  </svg>
                </div>
                <h4 className="mt-4 text-sm font-bold uppercase tracking-wide text-gray-900">
                  {language === "en"
                    ? "Operational-Oriented Content"
                    : "Contenido Enfocado en Operaciones"}
                </h4>
                <p className="mt-3 text-sm leading-relaxed text-gray-600">
                  {language === "en"
                    ? "Practical learning that supports preparation for exercises, simulations, and operational environments."
                    : "Aprendizaje práctico para apoyar la preparación para ejercicios, simulaciones y entornos operativos."}
                </p>
              </div>
            </div>

            {/* Card 5 */}
            <div className="relative overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-sm transition hover:shadow-lg">
              <div className="absolute inset-0 bg-gradient-to-b from-gray-50 to-white" />
              <div className="relative p-6 text-center">
                <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-[#0B4A7C] text-white shadow">
                  <svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M7 8h10M7 12h6m-7 8l4-4h10a2 2 0 002-2V6a2 2 0 00-2-2H4a2 2 0 00-2 2v12a2 2 0 002 2h3z"
                    />
                  </svg>
                </div>
                <h4 className="mt-4 text-sm font-bold uppercase tracking-wide text-gray-900">
                  {language === "en"
                    ? "Continuous & Complementary Learning"
                    : "Aprendizaje Continuo y Complementario"}
                </h4>
                <p className="mt-3 text-sm leading-relaxed text-gray-600">
                  {language === "en"
                    ? "Designed to complement workshops and field activities, reinforcing learning without replacing them."
                    : "Diseñado para complementar talleres y actividades presenciales, reforzando el aprendizaje sin reemplazarlos."}
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ABOUT SECTION */}
      <section id="about" className="mx-auto max-w-7xl px-6 py-20">
        <div className="grid gap-12 lg:grid-cols-2 lg:gap-16">
          {/* Left column - Course Info Box */}
          <div className="lg:sticky lg:top-24 lg:self-start">
            <div className="overflow-hidden rounded-2xl bg-gradient-to-br from-gray-50 to-gray-100 shadow-xl">
              <div className="bg-gradient-to-r from-[#0B4A7C] to-[#083457] px-6 py-4">
                <h3 className="text-lg font-bold text-white">
                  {language === "en" ? "ICMS 3.0 Online Training | Course Information" : "Entrenamiento en Línea ICMS 3.0 | Información del Curso"}
                </h3>
              </div>

              <div className="p-6">
                <div className="space-y-4">
                  <div className="flex items-center justify-between border-b border-gray-200 pb-4">
                    <span className="text-sm font-medium text-gray-600">
                      {t(landing.duration, language)}
                    </span>
                    <span className="font-semibold text-gray-900">
                      {t(landing.durationValue, language)}
                    </span>
                  </div>

                  <div className="flex items-center justify-between border-b border-gray-200 pb-4">
                    <span className="text-sm font-medium text-gray-600">
                      {t(landing.format, language)}
                    </span>
                    <span className="font-semibold text-gray-900">
                      {t(landing.formatValue, language)}
                    </span>
                  </div>

                  <div className="flex items-center justify-between border-b border-gray-200 pb-4">
                    <span className="text-sm font-medium text-gray-600">
                      {t(landing.language, language)}
                    </span>
                    <span className="font-semibold text-gray-900">
                      {t(landing.languageValue, language)}
                    </span>
                  </div>

                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium text-gray-600">
                      {t(landing.certificate, language)}
                    </span>
                    <span className="font-semibold text-gray-900">
                      {t(landing.certificateValue, language)}
                    </span>
                  </div>
                </div>

                <div className="mt-6">
                  <Link
                    href="/auth?tab=signup&redirectTo=/dashboard"
                    className="block w-full rounded-lg bg-[#0B4A7C] px-6 py-3 text-center font-semibold text-white transition hover:bg-[#083457]"
>
                    {language === "en" ? "Enroll Now" : "Inscribirse Ahora"}
                  </Link>
                </div>
              </div>
            </div>
          </div>

          {/* Right column - Text */}
          <div>
            <h2 className="text-3xl font-bold text-gray-900 md:text-4xl">
              {language === "en"
                ? "About the Training Platform"
                : "Sobre la Plataforma de Capacitación"}
            </h2>

            <div className="mt-6 space-y-4 text-base leading-relaxed text-gray-700">
              <p>
                {language === "en"
                  ? "The INSARAG Online Training Platform is a global learning environment designed to support the INSARAG network in the dissemination of standardized knowledge, tools, and guidance relevant to international USAR coordination."
                  : "La Plataforma de Capacitación en Línea de INSARAG es un entorno de aprendizaje global diseñado para apoyar a la red INSARAG en la difusión de conocimientos estandarizados, herramientas y orientación relevantes para la coordinación internacional USAR."}
              </p>
              <p>
                {language === "en"
                  ? "The platform provides a structured and accessible space for self-paced online courses that respond to evolving operational needs of the network. It is intended to complement existing INSARAG training mechanisms by offering flexible learning opportunities that can be accessed anytime and anywhere."
                  : "La plataforma proporciona un espacio estructurado y accesible para cursos en línea de autoaprendizaje que responden a las necesidades operativas en evolución de la red. Está destinada a complementar los mecanismos de capacitación existentes de INSARAG al ofrecer oportunidades de aprendizaje flexibles que se pueden acceder en cualquier momento y lugar."}
              </p>
              <p>
                {language === "en"
                  ? "As an initial step, the platform hosts the ICMS 3.0 online training, supporting the introduction and operational understanding of the updated system. This course is part of the broader capacity-building efforts accompanying the implementation of ICMS 3.0 and aims to ensure a consistent baseline of knowledge across the INSARAG community."
                  : "Como paso inicial, la plataforma alberga la capacitación en línea de ICMS 3.0, apoyando la introducción y comprensión operativa del sistema actualizado. Este curso es parte de los esfuerzos más amplios de desarrollo de capacidades que acompañan la implementación de ICMS 3.0 y tiene como objetivo garantizar una línea base consistente de conocimiento en toda la comunidad INSARAG."}
              </p>
              <p>
                {language === "en"
                  ? "Over time, the platform may also support additional courses of common interest to the network, contributing to continuous learning and knowledge sharing while maintaining alignment with INSARAG structures and working groups."
                  : "Con el tiempo, la plataforma también puede apoyar cursos adicionales de interés común para la red, contribuyendo al aprendizaje continuo y al intercambio de conocimientos mientras mantiene la alineación con las estructuras y grupos de trabajo de INSARAG."}
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* ABOUT INSARAG SECTION */}
      <section className="bg-gray-50 py-20">
        <div className="mx-auto max-w-7xl px-6">

          {/* Título + intro */}
          <div className="mx-auto max-w-3xl text-center">
            <h2 className="text-3xl font-bold text-gray-900 md:text-4xl">
              {language === "en" ? "About INSARAG" : "Sobre INSARAG"}
            </h2>
            <p className="mt-4 text-base leading-relaxed text-gray-600">
              {language === "en"
                ? "The International Search and Rescue Advisory Group (INSARAG) was established in 1991, born from the cooperation of specialized USAR teams following the devastating earthquakes in Mexico (1985) and Armenia (1988). Created within the UN framework to avoid duplicating existing structures, INSARAG has since become the global reference for international search and rescue coordination."
                : "El Grupo Asesor Internacional de Búsqueda y Rescate (INSARAG) fue establecido en 1991, surgió de la cooperación de equipos especializados de USAR tras los devastadores terremoto en México (1985) y Armenia (1988). Creado dentro del marco de la ONU para evitar duplicar estructuras existentes, INSARAG se ha convertido desde entonces en la referencia global para la coordinación internacional de búsqueda y rescate."}
            </p>
          </div>

          {/* 3 cards de milestones */}
          <div className="mt-14 grid gap-6 md:grid-cols-3">

            {/* Card 1 — Fundação */}
            <div className="relative overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-sm">
              <div className="h-1 w-full bg-gradient-to-r from-[#0B4A7C] to-[#1a6fa3]" />
              <div className="p-6">
                <div className="flex items-center gap-3">
                  <div className="flex h-11 w-11 items-center justify-center rounded-full bg-[#0B4A7C]/10">
                    <svg className="h-5 w-5 text-[#0B4A7C]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                  </div>
                  <span className="text-sm font-bold text-[#0B4A7C]">1991</span>
                </div>
                <h3 className="mt-4 text-lg font-bold text-gray-900">
                  {language === "en" ? "Foundation" : "Fundación"}
                </h3>
                <p className="mt-2 text-sm leading-relaxed text-gray-600">
                  {language === "en"
                    ? "INSARAG was created within the UN's humanitarian coordination framework — specifically under OCHA in Geneva — to bring together international USAR teams and build a shared operational basis for future deployments."
                    : "INSARAG fue creado dentro del marco de coordinación humanitaria de la ONU — específicamente bajo OCHA en Ginebra — para reunir a los equipos internacionales de USAR y construir una base operativa común para futuras operaciones."}
                </p>
              </div>
            </div>

            {/* Card 2 — UN Resolution */}
            <div className="relative overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-sm">
              <div className="h-1 w-full bg-gradient-to-r from-[#1a6fa3] to-[#2ea3d4]" />
              <div className="p-6">
                <div className="flex items-center gap-3">
                  <div className="flex h-11 w-11 items-center justify-center rounded-full bg-[#1a6fa3]/10">
                    <svg className="h-5 w-5 text-[#1a6fa3]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                    </svg>
                  </div>
                  <span className="text-sm font-bold text-[#1a6fa3]">2002</span>
                </div>
                <h3 className="mt-4 text-lg font-bold text-gray-900">
                  {language === "en" ? "UN Resolution 57/150" : "Resolución ONU 57/150"}
                </h3>
                <p className="mt-2 text-sm leading-relaxed text-gray-600">
                  {language === "en"
                    ? "INSARAG played a key role in the creation of UN General Assembly Resolution 57/150 on \"Strengthening the Effectiveness and Coordination of International USAR Assistance\" — a milestone widely considered to underpin the group's progress over the past two decades."
                    : "INSARAG desempeñó un papel clave en la creación de la Resolución 57/150 de la Asamblea General de la ONU sobre \"Fortalecimiento de la eficacia y coordinación de la asistencia internacional de USAR\" — un hito que se considera ampliamente como la base del progreso del grupo en las últimas dos décadas."}
                </p>
              </div>
            </div>

            {/* Card 3 — Guidelines */}
            <div className="relative overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-sm">
              <div className="h-1 w-full bg-gradient-to-r from-[#2ea3d4] to-[#f97316]" />
              <div className="p-6">
                <div className="flex items-center gap-3">
                  <div className="flex h-11 w-11 items-center justify-center rounded-full bg-orange-100">
                    <svg className="h-5 w-5 text-orange-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                    </svg>
                  </div>
                  <span className="text-sm font-bold text-orange-500">Guidelines</span>
                </div>
                <h3 className="mt-4 text-lg font-bold text-gray-900">
                  {language === "en" ? "INSARAG Guidelines" : "Directrices INSARAG"}
                </h3>
                <p className="mt-2 text-sm leading-relaxed text-gray-600">
                  {language === "en"
                    ? "A living document that captures the practical agreements reached between international USAR teams. It outlines the principles and protocols that teams follow to work together effectively during actual disaster response operations."
                    : "Un documento vivo que recoge los acuerdos prácticos alcanzados entre los equipos internacionales de USAR. Describe los principios y protocolos que los equipos siguen para trabajar juntos de manera efectiva durante las operaciones de respuesta a desastres reales."}
                </p>
              </div>
            </div>
          </div>

          {/* Stats row */}
          <div className="mt-16 grid gap-8 sm:grid-cols-2 lg:grid-cols-3">
            <div className="text-center">
              <div className="inline-flex h-14 w-14 items-center justify-center rounded-full bg-[#0B4A7C]/10">
                <svg className="h-7 w-7 text-[#0B4A7C]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <div className="mt-3 text-4xl font-bold text-gray-900">30+</div>
              <div className="mt-1 text-sm text-gray-500">
                {language === "en" ? "Years of Excellence" : "Años de Excelencia"}
              </div>
            </div>

            <div className="text-center">
              <div className="inline-flex h-14 w-14 items-center justify-center rounded-full bg-green-100">
                <svg className="h-7 w-7 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                </svg>
              </div>
              <div className="mt-3 text-4xl font-bold text-gray-900">90+</div>
              <div className="mt-1 text-sm text-gray-500">
                {language === "en" ? "Member Teams" : "Equipos Miembro"}
              </div>
            </div>

            <div className="text-center">
              <div className="inline-flex h-14 w-14 items-center justify-center rounded-full bg-purple-100">
                <svg className="h-7 w-7 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3.055 11H5a2 2 0 012 2v1a2 2 0 002 2 2 2 0 012 2v2.945M8 3.935V5.5A2.5 2.5 0 0010.5 8h.5a2 2 0 012 2 2 2 0 104 0 2 2 0 012-2h1.064M15 20.488V18a2 2 0 012-2h3.064M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <div className="mt-3 text-4xl font-bold text-gray-900">75</div>
              <div className="mt-1 text-sm text-gray-500">
                {language === "en" ? "Countries" : "Países"}
              </div>
            </div>


          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
}
