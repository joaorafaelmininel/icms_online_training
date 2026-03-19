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
}> = {
  image: { label: 'Image', icon: '🖼️', accept: 'image/jpeg,image/png,image/gif,image/webp,image/svg+xml', hint: 'JPG, PNG, GIF, WebP — max 10 MB' },
  video: { label: 'Video', icon: '🎬', accept: 'video/mp4,video/webm,video/ogg', hint: 'MP4, WebM, OGG — max 500 MB' },
  audio: { label: 'Audio', icon: '🎧', accept: 'audio/mpeg,audio/wav,audio/ogg,audio/aac,audio/m4a', hint: 'MP3, WAV, OGG, AAC — max 50 MB' },
}

type EditorTab = 'content' | 'media'

// ─── Main Component ───────────────────────────────────────────────────────────

export default function SlideMediaAdmin({ courses, adminName }: Props) {
  const [selectedCourse,  setSelectedCourse ] = useState<CourseData | null>(null)
  const [selectedModule,  setSelectedModule ] = useState<ModuleData | null>(null)
  const [selectedSlide,   setSelectedSlide  ] = useState<SlideData  | null>(null)
  const [activeMediaType, setActiveMediaType] = useState<MediaType>('image')
  const [activeTab,       setActiveTab      ] = useState<EditorTab>('content')

  function pickCourse(course: CourseData) {
    setSelectedCourse(course)
    setSelectedModule(null)
    setSelectedSlide(null)
  }

  function pickModule(mod: ModuleData) {
    setSelectedModule(mod)
    setSelectedSlide(null)
  }

  function onSlideContentUpdated(slideId: string, newContent: ContentBlock[]) {
    setSelectedSlide(prev => prev?.id === slideId ? { ...prev, content: newContent } : prev)
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
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
            </svg>
          </div>
          <div>
            <h1 className="text-lg font-bold text-gray-900">Slide Manager</h1>
            <p className="text-xs text-gray-400">Logged in as {adminName}</p>
          </div>
        </div>
        <a href="/dashboard" className="rounded-lg border border-gray-200 bg-white px-4 py-2 text-sm font-medium text-gray-600 transition hover:bg-gray-50">
          Back to Dashboard
        </a>
      </header>

      <div className="flex flex-1 overflow-hidden">

        {/* Col 1: Course + Module tree */}
        <aside className="flex w-72 shrink-0 flex-col overflow-hidden border-r border-gray-200 bg-white">
          <div className="border-b border-gray-100 px-4 py-3">
            <p className="text-xs font-semibold uppercase tracking-wider text-gray-400">Courses & Modules</p>
          </div>
          <div className="flex-1 overflow-y-auto p-2">
            {courses.map(course => (
              <div key={course.id} className="mb-1">
                <button
                  onClick={() => pickCourse(course)}
                  className={`w-full rounded-lg px-3 py-2.5 text-left text-sm font-semibold transition ${
                    selectedCourse?.id === course.id ? 'bg-[#0B4A7C] text-white' : 'text-gray-700 hover:bg-gray-100'
                  }`}
                >
                  <span className="mr-2">📚</span>{loc(course.title)}
                </button>
                {selectedCourse?.id === course.id && (
                  <div className="ml-4 mt-1 space-y-0.5 border-l-2 border-[#0B4A7C]/20 pl-3">
                    {course.course_modules.map(mod => (
                      <button key={mod.id} onClick={() => pickModule(mod)}
                        className={`w-full rounded-lg px-3 py-2 text-left text-xs font-medium transition ${
                          selectedModule?.id === mod.id ? 'bg-[#0B4A7C]/10 text-[#0B4A7C]' : 'text-gray-600 hover:bg-gray-50'
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

        {/* Col 2: Slide list */}
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
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                </svg>
                <p className="text-xs">Select a module</p>
              </div>
            ) : (
              selectedModule.module_slides.map(slide => {
                const mediaBlocks = slide.content?.filter(b => b.type === 'image' || b.type === 'video' || b.type === 'audio') || []
                const textBlocks  = slide.content?.filter(b => b.type === 'heading' || b.type === 'paragraph' || b.type === 'list' || b.type === 'callout') || []
                return (
                  <button key={slide.id} onClick={() => setSelectedSlide(slide)}
                    className={`mb-1 w-full rounded-lg px-3 py-2.5 text-left transition ${
                      selectedSlide?.id === slide.id ? 'bg-[#0B4A7C]/10 ring-1 ring-[#0B4A7C]/30' : 'hover:bg-gray-50'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold text-gray-400">#{slide.slide_number}</span>
                      <div className="flex gap-1">
                        {textBlocks.length > 0  && <span className="text-[10px]">📝</span>}
                        {mediaBlocks.some(b => b.type === 'image') && <span className="text-[10px]">🖼️</span>}
                        {mediaBlocks.some(b => b.type === 'video') && <span className="text-[10px]">🎬</span>}
                        {mediaBlocks.some(b => b.type === 'audio') && <span className="text-[10px]">🎧</span>}
                      </div>
                    </div>
                    <p className="mt-0.5 text-xs font-medium text-gray-700 line-clamp-2">{loc(slide.title)}</p>
                  </button>
                )
              })
            )}
          </div>
        </aside>

        {/* Col 3: Editor */}
        <main className="flex flex-1 flex-col overflow-hidden">
          {!selectedSlide ? (
            <div className="flex flex-1 flex-col items-center justify-center text-gray-300">
              <svg className="mb-3 h-16 w-16" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
              </svg>
              <p className="text-sm">Select a slide to edit</p>
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
  slide,
  activeMediaType, setActiveMediaType,
  activeTab, setActiveTab,
  onContentUpdated,
}: {
  slide:               SlideData
  activeMediaType:     MediaType
  setActiveMediaType:  (t: MediaType) => void
  activeTab:           EditorTab
  setActiveTab:        (t: EditorTab) => void
  onContentUpdated:    (id: string, content: ContentBlock[]) => void
}) {
  const [content,   setContent  ] = useState<ContentBlock[]>(slide.content || [])
  const [uploading, setUploading] = useState(false)
  const [uploadMsg, setUploadMsg] = useState<{ type: 'success' | 'error'; text: string } | null>(null)
  const [captionEn, setCaptionEn] = useState('')
  const [captionEs, setCaptionEs] = useState('')
  const [dragOver,  setDragOver ] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)

  // Sync content when slide changes
  useEffect(() => { setContent(slide.content || []) }, [slide.id])

  const cfg = MEDIA_CONFIG[activeMediaType]
  const mediaBlocks = content.filter(b => b.type === 'image' || b.type === 'video' || b.type === 'audio')

  // ── Save helpers ───────────────────────────────────────────────────────────

  async function saveContent(blocks: ContentBlock[]) {
    const res  = await fetch(`/api/admin/slides/${slide.id}/content`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ action: 'replace_content', content: blocks }),
    })
    const data = await res.json()
    if (!res.ok) throw new Error(data.error)
    setContent(data.content)
    onContentUpdated(slide.id, data.content)
    return data.content
  }

  async function removeBlock(index: number) {
    try {
      const next = content.filter((_, i) => i !== index)
      await saveContent(next)
    } catch (err: any) {
      setUploadMsg({ type: 'error', text: err.message })
    }
  }

  async function moveBlock(index: number, dir: 'up' | 'down') {
    const next  = [...content]
    const swap  = dir === 'up' ? index - 1 : index + 1
    if (swap < 0 || swap >= next.length) return
    ;[next[index], next[swap]] = [next[swap], next[index]]
    await saveContent(next)
  }

  // ── Media upload ───────────────────────────────────────────────────────────

  async function handleUpload(file: File) {
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

      const caption = (captionEn || captionEs) ? { en: captionEn, es: captionEs } : undefined
      const newBlock: ContentBlock =
        activeMediaType === 'image' ? { type: 'image', url: data.url, caption } :
        activeMediaType === 'video' ? { type: 'video', url: data.url, caption } :
                                      { type: 'audio', url: data.url, caption }

      await saveContent([...content, newBlock])
      setCaptionEn(''); setCaptionEs('')
      setUploadMsg({ type: 'success', text: `${cfg.label} added!` })
    } catch (err: any) {
      setUploadMsg({ type: 'error', text: err.message })
    } finally {
      setUploading(false)
    }
  }

  return (
    <div className="flex flex-1 flex-col overflow-hidden">

      {/* Slide header */}
      <div className="border-b border-gray-200 bg-white px-6 py-4">
        <p className="text-xs font-semibold uppercase tracking-wider text-gray-400">Slide #{slide.slide_number}</p>
        <h2 className="mt-0.5 text-base font-bold text-gray-900">{loc(slide.title)}</h2>
      </div>

      {/* Main tabs: Content | Media */}
      <div className="border-b border-gray-200 bg-white px-6">
        <div className="flex gap-0">
          {(['content', 'media'] as EditorTab[]).map(tab => (
            <button key={tab} onClick={() => setActiveTab(tab)}
              className={`border-b-2 px-5 py-3 text-sm font-semibold capitalize transition ${
                activeTab === tab
                  ? 'border-[#0B4A7C] text-[#0B4A7C]'
                  : 'border-transparent text-gray-500 hover:text-gray-700'
              }`}
            >
              {tab === 'content' ? '📝 Content' : '🎬 Media'}
            </button>
          ))}
        </div>
      </div>

      {/* Tab panels */}
      <div className="flex flex-1 overflow-hidden">

        {/* ── CONTENT TAB ────────────────────────────────────────────────── */}
        {activeTab === 'content' && (
          <ContentEditor
            content={content}
            slideId={slide.id}
            onSave={saveContent}
            onRemove={removeBlock}
            onMove={moveBlock}
          />
        )}

        {/* ── MEDIA TAB ──────────────────────────────────────────────────── */}
        {activeTab === 'media' && (
          <div className="flex flex-1 gap-0 overflow-hidden">

            {/* Upload panel */}
            <div className="flex w-96 shrink-0 flex-col gap-5 overflow-y-auto border-r border-gray-200 bg-white p-5">
              <div className="flex gap-1 rounded-xl bg-gray-100 p-1">
                {MEDIA_TYPES.map(type => (
                  <button key={type} onClick={() => { setActiveMediaType(type); setUploadMsg(null) }}
                    className={`flex flex-1 items-center justify-center gap-1.5 rounded-lg py-2 text-xs font-semibold transition ${
                      activeMediaType === type ? 'bg-white shadow text-gray-900' : 'text-gray-500 hover:text-gray-700'
                    }`}
                  >
                    <span>{MEDIA_CONFIG[type].icon}</span>{MEDIA_CONFIG[type].label}
                  </button>
                ))}
              </div>

              <div className="space-y-2">
                <label className="block text-xs font-semibold uppercase tracking-wider text-gray-500">Caption (optional)</label>
                <input value={captionEn} onChange={e => setCaptionEn(e.target.value)} placeholder="English caption"
                  className="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm outline-none focus:border-[#0B4A7C] focus:ring-1 focus:ring-[#0B4A7C]" />
                <input value={captionEs} onChange={e => setCaptionEs(e.target.value)} placeholder="Descripcion en espanol"
                  className="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm outline-none focus:border-[#0B4A7C] focus:ring-1 focus:ring-[#0B4A7C]" />
              </div>

              <div
                onDragOver={e => { e.preventDefault(); setDragOver(true) }}
                onDragLeave={() => setDragOver(false)}
                onDrop={e => { e.preventDefault(); setDragOver(false); const f = e.dataTransfer.files?.[0]; if (f) handleUpload(f) }}
                onClick={() => fileInputRef.current?.click()}
                className={`flex cursor-pointer flex-col items-center justify-center gap-3 rounded-xl border-2 border-dashed py-10 transition ${
                  dragOver ? 'border-[#0B4A7C] bg-[#0B4A7C]/5' : 'border-gray-200 hover:border-gray-300 hover:bg-gray-50'
                } ${uploading ? 'pointer-events-none opacity-50' : ''}`}
              >
                {uploading ? (
                  <>
                    <svg className="h-8 w-8 animate-spin text-[#0B4A7C]" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                    </svg>
                    <p className="text-sm font-medium text-gray-500">Uploading...</p>
                  </>
                ) : (
                  <>
                    <span className="text-4xl">{cfg.icon}</span>
                    <div className="text-center">
                      <p className="text-sm font-semibold text-gray-700">Drop {cfg.label.toLowerCase()} here</p>
                      <p className="mt-0.5 text-xs text-gray-400">or click to browse</p>
                    </div>
                    <p className="text-xs text-gray-400">{cfg.hint}</p>
                  </>
                )}
                <input ref={fileInputRef} type="file" accept={cfg.accept} className="hidden"
                  onChange={e => { const f = e.target.files?.[0]; if (f) handleUpload(f); e.target.value = '' }} />
              </div>

              {uploadMsg && (
                <div className={`rounded-lg px-4 py-3 text-sm font-medium ${uploadMsg.type === 'success' ? 'bg-emerald-50 text-emerald-700' : 'bg-red-50 text-red-700'}`}>
                  {uploadMsg.type === 'success' ? '✅ ' : '❌ '}{uploadMsg.text}
                </div>
              )}
            </div>

            {/* Media blocks list */}
            <div className="flex-1 overflow-y-auto bg-gray-50 p-5">
              <p className="mb-3 text-xs font-semibold uppercase tracking-wider text-gray-400">
                Media blocks ({mediaBlocks.length})
              </p>
              {mediaBlocks.length === 0 ? (
                <div className="flex flex-col items-center justify-center rounded-xl border-2 border-dashed border-gray-200 py-16 text-center">
                  <p className="text-sm text-gray-300">No media blocks yet</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {content.map((block, idx) => {
                    if (block.type !== 'image' && block.type !== 'video' && block.type !== 'audio') return null
                    const caption = 'caption' in block ? loc(block.caption) : ''
                    return (
                      <div key={idx} className="overflow-hidden rounded-xl border border-gray-200 bg-white shadow-sm">
                        <div className="flex items-center justify-between border-b border-gray-100 px-4 py-2.5">
                          <div className="flex items-center gap-2">
                            <span className="text-base">{block.type === 'image' ? '🖼️' : block.type === 'video' ? '🎬' : '🎧'}</span>
                            <span className="text-xs font-semibold capitalize text-gray-600">{block.type}</span>
                            {caption && <span className="text-xs text-gray-400">— {caption}</span>}
                          </div>
                          <button onClick={() => removeBlock(idx)} className="rounded-lg p-1 text-gray-300 transition hover:bg-red-50 hover:text-red-500">
                            <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                            </svg>
                          </button>
                        </div>
                        <div className="p-3">
                          {block.type === 'image' && <img src={block.url} alt="" className="max-h-48 w-full rounded-lg object-contain bg-gray-50" />}
                          {block.type === 'video' && <video src={block.url} controls preload="metadata" className="w-full rounded-lg" style={{ maxHeight: '200px' }} />}
                          {block.type === 'audio' && <audio controls preload="metadata" className="w-full"><source src={block.url} /></audio>}
                          <p className="mt-2 truncate text-xs text-gray-300">{block.url}</p>
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

// ─── Content Editor ───────────────────────────────────────────────────────────

function ContentEditor({
  content,
  slideId,
  onSave,
  onRemove,
  onMove,
}: {
  content:  ContentBlock[]
  slideId:  string
  onSave:   (blocks: ContentBlock[]) => Promise<ContentBlock[]>
  onRemove: (index: number) => Promise<void>
  onMove:   (index: number, dir: 'up' | 'down') => Promise<void>
}) {
  const [saving,  setSaving ] = useState(false)
  const [msg,     setMsg    ] = useState<{ type: 'success' | 'error'; text: string } | null>(null)
  const [adding,  setAdding ] = useState(false)
  const [newType, setNewType] = useState<'heading' | 'paragraph' | 'list' | 'callout'>('paragraph')

  // Local editable copy of text blocks (we edit in-place then save)
  const [localContent, setLocalContent] = useState<ContentBlock[]>(content)

  useEffect(() => { setLocalContent(content) }, [content])

  function updateBlock(index: number, updated: ContentBlock) {
    setLocalContent(prev => prev.map((b, i) => i === index ? updated : b))
  }

  async function handleSaveAll() {
    setSaving(true)
    setMsg(null)
    try {
      await onSave(localContent)
      setMsg({ type: 'success', text: 'Saved successfully!' })
      setTimeout(() => setMsg(null), 2000)
    } catch (err: any) {
      setMsg({ type: 'error', text: err.message })
    } finally {
      setSaving(false)
    }
  }

  async function handleAddBlock() {
    let newBlock: ContentBlock
    if (newType === 'heading')   newBlock = { type: 'heading',   level: 2, text: { en: '', es: '' } }
    else if (newType === 'list') newBlock = { type: 'list',      ordered: false, items: [{ en: '', es: '' }] }
    else if (newType === 'callout') newBlock = { type: 'callout', variant: 'info', title: { en: '', es: '' }, text: { en: '', es: '' } }
    else                         newBlock = { type: 'paragraph', text: { en: '', es: '' } }

    const next = [...localContent, newBlock]
    setLocalContent(next)
    setAdding(false)
  }

  const textBlocks = localContent.filter(b =>
    b.type === 'heading' || b.type === 'paragraph' || b.type === 'list' || b.type === 'callout'
  )

  return (
    <div className="flex flex-1 flex-col overflow-hidden">

      {/* Toolbar */}
      <div className="flex items-center justify-between border-b border-gray-100 bg-white px-5 py-3">
        <p className="text-xs font-semibold uppercase tracking-wider text-gray-400">
          {textBlocks.length} text block{textBlocks.length !== 1 ? 's' : ''}
        </p>
        <div className="flex items-center gap-2">
          {msg && (
            <span className={`text-xs font-medium ${msg.type === 'success' ? 'text-emerald-600' : 'text-red-600'}`}>
              {msg.type === 'success' ? '✅ ' : '❌ '}{msg.text}
            </span>
          )}
          <button onClick={() => setAdding(true)}
            className="flex items-center gap-1.5 rounded-lg border border-gray-200 bg-white px-3 py-1.5 text-xs font-semibold text-gray-600 transition hover:bg-gray-50">
            <svg className="h-3.5 w-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
            </svg>
            Add Block
          </button>
          <button onClick={handleSaveAll} disabled={saving}
            className="flex items-center gap-1.5 rounded-lg bg-[#0B4A7C] px-4 py-1.5 text-xs font-bold text-white transition hover:bg-[#083457] disabled:opacity-50">
            {saving ? (
              <svg className="h-3.5 w-3.5 animate-spin" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
              </svg>
            ) : (
              <svg className="h-3.5 w-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
            )}
            {saving ? 'Saving...' : 'Save All'}
          </button>
        </div>
      </div>

      {/* Add block modal */}
      {adding && (
        <div className="border-b border-blue-100 bg-blue-50 px-5 py-3">
          <p className="mb-2 text-xs font-semibold text-blue-700">Choose block type:</p>
          <div className="flex flex-wrap gap-2">
            {(['heading', 'paragraph', 'list', 'callout'] as const).map(type => (
              <button key={type} onClick={() => setNewType(type)}
                className={`rounded-lg border px-3 py-1.5 text-xs font-semibold capitalize transition ${
                  newType === type ? 'border-[#0B4A7C] bg-[#0B4A7C] text-white' : 'border-gray-200 bg-white text-gray-600 hover:bg-gray-50'
                }`}
              >
                {type === 'heading' ? '# Heading' : type === 'paragraph' ? '¶ Paragraph' : type === 'list' ? '• List' : '💡 Callout'}
              </button>
            ))}
            <button onClick={handleAddBlock}
              className="rounded-lg bg-emerald-600 px-3 py-1.5 text-xs font-bold text-white transition hover:bg-emerald-700">
              Add
            </button>
            <button onClick={() => setAdding(false)}
              className="rounded-lg border border-gray-200 bg-white px-3 py-1.5 text-xs font-semibold text-gray-500 transition hover:bg-gray-50">
              Cancel
            </button>
          </div>
        </div>
      )}

      {/* Block list */}
      <div className="flex-1 overflow-y-auto bg-gray-50 p-5 space-y-4">
        {localContent.length === 0 && (
          <div className="flex flex-col items-center justify-center rounded-xl border-2 border-dashed border-gray-200 py-16 text-center">
            <p className="text-sm text-gray-300">No content blocks yet</p>
            <p className="mt-1 text-xs text-gray-300">Click "Add Block" to start</p>
          </div>
        )}

        {localContent.map((block, idx) => (
          <BlockEditor
            key={idx}
            block={block}
            index={idx}
            total={localContent.length}
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
  block:    ContentBlock
  index:    number
  total:    number
  onChange: (b: ContentBlock) => void
  onRemove: () => void
  onMove:   (dir: 'up' | 'down') => void
}) {
  const isMedia = block.type === 'image' || block.type === 'video' || block.type === 'audio'
  if (isMedia) return null // media blocks shown in Media tab only

  const labelCls = "block text-xs font-semibold text-gray-500 mb-1"
  const inputCls = "w-full rounded-lg border border-gray-200 px-3 py-2 text-sm outline-none focus:border-[#0B4A7C] focus:ring-1 focus:ring-[#0B4A7C]"
  const textareaCls = "w-full rounded-lg border border-gray-200 px-3 py-2 text-sm outline-none focus:border-[#0B4A7C] focus:ring-1 focus:ring-[#0B4A7C] resize-none"

  const blockIcon =
    block.type === 'heading'   ? '# ' :
    block.type === 'paragraph' ? '¶ ' :
    block.type === 'list'      ? '• ' : '💡 '

  const blockLabel =
    block.type === 'heading'   ? `Heading (H${(block as any).level || 2})` :
    block.type === 'paragraph' ? 'Paragraph' :
    block.type === 'list'      ? `List (${(block as any).ordered ? 'ordered' : 'unordered'})` :
    `Callout (${(block as any).variant})`

  return (
    <div className="overflow-hidden rounded-xl border border-gray-200 bg-white shadow-sm">

      {/* Block header */}
      <div className="flex items-center justify-between border-b border-gray-100 bg-gray-50 px-4 py-2.5">
        <div className="flex items-center gap-2">
          <span className="text-sm font-bold text-gray-500">{blockIcon}</span>
          <span className="text-xs font-semibold text-gray-600">{blockLabel}</span>
          <span className="rounded bg-gray-200 px-1.5 py-0.5 text-[10px] text-gray-500">#{index + 1}</span>
        </div>
        <div className="flex items-center gap-1">
          <button onClick={() => onMove('up')} disabled={index === 0}
            className="rounded p-1 text-gray-300 transition hover:bg-gray-200 hover:text-gray-600 disabled:opacity-30">
            <svg className="h-3.5 w-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 15l7-7 7 7" />
            </svg>
          </button>
          <button onClick={() => onMove('down')} disabled={index === total - 1}
            className="rounded p-1 text-gray-300 transition hover:bg-gray-200 hover:text-gray-600 disabled:opacity-30">
            <svg className="h-3.5 w-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
            </svg>
          </button>
          <button onClick={onRemove}
            className="rounded p-1 text-gray-300 transition hover:bg-red-50 hover:text-red-500">
            <svg className="h-3.5 w-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
            </svg>
          </button>
        </div>
      </div>

      {/* Block fields */}
      <div className="p-4 space-y-4">

        {/* ── HEADING ── */}
        {block.type === 'heading' && (
          <>
            <div className="flex items-center gap-3 mb-2">
              <label className={labelCls + " !mb-0"}>Level</label>
              {[1, 2, 3].map(lvl => (
                <button key={lvl} onClick={() => onChange({ ...block, level: lvl as 1|2|3 })}
                  className={`rounded px-2.5 py-1 text-xs font-bold transition ${
                    (block.level || 2) === lvl ? 'bg-[#0B4A7C] text-white' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                  }`}
                >H{lvl}</button>
              ))}
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className={labelCls}>English 🇬🇧</label>
                <input className={inputCls} value={block.text.en} placeholder="Heading text in English"
                  onChange={e => onChange({ ...block, text: { ...block.text, en: e.target.value } })} />
              </div>
              <div>
                <label className={labelCls}>Spanish 🇪🇸</label>
                <input className={inputCls} value={block.text.es} placeholder="Texto del encabezado en español"
                  onChange={e => onChange({ ...block, text: { ...block.text, es: e.target.value } })} />
              </div>
            </div>
          </>
        )}

        {/* ── PARAGRAPH ── */}
        {block.type === 'paragraph' && (
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className={labelCls}>English 🇬🇧</label>
              <textarea rows={4} className={textareaCls} value={block.text.en} placeholder="Paragraph text in English"
                onChange={e => onChange({ ...block, text: { ...block.text, en: e.target.value } })} />
            </div>
            <div>
              <label className={labelCls}>Spanish 🇪🇸</label>
              <textarea rows={4} className={textareaCls} value={block.text.es} placeholder="Texto del párrafo en español"
                onChange={e => onChange({ ...block, text: { ...block.text, es: e.target.value } })} />
            </div>
          </div>
        )}

        {/* ── LIST ── */}
        {block.type === 'list' && (
          <>
            <div className="flex items-center gap-3 mb-1">
              <label className={labelCls + " !mb-0"}>Type</label>
              <button onClick={() => onChange({ ...block, ordered: false })}
                className={`rounded px-2.5 py-1 text-xs font-semibold transition ${!block.ordered ? 'bg-[#0B4A7C] text-white' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'}`}>
                • Unordered
              </button>
              <button onClick={() => onChange({ ...block, ordered: true })}
                className={`rounded px-2.5 py-1 text-xs font-semibold transition ${block.ordered ? 'bg-[#0B4A7C] text-white' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'}`}>
                1. Ordered
              </button>
            </div>
            <div className="space-y-3">
              {block.items.map((item, i) => (
                <div key={i} className="rounded-lg border border-gray-100 bg-gray-50 p-3">
                  <div className="mb-2 flex items-center justify-between">
                    <span className="text-xs font-bold text-gray-400">Item {i + 1}</span>
                    {block.items.length > 1 && (
                      <button onClick={() => onChange({ ...block, items: block.items.filter((_, j) => j !== i) })}
                        className="text-xs text-red-400 hover:text-red-600">Remove</button>
                    )}
                  </div>
                  <div className="grid grid-cols-2 gap-2">
                    <input className={inputCls} value={item.en} placeholder="English"
                      onChange={e => onChange({ ...block, items: block.items.map((it, j) => j === i ? { ...it, en: e.target.value } : it) })} />
                    <input className={inputCls} value={item.es} placeholder="Español"
                      onChange={e => onChange({ ...block, items: block.items.map((it, j) => j === i ? { ...it, es: e.target.value } : it) })} />
                  </div>
                </div>
              ))}
              <button onClick={() => onChange({ ...block, items: [...block.items, { en: '', es: '' }] })}
                className="flex items-center gap-1.5 text-xs font-semibold text-[#0B4A7C] hover:underline">
                <svg className="h-3.5 w-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                </svg>
                Add Item
              </button>
            </div>
          </>
        )}

        {/* ── CALLOUT ── */}
        {block.type === 'callout' && (
          <>
            <div className="flex items-center gap-3 mb-1">
              <label className={labelCls + " !mb-0"}>Variant</label>
              {(['info', 'tip', 'warning'] as const).map(v => (
                <button key={v} onClick={() => onChange({ ...block, variant: v })}
                  className={`rounded px-2.5 py-1 text-xs font-semibold capitalize transition ${
                    block.variant === v
                      ? v === 'info'    ? 'bg-blue-600 text-white'
                      : v === 'tip'     ? 'bg-green-600 text-white'
                      :                   'bg-amber-500 text-white'
                      : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                  }`}
                >
                  {v === 'info' ? 'ℹ️' : v === 'tip' ? '💡' : '⚠️'} {v}
                </button>
              ))}
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className={labelCls}>Title EN 🇬🇧</label>
                <input className={inputCls} value={block.title?.en || ''} placeholder="Optional title"
                  onChange={e => onChange({ ...block, title: { ...(block.title || { en: '', es: '' }), en: e.target.value } })} />
              </div>
              <div>
                <label className={labelCls}>Title ES 🇪🇸</label>
                <input className={inputCls} value={block.title?.es || ''} placeholder="Titulo opcional"
                  onChange={e => onChange({ ...block, title: { ...(block.title || { en: '', es: '' }), es: e.target.value } })} />
              </div>
              <div>
                <label className={labelCls}>Text EN 🇬🇧</label>
                <textarea rows={3} className={textareaCls} value={block.text.en} placeholder="Callout text in English"
                  onChange={e => onChange({ ...block, text: { ...block.text, en: e.target.value } })} />
              </div>
              <div>
                <label className={labelCls}>Text ES 🇪🇸</label>
                <textarea rows={3} className={textareaCls} value={block.text.es} placeholder="Texto del callout en español"
                  onChange={e => onChange({ ...block, text: { ...block.text, es: e.target.value } })} />
              </div>
            </div>
          </>
        )}

      </div>
    </div>
  )
}
