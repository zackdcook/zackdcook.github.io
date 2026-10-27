begin;
-- A simple owner-visible flag on the original email list. Consent and removal
-- history remain private and separate; no existing subscriber is opted in.
alter table public.book_launch_subscribers add column ongoing_newsletter boolean not null default false;
comment on column public.book_launch_subscribers.ongoing_newsletter is 'Active explicit newsletter opt-in. Synced from newsletter consent/status; false for book-only signups.';
update public.book_launch_subscribers b set ongoing_newsletter=true
where exists(select 1 from public.newsletter_subscribers n where n.email=b.email and n.status='active');

create function public.sync_newsletter_flag() returns trigger
language plpgsql security invoker set search_path='' as $$
begin
 if tg_op='DELETE' then
  update public.book_launch_subscribers set ongoing_newsletter=false where email=old.email and ongoing_newsletter;
  return old;
 end if;
 update public.book_launch_subscribers set ongoing_newsletter=(new.status='active')
 where email=new.email and ongoing_newsletter is distinct from (new.status='active');
 return new;
end; $$;
revoke all on function public.sync_newsletter_flag() from public,anon,authenticated;
grant execute on function public.sync_newsletter_flag() to service_role;
create trigger newsletter_list_flag after insert or update of status or delete on public.newsletter_subscribers
for each row execute function public.sync_newsletter_flag();
-- A legacy newsletter-only record can join the book list later. Its current
-- active consent is reflected without changing either original consent record.
create function public.initial_newsletter_flag() returns trigger
language plpgsql security invoker set search_path='' as $$
begin
 new.ongoing_newsletter:=exists(select 1 from public.newsletter_subscribers n where n.email=new.email and n.status='active');
 return new;
end; $$;
revoke all on function public.initial_newsletter_flag() from public,anon,authenticated;
grant execute on function public.initial_newsletter_flag() to service_role;
create trigger book_list_initial_newsletter_flag before insert on public.book_launch_subscribers
for each row execute function public.initial_newsletter_flag();
-- Explicit role grants make new/recreated tables independent of Supabase's
-- October 30 default-privilege change. Browser roles cannot read the email list.
grant select,insert,update,delete on public.book_launch_subscribers to service_role;
grant select,insert,update,delete on public.newsletter_subscribers to service_role;
grant select,insert,delete on public.newsletter_consent_events to service_role;
revoke all on public.book_launch_subscribers,public.newsletter_subscribers,public.newsletter_consent_events from public,anon,authenticated;
notify pgrst,'reload schema';
commit;
