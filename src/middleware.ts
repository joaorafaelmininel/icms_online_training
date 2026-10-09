import { NextResponse, type NextRequest } from 'next/server'
import { createServerClient } from '@supabase/ssr'

export async function middleware(request: NextRequest) {
  let response = NextResponse.next()

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll()
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value, options }) => {
            response.cookies.set(name, value, options)
          })
        },
      },
    }
  )

  try {
    await supabase.auth.getUser()
  } catch {
    // A stale/invalid refresh token makes getUser() throw instead of just
    // returning { user: null } — left uncaught, that crashed the request
    // for every route (middleware runs on all of them), well before any
    // page got a chance to handle it. Treat it as "not logged in": clear
    // the bad Supabase cookies so the client stops retrying with them.
    request.cookies.getAll().forEach(({ name }) => {
      if (name.startsWith('sb-')) response.cookies.delete(name)
    })
  }

  return response
}
