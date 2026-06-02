# FCDSA Meet 2026 Platform

Public website + admin for the **First Congressional District Sports Association
Meet 2026**. Live medal tally, schedules, results encoding, delegation & athlete
pages, announcements, and livestream embeds.

## Stack
- **Next.js 14 (App Router) + TypeScript**
- **Supabase** — Postgres, Auth, Storage, RLS, Realtime
- **Tailwind CSS** + shadcn/ui-style components

## Local development

```bash
npm install
cp .env.example .env.local      # fill in Supabase keys
npm run dev                     # http://localhost:3000
```

### Database setup (remote Supabase)
1. Create a project at [supabase.com](https://supabase.com).
2. In **SQL Editor**, run **all** the migrations in order:
   - `supabase/migrations/0001_init.sql`
   - `supabase/migrations/0002_rls.sql`
   - `supabase/migrations/0003_audit_triggers.sql`
   - `supabase/migrations/0004_features.sql` &nbsp;← encoder role, standings view, venues, Storage bucket
   - `supabase/migrations/0005_integrity.sql` ← duplicate-result guards
   > Skipping `0004` leaves the encoder role, `/standings`, `/venues`, and image
   > uploads silently non-functional (pages render empty).
3. Put the project URL + keys in `.env.local` (see `.env.example`).
4. Seed sample data + the admin/encoder users:
   ```bash
   npm run seed
   ```
   > ⚠️ **`npm run seed` WIPES all domain tables before inserting.** Run it on a
   > fresh project only — **never** against production once real results exist.
5. Log in at `/admin/login` with `SEED_ADMIN_EMAIL` / `SEED_ADMIN_PASSWORD`
   (an encoder account is seeded too — see the seed output).

## Scripts
| Command | Purpose |
|---|---|
| `npm run dev` | Dev server |
| `npm run build` | Production build |
| `npm run typecheck` | `tsc --noEmit` |
| `npm run lint` | ESLint |
| `npm run seed` | Create admin + sample data (needs service-role key) |
| `npm run smoke` | Boot prod server, assert key routes respond |

## Deploy (Vercel + Supabase)
1. Push to GitHub, import the repo in Vercel (framework auto-detected; `vercel.json`
   pins region `sin1` / Singapore for PH latency).
2. Set env vars in Vercel → Project → Settings → Environment Variables:
   `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY`,
   `SUPABASE_SERVICE_ROLE_KEY`, `NEXT_PUBLIC_SITE_URL` (your prod domain).
3. Deploy. Apply migrations `0001`→`0005` to the production Supabase project.
   Seed **only** if it's a fresh project (seed wipes domain tables — see warning
   above); for a real meet, create the admin via Supabase Auth and enter data
   through the admin UI instead of seeding.

## Realtime model
The public medal tally uses **Supabase Realtime** (subscribe to `results`
changes → refresh) plus **time-based + on-demand revalidation** as a fallback.
No custom socket server.

## Architecture notes
- `medal_tally` is a **derived SQL view** over `results` — never written directly.
- RLS: public tables are world-readable; writes require an authenticated admin
  (`profiles.role = 'admin'`, enforced by `public.is_admin()`).
- Admin routes are gated in middleware **and** in the dashboard layout.

See `STATUS.md` for build status and milestone details.
