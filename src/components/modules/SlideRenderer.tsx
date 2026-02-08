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
    case 'video':
      return (
        <VideoMedia
          url={block.url}
          poster={block.poster}
          caption={loc(block.caption, lang)}
        />
      );
    case 'audio':
      return <AudioMedia url={block.url} caption={loc(block.caption, lang)} />;
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
