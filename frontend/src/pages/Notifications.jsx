import { useEffect, useState } from 'react'
import { Workflow, CheckCircle2, XCircle, Settings, Send } from 'lucide-react'
import { getNotificationStatus, sendTestNotification } from '../api/api'

function Notifications() {
  const [status, setStatus] = useState(null)
  const [loading, setLoading] = useState(true)
  const [testResult, setTestResult] = useState(null)
  const [isTesting, setIsTesting] = useState(false)

  useEffect(() => {
    async function load() {
      try {
        const data = await getNotificationStatus()
        setStatus(data)
      } catch {
        setStatus(null)
      } finally {
        setLoading(false)
      }
    }
    load()
  }, [])

  async function handleTest() {
    setIsTesting(true)
    setTestResult(null)
    try {
      const res = await sendTestNotification()
      setTestResult(res)
    } catch (err) {
      setTestResult({ success: false, message: 'Network error reaching backend.' })
    } finally {
      setIsTesting(false)
    }
  }

  if (loading) {
    return <div className="card p-6 h-64 animate-pulse" />
  }

  const isConfigured = status?.configured

  return (
    <div className="space-y-6 max-w-4xl">
      <div className="card p-6 flex items-center justify-between flex-wrap gap-4">
        <div>
          <div className="flex items-center gap-2 mb-2">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg" style={{ background: 'var(--teal-light)' }}>
              <Workflow className="h-5 w-5" style={{ color: 'var(--teal)' }} />
            </div>
            <h1 className="text-2xl font-bold" style={{ color: 'var(--text-main)' }}>Notification Automation</h1>
          </div>
          <p className="text-sm" style={{ color: 'var(--text-muted)' }}>
            Configure how alerts are sent to health officers via SMS, WhatsApp, or Email.
          </p>
        </div>

        <div className="flex items-center gap-2 px-4 py-2 rounded-lg border" style={{ background: 'var(--bg-app)', borderColor: 'var(--border)' }}>
          {isConfigured ? (
            <>
              <CheckCircle2 className="h-5 w-5" style={{ color: 'var(--green)' }} />
              <div>
                <p className="text-xs font-bold uppercase tracking-wide" style={{ color: 'var(--green)' }}>Connected</p>
                <p className="text-[10px]" style={{ color: 'var(--text-muted)' }}>Webhook is active</p>
              </div>
            </>
          ) : (
            <>
              <XCircle className="h-5 w-5" style={{ color: 'var(--red)' }} />
              <div>
                <p className="text-xs font-bold uppercase tracking-wide" style={{ color: 'var(--red)' }}>Not Connected</p>
                <p className="text-[10px]" style={{ color: 'var(--text-muted)' }}>No webhook configured</p>
              </div>
            </>
          )}
        </div>
      </div>

      <div className="card p-6">
        <h2 className="text-lg font-bold flex items-center gap-2 mb-4" style={{ color: 'var(--text-main)' }}>
          <Settings className="h-5 w-5" style={{ color: 'var(--text-muted)' }} />
          Configuration
        </h2>
        <div className="space-y-4 text-sm" style={{ color: 'var(--text-main)' }}>
          <p>
            Swasthya Sentinel AI integrates with external automation platforms (like <strong>n8n</strong>) to deliver alerts.
          </p>
          <div className="p-4 rounded border bg-slate-50" style={{ background: 'var(--bg-app)', borderColor: 'var(--border)' }}>
            <p className="font-bold mb-2">How to connect:</p>
            <ol className="list-decimal pl-5 space-y-2" style={{ color: 'var(--text-muted)' }}>
              <li>Create a webhook trigger in your automation platform (e.g., n8n).</li>
              <li>Set the <code className="bg-slate-200 px-1 py-0.5 rounded text-black">SENTINEL_NOTIFICATION_WEBHOOK_URL</code> environment variable in the backend.</li>
              <li>Restart the FastAPI server.</li>
            </ol>
          </div>
          
          <div className="pt-4 border-t" style={{ borderColor: 'var(--border)' }}>
            <h3 className="font-bold mb-2">Test Connection</h3>
            <p className="text-xs mb-3" style={{ color: 'var(--text-muted)' }}>
              Clicking this button will send a test alert to the configured webhook. The system honestly reports success or failure.
            </p>
            
            <button
              onClick={handleTest}
              disabled={isTesting}
              className="flex items-center gap-2 px-4 py-2 rounded font-bold text-white transition-colors cursor-pointer disabled:opacity-50"
              style={{ background: 'var(--teal)' }}
            >
              <Send className="h-4 w-4" />
              {isTesting ? 'Sending...' : 'Send Test Notification'}
            </button>

            {testResult && (
              <div className={`mt-3 p-3 rounded border text-sm ${testResult.success ? 'bg-emerald-50 border-emerald-200 text-emerald-800' : 'bg-red-50 border-red-200 text-red-800'}`}>
                <div className="flex items-center gap-2 font-bold mb-1">
                  {testResult.success ? <CheckCircle2 className="h-4 w-4" /> : <XCircle className="h-4 w-4" />}
                  {testResult.success ? 'Success' : 'Failed'}
                </div>
                <p>{testResult.message}</p>
                {testResult.http_status && <p className="text-xs mt-1 opacity-70">HTTP Status: {testResult.http_status}</p>}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

export default Notifications
