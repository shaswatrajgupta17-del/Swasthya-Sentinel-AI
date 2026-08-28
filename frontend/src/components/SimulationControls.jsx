import { Play, Pause, RotateCcw, FastForward, Sliders } from 'lucide-react'

const SCENARIOS = [
  { id: 'NORMAL', name: 'Normal Baseline', desc: 'Signals oscillate naturally around 30d baseline' },
  { id: 'FEVER CLUSTER', name: 'Fever Cluster Rise', desc: 'Fever signals surge across East Block (Rampur/Lakshmipur/Devgaon)' },
  { id: 'RESPIRATORY CLUSTER', name: 'Respiratory Cluster', desc: 'Cough/Respiratory symptoms rise across North Block' },
  { id: 'PHARMACY SURGE', name: 'Pharmacy ORS Surge', desc: 'Medicine purchases spike prior to clinical facility registrations' },
  { id: 'ENVIRONMENTAL EVENT', name: 'Environmental Event', desc: 'Heavy monsoon & water turbidity shift across River basin villages' },
]

const SPEEDS = [
  { value: 1.0, label: '1× Normal' },
  { value: 5.0, label: '5× Fast' },
  { value: 10.0, label: '10× Maximum' },
]

function SimulationControls({
  scenario = 'NORMAL',
  speed = 1.0,
  onScenarioChange,
  onSpeedChange,
  running = false,
  onStart,
  onPause,
  onReset,
}) {
  return (
    <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
      {/* Scenario Selector */}
      <div className="flex-1">
        <label className="block text-xs font-semibold text-slate-700 mb-1.5 flex items-center gap-1.5">
          <Sliders className="h-3.5 w-3.5 text-sentinel-teal" />
          <span>Surveillance Scenario</span>
        </label>
        <select
          value={scenario}
          onChange={(e) => onScenarioChange(e.target.value)}
          className="w-full min-h-[42px] rounded-md border border-slate-200 bg-white px-3 py-2 text-xs font-medium text-sentinel-ink shadow-xs focus:border-sentinel-teal focus:ring-1 focus:ring-sentinel-teal"
        >
          {SCENARIOS.map((s) => (
            <option key={s.id} value={s.id}>
              {s.name} — {s.desc}
            </option>
          ))}
        </select>
      </div>

      {/* Speed Controls */}
      <div>
        <label className="block text-xs font-semibold text-slate-700 mb-1.5 flex items-center gap-1.5">
          <FastForward className="h-3.5 w-3.5 text-sentinel-teal" />
          <span>Simulation Speed</span>
        </label>
        <div className="flex rounded-md border border-slate-200 bg-slate-50 p-1">
          {SPEEDS.map((s) => (
            <button
              key={s.value}
              type="button"
              onClick={() => onSpeedChange(s.value)}
              className={`min-h-[34px] rounded px-3 text-xs font-semibold transition-all cursor-pointer ${
                speed === s.value
                  ? 'bg-sentinel-teal text-white shadow-xs'
                  : 'text-slate-600 hover:text-sentinel-ink'
              }`}
            >
              {s.label}
            </button>
          ))}
        </div>
      </div>

      {/* Action Buttons */}
      <div className="flex items-end gap-2">
        <button
          type="button"
          onClick={running ? onPause : onStart}
          className={`inline-flex min-h-[42px] items-center justify-center gap-2 rounded-md px-4 py-2 text-xs font-bold text-white shadow-xs transition-colors cursor-pointer ${
            running
              ? 'bg-amber-600 hover:bg-amber-700'
              : 'bg-emerald-600 hover:bg-emerald-700'
          }`}
        >
          {running ? <Pause className="h-4 w-4" /> : <Play className="h-4 w-4" />}
          <span>{running ? 'Pause Stream' : 'Start Simulation'}</span>
        </button>

        <button
          type="button"
          onClick={onReset}
          className="inline-flex min-h-[42px] items-center justify-center gap-1.5 rounded-md border border-slate-200 bg-white px-3 py-2 text-xs font-semibold text-slate-700 shadow-xs hover:bg-slate-50 cursor-pointer"
          title="Reset back to baseline seed"
        >
          <RotateCcw className="h-3.5 w-3.5" />
          <span>Reset</span>
        </button>
      </div>
    </div>
  )
}

export default SimulationControls
