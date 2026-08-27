import { Info, X } from 'lucide-react'
import { useState } from 'react'

const DISCLAIMER =
  'This prototype uses synthetic data and does not provide medical diagnosis.'

function DisclaimerBanner() {
  const [visible, setVisible] = useState(true)

  if (!visible) {
    return null
  }

  return (
    <div
      className="border-b border-sentinel-teal/20 bg-sentinel-ink text-sentinel-mist"
      role="status"
    >
      <div className="mx-auto flex max-w-[1600px] items-start gap-3 px-6 py-2.5">
        <Info className="mt-0.5 h-4 w-4 shrink-0 text-sentinel-teal" aria-hidden="true" />
        <p className="flex-1 text-sm leading-relaxed">{DISCLAIMER}</p>
        <button
          type="button"
          className="rounded p-1 text-sentinel-mist/80 hover:bg-white/10 hover:text-white"
          onClick={() => setVisible(false)}
          aria-label="Dismiss disclaimer for this session"
        >
          <X className="h-4 w-4" />
        </button>
      </div>
    </div>
  )
}

export default DisclaimerBanner
