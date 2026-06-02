# Admin Edit + Editorial Redesign — Design

_Date: 2026-05-31_

## Context
The public site was redesigned into the "Meet Bulletin" editorial system
(ink/bone/gold palette, `PageHeader` + `MedalTag`, display/editorial/mono fonts).
Admin (`/admin/*`) was left on the original shadcn card look and supports only
create + delete (plus publish/status toggles). This increment makes admin
**(a)** visually consistent with the public design and **(b)** functionally
complete: full edit, and management of sports/categories/events that currently
only come from the seed script.

## Decisions (from brainstorming)
- Admin gets the **full editorial treatment** (PageHeader mastheads + editorial tables), not a compact console.
- Editing uses **dedicated edit pages** per item (`/admin/<entity>/[id]/edit`); **results** are edited in place on the event page.
- **Add sports, categories, events** management (create/edit/delete), so admin is self-sufficient.

## Scope
1. **New CRUD sections**: `sports`, `categories`, `events` — list + create + `[id]/edit`, each with `actions.ts`. Added to `ADMIN_NAV`.
2. **Edit for existing**: delegations, athletes, schedule, announcements, livestreams — `[id]/edit` page + `update…` action.
3. **Results edit**: inline edit mode on `results/[eventId]` reusing the encode form.
4. **Editorial redesign** of every admin page + the dashboard shell (sidebar/layout).

## Architecture
- Reuse the public `PageHeader` (prop-driven) as the masthead on each admin page.
- New `src/components/admin/admin-ui.tsx` editorial primitives: `FormCard`, `Field` (mono-data label + control), `AdminTable` + `Th`/`Td` (ink header, hairline rows — mirrors `TallyTable`), `RowActions`.
- Extend `EntityForm` with an optional `redirectTo` (edit pages redirect to the list on success; `resetOnSuccess={false}`).
- Per entity, a shared `<Entity>Fields` markup component used by both create and edit pages (no duplicate inputs).

## Data layer
- One `update<Entity>(id, formData)` per entity, mirroring its create action: same validation, `.update().eq("id", id)`, then `revalidatePath` + `revalidatePublic()`. Slugs (delegations, sports) re-derived from name.
- New-entity constraints surfaced as friendly `ActionResult` errors: FK-in-use on delete (sport→events, etc.), and the `unique(level, gender)` on categories.
- Events form: sport + category selects (FKs), name, type. Edit can reassign.
- No schema migration — `database.types.ts` already covers all tables.

## Conventions kept
Path alias `@/*`; `"use server"` actions returning `ActionResult`; `EntityForm`
wrapper for create/edit; `DeleteButton action={fn.bind(null, id)}`; embedded
selects cast `as unknown as T[]`; revalidate after every mutation.

## Verification
`npm run typecheck` + `npm run lint` + `npm run build` must stay green; then
`npm run build && npm run smoke` (all routes respond; new `/admin/*` routes
redirect to login when unauthenticated). Runtime-with-data verification remains
operator-run against remote Supabase (no local env here).
