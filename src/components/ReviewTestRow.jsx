import { Info, X } from 'lucide-react'
import { CATEGORIES } from '../utils/categories'
import { parseNumeric } from '../utils/format'

export function LabeledInput({ label, value, onChange, type = 'text' }) {
  return (
    <label className="block">
      <span className="text-xs text-ink-soft">{label}</span>
      <input
        type={type}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="hd-input mt-1 w-full border border-line rounded-md px-3 py-2 text-sm text-ink bg-paper"
      />
    </label>
  )
}

export function ReviewTestRow({ test, onChange, onRemove }) {
  return (
    <div className={`border rounded-lg p-3 bg-surface ${test.confidence === 'low' ? 'border-signal-watch' : 'border-line'}`}>
      <div className="flex items-start justify-between gap-3">
        <div className="flex-1 grid grid-cols-2 sm:grid-cols-4 gap-2">
          <input
            value={test.name}
            onChange={(e) => onChange({ name: e.target.value })}
            className="hd-input col-span-2 sm:col-span-1 text-sm font-medium text-ink border-b border-line"
          />
          <input
            value={test.value}
            onChange={(e) => onChange({ value: e.target.value, numeric_value: parseNumeric(e.target.value) })}
            className="hd-input text-sm font-mono text-ink border-b border-line"
          />
          <input
            value={test.unit || ''}
            onChange={(e) => onChange({ unit: e.target.value })}
            placeholder="unit"
            className="hd-input text-sm text-ink-soft border-b border-line"
          />
          <input
            value={test.range || ''}
            onChange={(e) => onChange({ range: e.target.value })}
            placeholder="range"
            className="hd-input text-sm text-ink-soft border-b border-line"
          />
        </div>
        <button type="button" onClick={onRemove} className="text-ink-soft flex-shrink-0">
          <X size={16} />
        </button>
      </div>
      <div className="flex items-center gap-3 mt-2 flex-wrap">
        <select
          value={test.category}
          onChange={(e) => onChange({ category: e.target.value })}
          className="hd-input text-xs border border-line rounded px-2 py-1 text-ink-soft"
        >
          {CATEGORIES.map((c) => (
            <option key={c.id} value={c.id}>{c.label}</option>
          ))}
        </select>
        <select
          value={test.flag || ''}
          onChange={(e) => onChange({ flag: e.target.value || null })}
          className="hd-input text-xs border border-line rounded px-2 py-1 text-ink-soft"
        >
          <option value="">No flag</option>
          <option value="normal">Normal</option>
          <option value="high">High</option>
          <option value="low">Low</option>
          <option value="abnormal">Abnormal</option>
        </select>
        {test.confidence === 'low' && (
          <span className="inline-flex items-center gap-1 text-xs text-signal-watch">
            <Info size={12} /> Please verify
          </span>
        )}
      </div>
    </div>
  )
}
