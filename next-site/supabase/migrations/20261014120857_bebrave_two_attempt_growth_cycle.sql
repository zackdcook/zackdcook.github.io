-- Limit new independent attempts to TWO per fixed five-foot growth cycle.
-- Existing stored windows/roots remain intact so earlier blank attempts can retry.
-- The original max-four storage constraint remains compatible with prior TEST rows;
-- service-only starts are limited to two by the atomic participation gate below.
create or replace function private.bebrave_participation_gate(p_network text,p_kind text,p_height bigint,p_root uuid default null)
returns jsonb language plpgsql security invoker set search_path='' as $$
declare recent integer; daily integer; w private.bebrave_network_windows; next_time timestamptz; now_at timestamptz:=clock_timestamp();
begin
  if p_kind='identity' then
    select count(*) filter(where created_at>now_at-interval '10 minutes'),count(*)
      into recent,daily from private.bebrave_participation_events
      where network_hash=p_network and kind='identity' and created_at>now_at-interval '24 hours';
    if recent>=4 or daily>=6 then
      select min(created_at)+case when daily>=6 then interval '24 hours' else interval '10 minutes' end into next_time
        from private.bebrave_participation_events where network_hash=p_network and kind='identity'
        and created_at>now_at-case when daily>=6 then interval '24 hours' else interval '10 minutes' end;
      return jsonb_build_object('error','participation_limit','retry_seconds',ceil(extract(epoch from next_time-now_at)));
    end if;
  else
    select count(*) filter(where created_at>now_at-interval '15 minutes'),count(*)
      into recent,daily from private.bebrave_participation_events
      where network_hash=p_network and kind='start' and created_at>now_at-interval '24 hours';
    if recent>=6 or daily>=12 then
      select min(created_at)+case when daily>=12 then interval '24 hours' else interval '15 minutes' end into next_time
        from private.bebrave_participation_events where network_hash=p_network and kind='start'
        and created_at>now_at-case when daily>=12 then interval '24 hours' else interval '15 minutes' end;
      return jsonb_build_object('error','participation_limit','retry_seconds',ceil(extract(epoch from next_time-now_at)));
    end if;
  end if;
  -- Two independent attempts cannot alone grow the tree five feet and refill
  -- their own allowance. A retry of the SAME blank attempt uses the same root.
  select * into w from private.bebrave_network_windows where network_hash=p_network and expires_at>now_at;
  -- A fixed cycle anchor is essential: a sliding per-start height window could
  -- release one old slot after each new carving and let one network self-refill.
  if found and p_height<w.anchor_height+1440 and cardinality(w.attempt_roots)>=2
    and (p_root is null or not p_root=any(w.attempt_roots)) then
    return jsonb_build_object('error','network_growth','growth_feet_remaining',ceil((w.anchor_height+1440-p_height)/288.0),'retry_seconds',600);
  end if;
  return null;
end;
$$;
