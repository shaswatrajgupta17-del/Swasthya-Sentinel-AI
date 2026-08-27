import { MapPin } from 'lucide-react'

function EmptyState({ title, message }) {
  return (
    <div className="flex flex-col items-center justify-center rounded-lg border border-dashed border-slate-300 bg-sentinel-card px-6 py-12 text-center">
      <MapPin className="mb-3 h-8 w-8 text-sentinel-teal" aria-hidden="true" />
      <p className="text-base font-semibold text-sentinel-ink">{title}</p>
      <p className="mt-1 max-w-md text-sm text-slate-600">{message}</p>
    </div>
  )
}

export default EmptyState
