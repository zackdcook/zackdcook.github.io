-- Isolated experimental test DB. Original chunk rows are replaced only by a
-- CLI-created filename reconciled to the actual applied test migration ledger.
-- lossless, checksummed archive, after server-side round-trip verification.
-- Session/visitor/eligibility/reward records and all publication metadata stay.
create table public.bebrave_completed_archives (
  session_id uuid primary key references public.bebrave_sessions(id) on delete cascade,
  version smallint not null default 1 check (version=1),
  geometry_gzip bytea not null check (octet_length(geometry_gzip) between 20 and 4194304),
  source_sha256 text not null check (source_sha256 ~ '^[0-9a-f]{64}$'),
  payload_sha256 text not null check (payload_sha256 ~ '^[0-9a-f]{64}$'),
  source_bytes integer not null check (source_bytes between 1 and 8388608),
  chunk_count integer not null check (chunk_count between 1 and 320),
  point_count integer not null check (point_count between 2 and 30000),
  render_version smallint not null default 1 check (render_version=1),
  render_strokes jsonb not null check (jsonb_typeof(render_strokes)='array'),
  archived_at timestamptz not null default now()
);
alter table public.bebrave_completed_archives enable row level security;
revoke all on public.bebrave_completed_archives from public,anon,authenticated;
grant select,insert,update,delete on public.bebrave_completed_archives to service_role;

create function private.bebrave_archive_document(p_session uuid) returns text
language sql stable security invoker set search_path='' as $$
  select jsonb_build_object('version',1,'sessionId',p_session,'chunks',jsonb_agg(to_jsonb(c) order by c.id))::text
  from public.bebrave_stroke_chunks c where c.session_id=p_session
  having count(*)>0;
$$;

create function public.bebrave_archive_source(p_session uuid)
returns table(document text,source_sha256 text)
language sql stable security invoker set search_path='' as $$
  select d.document,encode(extensions.digest(convert_to(d.document,'UTF8'),'sha256'),'hex')
  from public.bebrave_sessions s
  cross join lateral (select private.bebrave_archive_document(s.id) document) d
  where s.id=p_session and s.status='completed' and s.public_sequence is not null
    and d.document is not null
    and not exists(select 1 from public.bebrave_completed_archives a where a.session_id=s.id);
$$;

create function public.bebrave_store_archive(
  p_session uuid,p_source_sha256 text,p_gzip_base64 text,p_payload_sha256 text,p_render_strokes jsonb
) returns boolean language plpgsql security invoker set search_path='' as $$
declare
  s public.bebrave_sessions;
  existing_hash text;
  source text;
  source_json jsonb;
  payload bytea;
  chunks integer;
  points integer;
  strokes integer;
begin
  select * into s from public.bebrave_sessions where id=p_session for update;
  if not found or s.status<>'completed' or s.public_sequence is null then raise exception 'archive requires completed carving'; end if;
  select source_sha256 into existing_hash from public.bebrave_completed_archives where session_id=p_session;
  if found then
    if existing_hash<>p_source_sha256 then raise exception 'archive checksum conflict'; end if;
    return true;
  end if;
  source:=private.bebrave_archive_document(p_session);
  if source is null or octet_length(source)>8388608 or p_source_sha256 is null or
     encode(extensions.digest(convert_to(source,'UTF8'),'sha256'),'hex')<>p_source_sha256 then
    raise exception 'archive source changed';
  end if;
  source_json:=source::jsonb;
  chunks:=jsonb_array_length(source_json->'chunks');
  select sum(jsonb_array_length(c->'points')),count(distinct c->>'stroke_id') into points,strokes
  from jsonb_array_elements(source_json->'chunks') c;
  if chunks<>s.chunk_count or points<>s.point_count then raise exception 'archive chunk ledger mismatch'; end if;
  if p_render_strokes is null or jsonb_typeof(p_render_strokes)<>'array' or
     jsonb_array_length(p_render_strokes)<>strokes or octet_length(p_render_strokes::text)>4194304 then
    raise exception 'invalid archive projection';
  end if;
  if (select count(distinct e->>'strokeId') from jsonb_array_elements(p_render_strokes) e)<>strokes or exists(
    select 1 from jsonb_array_elements(p_render_strokes) e
    where coalesce(jsonb_typeof(e),'')<>'object' or coalesce(jsonb_typeof(e->'geometry'),'')<>'object' or not exists(
      select 1 from public.bebrave_stroke_chunks c where c.session_id=p_session and c.stroke_id::text=e->>'strokeId' and c.stroke_order=(e->>'strokeOrder')::integer
    )
  ) then raise exception 'archive projection changed stroke identity or order'; end if;
  if p_gzip_base64 is null or length(p_gzip_base64)>5592408 then raise exception 'invalid archive payload'; end if;
  payload:=decode(p_gzip_base64,'base64');
  if substring(payload from 1 for 3)<>decode('1f8b08','hex') or p_payload_sha256 is null or
     encode(extensions.digest(payload,'sha256'),'hex')<>p_payload_sha256 then raise exception 'archive payload changed'; end if;
  insert into public.bebrave_completed_archives(session_id,geometry_gzip,source_sha256,payload_sha256,source_bytes,chunk_count,point_count,render_strokes)
  values(p_session,payload,p_source_sha256,p_payload_sha256,octet_length(source),chunks,points,p_render_strokes);
  -- Same transaction: any insert/validation/delete failure rolls back together.
  -- Original rows are recoverable byte-for-byte from the canonical container.
  delete from public.bebrave_stroke_chunks where session_id=p_session;
  return true;
end;
$$;

revoke all on function private.bebrave_archive_document(uuid),public.bebrave_archive_source(uuid),public.bebrave_store_archive(uuid,text,text,text,jsonb) from public,anon,authenticated;
grant execute on function private.bebrave_archive_document(uuid),public.bebrave_archive_source(uuid),public.bebrave_store_archive(uuid,text,text,text,jsonb) to service_role;
