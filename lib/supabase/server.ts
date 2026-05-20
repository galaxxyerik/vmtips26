import { createServerClient, type CookieOptions } from '@supabase/ssr'
import { cookies } from 'next/headers'

function supabaseProjectRefFromUrl(value: string | undefined) {
  try {
    const host = new URL(value ?? '').hostname
    return host.endsWith('.supabase.co') ? host.split('.')[0] : null
  } catch {
    return null
  }
}

function supabaseProjectRefFromJwt(value: string | undefined) {
  try {
    const payload = value?.split('.')[1]
    if (!payload) return null
    const decoded = JSON.parse(Buffer.from(payload, 'base64url').toString('utf8')) as { iss?: string; ref?: string }
    if (decoded.ref) return decoded.ref
    return decoded.iss?.match(/\/([^/]+)$/)?.[1] ?? null
  } catch {
    return null
  }
}

function assertSupabaseKeyMatchesUrl(key: string | undefined, name: string) {
  const urlRef = supabaseProjectRefFromUrl(process.env.NEXT_PUBLIC_SUPABASE_URL)
  const keyRef = supabaseProjectRefFromJwt(key)

  if (urlRef && keyRef && urlRef !== keyRef) {
    throw new Error(`${name} matchar inte NEXT_PUBLIC_SUPABASE_URL (${keyRef} != ${urlRef})`)
  }
}

export async function createClient() {
  const cookieStore = await cookies()
  assertSupabaseKeyMatchesUrl(process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY, 'NEXT_PUBLIC_SUPABASE_ANON_KEY')

  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return cookieStore.getAll()
        },
        setAll(cookiesToSet: { name: string; value: string; options: CookieOptions }[]) {
          try {
            cookiesToSet.forEach(({ name, value, options }) =>
              cookieStore.set(name, value, options)
            )
          } catch {
            // Called from a Server Component — safe to ignore
          }
        },
      },
    }
  )
}

export function createServiceClient() {
  assertSupabaseKeyMatchesUrl(process.env.SUPABASE_SERVICE_ROLE_KEY, 'SUPABASE_SERVICE_ROLE_KEY')

  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    {
      cookies: {
        getAll: () => [],
        setAll: () => {},
      },
    }
  )
}
