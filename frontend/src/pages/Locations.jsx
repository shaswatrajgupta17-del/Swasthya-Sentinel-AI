import { useEffect, useState } from 'react'
import { MapPin, ChevronRight, CheckCircle2, Download } from 'lucide-react'
import { getLocations, getRisks } from '../api/api'
import RiskBadge from '../components/RiskBadge'

function riskLevel(score) {
  if (score >= 70) return 'High'
  if (score >= 40) return 'Watch'
  return 'Low'
}

function Locations({ onSelectLocation, syndrome = 'All' }) {
  const [locations, setLocations] = useState([])
  const [risks, setRisks] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    async function load() {
      try {
        const synd = syndrome === 'All' ? 'all' : syndrome.toLowerCase()
        const [locs, r] = await Promise.all([getLocations(), getRisks(synd)])
        setLocations(locs)
        setRisks(r)
      } catch {
        setError('Unable to load village data.')
      } finally {
        setLoading(false)
      }
    }
    load()
    const t = setInterval(load, 5000)
    return () => clearInterval(t)
  }, [syndrome])

  if (loading) {
    return <div className="card p-6 h-96 animate-pulse" />
  }

  if (error) {
    return <div className="card p-6 text-red-600">{error}</div>
  }

  // Combine and sort by risk
  const list = locations.map(loc => {
    const risk = risks.find(r => r.location_id === loc.location_id)
    return { ...loc, risk }
  }).sort((a, b) => (b.risk?.score_0_100 || 0) - (a.risk?.score_0_100 || 0))

  function downloadCSV() {
    const header = "Village,Block,Risk Score,Status,Population,Main Signal\n"
    const rows = list.map(item => {
      const score = item.risk ? Math.round(item.risk.score_0_100) : 0
      const status = riskLevel(score)
      const pop = item.population_base
      const sig = item.risk?.main_signal || 'None'
      return `"${item.name}","${item.block}",${score},"${status}",${pop},"${sig}"`
    }).join("\n")
    
    const blob = new Blob([header + rows], { type: 'text/csv' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `District_Health_Status_${new Date().toISOString().split('T')[0]}.csv`
    a.click()
  }

  return (
    <div className="space-y-4">
      <div className="card p-5 flex items-center justify-between flex-wrap gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <MapPin className="h-5 w-5" style={{ color: 'var(--teal)' }} />
            <h1 className="text-xl font-bold" style={{ color: 'var(--text-main)' }}>Village Directory</h1>
          </div>
          <p className="text-sm" style={{ color: 'var(--text-muted)' }}>
            All surveillance nodes in the district
          </p>
        </div>
        <button
          onClick={downloadCSV}
          className="flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-bold border transition-colors cursor-pointer hover:bg-slate-100"
          style={{ borderColor: 'var(--border)', color: 'var(--text-main)', background: 'var(--bg-card)' }}
        >
          <Download className="h-4 w-4" /> Download Report (CSV)
        </button>
      </div>

      <div className="grid gap-3 lg:grid-cols-2 xl:grid-cols-3">
        {list.map(item => {
          const score = item.risk?.score_0_100 ?? 0
          return (
            <button
              key={item.location_id}
              onClick={() => onSelectLocation(item.location_id)}
              className="card flex flex-col justify-between text-left transition-colors cursor-pointer hover:opacity-90 overflow-hidden group"
            >
              <div className="p-4 border-l-4" style={{ borderLeftColor: score >= 70 ? 'var(--red)' : score >= 40 ? 'var(--amber)' : 'var(--green)' }}>
                <div className="flex justify-between items-start mb-2">
                  <span className="text-xs font-bold uppercase" style={{ color: 'var(--text-muted)' }}>{item.block} Block</span>
                  <RiskBadge score={score} />
                </div>
                <h3 className="text-lg font-bold mb-1 group-hover:text-teal-600 transition-colors" style={{ color: 'var(--text-main)' }}>{item.name}</h3>
                
                {score < 40 ? (
                  <p className="text-xs flex items-center gap-1" style={{ color: 'var(--green)' }}>
                    <CheckCircle2 className="h-3.5 w-3.5" /> Normal health signals
                  </p>
                ) : (
                  <p className="text-xs font-medium" style={{ color: score >= 70 ? 'var(--red)' : 'var(--amber)' }}>
                    {item.risk?.main_signal ? `Elevated ${item.risk.main_signal} signals` : 'Elevated health signals'}
                  </p>
                )}
              </div>
              
              <div className="bg-slate-50 p-2 flex justify-end" style={{ background: 'var(--bg-app)', borderTop: '1px solid var(--border)' }}>
                <span className="text-xs font-bold flex items-center gap-1" style={{ color: 'var(--teal)' }}>
                  View Details <ChevronRight className="h-3 w-3" />
                </span>
              </div>
            </button>
          )
        })}
      </div>
    </div>
  )
}

export default Locations
