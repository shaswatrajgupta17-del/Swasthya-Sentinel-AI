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
  const showFilters = currentPage === 'dashboard' || currentPage === 'map' || currentPage === 'alerts' || currentPage === 'locations'

  return (
    <aside className="w-full shrink-0 border-b lg:w-64 lg:border-b-0 lg:border-r" style={{ borderColor: 'var(--border)', background: 'var(--bg-card)' }}>
      <div className="p-4 space-y-5">
        <div className="flex items-center gap-2 border-b pb-3" style={{ borderColor: 'var(--border)' }}>
          <Filter className="h-4 w-4" style={{ color: 'var(--teal)' }} />
          <h2 className="text-xs font-bold uppercase tracking-wider" style={{ color: 'var(--text-main)' }}>
            Surveillance Filters
          </h2>
        </div>

        {showFilters ? (
          <div className="space-y-4">
            {/* Syndrome Filter */}
            <label className="block text-xs font-semibold" style={{ color: 'var(--text-main)' }}>
              Health Signal Focus
              <select
                className="mt-1.5 min-h-[40px] w-full rounded-md border px-2.5 text-xs font-medium focus:outline-none focus:ring-2"
                style={{ background: 'var(--bg-app)', borderColor: 'var(--border)', color: 'var(--text-main)' }}
                value={syndrome}
                onChange={(e) => onSyndromeChange(e.target.value)}
              >
                {SYNDROME_OPTIONS.map((opt) => (
                  <option key={opt} value={opt}>
                    {opt === 'All' ? 'All Health Signals' : `${opt} Only`}
                  </option>
                ))}
              </select>
            </label>

            {/* Time Window */}
            <fieldset>
              <legend className="text-xs font-semibold mb-1.5 flex items-center gap-1" style={{ color: 'var(--text-main)' }}>
                <Clock className="h-3.5 w-3.5" style={{ color: 'var(--teal)' }} />
                <span>Time Window</span>
              </legend>
              <div className="flex gap-1.5">
                {DAY_OPTIONS.map((d) => (
                  <button
                    key={d}
                    type="button"
                    onClick={() => onDaysChange(d)}
                    className="min-h-[36px] flex-1 rounded-md text-xs font-semibold transition-colors cursor-pointer border"
                    style={
                      days === d
                        ? { background: 'var(--teal)', color: 'white', borderColor: 'var(--teal)' }
                        : { background: 'var(--bg-app)', color: 'var(--text-muted)', borderColor: 'var(--border)' }
                    }
                  >
                    {d}d
                  </button>
                ))}
              </div>
            </fieldset>

            {/* Minimum Risk Filter */}
            <label className="block text-xs font-semibold" style={{ color: 'var(--text-main)' }}>
              <div className="flex items-center justify-between">
                <span>Minimum Risk Score:</span>
                <span className="font-mono font-bold" style={{ color: 'var(--teal)' }}>{minScore}</span>
              </div>
              <input
                type="range"
                min="0"
                max="100"
                step="5"
                value={minScore}
                onChange={(e) => onMinScoreChange(Number(e.target.value))}
                className="mt-2.5 w-full cursor-pointer accent-teal-600"
              />
              <div className="flex justify-between text-[10px] font-mono mt-1" style={{ color: 'var(--text-light)' }}>
                <span>0 (All)</span>
                <span>40 (Watch)</span>
                <span>70 (High)</span>
              </div>
            </label>
          </div>
        ) : (
          <div className="rounded-md p-3 text-xs border" style={{ background: 'var(--bg-app)', borderColor: 'var(--border)', color: 'var(--text-muted)' }}>
            <p>Filters apply automatically to the Command Centre and Map.</p>
          </div>
        )}

        {/* Informational Glossary */}
        <div className="border-t pt-4 text-xs space-y-2" style={{ borderColor: 'var(--border)', color: 'var(--text-muted)' }}>
          <p className="font-bold text-[11px] uppercase tracking-wider" style={{ color: 'var(--text-main)' }}>
            Data Sources:
          </p>
          <ul className="space-y-1 text-[11px] leading-relaxed">
            <li><strong>ASHA:</strong> Community health workers</li>
            <li><strong>OPD:</strong> Clinic/hospital visits</li>
            <li><strong>Pharmacy:</strong> Medicine purchases</li>
            <li><strong>Env:</strong> Rainfall &amp; water quality</li>
          </ul>
        </div>
      </div>
    </aside>
  )
}

export default Sidebar
