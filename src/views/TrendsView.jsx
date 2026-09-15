import { useMemo, useState } from 'react'
import { TrendingUp } from 'lucide-react'
import { EmptyState } from '../components/Feedback'
import { CategoryPill, TrendChartCard } from '../components/TrendChartCard'
import { CATEGORIES } from '../utils/categories'
import { formatDate, getReportDate } from '../utils/format'

export function TrendsView({ reports }) {
  const [activeCategory, setActiveCategory] = useState('all')

  const series = useMemo(() => {
    const byName = {}
    reports.forEach((r) => {
      const date = getReportDate(r)
      ;(r.tests || []).forEach((t) => {
        if (t.numeric_value === null || t.numeric_value === undefined) return
        const key = t.name
        if (!byName[key]) byName[key] = { name: t.name, category: t.category, unit: t.unit, points: [] }
        byName[key].points.push({ date, value: t.numeric_value, flag: t.flag, range: t.range })
      })
    })
    return Object.values(byName)
      .map((s) => ({ ...s, points: [...s.points].sort((a, b) => new Date(a.date) - new Date(b.date)) }))
      .sort((a, b) => b.points.length - a.points.length)
  }, [reports])

  const multiPoint = series.filter((s) => s.points.length >= 2)
  const singlePoint = series.filter((s) => s.points.length === 1)

  const categoriesPresent = useMemo(() => {
    const ids = new Set(series.map((s) => s.category))
    return CATEGORIES.filter((c) => ids.has(c.id))
  }, [series])

  const filteredMulti = activeCategory === 'all' ? multiPoint : multiPoint.filter((s) => s.category === activeCategory)
  const filteredSingle = activeCategory === 'all' ? singlePoint : singlePoint.filter((s) => s.category === activeCategory)

  if (reports.length === 0) {
    return (
      <EmptyState
        icon={TrendingUp}
        title="No trends yet"
        description="Trends appear once the same test shows up in two or more reports."
      />
    )
  }

  return (
    <div className="max-w-5xl">
      <h1 className="font-display text-2xl font-semibold text-ink mb-1">Trends</h1>
      <p className="text-ink-soft mb-5">Values tracked over time, grouped by category.</p>

      <div className="flex gap-2 overflow-x-auto hd-scroll pb-2 mb-6">
        <CategoryPill active={activeCategory === 'all'} label="All" onClick={() => setActiveCategory('all')} />
        {categoriesPresent.map((c) => (
          <CategoryPill key={c.id} active={activeCategory === c.id} label={c.short} onClick={() => setActiveCategory(c.id)} />
        ))}
      </div>

      {filteredMulti.length > 0 && (
        <div className="grid md:grid-cols-2 gap-5 mb-8">
          {filteredMulti.map((s) => <TrendChartCard key={s.name} series={s} />)}
        </div>
      )}

      {filteredSingle.length > 0 && (
        <div>
          <h2 className="font-display text-sm font-semibold text-ink mb-3">Single readings so far</h2>
          <div className="grid sm:grid-cols-2 md:grid-cols-3 gap-3">
            {filteredSingle.map((s) => (
              <div key={s.name} className="bg-surface border border-line rounded-lg px-4 py-3">
                <div className="text-sm font-medium text-ink">{s.name}</div>
                <div className="font-mono text-lg text-ink mt-1">{s.points[0].value}{s.unit ? ` ${s.unit}` : ''}</div>
                <div className="text-xs text-ink-soft mt-1">{formatDate(s.points[0].date)} · one more report will start a trend line</div>
              </div>
            ))}
          </div>
        </div>
      )}

      {filteredMulti.length === 0 && filteredSingle.length === 0 && (
        <p className="text-ink-soft text-sm">No values in this category yet.</p>
      )}
    </div>
  )
}
