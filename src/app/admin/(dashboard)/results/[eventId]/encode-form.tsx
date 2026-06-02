"use client";

import { useMemo, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { ArrowUpRight } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import { Field, ADMIN_CONTROL } from "@/components/admin/admin-ui";
import { addResult, updateResult } from "../actions";
import type { Athlete, Delegation, MedalKind } from "@/lib/database.types";

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
  delegations,
  athletes,
  editing,
}: {
  eventId: string;
  isTeamEvent: boolean;
  delegations: Delegation[];
  athletes: Pick<Athlete, "id" | "first_name" | "last_name" | "delegation_id">[];
  editing?: EditingResult;
}) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);
  const [delegationId, setDelegationId] = useState(editing?.delegation_id ?? "");

  const filteredAthletes = useMemo(
    () => athletes.filter((a) => a.delegation_id === delegationId),
    [athletes, delegationId]
  );

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
      }
      router.refresh();
    });
  }

  return (
    <form id="encode-form" action={onSubmit} className="space-y-5">
      <input type="hidden" name="event_id" value={eventId} />

      <div className="grid gap-4 sm:grid-cols-2">
        <Field label="Delegation" htmlFor="delegation_id">
          <Select
            id="delegation_id"
            name="delegation_id"
            required
            value={delegationId}
            onChange={(e) => setDelegationId(e.target.value)}
            className={ADMIN_CONTROL}
          >
            <option value="">Select delegation…</option>
            {delegations.map((d) => (
              <option key={d.id} value={d.id}>
                {d.name} ({d.abbrev})
              </option>
            ))}
          </Select>
        </Field>

        {!isTeamEvent && (
          <Field label="Athlete" htmlFor="athlete_id">
            <Select
              id="athlete_id"
              name="athlete_id"
              disabled={!delegationId}
              defaultValue={editing?.athlete_id ?? ""}
              className={ADMIN_CONTROL}
            >
              <option value="">
                {delegationId ? "Select athlete…" : "Pick a delegation first"}
              </option>
              {filteredAthletes.map((a) => (
                <option key={a.id} value={a.id}>
                  {a.first_name} {a.last_name}
                </option>
              ))}
            </Select>
          </Field>
        )}

        <Field label="Placement" htmlFor="placement">
          <Select
            id="placement"
            name="placement"
            required
            defaultValue={String(editing?.placement ?? 1)}
            className={ADMIN_CONTROL}
          >
            <option value="1">1st (Gold)</option>
            <option value="2">2nd (Silver)</option>
            <option value="3">3rd (Bronze)</option>
            <option value="4">4th</option>
            <option value="5">5th</option>
            <option value="6">6th</option>
            <option value="7">7th</option>
            <option value="8">8th</option>
          </Select>
        </Field>

        <Field label="Medal" htmlFor="medal">
          <Select
            id="medal"
            name="medal"
            defaultValue={editing?.medal ?? "auto"}
            className={ADMIN_CONTROL}
          >
            <option value="auto">Auto (from placement)</option>
            <option value="gold">Gold</option>
            <option value="silver">Silver</option>
            <option value="bronze">Bronze</option>
            <option value="none">None</option>
          </Select>
        </Field>

        <Field label="Mark / Score (optional)" htmlFor="mark" className="sm:col-span-2">
          <Input
            id="mark"
            name="mark"
            defaultValue={editing?.mark ?? ""}
            placeholder="e.g. 11.42s, 3 sets, 152 pts"
            className={ADMIN_CONTROL}
          />
        </Field>
      </div>

      {error && (
        <p className="border border-crimson/40 bg-crimson/10 px-3 py-2 font-mono-data text-xs uppercase tracking-[0.15em] text-crimson">
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
