begin;
-- Additive: preserve every existing one-time subscriber and consent record.
create table public.newsletter_subscribers (
 id uuid primary key default gen_random_uuid(),
 email text not null unique check(email=lower(btrim(email)) and length(email) between 3 and 254),
 created_at timestamptz not null default now(), consent_at timestamptz not null, consent_version text not null,
 source_page text not null check(length(source_page)<=100),
 source_placement text not null check(source_placement in ('homepage','menu')),
 status text not null default 'active' check(status in ('active','unsubscribed','suppressed')), unsubscribed_at timestamptz,
 unsubscribe_token text not null unique default encode(extensions.gen_random_bytes(32),'hex')
);
alter table public.newsletter_subscribers enable row level security;
revoke all on public.newsletter_subscribers from public,anon,authenticated;
grant select,insert,update,delete on public.newsletter_subscribers to service_role;
create index newsletter_subscribers_created_idx on public.newsletter_subscribers(created_at desc);
create table public.newsletter_consent_events (
 id uuid primary key default gen_random_uuid(),
 subscriber_id uuid not null references public.newsletter_subscribers(id) on delete cascade,
 event text not null check(event in ('subscribed','unsubscribed','suppressed')),
 occurred_at timestamptz not null default now(),consent_version text not null
);
alter table public.newsletter_consent_events enable row level security;
revoke all on public.newsletter_consent_events from public,anon,authenticated;
grant select,insert,delete on public.newsletter_consent_events to service_role;
create function public.record_newsletter_consent() returns trigger language plpgsql security invoker set search_path='' as $$
begin
 if tg_op='INSERT' or old.status is distinct from new.status then
  insert into public.newsletter_consent_events(subscriber_id,event,consent_version)
  values(new.id,case new.status when 'active' then 'subscribed' else new.status end,new.consent_version);
 end if;
 return new;
end; $$;
revoke all on function public.record_newsletter_consent() from public,anon,authenticated;
grant execute on function public.record_newsletter_consent() to service_role;
create trigger newsletter_consent_history after insert or update of status on public.newsletter_subscribers for each row execute function public.record_newsletter_consent();
create function public.register_email_subscriptions(p_email text,p_book boolean,p_newsletter boolean,p_book_consent text,p_newsletter_consent text,p_metadata jsonb)
returns jsonb language plpgsql security invoker set search_path='' as $$
declare book_added integer:=0; newsletter_added integer:=0;
begin
 if (not p_book and not p_newsletter) or p_book is null or p_newsletter is null then raise exception 'A subscription must be selected'; end if;
 if p_book then
  insert into public.book_launch_subscribers(email,consent_at,consent_version,source_page,source_placement,referrer_domain,utm_source,utm_medium,utm_campaign,country)
  values(p_email,now(),p_book_consent,p_metadata->>'page',p_metadata->>'placement',p_metadata->>'referrer_domain',p_metadata->>'utm_source',p_metadata->>'utm_medium',p_metadata->>'utm_campaign',p_metadata->>'country') on conflict(email) do nothing;
  get diagnostics book_added=row_count;
 end if;
 if p_newsletter then
  insert into public.newsletter_subscribers(email,consent_at,consent_version,source_page,source_placement)
  values(p_email,now(),p_newsletter_consent,p_metadata->>'page',p_metadata->>'placement') on conflict(email) do nothing;
  get diagnostics newsletter_added=row_count;
 end if;
 return jsonb_build_object('book_added',book_added>0,'newsletter_added',newsletter_added>0);
end; $$;
revoke all on function public.register_email_subscriptions(text,boolean,boolean,text,text,jsonb) from public,anon,authenticated;
grant execute on function public.register_email_subscriptions(text,boolean,boolean,text,text,jsonb) to service_role;
-- One row per address. Regular newsletters must filter newsletter_active;
-- launch mail can select the union without duplicate recipients.
create view public.email_subscription_audience with(security_invoker=true) as
select coalesce(b.email,n.email) as email,
 coalesce(b.status='active' and b.notification_sent_at is null,false) as book_announcement_pending,
 coalesce(n.status='active',false) as newsletter_active,
 n.consent_at as newsletter_consent_at,n.status as newsletter_status,
 case when n.id is not null then 'https://zackdcook.com/newsletter/unsubscribe#'||n.unsubscribe_token end as newsletter_unsubscribe_url
from public.book_launch_subscribers b full join public.newsletter_subscribers n using(email);
revoke all on public.email_subscription_audience from public,anon,authenticated;
grant select on public.email_subscription_audience to service_role;
-- Claim each (campaign,email) before sending to prevent overlap/retry duplicates.
create table public.email_campaign_deliveries (
 campaign text not null check(length(campaign) between 1 and 100),email text not null check(email=lower(btrim(email))),
 claimed_at timestamptz not null default now(),sent_at timestamptz,primary key(campaign,email)
);
alter table public.email_campaign_deliveries enable row level security;
revoke all on public.email_campaign_deliveries from public,anon,authenticated;
grant select,insert,update,delete on public.email_campaign_deliveries to service_role;
commit;
