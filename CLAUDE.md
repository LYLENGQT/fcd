# CLAUDE.md — FCDSA Meet 2026

## Project overview
Public website + admin for the First Congressional District Sports Association
Meet 2026 (Philippines). Public site shows live medal tally, schedule, delegation
& athlete pages, announcements, and livestream embeds; admin encodes results
(which auto-derive the tally), and manages schedule/delegations/athletes/
announcements/livestreams. Single Next.js app backed by Supabase.

## Tech stack (versions pinned in package.json)
- Next.js 14.2.35 (App Router) · React 18.3.1 · TypeScript 5.6.2 (strict)
- Supabase: @supabase/ssr 0.5.2, @supabase/supabase-js 2.45.4 (Postgres, Auth, RLS, Realtime)
- Tailwind 3.4.13 + tailwindcss-animate 1.0.7; cva 0.7.0, clsx 2.1.1, tailwind-merge 2.5.2; lucide-react 0.445.0
- Fonts via `next/font/google` in `src/app/layout.tsx`: Big Shoulders Display, Fraunces, JetBrains Mono, Manrope
- Tooling: tsx 4.19.1, dotenv 16.4.5, eslint 8.57.1 + eslint-config-next 14.2.35, vitest 2.1.9
- CI: `.github/workflows/ci.yml` (typecheck → lint → test → build). No Dockerfile. Verification = typecheck + lint + test + build + smoke.

## Commands
```bash
npm install            # install deps
npm run dev            # dev server (localhost:3000)
npm run build          # production build
npm run start          # serve built app
npm run lint           # eslint (next lint)
npm run typecheck      # tsc --noEmit
npm test               # vitest run (unit tests for src/lib pure helpers)
npm run seed           # create admin + encoder users + sample data (needs SUPABASE_SERVICE_ROLE_KEY)
npm run build && npm run smoke   # boot prod server, assert key routes respond (smoke needs a build first)
```
DB migrations: apply `supabase/migrations/0001_init.sql`, `0002_rls.sql`,
`0003_audit_triggers.sql`, `0004_features.sql` (in order) via Supabase SQL Editor before seeding.

## Architecture
- `src/app/(public)/` — public pages; share `(public)/layout.tsx` (SiteHeader/SiteFooter).
  Pages: `tally`, `standings`, `schedule`, `results` + `results/[eventId]`, `delegations` + `[slug]`, `athletes` + `[id]`, `venues`, `announcements`, `livestream`; home is `(public)/page.tsx`.
- `src/app/admin/login/` — login page + `actions.ts` (login/logout). Outside the dashboard shell.
- `src/app/admin/(dashboard)/` — admin shell `layout.tsx` (server-side admin guard + `AdminSidebar`), full editorial look (ink sidebar + `PageHeader` mastheads).
  Sections: `results` + `results/[eventId]` (encoding; inline edit via `?edit=<resultId>`), `schedule`, `sports`, `categories`, `events`, `venues`, `delegations`, `athletes`, `announcements`, `livestreams`, `audit` (read-only log viewer, admin-only). Each CRUD section has its own `actions.ts` with `create…`/`update…`/`delete…`. All except `results`/`audit` have an `[id]/edit/page.tsx` and a shared `<entity>-fields.tsx`.
- `src/lib/supabase/` — `client.ts` (browser), `server.ts` (RSC/actions, cookie session), `admin.ts` (service-role, server-only), `middleware.ts` (session refresh + `/admin` gate).
- `src/middleware.ts` — runs `updateSession`; redirects unauthenticated/non-admin off `/admin`.
- `src/lib/` — `auth.ts` (`getCurrentProfile`/`isAdmin`), `queries.ts` (`getTally`, `getStandings`), `scoring.ts` (`medalForPlacement`, `pointsForMedals`/`MEDAL_POINTS` — mirror the `standings` SQL points), `revalidate.ts` (`revalidatePublic`), `env.ts`, `constants.ts` (nav, page sizes, meet names), `utils.ts` (`cn`, `slugify`, PH date formatters, `isoToInputValue`, `parsePage`/`pageRange`), `database.types.ts` (hand-maintained). Pure helpers are unit-tested in `src/lib/__tests__/`.
- `src/components/ui/` — shadcn-style primitives (button, card, table, input, select, badge, skeleton…). `src/components/admin/` — `EntityForm` (create+edit; pass `redirectTo` for edit), `DeleteButton`, `AdminSidebar`, `admin-ui.tsx` (editorial `AdminSection`/`FormCard`/`Field`/`AdminTable`/`Th`/`Td`/`Tr`/`ListHeading` + `ADMIN_CONTROL` input class), `image-upload-field.tsx` (client upload to the `media` Storage bucket → hidden URL input). Shared editorial: `page-header.tsx` (`PageHeader`+`BackLink`, reused by public AND admin), `medals.tsx` (`MedalTag`/`MedalCounts`), `tally-table`, `realtime-refresher`, `site-header`, `site-footer`, `env-notice`.
- `supabase/migrations/` — schema, RLS, audit triggers. `scripts/` — `seed.ts`, `smoke.ts`.

