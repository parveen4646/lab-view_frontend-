import { useState } from 'react'
import { Sidebar, MobileTopBar, BottomNav } from './components/Nav'
import { ErrorBanner } from './components/Feedback'
import { DashboardView } from './views/DashboardView'
import { UploadView } from './views/UploadView'
import { TrendsView } from './views/TrendsView'
import { LibraryView } from './views/LibraryView'
import { AskAIView } from './views/AskAIView'
import { SettingsView } from './views/SettingsView'
import { useReports } from './hooks/useReports'

export default function App() {
  const [activeView, setActiveView] = useState('dashboard')
  const { reports, loading, error, insight, insightLoading, refresh, deleteReport, clearAll } = useReports()

  return (
    <div className="min-h-screen bg-paper text-ink flex flex-col md:flex-row">
      <Sidebar activeView={activeView} onNavigate={setActiveView} />
      <MobileTopBar />

      <main className="flex-1 overflow-y-auto hd-scroll p-4 md:p-8 pb-24 md:pb-8">
        {error && (
          <div className="max-w-2xl mb-6">
            <ErrorBanner message={`${error} Is the backend running?`} />
          </div>
        )}

        {activeView === 'dashboard' && (
          <DashboardView
            reports={reports}
            loading={loading}
            insight={insight}
            insightLoading={insightLoading}
            onNavigate={setActiveView}
          />
        )}
        {activeView === 'trends' && <TrendsView reports={reports} />}
        {activeView === 'upload' && <UploadView onSaved={refresh} />}
        {activeView === 'library' && <LibraryView reports={reports} onDelete={deleteReport} />}
        {activeView === 'ask' && <AskAIView reports={reports} />}
        {activeView === 'settings' && <SettingsView reports={reports} onClearAll={clearAll} />}
      </main>

      <BottomNav activeView={activeView} onNavigate={setActiveView} />
    </div>
  )
}
