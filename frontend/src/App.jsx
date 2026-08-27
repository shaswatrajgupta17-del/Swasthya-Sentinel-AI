import { useState } from 'react'
import Header from './components/Header'
import Sidebar from './components/Sidebar'
import DisclaimerBanner from './components/DisclaimerBanner'
import Dashboard from './pages/Dashboard'
import Alerts from './pages/Alerts'
import About from './pages/About'

const DISTRICT_NAME = 'Kalyanpur Demo District'

function App() {
  const [currentPage, setCurrentPage] = useState('dashboard')
  const [syndrome, setSyndrome] = useState('All')
  const [days, setDays] = useState(7)
  const [minScore, setMinScore] = useState(0)
  const [selectedId, setSelectedId] = useState(null)

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
              selectedId={selectedId}
              onSelectLocation={setSelectedId}
              days={days}
              syndrome={syndrome}
              minScore={minScore}
            />
          )}
          {currentPage === 'alerts' && <Alerts />}
          {currentPage === 'about' && <About />}
        </main>
      </div>
    </div>
  )
}

export default App
