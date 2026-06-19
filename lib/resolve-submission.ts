import type { SupabaseClient, User } from '@supabase/supabase-js'

/**
 * Resolve the submission belonging to a logged-in user.
 *
 * Submissions are normally linked to an account via `user_id` (set at submit
 * time). But a tip submitted anonymously by someone who already had an account
 * keeps `user_id = null`, so it stays invisible in "Mitt tips" and every
 * `/api/me/*` route even though the account exists (this happened to at least
 * one user — see CLAUDE.md). When the logged-in user's email matches an
 * unlinked submission we adopt it by backfilling `user_id`, so the link
 * self-heals on the next page load instead of needing manual DB surgery.
 *
 * Must be called with a SERVICE-ROLE client: the `email` column on
 * vmt_submissions is not readable by anon/authenticated (column-level grants),
 * and backfilling user_id requires the service role too.
 *
 * @param columns extra columns to select alongside `id` (defaults to `id, name, email`)
 */
export async function resolveMySubmission<T extends Record<string, unknown> = { id: string; name: string | null; email: string }>(
  service: SupabaseClient,
  user: User,
  columns = 'id, name, email',
): Promise<T | null> {
  const selectCols = columns.includes('user_id') ? columns : `${columns}, user_id`

  const { data: byUserId } = await service
    .from('vmt_submissions')
    .select(selectCols)
    .eq('user_id', user.id)
    .maybeSingle()

  if (byUserId) return byUserId as unknown as T

  if (!user.email) return null

  // No row linked to this account yet — adopt an unlinked submission with the
  // same email (case-insensitive; submissions store a lowercased email).
  const { data: byEmail } = await service
    .from('vmt_submissions')
    .select(selectCols)
    .ilike('email', user.email)
    .is('user_id', null)
    .order('submitted_at', { ascending: false })
    .limit(1)
    .maybeSingle()

  if (!byEmail) return null

  const adopted = byEmail as unknown as T & { id: string }

  await service
    .from('vmt_submissions')
    .update({ user_id: user.id })
    .eq('id', adopted.id)
    .is('user_id', null)

  return adopted
}
