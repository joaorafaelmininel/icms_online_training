import { cookies } from 'next/headers'
import { createServerClient } from '@supabase/ssr'
import type { Database } from '@/lib/types/supabase'

export function createClient() {
  const cookieStore = cookies()

  return createServerClient<Database>(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        get(name: string) {
          return cookieStore.get(name)?.value
        },
      },
    }
  )
}

/**
 * Same as `supabase.auth.getUser()`, but never throws.
 *
 * A stale/invalid refresh token (expired session, cookie left over from a
 * signed-out device, etc.) makes the Supabase client throw an uncaught
 * AuthApiError instead of just returning `{ user: null }`. With no
 * app/error.tsx boundary in this app, that uncaught error surfaces to the
 * affected user as a blank generic "client-side exception" page on
 * whatever route they happen to be on — not a bug in that page itself.
 * Treat any auth lookup failure as "not logged in" instead of crashing.
 */
export async function getAuthUser(
  supabase: ReturnType<typeof createClient>
) {
  try {
    const {
      data: { user },
    } = await supabase.auth.getUser()
    return user
  } catch {
    return null
  }
}
