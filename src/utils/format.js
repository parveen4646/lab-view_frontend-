export function formatDate(input) {
  if (!input) return 'Undated'
  const d = new Date(input)
  if (Number.isNaN(d.getTime())) return String(input)
  return d.toLocaleDateString(undefined, { year: 'numeric', month: 'short', day: 'numeric' })
}

export function getReportDate(r) {
  return r.report_date || r.uploaded_at
}

export function getLabName(r) {
  return r.lab_name || null
}

export function isFlagged(t) {
  return t.flag === 'high' || t.flag === 'low' || t.flag === 'abnormal'
}

export function parseNumeric(valueStr) {
  if (typeof valueStr === 'number') return valueStr
  if (typeof valueStr !== 'string') return null
  const match = valueStr.replace(/,/g, '').match(/-?\d+(\.\d+)?/)
  return match ? parseFloat(match[0]) : null
}

export function parseRangeBounds(rangeStr) {
  if (!rangeStr || typeof rangeStr !== 'string') return null
  const s = rangeStr.trim()
  let m = s.match(/(-?\d+(?:\.\d+)?)\s*(?:-|to|–)\s*(-?\d+(?:\.\d+)?)/i)
  if (m) return { low: parseFloat(m[1]), high: parseFloat(m[2]) }
  m = s.match(/^(?:up to|<=?|below)\s*(-?\d+(?:\.\d+)?)/i)
  if (m) return { low: -Infinity, high: parseFloat(m[1]) }
  m = s.match(/^(?:>=?|above|over)\s*(-?\d+(?:\.\d+)?)/i)
  if (m) return { low: parseFloat(m[1]), high: Infinity }
  return null
}
