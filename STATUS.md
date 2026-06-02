# FCDSA Meet 2026 — Build Status

_Last updated: end of M6 (feature expansion: media, results browse, encoder role, standings, venues, audit log, tests/CI)._

## M6 — Feature expansion ✅
Apply **`supabase/migrations/0004_features.sql`** before using these.
- **Media (Storage):** new `media` public bucket + RLS; admin `ImageUploadField`
  uploads delegation logos + athlete photos; rendered on public delegation/athlete pages.
- **Public results browse:** `/results` (grouped by sport) + `/results/[eventId]` podium (realtime).
- **Encoder role:** `is_staff()` RLS lets `encoder` write results/schedule; middleware admits
  encoders to `/admin`, `/admin/results*`, `/admin/schedule*` only; sidebar nav filtered by role; login admits staff.
- **Overall standings (points):** `standings` SQL view (gold 5 / silver 3 / bronze 1) + public `/standings`.
- **Venues:** `venues` table + admin CRUD (`/admin/venues`) + public `/venues` directory.
- **Audit-log viewer:** `/admin/audit` (admin-only) reads `audit_log` with actor email.
- **Scoring lib:** `src/lib/scoring.ts` (`medalForPlacement`, `pointsForMedals`) — shared + tested.
- **Tests + CI:** Vitest (`npm test`, 10 passing) + `.github/workflows/ci.yml` (typecheck/lint/test/build).
- **Seed:** now creates an encoder account + sample venues.

Gates: `npm run typecheck` ✓ · `npm run lint` ✓ · `npm test` ✓ (10) · `npm run build` ✓ (28 routes).

Deferred (intentional): **Hall of Records** — genuinely needs multi-year data; revisit after meet 1.

## M7 — Grouped nav + audit-driven hardening ✅
- **Grouped dropdown nav** (`site-nav.tsx`): Home + Rankings/Program/Teams/Coverage
  dropdowns (hover+click, Escape/outside-click/route close, aria-expanded);
  grouped mobile drawer. Verified in-browser (Playwright) — caught & fixed a
  hover/click-toggle race.
- **Data integrity** (`0005_integrity.sql`): partial unique indexes stop duplicate
  results without blocking ties; `addResult`/`updateResult` return a friendly 23505
  error + reject placement > 50; encode form now offers 1st–8th.
- **Stable tiebreaker**: `getTally`/`getStandings` add a secondary sort by name so
  tied delegations don't swap row order between loads.
- **Home day counter** is now derived (`getMeetDay` + `MEET_START`/`MEET_END`),
  not the old hardcoded "03"; unit-tested (TZ-aware).
- **Docs fixed**: README + this file now list migrations 0001→0005 and warn that
  seed wipes data.

Gates: typecheck ✓ · lint ✓ · test ✓ · build ✓.

### Still operator-owned (highest-value next, per the audit)
1. **Run it against real data**: apply 0001→0005, seed a fresh project, encode a
   result, confirm /tally, /standings, /results, delegation page update. The stack
   has never executed against a live Supabase.
2. Deploy to Vercel. Then enter real meet data.
SOON candidates (not yet built): venue/time on /results/[eventId]; require athlete
on individual results; login error-enumeration hardening; minimal error tracking.

---
_Prior: end of M5 (admin edit + editorial redesign)._

## Stack (locked)
Next.js 14.2.35 (App Router) · TypeScript · Supabase (Postgres + Auth + Storage
+ RLS + Realtime) · Tailwind + shadcn/ui-style components. No NestJS, no Redis,
no custom socket server.

## Verification model
- **Code gate** (typecheck + lint + build) — run here, green at every milestone.
- **Smoke gate** — `npm run smoke` boots the production server and asserts all key
  routes respond (runs WITHOUT Supabase env; pages degrade gracefully). ✓ Passing.
- **Runtime-with-data gate** (login + populated pages) — runs against a **remote
  Supabase project**; operator provides credentials and runs the steps below.
  These results are NOT fabricated here.

## One-time remote setup (operator)
1. Create a project at supabase.com.
2. `cp .env.example .env.local` and fill `NEXT_PUBLIC_SUPABASE_URL`,
   `NEXT_PUBLIC_SUPABASE_ANON_KEY`, `SUPABASE_SERVICE_ROLE_KEY`,
   `NEXT_PUBLIC_SITE_URL` (Dashboard → Project Settings → API).
