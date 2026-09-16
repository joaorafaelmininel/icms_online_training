'use client'

// src/components/admin/TranslatePatchClient.tsx
// Paste a JSON batch of Spanish content corrections and apply them all in one
// request via /api/admin/slides/translate-patch, instead of editing each
// field by hand in the slide editor.

import { useState } from 'react'

type PatchResult = {
  moduleNumber: number
  slideNumber: number
  status: 'ok' | 'error'
  message?: string
}

export default function TranslatePatchClient({ adminName }: { adminName: string }) {
  const [courseSlug, setCourseSlug] = useState('icms-30')
  const [json, setJson] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const [results, setResults] = useState<PatchResult[] | null>(null)
  const [error, setError] = useState<string | null>(null)

  async function handleApply() {
    setError(null)
    setResults(null)

    let patches: unknown
    try {
      patches = JSON.parse(json)
    } catch {
      setError('JSON inválido — confira se colou o conteúdo completo e sem cortes.')
      return
    }

    if (!Array.isArray(patches)) {
      setError('O JSON colado precisa ser uma lista (array) de correções.')
      return
    }

    setSubmitting(true)
    try {
      const res = await fetch('/api/admin/slides/translate-patch', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ courseSlug, patches }),
      })
      const data = await res.json()
      if (!res.ok) {
        setError(data.error || `Erro ${res.status}`)
        return
      }
      setResults(data.results as PatchResult[])
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro desconhecido')
    } finally {
      setSubmitting(false)
    }
  }

  const okCount = results?.filter((r) => r.status === 'ok').length ?? 0
  const errorResults = results?.filter((r) => r.status === 'error') ?? []

  return (
    <div className="mx-auto max-w-3xl px-4 py-10 text-gray-900">
      <h1 className="text-2xl font-bold">Aplicar correções em lote — {adminName}</h1>
      <p className="mt-2 text-sm text-gray-600">
        Cole abaixo o JSON de correções (um array de slides com o conteúdo corrigido) e clique em
        &quot;Aplicar correções&quot;. Cada item substitui apenas o conteúdo (blocos de texto e
        mídia) do slide indicado — nada mais é alterado.
      </p>

      <label className="mt-6 block text-sm font-medium">Curso (slug)</label>
      <input
        className="input mt-1"
        value={courseSlug}
        onChange={(e) => setCourseSlug(e.target.value)}
      />

      <label className="mt-4 block text-sm font-medium">JSON de correções</label>
      <textarea
        className="input mt-1 h-80 font-mono text-xs"
        placeholder="Cole aqui o array JSON de correções..."
        value={json}
        onChange={(e) => setJson(e.target.value)}
      />

      <button
        type="button"
        onClick={handleApply}
        disabled={submitting || !json.trim()}
        className="mt-4 rounded-lg bg-blue-600 px-4 py-2 font-medium text-white disabled:opacity-50"
      >
        {submitting ? 'Aplicando...' : 'Aplicar correções'}
      </button>

      {error && (
        <p className="mt-4 rounded-lg bg-red-50 px-4 py-3 text-sm text-red-700">{error}</p>
      )}

      {results && (
        <div className="mt-6">
          <p className="font-medium">
            {okCount} de {results.length} slides corrigidos com sucesso.
          </p>
          {errorResults.length > 0 && (
            <ul className="mt-2 space-y-1 text-sm text-red-700">
              {errorResults.map((r) => (
                <li key={`${r.moduleNumber}-${r.slideNumber}`}>
                  Módulo {r.moduleNumber}, Slide {r.slideNumber}: {r.message}
                </li>
              ))}
            </ul>
          )}
        </div>
      )}
    </div>
  )
}
