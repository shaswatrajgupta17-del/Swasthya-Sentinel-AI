const SCENARIOS = ['NORMAL', 'FEVER CLUSTER', 'RESPIRATORY CLUSTER', 'PHARMACY SURGE', 'ENVIRONMENTAL EVENT']

function SimulationControls({ scenario, speed, onScenarioChange, onSpeedChange }) {
  return (
    <div className="grid gap-3 sm:grid-cols-[1fr_auto]">
      <label className="text-xs font-medium text-slate-600">
        Scenario
        <select value={scenario} onChange={(event) => onScenarioChange(event.target.value)} className="mt-1 min-h-10 w-full rounded-md border border-slate-200 bg-white px-2 text-sm text-sentinel-ink">
          {SCENARIOS.map((option) => <option key={option}>{option}</option>)}
        </select>
      </label>
      <label className="text-xs font-medium text-slate-600">
        Speed: {speed}x
        <input type="range" min="0.25" max="4" step="0.25" value={speed} onChange={(event) => onSpeedChange(Number(event.target.value))} className="mt-3 block w-32 accent-sentinel-teal" />
      </label>
    </div>
  )
}

export default SimulationControls
