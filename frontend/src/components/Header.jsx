import { useEffect, useState } from 'react'
import { Activity, Bell, BrainCircuit, BookOpen, Map, MapPin, Shield, Workflow, Sparkles } from 'lucide-react'

function Header({ currentPage, onNavigate, districtName = 'Kalyanpur Demo District', onStartDemo }) {
  const [currentTime, setCurrentTime] = useState(() => new Date().toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit', second: '2-digit' }))

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date().toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit', second: '2-digit' }))
    }, 1000)
    return () => clearInterval(timer)
  }, [])

  const navItems = [
    { id: 'dashboard', label: 'Command Centre', hindi: 'कमांड सेंटर', icon: Activity },
    { id: 'map', label: 'Surveillance Map', hindi: 'निगरानी मानचित्र', icon: Map },
    { id: 'locations', label: 'Locations', hindi: 'स्थान सूची', icon: MapPin },
    { id: 'alerts', label: 'Alerts & Response', hindi: 'अलर्ट एवं प्रतिक्रिया', icon: Bell },
    { id: 'insights', label: 'AI Insights', hindi: 'एआई अंतर्दृष्टि', icon: BrainCircuit },
    { id: 'notifications', label: 'Notifications', hindi: 'अधिसूचना स्वचालन', icon: Workflow },
    { id: 'methodology', label: 'Methodology', hindi: 'कार्यप्रणाली', icon: BookOpen },
    { id: 'about', label: 'About', hindi: 'परियोजना विवरण', icon: Shield },
  ]

  return (
    <>
      <a href="#main-content" className="skip-link">
        Skip to main content
      </a>

      {/* Top Administrative Utility Bar */}
      <div className="border-b border-slate-700 bg-sentinel-ink text-slate-200 text-xs py-1.5 px-4 sm:px-6">
        <div className="mx-auto flex max-w-[1600px] flex-wrap items-center justify-between gap-2">
          <div className="flex items-center gap-2">
            <span className="font-semibold tracking-wide text-white uppercase text-[11px] bg-slate-800 px-2 py-0.5 rounded border border-slate-700">
              SIH 2026 Prototype
            </span>
            <span className="text-slate-400">·</span>
            <span className="text-slate-300">Rural Public Health Early Warning & Surveillance</span>
            <span className="hidden md:inline text-slate-400">·</span>
            <span className="hidden md:inline rounded bg-sentinel-teal/20 px-2 py-0.5 text-sentinel-teal font-medium">
              Synthetic Data Only
            </span>
          </div>

          <div className="flex items-center gap-3">
            <div className="flex items-center gap-1.5">
              <span className="h-2 w-2 rounded-full bg-emerald-400 animate-pulse" aria-hidden="true" />
              <span className="text-slate-300 font-medium">System Status: <span className="text-emerald-300">Operational</span></span>
            </div>
            <span className="text-slate-500">|</span>
            <span className="tabular-nums text-slate-400 text-[11px]">
              IST {currentTime}
            </span>
          </div>
        </div>
      </div>

      {/* Main Header / Branding */}
      <header className="border-b border-slate-200 bg-white shadow-xs">
        <div className="mx-auto flex max-w-[1600px] flex-wrap items-center justify-between gap-4 px-4 py-3.5 sm:px-6">
          <div className="flex min-w-0 items-center gap-3.5">
            {/* Professional Shield + Watchtower + Map-Pin Emblem */}
            <div
              className="flex h-11 w-11 shrink-0 items-center justify-center rounded-lg bg-sentinel-ink text-white shadow-sm border border-slate-800"
              aria-hidden="true"
            >
              <div className="relative">
                <Shield className="h-6 w-6 text-sentinel-teal" />
                <MapPin className="h-3 w-3 text-white absolute top-1.5 left-1.5" />
              </div>
            </div>

            <div className="min-w-0">
              <div className="flex items-center gap-2">
                <h1 className="text-xl font-bold tracking-tight text-sentinel-ink sm:text-2xl">
                  Swasthya Sentinel AI
                </h1>
                <span className="hidden sm:inline-block rounded-md border border-slate-200 bg-slate-50 px-2 py-0.5 text-[11px] font-semibold text-slate-600 uppercase">
                  v1.0 Demo
                </span>
              </div>
              <p className="truncate text-xs font-medium text-slate-500">
                District Surveillance & Multi-Source Anomaly Detection · {districtName}
              </p>
            </div>
          </div>

          {/* Right Header Actions */}
          <div className="flex flex-wrap items-center gap-2.5">
            {onStartDemo && (
              <button
                type="button"
                onClick={onStartDemo}
                className="inline-flex items-center gap-1.5 rounded-md bg-sentinel-teal hover:bg-sentinel-teal-dark px-3.5 py-2 text-xs font-semibold text-white shadow-xs transition-colors cursor-pointer min-h-[40px]"
                title="Start 5-Minute SIH Demo Sequence"
              >
                <Sparkles className="h-3.5 w-3.5 text-amber-300" />
                <span>SIH Demo Mode</span>
              </button>
            )}

            <div className="hidden lg:flex items-center gap-2 rounded-md border border-slate-200 bg-slate-50 px-3 py-1.5 text-xs text-slate-700">
              <span className="font-semibold text-sentinel-ink">{districtName}</span>
              <span className="text-slate-400">/</span>
              <span className="text-slate-500">12 Village Nodes</span>
            </div>
          </div>
        </div>

        {/* Administrative Navigation Tabs */}
        <nav className="mx-auto flex max-w-[1600px] overflow-x-auto px-4 sm:px-6 scrollbar-none border-t border-slate-100" aria-label="Main Navigation">
          <div className="flex gap-1 py-1">
            {navItems.map((item) => {
              const active = currentPage === item.id || (currentPage === 'location-details' && item.id === 'locations')
              const Icon = item.icon
              return (
                <button
                  key={item.id}
                  type="button"
                  onClick={() => onNavigate(item.id)}
                  aria-current={active ? 'page' : undefined}
                  className={`inline-flex min-h-[44px] shrink-0 items-center gap-2 rounded-md px-3.5 py-2 text-xs font-semibold transition-all cursor-pointer ${
                    active
                      ? 'border-b-2 border-sentinel-teal bg-sentinel-teal/10 text-sentinel-teal-dark'
                      : 'text-slate-600 hover:bg-slate-100 hover:text-sentinel-ink'
                  }`}
                >
                  <Icon className={`h-4 w-4 ${active ? 'text-sentinel-teal' : 'text-slate-400'}`} aria-hidden="true" />
                  <div className="text-left">
                    <div>{item.label}</div>
                    <div className="text-[10px] font-normal text-slate-400 leading-tight">{item.hindi}</div>
                  </div>
                </button>
              )
            })}
          </div>
        </nav>
      </header>
    </>
  )
}

export default Header
