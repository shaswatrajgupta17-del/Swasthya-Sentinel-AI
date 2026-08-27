import { Shield } from 'lucide-react'

function Header({ currentPage, onNavigate, districtName }) {
  const links = [
    { id: 'dashboard', label: 'Dashboard' },
    { id: 'alerts', label: 'Alerts' },
    { id: 'about', label: 'About' },
  ]

  return (
    <header className="border-b border-slate-200 bg-sentinel-card">
      <div className="mx-auto flex max-w-[1600px] flex-wrap items-center justify-between gap-4 px-6 py-3">
        <div className="flex min-w-0 items-center gap-3">
          <div
            className="flex h-10 w-10 items-center justify-center rounded-md bg-sentinel-ink text-sentinel-mist"
            aria-hidden="true"
          >
            <Shield className="h-5 w-5" />
          </div>
          <div className="min-w-0">
            <p className="text-lg font-semibold leading-tight text-sentinel-ink sm:text-xl">
              Swasthya Sentinel AI
            </p>
            <p className="truncate text-xs text-slate-500 sm:text-sm">
              Early cluster signals for rural public health — demo
            </p>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <span className="rounded-full bg-sentinel-mist px-3 py-1 text-xs text-sentinel-ink">
            {districtName}
          </span>
          <span className="rounded-full bg-sentinel-teal/15 px-3 py-1 text-xs font-medium text-sentinel-teal">
            Synthetic data
          </span>
          <span className="rounded-full border border-slate-200 px-3 py-1 text-xs text-slate-600">
            Prototype — not a diagnosis
          </span>
        </div>
      </div>

      <nav className="mx-auto flex max-w-[1600px] gap-1 px-6 pb-2" aria-label="Main">
        {links.map((link) => {
          const active = currentPage === link.id
          return (
            <button
              key={link.id}
              type="button"
              onClick={() => onNavigate(link.id)}
              className={`min-h-11 rounded-md px-3 py-2 text-sm font-medium ${
                active
                  ? 'bg-sentinel-teal/10 text-sentinel-teal'
                  : 'text-slate-600 hover:bg-sentinel-mist'
              }`}
            >
              {link.label}
            </button>
          )
        })}
      </nav>
    </header>
  )
}

export default Header
