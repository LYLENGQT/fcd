# FCDSA Meet 2026 — Build Scoping Decision Document

## Context
Greenfield public website + admin for the **First Congressional District Sports
Association Meet 2026** (Philippines). WVRAA (wvraa.com) is the feature/UX
reference only — we cannot see its backend, so we copy *what users see*, not how
it's built. Reality check on the constraints: traffic is spiky (meet week only),
the team is 1–3 devs on a low budget, and **someone non-expert must maintain it
after handoff.** Those three facts kill most "scalable" architecture choices
before we start. This doc picks scope, data model, stack, realtime approach, and
a roadmap — and explicitly refuses the parts of WVRAA that aren't worth it for v1.

---

## 1. Feature Inventory (from WVRAA)

WVRAA nav, confirmed live: Home · Coverage (highlights / livestream / news /
medal-tally / palaro-schedules / palaro-tally) · Medal Tally · Hall of Records ·
Sports & Delegation (info / schedules / venues / delegations) · The Mascot ·
The Host (about / accommodation / food / transport / tourist-spots / emergency /
map) · Feedback · Results · Login · dark mode · "Regional Meet Status" widget.

### MUST-HAVE (v1)
| Feature | Why it's core |
|---|---|
| **Medal tally** (overall + per-delegation) | The headline page; what everyone opens first |
| **Event schedule** (by sport / day / venue) | Spectators & coaches plan around it |
| **Results** (per event, per sport) | The actual point of a meet |
| **Results encoding (admin)** | Staff enter results → drives tally + results pages |
| **Delegation pages** (the competing districts/schools) | Identity + roll-up of their medals |
| **Athlete records** (minimal: name, delegation, events) | Needed to attribute results |
| **Announcements / news** | Schedule changes, venue moves during meet week |
| **Admin login + roles** | Gate encoding; one admin, several encoders |
| **Venues list** | Spectators need to know where to go |

### IN-SCOPE per decision — Host-city section (full module)
**User decision: full host-city section like WVRAA** (food, accommodation,
transport, tourist-spots, emergency, map). Accepted. **Delivery constraint that
keeps it maintainable:** build it as **one generic, categorized content module**
— a single `ContentPage` type tagged by category — *not* seven bespoke page
types. Same admin editor, same template, photos + optional map pin per entry.
This gives full parity in features while staying a single thing to maintain, and
it lands in M3 so it never blocks the sports core (M1/M2).

> **Pushback (registered, then deferring to your call):** this section is the
> single biggest source of pages and the lowest-value-per-page content for a 1–3
> dev team to keep current. I'm building it the cheap way (one module, not seven)
> and sequencing it last so a slip here can't endanger tally/schedule/results.

### NICE-TO-HAVE (defer past v1)
- **Livestream embeds** — trivial later (just an embedded YouTube/FB URL on a page); don't build infra for it now.
- **Hall of Records** (historical bests across years) — needs multi-year data we won't have at first meet.
- **The Mascot** — one static page (use the same `ContentPage` module). Fine, zero cost, not a milestone.
- **Feedback form** — a single email-forwarding form; add only if asked.
- **Dark mode** — a toggle, ~1hr, not a v1 priority.
- **"Palaro" national coverage** — out of scope; that's WVRAA feeding the national meet. Not our event.

---

## 2. Data Model (must-haves only)

Entities and key relationships:

```
Delegation        (id, name, abbrev, logo, color)
   └─ 1..* Athlete (id, delegation_id→Delegation, name, gender, age_group/level)

Sport             (id, name, category)        e.g. Athletics, Swimming, Basketball
   └─ 1..* Event  (id, sport_id→Sport, name, gender, level, type[individual|team])

Venue             (id, name, address, map_url)

ScheduleItem      (id, event_id→Event, venue_id→Venue, start_at, status)
                  status: scheduled | ongoing | finished | cancelled

Result            (id, event_id→Event, delegation_id→Delegation,
                   athlete_id→Athlete (nullable for team events),
                   placement [1=gold,2,3,…], medal [gold|silver|bronze|none],
                   mark (time/distance/score, free text), recorded_by, recorded_at)

Announcement      (id, title, body, pinned, published_at)

ContentPage       (id, category[food|accommodation|transport|tourist_spot|
                   emergency|map|mascot|about], title, body, photos[],
                   lat, lng (nullable), order, published)
                   ← the entire host-city section + mascot/about, one table

User (admin)      (id, email, hashed_pw, role[admin|encoder|editor])
```

**The medal tally is NOT a stored table.** It is a *derived aggregate* —
`COUNT(medal) GROUP BY delegation` over `Result`. Storing tally counts
separately is the #1 way these sites drift out of sync. Compute it from results;
cache the computed page (see §4).

Key relationships:
- `Result` is the hub: it ties an Event + Delegation (+ optional Athlete) to a medal. Everything public (tally, results pages, delegation medal counts, athlete results) is a query over `Result`.
- `ScheduleItem` is separate from `Result`: schedule = "when/where", result = "what happened". An event has one schedule slot and 0..* results (gold/silver/bronze rows).

