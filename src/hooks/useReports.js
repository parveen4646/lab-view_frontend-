import { useCallback, useEffect, useState } from 'react'
import { clearAllReports, deleteReport as apiDeleteReport, getInsight, listReports } from '../api/client'

export function useReports() {
  const [reports, setReports] = useState([])
  const [loading, setLoading] = useState(true)
  const [insight, setInsight] = useState(null)
  const [insightLoading, setInsightLoading] = useState(false)
  const [error, setError] = useState(null)

  const refresh = useCallback(async () => {
    setLoading(true)
    setError(null)
    try {
      const data = await listReports()
      setReports(data)
    } catch (e) {
      setError(e.message || 'Could not load your reports.')
    } finally {
      setLoading(false)
    }
  }, [])

  const refreshInsight = useCallback(async () => {
    setInsightLoading(true)
    try {
      const data = await getInsight()
      setInsight(data)
    } catch (e) {
      setInsight(null)
    } finally {
      setInsightLoading(false)
    }
  }, [])

  useEffect(() => {
    refresh()
  }, [refresh])

  useEffect(() => {
    if (!loading) refreshInsight()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [loading, reports.length])

  const deleteReport = useCallback(async (id) => {
    await apiDeleteReport(id)
    await refresh()
  }, [refresh])

  const clearAll = useCallback(async () => {
    await clearAllReports()
    await refresh()
  }, [refresh])

  return { reports, loading, error, insight, insightLoading, refresh, deleteReport, clearAll }
}
