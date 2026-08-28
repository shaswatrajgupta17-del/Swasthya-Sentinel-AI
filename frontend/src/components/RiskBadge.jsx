const STYLES = {
  Low: 'bg-[#2A9D8F] text-white',
  Watch: 'bg-[#E9C46A] text-[#0F2A3A] font-semibold',
  High: 'bg-[#E76F51] text-white',
}

function RiskBadge({ score, category, size = 'md', modelVersion = 'phase5-v1' }) {
  const label = category || (score >= 70 ? 'High' : score >= 40 ? 'Watch' : 'Low')
  const padding = size === 'lg' ? 'px-3.5 py-2 gap-2.5' : 'px-2.5 py-1 gap-1.5'
  const scoreClass = size === 'lg' ? 'text-lg font-bold' : 'text-xs font-bold'

  const formattedScore = typeof score === 'number' ? score.toFixed(1) : score

  return (
    <span
      className={`inline-flex items-center rounded-md tabular-nums shadow-xs ${padding} ${STYLES[label] || STYLES.Low}`}
      aria-label={`Risk score ${formattedScore} out of 100, severity band ${label.toLowerCase()}`}
      title={`Model version: ${modelVersion} · Synthetic Score`}
    >
      <span className={`${scoreClass} leading-none`}>{formattedScore}</span>
      <span className="text-[10px] uppercase font-bold tracking-wider opacity-95">{label}</span>
    </span>
  )
}

export default RiskBadge