3. Apply migrations in order via Dashboard → SQL Editor: `0001_init.sql`,
   `0002_rls.sql`, `0003_audit_triggers.sql`, **`0004_features.sql`**,
   **`0005_integrity.sql`**. (Skipping 0004 silently breaks encoder role,
   /standings, /venues, and uploads.)
4. `npm install` → `npm run seed` (creates admin + encoder users + sample data).
   ⚠️ seed WIPES domain tables — fresh project only, never live prod.
5. `npm run dev` → log in at `/admin/login` with the seed admin credentials.

---

## Milestones — all complete ✅

### M1 — Foundation ✅
Scaffold, pinned deps, `.env.example`. Full schema + migrations (profiles/roles,
delegations, schools, athletes, sports, categories, events, schedules, results,
**medal_tally view (derived)**, announcements, livestreams, audit_log). RLS
(public-read / admin-write via `public.is_admin()`). Audit triggers. Email/password
auth, admin gate (middleware + layout). Seed script. Code gate ✓.

### M2 — Admin core ✅
Results **encoding** flow (`/admin/results` → `/admin/results/[eventId]`: add/delete
podium results, medal auto-derived from placement). Medal tally surfaced on the
dashboard, **auto-derived from results** (SQL view). Full CRUD: delegations,
athletes, schedule (with inline status), announcements, livestreams. Every mutation
calls `revalidatePublic()`. Code gate ✓.

### M3 — Public site ✅
Home (live tally preview + announcements + LIVE banner), `/tally` (Realtime +
revalidation), `/schedule` (by day, sport filter), `/delegations` + `[slug]`
(roster + medals), `/athletes` + `[id]` (search + results), `/announcements`,
`/livestream` (embeds). Pages read real data and degrade gracefully when the
backend is unreachable (no 500s). Code gate ✓ · Smoke ✓.

### M4 — Polish ✅
Search (athletes), filter (schedule by sport), responsive (mobile nav + grids),
SEO (per-page metadata, `sitemap.ts`, `robots.ts`, OG tags), loading skeletons
(`loading.tsx` for tally/schedule/delegations/athletes/admin), `not-found`,
**smoke test** (`scripts/smoke.ts`), deploy config (`vercel.json`, `README.md`).
Code gate ✓ · Smoke ✓ (12/12 routes).

### M5 — Admin edit + editorial redesign ✅
Brainstormed first (`docs/plans/2026-05-31-admin-edit-and-editorial-redesign-design.md`).
- **New admin CRUD**: `sports`, `categories`, `events` (list + create + `[id]/edit`),
  added to `ADMIN_NAV`. Makes admin self-sufficient (no longer seed-only).
- **Edit for all entities**: `update…` actions + `[id]/edit` pages for delegations,
  athletes, schedule, announcements, livestreams; **results** edited inline on the
  event page via `?edit=<id>`. FK-in-use/duplicate deletes return friendly errors.
- **Editorial redesign** of the whole admin surface: ink `AdminSidebar`, `PageHeader`
  mastheads, `admin-ui.tsx` primitives (`FormCard`/`Field`/`AdminTable`/`ADMIN_CONTROL`),
  shared `<entity>-fields.tsx` for create+edit, editorial `EntityForm` submit.
- Reuses the public `PageHeader`/`MedalTag`; palette now lives in `tailwind.config.ts`.
Code gate ✓ · Smoke ✓ (12/12 routes).

---

## Final gate results
- `npm run typecheck` → ✓ clean
- `npm run lint` → ✓ No issues
- `npm run build` → ✓ 33 routes compiled (incl. 8 admin edit pages + sports/categories/events)
- `npm run smoke` → ✓ 12/12 routes (public 200, `/admin`→307 login, 404 works)

## Realtime model
Public tally subscribes to `results` changes via **Supabase Realtime**
(`RealtimeRefresher`) + `revalidate = 30/60` time fallback + on-demand
`revalidatePath` from admin mutations. No socket server.

## Known notes / intentional choices
- **No data-with-env runtime test performed here** — needs the operator's remote
  Supabase project (local Supabase was declined to save RAM). Follow the setup
  steps above; the seed makes every flow testable without manual entry.
- Placeholder Supabase fallback in `src/lib/env.ts` keeps the app from crashing
  pre-config; real env always takes precedence.
- Smoke test emits a Node `shell:true` deprecation warning (harmless).

## Resume / next steps (if extending)
- Run the remote setup, then verify: encode a result in `/admin/results/[id]` →
  confirm `/tally` and the delegation page reflect it.
- Excluded by scope (do not add): QR accreditation, weather advisories, billeting,
  PWA/offline, push notifications, PDF/Excel export.
