import { BrainCircuit, CheckCircle2, ShieldAlert, Cpu } from 'lucide-react'

function Insights() {
  return (
    <div className="space-y-6 max-w-4xl">
      <div className="card p-6">
        <div className="flex items-center gap-3 mb-2">
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg" style={{ background: 'var(--teal-light)' }}>
            <BrainCircuit className="h-5 w-5" style={{ color: 'var(--teal)' }} />
          </div>
          <h1 className="text-2xl font-bold" style={{ color: 'var(--text-main)' }}>How It Works</h1>
        </div>
        <p className="text-sm" style={{ color: 'var(--text-muted)' }}>
          Understanding Swasthya Sentinel AI's health early warning system.
        </p>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        <section className="card p-6 border-t-4 border-teal-600">
          <h2 className="text-lg font-bold mb-4 flex items-center gap-2" style={{ color: 'var(--text-main)' }}>
            <Cpu className="h-5 w-5" style={{ color: 'var(--teal)' }} />
            The Scoring System
          </h2>
          <p className="text-sm mb-4" style={{ color: 'var(--text-main)' }}>
            The system calculates a risk score (0-100) for every village based on four data sources:
          </p>
          <ul className="space-y-3 text-sm">
            <FeatureRow name="ASHA Reports" weight="40%" desc="Community health worker door-to-door surveys." />
            <FeatureRow name="OPD Visits" weight="30%" desc="Patient visits at local government clinics." />
            <FeatureRow name="Pharmacy Data" weight="20%" desc="Unusual increases in specific medicine purchases." />
            <FeatureRow name="Environment" weight="10%" desc="Rainfall and water quality data." />
          </ul>
        </section>

        <section className="card p-6 border-t-4 border-amber-500">
          <h2 className="text-lg font-bold mb-4 flex items-center gap-2" style={{ color: 'var(--text-main)' }}>
            <CheckCircle2 className="h-5 w-5" style={{ color: 'var(--amber)' }} />
            Why We Need Multiple Sources
          </h2>
          <div className="space-y-4 text-sm" style={{ color: 'var(--text-muted)' }}>
            <p>
              A sudden spike in pharmacy purchases doesn't always mean an outbreak. It could just be stock-up behavior.
            </p>
            <p>
              However, if pharmacy purchases <span className="font-bold text-slate-700">AND</span> ASHA reports <span className="font-bold text-slate-700">AND</span> clinic visits all increase simultaneously, the system flags it as highly reliable.
            </p>
            <div className="p-4 rounded-lg border" style={{ background: 'var(--bg-app)', borderColor: 'var(--border)' }}>
              <p className="font-bold mb-1" style={{ color: 'var(--text-main)' }}>Nearby Villages</p>
              <p>The system also checks if nearby villages are showing the same pattern. If they are, it creates a "cluster alert" which increases priority.</p>
            </div>
          </div>
        </section>
      </div>

      <div className="card p-6 border-l-4 border-red-500 bg-red-50/50">
        <h2 className="text-lg font-bold mb-2 flex items-center gap-2 text-red-800">
          <ShieldAlert className="h-5 w-5 text-red-600" />
          Strictly a Surveillance Tool
        </h2>
        <p className="text-sm text-red-700">
          This system is designed exclusively for public health officers to identify areas needing field investigation. 
          It does <strong>not</strong> diagnose any disease. It does <strong>not</strong> collect personal patient data (PHI). 
          All data is anonymized and aggregated at the village level.
        </p>
      </div>
    </div>
  )
}

function FeatureRow({ name, weight, desc }) {
  return (
    <li className="flex gap-3 pb-3 border-b last:border-0 last:pb-0" style={{ borderColor: 'var(--border)' }}>
      <div className="w-12 shrink-0 font-bold tabular-nums" style={{ color: 'var(--teal)' }}>{weight}</div>
      <div>
        <div className="font-bold" style={{ color: 'var(--text-main)' }}>{name}</div>
        <div className="text-xs" style={{ color: 'var(--text-muted)' }}>{desc}</div>
      </div>
    </li>
  )
}

export default Insights
