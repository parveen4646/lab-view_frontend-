import { Fragment } from 'react'
import { formatDate, getReportDate, isFlagged } from '../utils/format'

export function TimelineRibbon({ reports, onSelectReport }) {
  if (reports.length === 0) return null
  const sorted = [...reports].sort((a, b) => new Date(getReportDate(a)) - new Date(getReportDate(b)))
  return (
    <div className="w-full overflow-x-auto hd-scroll pb-2">
      <div className="flex items-center min-w-max">
        {sorted.map((r, i) => {
          const flagged = (r.tests || []).some(isFlagged)
          const isLast = i === sorted.length - 1
          return (
            <Fragment key={r.id}>
              <button
                type="button"
                onClick={() => onSelectReport && onSelectReport(r.id)}
                className="flex flex-col items-center gap-1 px-3"
              >
                <span
                  className={`block rounded-full ${isLast ? 'w-3 h-3' : 'w-2 h-2'} ${
                    flagged ? 'bg-signal-alert' : 'bg-signal-steady'
                  }`}
                />
                <span className="text-xs text-ink-soft font-mono whitespace-nowrap">
                  {formatDate(getReportDate(r))}
                </span>
              </button>
              {!isLast && <span className="h-px flex-1 min-w-6 bg-line" />}
            </Fragment>
          )
        })}
      </div>
    </div>
  )
}
