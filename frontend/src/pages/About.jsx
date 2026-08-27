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
          Swasthya Sentinel AI helps a district officer see unusual rural health patterns that appear
          across disconnected sources: ASHA worker reports, OPD symptom logs, pharmacy sales, and
          environmental indicators. The product combines those <strong>synthetic</strong> signals,
          highlights geographic clusters, and shows a numeric risk score with reasons.
        </p>
      </section>

      <section className="rounded-lg border border-slate-200 bg-sentinel-card p-4 shadow-sm">
        <h2 className="text-base font-semibold text-sentinel-ink">Synthetic data disclaimer</h2>
        <p className="mt-2 text-sm leading-relaxed text-slate-700">
          This prototype uses synthetic data and does not provide medical diagnosis. It does not
          confirm outbreaks, name a disease for a person, or recommend treatment. Village names and
          counts are invented for the demo. There is no personal health information.
        </p>
      </section>

      <section className="rounded-lg border border-slate-200 bg-sentinel-card p-4 shadow-sm">
        <h2 className="text-base font-semibold text-sentinel-ink">Technology overview</h2>
        <ul className="mt-2 list-disc space-y-1 pl-5 text-sm text-slate-700">
          <li>Frontend (this app): React, Vite, JavaScript, Tailwind CSS, Lucide icons</li>
          <li>Maps and charts (later phases): React Leaflet, Recharts</li>
          <li>Backend (later): FastAPI and SQLite</li>
          <li>Risk scores (later): Python ML engine — not calculated in the browser</li>
          <li>Alerts automation (optional): n8n</li>
          <li>Cloud (optional): Azure for hosting or explaining already-calculated factors</li>
        </ul>
      </section>
    </div>
  )
}

export default About
