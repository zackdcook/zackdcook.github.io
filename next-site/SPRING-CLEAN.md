# Spring clean — October 2026

This branch removes retired Living Cypress/guestbook, Spotify, Commonplace/Inspo, design-preview, archived source copies, signature-font infrastructure, unused social SVGs, and unused image experiments.

## Styling
`app/theme.css` is now the palette/semantic-role layer. Palette primitives (`--tone-dark-neutral`, `--tone-dark-color`, `--tone-medium-neutral`, `--tone-medium-color`, `--tone-light-neutral`, `--tone-light-color`, `--tone-white`) map into component roles. The living and felled timelines redefine primitives/roles rather than patching individual components.

`app/bebrave.css` is the sole Be Brave stylesheet. `app/motion.css` owns shared route motion/preferences.

## Database history
The retired Living Cypress SQL is preserved under `supabase/legacy/` for reference and is no longer in the active migration path. Be Brave remains under `supabase/drafts/` until a deliberate migration workflow is established.
