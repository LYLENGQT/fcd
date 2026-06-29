// Shared, app-wide constants.

export const MEET_NAME = "FCDSA Meet 2026";
export const MEET_FULL_NAME =
  "First Congressional District Sports Association Meet 2026";
export const MEET_TAGLINE = "One District. One Spirit. One Goal.";

// Meet competition window (Asia/Manila dates, inclusive). Drives the home-page
// day counter. Update these to the real dates when finalized.
export const MEET_START = "2026-10-14";
export const MEET_END = "2026-10-28";

// Pagination page sizes (rows/cards per page).
export const PAGE_SIZE_ADMIN = 20;
export const PAGE_SIZE_PUBLIC = 12;

export type NavLink = { href: string; label: string };
export type NavGroup = { label: string; items: readonly NavLink[] };
export type NavEntry = NavLink | NavGroup;

export function isNavGroup(entry: NavEntry): entry is NavGroup {
  return "items" in entry;
}

// Grouped primary navigation rendered as dropdown categories in the header.
export const PUBLIC_NAV_GROUPS: readonly NavEntry[] = [
  { href: "/", label: "Home" },
  {
    label: "Rankings",
    items: [
      { href: "/tally", label: "Medal Tally" },
      { href: "/standings", label: "Standings" },
      { href: "/tally/breakdown", label: "Medal Breakdown" },
      { href: "/records", label: "Hall of Records" },
    ],
  },
  {
    label: "Program",
    items: [
      { href: "/schedule", label: "Schedule" },
      { href: "/results", label: "Results" },
      { href: "/venues", label: "Venues" },
    ],
  },
  {
    label: "Teams",
    items: [
      { href: "/delegations", label: "Delegations" },
      { href: "/athletes", label: "Athletes" },
    ],
  },
  {
    label: "Coverage",
    items: [
      { href: "/announcements", label: "Announcements" },
      { href: "/livestream", label: "Livestream" },
    ],
  },
  {
    label: "About",
    items: [
      { href: "/mascot", label: "The Mascot" },
      { href: "/feedback", label: "Feedback" },
    ],
  },
  {
    label: "Host",
    items: [
      { href: "/host/overview", label: "Overview" },
      { href: "/host/accommodation", label: "Accommodation" },
      { href: "/host/food-dining", label: "Food & Dining" },
      { href: "/host/tourist-spots", label: "Tourist Spots" },
      { href: "/host/transportation", label: "Transportation" },
      { href: "/host/map", label: "Map (Poblacion)" },
      { href: "/host/emergency", label: "Emergency Directory" },
      { href: "/host/committees", label: "Committees" },
    ],
  },
];

// Flat list of every public link — derived from the groups so it can never
// drift. Used by the sitemap and anywhere a flat nav is needed.
export const PUBLIC_NAV: readonly NavLink[] = PUBLIC_NAV_GROUPS.flatMap((e) =>
  isNavGroup(e) ? e.items : [e]
);

export const ADMIN_NAV = [
  { href: "/admin", label: "Dashboard" },
  { href: "/admin/results", label: "Results / Encoding" },
  { href: "/admin/schedule", label: "Schedule" },
  { href: "/admin/sports", label: "Sports" },
  { href: "/admin/categories", label: "Categories" },
  { href: "/admin/events", label: "Events" },
  { href: "/admin/venues", label: "Venues" },
  { href: "/admin/delegations", label: "Delegations" },
  { href: "/admin/athletes", label: "Athletes" },
  { href: "/admin/announcements", label: "Announcements" },
  { href: "/admin/livestreams", label: "Livestreams" },
  { href: "/admin/records", label: "Hall of Records" },
  { href: "/admin/mascot", label: "Mascot" },
  { href: "/admin/host", label: "Host Info" },
  { href: "/admin/feedback", label: "Feedback" },
  { href: "/admin/audit", label: "Audit Log" },
] as const;
