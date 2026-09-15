import {
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, ReferenceArea,
} from 'recharts'
import { categoryMeta } from '../utils/categories'
import { formatDate, isFlagged, parseRangeBounds } from '../utils/format'

const COLORS = {
  ink: '#1A2420',
  inkSoft: '#5B665E',
  surface: '#FFFFFF',
  line: '#E3E1D9',
  accent: '#35506B',
  signalSteadySoft: '#E3ECE5',
  signalAlert: '#A63D2F',
}

export function TrendChartCard({ series }) {
  const bounds = parseRangeBounds(series.points[series.points.length - 1].range)
  const chartData = series.points.map((p) => ({
    date: formatDate(p.date),
    value: p.value,
    flagged: isFlagged(p),
  }))

  return (
    <div className="bg-surface border border-line rounded-lg p-4">
      <div className="flex items-center justify-between mb-2">
        <div>
          <div className="text-sm font-medium text-ink">{series.name}</div>
          <div className="text-xs text-ink-soft">
            {categoryMeta(series.category).label}{series.unit ? ` · ${series.unit}` : ''}
          </div>
        </div>
      </div>
      <div style={{ width: '100%', height: 160 }}>
        <ResponsiveContainer>
          <LineChart data={chartData} margin={{ top: 8, right: 8, bottom: 0, left: -20 }}>
            <CartesianGrid strokeDasharray="3 3" stroke={COLORS.line} vertical={false} />
            {bounds && Number.isFinite(bounds.low) && Number.isFinite(bounds.high) && (
              <ReferenceArea y1={bounds.low} y2={bounds.high} fill={COLORS.signalSteadySoft} fillOpacity={0.6} strokeWidth={0} />
            )}
            <XAxis dataKey="date" tick={{ fontSize: 11, fill: COLORS.inkSoft }} axisLine={{ stroke: COLORS.line }} tickLine={false} />
            <YAxis tick={{ fontSize: 11, fill: COLORS.inkSoft }} axisLine={false} tickLine={false} width={38} />
            <Tooltip contentStyle={{ background: COLORS.surface, border: `1px solid ${COLORS.line}`, borderRadius: 8, fontSize: 12 }} />
            <Line
              type="monotone"
              dataKey="value"
              stroke={COLORS.accent}
              strokeWidth={2}
              dot={(props) => {
                const { cx, cy, payload, index } = props
                return (
                  <circle
                    key={`dot-${index}`}
                    cx={cx}
                    cy={cy}
                    r={4}
                    fill={payload.flagged ? COLORS.signalAlert : COLORS.accent}
                    stroke={COLORS.surface}
                    strokeWidth={1.5}
                  />
                )
              }}
            />
          </LineChart>
        </ResponsiveContainer>
      </div>
      <div className="text-xs text-ink-soft mt-1">Shaded band = normal range from most recent report</div>
    </div>
  )
}

export function CategoryPill({ active, label, onClick }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`text-xs font-medium px-3 py-1.5 rounded-full border whitespace-nowrap transition-colors ${
        active ? 'bg-accent text-white border-accent' : 'border-line text-ink-soft'
      }`}
    >
      {label}
    </button>
  )
}
