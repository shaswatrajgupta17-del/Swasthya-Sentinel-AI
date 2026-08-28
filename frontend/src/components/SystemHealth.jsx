import { useEffect, useState } from 'react'
import { Server, Database, Globe, Zap, Cpu, Bell } from 'lucide-react'
import { getHealth, getNotificationStatus } from '../api/api'

function SystemHealth({ simStatus }) {
  const [health, setHealth] = useState(null)
  const [notif, setNotif] = useState(null)

  useEffect(() => {
    async function check() {
      try {
        const [h, n] = await Promise.all([getHealth().catch(()=>null), getNotificationStatus().catch(()=>null)])
        setHealth(h)
        setNotif(n)
      } catch (err) {}
    }
    check()
    const t = setInterval(check, 10000)
    return () => clearInterval(t)
  }, [])

  return (
    <section className="card p-4">
      <h2 className="text-base font-bold mb-3" style={{ color: 'var(--text-main)' }}>System Status</h2>
      <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
        <StatusItem
          label="Frontend UI"
          icon={Globe}
          status="Online"
          ok={true}
        />
        <StatusItem
          label="FastAPI Backend"
          icon={Server}
          status={health ? 'Connected' : 'Unreachable'}
          ok={!!health}
        />
        <StatusItem
          label="Database"
          icon={Database}
          status={health?.database === 'connected' ? 'Ready' : 'Error'}
          ok={health?.database === 'connected'}
        />
        <StatusItem
          label="ML Engine"
          icon={Cpu}
          status={health ? 'Ready' : 'Waiting'}
          ok={!!health}
        />
        <StatusItem
          label="Simulation"
          icon={Zap}
          status={simStatus?.running ? 'Running' : 'Paused'}
          ok={simStatus?.running}
          color={simStatus?.running ? 'var(--amber)' : 'var(--text-muted)'}
        />
        <StatusItem
          label="Notifications (n8n)"
          icon={Bell}
          status={notif?.configured ? 'Connected' : 'Not configured'}
          ok={notif?.configured}
        />
      </div>
    </section>
  )
}

function StatusItem({ label, icon: Icon, status, ok, color }) {
  const iconColor = color || (ok ? 'var(--green)' : 'var(--red)')
  const bg = ok ? 'rgba(42,157,143,0.1)' : 'rgba(220,38,38,0.1)'

  return (
    <div className="flex items-center gap-3 p-2 rounded-lg border" style={{ borderColor: 'var(--border)', background: 'var(--bg-app)' }}>
      <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-md" style={{ background: bg }}>
        <Icon className="h-4 w-4" style={{ color: iconColor }} />
      </div>
      <div>
        <p className="text-[10px] uppercase font-bold tracking-wide" style={{ color: 'var(--text-muted)' }}>{label}</p>
        <p className="text-xs font-semibold mt-0.5" style={{ color: ok ? 'var(--text-main)' : 'var(--red)' }}>{status}</p>
      </div>
    </div>
  )
}

export default SystemHealth
