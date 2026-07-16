// src/app/api/admin/slides/upload/route.ts
// Handles media upload to Supabase Storage for slide content
// Requires admin role

import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

// Disable body size limit for large video/audio uploads
export const config = {
  api: {
    bodyParser: false,
    responseLimit: false,
  },
}

// Also needed for App Router:
export const maxDuration = 60  // seconds — Vercel Pro allows up to 300s
export const dynamic = 'force-dynamic'

const BUCKET_MAP: Record<string, string> = {
  image: 'slide-images',
  video: 'slide-videos',
  audio: 'slide-audios',
}

export async function POST(req: NextRequest) {
  try {
    const supabase = createClient()

    // Auth check
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Admin role check
    const { data: profile } = await supabase
      .from('profiles')
      .select('user_role')
      .eq('id', user.id)
      .single()

    if (profile?.user_role !== 'admin') {
      return NextResponse.json({ error: 'Forbidden — admin only' }, { status: 403 })
    }

    // Parse form data — streams the body without loading into memory first
    const form    = await req.formData()
    const file    = form.get('file') as File | null
    const type    = form.get('type') as string | null
    const slideId = form.get('slideId') as string | null

    if (!file || !type || !slideId) {
      return NextResponse.json({ error: 'Missing file, type, or slideId' }, { status: 400 })
    }

    const bucket = BUCKET_MAP[type]
    if (!bucket) {
      return NextResponse.json({ error: `Unknown media type: ${type}` }, { status: 400 })
    }

    // Build clean filename
    const ext      = file.name.split('.').pop() || ''
    const safeName = file.name
      .replace(/\.[^/.]+$/, '')
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .replace(/[^a-zA-Z0-9-_]/g, '-')
      .slice(0, 60)
    const path = `${slideId}/${Date.now()}-${safeName}.${ext}`

    // Stream file directly to Supabase — avoids loading entire video into memory
    const arrayBuffer = await file.arrayBuffer()
    const buffer      = new Uint8Array(arrayBuffer)

    const { data: uploadData, error: uploadError } = await supabase.storage
      .from(bucket)
      .upload(path, buffer, {
        contentType:  file.type,
        cacheControl: '3600',
        upsert:       false,
      })

    if (uploadError) {
      console.error('Storage upload error:', uploadError)
      return NextResponse.json({ error: uploadError.message }, { status: 500 })
    }

    const { data: { publicUrl } } = supabase.storage
      .from(bucket)
      .getPublicUrl(uploadData.path)

    return NextResponse.json({ url: publicUrl, path: uploadData.path, bucket })

  } catch (err: any) {
    console.error('Upload route error:', err)
    return NextResponse.json({ error: err?.message || 'Internal server error' }, { status: 500 })
  }
}