import { useEffect, useState, useRef } from 'react'
import Header from './components/Header'
import Sidebar from './components/Sidebar'
import Dashboard from './pages/Dashboard'
import SurveillanceMap from './pages/SurveillanceMap'
import Locations from './pages/Locations'
import LocationDetails from './pages/LocationDetails'
import Alerts from './pages/Alerts'
import Insights from './pages/Insights'
import Notifications from './pages/Notifications'
import Methodology from './pages/Methodology'
import About from './pages/About'
import { X, ChevronRight, Sparkles } from 'lucide-react'
import { startSimulation } from './api/api'

const DISTRICT_NAME = 'Kalyanpur District'

// 18-step SIH demo sequence
const DEMO_STAGES = [
  {
    step: 1, total: 9,
    title: 'Normal district — all villages at baseline',
    page: 'dashboard',
    desc: 'Show the district in normal state. 12 villages monitored. Health signals are within expected range.',
  },
  {
    step: 2, total: 9,
    title: 'Filter by Fever signal',
    page: 'dashboard',
    desc: 'Select "Fever" in the sidebar. The map and KPIs now focus only on fever-related health signals.',
    syndrome: 'Fever',
  },
  {
    step: 3, total: 9,
    title: 'Start simulation — Fever increase scenario',
    page: 'dashboard',
    desc: 'Injecting a fever surge into Rampur, Lakshmipur, and Devgaon. Watch numbers change live.',
    action: async () => { await startSimulation('FEVER CLUSTER', 5.0) },
  },
  {
    step: 4, total: 9,
    title: 'Watch the district map change',
    page: 'map',
    desc: 'Map markers for East Block villages turn amber → red as risk scores rise. Cluster highlighted.',
  },
  {
    step: 5, total: 9,
    title: 'New alert appears',
    page: 'alerts',
    desc: 'System automatically created a High severity alert for Rampur when the risk exceeded 70.',
  },
  {
    step: 6, total: 9,
    title: 'Open village: Rampur',
    page: 'location-details',
    locationId: 'loc_001',
    desc: 'Investigate Rampur. See ASHA reports, OPD visits, and pharmacy data — all above normal.',
  },
  {
    step: 7, total: 9,
    title: '"Why was this flagged?"',
    page: 'location-details',
    locationId: 'loc_001',
    desc: 'Plain-language explanation: ASHA reports +54.8% above normal. OPD visits confirm. Nearby villages also flagged.',
  },
  {
    step: 8, total: 9,
    title: 'Acknowledge the alert',
    page: 'alerts',
    desc: 'Officer marks the alert as "Under investigation". System records the action with a timestamp.',
  },
  {
    step: 9, total: 9,
    title: 'Notification & system status',
    page: 'notifications',
    desc: 'Show n8n notification pipeline and system status. Test notification button available.',
  },
]

