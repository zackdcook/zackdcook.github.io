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

create table public.journal_comments (
  id uuid primary key default gen_random_uuid(),
  post_slug text not null,
  user_id uuid not null references auth.users(id) on delete cascade,
  display_name text not null check (char_length(display_name) between 1 and 100),
  body text not null check (char_length(btrim(body)) between 1 and 2000),
  status text not null default 'pending' check (status in ('pending', 'published')),
  created_at timestamptz not null default now()
);
alter table public.journal_comments enable row level security;
grant select, insert, update, delete on public.journal_comments to authenticated;
grant all on public.journal_comments to service_role;
create policy "published, own, or owner comments" on public.journal_comments for select to authenticated
using (status = 'published' or user_id = (select auth.uid()) or (select private.is_site_owner()));
create policy "readers submit pending comments" on public.journal_comments for insert to authenticated
with check (user_id = (select auth.uid()) and status = 'pending' and coalesce((auth.jwt()->>'is_anonymous')::boolean, false) = false);
create policy "owner moderates" on public.journal_comments for update to authenticated
using ((select private.is_site_owner())) with check ((select private.is_site_owner()));
create policy "owner or author removes" on public.journal_comments for delete to authenticated
using ((select private.is_site_owner()) or user_id = (select auth.uid()));
create index journal_comments_post_date on public.journal_comments (post_slug, status, created_at);
create index journal_comments_user_date on public.journal_comments (user_id, created_at);
create index journal_comments_pending_date on public.journal_comments (created_at) where status = 'pending';

-- Prevent rapid comment spam, including requests sent directly to the Data API.
create function private.limit_comment_rate() returns trigger language plpgsql
security definer set search_path = '' as $$
begin
  if auth.uid() is null or new.user_id <> auth.uid() then
    raise exception 'Authenticated comment author required';
  end if;
  -- Use server time so a direct API caller cannot bypass the hourly limit.
  new.created_at := pg_catalog.now();
  perform pg_catalog.pg_advisory_xact_lock(pg_catalog.hashtextextended(new.user_id::text, 0));
  if (select count(*) from public.journal_comments where user_id = new.user_id and created_at > now() - interval '1 hour') >= 3 then
    raise exception 'Please wait before leaving another comment';
  end if;
  return new;
end;
$$;
revoke all on function private.limit_comment_rate() from public;
create trigger limit_comment_rate before insert on public.journal_comments
for each row execute function private.limit_comment_rate();

create table public.journal_likes (
  post_slug text not null,
  user_id uuid not null references auth.users(id) on delete cascade,
  created_at timestamptz not null default now(),
  primary key (post_slug, user_id)
);
create index journal_likes_user on public.journal_likes (user_id);
alter table public.journal_likes enable row level security;
grant select, insert, delete on public.journal_likes to authenticated;
grant all on public.journal_likes to service_role;
create policy "own likes" on public.journal_likes for select to authenticated using (user_id = (select auth.uid()));
create policy "reader likes" on public.journal_likes for insert to authenticated with check (user_id = (select auth.uid()) and coalesce((auth.jwt()->>'is_anonymous')::boolean, false) = false);
create policy "reader unlikes" on public.journal_likes for delete to authenticated using (user_id = (select auth.uid()));
commit;
