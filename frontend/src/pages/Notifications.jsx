import { useEffect, useState } from 'react'
import { CheckCircle2, XCircle, Workflow, Code } from 'lucide-react'
import { getNotificationStatus } from '../api/api'
import EmptyState from '../components/EmptyState'

function Notifications() {
  const [status, setStatus] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    let cancelled = false
    async function loadStatus() {
      setLoading(true)
      setError('')
      try {
        const data = await getNotificationStatus()
        if (!cancelled) setStatus(data)
      } catch (err) {
        if (!cancelled) setError(err.message || 'Unable to load notification status from FastAPI')
      } finally {
        if (!cancelled) setLoading(false)
      }
    }
    loadStatus()
    return () => { cancelled = true }
  }, [])

  if (loading) {
    return (
      <div className="space-y-6" id="main-content" tabIndex={-1}>
        <div className="h-96 rounded-lg border border-slate-200 bg-white p-6 animate-pulse">
          <div className="h-6 w-64 bg-slate-200 rounded"></div>
          <div className="mt-4 h-80 bg-slate-100 rounded"></div>
        </div>
      </div>
    )
  }

  if (error || !status) {
    return <EmptyState title="Notification Service Error" message={error} />
  }

  const samplePayload = {
    alert_id: 1,
    location_id: 'loc_001',
    location_name: 'Rampur',
    block: 'Demo Block East',
    severity: 'high',
    risk_score: 98.6,
    cluster_id: 'C1',
    model_version: 'phase5-v1',
    timestamp: new Date().toISOString(),
    top_factors: [
      { factor_name: 'ASHA Syndromic Reports', contribution: 31.2 },
      { factor_name: 'OPD Clinical Visits', contribution: 22.4 },
      { factor_name: 'Pharmacy Product Demand', contribution: 19.1 },
    ],
    data_mode: 'synthetic_demonstration',
    disclaimer: 'Synthetic surveillance demonstration only; not a clinical diagnosis.',
  }

  return (
    <div className="space-y-6" id="main-content" tabIndex={-1}>
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-200 bg-white p-4 rounded-lg shadow-xs">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-xl font-bold text-sentinel-ink sm:text-2xl">
              Notification Automation & n8n Integration
            </h1>
            <span className="rounded bg-sentinel-teal/15 px-2 py-0.5 text-xs font-bold text-sentinel-teal">
              Workflow Automation
            </span>
          </div>
          <p className="mt-0.5 text-xs text-slate-500">
            Automated threshold alerting pipeline decoupling ML scoring from notification delivery
          </p>
        </div>
      </div>

      {/* Honest Connection Status Panel */}
      <section className="rounded-lg border border-slate-200 bg-white p-5 shadow-xs">
        <div className="flex flex-wrap items-start justify-between gap-4 border-b border-slate-100 pb-4">
          <div className="flex items-start gap-3.5">
            {status.configured ? (
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-emerald-100 text-emerald-700">
                <CheckCircle2 className="h-6 w-6" />
              </div>
            ) : (
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-slate-100 text-slate-500">
                <XCircle className="h-6 w-6" />
              </div>
            )}
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-base font-bold text-sentinel-ink">
                  {status.configured ? 'Webhook Runtime Connected' : 'n8n Runtime Not Connected (Local Demo)'}
                </h2>
                <span className={`rounded px-2 py-0.5 text-[10px] font-bold uppercase ${
                  status.configured ? 'bg-emerald-100 text-emerald-800' : 'bg-slate-100 text-slate-700'
                }`}>
                  {status.connection_state}
                </span>
              </div>
              <p className="mt-1 text-xs text-slate-600">
                {status.message}
              </p>
            </div>
          </div>
        </div>

        {/* Telemetry Grid */}
        <div className="mt-4 grid gap-3 sm:grid-cols-3">
          <div className="rounded-md border border-slate-100 bg-slate-50 p-3">
            <p className="text-[11px] font-semibold text-slate-500 uppercase">Automation Engine</p>
            <p className="mt-1 text-sm font-bold text-sentinel-ink">{status.runtime}</p>
            <p className="text-[10px] text-slate-400">Exported Workflow in n8n/</p>
          </div>

          <div className="rounded-md border border-slate-100 bg-slate-50 p-3">
            <p className="text-[11px] font-semibold text-slate-500 uppercase">Webhook Config State</p>
            <p className="mt-1 text-sm font-bold text-sentinel-ink">
              {status.webhook_configured ? 'Configured' : 'Not Set in Environment'}
            </p>
            <p className="text-[10px] text-slate-400">SENTINEL_NOTIFICATION_WEBHOOK_URL</p>
          </div>

          <div className="rounded-md border border-slate-100 bg-slate-50 p-3">
            <p className="text-[11px] font-semibold text-slate-500 uppercase">Polling Frequency</p>
            <p className="mt-1 text-sm font-bold text-sentinel-ink">Cron Poll: */5 * * * *</p>
            <p className="text-[10px] text-slate-400">Filters status=open & score ≥ 70</p>
          </div>
        </div>
      </section>

      {/* Visual Pipeline Architecture Workflow */}
      <section className="rounded-lg border border-slate-200 bg-white p-5 shadow-xs">
        <div className="flex items-center gap-2 border-b border-slate-100 pb-3">
          <Workflow className="h-4 w-4 text-sentinel-teal" />
          <h2 className="text-sm font-bold text-sentinel-ink">
            End-to-End Surveillance Notification Pipeline
          </h2>
        </div>

        <div className="mt-4 grid gap-2.5 md:grid-cols-4">
          <div className="rounded-md border border-slate-200 bg-slate-50 p-3.5 text-center">
            <div className="mx-auto flex h-8 w-8 items-center justify-center rounded-full bg-sentinel-teal text-white font-bold text-xs mb-2">
              1
            </div>
            <p className="text-xs font-bold text-sentinel-ink">ML Risk Engine</p>
            <p className="mt-1 text-[11px] text-slate-500">
              Computes deterministic 0–100 risk score and persists high-risk alerts (≥70)
            </p>
          </div>

          <div className="rounded-md border border-slate-200 bg-slate-50 p-3.5 text-center">
            <div className="mx-auto flex h-8 w-8 items-center justify-center rounded-full bg-sentinel-teal text-white font-bold text-xs mb-2">
              2
            </div>
            <p className="text-xs font-bold text-sentinel-ink">FastAPI Alert API</p>
            <p className="mt-1 text-[11px] text-slate-500">
              Exposes <code>GET /alerts?status=open</code> with factor breakdown & metadata
            </p>
          </div>

          <div className="rounded-md border border-slate-200 bg-slate-50 p-3.5 text-center">
            <div className="mx-auto flex h-8 w-8 items-center justify-center rounded-full bg-sentinel-teal text-white font-bold text-xs mb-2">
              3
            </div>
            <p className="text-xs font-bold text-sentinel-ink">n8n Automation Node</p>
            <p className="mt-1 text-[11px] text-slate-500">
              Workflow polls endpoint, deduplicates alerts, and formats emergency dispatch JSON
            </p>
          </div>

          <div className="rounded-md border border-slate-200 bg-slate-50 p-3.5 text-center">
            <div className="mx-auto flex h-8 w-8 items-center justify-center rounded-full bg-sentinel-teal text-white font-bold text-xs mb-2">
              4
            </div>
            <p className="text-xs font-bold text-sentinel-ink">Dispatch Receiver</p>
            <p className="mt-1 text-[11px] text-slate-500">
              Posts payload to designated webhook / Telegram channel / district email officer
            </p>
          </div>
        </div>
      </section>

      {/* Webhook Data Contract Inspector */}
      <section className="rounded-lg border border-slate-200 bg-white p-5 shadow-xs">
        <div className="flex items-center justify-between border-b border-slate-100 pb-3">
          <div className="flex items-center gap-2">
            <Code className="h-4 w-4 text-sentinel-teal" />
            <h2 className="text-sm font-bold text-sentinel-ink">
              Webhook JSON Payload Schema
            </h2>
          </div>
          <span className="text-xs font-mono text-slate-400">Content-Type: application/json</span>
        </div>

        <pre className="mt-3 overflow-x-auto rounded-lg bg-slate-900 p-4 text-xs font-mono text-emerald-300 leading-relaxed">
          {JSON.stringify(samplePayload, null, 2)}
        </pre>
      </section>
    </div>
  )
}

export default Notifications
