import Link from "next/link";
import { ArrowUpRight, Radio } from "lucide-react";
import { RealtimeRefresher } from "@/components/realtime-refresher";
import { EnvNotice } from "@/components/env-notice";
import { StatusPill } from "@/components/status-pill";
import { createClient } from "@/lib/supabase/server";
import { getTally } from "@/lib/queries";
import { isSupabaseConfigured } from "@/lib/env";
import { MEET_TAGLINE, MEET_START, MEET_END } from "@/lib/constants";
import { getMeetDay, formatTime } from "@/lib/utils";
import type { Announcement, MedalTallyRow, ScheduleStatus } from "@/lib/database.types";

type TodayRow = {
  id: string;
  venue: string;
  start_at: string;
  status: ScheduleStatus;
  events: { name: string; sports: { name: string } | null } | null;
};

const manilaDay = (iso: string | Date) =>
  new Date(iso).toLocaleDateString("en-PH", { timeZone: "Asia/Manila" });

export const revalidate = 30;

const SPORTS_TICKER = [
  "ATHLETICS",
  "BASKETBALL",
  "VOLLEYBALL",
  "SWIMMING",
  "BOXING",
  "ARNIS",
  "FOOTBALL",
  "BADMINTON",
  "TABLE TENNIS",
  "CHESS",
  "TAEKWONDO",
  "SEPAK TAKRAW",
];

