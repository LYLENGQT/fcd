import type { ReactNode } from "react";
import { ChevronDown } from "lucide-react";
import { cn } from "@/lib/utils";

/** Editorial override for ui Input/Select/Textarea inside admin forms:
 *  squared corners, ink border, bone field, gold focus ring. */
export const ADMIN_CONTROL =
  "rounded-none border-ink/25 bg-bone text-ink focus-visible:ring-gold-deep";

// ── Editorial form controls ──────────────────────────────────────────────
// Squared, ink-bordered, bone-filled, gold focus ring — cohesive with the
// admin design system. Used inside <Field> in the entity *-fields.tsx forms.

const FIELD_BASE =
  "w-full rounded-none border border-ink/25 bg-bone text-ink placeholder:text-ink/35 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gold-deep focus-visible:border-gold-deep disabled:cursor-not-allowed disabled:opacity-50";

export function AdminInput({
  className,
  ...props
}: React.InputHTMLAttributes<HTMLInputElement>) {
  return <input {...props} className={cn(FIELD_BASE, "h-10 px-3 text-sm", className)} />;
}

export function AdminTextarea({
  className,
  ...props
}: React.TextareaHTMLAttributes<HTMLTextAreaElement>) {
  return (
    <textarea
      {...props}
      className={cn(FIELD_BASE, "min-h-[96px] px-3 py-2 text-sm leading-relaxed", className)}
    />
  );
}

/** Native <select> with a custom chevron (appearance-none) so it matches the
 *  editorial controls instead of the browser default. */
export function AdminSelect({
  className,
  children,
  ...props
}: React.SelectHTMLAttributes<HTMLSelectElement>) {
  return (
    <div className="relative">
      <select
        {...props}
        className={cn(
          FIELD_BASE,
          "h-10 cursor-pointer appearance-none py-0 pl-3 pr-9 text-sm",
          className,
        )}
      >
        {children}
      </select>
      <ChevronDown
        aria-hidden
        className="pointer-events-none absolute right-2.5 top-1/2 h-4 w-4 -translate-y-1/2 text-ink/45"
      />
    </div>
  );
}

/** Editorial checkbox + inline label (mono-data), gold when checked. */
export function AdminCheckbox({
  label,
  ...props
}: { label: string } & React.InputHTMLAttributes<HTMLInputElement>) {
  return (
    <label className="flex cursor-pointer items-center gap-2.5 font-mono-data text-[11px] uppercase tracking-[0.15em] text-ink/70">
      <input
        type="checkbox"
        {...props}
        className="h-4 w-4 rounded-none border-ink/30 text-gold-deep accent-gold-deep focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gold-deep"
      />
      {label}
    </label>
  );
}

/** Editorial section wrapper for admin page bodies. */
export function AdminSection({
  children,
  className,
}: {
  children: ReactNode;
  className?: string;
}) {
  return (
    <section className={cn("container py-10 md:py-14", className)}>
      {children}
    </section>
  );
}

/** A bone-toned bordered card used to frame admin forms. */
export function FormCard({
  title,
  description,
  children,
}: {
  title: string;
  description?: string;
  children: ReactNode;
}) {
  return (
    <div className="border border-ink/15 bg-bone-2/40">
      <div className="border-b border-ink/15 bg-surface-inv px-5 py-3 text-on-inv">
        <h2 className="font-display text-lg font-bold uppercase tracking-wide">
          {title}
        </h2>
        {description && (
          <p className="mt-0.5 font-mono-data text-[10px] uppercase tracking-[0.18em] text-on-inv/55">
            {description}
          </p>
        )}
      </div>
      <div className="p-5">{children}</div>
    </div>
  );
}

/** Label + control wrapper with a mono-data label. */
export function Field({
  label,
  htmlFor,
  hint,
  children,
  className,
}: {
  label: string;
  htmlFor?: string;
  hint?: string;
  children: ReactNode;
  className?: string;
}) {
  return (
    <div className={cn("space-y-1.5", className)}>
      <label
        htmlFor={htmlFor}
        className="block font-mono-data text-[10px] uppercase tracking-[0.2em] text-ink/60"
      >
        {label}
      </label>
      {children}
      {hint && <p className="font-mono-data text-[10px] text-ink/45">{hint}</p>}
    </div>
  );
}

/** Editorial heading bar for a list/table section. */
export function ListHeading({
  title,
  count,
  countNoun = "items",
}: {
  title: string;
  count: number;
  countNoun?: string;
}) {
  return (
    <header className="flex items-end justify-between border-b-2 border-ink pb-3">
      <h2 className="font-display text-2xl font-black uppercase tracking-tight md:text-3xl">
        {title}
      </h2>
      <span className="font-mono-data text-[11px] uppercase tracking-[0.25em] text-ink/50">
        {count} {countNoun}
      </span>
    </header>
  );
}

/** Bordered editorial table; pass <Th> cells as `head` and <tr>/<Td> rows as children. */
export function AdminTable({
  head,
  children,
  minWidth = 640,
}: {
  head: ReactNode;
  children: ReactNode;
  minWidth?: number;
}) {
  return (
    <div className="overflow-x-auto border border-ink/15">
      <table
        className="w-full border-collapse"
        style={{ minWidth: `${minWidth}px` }}
      >
        <thead>
          <tr className="border-b-2 border-ink bg-surface-inv text-on-inv">{head}</tr>
        </thead>
        <tbody className="divide-y divide-ink/12">{children}</tbody>
      </table>
    </div>
  );
}

export function Th({
  children,
  align = "left",
  className,
  title,
}: {
  children?: ReactNode;
  align?: "left" | "center" | "right";
  className?: string;
  title?: string;
}) {
  return (
    <th
      title={title}
      className={cn(
        "px-4 py-3 font-mono-data text-[10px] uppercase tracking-[0.22em] text-on-inv/70",
        align === "center" && "text-center",
        align === "right" && "text-right",
        align === "left" && "text-left",
        className
      )}
    >
      {children}
    </th>
  );
}

export function Td({
  children,
  align = "left",
  className,
  title,
}: {
  children?: ReactNode;
  align?: "left" | "center" | "right";
  className?: string;
  title?: string;
}) {
  return (
    <td
      title={title}
      className={cn(
        "px-4 py-3 align-middle",
        align === "center" && "text-center",
        align === "right" && "text-right",
        className
      )}
    >
      {children}
    </td>
  );
}

/** A standard bone table row with hover. */
export function Tr({ children }: { children: ReactNode }) {
  return (
    <tr className="bg-bone transition-colors hover:bg-ink/[0.06]">{children}</tr>
  );
}

/** Empty-state cell for tables/lists. */
export function EmptyState({ children }: { children: ReactNode }) {
  return (
    <div className="border border-ink/15 px-6 py-16 text-center font-editorial text-2xl italic text-ink/45">
      {children}
    </div>
  );
}
