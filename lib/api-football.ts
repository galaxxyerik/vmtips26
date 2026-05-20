const API_BASE = 'https://v3.football.api-sports.io'

let lastRequestAt = 0

export class ApiFootballError extends Error {
  status: number

  constructor(message: string, status: number) {
    super(message)
    this.name = 'ApiFootballError'
    this.status = status
  }
}

function sleep(ms: number) {
  return new Promise(resolve => setTimeout(resolve, ms))
}

function apiErrorMessage(errors: unknown) {
  if (!errors) return null
  if (Array.isArray(errors)) return errors.length ? errors.join(', ') : null
  if (typeof errors === 'string') return errors || null
  if (typeof errors === 'object') {
    const values = Object.values(errors as Record<string, unknown>)
      .map(value => typeof value === 'string' ? value : JSON.stringify(value))
      .filter(Boolean)
    return values.length ? values.join(', ') : null
  }
  return String(errors)
}

export async function apiFootballFetch<T>(path: string): Promise<T | null> {
  const apiKey = process.env.API_FOOTBALL_KEY
  if (!apiKey) throw new ApiFootballError('Missing API_FOOTBALL_KEY', 500)

  const elapsed = Date.now() - lastRequestAt
  if (elapsed < 1000) await sleep(1000 - elapsed)
  lastRequestAt = Date.now()

  const res = await fetch(`${API_BASE}${path}`, {
    headers: { 'x-apisports-key': apiKey },
    cache: 'no-store',
  })

  if (res.status === 429) {
    console.warn(`[${new Date().toISOString()}] API-Football rate limit nådd för ${path}`)
    return null
  }

  if (!res.ok) {
    throw new ApiFootballError(`API-Football error ${res.status} för ${path}`, res.status)
  }

  const json = await res.json()
  const errorMessage = apiErrorMessage(json?.errors)
  if (errorMessage) {
    throw new ApiFootballError(`API-Football: ${errorMessage}`, 400)
  }

  return json as T
}

export function syncLog(message: string) {
  console.log(`[${new Date().toISOString()}] ${message}`)
}
