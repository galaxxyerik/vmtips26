-- Enforce one submitted VM-tip per normalized email address.
-- This intentionally fails if duplicates already exist, so they can be
-- resolved manually instead of silently picking the wrong submission.

do $$
declare
  duplicate_count int;
begin
  select count(*)
  into duplicate_count
  from (
    select lower(btrim(email)) as normalized_email
    from public.vmt_submissions
    group by lower(btrim(email))
    having count(*) > 1
  ) duplicates;

  if duplicate_count > 0 then
    raise exception
      'Cannot add unique vmt_submissions email index: % duplicate normalized email(s) exist.',
      duplicate_count;
  end if;
end $$;

update public.vmt_submissions
set email = lower(btrim(email))
where email <> lower(btrim(email));

create unique index if not exists vmt_submissions_email_unique_idx
  on public.vmt_submissions (lower(btrim(email)));
