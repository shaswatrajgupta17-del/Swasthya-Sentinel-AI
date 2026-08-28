import { Shield, Sparkles, Cpu } from 'lucide-react'

function About() {
  const techStack = [
    { layer: 'Frontend Web App', tech: 'React 19 + Vite + Tailwind CSS (Gov Palettes)' },
    { layer: 'Spatial Mapping', tech: 'React Leaflet + OpenStreetMap + DBSCAN Polylines' },
    { layer: 'Analytical Charts', tech: 'Recharts Responsive Multi-Signal Visualizations' },
    { layer: 'Backend API', tech: 'Python 3.12 + FastAPI + SQLAlchemy ORM' },
    { layer: 'Database', tech: 'SQLite Local Store (Locations, Signals, Risks, Alerts)' },
    { layer: 'ML / Risk Engine', tech: 'Scikit-learn (DBSCAN) + Deterministic Anomaly Scoring (phase5-v1)' },
    { layer: 'Automation & Alerting', tech: 'n8n Workflow Automation (Polling & Webhook Dispatch)' },
  ]

  const demoSteps = [
    { num: '1', title: 'Open Command Centre', desc: 'Observe 12 village nodes, operational telemetry, and baseline KPIs.' },
    { num: '2', title: 'Inspect Surveillance Map', desc: 'View DBSCAN cluster C1 (Rampur, Lakshmipur, Devgaon) highlighted on map.' },
    { num: '3', title: 'Trigger Simulation Surge', desc: 'Select Fever Cluster scenario or Pharmacy Surge at 5× speed.' },
    { num: '4', title: 'Observe Live "What Changed?"', desc: 'Notice ASHA and Pharmacy streams moving +38% above 30-day baseline.' },
    { num: '5', title: 'Inspect Village Breakdown', desc: 'Open Rampur to see exact horizontal factor contribution bars totaling 98.6 pts.' },
    { num: '6', title: 'Process Alert Queue', desc: 'Open Alerts & Response, inspect timeline, and transition status to Acknowledged.' },
    { num: '7', title: 'Review n8n & Methodology', desc: 'Verify decoupled webhook automation contract and ethical synthetic disclaimers.' },
  ]

  return (
    <div className="mx-auto max-w-4xl space-y-6" id="main-content" tabIndex={-1}>
      {/* Header */}
      <div className="border-b border-slate-200 bg-white p-5 rounded-lg shadow-xs">
        <div className="flex items-center gap-2">
          <span className="rounded bg-sentinel-teal/15 px-2 py-0.5 text-xs font-bold text-sentinel-teal uppercase">
            Smart India Hackathon 2026
          </span>
          <span className="text-xs text-slate-400">·</span>
          <span className="text-xs text-slate-500 font-medium">SIH2026-STATE-04 Prototype</span>
        </div>
        <h1 className="mt-2 text-2xl font-bold text-sentinel-ink sm:text-3xl">
          Swasthya Sentinel AI
        </h1>
        <p className="mt-1 text-xs text-slate-600">
          Rural Public Health Early Warning & Multi-Source Anomaly Surveillance System
        </p>
      </div>

      {/* Project Overview Card */}
      <section className="rounded-lg border border-slate-200 bg-white p-5 shadow-xs">
        <div className="flex items-center gap-2 border-b border-slate-100 pb-3">
          <Shield className="h-5 w-5 text-sentinel-teal" />
          <h2 className="text-base font-bold text-sentinel-ink">Project Overview</h2>
        </div>
        <p className="mt-3 text-xs leading-relaxed text-slate-700">
          Swasthya Sentinel AI empowers district surveillance units and chief medical officers with early warning intelligence by fusing four independent community signals: <strong>ASHA syndromic logs</strong>, <strong>PHC outpatient visits</strong>, <strong>retail pharmacy medicine demand</strong>, and <strong>environmental risk indicators</strong>.
        </p>
        <p className="mt-2 text-xs leading-relaxed text-slate-700">
          By detecting statistical deviations and spatial clusters before clinical hospitalizations peak, the platform enables targeted, proactive public-health field investigations while respecting privacy with zero personal health data.
        </p>
      </section>

      {/* 5-Minute SIH Jury Demo Flow */}
      <section className="rounded-lg border border-slate-200 bg-white p-5 shadow-xs">
        <div className="flex items-center justify-between border-b border-slate-100 pb-3">
          <div className="flex items-center gap-2">
            <Sparkles className="h-5 w-5 text-amber-500" />
            <h2 className="text-base font-bold text-sentinel-ink">
              Recommended 5-Minute SIH Presentation Journey
            </h2>
          </div>
          <span className="text-xs font-semibold text-slate-500">7 Smooth Steps</span>
        </div>

        <div className="mt-4 space-y-2.5">
          {demoSteps.map((step) => (
            <div key={step.num} className="flex items-start gap-3 rounded-md border border-slate-100 bg-slate-50 p-3">
              <div className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-sentinel-teal text-white font-bold text-xs">
                {step.num}
              </div>
              <div>
                <p className="text-xs font-bold text-sentinel-ink">{step.title}</p>
                <p className="mt-0.5 text-[11px] text-slate-600 leading-relaxed">{step.desc}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Technology Stack Specifications */}
      <section className="rounded-lg border border-slate-200 bg-white p-5 shadow-xs">
        <div className="flex items-center gap-2 border-b border-slate-100 pb-3">
          <Cpu className="h-5 w-5 text-sentinel-teal" />
          <h2 className="text-base font-bold text-sentinel-ink">Technology Architecture Stack</h2>
        </div>

        <div className="mt-3 overflow-hidden rounded-md border border-slate-200">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-100 text-slate-700 font-bold">
              <tr>
                <th className="p-2.5">System Layer</th>
                <th className="p-2.5">Implementation Technology</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 bg-white">
              {techStack.map((item) => (
                <tr key={item.layer}>
                  <td className="p-2.5 font-bold text-sentinel-ink">{item.layer}</td>
                  <td className="p-2.5 font-mono text-slate-600">{item.tech}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      {/* Ethics & Academic Governance */}
      <section className="rounded-lg border border-slate-200 bg-white p-5 shadow-xs">
        <div className="flex items-center gap-2 border-b border-slate-100 pb-3">
          <Shield className="h-5 w-5 text-sentinel-teal" />
          <h2 className="text-base font-bold text-sentinel-ink">Academic Integrity & Governance</h2>
        </div>
        <p className="mt-3 text-xs leading-relaxed text-slate-700">
          This platform is an academic engineering prototype developed for Smart India Hackathon 2026. All data points, village coordinates, and signal counts are synthetically generated to protect rural privacy. The system does not claim official affiliation with the Ministry of Health & Family Welfare (MoHFW) or the Integrated Disease Surveillance Programme (IDSP).
        </p>
      </section>
    </div>
  )
}

export default About
