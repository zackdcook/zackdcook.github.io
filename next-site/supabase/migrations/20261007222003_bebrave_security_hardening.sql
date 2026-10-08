revoke execute on function public.rls_auto_enable() from public, anon, authenticated;
create index if not exists bebrave_cache_redemptions_visitor_idx on public.bebrave_cache_redemptions(visitor_id);
create index if not exists bebrave_sessions_cache_code_idx on public.bebrave_sessions(cache_code_id);
