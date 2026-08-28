import { BookOpen, Layers, Database, BrainCircuit, Lock, AlertCircle } from 'lucide-react'

function Methodology() {
  return (
    <div className="mx-auto max-w-4xl space-y-6" id="main-content" tabIndex={-1}>
      {/* Header */}
      <div className="border-b border-slate-200 bg-white p-5 rounded-lg shadow-xs">
        <div className="flex items-center gap-2">
          <span className="rounded bg-sentinel-teal/15 px-2 py-0.5 text-xs font-bold text-sentinel-teal uppercase">
            Technical Architecture
          </span>
          <span className="text-xs text-slate-400">·</span>
          <span className="text-xs text-slate-500 font-medium">SIH 2026 Documentation</span>
        </div>
        <h1 className="mt-2 text-2xl font-bold text-sentinel-ink sm:text-3xl">
          Surveillance Methodology & Architecture
        </h1>
        <p className="mt-1 text-xs text-slate-600">
          Mathematical framework, multi-source corroboration, spatial clustering, and ethical data governance
        </p>
      </div>

      {/* 1. Purpose & Problem Statement */}
      <section className="rounded-lg border border-slate-200 bg-white p-5 shadow-xs">
        <div className="flex items-center gap-2 border-b border-slate-100 pb-3">
          <BookOpen className="h-5 w-5 text-sentinel-teal" />
          <h2 className="text-base font-bold text-sentinel-ink">
            1. Problem Statement & Surveillance Purpose
          </h2>
        </div>
        <p className="mt-3 text-xs leading-relaxed text-slate-700">
          In rural public health systems, emerging health anomalies often appear fragmented across disparate, unconnected data silos: community ASHA worker logs, primary health centre (PHC) outpatient department (OPD) registrations, over-the-counter retail pharmacy sales (e.g., ORS and antipyretics), and environmental triggers (heavy rainfall and water quality turbidity).
        </p>
        <p className="mt-2 text-xs leading-relaxed text-slate-700">
          <strong>Swasthya Sentinel AI</strong> provides an early-warning analytical layer that ingests these four signal streams, computes statistical anomaly deviations against localized 30-day baselines, applies geographic spatial clustering, and computes a transparent, explainable 0–100 risk score for district public-health officers.
        </p>
      </section>

      {/* 2. End-to-End Pipeline Architecture Diagram */}
      <section className="rounded-lg border border-slate-200 bg-white p-5 shadow-xs">
        <div className="flex items-center gap-2 border-b border-slate-100 pb-3">
          <Layers className="h-5 w-5 text-sentinel-teal" />
          <h2 className="text-base font-bold text-sentinel-ink">
            2. End-to-End Processing Pipeline
          </h2>
        </div>

        <div className="mt-4 space-y-3">
          <div className="rounded-lg border border-slate-200 bg-slate-50 p-4 font-mono text-xs text-slate-800 space-y-2">
            <div className="flex items-center gap-2 font-bold text-sentinel-teal">
              <span>[1. INGESTION]</span>
              <span className="font-normal text-slate-600">ASHA Logs + OPD Visits + Pharmacy Sales + Environmental Sensors</span>
            </div>
            <div className="text-slate-400 pl-4">↓</div>
            <div className="flex items-center gap-2 font-bold text-sentinel-teal">
              <span>[2. FEATURE EXTRACTION]</span>
              <span className="font-normal text-slate-600">Rolling 7-day observation sum vs. 30-day historical baseline median</span>
            </div>
            <div className="text-slate-400 pl-4">↓</div>
            <div className="flex items-center gap-2 font-bold text-sentinel-teal">
              <span>[3. ANOMALY & CORROBORATION]</span>
              <span className="font-normal text-slate-600">Cross-stream corroboration metric & statistical surge ratios</span>
            </div>
            <div className="text-slate-400 pl-4">↓</div>
            <div className="flex items-center gap-2 font-bold text-sentinel-teal">
              <span>[4. SPATIAL CLUSTERING]</span>
              <span className="font-normal text-slate-600">DBSCAN Clustering (eps = 2.5 km, min_samples = 2)</span>
            </div>
            <div className="text-slate-400 pl-4">↓</div>
            <div className="flex items-center gap-2 font-bold text-sentinel-teal">
              <span>[5. RISK SYNTHESIS]</span>
              <span className="font-normal text-slate-600">0–100 Weighted Score + Exact Factor Decomposition</span>
            </div>
            <div className="text-slate-400 pl-4">↓</div>
            <div className="flex items-center gap-2 font-bold text-sentinel-teal">
              <span>[6. ALERTING & AUTOMATION]</span>
              <span className="font-normal text-slate-600">High-risk threshold (score ≥ 70) → FastAPI → n8n Webhook</span>
            </div>
          </div>
        </div>
      </section>

      {/* 3. Mathematical Scoring Formulation */}
      <section className="rounded-lg border border-slate-200 bg-white p-5 shadow-xs">
        <div className="flex items-center gap-2 border-b border-slate-100 pb-3">
          <BrainCircuit className="h-5 w-5 text-sentinel-teal" />
          <h2 className="text-base font-bold text-sentinel-ink">
            3. Mathematical Risk Formulation
          </h2>
        </div>

        <div className="mt-3 space-y-3 text-xs text-slate-700 leading-relaxed">
          <p>
            The final composite Risk Index R(i) in [0, 100] for location i is calculated deterministically via:
          </p>

          <div className="rounded-md bg-slate-900 p-3.5 text-center font-mono text-emerald-300 text-xs sm:text-sm">
            R(i) = 0.40 · S_anomaly(i) + 0.30 · S_corrob(i) + 0.20 · S_spatial(i) + 0.10 · S_env(i)
          </div>

          <div className="grid gap-2 sm:grid-cols-2 mt-3">
            <div className="rounded border border-slate-100 bg-slate-50 p-2.5">
              <strong className="text-sentinel-ink">Statistical Anomaly (S_anomaly, 40%):</strong>
              <p className="mt-1 text-[11px] text-slate-600">
                Sum of syndromic counts (fever + diarrhea) normalized by median baseline: Z_k = sum_7d(k) / (median_30d(k) + 1).
              </p>
            </div>

            <div className="rounded border border-slate-100 bg-slate-50 p-2.5">
              <strong className="text-sentinel-ink">Multi-Source Corroboration (S_corrob, 30%):</strong>
              <p className="mt-1 text-[11px] text-slate-600">
                Measures coordination: 1 stream elevated = 40 pts, 2 streams = 75 pts, 3+ streams (ASHA + OPD + Pharmacy) = 100 pts.
              </p>
            </div>

            <div className="rounded border border-slate-100 bg-slate-50 p-2.5">
              <strong className="text-sentinel-ink">Spatial Clustering (S_spatial, 20%):</strong>
              <p className="mt-1 text-[11px] text-slate-600">
                Scikit-Learn DBSCAN applied to geographic coordinates (Haversine metric, radius 2.5 km). Clustered elevated nodes receive 95–100 pts.
              </p>
            </div>

            <div className="rounded border border-slate-100 bg-slate-50 p-2.5">
              <strong className="text-sentinel-ink">Environmental Indicator (S_env, 10%):</strong>
              <p className="mt-1 text-[11px] text-slate-600">
                Composite of water risk index (turbidity/pH) and local precipitation deviations.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* 4. Synthetic Data Generation Standards */}
      <section className="rounded-lg border border-slate-200 bg-white p-5 shadow-xs">
        <div className="flex items-center gap-2 border-b border-slate-100 pb-3">
          <Database className="h-5 w-5 text-sentinel-teal" />
          <h2 className="text-base font-bold text-sentinel-ink">
            4. Synthetic Dataset Specification
          </h2>
        </div>

        <ul className="mt-3 space-y-2 text-xs text-slate-700 leading-relaxed list-disc pl-4">
          <li><strong>Deterministic Seed:</strong> Generated with Python random seed <code>20260828</code> for complete scientific reproducibility.</li>
          <li><strong>Scope:</strong> 12 fictional village nodes across Kalyanpur district over a continuous 60-day historical window.</li>
          <li><strong>Planted Outbreak Cluster:</strong> Rampur (loc_001), Lakshmipur (loc_002), and Devgaon (loc_003) in Demo Block East exhibit coordinated multi-signal elevation starting on Day 45.</li>
          <li><strong>Baseline Nodes:</strong> Remaining 9 villages reflect natural Poisson background variation (0.7 - 2.1 score).</li>
        </ul>
      </section>

      {/* 5. Privacy & Ethical Boundaries */}
      <section className="rounded-lg border border-slate-200 bg-white p-5 shadow-xs">
        <div className="flex items-center gap-2 border-b border-slate-100 pb-3">
          <Lock className="h-5 w-5 text-sentinel-teal" />
          <h2 className="text-base font-bold text-sentinel-ink">
            5. Privacy Safeguards & Clinical Non-Diagnostic Disclaimer
          </h2>
        </div>

        <div className="mt-3 rounded-md bg-amber-50 p-3.5 border border-amber-200 text-xs text-amber-900 leading-relaxed space-y-2">
          <p className="font-bold flex items-center gap-1.5">
            <AlertCircle className="h-4 w-4 text-amber-700" />
            <span>Ethical Governance & Disclaimer for Smart India Hackathon Jury</span>
          </p>
          <p>
            1. <strong>Zero Personal Health Information (PHI):</strong> The system operates exclusively at the aggregate geographic unit (location × day). No individual patient names, biometric data, or personally identifiable records exist.
          </p>
          <p>
            2. <strong>Not a Medical Diagnosis System:</strong> Swasthya Sentinel AI detects mathematical and spatial anomalies to direct public health inspection resources. It does not diagnose clinical etiology or provide patient treatment protocols.
          </p>
        </div>
      </section>
    </div>
  )
}

export default Methodology
