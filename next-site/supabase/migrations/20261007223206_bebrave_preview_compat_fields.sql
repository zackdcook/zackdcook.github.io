alter table public.bebrave_tree_state
  add column if not exists pending_growth_carvings bigint not null default 0,
  add column if not exists last_growth_interval timestamptz not null default date_trunc('hour', now());

comment on column public.bebrave_tree_state.pending_growth_carvings is
  'Compatibility for pre-20261007 preview builds; new growth logic does not read this field.';
comment on column public.bebrave_tree_state.last_growth_interval is
  'Compatibility for pre-20261007 preview builds; hourly growth is disabled.';
