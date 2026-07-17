// src/components/modules/SlideRenderer.tsx
'use client';

import { useState, useRef } from 'react';
import type { ContentBlock, SlideLayout } from '@/lib/types/slides';

type Lang = 'en' | 'es';

interface Props {
  content: ContentBlock[];
  layout: string;
  language: Lang;
}

// Localize helper
function loc(field: { en: string; es: string } | string | null | undefined, lang: Lang): string {
  if (!field) return '';
  if (typeof field === 'string') return field;
  return field[lang] || field['en'] || '';
}

export default function SlideRenderer({ content, layout, language }: Props) {
  if (!Array.isArray(content) || content.length === 0) {
    return (
      <div className="flex h-40 items-center justify-center text-sm text-gray-300">
        No content
      </div>
    );
  }

  const textBlocks  = content.filter(b => ['heading','paragraph','list','callout'].includes(b.type));
  const mediaBlocks = content.filter(b => ['image','video','audio'].includes(b.type));
  const hasMedia    = mediaBlocks.length > 0;
  const hasText     = textBlocks.length > 0;

  // Two-column layout: text left, media right
  if (hasText && hasMedia) {
    return (
      <div className="flex gap-8 lg:gap-12 items-start">
        {/* Left: text content */}
        <div className="flex-1 min-w-0 space-y-5">
          {textBlocks.map((block, i) => (
            <Block key={i} block={block} lang={language} />
          ))}
        </div>
        {/* Right: media */}
        <div className="w-[45%] shrink-0 space-y-4">
          {mediaBlocks.map((block, i) => (
            <Block key={i} block={block} lang={language} />
          ))}
        </div>
      </div>
    );
  }

  // Text only or media only — single column
  return (
    <div className="space-y-6">
      {content.map((block, i) => (
        <Block key={i} block={block} lang={language} />
      ))}
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════════════════════
// BLOCK DISPATCHER
// ═══════════════════════════════════════════════════════════════════════════════

function Block({ block, lang }: { block: ContentBlock; lang: Lang }) {
  switch (block.type) {
    case 'heading':
      return <Heading text={loc(block.text, lang)} level={block.level || 2} />;
    case 'paragraph':
      return <Paragraph text={loc(block.text, lang)} />;
    case 'image':
      return (
        <ImageMedia
          url={block.url}
          alt={loc(block.alt, lang)}
          caption={loc(block.caption, lang)}
        />
      );
    case 'video': {
      const videoUrl = (block as any).url_en && (block as any).url_es
        ? (lang === 'es' ? (block as any).url_es : (block as any).url_en)
        : (block as any).url_en || (block as any).url_es || (block as any).url || '';
      return (
        <VideoMedia
          url={videoUrl}
          poster={block.poster}
          caption={loc(block.caption, lang)}
        />
      );
    }
    case 'audio': {
      const audioUrl = (block as any).url_en && (block as any).url_es
        ? (lang === 'es' ? (block as any).url_es : (block as any).url_en)
        : (block as any).url_en || (block as any).url_es || (block as any).url || '';
      return <AudioMedia url={audioUrl} caption={loc(block.caption, lang)} />;
    }
    case 'hotspot':
      return (
        <HotspotMedia
          image={(block as any).image}
          spots={(block as any).spots || []}
          caption={loc((block as any).caption, lang)}
          lang={lang}
          phoneFrame={(block as any).phoneFrame === true}
        />
      );
    case 'list':
      return (
        <List
          items={(block.items || []).map((item) => loc(item, lang))}
          ordered={block.ordered ?? false}
        />
      );
    case 'callout':
      return (
        <Callout
          variant={block.variant || 'info'}
          title={loc(block.title, lang)}
          text={loc(block.text, lang)}
        />
      );
    default:
      return null;
  }
}

// ═══════════════════════════════════════════════════════════════════════════════
// HEADING
// ═══════════════════════════════════════════════════════════════════════════════

function Heading({ text, level }: { text: string; level: number }) {
  if (level === 1) {
    return (
      <h1 className="text-2xl font-extrabold tracking-tight text-gray-900 sm:text-3xl lg:text-4xl">
        {text}
      </h1>
    );
  }
  if (level === 2) {
    return (
      <h2 className="text-xl font-bold text-gray-900 sm:text-2xl">{text}</h2>
    );
  }
  return <h3 className="text-lg font-semibold text-gray-800 sm:text-xl">{text}</h3>;
}

// ═══════════════════════════════════════════════════════════════════════════════
// PARAGRAPH
// ═══════════════════════════════════════════════════════════════════════════════

function Paragraph({ text }: { text: string }) {
  return (
    <p className="text-base leading-relaxed text-gray-600 sm:text-[17px] sm:leading-relaxed">
      {text}
    </p>
  );
}

// ═══════════════════════════════════════════════════════════════════════════════
// IMAGE — central media layout
// ═══════════════════════════════════════════════════════════════════════════════

function ImageMedia({
  url,
  alt,
  caption,
}: {
  url: string;
  alt: string;
  caption: string;
}) {
  const [error, setError] = useState(false);

  return (
    <figure className="overflow-hidden rounded-xl border border-gray-100 bg-gray-50 shadow-sm">
      <div className="relative flex items-center justify-center bg-gray-100" style={{ minHeight: '200px' }}>
        {error ? (
          <div className="flex flex-col items-center justify-center py-16 text-gray-300">
            <svg className="h-16 w-16" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={1}
                d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
              />
            </svg>
            <span className="mt-2 text-xs">Image not available</span>
          </div>
        ) : (
          <img
            src={url}
            alt={alt || ''}
            className="max-h-[500px] w-full object-contain"
            onError={() => setError(true)}
            loading="lazy"
          />
        )}
      </div>
      {caption && (
        <figcaption className="border-t border-gray-100 bg-white px-5 py-3 text-center text-sm leading-snug text-gray-500">
          {caption}
        </figcaption>
      )}
    </figure>
  );
}

// ═══════════════════════════════════════════════════════════════════════════════
// VIDEO — central media layout with native controls
// ═══════════════════════════════════════════════════════════════════════════════

function VideoMedia({
  url,
  poster,
  caption,
}: {
  url: string;
  poster?: string;
  caption: string;
}) {
  const [error, setError] = useState(false);
  const videoRef = useRef<HTMLVideoElement>(null);

  return (
    <figure className="overflow-hidden rounded-xl border border-gray-100 bg-black shadow-sm">
      <div className="relative aspect-video w-full">
        {error ? (
          <div className="flex h-full flex-col items-center justify-center bg-gray-900 text-gray-500">
            <svg className="h-16 w-16" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={1}
                d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z"
              />
            </svg>
            <span className="mt-2 text-xs">Video not available</span>
          </div>
        ) : (
          <video
            ref={videoRef}
            controls
            preload="metadata"
            poster={poster || undefined}
            className="h-full w-full"
            onError={() => setError(true)}
          >
            <source src={url} type="video/mp4" />
            <source src={url} type="video/webm" />
          </video>
        )}
      </div>
      {caption && (
        <figcaption className="bg-gray-900 px-5 py-3 text-center text-sm leading-snug text-gray-400">
          {caption}
        </figcaption>
      )}
    </figure>
  );
}

// ═══════════════════════════════════════════════════════════════════════════════
// AUDIO — styled player with dark background
// ═══════════════════════════════════════════════════════════════════════════════

function AudioMedia({ url, caption }: { url: string; caption: string }) {
  const [error, setError] = useState(false);

  return (
    <div className="overflow-hidden rounded-xl border border-[#0B4A7C]/20 bg-gradient-to-r from-[#062a47] to-[#0B4A7C] p-5 shadow-sm">
      {/* Header */}
      <div className="mb-3 flex items-center gap-3">
        <div className="flex h-10 w-10 items-center justify-center rounded-full bg-white/10">
          <svg className="h-5 w-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M15.536 8.464a5 5 0 010 7.072m2.828-9.9a9 9 0 010 12.728M9 10a1 1 0 011-1h.01a1 1 0 010 2H10a1 1 0 01-1-1z"
            />
          </svg>
        </div>
        {caption && (
          <p className="text-sm font-medium text-blue-100">{caption}</p>
        )}
      </div>

      {/* Player */}
      {error ? (
        <div className="rounded-lg bg-white/5 px-4 py-3 text-xs text-white/40">
          Audio not available
        </div>
      ) : (
        <audio
          controls
          preload="metadata"
          className="w-full"
          onError={() => setError(true)}
          style={{
            filter: 'invert(1) hue-rotate(180deg)',
            opacity: 0.85,
          }}
        >
          <source src={url} type="audio/mpeg" />
          <source src={url} type="audio/wav" />
          <source src={url} type="audio/ogg" />
        </audio>
      )}
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════════════════════
// LIST — ordered (numbered circles) or unordered (dots)
// ═══════════════════════════════════════════════════════════════════════════════

function List({ items, ordered }: { items: string[]; ordered: boolean }) {
  return (
    <div className="space-y-2.5">
      {items.map((item, i) => (
        <div key={i} className="flex items-start gap-3">
          {ordered ? (
            <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-[#0B4A7C]/10 text-[11px] font-bold text-[#0B4A7C]">
              {i + 1}
            </span>
          ) : (
            <span className="mt-[9px] h-1.5 w-1.5 shrink-0 rounded-full bg-[#0B4A7C]/30" />
          )}
          <span className="text-base leading-relaxed text-gray-600 sm:text-[17px]">{item}</span>
        </div>
      ))}
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════════════════════
// CALLOUT — tip (green), warning (amber), info (blue)
// ═══════════════════════════════════════════════════════════════════════════════

const calloutStyles = {
  tip: {
    bg: 'bg-green-50',
    border: 'border-green-200',
    iconBg: 'bg-green-100',
    title: 'text-green-800',
    icon: '💡',
  },
  warning: {
    bg: 'bg-amber-50',
    border: 'border-amber-200',
    iconBg: 'bg-amber-100',
    title: 'text-amber-800',
    icon: '⚠️',
  },
  info: {
    bg: 'bg-blue-50',
    border: 'border-blue-200',
    iconBg: 'bg-blue-100',
    title: 'text-blue-800',
    icon: 'ℹ️',
  },
};

function Callout({
  variant,
  title,
  text,
}: {
  variant: string;
  title: string;
  text: string;
}) {
  const s = calloutStyles[variant as keyof typeof calloutStyles] || calloutStyles.info;

  return (
    <div className={`rounded-xl border ${s.border} ${s.bg} p-4 sm:p-5`}>
      <div className="flex items-start gap-3">
        <span
          className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-lg ${s.iconBg} text-base`}
        >
          {s.icon}
        </span>
        <div className="min-w-0 flex-1">
          {title && (
            <p className={`mb-1 text-sm font-bold ${s.title}`}>{title}</p>
          )}
          <p className="text-sm leading-relaxed text-gray-600 sm:text-[15px] sm:leading-relaxed">
            {text}
          </p>
        </div>
      </div>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════════════════════
// HOTSPOT — image (optionally in phone frame) with numbered markers + side panel
// ═══════════════════════════════════════════════════════════════════════════════

interface HotspotSpot {
  id: number;
  x: number;
  y: number;
  title: { en: string; es: string };
  text:  { en: string; es: string };
}

function HotspotMedia({
  image, spots, caption, lang, phoneFrame,
}: {
  image: string;
  spots: HotspotSpot[];
  caption: string;
  lang: Lang;
  phoneFrame?: boolean;
}) {
  const [active, setActive] = useState<number | null>(null);
  const activeSpot = spots.find(s => s.id === active);

  const ImageWithMarkers = () => (
    <div className="relative w-full h-full">
      <img src={image} alt="" className="w-full h-full object-cover block" />
      {spots.map(spot => (
        <button
          key={spot.id}
          onClick={() => setActive(active === spot.id ? null : spot.id)}
          style={{ left: `${spot.x}%`, top: `${spot.y}%` }}
          className={`absolute -translate-x-1/2 -translate-y-1/2 z-10 flex h-7 w-7 items-center justify-center rounded-full text-xs font-bold shadow-lg transition-all ${
            active === spot.id
              ? 'bg-[#0B4A7C] text-white scale-125 ring-2 ring-white ring-offset-1'
              : 'bg-[#0B4A7C]/90 text-white hover:scale-110 hover:bg-[#0B4A7C]'
          }`}
        >
          {/* Pulse ring on inactive */}
          {active !== spot.id && (
            <span className="absolute inline-flex h-full w-full rounded-full bg-[#0B4A7C]/40 animate-ping" />
          )}
          {spot.id}
        </button>
      ))}
    </div>
  );

  return (
    <div className="overflow-hidden rounded-xl border border-gray-100 shadow-sm">
      <div className="flex flex-col lg:flex-row items-stretch gap-0">

        {/* Left: image or phone mockup */}
        <div className={`flex items-center justify-center bg-gray-50 ${phoneFrame ? 'p-6' : ''} lg:flex-1`}>
          {phoneFrame ? (
            /* Phone frame SVG wrapper */
            <div className="relative mx-auto" style={{ width: 220 }}>
              {/* Phone outer shell */}
              <div className="relative rounded-[2.5rem] border-[8px] border-gray-800 bg-gray-800 shadow-2xl overflow-hidden"
                style={{ paddingTop: '216%' }}>
                {/* Status bar */}
                <div className="absolute top-0 left-0 right-0 h-6 bg-gray-900 z-20 flex items-center justify-center">
                  <div className="w-20 h-3 bg-gray-800 rounded-full" />
                </div>
                {/* Screen content */}
                <div className="absolute inset-0 top-6 bottom-4 overflow-hidden z-10">
                  <ImageWithMarkers />
                </div>
                {/* Home indicator */}
                <div className="absolute bottom-1.5 left-0 right-0 flex justify-center z-20">
                  <div className="w-16 h-1 bg-gray-600 rounded-full" />
                </div>
              </div>
              {/* Side buttons */}
              <div className="absolute -right-3 top-20 w-1.5 h-8 bg-gray-700 rounded-r-sm" />
              <div className="absolute -left-3 top-16 w-1.5 h-6 bg-gray-700 rounded-l-sm" />
              <div className="absolute -left-3 top-24 w-1.5 h-6 bg-gray-700 rounded-l-sm" />
            </div>
          ) : (
            /* Regular image */
            <div className="relative w-full bg-gray-900" style={{ minHeight: 260, maxHeight: 480 }}>
              <ImageWithMarkers />
            </div>
          )}
        </div>

        {/* Right: content panel */}
        <div className="lg:w-72 shrink-0 border-t border-gray-100 lg:border-t-0 lg:border-l bg-white flex flex-col">
          {activeSpot ? (
            <div className="p-5 flex-1">
              <div className="flex items-start gap-3 mb-3">
                <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-[#0B4A7C] text-xs font-bold text-white">
                  {activeSpot.id}
                </span>
                <h4 className="text-sm font-bold text-gray-900 leading-snug pt-0.5">
                  {loc(activeSpot.title, lang)}
                </h4>
              </div>
              <p className="text-sm leading-relaxed text-gray-600 pl-10">
                {loc(activeSpot.text, lang)}
              </p>
            </div>
          ) : (
            <div className="flex flex-1 flex-col items-center justify-center p-6 text-center">
              <div className="flex h-12 w-12 items-center justify-center rounded-full bg-blue-50 mb-3">
                <svg className="h-6 w-6 text-[#0B4A7C]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15 15l-2 5L9 9l11 4-5 2zm0 0l5 5" />
                </svg>
              </div>
              <p className="text-sm font-medium text-gray-400">
                {lang === 'es' ? 'Toca un marcador' : 'Tap a marker'}
              </p>
              <p className="text-xs text-gray-300 mt-1">
                {lang === 'es' ? 'para ver más información' : 'to see more information'}
              </p>
            </div>
          )}

          {/* Spot navigation dots */}
          {spots.length > 0 && (
            <div className="border-t border-gray-100 p-3 flex justify-center gap-2">
              {spots.map(s => (
                <button key={s.id} onClick={() => setActive(active === s.id ? null : s.id)}
                  className={`h-6 w-6 rounded-full text-[10px] font-bold transition-all ${
                    active === s.id
                      ? 'bg-[#0B4A7C] text-white scale-110'
                      : 'bg-gray-100 text-gray-500 hover:bg-gray-200'
                  }`}
                >{s.id}</button>
              ))}
            </div>
          )}
        </div>
      </div>

      {caption && (
        <div className="border-t border-gray-100 bg-gray-50 px-5 py-2.5 text-center text-xs text-gray-400">
          {caption}
        </div>
      )}
    </div>
  );
}
