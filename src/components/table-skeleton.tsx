/** Editorial loading placeholder mirroring the masthead + list layout. */
export function TableSkeleton({ rows = 6 }: { rows?: number }) {
  return (
    <div className="animate-pulse">
      {/* Masthead band */}
      <div className="border-b border-on-inv/10 bg-surface-inv py-14 md:py-20">
        <div className="container">
          <div className="h-3 w-40 bg-on-inv/15" />
          <div className="mt-5 h-16 w-72 bg-on-inv/20 md:h-24 md:w-96" />
          <div className="mt-5 h-4 w-full max-w-md bg-on-inv/10" />
        </div>
      </div>
      {/* List */}
      <div className="container py-14 md:py-20">
        <div className="h-3 w-56 bg-ink/20" />
        <div className="mt-8 divide-y divide-ink/10 border-y border-ink/15">
          {Array.from({ length: rows }).map((_, i) => (
            <div key={i} className="flex items-center justify-between py-6">
              <div className="h-6 w-1/3 bg-ink/15" />
              <div className="h-6 w-24 bg-ink/10" />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
