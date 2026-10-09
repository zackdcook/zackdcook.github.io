-- Range indexing makes historical viewport lookup independent of total tree height.
-- Filename reconciled to the isolated test database's applied migration ledger.
-- Raw chunks remain the canonical, backward-compatible source at this milestone.
create index bebrave_completed_zone_gist_idx on public.bebrave_sessions
using gist (int8range(zone_top,zone_bottom,'[)'))
where status='completed' and public_sequence is not null;

create function public.bebrave_completed_in_section(p_section integer,p_before bigint default null,p_cutoff bigint default null)
returns table(id uuid,public_sequence bigint,chosen_rarity text,chosen_color text,effect_seed integer,chosen_effect text,zone_top bigint,zone_bottom bigint)
language sql stable security invoker set search_path='' as $$
 select s.id,s.public_sequence,s.chosen_rarity,s.chosen_color,s.effect_seed,s.chosen_effect,s.zone_top,s.zone_bottom
 from public.bebrave_sessions s
 where p_section between 0 and 1000000
   and s.status='completed' and s.public_sequence is not null
   and int8range(s.zone_top,s.zone_bottom,'[)') && int8range(p_section::bigint*864,(p_section::bigint+1)*864,'[)')
   and (p_before is null or s.public_sequence<p_before)
   and (p_cutoff is null or s.public_sequence<=p_cutoff)
 order by s.public_sequence desc limit 12;
$$;
revoke all on function public.bebrave_completed_in_section(integer,bigint,bigint) from public,anon,authenticated;
grant execute on function public.bebrave_completed_in_section(integer,bigint,bigint) to service_role;
