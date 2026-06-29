"use client";

import { useEffect, useMemo, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { ArrowUpRight } from "lucide-react";
import { Field, AdminInput, AdminSelect } from "@/components/admin/admin-ui";
import { addResult, updateResult } from "../actions";
import type {
  Athlete,
  Delegation,
  GenderDiv,
  MedalKind,
  SchoolLevel,
} from "@/lib/database.types";

type AthleteOption = Pick<
  Athlete,
  "id" | "first_name" | "last_name" | "delegation_id" | "gender" | "level"
>;

const LEVEL_SHORT: Record<string, string> = {
  elementary: "Elem",
  secondary: "Sec",
};

/** Compact division label for an athlete, e.g. "Elem Boys" / "Sec Girls". */
function divisionTag(a: Pick<AthleteOption, "gender" | "level">): string {
  const lvl = a.level ? LEVEL_SHORT[a.level] ?? "" : "";
  const gen = a.gender ? a.gender[0].toUpperCase() + a.gender.slice(1) : "";
  return [lvl, gen].filter(Boolean).join(" ");
}

export type EditingResult = {
  id: string;
  delegation_id: string;
  athlete_id: string | null;
  placement: number;
  medal: MedalKind;
  mark: string | null;
};

export function EncodeForm({
  eventId,
  isTeamEvent,
  categoryName,
  categoryLevel,
  categoryGender,
  delegations,
  athletes,
  editing,
}: {
  eventId: string;
  isTeamEvent: boolean;
  categoryName: string;
  categoryLevel: SchoolLevel | null;
  categoryGender: GenderDiv | null;
  delegations: Delegation[];
  athletes: AthleteOption[];
  editing?: EditingResult;
}) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);
  const [delegationId, setDelegationId] = useState(editing?.delegation_id ?? "");
  const [athleteId, setAthleteId] = useState(editing?.athlete_id ?? "");

  // Athletes of the chosen delegation, and the subset eligible for THIS event's
  // division (category level + gender). Gender 'mixed' accepts any gender; a
  // null athlete level is treated as eligible (lenient — never hide an
  // unlabelled athlete).
  const { eligible, inDelegation } = useMemo(() => {
    const inDelegation = athletes.filter((a) => a.delegation_id === delegationId);
    const eligible = inDelegation.filter((a) => {
      const genderOk =
        !categoryGender ||
        categoryGender === "mixed" ||
        a.gender === "mixed" ||
        a.gender === categoryGender;
      const levelOk = !categoryLevel || a.level == null || a.level === categoryLevel;
      return genderOk && levelOk;
    });
    return { eligible, inDelegation };
  }, [athletes, delegationId, categoryGender, categoryLevel]);

  // Shown list: eligible athletes when there are any, else the delegation's full
  // roster as a fallback so a bad/missing division tag never blocks encoding.
  const options = eligible.length > 0 ? eligible : inDelegation;
  const usingFallback = eligible.length === 0 && inDelegation.length > 0;
  const autoSelected =
    !editing && eligible.length === 1 && athleteId === eligible[0].id;

  // Auto-select the lone eligible athlete; keep any already-rostered choice
  // (esp. the saved athlete in edit mode — checked against the FULL roster, not
  // just the eligible subset, so a legacy/mislabeled row is never overwritten);
  // otherwise clear.
  useEffect(() => {
    setAthleteId((prev) => {
      if (prev && inDelegation.some((a) => a.id === prev)) return prev;
      return eligible.length === 1 ? eligible[0].id : "";
    });
  }, [eligible, inDelegation]);

  function onSubmit(formData: FormData) {
    setError(null);
    startTransition(async () => {
      const res = editing
        ? await updateResult(editing.id, formData)
        : await addResult(formData);
      if (!res.ok) {
        setError(res.error);
        return;
      }
      if (editing) {
        router.push(`/admin/results/${eventId}`);
      } else {
        (document.getElementById("encode-form") as HTMLFormElement)?.reset();
        setDelegationId("");
        setAthleteId("");
      }
      router.refresh();
    });
  }

  return (
    <form id="encode-form" action={onSubmit} className="space-y-5">
      <input type="hidden" name="event_id" value={eventId} />

      <div className="grid gap-4 sm:grid-cols-2">
        <Field label="Delegation" htmlFor="delegation_id">
          <AdminSelect
            id="delegation_id"
            name="delegation_id"
            required
            value={delegationId}
            onChange={(e) => setDelegationId(e.target.value)}
          >
            <option value="">Select delegation…</option>
            {delegations.map((d) => (
              <option key={d.id} value={d.id}>
                {d.name} ({d.abbrev})
              </option>
            ))}
          </AdminSelect>
        </Field>

        {!isTeamEvent && (
          <Field label="Athlete" htmlFor="athlete_id">
            <AdminSelect
              id="athlete_id"
              name="athlete_id"
              required
              aria-describedby="athlete_hint"
              disabled={!delegationId}
              value={athleteId}
              onChange={(e) => setAthleteId(e.target.value)}
            >
              <option value="">
                {!delegationId
                  ? "Pick a delegation first"
                  : options.length === 0
                    ? "No athletes for this delegation"
                    : "Select athlete…"}
              </option>
              {options.map((a) => {
                const tag = divisionTag(a);
                return (
                  <option key={a.id} value={a.id}>
                    {a.first_name} {a.last_name}
                    {tag ? ` · ${tag}` : ""}
                  </option>
                );
              })}
            </AdminSelect>
            {delegationId && (
              <p
                id="athlete_hint"
                aria-live="polite"
                className="mt-1.5 font-mono-data text-[10px] uppercase tracking-[0.15em] text-ink/45"
              >
                {autoSelected
                  ? `Auto-selected · only ${categoryName || "division"} entry`
                  : usingFallback
                    ? `No exact ${categoryName || "division"} match — showing full roster`
                    : eligible.length > 1
                      ? `${eligible.length} ${categoryName || "division"} athletes — choose one`
                      : null}
              </p>
            )}
          </Field>
        )}

        <Field label="Placement" htmlFor="placement">
          <AdminSelect
            id="placement"
            name="placement"
            required
            defaultValue={String(editing?.placement ?? 1)}
          >
            <option value="1">1st (Gold)</option>
            <option value="2">2nd (Silver)</option>
            <option value="3">3rd (Bronze)</option>
            <option value="4">4th</option>
            <option value="5">5th</option>
            <option value="6">6th</option>
            <option value="7">7th</option>
            <option value="8">8th</option>
          </AdminSelect>
        </Field>

        <Field label="Medal" htmlFor="medal">
          <AdminSelect
            id="medal"
            name="medal"
            defaultValue={editing?.medal ?? "auto"}
          >
            <option value="auto">Auto (from placement)</option>
            <option value="gold">Gold</option>
            <option value="silver">Silver</option>
            <option value="bronze">Bronze</option>
            <option value="none">None</option>
          </AdminSelect>
        </Field>

        <Field label="Mark / Score (optional)" htmlFor="mark" className="sm:col-span-2">
          <AdminInput
            id="mark"
            name="mark"
            defaultValue={editing?.mark ?? ""}
            placeholder="e.g. 11.42s, 3 sets, 152 pts"
          />
        </Field>
      </div>

      {error && (
        <p
          role="alert"
          aria-live="assertive"
          className="border border-crimson/40 bg-crimson/10 px-3 py-2 font-mono-data text-xs uppercase tracking-[0.15em] text-crimson"
        >
          {error}
        </p>
      )}

      <div className="flex items-center gap-3">
        <button
          type="submit"
          disabled={pending}
          className="group inline-flex items-center gap-2 bg-ink px-6 py-3 font-display text-base font-bold uppercase tracking-wider text-bone transition hover:bg-gold hover:text-ink disabled:opacity-50"
        >
          {pending ? "Saving…" : editing ? "Save changes" : "Add result"}
          <ArrowUpRight className="h-4 w-4 transition-transform group-hover:-translate-y-0.5 group-hover:translate-x-0.5" />
        </button>
        {editing && (
          <button
            type="button"
            onClick={() => router.push(`/admin/results/${eventId}`)}
            className="font-mono-data text-[11px] uppercase tracking-[0.2em] text-ink/55 hover:text-ink"
          >
            Cancel
          </button>
        )}
      </div>
    </form>
  );
}
