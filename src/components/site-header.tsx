import Link from "next/link";
import Image from "next/image";
import { SiteNav } from "@/components/site-nav";

export function SiteHeader() {
  return (
    <header className="sticky top-0 z-50 border-b border-on-inv/10 bg-surface-inv text-on-inv">
      <div className="container flex h-16 items-center justify-between">
        {/* Wordmark */}
        <Link href="/" className="group flex items-center gap-2.5">
          <span className="inline-flex items-center justify-center rounded bg-white p-1 shadow-sm ring-1 ring-black/5">
            <Image
              src="/logo.jpg"
              alt="FCDSA Meet Guimbal 2026 logo"
              width={1366}
              height={2049}
              priority
              className="h-9 w-auto"
            />
          </span>
          <span className="flex items-baseline gap-2.5">
            <span className="font-display text-2xl font-black uppercase leading-none tracking-[0.04em] text-on-inv transition-colors group-hover:text-gold">
              FCDSA
            </span>
            <span className="font-mono-data text-[10px] uppercase tracking-[0.3em] text-on-inv/45">
              Meet&nbsp;&rsquo;26
            </span>
          </span>
        </Link>

        {/* Grouped dropdown nav + mobile drawer */}
        <SiteNav />
      </div>
    </header>
  );
}
