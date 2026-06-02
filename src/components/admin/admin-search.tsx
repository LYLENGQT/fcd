"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { Search } from "lucide-react";
import { Input } from "@/components/ui/input";
import { ADMIN_CONTROL } from "@/components/admin/admin-ui";

/** Server-side search box for admin list pages. Navigates to `basePath?q=…`
 *  (dropping `page` so results start at page 1). Pairs with a `.ilike` query
 *  + the existing Pagination on the page. */
export function AdminSearch({
  basePath,
  placeholder = "Search…",
  initialQuery = "",
}: {
  basePath: string;
  placeholder?: string;
  initialQuery?: string;
}) {
  const router = useRouter();
  const [value, setValue] = useState(initialQuery);

  function submit(e: React.FormEvent) {
    e.preventDefault();
    const q = value.trim();
    router.push(q ? `${basePath}?q=${encodeURIComponent(q)}` : basePath);
  }

  return (
    <form onSubmit={submit} className="mb-5 flex max-w-md items-center gap-2">
      <div className="relative flex-1">
        <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-ink/40" />
        <Input
          value={value}
          onChange={(e) => setValue(e.target.value)}
          placeholder={placeholder}
          aria-label={placeholder}
          className={`${ADMIN_CONTROL} pl-9`}
        />
      </div>
      <button
        type="submit"
        className="bg-ink px-4 py-2 font-mono-data text-[11px] uppercase tracking-[0.2em] text-bone transition hover:bg-gold hover:text-ink"
      >
        Search
      </button>
      {initialQuery && (
        <Link
          href={basePath}
          className="font-mono-data text-[11px] uppercase tracking-[0.18em] text-ink/50 hover:text-crimson"
        >
          Clear
        </Link>
      )}
    </form>
  );
}
