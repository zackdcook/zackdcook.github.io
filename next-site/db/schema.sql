-- Draft schema for a NEW, dedicated project. Not applied to a cloud database.
begin;
create schema if not exists private;

create table public.site_admins (
  id text primary key default 'owner' check (id = 'owner'),
  user_id uuid not null unique references auth.users(id) on delete cascade
);
alter table public.site_admins enable row level security;
revoke all on public.site_admins from anon, authenticated;
grant all on public.site_admins to service_role;

-- A narrow internal lookup. Caller cannot choose a different user ID.
create function private.is_site_owner() returns boolean language sql stable
security definer set search_path = '' as $$
  select auth.uid() is not null and exists (
    select 1 from public.site_admins where user_id = auth.uid()
  );
$$;
revoke all on function private.is_site_owner() from public;
grant usage on schema private to anon, authenticated;
grant execute on function private.is_site_owner() to anon, authenticated;

create table public.commonplace_entries (
  id uuid primary key default gen_random_uuid(),
  created_by uuid not null references auth.users(id) on delete cascade,
  title text not null check (char_length(title) between 1 and 160),
  note text not null default '' check (char_length(note) <= 2000),
  source_url text not null check (source_url ~ '^https://' and char_length(source_url) <= 2048),
  creator text check (char_length(creator) <= 120),
  image_url text,
  category text not null check (category in ('inspiration', 'reading', 'music', 'life')),
  status text not null default 'published' check (status in ('draft', 'published')),
  created_at timestamptz not null default now()
);
alter table public.commonplace_entries enable row level security;
grant select on public.commonplace_entries to anon, authenticated;
grant insert, update, delete on public.commonplace_entries to authenticated;
grant all on public.commonplace_entries to service_role;
create policy "published or owner" on public.commonplace_entries for select to anon, authenticated
using (status = 'published' or (select private.is_site_owner()));
create policy "owner adds entries" on public.commonplace_entries for insert to authenticated
with check ((select private.is_site_owner()) and created_by = (select auth.uid()));
create policy "owner edits entries" on public.commonplace_entries for update to authenticated
using ((select private.is_site_owner())) with check ((select private.is_site_owner()) and created_by = (select auth.uid()));
create policy "owner removes entries" on public.commonplace_entries for delete to authenticated
using ((select private.is_site_owner()));
create index commonplace_published_date on public.commonplace_entries (created_at desc) where status = 'published';
create index commonplace_author on public.commonplace_entries (created_by);

create table public.integration_tokens (
  id text primary key check (id = 'spotify'),
  sealed text not null check (char_length(sealed) between 10 and 10000),
  updated_at timestamptz not null default now()
);
alter table public.integration_tokens enable row level security;
revoke all on public.integration_tokens from anon, authenticated;
grant all on public.integration_tokens to service_role;
commit;
