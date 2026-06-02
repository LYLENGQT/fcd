/**
 * Seed script — populates a Supabase project with realistic SAMPLE data so every
 * flow is testable without manual entry. All sample records are clearly labeled
 * as seed data (delegation names are real-style placeholders for a congressional
 * district; athletes use the "(SEED)" suffix-free but obvious sample names).
 *
 * Run: npm run seed   (requires .env.local with SUPABASE_SERVICE_ROLE_KEY)
 *
 * Idempotent: wipes existing domain rows (FK-safe order) then re-inserts.
 */
import { config } from "dotenv";
import { createClient } from "@supabase/supabase-js";

config({ path: ".env.local" });

const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
const adminEmail = process.env.SEED_ADMIN_EMAIL ?? "admin@fcdsaa2026.local";
const adminPassword = process.env.SEED_ADMIN_PASSWORD ?? "ChangeMe!2026";

if (!url || !serviceKey) {
  console.error(
    "Missing NEXT_PUBLIC_SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY in .env.local"
  );
  process.exit(1);
}

const db = createClient(url, serviceKey, {
  auth: { autoRefreshToken: false, persistSession: false },
});

async function main() {
  console.log("→ Seeding FCDSA Meet 2026 sample data…");

  // 1) Admin user ----------------------------------------------------------
  console.log("  • ensuring admin user");
  const { data: existing } = await db.auth.admin.listUsers();
  let adminId = existing.users.find((u) => u.email === adminEmail)?.id;

  if (!adminId) {
    const { data, error } = await db.auth.admin.createUser({
      email: adminEmail,
      password: adminPassword,
      email_confirm: true,
      user_metadata: { full_name: "Meet Administrator" },
    });
    if (error) throw error;
    adminId = data.user.id;
  }
  // Promote to admin (the new-user trigger created a 'viewer' profile).
  await db.from("profiles").update({ role: "admin" }).eq("id", adminId);

  // 1b) Encoder user (limited staff role) ----------------------------------
  console.log("  • ensuring encoder user");
  const encoderEmail = process.env.SEED_ENCODER_EMAIL ?? "encoder@fcdsa2026.local";
  const encoderPassword = process.env.SEED_ENCODER_PASSWORD ?? "ChangeMe!2026";
  let encoderId = existing.users.find((u) => u.email === encoderEmail)?.id;
  if (!encoderId) {
    const { data, error } = await db.auth.admin.createUser({
      email: encoderEmail,
      password: encoderPassword,
      email_confirm: true,
      user_metadata: { full_name: "Meet Encoder" },
    });
    if (error) throw error;
    encoderId = data.user.id;
  }
  await db.from("profiles").update({ role: "encoder" }).eq("id", encoderId);

  // 2) Wipe domain tables (children first) ---------------------------------
  console.log("  • clearing existing domain data");
  for (const t of [
    "results",
    "schedules",
    "events",
    "athletes",
    "schools",
    "livestreams",
    "announcements",
    "venues",
    "categories",
    "sports",
    "delegations",
  ]) {
    await db.from(t).delete().neq("id", "00000000-0000-0000-0000-000000000000");
  }

  // 2b) Venues -------------------------------------------------------------
  console.log("  • venues");
  await db.from("venues").insert([
    { name: "Main Oval", address: "City Sports Complex" },
    { name: "Aquatics Center", address: "City Sports Complex" },
    { name: "City Gymnasium", address: "Downtown" },
    { name: "Covered Court", address: "Central Elementary" },
  ]);

  // 3) Delegations — the 7 municipalities of Iloilo's 1st District.
  // Seals are self-hosted under public/delegations/<slug>.png.
  console.log("  • delegations");
  const delegationSeed = [
    { name: "Oton", abbrev: "OTN", color: "#0ea5e9", logo_url: "/delegations/oton.png" },
    { name: "Tigbauan", abbrev: "TIG", color: "#dc2626", logo_url: "/delegations/tigbauan.png" },
    { name: "Tubungan", abbrev: "TUB", color: "#6b7280", logo_url: "/delegations/tubungan.png" },
    { name: "Igbaras", abbrev: "IGB", color: "#7c3aed", logo_url: "/delegations/igbaras.png" },
    { name: "Guimbal", abbrev: "GUI", color: "#15803d", logo_url: "/delegations/guimbal.png" },
    { name: "Miagao", abbrev: "MIA", color: "#ca8a04", logo_url: "/delegations/miagao.png" },
    { name: "San Joaquin", abbrev: "SNJ", color: "#7f1d1d", logo_url: "/delegations/san-joaquin.png" },
  ];
  const { data: delegations, error: delErr } = await db
    .from("delegations")
    .insert(
      delegationSeed.map((d) => ({
        ...d,
        slug: d.name.toLowerCase().replace(/\s+/g, "-"),
      }))
    )
    .select();
  if (delErr) throw delErr;

  // 4) Schools -------------------------------------------------------------
  console.log("  • schools");
  const schoolRows = delegations!.flatMap((d) => [
    { delegation_id: d.id, name: `${d.name} Central Elementary`, level: "elementary" as const },
    { delegation_id: d.id, name: `${d.name} National High School`, level: "secondary" as const },
  ]);
  const { data: schools } = await db.from("schools").insert(schoolRows).select();

  // 5) Sports --------------------------------------------------------------
  console.log("  • sports");
  const sportSeed = [
    { name: "Athletics", icon: "Footprints" },
    { name: "Swimming", icon: "Waves" },
    { name: "Basketball", icon: "Dribbble" },
    { name: "Volleyball", icon: "Volleyball" },
    { name: "Chess", icon: "Crown" },
  ];
  const { data: sports } = await db
    .from("sports")
    .insert(
      sportSeed.map((s) => ({ ...s, slug: s.name.toLowerCase() }))
    )
    .select();

  // 6) Categories ----------------------------------------------------------
  console.log("  • categories");
  const categorySeed = [
    { name: "Elementary Boys", level: "elementary" as const, gender: "boys" as const },
    { name: "Elementary Girls", level: "elementary" as const, gender: "girls" as const },
    { name: "Secondary Boys", level: "secondary" as const, gender: "boys" as const },
    { name: "Secondary Girls", level: "secondary" as const, gender: "girls" as const },
  ];
  const { data: categories } = await db
    .from("categories")
    .insert(categorySeed)
    .select();

  // 7) Events (a few per sport across categories) --------------------------
  console.log("  • events");
  const eventRows: {
    sport_id: string;
    category_id: string;
    name: string;
    type: "individual" | "team";
  }[] = [];
  const athletics = sports!.find((s) => s.name === "Athletics")!;
  const swimming = sports!.find((s) => s.name === "Swimming")!;
  const basketball = sports!.find((s) => s.name === "Basketball")!;
  const volleyball = sports!.find((s) => s.name === "Volleyball")!;
  const chess = sports!.find((s) => s.name === "Chess")!;

  for (const c of categories!) {
    eventRows.push(
      { sport_id: athletics.id, category_id: c.id, name: "100m Dash", type: "individual" },
      { sport_id: athletics.id, category_id: c.id, name: "400m Run", type: "individual" },
      { sport_id: swimming.id, category_id: c.id, name: "50m Freestyle", type: "individual" },
      { sport_id: chess.id, category_id: c.id, name: "Standard Chess", type: "individual" }
    );
  }
  // Team events for secondary only.
  for (const c of categories!.filter((c) => c.level === "secondary")) {
    eventRows.push(
      { sport_id: basketball.id, category_id: c.id, name: "Basketball Finals", type: "team" },
      { sport_id: volleyball.id, category_id: c.id, name: "Volleyball Finals", type: "team" }
    );
  }
  const { data: events } = await db.from("events").insert(eventRows).select();

  // 8) Athletes (a handful per delegation) ---------------------------------
  console.log("  • athletes");
  const firstNames = ["Juan", "Maria", "Jose", "Ana", "Pedro", "Liza", "Mark", "Grace"];
  const lastNames = ["Santos", "Reyes", "Cruz", "Bautista", "Garcia", "Torres"];
  const athleteRows: {
    delegation_id: string;
    school_id: string | null;
    first_name: string;
    last_name: string;
    gender: "boys" | "girls";
    level: "elementary" | "secondary";
  }[] = [];
  delegations!.forEach((d, di) => {
    const delegSchools = schools!.filter((s) => s.delegation_id === d.id);
    for (let i = 0; i < 8; i++) {
      const level = i % 2 === 0 ? "elementary" : "secondary";
      athleteRows.push({
        delegation_id: d.id,
        school_id: delegSchools.find((s) => s.level === level)?.id ?? null,
        first_name: firstNames[(di + i) % firstNames.length],
        last_name: lastNames[(di + i) % lastNames.length],
        gender: i % 3 === 0 ? "girls" : "boys",
        level,
      });
    }
  });
  const { data: athletes } = await db.from("athletes").insert(athleteRows).select();

  // 9) Schedules (spread across 3 meet days) -------------------------------
  console.log("  • schedules");
  const venues = ["Main Oval", "Aquatics Center", "Sports Complex", "City Gymnasium"];
  const baseDay = new Date();
  baseDay.setHours(8, 0, 0, 0);
  const scheduleRows = events!.map((e, i) => {
    const start = new Date(baseDay);
    start.setDate(start.getDate() + (i % 3));
    start.setHours(8 + (i % 8), 0, 0, 0);
    const status =
      i % 3 === 0 ? "finished" : i % 3 === 1 ? "ongoing" : "scheduled";
    return {
      event_id: e.id,
      venue: venues[i % venues.length],
      start_at: start.toISOString(),
      status: status as "finished" | "ongoing" | "scheduled",
    };
  });
  await db.from("schedules").insert(scheduleRows);

  // 10) Results — medal each podium spot for ~60% of events ----------------
  console.log("  • results (drives medal tally)");
  const resultRows: {
    event_id: string;
    delegation_id: string;
    athlete_id: string | null;
    placement: number;
    medal: "gold" | "silver" | "bronze";
    mark: string;
    recorded_by: string;
  }[] = [];
  const medals: ("gold" | "silver" | "bronze")[] = ["gold", "silver", "bronze"];
  events!.forEach((e, ei) => {
    if (ei % 5 === 4) return; // leave some events without results yet
    for (let p = 0; p < 3; p++) {
      const deleg = delegations![(ei + p) % delegations!.length];
      const athlete =
        e.type === "individual"
          ? athletes!.find((a) => a.delegation_id === deleg.id) ?? null
          : null;
      resultRows.push({
        event_id: e.id,
        delegation_id: deleg.id,
        athlete_id: athlete?.id ?? null,
        placement: p + 1,
        medal: medals[p],
        mark: e.type === "individual" ? `${11 + p}.${(ei * 7) % 100}s` : `${3 - p} sets`,
        recorded_by: adminId!,
      });
    }
  });
  await db.from("results").insert(resultRows);

  // 11) Announcements ------------------------------------------------------
  console.log("  • announcements");
  await db.from("announcements").insert([
    {
      title: "Opening Ceremony Schedule",
      body: "The FCDSA Meet 2026 opening ceremony begins at 8:00 AM at the Main Oval. All delegations assemble by 7:00 AM. (SEED DATA)",
      pinned: true,
      published: true,
      author_id: adminId,
    },
    {
      title: "Venue Change: Swimming Heats",
      body: "Swimming heats originally at the City Pool have moved to the Aquatics Center. (SEED DATA)",
      pinned: false,
      published: true,
      author_id: adminId,
    },
    {
      title: "Weather Advisory Draft (unpublished)",
      body: "This is an unpublished draft to demonstrate the published flag. (SEED DATA)",
      pinned: false,
      published: false,
      author_id: adminId,
    },
  ]);

  // 12) Livestreams --------------------------------------------------------
  console.log("  • livestreams");
  await db.from("livestreams").insert([
    {
      title: "Basketball Finals — Live",
      embed_url: "https://www.youtube.com/embed/dQw4w9WgXcQ",
      platform: "youtube",
      is_live: true,
    },
    {
      title: "Opening Ceremony Replay",
      embed_url: "https://www.youtube.com/embed/dQw4w9WgXcQ",
      platform: "youtube",
      is_live: false,
    },
  ]);

  console.log("\n✓ Seed complete.");
  console.log(`  Admin login:   ${adminEmail} / ${adminPassword}`);
  console.log(`  Encoder login: ${encoderEmail} / ${encoderPassword}`);
  console.log(
    `  ${delegations!.length} delegations, ${athletes!.length} athletes, ${events!.length} events, ${resultRows.length} results.`
  );
}

main().catch((e) => {
  console.error("Seed failed:", e);
  process.exit(1);
});
