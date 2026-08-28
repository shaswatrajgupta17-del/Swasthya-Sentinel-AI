import { Activity, Pause, Play, RotateCcw } from 'lucide-react'

function LiveStatus({ simulation, onStart, onPause, onReset }) {
  const running = simulation?.running
  return (
    <section className="rounded-lg border border-slate-200 bg-sentinel-card p-3 shadow-sm" aria-label="Synthetic surveillance status">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          <span className={`inline-flex items-center gap-1.5 rounded-full px-2 py-1 text-xs font-semibold ${running ? 'bg-risk-low/15 text-sentinel-teal' : 'bg-slate-100 text-slate-600'}`}>
            <span className={`h-2 w-2 rounded-full ${running ? 'animate-pulse bg-risk-low' : 'bg-slate-400'}`} aria-hidden="true" />
            {running ? 'LIVE' : 'PAUSED'}
          </span>
          <span className="text-xs text-slate-500">Synthetic stream · {simulation?.scenario || 'NORMAL'}</span>
        </div>
        <div className="flex items-center gap-1">
          <button type="button" onClick={running ? onPause : onStart} className="inline-flex min-h-9 items-center gap-1.5 rounded-md bg-sentinel-teal px-2.5 text-xs font-medium text-white">
            {running ? <Pause className="h-3.5 w-3.5" /> : <Play className="h-3.5 w-3.5" />}
            {running ? 'Pause' : 'Start'}
          </button>
          <button type="button" onClick={onReset} className="inline-flex min-h-9 items-center gap-1.5 rounded-md bg-sentinel-mist px-2.5 text-xs font-medium text-sentinel-ink">
            <RotateCcw className="h-3.5 w-3.5" /> Reset
          </button>
        </div>
      </div>
      <div className="mt-2 flex items-center gap-1.5 text-xs text-slate-500">
        <Activity className="h-3.5 w-3.5 text-sentinel-teal" aria-hidden="true" />
        {simulation?.last_update ? `Updated ${new Date(simulation.last_update).toLocaleTimeString()}` : 'Waiting for simulation clock'}
        <span className="ml-auto">Next update: {simulation?.next_update_seconds ?? 3}s</span>
      </div>
    </section>
  )
}

export default LiveStatus
