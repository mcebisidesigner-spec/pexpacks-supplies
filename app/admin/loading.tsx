const METRIC_PLACEHOLDERS = ["Revenue", "Orders", "Payments", "Fulfilment"];

export default function AdminDashboardLoading() {
  return (
    <div
      className="flex flex-col gap-6 animate-pulse"
      aria-busy="true"
      aria-label="Loading dashboard"
    >
      <div className="flex flex-col gap-2 max-w-md">
        <div className="w-28 h-3 bg-slate-800 rounded-md" />
        <div className="w-52 h-8 bg-slate-800 rounded-lg" />
        <div className="w-80 h-3 bg-slate-800/80 rounded-md" />
      </div>

      <div
        className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4"
        aria-hidden="true"
      >
        {METRIC_PLACEHOLDERS.map((label) => (
          <div
            className="flex flex-col justify-between p-5 min-h-[148px] bg-slate-900 border border-slate-800 rounded-2xl"
            key={label}
          >
            <div className="w-20 h-3 bg-slate-800 rounded" />
            <div className="w-28 h-8 bg-slate-800 rounded-lg" />
            <div className="w-32 h-2.5 bg-slate-800/60 rounded" />
          </div>
        ))}
      </div>

      <div
        className="grid grid-cols-1 lg:grid-cols-12 gap-4"
        aria-hidden="true"
      >
        <div className="lg:col-span-5 min-h-[280px] bg-slate-900 border border-slate-800 rounded-2xl" />
        <div className="lg:col-span-4 min-h-[280px] bg-slate-900 border border-slate-800 rounded-2xl" />
        <div className="lg:col-span-3 min-h-[280px] bg-slate-900 border border-slate-800 rounded-2xl" />
      </div>

      <div
        className="grid grid-cols-1 lg:grid-cols-12 gap-4"
        aria-hidden="true"
      >
        <div className="lg:col-span-7 min-h-[290px] bg-slate-900 border border-slate-800 rounded-2xl" />
        <div className="lg:col-span-5 min-h-[290px] bg-slate-900 border border-slate-800 rounded-2xl" />
      </div>
    </div>
  );
}
