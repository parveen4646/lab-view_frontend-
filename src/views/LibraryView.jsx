import { useState } from 'react'
import { Building2, ChevronDown, FileText, Trash2 } from 'lucide-react'
import { EmptyState, FlagBadge } from '../components/Feedback'
import { formatDate, getLabName, getReportDate, isFlagged } from '../utils/format'

export function LibraryView({ reports, onDelete }) {
  const [expandedId, setExpandedId] = useState(null)
  const [confirmId, setConfirmId] = useState(null)
  const [deletingId, setDeletingId] = useState(null)

  if (reports.length === 0) {
    return (
      <EmptyState
        icon={FileText}
        title="No reports saved"
        description="Uploaded reports will appear here, newest first."
      />
    )
  }

  const sorted = [...reports].sort((a, b) => new Date(getReportDate(b)) - new Date(getReportDate(a)))

  async function handleDelete(id) {
    setDeletingId(id)
    try {
      await onDelete(id)
    } finally {
      setDeletingId(null)
      setConfirmId(null)
    }
  }

  return (
    <div className="max-w-3xl">
      <h1 className="font-display text-2xl font-semibold text-ink mb-1">Your reports</h1>
      <p className="text-ink-soft mb-6">{reports.length} report{reports.length === 1 ? '' : 's'} on file.</p>
      <div className="space-y-3">
        {sorted.map((r) => {
          const isOpen = expandedId === r.id
          const flaggedCount = (r.tests || []).filter(isFlagged).length
          return (
            <div key={r.id} className="border border-line rounded-lg bg-surface overflow-hidden">
              <button
                type="button"
                onClick={() => setExpandedId(isOpen ? null : r.id)}
                className="w-full flex items-center justify-between p-4 text-left"
              >
                <div className="flex items-center gap-3">
                  <Building2 size={18} className="text-accent flex-shrink-0" />
                  <div>
                    <div className="text-sm font-medium text-ink">{getLabName(r) || r.file_name || 'Lab report'}</div>
                    <div className="text-xs text-ink-soft">
                      {formatDate(getReportDate(r))} · {(r.tests || []).length} values
                      {flaggedCount > 0 ? ` · ${flaggedCount} flagged` : ''}
                    </div>
                  </div>
                </div>
                <ChevronDown size={18} className={`text-ink-soft transition-transform ${isOpen ? 'rotate-180' : ''}`} />
              </button>
              {isOpen && (
                <div className="border-t border-line p-4 space-y-2">
                  {(r.tests || []).map((t) => (
                    <div key={t.id} className="flex items-center justify-between text-sm py-1.5">
                      <span className="text-ink">{t.name}</span>
                      <div className="flex items-center gap-3">
                        <span className="font-mono text-ink-soft">{t.value}{t.unit ? ` ${t.unit}` : ''}</span>
                        <FlagBadge flag={t.flag} />
                      </div>
                    </div>
                  ))}
                  <div className="pt-3 flex justify-end">
                    {confirmId === r.id ? (
                      <div className="flex items-center gap-2">
                        <span className="text-xs text-ink-soft">Remove this report?</span>
                        <button
                          type="button"
                          onClick={() => handleDelete(r.id)}
                          disabled={deletingId === r.id}
                          className="text-xs font-medium text-signal-alert disabled:opacity-50"
                        >
                          {deletingId === r.id ? 'Removing…' : 'Yes, remove'}
                        </button>
                        <button type="button" onClick={() => setConfirmId(null)} className="text-xs text-ink-soft">Cancel</button>
                      </div>
                    ) : (
                      <button type="button" onClick={() => setConfirmId(r.id)} className="flex items-center gap-1 text-xs text-ink-soft">
                        <Trash2 size={13} /> Remove
                      </button>
                    )}
                  </div>
                </div>
              )}
            </div>
          )
        })}
      </div>
    </div>
  )
}
