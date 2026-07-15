import Image from "next/image";
import { cn } from "@/lib/utils";

/**
 * Athlete avatar: the real headshot when one exists, otherwise the athlete's
 * initials on a tile in their delegation's color. Sizing/ring classes come from
 * `className` so it works on both light cards and dark mastheads.
 */
export function AthleteAvatar({
  firstName,
  lastName,
  photoUrl,
  color,
  className,
}: {
  firstName: string;
  lastName: string;
  photoUrl?: string | null;
  color?: string | null;
  className?: string;
}) {
  const label = `${firstName} ${lastName}`.trim();

  if (photoUrl) {
    return (
      <Image
        src={photoUrl}
        alt={label}
        width={128}
        height={128}
        className={cn("shrink-0 rounded-full object-cover", className)}
      />
    );
  }

  const initials =
    `${firstName?.[0] ?? ""}${lastName?.[0] ?? ""}`.toUpperCase() || "?";

  return (
    <span
      role="img"
      aria-label={label}
      style={{ backgroundColor: color || "hsl(var(--ink))" }}
      className={cn(
        "grid shrink-0 place-items-center rounded-full font-display font-black uppercase leading-none text-white",
        className
      )}
    >
      {initials}
    </span>
  );
}
