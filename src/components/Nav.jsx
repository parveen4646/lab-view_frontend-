import { Home, TrendingUp, Upload, FileText, MessageCircle, Settings, HeartPulse } from 'lucide-react'

export const NAV_ITEMS = [
  { id: 'dashboard', label: 'Dashboard', icon: Home },
  { id: 'trends', label: 'Trends', icon: TrendingUp },
  { id: 'upload', label: 'Upload', icon: Upload },
  { id: 'library', label: 'Reports', icon: FileText },
  { id: 'ask', label: 'Ask AI', icon: MessageCircle },
  { id: 'settings', label: 'Settings', icon: Settings },
]

export function Sidebar({ activeView, onNavigate }) {
  return (
    <nav className="hidden md:flex md:flex-col md:w-56 border-r border-line p-4 flex-shrink-0">
      <div className="flex items-center gap-2 px-2 mb-8">
        <HeartPulse size={20} className="text-accent" />
        <span className="font-display font-semibold text-ink">Vitals</span>
      </div>
      <div className="flex flex-col gap-1">
        {NAV_ITEMS.map((item) => {
          const Icon = item.icon
          const active = activeView === item.id
          return (
            <button
              type="button"
              key={item.id}
              onClick={() => onNavigate(item.id)}
              className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors ${
                active ? 'bg-accent-soft text-accent' : 'text-ink-soft hover:bg-surface'
              }`}
            >
              <Icon size={17} />
              {item.label}
            </button>
          )
        })}
      </div>
    </nav>
  )
}

export function MobileTopBar() {
  return (
    <div className="flex md:hidden items-center gap-2 px-4 py-3 border-b border-line bg-surface">
      <HeartPulse size={18} className="text-accent" />
      <span className="font-display font-semibold text-ink">Vitals</span>
    </div>
  )
}

export function BottomNav({ activeView, onNavigate }) {
  return (
    <nav className="flex md:hidden fixed bottom-0 left-0 right-0 border-t border-line bg-surface justify-around py-2">
      {NAV_ITEMS.map((item) => {
        const Icon = item.icon
        const active = activeView === item.id
        return (
          <button
            type="button"
            key={item.id}
            onClick={() => onNavigate(item.id)}
            className={`flex flex-col items-center gap-0.5 px-2 py-1 rounded-lg ${active ? 'text-accent' : 'text-ink-soft'}`}
          >
            <Icon size={19} />
            <span className="text-xs">{item.label}</span>
          </button>
        )
      })}
    </nav>
  )
}
