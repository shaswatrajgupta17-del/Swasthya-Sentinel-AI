import { useEffect, useState } from 'react'
import Header from './components/Header'
import Sidebar from './components/Sidebar'
import DisclaimerBanner from './components/DisclaimerBanner'
import Dashboard from './pages/Dashboard'
import Alerts from './pages/Alerts'
import About from './pages/About'
import Locations from './pages/Locations'
import LocationDetails from './pages/LocationDetails'
import Insights from './pages/Insights'
import Notifications from './pages/Notifications'

const DISTRICT_NAME = 'Kalyanpur Demo District'

function App() {
  const [currentPage, setCurrentPage] = useState(() => {
    const path = window.location.pathname
    if (path.startsWith('/locations/')) return 'location-details'
    return path.slice(1) || 'dashboard'
  })
  const [syndrome, setSyndrome] = useState('All')
  const [days, setDays] = useState(7)
  const [minScore, setMinScore] = useState(0)
  const [selectedId, setSelectedId] = useState(() => {
    const path = window.location.pathname
    return path.startsWith('/locations/') ? path.split('/')[2] : null
  })

  useEffect(() => {
    const handlePopState = () => {
      const path = window.location.pathname
      setCurrentPage(path.startsWith('/locations/') ? 'location-details' : path.slice(1) || 'dashboard')
      if (path.startsWith('/locations/')) setSelectedId(path.split('/')[2])
    }
    window.addEventListener('popstate', handlePopState)
    return () => window.removeEventListener('popstate', handlePopState)
  }, [])

  function navigate(page) {
    const path = page === 'dashboard' ? '/dashboard' : `/${page}`
    window.history.pushState({}, '', path)
    setCurrentPage(page)
  }

  function selectLocation(locationId) {
    setSelectedId(locationId)
    window.history.pushState({}, '', `/locations/${locationId}`)
    setCurrentPage('location-details')
  }

  return (
    <div className="min-h-screen bg-sentinel-mist font-sans text-sentinel-ink">
      <Header
        currentPage={currentPage}
        onNavigate={navigate}
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
          {currentPage === 'locations' && <Locations onSelectLocation={selectLocation} />}
          {currentPage === 'location-details' && <LocationDetails locationId={selectedId} onBack={() => navigate('locations')} />}
          {currentPage === 'alerts' && <Alerts />}
          {currentPage === 'insights' && <Insights />}
          {currentPage === 'notifications' && <Notifications />}
          {currentPage === 'about' && <About />}
        </main>
      </div>
    </div>
  )
}

export default App
