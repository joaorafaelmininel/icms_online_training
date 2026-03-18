// src/components/admin/SlideMediaAdmin.tsx
'use client'

import { useState, useRef, useCallback } from 'react'

// ─── Types ────────────────────────────────────────────────────────────────────

type Lang = 'en' | 'es'

interface LocalizedField { en: string; es: string }

type ContentBlock =
  | { type: 'heading';   level?: number; text: LocalizedField }
  | { type: 'paragraph'; text: LocalizedField }
  | { type: 'image';     url: string; alt?: LocalizedField; caption?: LocalizedField }
  | { type: 'video';     url: string; poster?: string; caption?: LocalizedField }
  | { type: 'audio';     url: string; caption?: LocalizedField }
  | { type: 'list';      ordered?: boolean; items: LocalizedField[] }
  | { type: 'callout';   variant: string; title?: LocalizedField; text: LocalizedField }

interface SlideData {
  id: string
  slide_number: number
  title: LocalizedField
  content: ContentBlock[]
  layout: string
  thumbnail_url: string | null
}

interface ModuleData {
  id: string
  module_number: number
  title: LocalizedField
  total_slides: number
  module_slides: SlideData[]
}

interface CourseData {
  id: string
  slug: string
  title: LocalizedField
  course_modules: ModuleData[]
}

