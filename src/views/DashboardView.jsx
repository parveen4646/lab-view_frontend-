import { AlertTriangle, FileText, FlaskConical, Sparkles, TrendingUp } from 'lucide-react'
import { EmptyState, FlagBadge, LoadingBlock, StatChip, TrendIcon } from '../components/Feedback'
import { TimelineRibbon } from '../components/TimelineRibbon'
import { categoryMeta } from '../utils/categories'

export function DashboardView({ reports, loading, insight, insightLoading, onNavigate }) {
  if (loading) return <LoadingBlock label="Loading your dashboard…" />

  if (reports.length === 0) {
    return (
      <EmptyState
        icon={FlaskConical}
        title="No reports yet"
        description="Upload your first lab report and this dashboard will start filling in — values, categories, and trends as more come in."
        actionLabel="Upload a report"
        onAction={() => onNavigate('upload')}
      />
    )
  }

  const totalTests = reports.reduce((sum, r) => sum + (r.tests || []).length, 0)
  const flaggedCount = insight ? insight.currentFlags.length : 0
  const trendingCount = insight ? insight.trends.length : 0

  return (
    <div className="space-y-8 max-w-4xl">
      <div>
        <h1 className="font-display text-2xl font-semibold text-ink">Dashboard</h1>
        <p className="text-ink-soft mt-1">
          Across {reports.length} report{reports.length === 1 ? '' : 's'} and {totalTests} tracked values.
        </p>
      </div>

      <TimelineRibbon reports={reports} onSelectReport={() => onNavigate('library')} />

      <div className="bg-surface border border-line rounded-lg p-5">
        <div className="flex items-start gap-3">
          <Sparkles size={18} className="text-accent mt-0.5" />
          <div className="flex-1">
            <div className="text-sm font-medium text-ink mb-1">Your snapshot</div>
            {insightLoading && !(insight && insight.summary) ? (
              <p className="text-ink-soft text-sm">Reading your history…</p>
            ) : (
              <p className="text-ink-soft text-sm leading-relaxed">
                {insight && insight.summary ? insight.summary : 'Add another report to start seeing trends here.'}
              </p>
            )}
          </div>
        </div>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <StatChip label="Reports" value={reports.length} icon={FileText} />
        <StatChip label="Values tracked" value={totalTests} icon={FlaskConical} />
        <StatChip label="Flagged now" value={flaggedCount} icon={AlertTriangle} />
        <StatChip label="Trending" value={trendingCount} icon={TrendingUp} />
      </div>

      {flaggedCount > 0 && (
        <div>
          <h2 className="font-display text-sm font-semibold text-ink mb-3">Worth a look in your latest report</h2>
          <div className="space-y-2">
            {insight.currentFlags.map((f) => (
              <div key={f.id || f.name} className="flex items-center justify-between bg-surface border border-line rounded-lg px-4 py-3">
                <div>
                  <div className="text-sm font-medium text-ink">{f.name}</div>
                  <div className="text-xs text-ink-soft">{categoryMeta(f.category).label}</div>
                </div>
                <div className="flex items-center gap-3">
                  <span className="font-mono text-sm text-ink">{f.value}{f.unit ? ` ${f.unit}` : ''}</span>
                  <FlagBadge flag={f.flag} />
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {trendingCount > 0 && (
        <div>
          <h2 className="font-display text-sm font-semibold text-ink mb-3">Trends forming</h2>
          <div className="grid sm:grid-cols-2 gap-3">
            {insight.trends.slice(0, 6).map((t) => (
              <button
                type="button"
                key={t.name}
                onClick={() => onNavigate('trends')}
                className="flex items-center justify-between bg-surface border border-line rounded-lg px-4 py-3 text-left hover:border-accent transition-colors"
              >
                <div>
                  <div className="text-sm font-medium text-ink">{t.name}</div>
                  <div className="text-xs text-ink-soft">{t.points} readings</div>
                </div>
                <div className={t.direction === 'up' ? 'text-signal-watch' : t.direction === 'down' ? 'text-signal-steady' : 'text-ink-soft'}>
                  <TrendIcon direction={t.direction} />
                </div>
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