---

## 3. Recommended Stack (ONE choice)

**Next.js (App Router) on Vercel + Postgres (Supabase or Neon) + Prisma + a
component library (shadcn/ui or similar). Auth via Supabase Auth or Auth.js.**

One paragraph: A single Next.js app gives us public pages *and* the admin
encoding UI in one codebase, one deploy, one language (TypeScript) — exactly what
a 1–3 person team can maintain. Public pages render as **statically cached server
components with on-demand revalidation**, so a viral meet-week spike is served
from CDN edge cache at near-zero marginal cost; encoders hit the dynamic admin
routes, which are low-traffic. Managed Postgres (Supabase/Neon) means **no
servers, no ops, generous free/cheap tiers**, and it scales reads without us
tuning anything. Prisma keeps the schema and queries readable for whoever
inherits this. This is the boring, well-documented, hireable stack — which is the
right call when the real constraint is "must survive handoff."

### What I am explicitly NOT using, and why
- **No Kubernetes / Docker / VPS / self-hosted DB** — there's no ops person after handoff. Managed PaaS or nothing.
- **No microservices** — one app, one DB. The whole domain fits in ~8 tables.
- **No WebSocket server / Socket.io / real-time pub-sub infra** — see §4; it's a cost and complexity sink for data that changes a few times an hour.
- **No GraphQL / tRPC layer** — server components + server actions already remove the API boilerplate. Adding a query layer is ceremony for ~10 query shapes.
- **No Redis / dedicated cache tier** — CDN + Next.js cache covers the read spike.
- **No headless CMS (Sanity/Strapi/Contentful)** — announcements + a couple of static pages don't justify a second system to learn and pay for. A DB table + a textarea is enough.
- **No native mobile app / PWA push** — responsive web only.
- **No separate "design system" package, monorepo, or feature flags** — single repo.

> **Pushback:** every item above is something a meet website *could* have. None
> earns its complexity for a once-a-year, spiky, small-team app. The failure mode
> here is over-engineering, not under-scaling.

---

## 4. Thinnest Realtime That Works

**Default: on-demand revalidation, not sockets.**

- Public pages (tally, results, schedule) are statically generated and **served from CDN cache**.
- When an encoder saves a result, the admin action calls **`revalidatePath()` / `revalidateTag()`** for the affected tally/results/delegation pages. Next render is fresh; everyone else is served cache.
- Add a **time-based fallback** (`revalidate: 30–60s`) on live pages during meet week as a safety net.
- Optional, near-free "live feel": a tiny client poll (`refetch every 20–30s`) on the medal-tally page *only*. Spectators tolerate a 30-second delay; a meet is not a stock ticker.

Why not WebSockets: they require a persistent stateful server (kills the
serverless cost model), add reconnection/scaling complexity, and buy us nothing
for data that updates maybe a few times per event. If a future host genuinely
needs sub-second live results, revisit — but **do not build it in v1.**

---

## 5. Roadmap — 3 Milestones (admin-first)

### M1 — Admin & Encoding (data-in first)
Schema + migrations (Prisma). Auth + roles (admin/encoder). Admin CRUD for
Delegations, Sports, Events, Venues, Athletes. **Results encoding screen** (the
critical path: pick event → enter placements/medals → save). Announcement editor.
*Exit criteria: an encoder can enter a full day of results and they persist correctly.*

### M2 — Public Read Pages
Home + Regional-meet-status widget. **Medal tally** (overall + per delegation,
derived from results). Results pages (by sport / event). Schedule (by day / sport
/ venue). Delegation pages (roster + medal roll-up). Announcements feed. Wire up
**on-demand revalidation** from M1's admin saves. Responsive + accessible.
*Exit criteria: public site reflects encoded data within seconds of saving; survives a load test of the tally page.*

### M3 — Host-city module + polish
**Host-city section (full, per decision)** via the single `ContentPage` module:
admin editor with category, rich text, photo upload, optional map pin → public
category pages (food / accommodation / transport / tourist-spots / emergency /
map) all rendered from one template. Reuse the same module for Mascot + About.
Then: livestream embed page, Feedback form, dark mode, SEO/OG + share images for
tally/results. Hall of Records deferred until there's a second year of data.
*Exit criteria: meet-ready; host-city + polish added without touching the M1/M2 sports core.*

---

## Resolved decision
- **Host-city tourism section**: full module (user's call), implemented as one
  generic categorized `ContentPage` type — full feature parity with WVRAA,
  single thing to maintain, sequenced into M3 so it can't block the sports core.

## Verification (when build begins)
- M1: seed a sport+events, log in as encoder, enter results, confirm rows in DB and tally query returns correct counts.
- M2: save a result in admin → public tally/results page updates after revalidation; run a quick load test (e.g. `k6`/`autocannon`) against the cached tally URL to confirm CDN serves the spike.
- M3: confirm deferred features are additive (no schema/core changes required).
