// src/components/admin/SlideMediaAdmin.tsx
'use client'

import { useState, useRef, useCallback, useEffect } from 'react'

// ─── Types ────────────────────────────────────────────────────────────────────

type Lang = 'en' | 'es'
interface LocalizedField { en: string; es: string }

type ContentBlock =
  | { type: 'heading';   level?: number; text: LocalizedField }
  | { type: 'paragraph'; text: LocalizedField }
  | { type: 'image';     url: string; alt?: LocalizedField; caption?: LocalizedField }
  | { type: 'video';     url_en: string; url_es: string; poster?: string; caption?: LocalizedField }
  | { type: 'audio';     url_en: string; url_es: string; caption?: LocalizedField }
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

function loc(f: LocalizedField | string | null | undefined): string {
  if (!f) return ''
  if (typeof f === 'string') return f
  return f.en || ''
}

const MEDIA_TYPES = ['image', 'video', 'audio'] as const
type MediaType = typeof MEDIA_TYPES[number]

const MEDIA_CONFIG: Record<MediaType, { label: string; accept: string; hint: string }> = {
  image: { label: 'Image', accept: 'image/jpeg,image/png,image/gif,image/webp,image/svg+xml', hint: 'JPG, PNG, GIF, WebP — max 10 MB' },
  video: { label: 'Video', accept: 'video/mp4,video/webm,video/ogg', hint: 'MP4, WebM, OGG — max 500 MB' },
  audio: { label: 'Audio', accept: 'audio/mpeg,audio/wav,audio/ogg,audio/aac,audio/m4a', hint: 'MP3, WAV, OGG, AAC — max 50 MB' },
}

type EditorTab = 'content' | 'media'

// ─── SVG Icons ────────────────────────────────────────────────────────────────

const Icons = {
  course: (
    <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
    </svg>
  ),
  module: (
    <svg className="h-3.5 w-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
    </svg>
  ),
  slide: (
    <svg className="h-3.5 w-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
    </svg>
  ),
  text: (
    <svg className="h-3 w-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 10h16M4 14h10" />
    </svg>
  ),
  image: (
    <svg className="h-3 w-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
    </svg>
  ),
  video: (
    <svg className="h-3 w-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 10l4.553-2.276A1 1 0 0121 8.723v6.554a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
    </svg>
  ),
  audio: (
    <svg className="h-3 w-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19V6l12-3v13M9 19c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2zm12-3c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2zM9 10l12-3" />
    </svg>
  ),
  content: (
    <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
    </svg>
  ),
  media: (
    <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
    </svg>
  ),
  upload: (
    <svg className="h-8 w-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
    </svg>
  ),
  trash: (
    <svg className="h-3.5 w-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
    </svg>
  ),
  chevronUp: (
    <svg className="h-3.5 w-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 15l7-7 7 7" />
    </svg>
  ),
  chevronDown: (
    <svg className="h-3.5 w-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
    </svg>
  ),
  plus: (
    <svg className="h-3.5 w-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
    </svg>
  ),
  check: (
    <svg className="h-3.5 w-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
    </svg>
  ),
  info: (
    <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
    </svg>
  ),
  warning: (
    <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
    </svg>
  ),
  tip: (
    <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
    </svg>
  ),
  flag_en: (
    <span className="inline-flex items-center gap-1 text-xs font-semibold tracking-wide text-slate-500">
      <span className="h-3 w-4 rounded-sm bg-blue-700 inline-block" />EN
    </span>
  ),
  flag_es: (
    <span className="inline-flex items-center gap-1 text-xs font-semibold tracking-wide text-slate-500">
      <span className="h-3 w-4 rounded-sm bg-red-600 inline-block" />ES
    </span>
  ),
}

// ─── Main Component ───────────────────────────────────────────────────────────