export default async function HomePage() {
  if (!isSupabaseConfigured) {
    return <EnvNotice />;
  }

  const supabase = createClient();
  const [tally, { data: annData }, { data: liveData }, { count: delegationTotal }, { data: schedData }] =
    await Promise.all([
      getTally(),
      supabase
        .from("announcements")
        .select("*")
        .eq("published", true)
        .order("pinned", { ascending: false })
        .order("published_at", { ascending: false })
        .limit(3),
      supabase
        .from("livestreams")
        .select("id")
        .eq("is_live", true)
        .limit(1),
      supabase.from("delegations").select("id", { count: "exact", head: true }),
      supabase
        .from("schedules")
        .select("id, venue, start_at, status, events(name, sports(name))")
        .order("start_at"),
    ]);

  const announcements = (annData ?? []) as Announcement[];
  const hasLive = (liveData ?? []).length > 0;
  const topTally = (tally as MedalTallyRow[]).slice(0, 5);
  const totalGold = tally.reduce((s, r) => s + (r.gold ?? 0), 0);
  const totalMedals = tally.reduce((s, r) => s + (r.total ?? 0), 0);
  const delegationCount = delegationTotal ?? tally.length;

  const today = new Date();
  const meet = getMeetDay(MEET_START, MEET_END, today);
  const dayNumber = String(meet.day).padStart(2, "0");
  const totalDays = String(meet.total).padStart(2, "0");

  // Today's fixtures (Manila) — reused across the strip, stat board, and quick-links.
  const todayKey = manilaDay(today);
  const todayRows = ((schedData ?? []) as unknown as TodayRow[]).filter(
    (r) => manilaDay(r.start_at) === todayKey
  );
  const todayCount = todayRows.length;
  const nowItem = todayRows.find((r) => r.status === "ongoing") ?? null;
  const nextItem =
    todayRows.find((r) => r.status !== "ongoing" && new Date(r.start_at) > today) ?? null;
  const firstItem = todayRows[0] ?? null;

  return (
    <>
      <RealtimeRefresher table="results" />

      {/* ─────────────────────── HERO ─────────────────────── */}
      <section className="relative isolate overflow-hidden bg-surface-inv text-on-inv grain spotlight">
        {/* Decorative concentric ring (sun motif) */}
        <svg
          aria-hidden
          viewBox="0 0 600 600"
          className="spin-slow pointer-events-none absolute -right-40 -top-40 h-[640px] w-[640px] opacity-[0.18]"
        >
          <defs>
            <radialGradient id="ringFade" cx="50%" cy="50%" r="50%">
              <stop offset="0%" stopColor="hsl(41 73% 56%)" stopOpacity="0" />
              <stop offset="70%" stopColor="hsl(41 73% 56%)" stopOpacity="0.55" />
              <stop offset="100%" stopColor="hsl(41 73% 56%)" stopOpacity="0" />
            </radialGradient>
          </defs>
          {Array.from({ length: 24 }).map((_, i) => (
            <line
              key={i}
              x1="300"
              y1="300"
              x2="300"
              y2="20"
              stroke="url(#ringFade)"
              strokeWidth="2"
              transform={`rotate(${(i * 360) / 24} 300 300)`}
            />
          ))}
          <circle cx="300" cy="300" r="180" fill="none" stroke="hsl(168 78% 44% / 0.45)" strokeWidth="1" />
          <circle cx="300" cy="300" r="240" fill="none" stroke="hsl(168 78% 44% / 0.28)" strokeWidth="1" />
        </svg>

        {/* Top ticker bar */}
        <div className="relative z-10 border-b border-on-inv/10">
          <div className="container flex h-9 items-center justify-between font-mono-data text-[11px] uppercase tracking-[0.2em] text-on-inv/60">
            <span className="flex items-center gap-2">
              <span className="inline-block h-1.5 w-1.5 rounded-full bg-gold" />
              First Congressional District Sports Association Meet · 14&ndash;28 OCT 2026 · PROVINCE OF ILOILO, PHILIPPINES
            </span>
            <span className="hidden md:inline">
              {today.toLocaleDateString("en-US", {
                weekday: "long",
                year: "numeric",
                month: "long",
                day: "numeric",
              })}
            </span>
          </div>
        </div>

        {/* Hero content grid */}
        <div className="container relative z-10 grid grid-cols-12 gap-y-10 py-16 md:gap-x-8 md:py-24">
          {/* Left: editorial label + headline */}
          <div className="col-span-12 lg:col-span-8">
            <div className="rise flex items-center gap-3 font-mono-data text-[11px] uppercase tracking-[0.3em] text-on-inv/60">
              <span className="h-px w-10 bg-gold" />
              VOL. XXVI &middot; THE MEET BULLETIN
            </div>

            <h1
              className="rise mt-6 font-display font-black leading-[0.92] tracking-tight"
              style={{ animationDelay: "60ms" }}
            >
              <span className="block text-[clamp(4rem,12vw,11rem)] text-on-inv">
                FCDSA
              </span>
              <span className="block text-[clamp(3rem,8vw,7.5rem)] text-on-inv/85">
                MEET
              </span>
              <span className="block text-[clamp(4.5rem,14vw,12rem)] text-gold drop-shadow-[0_2px_0_rgba(0,0,0,0.4)]">
                2026
              </span>
            </h1>

            <p
              className="rise mt-8 max-w-xl font-editorial text-lg italic text-on-inv/75"
              style={{ animationDelay: "160ms" }}
            >
              &ldquo;{MEET_TAGLINE}&rdquo;
            </p>

            <div
              className="rise mt-10 flex flex-wrap items-center gap-3"
              style={{ animationDelay: "220ms" }}
            >
              <Link
                href="/tally"
                className="group inline-flex items-center gap-3 bg-gold px-6 py-3.5 font-display text-xl font-bold uppercase tracking-wider text-ink transition hover:bg-gold-deep"
              >
                Medal Tally
                <ArrowUpRight className="h-5 w-5 transition-transform group-hover:-translate-y-0.5 group-hover:translate-x-0.5" />
              </Link>
              <Link
                href="/schedule"
                className="group inline-flex items-center gap-3 border border-on-inv/30 px-6 py-3.5 font-display text-xl font-bold uppercase tracking-wider text-on-inv transition hover:border-on-inv hover:bg-on-inv/5"
              >
                Today&rsquo;s Schedule
                <ArrowUpRight className="h-5 w-5 opacity-60 transition group-hover:opacity-100" />
              </Link>
              {hasLive && (
                <Link
                  href="/livestream"
                  className="group inline-flex items-center gap-3 border border-crimson/60 bg-crimson/10 px-5 py-3 font-mono-data text-xs uppercase tracking-[0.25em] text-on-inv transition hover:bg-crimson/20"
                >
                  <span className="relative flex h-2.5 w-2.5">
                    <span className="absolute inline-flex h-full w-full rounded-full bg-crimson pulse-dot" />
                    <span className="relative inline-flex h-2.5 w-2.5 rounded-full bg-crimson" />
                  </span>
                  On Air &mdash; Watch Live
                  <Radio className="h-4 w-4" />
                </Link>
              )}
            </div>

            {/* Happening Now / Up Next strip */}
            {(nowItem || nextItem || firstItem) && (
              <Link
                href="/schedule"
                className="rise group mt-8 flex flex-wrap items-center gap-x-8 gap-y-3 border-t border-on-inv/15 pt-6"
                style={{ animationDelay: "260ms" }}
              >
                {nowItem ? (
                  <span className="flex items-center gap-3">
                    <span className="flex items-center gap-2 font-mono-data text-[10px] uppercase tracking-[0.2em] text-on-inv/45">
                      <span className="relative flex h-1.5 w-1.5">
                        <span className="absolute inline-flex h-full w-full rounded-full bg-crimson pulse-dot" />
                        <span className="relative inline-flex h-1.5 w-1.5 rounded-full bg-crimson" />
                      </span>
                      Now
                    </span>
                    <span className="font-display text-lg font-bold uppercase tracking-wide text-on-inv">
                      {nowItem.events?.name}
                    </span>
                    <span className="font-editorial text-sm italic text-on-inv/65">
                      {nowItem.events?.sports?.name} · {nowItem.venue}
                    </span>
                    <StatusPill status={nowItem.status} />
                  </span>
                ) : nextItem ? (
                  <span className="flex items-center gap-3">
                    <span className="font-mono-data text-[10px] uppercase tracking-[0.2em] text-on-inv/45">
                      Up Next
                    </span>
                    <span className="font-mono-data text-sm font-medium tabular-nums tracking-wide text-gold">
                      {formatTime(nextItem.start_at)}
                    </span>
                    <span className="font-display text-lg font-bold uppercase tracking-wide text-on-inv">
                      {nextItem.events?.name}
                    </span>
                    <span className="font-editorial text-sm italic text-on-inv/65">
                      {nextItem.events?.sports?.name} · {nextItem.venue}
                    </span>
                  </span>
                ) : (
                  <span className="flex items-center gap-3">
                    <span className="font-mono-data text-[10px] uppercase tracking-[0.2em] text-on-inv/45">
                      Today
                    </span>
                    <span className="font-editorial text-sm italic text-on-inv/65">
                      First event at {formatTime(firstItem!.start_at)}
                    </span>
                  </span>
                )}
                <ArrowUpRight className="h-4 w-4 text-on-inv/45 transition group-hover:-translate-y-0.5 group-hover:translate-x-0.5 group-hover:text-on-inv" />
              </Link>
            )}
          </div>

          {/* Right: stat board */}
          <aside
            className="rise col-span-12 lg:col-span-4"
            style={{ animationDelay: "280ms" }}
          >
            <div className="flex items-baseline justify-between border-b border-on-inv/15 pb-3">
              <span className="font-mono-data text-[11px] uppercase tracking-[0.3em] text-on-inv/55">
                Day
              </span>
              <span className="font-mono-data text-[11px] uppercase tracking-[0.3em] text-on-inv/55">
                of {totalDays}
              </span>
            </div>
            <div className="flex items-end justify-between">
              <span className="font-display text-[10rem] font-black leading-none text-on-inv">
                {dayNumber}
              </span>
              <span className="num-outline font-display text-7xl font-black leading-none">
                {totalDays}
              </span>
            </div>

            <dl className="mt-6 grid grid-cols-2 gap-px overflow-hidden border border-on-inv/15 bg-on-inv/10">
              {[
                { k: "Delegations", v: delegationCount },
                { k: "Total Gold", v: totalGold },
                { k: "Medals Won", v: totalMedals },
                { k: "Events Today", v: todayCount },
              ].map((s) => (
                <div key={s.k} className="bg-surface-inv px-3 py-4">
                  <dt className="font-mono-data text-[10px] uppercase tracking-[0.18em] text-on-inv/55">
                    {s.k}
                  </dt>
                  <dd className="mt-1 font-display text-3xl font-black text-on-inv">
                    {String(s.v).padStart(2, "0")}
                  </dd>
                </div>
              ))}
            </dl>
          </aside>
        </div>

        {/* Sports marquee */}
        <div className="relative z-10 overflow-hidden border-y border-on-inv/10 bg-on-inv/[0.03] py-3">
          <div className="flex animate-marquee whitespace-nowrap will-change-transform">
            {[...SPORTS_TICKER, ...SPORTS_TICKER].map((s, i) => (
              <span
                key={i}
                className="mx-8 inline-flex items-center gap-8 font-display text-xl font-bold uppercase tracking-[0.18em] text-on-inv/45"
              >
                {s}
                <span className="text-gold">✦</span>
              </span>
            ))}
          </div>
        </div>
      </section>

      {/* ─────────────────── LIVE STANDINGS ─────────────────── */}
      <section className="bg-bone text-ink">
        <div className="container py-20">
          <header className="flex flex-wrap items-end justify-between gap-6 border-b-2 border-ink pb-5">
            <div>
              <div className="flex items-center gap-3 font-mono-data text-[11px] uppercase tracking-[0.3em] text-ink/55">
                <span className="relative flex h-2 w-2">
                  <span className="absolute inline-flex h-full w-full rounded-full bg-crimson pulse-dot" />
                  <span className="relative inline-flex h-2 w-2 rounded-full bg-crimson" />
                </span>
                Live Standings
              </div>
              <h2 className="mt-2 font-display text-5xl font-black uppercase tracking-tight md:text-7xl">
                The Leaderboard
              </h2>
            </div>
            <Link
              href="/tally"
              className="group inline-flex items-center gap-2 font-mono-data text-xs uppercase tracking-[0.25em] text-ink/70 transition-colors hover:text-ink"
            >
              View full tally
              <ArrowUpRight className="h-4 w-4 transition group-hover:-translate-y-0.5 group-hover:translate-x-0.5" />
            </Link>
          </header>

          {topTally.length === 0 ? (
            <div className="py-20 text-center font-editorial text-2xl italic text-ink/50">
              The board awaits its first medal.
            </div>
          ) : (
            <ol className="mt-2 divide-y divide-ink/15">
              {topTally.map((row) => {
                const max = Math.max(...topTally.map((r) => r.total || 0), 1);
                const pct = ((row.total || 0) / max) * 100;
                return (
                  <li key={row.delegation_id}>
                    <Link
                      href={`/delegations/${row.slug}`}
                      className="group grid grid-cols-12 items-center gap-4 py-6 transition-colors hover:bg-ink/[0.06]"
                    >
                      <span className="num-outline-row col-span-2 font-display text-5xl font-black md:col-span-1 md:text-6xl">
                        {String(row.rank).padStart(2, "0")}
                      </span>

                      <div className="col-span-10 md:col-span-5">
                        <div className="flex items-center gap-3">
                          <span
                            className="inline-block h-4 w-4 rounded-sm ring-2 ring-ink/20"
                            style={{ backgroundColor: row.color }}
                            aria-hidden
                          />
                          <span className="font-display text-2xl font-bold uppercase tracking-wide md:text-3xl">
                            {row.delegation_name}
                          </span>
                        </div>
                        <div className="mt-3 h-1 w-full bg-ink/10">
                          <div
                            className="h-full bg-gold transition-all"
                            style={{ width: `${pct}%` }}
                          />
                        </div>
                      </div>

                      <div className="col-span-12 grid grid-cols-4 gap-6 md:col-span-6 md:justify-self-end md:text-right">
                        <Medal label="Gold" value={row.gold} tone="gold" />
                        <Medal label="Silver" value={row.silver} tone="silver" />
                        <Medal label="Bronze" value={row.bronze} tone="bronze" />
                        <div>
                          <div className="font-mono-data text-[10px] uppercase tracking-[0.18em] text-ink/50">
                            Total
                          </div>
                          <div className="font-display text-4xl font-black md:text-5xl">
                            {row.total}
                          </div>
                        </div>
                      </div>
                    </Link>
                  </li>
                );
              })}
            </ol>
          )}
        </div>
      </section>

      {/* ─────────────────── BULLETIN + QUICK LINKS ─────────────────── */}
      <section className="bg-bone text-ink">
        <div className="container grid grid-cols-12 gap-8 pb-24">
          {/* Announcements — newspaper masthead */}
          <div className="col-span-12 lg:col-span-7">
            <div className="border border-ink">
              <div className="flex items-baseline justify-between border-b border-ink bg-surface-inv px-5 py-3 text-on-inv">
                <span className="font-display text-2xl font-black uppercase tracking-[0.15em]">
                  The Bulletin
                </span>
                <Link
                  href="/announcements"
                  className="font-mono-data text-[10px] uppercase tracking-[0.25em] text-on-inv/70 transition-colors hover:text-on-inv"
                >
                  Archive →
                </Link>
              </div>
              <div className="divide-y divide-ink/15">
                {announcements.length === 0 && (
                  <p className="px-5 py-10 text-center font-editorial italic text-ink/55">
                    No bulletins issued yet — check back at first whistle.
                  </p>
                )}
                {announcements.map((a, i) => (
                  <article key={a.id} className="px-5 py-6">
                    <div className="flex items-center gap-3 font-mono-data text-[10px] uppercase tracking-[0.25em] text-ink/55">
                      <span>No. {String(i + 1).padStart(3, "0")}</span>
                      <span className="h-px w-6 bg-ink/30" />
                      <time>
                        {new Date(a.published_at).toLocaleDateString("en-US", {
                          month: "short",
                          day: "numeric",
                          hour: "numeric",
                          minute: "2-digit",
                        })}
                      </time>
                      {a.pinned && (
                        <span className="border border-crimson bg-crimson/10 px-1.5 py-px text-crimson">
                          Pinned
                        </span>
                      )}
                    </div>
                    <h3 className="mt-2 font-display text-2xl font-bold uppercase leading-tight tracking-tight md:text-3xl">
                      {a.title}
                    </h3>
                    <p className="mt-2 line-clamp-2 font-editorial text-base leading-relaxed text-ink/75">
                      {a.body}
                    </p>
                  </article>
                ))}
              </div>
            </div>
          </div>

          {/* Quick links — index card stack */}
          <div className="col-span-12 lg:col-span-5">
            <h2 className="font-mono-data text-[11px] uppercase tracking-[0.3em] text-ink/55">
              Inside this issue
            </h2>
            <div className="mt-3 grid grid-cols-2 gap-3">
              {[
                { href: "/schedule", label: "Schedule", caption: "Daily fixtures & venues" },
                { href: "/delegations", label: "Delegations", caption: "Town teams & medals" },
                { href: "/athletes", label: "Athletes", caption: "Roster & profiles" },
                { href: "/livestream", label: "Livestream", caption: "Broadcast feed" },
              ].map((item, i) => (
                <Link
                  key={item.href}
                  href={item.href}
                  className="group relative flex aspect-[5/4] flex-col justify-between overflow-hidden border border-ink bg-bone p-4 transition hover:bg-highlight hover:text-on-highlight"
                >
                  <div className="flex items-center justify-between">
                    <span className="font-mono-data text-[10px] uppercase tracking-[0.25em] text-ink/55 group-hover:text-on-highlight/55">
                      /{String(i + 1).padStart(2, "0")}
                    </span>
                    {item.href === "/schedule" && todayCount > 0 && (
                      <span className="border border-gold bg-gold/15 px-1.5 py-px font-mono-data text-[10px] uppercase tracking-[0.18em] text-gold-deep group-hover:border-on-highlight/40 group-hover:text-on-highlight">
                        {todayCount} today
                      </span>
                    )}
                  </div>
                  <div>
                    <div className="font-display text-3xl font-black uppercase leading-none tracking-tight">
                      {item.label}
                    </div>
                    <div className="mt-2 font-editorial text-sm italic">
                      {item.caption}
                    </div>
                  </div>
                  <ArrowUpRight className="absolute right-3 top-3 h-5 w-5 -translate-y-0 translate-x-0 opacity-50 transition group-hover:-translate-y-0.5 group-hover:translate-x-0.5 group-hover:opacity-100" />
                </Link>
              ))}
            </div>

            <blockquote className="mt-8 border-l-2 border-gold pl-5 font-editorial text-xl italic leading-relaxed text-ink/80">
              &ldquo;The medal is gilt; the memory is gold.&rdquo;
              <footer className="mt-3 font-mono-data text-[10px] uppercase tracking-[0.25em] not-italic text-ink/50">
                — From the meet program
              </footer>
            </blockquote>
          </div>
        </div>
      </section>
    </>
  );
}

function Medal({
  label,
  value,
  tone,
}: {
  label: string;
  value: number;
  tone: "gold" | "silver" | "bronze";
}) {
  const swatch =
    tone === "gold"
      ? "bg-gold"
      : tone === "silver"
      ? "bg-silver"
      : "bg-bronze";
  return (
    <div>
      <div className="flex items-center gap-1.5 font-mono-data text-[10px] uppercase tracking-[0.18em] text-ink/50">
        <span className={`inline-block h-2 w-2 rounded-full ${swatch}`} />
        {label}
      </div>
      <div className="mt-0.5 font-display text-3xl font-bold md:text-4xl">
        {value}
      </div>
    </div>
  );
}
