import { useState } from 'react'
import { Download, Info, Trash2 } from 'lucide-react'

export function SettingsView({ reports, onClearAll }) {
  const [confirming, setConfirming] = useState(false)
  const [clearing, setClearing] = useState(false)

  function handleExport() {
    const blob = new Blob([JSON.stringify({ exportedAt: new Date().toISOString(), reports }, null, 2)], { type: 'application/json' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `health-data-export-${new Date().toISOString().slice(0, 10)}.json`
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    URL.revokeObjectURL(url)
  }

  async function handleClear() {
    setClearing(true)
    try {
      await onClearAll()
    } finally {
      setClearing(false)
      setConfirming(false)
    }
  }

  return (
    <div className="max-w-2xl space-y-8">
      <div>
        <h1 className="font-display text-2xl font-semibold text-ink mb-1">Settings</h1>
        <p className="text-ink-soft">Manage your data and understand how this works.</p>
      </div>

      <div className="bg-surface border border-line rounded-lg p-5 space-y-4">
        <h2 className="text-sm font-semibold text-ink">Your data</h2>
        <div className="flex items-center justify-between">
          <div>
            <div className="text-sm text-ink">Export as JSON</div>
            <div className="text-xs text-ink-soft">Download everything extracted so far.</div>
          </div>
          <button
            type="button"
            onClick={handleExport}
            disabled={reports.length === 0}
            className="flex items-center gap-2 border border-line text-ink text-sm font-medium px-4 py-2 rounded-lg disabled:opacity-40"
          >
            <Download size={15} /> Export
          </button>
        </div>
        <div className="flex items-center justify-between pt-4 border-t border-line">
          <div>
            <div className="text-sm text-ink">Clear all data</div>
            <div className="text-xs text-ink-soft">Removes every report from this dashboard. Cannot be undone.</div>
          </div>
          {confirming ? (
            <div className="flex items-center gap-2">
              <button type="button" onClick={handleClear} disabled={clearing} className="text-sm font-medium text-signal-alert disabled:opacity-50">
                {clearing ? 'Clearing…' : 'Confirm'}
              </button>
              <button type="button" onClick={() => setConfirming(false)} className="text-sm text-ink-soft">Cancel</button>
            </div>
          ) : (
            <button
              type="button"
              onClick={() => setConfirming(true)}
              disabled={reports.length === 0}
              className="flex items-center gap-2 border border-line text-signal-alert text-sm font-medium px-4 py-2 rounded-lg disabled:opacity-40"
            >
              <Trash2 size={15} /> Clear
            </button>
          )}
        </div>
      </div>

      <div className="bg-surface border border-line rounded-lg p-5 space-y-3">
        <h2 className="text-sm font-semibold text-ink">How this works</h2>
        <p className="text-sm text-ink-soft leading-relaxed">
          Each PDF is sent to the backend, where Claude reads it directly — nothing is typed in manually. Values are pulled out in small batches, matched to a category, and shown to you to confirm before anything is saved to the database. Trends and the dashboard summary are computed from what you've confirmed; the "Ask" tab only answers from your own saved data.
        </p>
        <p className="text-sm text-ink-soft leading-relaxed">
          Your data lives in this app's own database — nowhere else — and your Anthropic API key never leaves the backend server.
        </p>
      </div>

      <div className="flex items-start gap-3 bg-signal-watch-soft rounded-lg p-4">
        <Info size={16} className="text-signal-watch flex-shrink-0 mt-0.5" />
        <p className="text-xs text-ink-soft leading-relaxed">
          This is a personal tracking tool, not a medical device. It doesn't diagnose anything, and AI extraction can make mistakes — always check figures against your original report, and talk to a doctor about anything that concerns you.
        </p>
      </div>
    </div>
  )
}
