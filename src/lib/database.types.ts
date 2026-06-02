// Hand-maintained types mirroring supabase/migrations. Keep in sync with SQL.
// (For a larger project, generate with `supabase gen types typescript`.)

export type UserRole = "admin" | "encoder" | "viewer";
export type GenderDiv = "boys" | "girls" | "mixed";
export type SchoolLevel = "elementary" | "secondary";
export type EventTypeEnum = "individual" | "team";
export type ScheduleStatus = "scheduled" | "ongoing" | "finished" | "cancelled";
export type MedalKind = "gold" | "silver" | "bronze" | "none";
export type StreamPlatform = "youtube" | "facebook" | "other";

export interface Profile {
  id: string;
  email: string;
  full_name: string | null;
  role: UserRole;
  created_at: string;
}

export interface Delegation {
  id: string;
  name: string;
  abbrev: string;
  slug: string;
  logo_url: string | null;
  color: string;
  created_at: string;
}

export interface School {
  id: string;
  delegation_id: string;
  name: string;
  level: SchoolLevel | null;
  created_at: string;
}

export interface Athlete {
  id: string;
  delegation_id: string;
  school_id: string | null;
  first_name: string;
  last_name: string;
  gender: GenderDiv;
  level: SchoolLevel | null;
  photo_url: string | null;
  created_at: string;
}

export interface Sport {
  id: string;
  name: string;
  slug: string;
  icon: string | null;
  created_at: string;
}

export interface Category {
  id: string;
  name: string;
  level: SchoolLevel;
  gender: GenderDiv;
  created_at: string;
}

export interface EventRow {
  id: string;
  sport_id: string;
  category_id: string;
  name: string;
  type: EventTypeEnum;
  created_at: string;
}

export interface Schedule {
  id: string;
  event_id: string;
  venue: string;
  start_at: string;
  status: ScheduleStatus;
  created_at: string;
}

export interface Result {
  id: string;
  event_id: string;
  delegation_id: string;
  athlete_id: string | null;
  placement: number;
  medal: MedalKind;
  mark: string | null;
  recorded_by: string | null;
  recorded_at: string;
  created_at: string;
}

export interface MedalTallyRow {
  delegation_id: string;
  delegation_name: string;
  abbrev: string;
  slug: string;
  color: string;
  gold: number;
  silver: number;
  bronze: number;
  total: number;
  rank: number;
}

export interface StandingsRow {
  delegation_id: string;
  delegation_name: string;
  abbrev: string;
  slug: string;
  color: string;
  gold: number;
  silver: number;
  bronze: number;
  points: number;
  rank: number;
}

export interface Venue {
  id: string;
  name: string;
  address: string | null;
  map_url: string | null;
  created_at: string;
}

export interface Announcement {
  id: string;
  title: string;
  body: string;
  pinned: boolean;
  published: boolean;
  published_at: string;
  author_id: string | null;
  created_at: string;
}

export interface Livestream {
  id: string;
  title: string;
  embed_url: string;
  platform: StreamPlatform;
  event_id: string | null;
  is_live: boolean;
  starts_at: string | null;
  created_at: string;
}

export interface AuditLog {
  id: number;
  actor_id: string | null;
  action: string;
  entity: string;
  entity_id: string | null;
  details: Record<string, unknown> | null;
  created_at: string;
}