Data model: `results` is the hub (event + delegation + optional athlete + medal).
`medal_tally` and `standings` are **derived SQL views** (never written) —
`medal_tally` = medal counts/rank; `standings` = championship points (gold 5 /
silver 3 / bronze 1) + rank. `venues` is a standalone directory (not FK-linked
to schedules; schedule `venue` is still free text). `profiles` is 1:1 with
`auth.users` (role enum: admin/encoder/viewer); a trigger auto-creates a profile
on signup. Audit triggers log mutations to `audit_log`. Logos/photos live in the
public `media` Storage bucket; `delegations.logo_url` / `athletes.photo_url` hold URLs.

## Conventions
- Path alias `@/*` → `src/*`. Strings double-quoted, 2-space indent, TS strict.
- Reads: Server Components call `createClient()` from `@/lib/supabase/server`. Joined/embedded selects are cast `as unknown as T[]` (PostgREST nested types).
- Writes: per-route `actions.ts` with `"use server"`, returning `ActionResult` = `{ ok: true } | { ok: false; error: string }`. After any mutation, call `revalidatePublic()` and/or `revalidatePath(...)`.
- Admin forms: define inputs once in a `<entity>-fields.tsx` (takes optional `<entity>` for prefill) used by both create and `[id]/edit` pages. Wrap in `<EntityForm action={serverAction}>` for create; edit pages use `<EntityForm action={updateFn.bind(null, id)} resetOnSuccess={false} redirectTo="/admin/<entity>">`. Deletes: `<DeleteButton action={deleteFn.bind(null, id)} />`. FK-in-use deletes return a friendly error on Postgres code `23503` (categories dup → `23505`).
- Auth gate is enforced twice: middleware (`/admin`) **and** the dashboard `layout.tsx` (`getCurrentProfile`). RLS uses `public.is_admin()` (setup tables, admin-only) and `public.is_staff()` (admin OR encoder → results + schedules + Storage). **Encoders** are admitted only to `/admin`, `/admin/results*`, `/admin/schedule*` (middleware); the sidebar filters nav by role.
- Realtime tally: `<RealtimeRefresher table="results" />` subscribes to changes → `router.refresh()`; pages also set `export const revalidate = 30|60` as fallback. No socket server.
- Editorial design system: palette CSS vars (`--ink --bone --bone-2 --gold --gold-deep --crimson --jade`) are defined in `globals.css` AND **registered as Tailwind colors in `tailwind.config.ts`** — so `bg-ink`, `text-bone`, `text-gold`, `border-bone/15`, etc. work as normal Tailwind classes (opacity modifiers included). Hand-written effect utilities still live in `globals.css`: `font-display`, `font-editorial`, `font-mono-data`, `grain`, `spotlight`, `rise`, `pulse-dot`, `num-outline`, `spin-slow`, `animate-marquee`. Fonts via `next/font/google` in `layout.tsx`.

## Gotchas
- **Required env** (`.env.local`, see `.env.example`): `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY`, `SUPABASE_SERVICE_ROLE_KEY`, `NEXT_PUBLIC_SITE_URL`.
- `env.ts` falls back to a placeholder Supabase URL when env is unset so the app won't crash; pages then **fail soft to empty data**. So a blank/empty site almost always means missing or wrong env, not a code bug.
- Apply migrations to the Supabase project **before** `npm run seed`; seed uses the service-role key and wipes domain tables before inserting.
- Never insert/update `medal_tally` or `standings` — they're views; encode `results` instead.
- `standings` points scheme (5/3/1) is duplicated in SQL (`0004`) and `src/lib/scoring.ts` (`MEDAL_POINTS`) — change BOTH together or they drift (a test asserts the JS values).
- Storage: migration `0004` creates the public `media` bucket + RLS (public read, staff write). `next.config.mjs` allows `*.supabase.co` image hosts.
- `database.types.ts` is hand-maintained — keep it in sync when changing migrations.
- `supabase/config.toml` + `supabase/.temp` exist from `supabase init`, but the project uses a **remote** Supabase (local stack intentionally not used).
- Schedule `start_at` round-trips via `isoToInputValue` (formats in UTC) because the create/update actions do `new Date(input).toISOString()` on a UTC server; keep both sides in UTC or times will shift.
- `sports`/`categories`/`events` are admin-managed (not seed-only); `events` requires at least one sport + category to exist first.
