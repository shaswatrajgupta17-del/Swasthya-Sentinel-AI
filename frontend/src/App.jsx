import { useEffect, useState } from 'react'
import Header from './components/Header'
import Sidebar from './components/Sidebar'
import DisclaimerBanner from './components/DisclaimerBanner'
import Dashboard from './pages/Dashboard'
import SurveillanceMap from './pages/SurveillanceMap'
import Locations from './pages/Locations'
import LocationDetails from './pages/LocationDetails'
import Alerts from './pages/Alerts'
import Insights from './pages/Insights'
import Notifications from './pages/Notifications'
import Methodology from './pages/Methodology'
import About from './pages/About'
import { X, ChevronRight } from 'lucide-react'
import { startSimulation } from './api/api'

const DISTRICT_NAME = 'Kalyanpur Demo District'

const DEMO_STAGES = [
  {
    step: 1,
    title: '1. Command Centre Overview',
    page: 'dashboard',
    desc: 'Review 12 village surveillance nodes, baseline KPIs, and live system health.',
  },
  {
    step: 2,
    title: '2. Surveillance Map & Cluster',
    page: 'map',
    desc: 'Observe DBSCAN spatial cluster C1 connecting Rampur, Lakshmipur, and Devgaon.',
  },
  {
    step: 3,
    title: '3. Live Synthetic Surge (5×)',
    page: 'dashboard',
    desc: 'Injecting Fever Cluster surge into live stream. Watch multi-source signals rise.',
    action: async () => {
      await startSimulation('FEVER CLUSTER', 5.0)
    },
  },
  {
    step: 4,
    title: '4. Village Node Investigation',
    page: 'location-details',
    locationId: 'loc_001',
    desc: 'Inspect Rampur: observe factor contributions (+31.2 pts ASHA, +22.4 pts OPD) totaling 98.6 pts.',
  },
  {
    step: 5,
    title: '5. Threshold Alerts & Lifecycle',
    page: 'alerts',
    desc: 'High severity alert generated (score ≥ 70). Inspect lifecycle timeline and investigate.',
  },
  {
    step: 6,
    title: '6. n8n Decoupled Webhook Automation',
    page: 'notifications',
    desc: 'Review honest webhook automation contract and external alert dispatch schema.',
  },
  {
    step: 7,
    title: '7. Methodology & Ethical Disclaimer',
    page: 'methodology',
    desc: 'Conclude with statistical DBSCAN equations, reproducible seed (20260828), and non-diagnostic privacy safeguards.',
  },
]

