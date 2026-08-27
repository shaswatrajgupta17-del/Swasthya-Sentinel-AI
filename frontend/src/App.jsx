import { useMemo, useState } from 'react'
import Header from './components/Header'
import Sidebar from './components/Sidebar'
import DisclaimerBanner from './components/DisclaimerBanner'
import Dashboard from './pages/Dashboard'
import Alerts from './pages/Alerts'
import About from './pages/About'
import { DISTRICT_NAME, alerts as mockAlerts } from './data/mockData'
import { locations as mockLocations } from './data/locationData'

function App() {
  const [currentPage, setCurrentPage] = useState('dashboard')
  const [syndrome, setSyndrome] = useState('All')
  const [days, setDays] = useState(7)
  const [minScore, setMinScore] = useState(0)
  const [selectedId, setSelectedId] = useState(mockLocations[0]?.id || null)

  const filteredLocations = useMemo(() => {
    return mockLocations.filter((loc) => {
      const syndromeOk = syndrome === 'All' || loc.syndrome === syndrome
      const scoreOk = loc.riskScore >= minScore
      return syndromeOk && scoreOk
    })
  }, [syndrome, minScore])

  const filteredAlerts = useMemo(() => {
    return mockAlerts.filter((alert) => {
      const loc = mockLocations.find((l) => l.id === alert.locationId)
      if (!loc) return false
      const syndromeOk = syndrome === 'All' || loc.syndrome === syndrome
      const scoreOk = alert.score >= minScore
      return syndromeOk && scoreOk
    })
  }, [syndrome, minScore])

  return (
    <div className="min-h-screen bg-sentinel-mist font-sans text-sentinel-ink">
      <Header
        currentPage={currentPage}
        onNavigate={setCurrentPage}
        districtName={DISTRICT_NAME}
      />
      <DisclaimerBanner />

      <div className="mx-auto flex max-w-[1600px] flex-col lg:flex-row">
        <Sidebar
          currentPage={currentPage}
          syndrome={syndrome}
          days={days}
          minScore={minScore}
          onSyndromeChange={setSyndrome}
          onDaysChange={setDays}
          onMinScoreChange={setMinScore}
        />

        <main className="min-w-0 flex-1 p-6">
          {currentPage === 'dashboard' && (
            <Dashboard
              locations={filteredLocations}
              selectedId={selectedId}
              onSelectLocation={setSelectedId}
              days={days}
            />
          )}
          {currentPage === 'alerts' && <Alerts alerts={filteredAlerts} />}
          {currentPage === 'about' && <About />}
        </main>
      </div>
    </div>
  )
}

export default App
