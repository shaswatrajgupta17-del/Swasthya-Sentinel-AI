function About() {
  return (
    <div className="mx-auto max-w-3xl space-y-6">
      <div>
        <h1 className="text-xl font-semibold text-sentinel-ink sm:text-2xl">About this prototype</h1>
        <p className="mt-1 text-sm text-slate-600">SIH2026-STATE-04 — college demonstration only.</p>
      </div>

      <section className="rounded-lg border border-slate-200 bg-sentinel-card p-4 shadow-sm">
        <h2 className="text-base font-semibold text-sentinel-ink">Project purpose</h2>
        <p className="mt-2 text-sm leading-relaxed text-slate-700">
          Swasthya Sentinel AI helps public health teams see unusual rural health patterns that appear
          across disconnected sources: ASHA worker reports, OPD symptom logs, pharmacy sales, and
          environmental indicators. The product combines those <strong>synthetic</strong> signals,
          highlights geographic clusters, and shows a numeric risk score with transparent reasons.
        </p>
      </section>

      <section className="rounded-lg border border-slate-200 bg-sentinel-card p-4 shadow-sm">
        <h2 className="text-base font-semibold text-sentinel-ink">Synthetic data disclaimer</h2>
        <p className="mt-2 text-sm leading-relaxed text-slate-700">
          This prototype uses synthetic data and does not provide medical diagnosis. It does not
          confirm outbreaks, name a disease for an individual person, or recommend clinical treatment.
          Village names, coordinates, and signal counts are invented for demonstration purposes. There is
          no personal health information (PHI).
        </p>
      </section>

      <section className="rounded-lg border border-slate-200 bg-sentinel-card p-4 shadow-sm">
        <h2 className="text-base font-semibold text-sentinel-ink">Technology overview</h2>
        <ul className="mt-2 list-disc space-y-1 pl-5 text-sm text-slate-700">
          <li><strong>Frontend:</strong> React, Vite, JavaScript, Tailwind CSS, Lucide icons</li>
          <li><strong>Maps & Visualization:</strong> React Leaflet with OpenStreetMap tiles, Recharts</li>
          <li><strong>Backend API:</strong> Python FastAPI, SQLAlchemy ORM</li>
          <li><strong>Database:</strong> SQLite local store for locations, aggregated signals, risks, and alerts</li>
          <li><strong>Risk Scoring & ML:</strong> Python ML engine in <code>ml/</code> — calculating statistical anomaly scores and DBSCAN spatial clusters</li>
          <li><strong>Workflow Automation (P1):</strong> n8n integration for threshold alert delivery</li>
        </ul>
      </section>
    </div>
  )
}

export default About
