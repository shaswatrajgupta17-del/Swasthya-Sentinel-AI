import { useEffect, useState } from 'react'
import { Activity, Bell, BrainCircuit, BookOpen, Map, MapPin, Shield, Workflow, Sparkles, Moon, Sun } from 'lucide-react'

function Header({ currentPage, onNavigate, districtName = 'Kalyanpur District', onStartDemo, darkMode, onToggleDark }) {
  const [currentTime, setCurrentTime] = useState(() =>
    new Date().toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit', second: '2-digit' })
  )

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date().toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit', second: '2-digit' }))
    }, 1000)
    return () => clearInterval(timer)
  }, [])

  const navItems = [
    { id: 'dashboard',   label: 'Command Centre',    hindi: 'मुख्य डैशबोर्ड',       icon: Activity },
    { id: 'map',         label: 'District Map',       hindi: 'जिला निगरानी मानचित्र', icon: Map },
    { id: 'locations',   label: 'Village List',       hindi: 'ग्राम सूची',            icon: MapPin },
    { id: 'alerts',      label: 'Alerts',             hindi: 'अलर्ट एवं कार्रवाई',   icon: Bell },
    { id: 'insights',    label: 'How It Works',       hindi: 'प्रणाली विवरण',         icon: BrainCircuit },
    { id: 'notifications', label: 'Notifications',    hindi: 'सूचना स्वचालन',         icon: Workflow },
    { id: 'methodology', label: 'Methodology',        hindi: 'कार्यप्रणाली',           icon: BookOpen },
    { id: 'about',       label: 'About',              hindi: 'परियोजना',              icon: Shield },
  ]

  return (
    <>
      <a href="#main-content" className="skip-link">
        Skip to main content
      </a>

      {/* Disclaimer strip — always visible */}
      <div className="disclaimer-strip">
        ⚠ Synthetic data — demonstration only &nbsp;·&nbsp; This system does not diagnose any disease
      </div>

      {/* Utility bar */}
      <div
        className="border-b text-xs py-1.5 px-4 sm:px-6"
        style={{ background: 'var(--bg-header)', borderColor: 'rgba(255,255,255,0.08)', color: 'rgba(255,255,255,0.7)' }}
      >
        <div className="mx-auto flex max-w-[1600px] flex-wrap items-center justify-between gap-2">
          <div className="flex items-center gap-2">
            <span
              className="font-bold tracking-wide uppercase text-[11px] px-2 py-0.5 rounded"
              style={{ background: 'rgba(255,255,255,0.1)', color: 'rgba(255,255,255,0.9)' }}
            >
              SIH 2026 Prototype
            </span>
            <span style={{ color: 'rgba(255,255,255,0.3)' }}>·</span>
            <span style={{ color: 'rgba(255,255,255,0.6)' }}>Rural Public Health Early Warning System</span>
          </div>

          <div className="flex items-center gap-3">
            <div className="flex items-center gap-1.5">
              <span className="live-pulse" aria-hidden="true" />
              <span style={{ color: 'rgba(255,255,255,0.7)' }}>
                Status: <span style={{ color: '#4ade80' }}>Online</span>
              </span>
            </div>
            <span style={{ color: 'rgba(255,255,255,0.2)' }}>|</span>
            <span className="tabular-nums text-[11px]" style={{ color: 'rgba(255,255,255,0.5)' }}>
              IST {currentTime}
            </span>
          </div>
        </div>
      </div>

      {/* Main header / branding */}
      <header className="card" style={{ borderRadius: 0, borderLeft: 'none', borderRight: 'none', borderTop: 'none', boxShadow: 'none', background: 'var(--bg-card)', borderColor: 'var(--border)' }}>
        <div className="mx-auto flex max-w-[1600px] flex-wrap items-center justify-between gap-4 px-4 py-3 sm:px-6">
          {/* Logo + branding */}
          <div className="flex min-w-0 items-center gap-3.5">
            <div
              className="flex h-11 w-11 shrink-0 items-center justify-center rounded-lg shadow-sm"
              style={{ background: 'var(--bg-header)' }}
              aria-hidden="true"
            >
              <div className="relative">
                <Shield className="h-6 w-6" style={{ color: 'var(--teal)' }} />
                <MapPin className="h-3 w-3 text-white absolute top-1.5 left-1.5" />
              </div>
            </div>

            <div className="min-w-0">
              <div className="flex items-center gap-2">
                <h1 className="text-xl font-bold tracking-tight sm:text-2xl" style={{ color: 'var(--text-main)' }}>
                  Swasthya Sentinel AI
                </h1>
                <span
                  className="hidden sm:inline-block rounded px-2 py-0.5 text-[11px] font-semibold uppercase"
                  style={{ background: 'var(--teal-light)', color: 'var(--teal)', border: '1px solid rgba(14,124,123,0.2)' }}
                >
                  v1.0 Demo
                </span>
              </div>
              <p className="truncate text-sm font-medium" style={{ color: 'var(--text-muted)' }}>
                District Public Health Early Warning &amp; Surveillance · {districtName}
              </p>
            </div>
          </div>

          {/* Header actions */}
          <div className="flex flex-wrap items-center gap-2">
            {/* Dark mode toggle */}
            <button
              type="button"
              onClick={onToggleDark}
              aria-label={darkMode ? 'Switch to light mode' : 'Switch to dark mode'}
              className="flex items-center justify-center w-9 h-9 rounded-lg border cursor-pointer transition-colors"
              style={{ borderColor: 'var(--border)', background: 'var(--teal-light)', color: 'var(--teal)' }}
              title={darkMode ? 'Light mode' : 'Dark mode'}
            >
              {darkMode ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
            </button>

            {/* SIH Demo button */}
            {onStartDemo && (
              <button
                type="button"
                onClick={onStartDemo}
                id="btn-sih-demo"
                className="inline-flex items-center gap-1.5 rounded-lg px-3.5 py-2 text-sm font-semibold text-white shadow-sm transition-all cursor-pointer min-h-[38px]"
                style={{ background: 'var(--teal)' }}
                title="Run the 18-step SIH demonstration"
              >
                <Sparkles className="h-3.5 w-3.5" style={{ color: '#fde68a' }} />
                <span>Run SIH Demo</span>
              </button>
            )}

            {/* District badge */}
            <div
              className="hidden lg:flex items-center gap-2 rounded-lg px-3 py-1.5 text-sm"
              style={{ background: 'var(--teal-light)', border: '1px solid rgba(14,124,123,0.15)', color: 'var(--text-main)' }}
            >
              <MapPin className="h-3.5 w-3.5" style={{ color: 'var(--teal)' }} />
              <span className="font-semibold">{districtName}</span>
              <span style={{ color: 'var(--text-light)' }}>/</span>
              <span style={{ color: 'var(--text-muted)' }}>12 Villages</span>
            </div>
          </div>
        </div>

        {/* Navigation tabs */}
        <nav
          className="mx-auto flex max-w-[1600px] overflow-x-auto px-4 sm:px-6 border-t"
          style={{ borderColor: 'var(--border)' }}
          aria-label="Main navigation"
        >
          <div className="flex gap-0.5 py-1">
            {navItems.map((item) => {
              const active = currentPage === item.id || (currentPage === 'location-details' && item.id === 'locations')
              const Icon = item.icon
              return (
                <button
                  key={item.id}
                  type="button"
                  id={`nav-${item.id}`}
                  onClick={() => onNavigate(item.id)}
                  aria-current={active ? 'page' : undefined}
                  className="inline-flex min-h-[44px] shrink-0 items-center gap-1.5 rounded-md px-3 py-2 text-sm font-medium transition-all cursor-pointer"
                  style={
                    active
                      ? { background: 'var(--teal-light)', color: 'var(--teal)', borderBottom: `2px solid var(--teal)` }
                      : { color: 'var(--text-muted)' }
                  }
                >
                  <Icon
                    className="h-4 w-4 shrink-0"
                    style={{ color: active ? 'var(--teal)' : 'var(--text-light)' }}
                    aria-hidden="true"
                  />
                  <div className="text-left leading-tight">
                    <div>{item.label}</div>
                    <div className="text-[10px] font-normal" style={{ color: 'var(--text-light)' }}>{item.hindi}</div>
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
