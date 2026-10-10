begin;
create table public.book_launch_subscribers (
  id uuid primary key default gen_random_uuid(),
  email text not null unique check (email = lower(btrim(email)) and length(email) between 3 and 254),
  created_at timestamptz not null default now(),
  consent_at timestamptz not null,
  consent_version text not null,
  source_page text not null check (length(source_page) <= 100),
  source_placement text not null check (source_placement in ('homepage', 'menu')),
  referrer_domain text check (length(referrer_domain) <= 253),
  utm_source text check (length(utm_source) <= 64),
  utm_medium text check (length(utm_medium) <= 64),
  utm_campaign text check (length(utm_campaign) <= 64),
  country text check (country ~ '^[A-Z]{2}$'),
  status text not null default 'active' check (status in ('active', 'suppressed', 'notified')),
  notification_sent_at timestamptz
);
alter table public.book_launch_subscribers enable row level security;
revoke all on public.book_launch_subscribers from public, anon, authenticated;
grant select, insert, update, delete on public.book_launch_subscribers to service_role;
create index book_launch_subscribers_created_at_idx on public.book_launch_subscribers (created_at desc, id);

-- Ten-minute keyed network buckets are never linked to subscribers. No raw IP,
-- browser fingerprint, analytics ID, or long-lived visitor ID is stored.
create table public.book_launch_rate_limits (
  bucket text primary key check (bucket ~ '^[a-f0-9]{64}$'),
  attempts integer not null,
  expires_at timestamptz not null
);
alter table public.book_launch_rate_limits enable row level security;
revoke all on public.book_launch_rate_limits from public, anon, authenticated;
grant select, insert, update, delete on public.book_launch_rate_limits to service_role;
create index book_launch_rate_limits_expiry_idx on public.book_launch_rate_limits (expires_at);
create function public.book_launch_check_limit(p_bucket text) returns boolean
language plpgsql security invoker set search_path = '' as $$
declare hits integer;
begin
  delete from public.book_launch_rate_limits where expires_at < now();
  insert into public.book_launch_rate_limits (bucket, attempts, expires_at)
    values (p_bucket, 1, now() + interval '10 minutes')
    on conflict (bucket) do update set attempts = public.book_launch_rate_limits.attempts + 1
    returning attempts into hits;
  return hits <= 6;
end;
$$;
revoke all on function public.book_launch_check_limit(text) from public, anon, authenticated;
grant execute on function public.book_launch_check_limit(text) to service_role;
-- Existing pg_cron is used if installed; otherwise lazy cleanup above applies.
-- Do not install a new extension or change unrelated scheduled jobs.
do $do$ begin
  if exists (select 1 from pg_extension where extname = 'pg_cron') then
    perform cron.schedule('book-launch-rate-limit-cleanup', '*/10 * * * *',
      'delete from public.book_launch_rate_limits where expires_at < now()');
  end if;
end $do$;
commit;
