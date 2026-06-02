import Link from "next/link";
import { SiteNav } from "@/components/site-nav";

export function SiteHeader() {
  return (
    <header className="sticky top-0 z-50 border-b border-on-inv/10 bg-surface-inv text-on-inv">
      <div className="container flex h-16 items-center justify-between">
        {/* Wordmark */}
        <Link href="/" className="group flex items-baseline gap-2.5">
          <span className="font-display text-2xl font-black uppercase leading-none tracking-[0.04em] text-on-inv transition-colors group-hover:text-gold">
            FCDSA
          </span>
          <span className="hidden font-mono-data text-[10px] uppercase tracking-[0.3em] text-on-inv/45 sm:inline">
            Meet&nbsp;&rsquo;26
          </span>
        </Link>

        {/* Grouped dropdown nav + mobile drawer */}
        <SiteNav />
      </div>
    </header>
  );
}
