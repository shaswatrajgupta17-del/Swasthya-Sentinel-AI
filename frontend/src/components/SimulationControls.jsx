import { useState } from 'react'
import { Play, Pause, RotateCcw, Activity } from 'lucide-react'

function SimulationControls({ simStatus, onStart, onPause, onReset, onUpdate }) {
  const [scenario, setScenario] = useState('NORMAL')
  const [speed, setSpeed] = useState(1.0)
  const isRunning = simStatus?.running

  async function handleStart() {
    try {
      const res = await onStart(scenario, speed)
      onUpdate(res)
    } catch {
      alert('Simulation failed to start.')
    }
  }

  async function handlePause() {
    try {
      const res = await onPause()
      onUpdate(res)
    } catch {
      alert('Failed to pause simulation.')
    }
  }

  async function handleReset() {
    try {
      const res = await onReset()
      onUpdate(res)
    } catch {
      alert('Failed to reset simulation.')
    }
  }

  return (
    <div className="space-y-4">
      {/* Status Banner */}
      <div className={`p-3 rounded-lg border ${isRunning ? 'bg-amber-50 border-amber-200' : 'bg-slate-50 border-slate-200'}`} style={{ background: isRunning ? 'rgba(217,119,6,0.1)' : 'var(--bg-app)', borderColor: isRunning ? 'rgba(217,119,6,0.3)' : 'var(--border)' }}>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Activity className="h-4 w-4" style={{ color: isRunning ? 'var(--amber)' : 'var(--text-muted)' }} />
            <span className="text-sm font-bold" style={{ color: isRunning ? 'var(--amber)' : 'var(--text-main)' }}>
              {isRunning ? 'Live Data Injection Running' : 'Simulation Paused'}
            </span>
          </div>
          <span className="text-xs font-mono font-bold px-2 py-0.5 rounded" style={{ background: 'var(--bg-card)', color: 'var(--text-muted)' }}>
            Tick: {simStatus?.tick || 0}
          </span>
        </div>
        <p className="text-xs mt-1" style={{ color: 'var(--text-muted)' }}>
          {simStatus?.scenario_description || 'Inject synthetic health events to test the early warning system.'}
        </p>
      </div>

      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className="block text-[10px] font-bold uppercase tracking-wider mb-1" style={{ color: 'var(--text-muted)' }}>Scenario</label>
          <select
            value={scenario}
            onChange={e => setScenario(e.target.value)}
            disabled={isRunning}
            className="w-full text-xs p-2 border rounded font-medium disabled:opacity-50"
            style={{ background: 'var(--bg-app)', borderColor: 'var(--border)', color: 'var(--text-main)' }}
          >
            <option value="NORMAL">Normal Baseline</option>
            <option value="FEVER CLUSTER">Fever Spike (East Block)</option>
            <option value="RESPIRATORY CLUSTER">Respiratory (West Block)</option>
            <option value="PHARMACY SURGE">Pharmacy Anomalies</option>
            <option value="ENVIRONMENTAL EVENT">Heavy Rainfall Risk</option>
          </select>
        </div>
        <div>
          <label className="block text-[10px] font-bold uppercase tracking-wider mb-1" style={{ color: 'var(--text-muted)' }}>Speed</label>
          <select
            value={speed}
            onChange={e => setSpeed(Number(e.target.value))}
            disabled={isRunning}
            className="w-full text-xs p-2 border rounded font-medium disabled:opacity-50"
            style={{ background: 'var(--bg-app)', borderColor: 'var(--border)', color: 'var(--text-main)' }}
          >
            <option value={1.0}>1x (Real-time)</option>
            <option value={5.0}>5x (Fast)</option>
            <option value={10.0}>10x (Very Fast)</option>
          </select>
        </div>
      </div>

      <div className="flex gap-2 pt-2">
        {!isRunning ? (
          <button
            onClick={handleStart}
            className="flex-1 flex justify-center items-center gap-1 py-2 rounded text-xs font-bold text-white transition-colors cursor-pointer shadow-sm hover:opacity-90"
            style={{ background: 'var(--teal)' }}
          >
            <Play className="h-3.5 w-3.5" /> Start
          </button>
        ) : (
          <button
            onClick={handlePause}
            className="flex-1 flex justify-center items-center gap-1 py-2 rounded text-xs font-bold transition-colors cursor-pointer shadow-sm hover:opacity-90"
            style={{ background: 'var(--amber)', color: 'white' }}
          >
            <Pause className="h-3.5 w-3.5" /> Pause
          </button>
        )}
        <button
          onClick={handleReset}
          className="flex justify-center items-center gap-1 px-4 py-2 rounded border text-xs font-bold transition-colors cursor-pointer hover:bg-slate-100"
          style={{ borderColor: 'var(--border)', background: 'var(--bg-card)', color: 'var(--text-main)' }}
          title="Reset back to baseline"
        >
          <RotateCcw className="h-3.5 w-3.5" />
        </button>
      </div>
    </div>
  )
}

export default SimulationControls
