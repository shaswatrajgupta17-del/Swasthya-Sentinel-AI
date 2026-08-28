function KPICard({ label, value, hint, icon: Icon, color = 'teal' }) {
  const colorMap = {
    teal: 'bg-sentinel-teal/10 text-sentinel-teal border-sentinel-teal/20',
    rose: 'bg-rose-50 text-rose-700 border-rose-200',
    amber: 'bg-amber-50 text-amber-700 border-amber-200',
    slate: 'bg-slate-100 text-slate-700 border-slate-200',
    indigo: 'bg-indigo-50 text-indigo-700 border-indigo-200',
  }

  return (
    <div className="flex flex-col justify-between rounded-lg border border-slate-200 bg-white p-4 shadow-xs">
      <div className="flex items-start justify-between gap-3">
        <p className="text-xs font-semibold uppercase tracking-wider text-slate-500">
          {label}
        </p>
        {Icon && (
          <div className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-md border ${colorMap[color] || colorMap.teal}`} aria-hidden="true">
            <Icon className="h-4 w-4" />
          </div>
        )}
      </div>

      <div className="mt-2.5">
        <p className="tabular-nums text-2xl font-bold tracking-tight text-sentinel-ink sm:text-3xl">
          {value}
        </p>
        {hint && (
          <p className="mt-1 text-[11px] font-medium text-slate-500 truncate">
            {hint}
          </p>
        )}
      </div>
    </div>
  )
}

export default KPICard
