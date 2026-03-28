export default function PerformanceLoading() {
  return (
    <main className="space-y-6">
      {/* Heading skeleton */}
      <div className="border-b border-stone-200 pb-4">
        <div className="h-7 w-36 bg-stone-200 rounded animate-pulse" />
      </div>

      {/* Section 1: Recent Batch skeleton */}
      <section>
        <div className="h-3 w-24 bg-stone-200 rounded animate-pulse mb-3" />
        <div className="bg-white rounded-xl border border-stone-200 divide-y divide-stone-100">
          {[1, 2, 3, 4].map(i => (
            <div key={i} className="h-[44px] px-4 flex items-center">
              <div className="h-4 w-full bg-stone-200 rounded animate-pulse" />
            </div>
          ))}
        </div>
      </section>

      {/* Section 2: Batch History skeleton */}
      <section>
        <div className="h-3 w-24 bg-stone-200 rounded animate-pulse mb-3" />
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {[1, 2].map(i => (
            <div key={i} className="h-24 bg-stone-200 rounded-xl animate-pulse" />
          ))}
        </div>
      </section>

      {/* Section 3: Strain Totals skeleton */}
      <section>
        <div className="h-3 w-24 bg-stone-200 rounded animate-pulse mb-3" />
        <div className="bg-white rounded-xl border border-stone-200 divide-y divide-stone-100 px-4">
          {[1, 2, 3].map(i => (
            <div key={i} className="h-[40px] flex items-center">
              <div className="h-4 w-full bg-stone-200 rounded animate-pulse" />
            </div>
          ))}
        </div>
      </section>
    </main>
  )
}
