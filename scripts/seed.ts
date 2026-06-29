/**
 * Seed script — populates EVERY domain table and column with realistic SAMPLE
 * data so every page and flow is testable without manual entry. Sample content
 * is clearly labeled ("(SEED DATA)"); delegation names are the real 1st-District
 * municipalities. The only intentionally-empty column is `mascot.image_url`
 * (no hosted artwork) and half of `athletes.photo_url` (to test the fallback).
 *
 * Run: npm run seed   (requires .env.local with SUPABASE_SERVICE_ROLE_KEY, and
 * migrations 0001–0007 applied to the target project first).
 *
 * Idempotent: wipes existing domain rows (FK-safe order) then re-inserts.
 */
import { config } from "dotenv";
import { createClient } from "@supabase/supabase-js";

config({ path: ".env.local" });

const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
const adminEmail = process.env.SEED_ADMIN_EMAIL ?? "admin@fcdsa2026.local";
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
  } else {
    // Existing user: force the password to the configured value so re-seeding
    // is authoritative (changing SEED_ADMIN_PASSWORD actually takes effect).
    const { error } = await db.auth.admin.updateUserById(adminId, {
      password: adminPassword,
      email_confirm: true,
    });
    if (error) throw error;
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
  } else {
    const { error } = await db.auth.admin.updateUserById(encoderId, {
      password: encoderPassword,
      email_confirm: true,
    });
    if (error) throw error;
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
    "emergency_contacts",
    "committees",
    "records",
    "mascot",
    "host_map",
    "feedback",
  ]) {
    await db.from(t).delete().neq("id", "00000000-0000-0000-0000-000000000000");
  }

  // 2b) Venues -------------------------------------------------------------
  console.log("  • venues");
  await db.from("venues").insert([
    { name: "Main Oval", address: "City Sports Complex, Guimbal, Iloilo", map_url: "https://maps.google.com/?q=Guimbal+Iloilo" },
    { name: "Aquatics Center", address: "City Sports Complex, Guimbal, Iloilo", map_url: "https://maps.google.com/?q=Guimbal+Iloilo" },
    { name: "City Gymnasium", address: "Poblacion, Guimbal, Iloilo", map_url: "https://maps.google.com/?q=Guimbal+Municipal+Gymnasium" },
    { name: "Covered Court", address: "Central Elementary, Guimbal, Iloilo", map_url: "https://maps.google.com/?q=Guimbal+Iloilo" },
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
    { name: "Secondary Mixed", level: "secondary" as const, gender: "mixed" as const },
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
  // Gender-appropriate first names + Iloilo-flavoured surnames. Each delegation
  // is seeded from a different offset and a global de-dupe guarantees NO two
  // athletes (in any delegation) share a full name.
  const BOY_NAMES = ["Juan", "Jose", "Pedro", "Mark", "Carlo", "Miguel", "Rafael", "Andres", "Emilio", "Nestor", "Ramon", "Vicente"];
  const GIRL_NAMES = ["Maria", "Ana", "Liza", "Grace", "Divina", "Rosa", "Carmen", "Teresa", "Jasmin", "Cristina", "Bea", "Alma"];
  const LAST_NAMES = ["Santos", "Reyes", "Cruz", "Bautista", "Garcia", "Torres", "Flores", "Ramos", "Mendoza", "Aquino", "del Rosario", "Villanueva", "Gallego", "Tupas", "Defensor", "Treñas"];
  const usedNames = new Set<string>();
  function uniqueName(pool: string[], fSeed: number, lSeed: number) {
    for (let k = 0; k < pool.length * LAST_NAMES.length; k++) {
      const first = pool[(fSeed + k) % pool.length];
      const last = LAST_NAMES[(lSeed + Math.floor((fSeed + k) / pool.length)) % LAST_NAMES.length];
      const key = `${first} ${last}`;
      if (!usedNames.has(key)) {
        usedNames.add(key);
        return { first, last };
      }
    }
    return { first: pool[fSeed % pool.length], last: LAST_NAMES[lSeed % LAST_NAMES.length] };
  }
  const athleteRows: {
    delegation_id: string;
    school_id: string | null;
    first_name: string;
    last_name: string;
    gender: "boys" | "girls";
    level: "elementary" | "secondary";
    photo_url: string | null;
  }[] = [];
  delegations!.forEach((d, di) => {
    const delegSchools = schools!.filter((s) => s.delegation_id === d.id);
    for (let i = 0; i < 8; i++) {
      const level = i % 2 === 0 ? "elementary" : "secondary";
      const gender = i % 3 === 0 ? "girls" : "boys";
      const pool = gender === "girls" ? GIRL_NAMES : BOY_NAMES;
      // Vary the surname within each delegation (~4 per squad) while keeping
      // each delegation's mix distinct — the global de-dupe still guarantees no
      // two athletes anywhere share a full name.
      const { first, last } = uniqueName(pool, di * 3 + i, di * 3 + Math.floor(i / 2));
      athleteRows.push({
        delegation_id: d.id,
        school_id: delegSchools.find((s) => s.level === level)?.id ?? null,
        first_name: first,
        last_name: last,
        gender,
        level,
        // Half get a photo (the delegation seal — a local, non-breaking
        // stand-in) so both the photo and the no-photo fallback are testable.
        photo_url: i % 2 === 0 ? (d.logo_url as string) : null,
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
  const nowMs = Date.now();
  const hoursAgo = (h: number) => new Date(nowMs - h * 3600 * 1000).toISOString();
  await db.from("announcements").insert([
    {
      title: "Opening Ceremony Schedule",
      body: "The FCDSA Meet 2026 opening ceremony begins at 8:00 AM at the Main Oval. All delegations assemble by 7:00 AM. (SEED DATA)",
      pinned: true,
      published: true,
      author_id: adminId,
      published_at: hoursAgo(2),
    },
    {
      title: "Venue Change: Swimming Heats",
      body: "Swimming heats originally at the City Pool have moved to the Aquatics Center. (SEED DATA)",
      pinned: false,
      published: true,
      author_id: adminId,
      published_at: hoursAgo(26),
    },
    {
      title: "Weather Advisory Draft (unpublished)",
      body: "This is an unpublished draft to demonstrate the published flag. (SEED DATA)",
      pinned: false,
      published: false,
      author_id: adminId,
      published_at: hoursAgo(50),
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
      event_id: events!.find((e) => e.name === "Basketball Finals")?.id ?? null,
      starts_at: new Date(nowMs).toISOString(),
    },
    {
      title: "Opening Ceremony Replay",
      embed_url: "https://www.youtube.com/embed/dQw4w9WgXcQ",
      platform: "youtube",
      is_live: false,
      event_id: null,
      starts_at: new Date(nowMs - 24 * 3600 * 1000).toISOString(),
    },
    {
      title: "Athletics Day 2 — Facebook Live",
      embed_url:
        "https://www.facebook.com/plugins/video.php?href=https%3A%2F%2Fwww.facebook.com%2Ffacebook%2Fvideos%2F10153231379946729%2F",
      platform: "facebook",
      is_live: false,
      event_id: null,
      starts_at: new Date(nowMs + 24 * 3600 * 1000).toISOString(),
    },
  ]);

  // 13) Host info — emergency directory + committees ----------------------
  // National hotlines (911 / 143) are real; local entries are clearly marked
  // placeholders for the host committee to fill. (host_map is seeded in §15.)
  console.log("  • host info (emergency directory + committees)");
  // Every row MUST carry the SAME keys: a heterogeneous array (some rows missing
  // `address`) makes PostgREST reject the whole bulk insert — keep `address` on
  // every row. The error is checked so a future mismatch can't fail silently.
  const { error: ecErr } = await db.from("emergency_contacts").insert([
    { name: "National Emergency Hotline", contact_number: "911", address: "", contact_type: "Emergency", sort_order: 1 },
    { name: "Philippine Red Cross", contact_number: "143", address: "", contact_type: "Red Cross", sort_order: 2 },
    { name: "Guimbal Municipal Police Station", contact_number: "(to be confirmed)", address: "Poblacion, Guimbal, Iloilo", contact_type: "Police", sort_order: 3 },
    { name: "Guimbal Rural Health Unit", contact_number: "(to be confirmed)", address: "Poblacion, Guimbal, Iloilo", contact_type: "Hospital", sort_order: 4 },
    { name: "Bureau of Fire Protection — Guimbal", contact_number: "(to be confirmed)", address: "Poblacion, Guimbal, Iloilo", contact_type: "Fire", sort_order: 5 },
  ]);
  if (ecErr) throw new Error(`emergency_contacts insert failed: ${ecErr.message}`);
  await db.from("committees").insert([
    { role_name: "Meet Chairperson", person_name: "(to be announced)", sort_order: 1 },
    { role_name: "Tournament Manager", person_name: "(to be announced)", sort_order: 2 },
    { role_name: "Secretariat Head", person_name: "(to be announced)", sort_order: 3 },
    { role_name: "Board of Officials Chair", person_name: "(to be announced)", sort_order: 4 },
  ]);

  // 14) Hall of Records — sample standing records --------------------------
  console.log("  • hall of records (sample)");
  await db.from("records").insert([
    { sport: "Athletics", event_name: "100m Dash", record_holder: "Maria Santos", delegation: "Guimbal", mark: "12.05s", level: "Secondary", year_set: 2024, sort_order: 1 },
    { sport: "Athletics", event_name: "Long Jump", record_holder: "Jose Cruz", delegation: "Oton", mark: "6.42m", level: "Secondary", year_set: 2023, sort_order: 2 },
    { sport: "Athletics", event_name: "4x100m Relay", record_holder: "Igbaras Relay Team", delegation: "Igbaras", mark: "47.88s", level: "Secondary", year_set: 2022, sort_order: 3 },
    { sport: "Swimming", event_name: "50m Freestyle", record_holder: "Ana Reyes", delegation: "Tigbauan", mark: "27.31s", level: "Secondary", year_set: 2025, sort_order: 1 },
    { sport: "Swimming", event_name: "100m Freestyle", record_holder: "Pedro Garcia", delegation: "Miagao", mark: "58.90s", level: "Elementary", year_set: 2024, sort_order: 2 },
    { sport: "Chess", event_name: "Standard", record_holder: "Liza Bautista", delegation: "San Joaquin", mark: "9.0 / 9 — undefeated", level: "Elementary", year_set: 2025, sort_order: 1 },
  ]);

  // 15) Mascot, host map, and sample feedback ------------------------------
  console.log("  • mascot + host map + feedback");
  await db.from("mascot").insert({
    name: "“Sunny” the Sun",
    tagline: "Spirit of the Rising District",
    description:
      "Sunny is the official mascot of the FCDSA Meet 2026 — a radiant sun inspired by Guimbal, the “Town of the Rising Sun & Sons.” Sunny embodies the energy, warmth, and unity of the First Congressional District's young athletes.\n\nWherever the games are played, Sunny cheers on every delegation — a reminder that sportsmanship shines brightest when the whole district competes as one. (SEED DATA)",
    symbolism:
      "Gold rays — excellence and the dawn of new champions.\nGreen base — the fields and shores of Guimbal.\nEight rays — the spirit shared across the district's towns.",
    image_url: "",
  });
  await db.from("host_map").insert({
    embed_url: "https://maps.google.com/maps?q=Guimbal,Iloilo&output=embed",
  });
  await db.from("feedback").insert([
    { name: "Coach Ramon", email: "ramon@example.com", subject: "Schedule clarification", message: "Will the swimming heats start on time on Day 2? Our team needs to plan transport. (SEED DATA)" },
    { name: "", email: "", subject: "", message: "The live tally page is great — very easy to follow from home! (SEED DATA, anonymous)" },
    { name: "Parent — Tigbauan", email: "parent@example.com", subject: "Parking", message: "Is there designated parking near the City Gymnasium for spectators? (SEED DATA)" },
  ]);

  console.log("\n✓ Seed complete.");
  console.log(`  Admin login:   ${adminEmail} / ${adminPassword}`);
  console.log(`  Encoder login: ${encoderEmail} / ${encoderPassword}`);
  console.log(
    `  ${delegations!.length} delegations, ${athletes!.length} athletes, ${events!.length} events, ${resultRows.length} results.`
  );
  console.log(
    "  + venues, schedules, announcements, livestreams, emergency contacts, committees, records, mascot, host map, feedback."
  );
}

main().catch((e) => {
  console.error("Seed failed:", e);
  process.exit(1);
});