export default function SlideMediaAdmin({ courses, adminName }: Props) {
  const [selectedCourse,  setSelectedCourse ] = useState<CourseData | null>(null)
  const [selectedModule,  setSelectedModule ] = useState<ModuleData | null>(null)
  const [selectedSlide,   setSelectedSlide  ] = useState<SlideData  | null>(null)
  const [activeMediaType, setActiveMediaType] = useState<MediaType>('image')
  const [activeTab,       setActiveTab      ] = useState<EditorTab>('content')

  function pickCourse(course: CourseData) {
    setSelectedCourse(course); setSelectedModule(null); setSelectedSlide(null)
  }
  function pickModule(mod: ModuleData) {
    setSelectedModule(mod); setSelectedSlide(null)
  }
  function onSlideContentUpdated(slideId: string, newContent: ContentBlock[]) {
    setSelectedSlide(prev => prev?.id === slideId ? { ...prev, content: newContent } : prev)
    setSelectedCourse(prev => !prev ? prev : {
      ...prev,
      course_modules: prev.course_modules.map(m => ({
        ...m,
        module_slides: m.module_slides.map(s => s.id === slideId ? { ...s, content: newContent } : s),
      })),
    })
  }

  return (
    <div className="flex h-screen flex-col overflow-hidden" style={{ background: '#F0F4F8' }}>

      {/* ── Header ── */}
      <header className="flex items-center justify-between border-b border-slate-200 bg-white px-6 py-0 shadow-sm" style={{ height: 56 }}>
        <div className="flex items-center gap-3">
          <div className="flex h-8 w-8 items-center justify-center rounded-md" style={{ background: '#0B4A7C' }}>
            <svg className="h-4 w-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
            </svg>
          </div>
          <div>
            <h1 className="text-sm font-semibold text-slate-800">Content Manager</h1>
            <p className="text-xs text-slate-400">INSARAG Training Platform</p>
          </div>
        </div>
        <div className="flex items-center gap-4">
          <span className="text-xs text-slate-400">{adminName}</span>
          <a href="/dashboard"
            className="flex items-center gap-1.5 rounded-md border border-slate-200 bg-white px-3 py-1.5 text-xs font-medium text-slate-600 transition hover:bg-slate-50">
            <svg className="h-3.5 w-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
            </svg>
            Dashboard
          </a>
        </div>
      </header>

      <div className="flex flex-1 overflow-hidden">

        {/* ── Col 1: Course + Module tree ── */}
        <aside className="flex w-64 shrink-0 flex-col overflow-hidden border-r border-slate-200 bg-white">
          <div className="border-b border-slate-100 px-4 py-2.5">
            <p className="text-xs font-semibold uppercase tracking-widest text-slate-400">Library</p>
          </div>
          <div className="flex-1 overflow-y-auto py-2">
            {courses.map(course => (
              <div key={course.id}>
                <button
                  onClick={() => pickCourse(course)}
                  className={`flex w-full items-center gap-2.5 px-4 py-2.5 text-left transition ${
                    selectedCourse?.id === course.id
                      ? 'bg-[#0B4A7C] text-white'
                      : 'text-slate-700 hover:bg-slate-50'
                  }`}
                >
                  <span className={selectedCourse?.id === course.id ? 'text-blue-200' : 'text-slate-400'}>
                    {Icons.course}
                  </span>
                  <span className="text-xs font-semibold leading-snug">{loc(course.title)}</span>
                </button>

                {selectedCourse?.id === course.id && (
                  <div className="border-b border-slate-100 pb-1">
                    {course.course_modules.map(mod => (
                      <button key={mod.id} onClick={() => pickModule(mod)}
                        className={`flex w-full items-center gap-2 py-2 pl-9 pr-4 text-left transition ${
                          selectedModule?.id === mod.id
                            ? 'bg-blue-50 text-[#0B4A7C]'
                            : 'text-slate-500 hover:bg-slate-50 hover:text-slate-700'
                        }`}
                      >
                        <span className={selectedModule?.id === mod.id ? 'text-[#0B4A7C]' : 'text-slate-300'}>
                          {Icons.module}
                        </span>
                        <span className="flex-1 text-xs leading-snug">{loc(mod.title)}</span>
                        <span className={`text-[10px] font-medium ${selectedModule?.id === mod.id ? 'text-[#0B4A7C]/60' : 'text-slate-300'}`}>
                          {mod.total_slides}
                        </span>
                      </button>
                    ))}
                  </div>
                )}
              </div>
            ))}
          </div>
        </aside>

        {/* ── Col 2: Slide list ── */}
        <aside className="flex w-56 shrink-0 flex-col overflow-hidden border-r border-slate-200 bg-white">
          <div className="border-b border-slate-100 px-4 py-2.5">
            <p className="text-xs font-semibold uppercase tracking-widest text-slate-400">
              {selectedModule ? `M${selectedModule.module_number} — Slides` : 'Slides'}
            </p>
          </div>
          <div className="flex-1 overflow-y-auto py-1">
            {!selectedModule ? (
              <div className="flex flex-col items-center justify-center py-16 text-center">
                <span className="text-slate-200">{Icons.slide}</span>
                <p className="mt-2 text-xs text-slate-300">Select a module</p>
              </div>
            ) : (
              selectedModule.module_slides.map(slide => {
                const hasText  = slide.content?.some(b => ['heading','paragraph','list','callout'].includes(b.type))
                const hasImage = slide.content?.some(b => b.type === 'image')
                const hasVideo = slide.content?.some(b => b.type === 'video')
                const hasAudio = slide.content?.some(b => b.type === 'audio')
                const isActive = selectedSlide?.id === slide.id
                return (
                  <button key={slide.id} onClick={() => setSelectedSlide(slide)}
                    className={`group w-full px-4 py-2.5 text-left transition ${
                      isActive ? 'bg-blue-50 border-r-2 border-[#0B4A7C]' : 'hover:bg-slate-50'
                    }`}
                  >
                    <div className="flex items-center justify-between mb-0.5">
                      <span className={`text-[10px] font-bold tabular-nums ${isActive ? 'text-[#0B4A7C]' : 'text-slate-300'}`}>
                        {String(slide.slide_number).padStart(2, '0')}
                      </span>
                      <div className="flex items-center gap-1">
                        {hasText  && <span className={isActive ? 'text-[#0B4A7C]/50' : 'text-slate-300'}>{Icons.text}</span>}
                        {hasImage && <span className={isActive ? 'text-[#0B4A7C]/50' : 'text-slate-300'}>{Icons.image}</span>}
                        {hasVideo && <span className={isActive ? 'text-[#0B4A7C]/50' : 'text-slate-300'}>{Icons.video}</span>}
                        {hasAudio && <span className={isActive ? 'text-[#0B4A7C]/50' : 'text-slate-300'}>{Icons.audio}</span>}
                      </div>
                    </div>
                    <p className={`text-xs leading-snug line-clamp-2 ${isActive ? 'font-medium text-[#0B4A7C]' : 'text-slate-600'}`}>
                      {loc(slide.title)}
                    </p>
                  </button>
                )
              })
            )}
          </div>
        </aside>

        {/* ── Col 3: Editor ── */}
        <main className="flex flex-1 flex-col overflow-hidden">
          {!selectedSlide ? (
            <div className="flex flex-1 flex-col items-center justify-center">
              <div className="flex h-16 w-16 items-center justify-center rounded-2xl border-2 border-dashed border-slate-200">
                <span className="text-slate-300">{Icons.content}</span>
              </div>
              <p className="mt-3 text-sm font-medium text-slate-400">Select a slide to edit</p>
              <p className="mt-1 text-xs text-slate-300">Choose a course, module, then slide</p>
            </div>
          ) : (
            <SlideEditor
              slide={selectedSlide}
              activeMediaType={activeMediaType}
              setActiveMediaType={setActiveMediaType}
              activeTab={activeTab}
              setActiveTab={setActiveTab}
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
  slide, activeMediaType, setActiveMediaType, activeTab, setActiveTab, onContentUpdated,
}: {
  slide: SlideData; activeMediaType: MediaType; setActiveMediaType: (t: MediaType) => void
  activeTab: EditorTab; setActiveTab: (t: EditorTab) => void
  onContentUpdated: (id: string, content: ContentBlock[]) => void
}) {
  const [content,       setContent      ] = useState<ContentBlock[]>(slide.content || [])
  const [uploadMsg,     setUploadMsg    ] = useState<{ type: 'success' | 'error'; text: string } | null>(null)
  const [captionEn,     setCaptionEn    ] = useState('')
  const [captionEs,     setCaptionEs    ] = useState('')
  // Per-lang upload state for video/audio
  const [uploadingEn,   setUploadingEn  ] = useState(false)
  const [uploadingEs,   setUploadingEs  ] = useState(false)
  const [uploadingImg,  setUploadingImg ] = useState(false)
  const [dragOverEn,    setDragOverEn   ] = useState(false)
  const [dragOverEs,    setDragOverEs   ] = useState(false)
  const [dragOverImg,   setDragOverImg  ] = useState(false)
  const fileEnRef  = useRef<HTMLInputElement>(null)
  const fileEsRef  = useRef<HTMLInputElement>(null)
  const fileImgRef = useRef<HTMLInputElement>(null)

  useEffect(() => { setContent(slide.content || []) }, [slide.id])

  const mediaBlocks = content.filter(b => b.type === 'image' || b.type === 'video' || b.type === 'audio')

  async function saveContent(blocks: ContentBlock[]) {
    const res  = await fetch(`/api/admin/slides/${slide.id}/content`, {
      method: 'PATCH', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ action: 'replace_content', content: blocks }),
    })
    const data = await res.json()
    if (!res.ok) throw new Error(data.error)
    setContent(data.content); onContentUpdated(slide.id, data.content)
    return data.content
  }

  async function removeBlock(index: number) {
    try { await saveContent(content.filter((_, i) => i !== index)) }
    catch (err: any) { setUploadMsg({ type: 'error', text: err.message }) }
  }

  async function moveBlock(index: number, dir: 'up' | 'down') {
    const next = [...content]; const swap = dir === 'up' ? index - 1 : index + 1
    if (swap < 0 || swap >= next.length) return
    ;[next[index], next[swap]] = [next[swap], next[index]]
    await saveContent(next)
  }

  // Upload a single file and return its public URL
  async function uploadFile(file: File, type: MediaType): Promise<string> {
    const form = new FormData()
    form.append('file', file); form.append('type', type); form.append('slideId', slide.id)
    const res  = await fetch('/api/admin/slides/upload', { method: 'POST', body: form })
    const data = await res.json()
    if (!res.ok) throw new Error(data.error || 'Upload failed')
    return data.url
  }

  // Image upload — single URL
  async function handleImageUpload(file: File) {
    setUploadingImg(true); setUploadMsg(null)
    try {
      const url = await uploadFile(file, 'image')
      const caption = (captionEn || captionEs) ? { en: captionEn, es: captionEs } : undefined
      // Check if image block already exists — update it, else add new
      const existing = content.findIndex(b => b.type === 'image')
      let next: ContentBlock[]
      if (existing >= 0) {
        next = content.map((b, i) => i === existing ? { type: 'image', url, caption } : b)
      } else {
        next = [...content, { type: 'image', url, caption }]
      }
      await saveContent(next)
      setCaptionEn(''); setCaptionEs('')
      setUploadMsg({ type: 'success', text: 'Image uploaded' })
    } catch (err: any) {
      setUploadMsg({ type: 'error', text: err.message })
    } finally { setUploadingImg(false) }
  }

  // Video/Audio bilingual upload — updates url_en or url_es on the block
  async function handleBilingualUpload(file: File, type: 'video' | 'audio', lang: 'en' | 'es') {
    const setUploading = lang === 'en' ? setUploadingEn : setUploadingEs
    setUploading(true); setUploadMsg(null)
    try {
      const url = await uploadFile(file, type)
      const caption = (captionEn || captionEs) ? { en: captionEn, es: captionEs } : undefined
      // Find existing block of this type, or create empty one
      const existing = content.findIndex(b => b.type === type)
      let next: ContentBlock[]
      if (existing >= 0) {
        const block = content[existing] as any
        next = content.map((b, i) => i === existing
          ? { ...block, [`url_${lang}`]: url, caption }
          : b
        )
      } else {
        const newBlock: ContentBlock = type === 'video'
          ? { type: 'video', url_en: lang === 'en' ? url : '', url_es: lang === 'es' ? url : '', caption }
          : { type: 'audio', url_en: lang === 'en' ? url : '', url_es: lang === 'es' ? url : '', caption }
        next = [...content, newBlock]
      }
      await saveContent(next)
      setUploadMsg({ type: 'success', text: `${type === 'video' ? 'Video' : 'Audio'} (${lang.toUpperCase()}) uploaded` })
    } catch (err: any) {
      setUploadMsg({ type: 'error', text: err.message })
    } finally { setUploading(false) }
  }

  return (
    <div className="flex flex-1 flex-col overflow-hidden">

      {/* Slide header */}
      <div className="border-b border-slate-200 bg-white px-6 py-3">
        <div className="flex items-baseline gap-2">
          <span className="text-xs font-bold tabular-nums text-slate-300">
            {String(slide.slide_number).padStart(2, '0')}
          </span>
          <h2 className="text-sm font-semibold text-slate-800">{loc(slide.title)}</h2>
        </div>
      </div>

      {/* Tabs */}
      <div className="border-b border-slate-200 bg-white px-6">
        <div className="flex">
          {(['content', 'media'] as EditorTab[]).map(tab => (
            <button key={tab} onClick={() => setActiveTab(tab)}
              className={`flex items-center gap-2 border-b-2 px-4 py-3 text-xs font-semibold transition ${
                activeTab === tab
                  ? 'border-[#0B4A7C] text-[#0B4A7C]'
                  : 'border-transparent text-slate-400 hover:text-slate-600'
              }`}
            >
              <span>{tab === 'content' ? Icons.content : Icons.media}</span>
              {tab === 'content' ? 'Content' : 'Media'}
            </button>
          ))}
        </div>
      </div>

      <div className="flex flex-1 overflow-hidden">

        {/* Content tab */}
        {activeTab === 'content' && (
          <ContentEditor
            content={content} slideId={slide.id}
            onSave={saveContent} onRemove={removeBlock} onMove={moveBlock}
          />
        )}

        {/* Media tab */}
        {activeTab === 'media' && (
          <div className="flex flex-1 overflow-hidden">

            {/* Left: Upload panel */}
            <div className="flex w-80 shrink-0 flex-col overflow-y-auto border-r border-slate-200 bg-white">

              {/* Media type selector */}
              <div className="border-b border-slate-100 p-4">
                <div className="flex gap-1 rounded-lg border border-slate-200 p-1">
                  {MEDIA_TYPES.map(type => (
                    <button key={type} onClick={() => { setActiveMediaType(type); setUploadMsg(null) }}
                      className={`flex flex-1 items-center justify-center gap-1.5 rounded-md py-2 text-xs font-semibold transition ${
                        activeMediaType === type ? 'bg-[#0B4A7C] text-white shadow-sm' : 'text-slate-500 hover:text-slate-700'
                      }`}
                    >
                      <span>{type === 'image' ? Icons.image : type === 'video' ? Icons.video : Icons.audio}</span>
                      {MEDIA_CONFIG[type].label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Caption */}
              <div className="border-b border-slate-100 p-4 space-y-2">
                <label className="block text-xs font-semibold uppercase tracking-widest text-slate-400">Caption (optional)</label>
                <div className="flex items-center gap-2">
                  <span className="w-5 text-right text-[10px] font-bold text-slate-300">EN</span>
                  <input value={captionEn} onChange={e => setCaptionEn(e.target.value)} placeholder="English caption"
                    className="flex-1 rounded-md border border-slate-200 px-3 py-1.5 text-xs outline-none focus:border-[#0B4A7C] focus:ring-1 focus:ring-[#0B4A7C]/20" />
                </div>
                <div className="flex items-center gap-2">
                  <span className="w-5 text-right text-[10px] font-bold text-slate-300">ES</span>
                  <input value={captionEs} onChange={e => setCaptionEs(e.target.value)} placeholder="Descripción en español"
                    className="flex-1 rounded-md border border-slate-200 px-3 py-1.5 text-xs outline-none focus:border-[#0B4A7C] focus:ring-1 focus:ring-[#0B4A7C]/20" />
                </div>
              </div>

              {/* Upload zones */}
              <div className="flex-1 overflow-y-auto p-4 space-y-4">

                {/* IMAGE — single upload */}
                {activeMediaType === 'image' && (
                  <DropZone
                    label="Image"
                    hint={MEDIA_CONFIG.image.hint}
                    accept={MEDIA_CONFIG.image.accept}
                    uploading={uploadingImg}
                    dragOver={dragOverImg}
                    onDragOver={() => setDragOverImg(true)}
                    onDragLeave={() => setDragOverImg(false)}
                    onDrop={f => handleImageUpload(f)}
                    inputRef={fileImgRef}
                  />
                )}

                {/* VIDEO — bilingual */}
                {activeMediaType === 'video' && (
                  <div className="space-y-3">
                    <div className="rounded-lg border border-slate-200 overflow-hidden">
                      <div className="flex items-center gap-2 border-b border-slate-100 bg-slate-50 px-3 py-2">
                        <div className="h-2 w-2 rounded-full bg-blue-500" />
                        <span className="text-xs font-bold text-slate-600">English Version</span>
                      </div>
                      <div className="p-3">
                        <DropZone
                          label="Drop English video"
                          hint="MP4, WebM — max 500 MB"
                          accept={MEDIA_CONFIG.video.accept}
                          uploading={uploadingEn}
                          dragOver={dragOverEn}
                          onDragOver={() => setDragOverEn(true)}
                          onDragLeave={() => setDragOverEn(false)}
                          onDrop={f => handleBilingualUpload(f, 'video', 'en')}
                          inputRef={fileEnRef}
                          compact
                        />
                      </div>
                    </div>
                    <div className="rounded-lg border border-slate-200 overflow-hidden">
                      <div className="flex items-center gap-2 border-b border-slate-100 bg-slate-50 px-3 py-2">
                        <div className="h-2 w-2 rounded-full bg-red-500" />
                        <span className="text-xs font-bold text-slate-600">Spanish Version</span>
                      </div>
                      <div className="p-3">
                        <DropZone
                          label="Drop Spanish video"
                          hint="MP4, WebM — max 500 MB"
                          accept={MEDIA_CONFIG.video.accept}
                          uploading={uploadingEs}
                          dragOver={dragOverEs}
                          onDragOver={() => setDragOverEs(true)}
                          onDragLeave={() => setDragOverEs(false)}
                          onDrop={f => handleBilingualUpload(f, 'video', 'es')}
                          inputRef={fileEsRef}
                          compact
                        />
                      </div>
                    </div>
                  </div>
                )}

                {/* AUDIO — bilingual */}
                {activeMediaType === 'audio' && (
                  <div className="space-y-3">
                    <div className="rounded-lg border border-slate-200 overflow-hidden">
                      <div className="flex items-center gap-2 border-b border-slate-100 bg-slate-50 px-3 py-2">
                        <div className="h-2 w-2 rounded-full bg-blue-500" />
                        <span className="text-xs font-bold text-slate-600">English Narration</span>
                      </div>
                      <div className="p-3">
                        <DropZone
                          label="Drop English audio"
                          hint="MP3, WAV, AAC — max 50 MB"
                          accept={MEDIA_CONFIG.audio.accept}
                          uploading={uploadingEn}
                          dragOver={dragOverEn}
                          onDragOver={() => setDragOverEn(true)}
                          onDragLeave={() => setDragOverEn(false)}
                          onDrop={f => handleBilingualUpload(f, 'audio', 'en')}
                          inputRef={fileEnRef}
                          compact
                        />
                      </div>
                    </div>
                    <div className="rounded-lg border border-slate-200 overflow-hidden">
                      <div className="flex items-center gap-2 border-b border-slate-100 bg-slate-50 px-3 py-2">
                        <div className="h-2 w-2 rounded-full bg-red-500" />
                        <span className="text-xs font-bold text-slate-600">Spanish Narration</span>
                      </div>
                      <div className="p-3">
                        <DropZone
                          label="Drop Spanish audio"
                          hint="MP3, WAV, AAC — max 50 MB"
                          accept={MEDIA_CONFIG.audio.accept}
                          uploading={uploadingEs}
                          dragOver={dragOverEs}
                          onDragOver={() => setDragOverEs(true)}
                          onDragLeave={() => setDragOverEs(false)}
                          onDrop={f => handleBilingualUpload(f, 'audio', 'es')}
                          inputRef={fileEsRef}
                          compact
                        />
                      </div>
                    </div>
                  </div>
                )}

                {/* Status message */}
                {uploadMsg && (
                  <div className={`flex items-center gap-2 rounded-lg px-3 py-2.5 text-xs font-medium ${
                    uploadMsg.type === 'success'
                      ? 'bg-emerald-50 text-emerald-700 ring-1 ring-emerald-200'
                      : 'bg-red-50 text-red-700 ring-1 ring-red-200'
                  }`}>
                    {uploadMsg.type === 'success' ? Icons.check : Icons.warning}
                    {uploadMsg.text}
                  </div>
                )}
              </div>
            </div>

            {/* Right: Media blocks list */}
            <div className="flex-1 overflow-y-auto p-5" style={{ background: '#F0F4F8' }}>
              <p className="mb-3 text-xs font-semibold uppercase tracking-widest text-slate-400">
                Media — {mediaBlocks.length} {mediaBlocks.length === 1 ? 'block' : 'blocks'}
              </p>
              {mediaBlocks.length === 0 ? (
                <div className="flex flex-col items-center justify-center rounded-xl border-2 border-dashed border-slate-200 bg-white py-16">
                  <span className="text-slate-200">{Icons.upload}</span>
                  <p className="mt-2 text-xs text-slate-300">No media uploaded yet</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {content.map((block, idx) => {
                    if (block.type !== 'image' && block.type !== 'video' && block.type !== 'audio') return null
                    const caption = 'caption' in block ? loc(block.caption) : ''
                    const bk = block as any
                    return (
                      <div key={idx} className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm">
                        <div className="flex items-center justify-between border-b border-slate-100 px-4 py-2.5">
                          <div className="flex items-center gap-2">
                            <span className="text-slate-400">
                              {block.type === 'image' ? Icons.image : block.type === 'video' ? Icons.video : Icons.audio}
                            </span>
                            <span className="text-xs font-semibold capitalize text-slate-600">{block.type}</span>
                            {caption && <span className="text-xs text-slate-300">— {caption}</span>}
                          </div>
                          <button onClick={() => removeBlock(idx)} className="rounded-md p-1 text-slate-300 transition hover:bg-red-50 hover:text-red-500">
                            {Icons.trash}
                          </button>
                        </div>
                        <div className="p-3 space-y-2">
                          {block.type === 'image' && (
                            // eslint-disable-next-line @next/next/no-img-element
                            <img src={bk.url} alt="" className="max-h-40 w-full rounded-lg object-contain bg-slate-50" />
                          )}
                          {(block.type === 'video' || block.type === 'audio') && (
                            <>
                              {bk.url_en && (
                                <div className="rounded-lg border border-blue-100 bg-blue-50 p-2">
                                  <p className="mb-1 text-[10px] font-bold text-blue-500">EN</p>
                                  {block.type === 'video'
                                    ? <video src={bk.url_en} controls preload="metadata" className="w-full rounded" style={{ maxHeight: 120 }} />
                                    : <audio controls preload="metadata" className="w-full"><source src={bk.url_en} /></audio>
                                  }
                                </div>
                              )}
                              {bk.url_es && (
                                <div className="rounded-lg border border-red-100 bg-red-50 p-2">
                                  <p className="mb-1 text-[10px] font-bold text-red-500">ES</p>
                                  {block.type === 'video'
                                    ? <video src={bk.url_es} controls preload="metadata" className="w-full rounded" style={{ maxHeight: 120 }} />
                                    : <audio controls preload="metadata" className="w-full"><source src={bk.url_es} /></audio>
                                  }
                                </div>
                              )}
                              {!bk.url_en && !bk.url_es && (
                                <p className="text-xs text-slate-300">No files uploaded yet</p>
                              )}
                            </>
                          )}
                        </div>
                      </div>
                    )
                  })}
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

// ─── DropZone Component ────────────────────────────────────────────────────────

function DropZone({
  label, hint, accept, uploading, dragOver,
  onDragOver, onDragLeave, onDrop, inputRef, compact,
}: {
  label: string; hint: string; accept: string
  uploading: boolean; dragOver: boolean
  onDragOver: () => void; onDragLeave: () => void
  onDrop: (f: File) => void
  inputRef: React.RefObject<HTMLInputElement | null>
  compact?: boolean
}) {
  return (
    <div
      onDragOver={e => { e.preventDefault(); onDragOver() }}
      onDragLeave={onDragLeave}
      onDrop={e => { e.preventDefault(); const f = e.dataTransfer.files?.[0]; if (f) onDrop(f) }}
      onClick={() => inputRef.current?.click()}
      className={`flex cursor-pointer flex-col items-center justify-center gap-2 rounded-xl border-2 border-dashed transition ${
        compact ? 'py-6' : 'py-10'
      } ${
        dragOver ? 'border-[#0B4A7C] bg-[#0B4A7C]/5' : 'border-slate-200 hover:border-slate-300 hover:bg-slate-50'
      } ${uploading ? 'pointer-events-none opacity-50' : ''}`}
    >
      {uploading ? (
        <>
          <svg className="h-5 w-5 animate-spin text-[#0B4A7C]" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
          </svg>
          <p className="text-xs text-slate-400">Uploading...</p>
        </>
      ) : (
        <>
          {!compact && <span className="text-slate-300">{Icons.upload}</span>}
          <p className="text-xs font-semibold text-slate-600">{label}</p>
          <p className="text-[10px] text-slate-400">{hint}</p>
        </>
      )}
      <input ref={inputRef} type="file" accept={accept} className="hidden"
        onChange={e => { const f = e.target.files?.[0]; if (f) onDrop(f); e.target.value = '' }} />
    </div>
  )
}

// ─── Content Editor ───────────────────────────────────────────────────────────

function ContentEditor({
  content, slideId, onSave, onRemove, onMove,
}: {
  content: ContentBlock[]; slideId: string
  onSave: (b: ContentBlock[]) => Promise<ContentBlock[]>
  onRemove: (i: number) => Promise<void>
  onMove: (i: number, dir: 'up' | 'down') => Promise<void>
}) {
  const [saving,       setSaving      ] = useState(false)
  const [msg,          setMsg         ] = useState<{ type: 'success' | 'error'; text: string } | null>(null)
  const [adding,       setAdding      ] = useState(false)
  const [newType,      setNewType     ] = useState<'heading' | 'paragraph' | 'list' | 'callout'>('paragraph')
  const [localContent, setLocalContent] = useState<ContentBlock[]>(content)

  useEffect(() => { setLocalContent(content) }, [content])

  function updateBlock(index: number, updated: ContentBlock) {
    setLocalContent(prev => prev.map((b, i) => i === index ? updated : b))
  }

  async function handleSaveAll() {
    setSaving(true); setMsg(null)
    try {
      await onSave(localContent)
      setMsg({ type: 'success', text: 'All changes saved' })
      setTimeout(() => setMsg(null), 2500)
    } catch (err: any) {
      setMsg({ type: 'error', text: err.message })
    } finally { setSaving(false) }
  }

  async function handleAddBlock() {
    let newBlock: ContentBlock
    if (newType === 'heading')   newBlock = { type: 'heading',   level: 2, text: { en: '', es: '' } }
    else if (newType === 'list') newBlock = { type: 'list',      ordered: false, items: [{ en: '', es: '' }] }
    else if (newType === 'callout') newBlock = { type: 'callout', variant: 'info', title: { en: '', es: '' }, text: { en: '', es: '' } }
    else                         newBlock = { type: 'paragraph', text: { en: '', es: '' } }
    setLocalContent(prev => [...prev, newBlock])
    setAdding(false)
  }

  const BLOCK_TYPES = [
    { value: 'heading',   label: 'Heading',   desc: 'Section title' },
    { value: 'paragraph', label: 'Paragraph', desc: 'Body text' },
    { value: 'list',      label: 'List',      desc: 'Bullet or numbered' },
    { value: 'callout',   label: 'Callout',   desc: 'Info / tip / warning' },
  ] as const

  return (
    <div className="flex flex-1 flex-col overflow-hidden">

      {/* Toolbar */}
      <div className="flex items-center justify-between border-b border-slate-200 bg-white px-5 py-2.5">
        <p className="text-xs text-slate-400">
          {localContent.filter(b => ['heading','paragraph','list','callout'].includes(b.type)).length} text block(s)
        </p>
        <div className="flex items-center gap-2">
          {msg && (
            <span className={`flex items-center gap-1.5 text-xs font-medium ${msg.type === 'success' ? 'text-emerald-600' : 'text-red-600'}`}>
              {msg.type === 'success' ? Icons.check : Icons.warning}
              {msg.text}
            </span>
          )}
          <button onClick={() => setAdding(true)}
            className="flex items-center gap-1.5 rounded-md border border-slate-200 bg-white px-3 py-1.5 text-xs font-semibold text-slate-600 transition hover:bg-slate-50">
            {Icons.plus} Add Block
          </button>
          <button onClick={handleSaveAll} disabled={saving}
            className="flex items-center gap-1.5 rounded-md px-4 py-1.5 text-xs font-bold text-white transition disabled:opacity-50"
            style={{ background: '#0B4A7C' }}>
            {saving ? (
              <svg className="h-3.5 w-3.5 animate-spin" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
              </svg>
            ) : Icons.check}
            {saving ? 'Saving...' : 'Save All'}
          </button>
        </div>
      </div>

      {/* Add block panel */}
      {adding && (
        <div className="border-b border-blue-100 bg-blue-50 px-5 py-3">
          <p className="mb-2 text-xs font-semibold text-[#0B4A7C]">Select block type</p>
          <div className="flex flex-wrap gap-2">
            {BLOCK_TYPES.map(bt => (
              <button key={bt.value} onClick={() => setNewType(bt.value)}
                className={`rounded-lg border px-3 py-2 text-left transition ${
                  newType === bt.value
                    ? 'border-[#0B4A7C] bg-[#0B4A7C] text-white'
                    : 'border-slate-200 bg-white text-slate-600 hover:border-slate-300'
                }`}
              >
                <p className="text-xs font-semibold">{bt.label}</p>
                <p className={`text-[10px] ${newType === bt.value ? 'text-blue-200' : 'text-slate-400'}`}>{bt.desc}</p>
              </button>
            ))}
            <div className="flex items-center gap-2 pl-2">
              <button onClick={handleAddBlock}
                className="rounded-lg px-4 py-2 text-xs font-bold text-white transition hover:opacity-90"
                style={{ background: '#0B4A7C' }}>
                Add
              </button>
              <button onClick={() => setAdding(false)}
                className="rounded-lg border border-slate-200 bg-white px-3 py-2 text-xs font-semibold text-slate-500 transition hover:bg-slate-50">
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Block list */}
      <div className="flex-1 overflow-y-auto p-5 space-y-3" style={{ background: '#F0F4F8' }}>
        {localContent.length === 0 && (
          <div className="flex flex-col items-center justify-center rounded-xl border-2 border-dashed border-slate-200 bg-white py-16">
            <p className="text-sm font-medium text-slate-300">No content blocks</p>
            <p className="mt-1 text-xs text-slate-200">Click "Add Block" to get started</p>
          </div>
        )}
        {localContent.map((block, idx) => (
          <BlockEditor
            key={idx} block={block} index={idx} total={localContent.length}
            onChange={updated => updateBlock(idx, updated)}
            onRemove={() => onRemove(idx)}
            onMove={dir => onMove(idx, dir)}
          />
        ))}
      </div>
    </div>
  )
}

// ─── Block Editor ─────────────────────────────────────────────────────────────

function BlockEditor({
  block, index, total, onChange, onRemove, onMove
}: {
  block: ContentBlock; index: number; total: number
  onChange: (b: ContentBlock) => void
  onRemove: () => void
  onMove: (dir: 'up' | 'down') => void
}) {
  const isMedia = block.type === 'image' || block.type === 'video' || block.type === 'audio'
  if (isMedia) return null

  const iCls = "w-full rounded-lg border border-slate-200 px-3 py-2 text-sm outline-none focus:border-[#0B4A7C] focus:ring-1 focus:ring-[#0B4A7C]/20"
  const tCls = "w-full rounded-lg border border-slate-200 px-3 py-2 text-sm outline-none focus:border-[#0B4A7C] focus:ring-1 focus:ring-[#0B4A7C]/20 resize-none"
  const lCls = "block text-[10px] font-bold uppercase tracking-widest text-slate-400 mb-1"

  const BLOCK_LABELS: Record<string, string> = {
    heading: 'Heading', paragraph: 'Paragraph', list: 'List', callout: 'Callout',
  }

  const CALLOUT_CONFIGS = {
    info:    { bg: 'bg-blue-600',  label: 'Info',    icon: Icons.info },
    tip:     { bg: 'bg-emerald-600', label: 'Tip',   icon: Icons.tip },
    warning: { bg: 'bg-amber-500', label: 'Warning', icon: Icons.warning },
  }

  return (
    <div className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm">

      {/* Block header */}
      <div className="flex items-center justify-between border-b border-slate-100 bg-slate-50 px-4 py-2">
        <div className="flex items-center gap-2">
          <div className="h-5 w-1 rounded-full" style={{ background: '#0B4A7C', opacity: 0.3 }} />
          <span className="text-xs font-semibold text-slate-600">{BLOCK_LABELS[block.type] || block.type}</span>
          <span className="rounded bg-slate-200 px-1.5 py-0.5 text-[10px] font-bold text-slate-500">#{index + 1}</span>
        </div>
        <div className="flex items-center gap-1">
          <button onClick={() => onMove('up')} disabled={index === 0}
            className="rounded p-1 text-slate-300 transition hover:bg-slate-200 hover:text-slate-500 disabled:opacity-30">
            {Icons.chevronUp}
          </button>
          <button onClick={() => onMove('down')} disabled={index === total - 1}
            className="rounded p-1 text-slate-300 transition hover:bg-slate-200 hover:text-slate-500 disabled:opacity-30">
            {Icons.chevronDown}
          </button>
          <div className="mx-1 h-3 w-px bg-slate-200" />
          <button onClick={onRemove}
            className="rounded p-1 text-slate-300 transition hover:bg-red-50 hover:text-red-500">
            {Icons.trash}
          </button>
        </div>
      </div>

      <div className="p-4 space-y-4">

        {/* HEADING */}
        {block.type === 'heading' && (
          <>
            <div className="flex items-center gap-2">
              <label className={lCls + " !mb-0 mr-1"}>Level</label>
              {[1, 2, 3].map(lvl => (
                <button key={lvl} onClick={() => onChange({ ...block, level: lvl as 1|2|3 })}
                  className={`h-7 w-9 rounded text-xs font-bold transition ${
                    (block.level || 2) === lvl
                      ? 'text-white'
                      : 'bg-slate-100 text-slate-500 hover:bg-slate-200'
                  }`}
                  style={(block.level || 2) === lvl ? { background: '#0B4A7C' } : {}}
                >H{lvl}</button>
              ))}
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div><label className={lCls}>English</label><input className={iCls} value={block.text.en} placeholder="Heading in English" onChange={e => onChange({ ...block, text: { ...block.text, en: e.target.value } })} /></div>
              <div><label className={lCls}>Spanish</label><input className={iCls} value={block.text.es} placeholder="Encabezado en español" onChange={e => onChange({ ...block, text: { ...block.text, es: e.target.value } })} /></div>
            </div>
          </>
        )}

        {/* PARAGRAPH */}
        {block.type === 'paragraph' && (
          <div className="grid grid-cols-2 gap-3">
            <div><label className={lCls}>English</label><textarea rows={4} className={tCls} value={block.text.en} placeholder="Paragraph in English" onChange={e => onChange({ ...block, text: { ...block.text, en: e.target.value } })} /></div>
            <div><label className={lCls}>Spanish</label><textarea rows={4} className={tCls} value={block.text.es} placeholder="Párrafo en español" onChange={e => onChange({ ...block, text: { ...block.text, es: e.target.value } })} /></div>
          </div>
        )}

        {/* LIST */}
        {block.type === 'list' && (
          <>
            <div className="flex items-center gap-2">
              <label className={lCls + " !mb-0 mr-1"}>Type</label>
              {[{ v: false, l: 'Unordered' }, { v: true, l: 'Ordered' }].map(({ v, l }) => (
                <button key={l} onClick={() => onChange({ ...block, ordered: v })}
                  className={`rounded-md px-3 py-1 text-xs font-semibold transition ${
                    !!block.ordered === v ? 'text-white' : 'bg-slate-100 text-slate-500 hover:bg-slate-200'
                  }`}
                  style={!!block.ordered === v ? { background: '#0B4A7C' } : {}}
                >{l}</button>
              ))}
            </div>
            <div className="space-y-2">
              {block.items.map((item, i) => (
                <div key={i} className="rounded-lg border border-slate-100 bg-slate-50 p-3">
                  <div className="mb-2 flex items-center justify-between">
                    <span className="text-[10px] font-bold text-slate-400">Item {i + 1}</span>
                    {block.items.length > 1 && (
                      <button onClick={() => onChange({ ...block, items: block.items.filter((_, j) => j !== i) })}
                        className="text-[10px] font-semibold text-red-400 hover:text-red-600">Remove</button>
                    )}
                  </div>
                  <div className="grid grid-cols-2 gap-2">
                    <input className={iCls} value={item.en} placeholder="English" onChange={e => onChange({ ...block, items: block.items.map((it, j) => j === i ? { ...it, en: e.target.value } : it) })} />
                    <input className={iCls} value={item.es} placeholder="Español"  onChange={e => onChange({ ...block, items: block.items.map((it, j) => j === i ? { ...it, es: e.target.value } : it) })} />
                  </div>
                </div>
              ))}
              <button onClick={() => onChange({ ...block, items: [...block.items, { en: '', es: '' }] })}
                className="flex items-center gap-1.5 text-xs font-semibold transition"
                style={{ color: '#0B4A7C' }}>
                {Icons.plus} Add Item
              </button>
            </div>
          </>
        )}

        {/* CALLOUT */}
        {block.type === 'callout' && (
          <>
            <div className="flex items-center gap-2">
              <label className={lCls + " !mb-0 mr-1"}>Variant</label>
              {(Object.entries(CALLOUT_CONFIGS) as [string, any][]).map(([v, cfg]) => (
                <button key={v} onClick={() => onChange({ ...block, variant: v })}
                  className={`flex items-center gap-1.5 rounded-md px-3 py-1 text-xs font-semibold transition ${
                    block.variant === v ? `${cfg.bg} text-white` : 'bg-slate-100 text-slate-500 hover:bg-slate-200'
                  }`}
                >
                  <span>{cfg.icon}</span>{cfg.label}
                </button>
              ))}
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div><label className={lCls}>Title — English</label><input className={iCls} value={block.title?.en || ''} placeholder="Optional title" onChange={e => onChange({ ...block, title: { ...(block.title || { en: '', es: '' }), en: e.target.value } })} /></div>
              <div><label className={lCls}>Title — Spanish</label><input className={iCls} value={block.title?.es || ''} placeholder="Título opcional" onChange={e => onChange({ ...block, title: { ...(block.title || { en: '', es: '' }), es: e.target.value } })} /></div>
              <div><label className={lCls}>Text — English</label><textarea rows={3} className={tCls} value={block.text.en} placeholder="Callout text in English" onChange={e => onChange({ ...block, text: { ...block.text, en: e.target.value } })} /></div>
              <div><label className={lCls}>Text — Spanish</label><textarea rows={3} className={tCls} value={block.text.es} placeholder="Texto en español" onChange={e => onChange({ ...block, text: { ...block.text, es: e.target.value } })} /></div>
            </div>
          </>
        )}

      </div>
    </div>
  )
}
