import { DAY_OPTIONS, SYNDROME_OPTIONS } from '../data/mockData'

function Sidebar({
  currentPage,
  syndrome,
  days,
  minScore,
  onSyndromeChange,
  onDaysChange,
  onMinScoreChange,
}) {
  const showFilters = currentPage === 'dashboard' || currentPage === 'alerts'

  return (
    <aside className="w-full shrink-0 border-b border-slate-200 bg-sentinel-card lg:w-64 lg:border-b-0 lg:border-r">
      <div className="p-4">
        <h2 className="text-sm font-semibold text-sentinel-ink">Context</h2>
        <p className="mt-1 text-xs leading-relaxed text-slate-500">
          Filters apply to this demo view only. They do not call an API yet (Phase 1).
        </p>

        {showFilters ? (
          <div className="mt-4 space-y-4">
            <label className="block text-xs font-medium text-slate-600">
              Syndrome
              <select
                className="mt-1 min-h-11 w-full rounded-md border border-slate-200 bg-white px-2 text-sm text-sentinel-ink"
                value={syndrome}
                onChange={(e) => onSyndromeChange(e.target.value)}
              >
                {SYNDROME_OPTIONS.map((opt) => (
                  <option key={opt} value={opt}>
                    {opt}
                  </option>
                ))}
              </select>
            </label>

            <fieldset>
              <legend className="text-xs font-medium text-slate-600">Time window</legend>
              <div className="mt-2 flex flex-wrap gap-2">
                {DAY_OPTIONS.map((d) => (
                  <button
                    key={d}
                    type="button"
                    onClick={() => onDaysChange(d)}
                    className={`min-h-11 rounded-md px-3 text-sm ${
                      days === d
                        ? 'bg-sentinel-teal text-white'
                        : 'bg-sentinel-mist text-sentinel-ink'
                    }`}
                  >
                    Last {d} days
                  </button>
                ))}
              </div>
            </fieldset>

            <label className="block text-xs font-medium text-slate-600">
              Minimum score: {minScore}
              <input
                type="range"
                min="0"
                max="100"
                step="1"
                value={minScore}
                onChange={(e) => onMinScoreChange(Number(e.target.value))}
                className="mt-2 w-full accent-sentinel-teal"
              />
            </label>
          </div>
        ) : (
          <p className="mt-4 text-sm text-slate-600">
            Open Dashboard or Alerts to filter the synthetic district list.
          </p>
        )}

        <p className="mt-6 text-xs text-slate-400">
          ASHA = community health worker reports. OPD = outpatient department. PHC = primary health
          centre.
        </p>
      </div>
    </aside>
  )
}

export default Sidebar
