"use client";

import { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import Image from "next/image";

interface Slide {
  title: { en: string; es: string };
  subtitle: { en: string; es: string };
  cta: { en: string; es: string };
  ctaHref: string;
  bgImage: string;
  bgImageRight?: string;
}

const slides: Slide[] = [
  {
    title: {
      en: "INSARAG Online Training Platform",
      es: "Plataforma de Capacitación en Línea de INSARAG",
    },
    subtitle: {
      en: "The global learning environment for international USAR coordination",
      es: "El entorno de aprendizaje global para la coordinación internacional USAR",
    },
    cta: { en: "Access your training", es: "Acceder a tu capacitación" },
    ctaHref: "/auth?tab=signin",
    bgImage: "/usar-team-hero.png",
  },
  {
    title: {
      en: "ICMS 3.0 Online Training",
      es: "Capacitación en Línea ICMS 3.0",
    },
    subtitle: {
      en: "Master the updated coordination and management system — 10 modules, self-paced",
      es: "Domina el sistema de coordinación y gestión actualizado — 10 módulos, a tu ritmo",
    },
    cta: { en: "Start the course", es: "Iniciar el curso" },
    ctaHref: "/auth?tab=signup",
    bgImage: "/icms-tablet-hero.png",
    bgImageRight: "/icms-hero.png",
  },
];

export default function HeroCarousel({ language = "en" }: { language?: string }) {
  const [current, setCurrent] = useState(0);
  const [isAnimating, setIsAnimating] = useState(false);

  const goTo = useCallback((index: number) => {
    if (isAnimating) return;
    setIsAnimating(true);
    setCurrent(index);
    setTimeout(() => setIsAnimating(false), 600);
  }, [isAnimating]);

  const next = useCallback(() => {
    goTo((current + 1) % slides.length);
  }, [current, goTo]);

  const prev = useCallback(() => {
    goTo((current - 1 + slides.length) % slides.length);
  }, [current, goTo]);

  useEffect(() => {
    const interval = setInterval(next, 6000);
    return () => clearInterval(interval);
  }, [next]);

  const slide = slides[current];
  const getText = (field: { en: string; es: string }) =>
    language === "en" ? field.en : field.es;

  // Mask suave: imagem esquerda funde para o centro
  const maskLeft = "linear-gradient(to right, black 0%, black 25%, transparent 65%)";
  // Mask suave: imagem direita funde a partir do centro
  const maskRight = "linear-gradient(to right, transparent 35%, black 75%, black 100%)";

  return (
    <section className="relative overflow-hidden" style={{ height: "480px" }}>
      {/* ── SLIDES ── */}
      {slides.map((s, i) => (
        <div
          key={i}
          className="absolute inset-0"
          style={{
            opacity: i === current ? 1 : 0,
            zIndex: i === current ? 10 : 0,
            transition: "opacity 0.7s ease-in-out",
          }}
        >
          {s.bgImageRight ? (
            /*
             * DUAS FOTOS com crossfade suave via CSS mask-image
             * Cada imagem ocupa a largura toda mas é mascarada
             * de forma que se fundem naturalmente no centro.
             */
            <>
              {/* Foto esquerda — visível à esquerda, funde suavemente para o centro */}
              <div
                className="absolute inset-0"
                style={{
                  maskImage: maskLeft,
                  WebkitMaskImage: maskLeft,
                }}
              >
                <Image
                  src={s.bgImage}
                  alt="ICMS tablet"
                  fill
                  className="object-cover opacity-40"
                  quality={90}
                />
              </div>

              {/* Foto direita — funde do centro, visível à direita */}
              <div
                className="absolute inset-0"
                style={{
                  maskImage: maskRight,
                  WebkitMaskImage: maskRight,
                }}
              >
                <Image
                  src={s.bgImageRight}
                  alt="USAR team"
                  fill
                  className="object-cover opacity-40"
                  quality={90}
                />
              </div>

              {/* Overlay azul escuro por cima das duas fotos */}
              <div
                className="absolute inset-0"
                style={{
                  background:
                    "linear-gradient(to right, rgba(11,74,124,0.80), rgba(8,52,87,0.60), rgba(6,42,71,0.80))",
                }}
              />
            </>
          ) : (
            /*
             * FOTO ÚNICA — layout padrão do slide 1
             */
            <>
              <Image
                src={s.bgImage}
                alt="INSARAG USAR Team"
                fill
                className="object-cover opacity-40"
                priority={i === 0}
                quality={90}
              />
              <div
                className="absolute inset-0"
                style={{
                  background:
                    "linear-gradient(to right, rgba(11,74,124,0.80), rgba(8,52,87,0.60), rgba(6,42,71,0.80))",
                }}
              />
            </>
          )}
        </div>
      ))}

      {/* Grid pattern sobreposto */}
      <div
        className="absolute inset-0 bg-[url('/grid.svg')] opacity-5"
        style={{ zIndex: 11 }}
      />

      {/* ── CONTEÚDO do slide atual ── */}
      <div className="relative flex h-full items-center" style={{ zIndex: 20 }}>
        <div className="mx-auto w-full max-w-7xl px-6">
          <div className="w-full max-w-3xl">
            <h1 className="text-4xl font-bold leading-tight text-white drop-shadow-2xl sm:text-5xl lg:text-6xl">
              {getText(slide.title)}
            </h1>

            <p className="mt-4 max-w-2xl text-lg text-white/90 drop-shadow-lg sm:text-xl">
              {getText(slide.subtitle)}
            </p>

            <div className="mt-8">
              <Link
                href={slide.ctaHref}
                className="inline-flex items-center rounded-lg bg-orange-500 px-7 py-3.5 text-base font-semibold text-white shadow-2xl transition hover:bg-orange-600 hover:shadow-xl"
              >
                {getText(slide.cta)}
                <svg
                  className="ml-2 h-5 w-5"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M13 7l5 5m0 0l-5 5m5-5H6"
                  />
                </svg>
              </Link>
            </div>
          </div>
        </div>
      </div>

      {/* ── SETA ESQUERDA ── */}
      <button
        onClick={prev}
        aria-label="Slide anterior"
        className="absolute left-3 top-1/2 z-30 -translate-y-1/2 flex h-10 w-10 items-center justify-center rounded-full bg-black/30 text-white backdrop-blur-sm transition hover:bg-black/50 md:left-5"
      >
        <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M15 19l-7-7 7-7" />
        </svg>
      </button>

      {/* ── SETA DIREITA ── */}
      <button
        onClick={next}
        aria-label="Próximo slide"
        className="absolute right-3 top-1/2 z-30 -translate-y-1/2 flex h-10 w-10 items-center justify-center rounded-full bg-black/30 text-white backdrop-blur-sm transition hover:bg-black/50 md:right-5"
      >
        <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M9 5l7 7-7 7" />
        </svg>
      </button>

      {/* ── DOTS ── */}
      <div className="absolute bottom-6 left-1/2 z-30 flex -translate-x-1/2 gap-2.5">
        {slides.map((_, i) => (
          <button
            key={i}
            onClick={() => goTo(i)}
            aria-label={`Ir ao slide ${i + 1}`}
            className={`h-2.5 rounded-full transition-all duration-300 ${
              i === current ? "w-7 bg-white" : "w-2.5 bg-white/50 hover:bg-white/75"
            }`}
          />
        ))}
      </div>
    </section>
  );
}