interface Props {
  courses:   CourseData[]
  adminName: string
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

function loc(f: LocalizedField | string | null | undefined): string {
  if (!f) return ''
  if (typeof f === 'string') return f
  return f.en || ''
}

const MEDIA_TYPES = ['image', 'video', 'audio'] as const
type MediaType = typeof MEDIA_TYPES[number]

const MEDIA_CONFIG: Record<MediaType, {
  label:  string
  icon:   string
  accept: string
  hint:   string
  color:  string
}> = {
  image: {
    label:  'Image',
    icon:   '🖼️',
    accept: 'image/jpeg,image/png,image/gif,image/webp,image/svg+xml',
    hint:   'JPG, PNG, GIF, WebP, SVG — max 10 MB',
    color:  'emerald',
  },
  video: {
    label:  'Video',
    icon:   '🎬',
    accept: 'video/mp4,video/webm,video/ogg',
    hint:   'MP4, WebM, OGG — max 500 MB',
    color:  'violet',
  },
  audio: {
    label:  'Audio',
    icon:   '🎧',
    accept: 'audio/mpeg,audio/wav,audio/ogg,audio/aac,audio/m4a',
    hint:   'MP3, WAV, OGG, AAC, M4A — max 50 MB',
    color:  'blue',
  },
}

// ─── Main Component ───────────────────────────────────────────────────────────

export default function SlideMediaAdmin({ courses, adminName }: Props) {
  const [selectedCourse,  setSelectedCourse ] = useState<CourseData | null>(null)
  const [selectedModule,  setSelectedModule ] = useState<ModuleData | null>(null)
  const [selectedSlide,   setSelectedSlide  ] = useState<SlideData  | null>(null)
  const [activeMediaType, setActiveMediaType] = useState<MediaType>('image')

  // When user picks a course, reset downstream selections
  function pickCourse(course: CourseData) {
    setSelectedCourse(course)
    setSelectedModule(null)
    setSelectedSlide(null)
  }

  function pickModule(mod: ModuleData) {
    setSelectedModule(mod)
    setSelectedSlide(null)
  }

  function pickSlide(slide: SlideData) {
    setSelectedSlide(slide)
  }

  // Refresh a slide's content in state after mutation
  function onSlideContentUpdated(slideId: string, newContent: ContentBlock[]) {
    setSelectedSlide(prev => prev?.id === slideId ? { ...prev, content: newContent } : prev)
    // Also update within course tree
    setSelectedCourse(prev => {
      if (!prev) return prev
      return {
        ...prev,
        course_modules: prev.course_modules.map(m => ({
          ...m,
          module_slides: m.module_slides.map(s =>
            s.id === slideId ? { ...s, content: newContent } : s
          ),
        })),
      }
    })
  }

  return (
    <div className="flex h-screen flex-col overflow-hidden bg-gray-50">

      {/* Top bar */}
      <header className="flex items-center justify-between border-b border-gray-200 bg-white px-6 py-4 shadow-sm">
        <div className="flex items-center gap-3">
          <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-[#0B4A7C]">
            <svg className="h-5 w-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
            </svg>
          </div>
          <div>
            <h1 className="text-lg font-bold text-gray-900">Slide Media Manager</h1>
            <p className="text-xs text-gray-400">Logged in as {adminName}</p>
          </div>
        </div>
        <a href="/dashboard"
          className="rounded-lg border border-gray-200 bg-white px-4 py-2 text-sm font-medium text-gray-600 transition hover:bg-gray-50">
          ← My Dashboard
        </a>
      </header>

      {/* Three-column layout */}
      <div className="flex flex-1 overflow-hidden">

        {/* ── Col 1: Course + Module tree ──────────────────────────────────── */}
        <aside className="flex w-72 shrink-0 flex-col overflow-hidden border-r border-gray-200 bg-white">
          <div className="border-b border-gray-100 px-4 py-3">
            <p className="text-xs font-semibold uppercase tracking-wider text-gray-400">Courses & Modules</p>
          </div>
          <div className="flex-1 overflow-y-auto p-2">
            {courses.map(course => (
              <div key={course.id} className="mb-1">
                {/* Course */}
                <button
                  onClick={() => pickCourse(course)}
                  className={`w-full rounded-lg px-3 py-2.5 text-left text-sm font-semibold transition ${
                    selectedCourse?.id === course.id
                      ? 'bg-[#0B4A7C] text-white'
                      : 'text-gray-700 hover:bg-gray-100'
                  }`}
                >
                  <span className="mr-2">📚</span>
                  {loc(course.title)}
                </button>

                {/* Modules — shown when course selected */}
                {selectedCourse?.id === course.id && (
                  <div className="ml-4 mt-1 space-y-0.5 border-l-2 border-[#0B4A7C]/20 pl-3">
                    {course.course_modules.map(mod => (
                      <button
                        key={mod.id}
                        onClick={() => pickModule(mod)}
                        className={`w-full rounded-lg px-3 py-2 text-left text-xs font-medium transition ${
                          selectedModule?.id === mod.id
                            ? 'bg-[#0B4A7C]/10 text-[#0B4A7C]'
                            : 'text-gray-600 hover:bg-gray-50'
                        }`}
                      >
                        <span className="mr-1.5 font-bold text-gray-400">M{mod.module_number}</span>
                        {loc(mod.title)}
                        <span className="ml-1 text-gray-300">({mod.total_slides})</span>
                      </button>
                    ))}
                  </div>
                )}
              </div>
            ))}
          </div>
        </aside>

        {/* ── Col 2: Slide list ─────────────────────────────────────────────── */}
        <aside className="flex w-64 shrink-0 flex-col overflow-hidden border-r border-gray-200 bg-white">
          <div className="border-b border-gray-100 px-4 py-3">
            <p className="text-xs font-semibold uppercase tracking-wider text-gray-400">
              {selectedModule ? `Module ${selectedModule.module_number} — Slides` : 'Slides'}
            </p>
          </div>
          <div className="flex-1 overflow-y-auto p-2">
            {!selectedModule ? (
              <div className="flex flex-col items-center justify-center py-16 text-center text-gray-300">
                <svg className="mb-2 h-10 w-10" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1}
                    d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                </svg>
                <p className="text-xs">Select a module</p>
              </div>
            ) : (
              selectedModule.module_slides.map(slide => {
                const mediaBlocks = slide.content?.filter(
                  b => b.type === 'image' || b.type === 'video' || b.type === 'audio'
                ) || []
                return (
                  <button
                    key={slide.id}
                    onClick={() => pickSlide(slide)}
                    className={`mb-1 w-full rounded-lg px-3 py-2.5 text-left transition ${
                      selectedSlide?.id === slide.id
                        ? 'bg-[#0B4A7C]/10 ring-1 ring-[#0B4A7C]/30'
                        : 'hover:bg-gray-50'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold text-gray-400">#{slide.slide_number}</span>
                      {/* Media badges */}
                      <div className="flex gap-1">
                        {mediaBlocks.some(b => b.type === 'image') && (
                          <span className="text-[10px]">🖼️</span>
                        )}
                        {mediaBlocks.some(b => b.type === 'video') && (
                          <span className="text-[10px]">🎬</span>
                        )}
                        {mediaBlocks.some(b => b.type === 'audio') && (
                          <span className="text-[10px]">🎧</span>
                        )}
                      </div>
                    </div>
                    <p className="mt-0.5 text-xs font-medium text-gray-700 line-clamp-2">
                      {loc(slide.title)}
                    </p>
                  </button>
                )
              })
            )}
          </div>
        </aside>

        {/* ── Col 3: Media editor ───────────────────────────────────────────── */}
        <main className="flex flex-1 flex-col overflow-hidden">
          {!selectedSlide ? (
            <div className="flex flex-1 flex-col items-center justify-center text-gray-300">
              <svg className="mb-3 h-16 w-16" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1}
                  d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
              <p className="text-sm">Select a slide to manage its media</p>
            </div>
          ) : (
            <SlideEditor
              slide={selectedSlide}
              activeMediaType={activeMediaType}
              setActiveMediaType={setActiveMediaType}
              onContentUpdated={onSlideContentUpdated}
            />
          )}
        </main>
      </div>
    </div>
  )
}

// ─── Slide Editor ─────────────────────────────────────────────────────────────

function SlideEditor({
  slide,
  activeMediaType,
  setActiveMediaType,
  onContentUpdated,
}: {
  slide:               SlideData
  activeMediaType:     MediaType
  setActiveMediaType:  (t: MediaType) => void
  onContentUpdated:    (id: string, content: ContentBlock[]) => void
}) {
  const [content,    setContent   ] = useState<ContentBlock[]>(slide.content || [])
  const [uploading,  setUploading ] = useState(false)
  const [uploadMsg,  setUploadMsg ] = useState<{ type: 'success' | 'error'; text: string } | null>(null)
  const [captionEn,  setCaptionEn ] = useState('')
  const [captionEs,  setCaptionEs ] = useState('')
  const [dragOver,   setDragOver  ] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)

  // Keep content in sync when slide prop changes
  useState(() => { setContent(slide.content || []) })

  const cfg = MEDIA_CONFIG[activeMediaType]

  const mediaBlocks = content.filter(b =>
    b.type === 'image' || b.type === 'video' || b.type === 'audio'
  )

  async function handleUpload(file: File) {
    if (!file) return
    setUploading(true)
    setUploadMsg(null)

    try {
      const form = new FormData()
      form.append('file',    file)
      form.append('type',    activeMediaType)
      form.append('slideId', slide.id)

      const res  = await fetch('/api/admin/slides/upload', { method: 'POST', body: form })
      const data = await res.json()

      if (!res.ok) throw new Error(data.error || 'Upload failed')

      // Build the new content block
      const caption = (captionEn || captionEs)
        ? { en: captionEn, es: captionEs }
        : undefined

      const newBlock: ContentBlock =
        activeMediaType === 'image'
          ? { type: 'image', url: data.url, caption }
          : activeMediaType === 'video'
            ? { type: 'video', url: data.url, caption }
            : { type: 'audio', url: data.url, caption }

      // Save block to DB
      const patchRes = await fetch(`/api/admin/slides/${slide.id}/content`, {
        method:  'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body:    JSON.stringify({ action: 'add_block', block: newBlock }),
      })
      const patchData = await patchRes.json()
      if (!patchRes.ok) throw new Error(patchData.error || 'Failed to save content')

      setContent(patchData.content)
      onContentUpdated(slide.id, patchData.content)
      setCaptionEn('')
      setCaptionEs('')
      setUploadMsg({ type: 'success', text: `${cfg.label} added successfully!` })
    } catch (err: any) {
      setUploadMsg({ type: 'error', text: err.message })
    } finally {
      setUploading(false)
    }
  }

  async function removeBlock(index: number) {
    try {
      const res  = await fetch(`/api/admin/slides/${slide.id}/content`, {
        method:  'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body:    JSON.stringify({ action: 'remove_block', index }),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error)
      setContent(data.content)
      onContentUpdated(slide.id, data.content)
    } catch (err: any) {
      setUploadMsg({ type: 'error', text: err.message })
    }
  }

  function onFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (file) handleUpload(file)
    e.target.value = ''
  }

  function onDrop(e: React.DragEvent) {
    e.preventDefault()
    setDragOver(false)
    const file = e.dataTransfer.files?.[0]
    if (file) handleUpload(file)
  }

  return (
    <div className="flex flex-1 flex-col overflow-hidden">

      {/* Slide header */}
      <div className="border-b border-gray-200 bg-white px-6 py-4">
        <p className="text-xs font-semibold uppercase tracking-wider text-gray-400">
          Slide #{slide.slide_number}
        </p>
        <h2 className="mt-0.5 text-base font-bold text-gray-900">{loc(slide.title)}</h2>
      </div>

      <div className="flex flex-1 gap-0 overflow-hidden">

        {/* Upload panel */}
        <div className="flex w-96 shrink-0 flex-col gap-5 overflow-y-auto border-r border-gray-200 bg-white p-5">

          {/* Media type tabs */}
          <div className="flex gap-1 rounded-xl bg-gray-100 p-1">
            {MEDIA_TYPES.map(type => (
              <button
                key={type}
                onClick={() => { setActiveMediaType(type); setUploadMsg(null) }}
                className={`flex flex-1 items-center justify-center gap-1.5 rounded-lg py-2 text-xs font-semibold transition ${
                  activeMediaType === type
                    ? 'bg-white shadow text-gray-900'
                    : 'text-gray-500 hover:text-gray-700'
                }`}
              >
                <span>{MEDIA_CONFIG[type].icon}</span>
                {MEDIA_CONFIG[type].label}
              </button>
            ))}
          </div>

          {/* Caption fields */}
          <div className="space-y-2">
            <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider">
              Caption (optional)
            </label>
            <input
              value={captionEn}
              onChange={e => setCaptionEn(e.target.value)}
              placeholder="English caption"
              className="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm outline-none focus:border-[#0B4A7C] focus:ring-1 focus:ring-[#0B4A7C]"
            />
            <input
              value={captionEs}
              onChange={e => setCaptionEs(e.target.value)}
              placeholder="Descripción en español"
              className="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm outline-none focus:border-[#0B4A7C] focus:ring-1 focus:ring-[#0B4A7C]"
            />
          </div>

          {/* Drop zone */}
          <div
            onDragOver={e => { e.preventDefault(); setDragOver(true) }}
            onDragLeave={() => setDragOver(false)}
            onDrop={onDrop}
            onClick={() => fileInputRef.current?.click()}
            className={`flex cursor-pointer flex-col items-center justify-center gap-3 rounded-xl border-2 border-dashed py-10 transition ${
              dragOver
                ? 'border-[#0B4A7C] bg-[#0B4A7C]/5'
                : 'border-gray-200 hover:border-gray-300 hover:bg-gray-50'
            } ${uploading ? 'pointer-events-none opacity-50' : ''}`}
          >
            {uploading ? (
              <>
                <svg className="h-8 w-8 animate-spin text-[#0B4A7C]" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                </svg>
                <p className="text-sm font-medium text-gray-500">Uploading…</p>
              </>
            ) : (
              <>
                <span className="text-4xl">{cfg.icon}</span>
                <div className="text-center">
                  <p className="text-sm font-semibold text-gray-700">
                    Drop {cfg.label.toLowerCase()} here
                  </p>
                  <p className="mt-0.5 text-xs text-gray-400">or click to browse</p>
                </div>
                <p className="text-xs text-gray-400">{cfg.hint}</p>
              </>
            )}
            <input
              ref={fileInputRef}
              type="file"
              accept={cfg.accept}
              className="hidden"
              onChange={onFileChange}
            />
          </div>

          {/* Status message */}
          {uploadMsg && (
            <div className={`rounded-lg px-4 py-3 text-sm font-medium ${
              uploadMsg.type === 'success'
                ? 'bg-emerald-50 text-emerald-700'
                : 'bg-red-50 text-red-700'
            }`}>
              {uploadMsg.type === 'success' ? '✅ ' : '❌ '}{uploadMsg.text}
            </div>
          )}
        </div>

        {/* Media blocks list */}
        <div className="flex-1 overflow-y-auto bg-gray-50 p-5">
          <p className="mb-3 text-xs font-semibold uppercase tracking-wider text-gray-400">
            Media blocks on this slide ({mediaBlocks.length})
          </p>

          {mediaBlocks.length === 0 ? (
            <div className="flex flex-col items-center justify-center rounded-xl border-2 border-dashed border-gray-200 py-16 text-center">
              <p className="text-sm text-gray-300">No media blocks yet</p>
              <p className="mt-1 text-xs text-gray-300">Upload an image, video, or audio to get started</p>
            </div>
          ) : (
            <div className="space-y-3">
              {content.map((block, idx) => {
                if (block.type !== 'image' && block.type !== 'video' && block.type !== 'audio') return null
                const caption = 'caption' in block ? loc(block.caption) : ''

                return (
                  <div key={idx} className="overflow-hidden rounded-xl border border-gray-200 bg-white shadow-sm">
                    {/* Block header */}
                    <div className="flex items-center justify-between border-b border-gray-100 px-4 py-2.5">
                      <div className="flex items-center gap-2">
                        <span className="text-base">
                          {block.type === 'image' ? '🖼️' : block.type === 'video' ? '🎬' : '🎧'}
                        </span>
                        <span className="text-xs font-semibold capitalize text-gray-600">{block.type}</span>
                        {caption && (
                          <span className="text-xs text-gray-400">— {caption}</span>
                        )}
                      </div>
                      <button
                        onClick={() => removeBlock(idx)}
                        className="rounded-lg p-1 text-gray-300 transition hover:bg-red-50 hover:text-red-500"
                        title="Remove block"
                      >
                        <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                            d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                        </svg>
                      </button>
                    </div>

                    {/* Preview */}
                    <div className="p-3">
                      {block.type === 'image' && (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img
                          src={block.url}
                          alt={loc('caption' in block ? block.caption : undefined)}
                          className="max-h-48 w-full rounded-lg object-contain bg-gray-50"
                        />
                      )}
                      {block.type === 'video' && (
                        <video
                          src={block.url}
                          controls
                          preload="metadata"
                          className="w-full rounded-lg"
                          style={{ maxHeight: '200px' }}
                        />
                      )}
                      {block.type === 'audio' && (
                        <audio controls preload="metadata" className="w-full">
                          <source src={block.url} />
                        </audio>
                      )}
                      {/* URL */}
                      <p className="mt-2 truncate text-xs text-gray-300" title={block.url}>
                        {block.url}
                      </p>
                    </div>
                  </div>
                )
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
