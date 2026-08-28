import { Filter, Clock } from 'lucide-react'

const SYNDROME_OPTIONS = ['All', 'Fever', 'Diarrhea', 'Cough', 'Rash']
const DAY_OPTIONS = [7, 14, 30]

function Sidebar({
  currentPage,
  syndrome,
  days,
  minScore,
  onSyndromeChange,
  onDaysChange,
  onMinScoreChange,
}) {
  const showFilters = currentPage === 'dashboard' || currentPage === 'map' || currentPage === 'alerts'

  return (
    <aside className="w-full shrink-0 border-b border-slate-200 bg-white lg:w-64 lg:border-b-0 lg:border-r shadow-xs">
      <div className="p-4.5 space-y-5">
        <div className="flex items-center gap-2 border-b border-slate-100 pb-3">
          <Filter className="h-4 w-4 text-sentinel-teal" />
          <h2 className="text-xs font-bold text-sentinel-ink uppercase tracking-wider">
            Surveillance Filters
          </h2>
        </div>

        {showFilters ? (
          <div className="space-y-4">
            {/* Syndrome Filter */}
            <label className="block text-xs font-semibold text-slate-700">
              Syndromic Stream
              <select
                className="mt-1.5 min-h-[40px] w-full rounded-md border border-slate-200 bg-slate-50 px-2.5 text-xs font-medium text-sentinel-ink focus:border-sentinel-teal focus:bg-white focus:outline-none"
                value={syndrome}
                onChange={(e) => onSyndromeChange(e.target.value)}
              >
                {SYNDROME_OPTIONS.map((opt) => (
                  <option key={opt} value={opt}>
                    {opt === 'All' ? 'All Syndromic Channels' : `${opt} Signal`}
                  </option>
                ))}
              </select>
            </label>

            {/* Time Window */}
            <fieldset>
              <legend className="text-xs font-semibold text-slate-700 mb-1.5 flex items-center gap-1">
                <Clock className="h-3.5 w-3.5 text-sentinel-teal" />
                <span>Rolling Window</span>
              </legend>
              <div className="flex gap-1.5">
                {DAY_OPTIONS.map((d) => (
                  <button
                    key={d}
                    type="button"
                    onClick={() => onDaysChange(d)}
                    className={`min-h-[36px] flex-1 rounded-md text-xs font-semibold transition-colors cursor-pointer ${
                      days === d
                        ? 'bg-sentinel-teal text-white shadow-xs'
                        : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                    }`}
                  >
                    {d}d
                  </button>
                ))}
              </div>
            </fieldset>

            {/* Minimum Risk Filter */}
            <label className="block text-xs font-semibold text-slate-700">
              <div className="flex items-center justify-between">
                <span>Minimum Risk Score:</span>
                <span className="font-mono font-bold text-sentinel-teal">{minScore}</span>
              </div>
              <input
                type="range"
                min="0"
                max="100"
                step="5"
                value={minScore}
                onChange={(e) => onMinScoreChange(Number(e.target.value))}
                className="mt-2.5 w-full accent-sentinel-teal cursor-pointer"
              />
              <div className="flex justify-between text-[10px] text-slate-400 font-mono mt-1">
                <span>0 (All)</span>
                <span>40 (Watch)</span>
                <span>70 (High)</span>
              </div>
            </label>
          </div>
        ) : (
          <div className="rounded-md bg-slate-50 p-3 text-xs text-slate-600 border border-slate-100">
            <p>
              Filters apply automatically to Command Centre, Map, and Alert queues.
            </p>
          </div>
        )}

        {/* Informational Glossary */}
        <div className="border-t border-slate-100 pt-4 text-xs text-slate-500 space-y-2">
          <p className="font-bold text-sentinel-ink text-[11px] uppercase tracking-wider">
            Public Health Channels:
          </p>
          <ul className="space-y-1 text-[11px] leading-relaxed">
            <li><strong>ASHA:</strong> Accredited Social Health Activists</li>
            <li><strong>OPD:</strong> Outpatient Dept (PHC/CHC)</li>
            <li><strong>Pharmacy:</strong> Over-the-counter medicine</li>
            <li><strong>Env:</strong> Rainfall & Water Turbidity</li>
          </ul>
        </div>
      </div>
    </aside>
  )
}

export default Sidebar