function App() {
  const [currentPage, setCurrentPage] = useState(() => {
    const path = window.location.pathname
    if (path.startsWith('/locations/')) return 'location-details'
    const clean = path.slice(1)
    if (clean === 'map' || clean === 'locations' || clean === 'alerts' || clean === 'insights' || clean === 'notifications' || clean === 'methodology' || clean === 'about') {
      return clean
    }
    return 'dashboard'
  })

  const [syndrome, setSyndrome] = useState('All')
  const [days, setDays] = useState(14)
  const [minScore, setMinScore] = useState(0)
  const [selectedId, setSelectedId] = useState(() => {
    const path = window.location.pathname
    return path.startsWith('/locations/') ? path.split('/')[2] : 'loc_001'
  })

  // SIH Demo Tour Mode State
  const [demoTourActive, setDemoTourActive] = useState(false)
  const [currentDemoStage, setCurrentDemoStage] = useState(0)

  useEffect(() => {
    const handlePopState = () => {
      const path = window.location.pathname
      if (path.startsWith('/locations/')) {
        setCurrentPage('location-details')
        setSelectedId(path.split('/')[2] || 'loc_001')
      } else {
        const clean = path.slice(1) || 'dashboard'
        setCurrentPage(clean)
      }
    }
    window.addEventListener('popstate', handlePopState)
    return () => window.removeEventListener('popstate', handlePopState)
  }, [])

  // Keyboard accessibility: Escape key exits demo mode
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape' && demoTourActive) {
        setDemoTourActive(false)
      }
    }
    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [demoTourActive])

  function navigate(page) {
    const path = page === 'dashboard' ? '/dashboard' : `/${page}`
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

  async function startDemoTour() {
    setDemoTourActive(true)
    setCurrentDemoStage(0)
    navigate(DEMO_STAGES[0].page)
  }

  async function advanceDemoTour() {
    const nextIndex = currentDemoStage + 1
    if (nextIndex < DEMO_STAGES.length) {
      setCurrentDemoStage(nextIndex)
      const stage = DEMO_STAGES[nextIndex]
      if (stage.action) {
        await stage.action()
      }
      if (stage.locationId) {
        setSelectedId(stage.locationId)
      }
      navigate(stage.page)
    } else {
      setDemoTourActive(false)
    }
  }

  const activeDemoStage = DEMO_STAGES[currentDemoStage]

  return (
    <div className="min-h-screen bg-sentinel-mist font-sans text-sentinel-ink antialiased flex flex-col">
      <Header
        currentPage={currentPage}
        onNavigate={navigate}
        districtName={DISTRICT_NAME}
        onStartDemo={startDemoTour}
      />
      <DisclaimerBanner />

      {/* SIH Guided Demo Tour Banner (if active) */}
      {demoTourActive && activeDemoStage && (
        <aside
          className="sticky top-0 z-50 border-b-2 border-sentinel-teal bg-sentinel-ink text-white px-4 py-3 shadow-md"
          aria-label="Guided Presentation Walkthrough"
        >
          <div className="mx-auto flex max-w-[1600px] flex-wrap items-center justify-between gap-3">
            <div className="flex items-center gap-3">
              <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-sentinel-teal text-white font-bold text-xs">
                {activeDemoStage.step}/7
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <p className="text-xs font-bold text-sentinel-teal tracking-wide uppercase">
                    SIH 5-Minute Live Presentation Walkthrough
                  </p>
                  <span className="text-slate-400">·</span>
                  <p className="text-xs font-bold text-white">{activeDemoStage.title}</p>
                </div>
                <p className="text-xs text-slate-300">{activeDemoStage.desc}</p>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={advanceDemoTour}
                className="inline-flex min-h-[36px] items-center gap-1.5 rounded bg-sentinel-teal hover:bg-sentinel-teal-dark px-3.5 text-xs font-bold text-white shadow-xs cursor-pointer"
              >
                <span>{currentDemoStage === DEMO_STAGES.length - 1 ? 'Finish Tour' : 'Next Presentation Step'}</span>
                <ChevronRight className="h-4 w-4" />
              </button>
              <button
                type="button"
                onClick={() => setDemoTourActive(false)}
                className="inline-flex min-h-[36px] items-center justify-center rounded border border-slate-700 bg-slate-800 p-2 text-slate-300 hover:text-white cursor-pointer"
                title="Exit Demo Tour (Esc)"
              >
                <X className="h-4 w-4" />
              </button>
            </div>
          </div>
        </aside>
      )}

      {/* Main App Layout */}
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

        <main className="min-w-0 flex-1 p-4 sm:p-6" id="main-content">
          {currentPage === 'dashboard' && (
            <Dashboard
              selectedId={selectedId}
              onSelectLocation={setSelectedId}
              days={days}
              syndrome={syndrome}
              minScore={minScore}
              isDemoMode={demoTourActive}
              onNextDemoStep={advanceDemoTour}
            />
          )}
          {currentPage === 'map' && (
            <SurveillanceMap
              onSelectLocation={setSelectedId}
              onNavigateToLocation={selectLocation}
            />
          )}
          {currentPage === 'locations' && (
            <Locations onSelectLocation={selectLocation} />
          )}
          {currentPage === 'location-details' && (
            <LocationDetails
              locationId={selectedId}
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
      <footer className="border-t border-slate-200 bg-white py-4 text-center text-xs text-slate-500">
        <div className="mx-auto max-w-[1600px] px-6 flex flex-wrap items-center justify-between gap-2">
          <p>
            Swasthya Sentinel AI · Smart India Hackathon (SIH2026-STATE-04) Synthetic Demonstration
          </p>
          <p className="text-[11px] text-slate-400">
            Complies with GIGW & WCAG AA Accessibility Standards · No Patient PHI
          </p>
        </div>
      </footer>
    </div>
  )
}

export default App
