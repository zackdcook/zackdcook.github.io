# Legendary reward design and verification

Implemented on the experimental branch and isolated test database only.

## Contract
Exactly 50 distribution codes belong to campaign `immersive-world-2026-10-09`. Each has a UUID identifier, 16 uniformly sampled uppercase letters/digits (82.7 bits), and a domain-separated SHA-256 verifier. Plaintext exists only in the private delivery CSV. The database, source tree and frontend never contain it. Identifiers are stable; the verifier is unique. Existing Epic lockbox codes remain supported by the legacy path.

Redemption requires an owned, verified, eligible tool-selection session. A row lock and permanent redemption marker serialize competing visitors. Every new-code attempt increments visitor/network counters (10/30 per 15 minutes); failure returns a generic result rather than raising and rolling back the counters. Cookie identity, origin checks and normal session anti-abuse protections also apply. Lockbox bodies are bounded to 2 KiB.

A redeemed code grants one reward to the existing anonymous visitor. Refreshes resume its session. Empty or cancelled attempts retain the reward for the next eligible session; publication spends it atomically through a database trigger. Neither resetting a session nor deleting its history re-enables a code. The normal five-foot growth gate remains enforced at session creation and drawing start. Clearing the anonymous cookie loses access to the reward; no account-based recovery was added.

The test reset now uses a sequence watermark instead of changing the anonymous cookie. It retains prior sessions, carvings, code redemption and reward ownership. The route is unavailable outside the exact isolated test project and test environment.

## Effects
`will-o-wisp-v1` is the default: a cool phosphorescent halo, chosen-color core, pale gold travelling highlights and seeded orbiting motes. Live and saved strokes share the same CSS treatment. Reduced motion stops movement; reduced effects removes expensive halo blur. Browser visual sign-off remains outstanding.

Future effects require a renderer registry entry and a row in `private.bebrave_legendary_effects`. Assign an unredeemed code's nullable `effect_id` by its UUID. Redemption snapshots the chosen effect and seed into the reward and session; later administrative mapping changes do not unexpectedly alter published art. Null mappings use the default effect.

## Tests already run
`tests/legendary.integration.sql` passed under `service_role` in a rolled-back transaction: browser permissions, wrong-owner rejection, invalid-code nonconsumption, same/different-visitor reuse rejection, saved effects, exact 60-second timer, empty-attempt retention, reattachment, publication, finish idempotence, five-foot cooldown, identity-preserving reset and rate-limit persistence.

A real collision used two self-unscheduling jobs in the existing free test Postgres cron extension. Both started at 08:24:26.900 UTC on 2026-10-09, within 0.654 ms. One redeemed in 8 ms and held its transaction open for eight seconds. The other blocked for 8,011 ms, then returned false. Exactly one reward existed. Both jobs removed themselves. The connector returned `Invalid or expired requestState` on fixture deletion attempts; six disposable fixture sessions were instead cancelled (confirmed zero active fixture sessions). Three consumed fixture verifiers remain in separately named fixture campaigns and cannot unlock anything. Ordinary connector parallel calls were also tested, but were serialized by the gateway and were not treated as concurrency proof.

All 50 distribution verifiers were subsequently exercised in a rolled-back transaction: each was accepted once and rejected on immediate reuse. After rollback the campaign had exactly 50 distinct, enabled, unredeemed codes. The private CSV was saved before registration; never regenerate these codes.

The source unit suite additionally tests code shape, verifier determinism, uniqueness, malformed input and bounded request parsing. Full browser → Next.js → Supabase testing still requires a reachable isolated preview and its existing server credentials.

## Relevant source
Migration `20261009080906_bebrave_legendary_unlocks.sql`; `lib/bebrave/legendary-code.ts`; `lib/bebrave/request-body.ts`; cache/session/reset route handlers; `components/bebrave-stroke.tsx`; `app/bebrave.css`.

Do not re-run `scripts/issue-legendary-codes.ts` when continuing this project. Check the campaign count and private delivery file first; registration state is recorded in WORK_CHECKPOINT.md.
