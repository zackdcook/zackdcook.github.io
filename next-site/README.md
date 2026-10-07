# zackdcook.com

Personal author/engineer site built with Next.js App Router and deployed on Vercel. Supabase backs interactive features including journal conversations and the anonymous **Be Brave** communal cypress.

## Local development

```bash
npm ci
npm run dev
```

Useful checks before merging:

```bash
npm run typecheck
npm test
npm run build
```

## Where things live

- `content/` — editable site copy, projects, progress, navigation, shoutouts, and Words of Folly data.
- `app/theme.css` — palette primitives and semantic color roles for living/felled + light/dark combinations.
- `app/materials.css` — shared tactile material/lighting treatment.
- `app/motion.css` — route transitions, preferences, and shared motion behavior.
- `app/folly.css` — Words of Folly leaf/pile/reader presentation.
- `app/bebrave.css` — the complete Be Brave visual layer.
- `components/bebrave-*` and `app/api/bebrave/` — Be Brave client/server implementation.
- `supabase/drafts/bebrave_schema.sql` — current Be Brave database schema draft.
- `supabase/legacy/` — retired database history, kept only for reference.

## Be Brave secrets

Production requires the Supabase server key, Turnstile keys, and long-lived Be Brave HMAC keys documented in `.env.example`. Never commit their values. Rotating HMAC keys after launch changes the hashes used for anonymous identity/cache-code validation.

## Deployment workflow

Do feature work on a branch, let Vercel create a Preview deployment, test it, then merge into `main`. `main` is the production branch. The October 2026 cleanup intentionally removed the retired `/tree` and `/guestbook` implementations rather than preserving redirects.

See `SPRING-CLEAN.md` for the cleanup record and `docs/editing.md` for ordinary content edits.
