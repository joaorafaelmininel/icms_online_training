// src/lib/types/slides.ts

export type SlideLayout = 'media_center' | 'text_only' | 'title_hero';

export interface LocalizedField {
  en: string;
  es: string;
}

// ─── Content Block Types ────────────────────────────────────────────────────

export interface HeadingBlock {
  type: 'heading';
  level?: 1 | 2 | 3;
  text: LocalizedField;
}

export interface ParagraphBlock {
  type: 'paragraph';
  text: LocalizedField;
}

export interface ImageBlock {
  type: 'image';
  url: string;
  alt?: LocalizedField;
  caption?: LocalizedField;
}

export interface VideoBlock {
  type: 'video';
  url: string;
  poster?: string;
  caption?: LocalizedField;
}

export interface AudioBlock {
  type: 'audio';
  url: string;
  caption?: LocalizedField;
}

export interface ListBlock {
  type: 'list';
  ordered?: boolean;
  items: LocalizedField[];
}

export interface CalloutBlock {
  type: 'callout';
  variant: 'tip' | 'warning' | 'info';
  title?: LocalizedField;
  text: LocalizedField;
}

export type ContentBlock =
  | HeadingBlock
  | ParagraphBlock
  | ImageBlock
  | VideoBlock
  | AudioBlock
  | ListBlock
  | CalloutBlock;

// ─── Slide (from DB row) ────────────────────────────────────────────────────

export interface Slide {
  id: string;
  module_id: string;
  course_id: string;
  slide_number: number;
  layout: SlideLayout;
  title: LocalizedField;
  content: ContentBlock[];
  thumbnail_url: string | null;
  notes: any | null;
  created_at: string;
  updated_at: string;
}

// ─── Helper: get localized text from a block field ──────────────────────────

export function localize(
  field: LocalizedField | string | null | undefined,
  lang: 'en' | 'es'
): string {
  if (!field) return '';
  if (typeof field === 'string') return field;
  return field[lang] || field['en'] || '';
}
