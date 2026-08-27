function KPICard({ label, value, hint, icon: Icon }) {
  return (
    <article className="rounded-lg border border-slate-200/80 bg-sentinel-card p-4 shadow-sm">
      <div className="flex items-start justify-between gap-3">
        <p className="text-xs font-medium uppercase tracking-wide text-slate-500">{label}</p>
        {Icon ? (
          <Icon className="h-4 w-4 shrink-0 text-sentinel-teal" aria-hidden="true" />
        ) : null}
      </div>
      <p className="mt-2 text-2xl font-semibold tabular-nums text-sentinel-ink">{value}</p>
      {hint ? <p className="mt-1 text-xs text-slate-500">{hint}</p> : null}
    </article>
  )
}

export default KPICard
