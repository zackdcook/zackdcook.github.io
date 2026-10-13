-- Additive effect metadata. Code verifiers and redemption history are untouched.
alter table private.bebrave_legendary_effects add column if not exists description text;
update private.bebrave_legendary_effects
set description='Luminous carving with orbiting will-o-wisp lights and faceted glints.'
where id='will-o-wisp-v1' and description is null;
insert into private.bebrave_legendary_effects(id,description) values
  ('hearts-v1','Enchanted aura with glowing heart particles that lift, flutter, and softly fade.'),
  ('rainbow-v1','A flowing rainbow carving and aura with prismatic motes and sparkling energy trails.'),
  ('blood-v1','Crimson red strokes with a pulsing black aura and falling dark red blood droplets.')
on conflict(id) do update set description=excluded.description;
alter table private.bebrave_legendary_effects alter column description set not null;
comment on column private.bebrave_legendary_effects.description is
  'Human-readable appearance of the versioned effect assigned to each private Legendary code.';
