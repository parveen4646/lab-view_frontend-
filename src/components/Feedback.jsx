import { AlertTriangle, Loader2, TrendingUp, TrendingDown, Minus } from 'lucide-react'

export function FlagBadge({ flag }) {
  if (!flag || flag === 'normal') {
    return (
      <span className="inline-flex items-center gap-1 text-xs font-medium px-2 py-0.5 rounded-full bg-signal-steady-soft text-signal-steady">
        In range
      </span>
    )
  }
  const label = flag === 'high' ? 'High' : flag === 'low' ? 'Low' : 'Abnormal'
  return (
    <span className="inline-flex items-center gap-1 text-xs font-medium px-2 py-0.5 rounded-full bg-signal-alert-soft text-signal-alert">
      <AlertTriangle size={12} /> {label}
    </span>
  )
}

export function TrendIcon({ direction, size = 14 }) {
  if (direction === 'up') return <TrendingUp size={size} />
  if (direction === 'down') return <TrendingDown size={size} />
  return <Minus size={size} />
}

export function StatChip({ label, value, icon: Icon }) {
  return (
    <div className="flex items-center gap-3 bg-surface border border-line rounded-lg px-4 py-3">
      {Icon && <Icon size={18} className="text-accent" />}
      <div>
        <div className="text-lg font-semibold font-mono text-ink leading-none">{value}</div>
        <div className="text-xs text-ink-soft mt-1">{label}</div>
      </div>
    </div>
  )
}

export function EmptyState({ icon: Icon, title, description, actionLabel, onAction }) {
  return (
    <div className="flex flex-col items-center text-center py-16 px-4 max-w-md mx-auto">
      {Icon && (
        <div className="w-14 h-14 rounded-full bg-accent-soft flex items-center justify-center mb-4">
          <Icon size={24} className="text-accent" />
        </div>
      )}
      <h2 className="font-display text-lg font-semibold text-ink mb-2">{title}</h2>
      <p className="text-ink-soft text-sm mb-6">{description}</p>
      {actionLabel && onAction && (
        <button
          type="button"
          onClick={onAction}
          className="bg-accent text-white text-sm font-medium px-5 py-2.5 rounded-lg hover:opacity-90 transition-opacity"
        >
          {actionLabel}
        </button>
      )}
    </div>
  )
}

export function LoadingBlock({ label }) {
  return (
    <div className="flex flex-col items-center justify-center py-20 gap-3">
      <Loader2 size={24} className="text-accent animate-spin" />
      <p className="text-ink-soft text-sm">{label}</p>
    </div>
  )
}

export function ErrorBanner({ message }) {
  return (
    <div className="bg-signal-alert-soft border border-line rounded-lg p-4 flex items-start gap-3">
      <AlertTriangle size={16} className="text-signal-alert flex-shrink-0 mt-0.5" />
      <p className="text-sm text-ink">{message}</p>
    </div>
  )
}
