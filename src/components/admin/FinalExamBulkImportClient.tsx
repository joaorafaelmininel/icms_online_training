'use client'

// src/components/admin/FinalExamBulkImportClient.tsx
// Paste a JSON array of final-exam questions and import them all in one
// request via /api/admin/final-exam/bulk-import, instead of adding each
// question by hand.

import { useState } from 'react'

type ImportedQuestion = {
  id: string
  question_number: number
}

export default function FinalExamBulkImportClient({ adminName }: { adminName: string }) {
  const [courseId, setCourseId] = useState('')
  const [json, setJson] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const [imported, setImported] = useState<ImportedQuestion[] | null>(null)
  const [error, setError] = useState<string | null>(null)

  async function handleImport() {
    setError(null)
    setImported(null)

    if (!courseId.trim()) {
      setError('Informe o courseId (UUID do curso).')
      return
    }

    let questions: unknown
    try {
      questions = JSON.parse(json)
    } catch {
      setError('JSON inválido — confira se colou o conteúdo completo e sem cortes.')
      return
    }

    if (!Array.isArray(questions)) {
      setError('O JSON colado precisa ser uma lista (array) de perguntas.')
      return
    }

    setSubmitting(true)
    try {
      const res = await fetch('/api/admin/final-exam/bulk-import', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ courseId: courseId.trim(), questions }),
      })
      const data = await res.json()
      if (!res.ok) {
        setError(data.error || `Erro ${res.status}`)
        return
      }
      setImported(data.questions as ImportedQuestion[])
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro desconhecido')
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div className="mx-auto max-w-3xl px-4 py-10 text-gray-900">
      <h1 className="text-2xl font-bold">Importar perguntas da prova final — {adminName}</h1>
      <p className="mt-2 text-sm text-gray-600">
        Cole abaixo o JSON com o array de novas perguntas e clique em &quot;Importar perguntas&quot;.
        Elas são adicionadas à tabela <code>final_exam_questions</code> — se o objetivo é
        substituir o banco atual, apague as perguntas antigas desse curso no Supabase antes de
        importar as novas.
      </p>

      <label className="mt-6 block text-sm font-medium">Course ID (UUID do curso)</label>
      <input
        className="input mt-1"
        placeholder="ex: b8e6a6f7-5019-425f-8f27-d5477b785..."
        value={courseId}
        onChange={(e) => setCourseId(e.target.value)}
      />

      <label className="mt-4 block text-sm font-medium">JSON das perguntas</label>
      <textarea
        className="input mt-1 h-80 font-mono text-xs"
        placeholder="Cole aqui o array JSON de perguntas..."
        value={json}
        onChange={(e) => setJson(e.target.value)}
      />

      <button
        type="button"
        onClick={handleImport}
        disabled={submitting || !json.trim()}
        className="mt-4 rounded-lg bg-blue-600 px-4 py-2 font-medium text-white disabled:opacity-50"
      >
        {submitting ? 'Importando...' : 'Importar perguntas'}
      </button>

      {error && (
        <p className="mt-4 rounded-lg bg-red-50 px-4 py-3 text-sm text-red-700">{error}</p>
      )}

      {imported && (
        <p className="mt-6 rounded-lg bg-green-50 px-4 py-3 text-sm text-green-700">
          {imported.length} pergunta(s) importada(s) com sucesso (números{' '}
          {imported[0]?.question_number}–{imported[imported.length - 1]?.question_number}).
        </p>
      )}
    </div>
  )
}
