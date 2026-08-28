/**
 * Risk band + numeric score. Colour is never the only cue (label is always shown).
 * Bands from design.md: Low 0–39, Watch 40–69, High 70–100.
 */
const STYLES = {
  Low: 'bg-risk-low text-white',
  Watch: 'bg-risk-watch text-sentinel-ink',
  High: 'bg-risk-high text-white',
}

function RiskBadge({ score, category, size = 'md', modelVersion = 'phase5-v1' }) {
  const label = category || 'Low'
  const padding = size === 'lg' ? 'px-3 py-2 gap-2' : 'px-2 py-1 gap-1.5'
  const scoreClass = size === 'lg' ? 'text-xl' : 'text-sm'

  return (
    <span
      className={`inline-flex items-center rounded-md font-medium tabular-nums ${padding} ${STYLES[label] || STYLES.Low}`}
      aria-label={`Risk ${score} out of 100, ${label.toLowerCase()}`}
      title={`Model version: ${modelVersion}`}
    >
      <span className={`${scoreClass} leading-none`}>Risk {score}</span>
      <span className="text-xs uppercase tracking-wide opacity-90">{label}</span>
    </span>
  )
}

export default RiskBadge
