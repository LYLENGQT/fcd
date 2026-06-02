"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { Search } from "lucide-react";

export function AthleteSearch({ initialQuery }: { initialQuery: string }) {
  const router = useRouter();
  const [value, setValue] = useState(initialQuery);

  function submit(e: React.FormEvent) {
    e.preventDefault();
    const params = value.trim() ? `?q=${encodeURIComponent(value.trim())}` : "";
    router.push(`/athletes${params}`);
  }

  return (
    <form
      onSubmit={submit}
      className="flex max-w-xl items-stretch border border-ink/25 bg-bone focus-within:border-ink"
    >
      <span className="flex items-center pl-4 text-ink/40">
        <Search className="h-4 w-4" />
      </span>
      <input
        value={value}
        onChange={(e) => setValue(e.target.value)}
        placeholder="Search athlete name…"
        aria-label="Search athletes"
        className="w-full bg-transparent px-3 py-3.5 font-editorial text-lg italic text-ink placeholder:text-ink/40 focus:outline-none"
      />
      <button
        type="submit"
        className="bg-ink px-6 font-mono-data text-[11px] uppercase tracking-[0.22em] text-bone transition-colors hover:bg-gold-deep"
      >
        Search
      </button>
    </form>
  );
}