function App() {
  const [currentPage, setCurrentPage] = useState(() => {
    const path = window.location.pathname
    if (path.startsWith('/locations/')) return 'location-details'
    const clean = path.slice(1)
    if (['map', 'locations', 'alerts', 'insights', 'notifications', 'methodology', 'about'].includes(clean)) return clean
    return 'dashboard'
  })

  const [syndrome, setSyndrome] = useState('All')
  const [days, setDays] = useState(14)
  const [minScore, setMinScore] = useState(0)
  const [selectedId, setSelectedId] = useState(() => {
    const path = window.location.pathname
    return path.startsWith('/locations/') ? path.split('/')[2] : 'loc_001'
  })

  // Dark mode
  const [darkMode, setDarkMode] = useState(() => {
    if (typeof window === 'undefined') return false
    return localStorage.getItem('swasthya-dark') === 'true' ||
      (!localStorage.getItem('swasthya-dark') && window.matchMedia('(prefers-color-scheme: dark)').matches)
  })

  useEffect(() => {
    document.documentElement.setAttribute('data-theme', darkMode ? 'dark' : 'light')
    localStorage.setItem('swasthya-dark', darkMode ? 'true' : 'false')
  }, [darkMode])

  // Demo tour
  const [demoActive, setDemoActive] = useState(false)
  const [demoStep, setDemoStep] = useState(0)
  const demoSyndromeRef = useRef('All')

  useEffect(() => {
    const handlePop = () => {
      const path = window.location.pathname
      if (path.startsWith('/locations/')) {
        setCurrentPage('location-details')
        setSelectedId(path.split('/')[2] || 'loc_001')
      } else {
        setCurrentPage(path.slice(1) || 'dashboard')
      }
    }
    window.addEventListener('popstate', handlePop)
    return () => window.removeEventListener('popstate', handlePop)
  }, [])

  useEffect(() => {
    const onKey = (e) => { if (e.key === 'Escape' && demoActive) setDemoActive(false) }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [demoActive])

  function navigate(page) {
    const path = page === 'dashboard' ? '/' : `/${page}`
    window.history.pushState({}, '', path)
    setCurrentPage(page)
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  function selectLocation(locationId) {
    setSelectedId(locationId)
    window.history.pushState({}, '', `/locations/${locationId}`)
    setCurrentPage('location-details')
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  function startDemo() {
    setDemoActive(true)
    setDemoStep(0)
    navigate(DEMO_STAGES[0].page)
  }

  async function nextDemoStep() {
    const next = demoStep + 1
    if (next >= DEMO_STAGES.length) { setDemoActive(false); return }
    setDemoStep(next)
    const stage = DEMO_STAGES[next]
    if (stage.action) await stage.action()
    if (stage.syndrome) { setSyndrome(stage.syndrome); demoSyndromeRef.current = stage.syndrome }
    if (stage.locationId) { setSelectedId(stage.locationId); selectLocation(stage.locationId); return }
    navigate(stage.page)
  }

  const activeStage = DEMO_STAGES[demoStep]

  return (
    <div
      className="min-h-screen flex flex-col transition-theme"
      style={{ background: 'var(--bg-app)', color: 'var(--text-main)' }}
    >
      <Header
        currentPage={currentPage}
        onNavigate={navigate}
        districtName={DISTRICT_NAME}
        onStartDemo={startDemo}
        darkMode={darkMode}
        onToggleDark={() => setDarkMode(d => !d)}
      />

      {/* SIH Demo Banner */}
      {demoActive && activeStage && (
        <aside
          className="sticky top-0 z-50 border-b-2 px-4 py-3 shadow-lg"
          style={{ background: 'var(--bg-header)', borderColor: 'var(--teal)', color: 'white' }}
          role="status"
          aria-live="polite"
        >
          <div className="mx-auto flex max-w-[1600px] flex-wrap items-center justify-between gap-3">
            <div className="flex items-center gap-3">
              <div
                className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full text-white font-bold text-sm"
                style={{ background: 'var(--teal)' }}
              >
                {activeStage.step}/{activeStage.total}
              </div>
              <Sparkles className="h-4 w-4" style={{ color: '#fde68a' }} />
              <div>
                <p className="text-xs font-bold tracking-wide uppercase" style={{ color: 'var(--teal)' }}>
                  SIH Demo Walkthrough
                </p>
                <p className="text-sm font-semibold text-white">{activeStage.title}</p>
                <p className="text-xs mt-0.5" style={{ color: 'rgba(255,255,255,0.6)' }}>{activeStage.desc}</p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={nextDemoStep}
                className="inline-flex min-h-[36px] items-center gap-1.5 rounded-lg px-4 text-sm font-bold text-white cursor-pointer"
                style={{ background: 'var(--teal)' }}
              >
                <span>{demoStep === DEMO_STAGES.length - 1 ? 'Finish Demo' : 'Next Step'}</span>
                <ChevronRight className="h-4 w-4" />
              </button>
              <button
                type="button"
                onClick={() => setDemoActive(false)}
                className="flex h-9 w-9 items-center justify-center rounded-lg border cursor-pointer"
                style={{ borderColor: 'rgba(255,255,255,0.15)', color: 'rgba(255,255,255,0.6)' }}
                title="Exit demo (Esc)"
              >
                <X className="h-4 w-4" />
              </button>
            </div>
          </div>
        </aside>
      )}

      {/* Main layout */}
      <div className="mx-auto flex w-full max-w-[1600px] flex-1 flex-col lg:flex-row">
        <Sidebar
          currentPage={currentPage}
          syndrome={syndrome}
          days={days}
          minScore={minScore}
          onSyndromeChange={setSyndrome}
          onDaysChange={setDays}
          onMinScoreChange={setMinScore}
        />

        <main className="min-w-0 flex-1 p-4 sm:p-6" id="main-content" tabIndex={-1}>
          {currentPage === 'dashboard' && (
            <Dashboard
              selectedId={selectedId}
              onSelectLocation={selectLocation}
              days={days}
              syndrome={syndrome}
              minScore={minScore}
            />
          )}
          {currentPage === 'map' && (
            <SurveillanceMap
              syndrome={syndrome}
              days={days}
              minScore={minScore}
              onSelectLocation={selectLocation}
            />
          )}
          {currentPage === 'locations' && (
            <Locations onSelectLocation={selectLocation} syndrome={syndrome} />
          )}
          {currentPage === 'location-details' && (
            <LocationDetails
              locationId={selectedId}
              days={days}
              onBack={() => navigate('locations')}
              onSelectOtherLocation={selectLocation}
            />
          )}
          {currentPage === 'alerts' && (
            <Alerts onSelectLocation={selectLocation} />
          )}
          {currentPage === 'insights' && <Insights />}
          {currentPage === 'notifications' && <Notifications />}
          {currentPage === 'methodology' && <Methodology />}
          {currentPage === 'about' && <About onNavigate={navigate} />}
        </main>
      </div>

      {/* Footer */}
      <footer
        className="border-t py-4 text-center text-xs"
        style={{ borderColor: 'var(--border)', background: 'var(--bg-card)', color: 'var(--text-muted)' }}
      >
        <div className="mx-auto max-w-[1600px] px-6 flex flex-wrap items-center justify-between gap-2">
          <p>Swasthya Sentinel AI · Smart India Hackathon SIH2026 · Synthetic Demonstration Only</p>
          <p className="text-[11px]" style={{ color: 'var(--text-light)' }}>
            GIGW &amp; WCAG 2.1 AA Compliant · No Patient Health Data Used
          </p>
        </div>
      </footer>
    </div>
  )
}

export default App
