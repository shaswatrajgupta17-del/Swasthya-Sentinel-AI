import { Activity, Database, BrainCircuit, Play, Workflow } from 'lucide-react'

function SystemHealth({ simulation, notificationStatus, risksCount = 12 }) {
  const isApiOk = true
  const isDbOk = risksCount > 0
  const isModelReady = true
  const isSimulationRunning = simulation?.running
  const isNotificationConnected = notificationStatus?.configured

  const items = [
    {
      label: 'Surveillance API',
      status: 'Operational',
      sub: 'FastAPI (Python)',
      isOk: isApiOk,
      icon: Activity,
    },
    {
      label: 'SQLite Store',
      status: 'Connected',
      sub: `${risksCount} Village Nodes`,
      isOk: isDbOk,
      icon: Database,
    },
    {
      label: 'Risk ML Engine',
      status: 'Ready',
      sub: 'phase5-v1 (DBSCAN + Anomaly)',
      isOk: isModelReady,
      icon: BrainCircuit,
    },
    {
      label: 'Surveillance Stream',
      status: isSimulationRunning ? 'Simulating' : 'Paused',
      sub: simulation?.scenario || 'NORMAL',
      isOk: true,
      activePulse: isSimulationRunning,
      icon: Play,
    },
    {
      label: 'n8n Automation',
      status: isNotificationConnected ? 'Connected' : 'Not Connected',
      sub: isNotificationConnected ? 'Webhook Active' : 'Polling Ready',
      isOk: isNotificationConnected,
      isWarning: !isNotificationConnected,
      icon: Workflow,
    },
  ]

  return (
    <section className="rounded-lg border border-slate-200 bg-white p-4 shadow-xs" aria-label="System Architecture Status">
      <div className="flex flex-wrap items-center justify-between gap-2 border-b border-slate-100 pb-3">
        <div className="flex items-center gap-2">
          <span className="h-2.5 w-2.5 rounded-full bg-emerald-500" aria-hidden="true" />
          <h2 className="text-xs font-bold uppercase tracking-wider text-sentinel-ink">
            Command Centre Health & Subsystem Telemetry
          </h2>
        </div>
        <span className="text-[11px] font-medium text-slate-500">
          Architecture: Local Vite + FastAPI + SQLite
        </span>
      </div>

      <div className="mt-3 grid grid-cols-2 gap-2.5 sm:grid-cols-3 lg:grid-cols-5">
        {items.map((item) => {
          const Icon = item.icon
          return (
            <div
              key={item.label}
              className="flex items-center gap-2.5 rounded-md border border-slate-100 bg-slate-50/70 p-2.5"
            >
              <div className={`p-1.5 rounded-md ${item.isOk && !item.isWarning ? 'bg-emerald-50 text-emerald-700' : item.isWarning ? 'bg-amber-50 text-amber-700' : 'bg-slate-100 text-slate-600'}`}>
                <Icon className="h-4 w-4" />
              </div>
              <div className="min-w-0">
                <p className="text-[11px] font-medium text-slate-500 truncate">{item.label}</p>
                <div className="flex items-center gap-1">
                  <span className="text-xs font-bold text-sentinel-ink truncate">{item.status}</span>
                  {item.activePulse && (
                    <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-ping" />
                  )}
                </div>
                <p className="text-[10px] text-slate-400 truncate">{item.sub}</p>
              </div>
            </div>
          )
        })}
      </div>
    </section>
  )
}

export default SystemHealth
