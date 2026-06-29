import Link from "next/link";

export default function NotFound() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center gap-6 bg-bone text-center">
      <div className="font-mono-data text-[11px] uppercase tracking-[0.3em] text-ink/35">
        404
      </div>
      <h1 className="font-display text-5xl font-black uppercase leading-none tracking-tight text-ink md:text-7xl">
        Page not found
      </h1>
      <p className="max-w-md font-editorial text-lg italic leading-relaxed text-ink/65">
        The page you&rsquo;re looking for doesn&rsquo;t exist or has been moved.
      </p>
      <Link
        href="/"
        className="inline-flex items-center gap-2 bg-ink px-6 py-3 font-display text-base font-bold uppercase tracking-wider text-bone transition hover:bg-gold hover:text-ink"
      >
        Back to home
      </Link>
    </div>
  );
}
