export function PageLoadingSkeleton() {
  return (
    <div className="min-h-[560px] bg-slate-50" aria-busy="true" aria-label="Loading page" role="status">
      <section className="min-h-[280px] sm:min-h-[340px] py-14 sm:py-20 px-4 sm:px-6 lg:px-8 bg-[#1a2a40]">
        <div className="max-w-7xl mx-auto grid gap-4.5 content-center">
          <span className="block w-[150px] h-3.5 rounded bg-white/16 animate-pulse" />
          <span className="block w-[88%] sm:w-[620px] h-9 sm:h-[54px] rounded-lg bg-white/16 animate-pulse" />
          <span className="block w-[68%] sm:w-[430px] h-9 sm:h-[54px] rounded-lg bg-white/16 animate-pulse" />
        </div>
      </section>
      <section className="max-w-7xl mx-auto py-12 sm:py-14 px-4 sm:px-6 lg:px-8">
        <span className="block w-full sm:w-[760px] h-4.5 mb-8 rounded bg-slate-200 animate-pulse" />
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4.5">
          <span className="block min-h-[112px] sm:min-h-[150px] rounded-2xl bg-white border border-slate-200 animate-pulse" />
          <span className="block min-h-[112px] sm:min-h-[150px] rounded-2xl bg-white border border-slate-200 animate-pulse" />
          <span className="block min-h-[112px] sm:min-h-[150px] rounded-2xl bg-white border border-slate-200 animate-pulse" />
        </div>
      </section>
      <span className="sr-only">Loading page</span>
    </div>
  );
}
