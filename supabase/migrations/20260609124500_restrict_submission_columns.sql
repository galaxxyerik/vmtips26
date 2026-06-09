-- Bug 6 from the June 9 audit: the RLS policy "public read confirmed submissions"
-- exposes ALL columns of vmt_submissions — including email and admin notes — to the
-- anon key. RLS is row-level only, so we use column-level grants to hide sensitive
-- columns from the API roles. The service role is unaffected.
--
-- Verified June 9: no client-side query selects or filters on email/admin_* —
-- all such queries go through API routes using createServiceClient().

revoke all on table public.vmt_submissions from anon, authenticated;

grant select (id, user_id, name, submitted_at, confirmed, total_points)
  on table public.vmt_submissions to anon, authenticated;
