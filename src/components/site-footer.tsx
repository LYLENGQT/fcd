import Link from "next/link";
import Image from "next/image";
import { MEET_FULL_NAME, MEET_TAGLINE } from "@/lib/constants";

export function SiteFooter() {
  return (
    <footer className="bg-surface-inv text-on-inv">
      <div className="container grid gap-8 py-14 md:grid-cols-3">
        <div>
          <div className="flex items-center gap-2.5">
            <span className="inline-flex items-center justify-center rounded bg-white p-1">
              <Image
                src="/logo.jpg"
                alt="FCDSA Meet Guimbal 2026 logo"
                width={1366}
                height={2049}
                className="h-9 w-auto"
              />
            </span>
            <span className="font-display text-2xl font-black uppercase tracking-[0.08em]">
              FCDSA
            </span>
          </div>
          <p className="mt-3 max-w-sm font-editorial text-sm italic leading-relaxed text-on-inv/70">
            {MEET_FULL_NAME}
          </p>
        </div>
        <div className="font-mono-data text-[11px] uppercase tracking-[0.25em] text-on-inv/55 md:self-center">
          {MEET_TAGLINE}
        </div>
        <div className="flex items-end justify-start gap-6 md:justify-end">
          <Link
            href="/announcements"
            className="font-mono-data text-[11px] uppercase tracking-[0.2em] text-on-inv/70 transition-colors hover:text-on-inv"
          >
            Bulletin
          </Link>
          <Link
            href="/livestream"
            className="font-mono-data text-[11px] uppercase tracking-[0.2em] text-on-inv/70 transition-colors hover:text-on-inv"
          >
            Live
          </Link>
          <Link
            href="/admin"
            className="font-mono-data text-[11px] uppercase tracking-[0.2em] text-on-inv/70 transition-colors hover:text-on-inv"
          >
            Admin
          </Link>
        </div>
      </div>
      <div className="border-t border-on-inv/10">
        <div className="container flex h-12 items-center justify-between font-mono-data text-[10px] uppercase tracking-[0.25em] text-on-inv/45">
          <span>© {new Date().getFullYear()} FCDSA</span>
          <span>Province of Iloilo · Philippines</span>
        </div>
      </div>
    </footer>
  );
}
