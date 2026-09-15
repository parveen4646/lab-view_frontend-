import { useRef, useState } from 'react'
import { AlertTriangle, Check, FileUp, Loader2, ShieldCheck } from 'lucide-react'
import { EmptyState } from '../components/Feedback'
import { LabeledInput, ReviewTestRow } from '../components/ReviewTestRow'
import { extractReport, saveReport } from '../api/client'

const STEP_MESSAGES = [
  'Uploading document…',
  'Reading document…',
  'Extracting values…',
  'Normalizing & categorizing…',
]

export function UploadView({ onSaved }) {
  const [queue, setQueue] = useState([])
  const [queueIndex, setQueueIndex] = useState(0)
  const [stage, setStage] = useState('idle') // idle | processing | review | error | done
  const [stepIndex, setStepIndex] = useState(0)
  const [draft, setDraft] = useState(null)
  const [errorMsg, setErrorMsg] = useState('')
  const [savedCount, setSavedCount] = useState(0)
  const fileInputRef = useRef(null)

  const currentFile = queue[queueIndex] || null

  async function runExtraction(file) {
    setStage('processing')
    setStepIndex(0)
    setErrorMsg('')
    const advance = setInterval(() => {
      setStepIndex((i) => (i < STEP_MESSAGES.length - 1 ? i + 1 : i))
    }, 1600)
    try {
      const result = await extractReport(file)
      clearInterval(advance)
      if (!result.tests || result.tests.length === 0) {
        throw new Error(`No test values were found in "${file.name}". It may not be a lab report, or the scan quality may be too low.`)
      }
      setDraft({
        file_name: result.file_name,
        report_meta: {
          lab_name: result.lab_name,
          report_date: result.report_date,
          patient_name: result.patient_name,
        },
        tests: result.tests.map((t, i) => ({ ...t, _key: `${i}-${t.name}` })),
      })
      setStage('review')
    } catch (e) {
      clearInterval(advance)
      setErrorMsg((e && e.message) || 'Something went wrong while reading this file.')
      setStage('error')
    }
  }

  async function startQueue(fileList) {
    const list = Array.from(fileList || [])
    if (list.length === 0) return
    const pdfs = list.filter((f) => f.type === 'application/pdf')
    if (pdfs.length === 0) {
      setErrorMsg('Please choose PDF files — other formats are not supported yet.')
      setStage('error')
      return
    }
    setQueue(pdfs)
    setQueueIndex(0)
    setSavedCount(0)
    await runExtraction(pdfs[0])
  }

  function updateDraftTest(key, patch) {
    setDraft((prev) => ({
      ...prev,
      tests: prev.tests.map((t) => (t._key === key ? { ...t, ...patch } : t)),
    }))
  }

  function removeDraftTest(key) {
    setDraft((prev) => ({ ...prev, tests: prev.tests.filter((t) => t._key !== key) }))
  }

  function updateDraftMeta(patch) {
    setDraft((prev) => ({ ...prev, report_meta: { ...prev.report_meta, ...patch } }))
  }

  async function advanceQueue() {
    const next = queueIndex + 1
    if (next < queue.length) {
      setQueueIndex(next)
      await runExtraction(queue[next])
    } else {
      setStage('done')
    }
  }

  async function handleSave() {
    const payload = {
      file_name: draft.file_name,
      lab_name: draft.report_meta.lab_name,
      report_date: draft.report_meta.report_date,
      patient_name: draft.report_meta.patient_name,
      tests: draft.tests.map(({ _key, ...t }) => t),
    }
    await saveReport(payload)
    setSavedCount((c) => c + 1)
    setDraft(null)
    if (onSaved) await onSaved()
    await advanceQueue()
  }

  async function handleDiscard() {
    setDraft(null)
    await advanceQueue()
  }

  function reset() {
    setQueue([])
    setQueueIndex(0)
    setStage('idle')
    setDraft(null)
    setErrorMsg('')
    setSavedCount(0)
  }

  function handlePicked(e) {
    startQueue(e.target.files)
    e.target.value = ''
  }

  function handleDrop(e) {
    e.preventDefault()
    if (e.dataTransfer.files) startQueue(e.dataTransfer.files)
  }

  if (stage === 'idle') {
    return (
      <div className="max-w-2xl">
        <h1 className="font-display text-2xl font-semibold text-ink mb-1">Upload reports</h1>
        <p className="text-ink-soft mb-6">
          Add one or more lab report PDFs. Each one is read server-side, its values pulled out, and shown to you to confirm before it joins your dashboard.
        </p>
        <div
          onDragOver={(e) => e.preventDefault()}
          onDrop={handleDrop}
          className="border-2 border-dashed border-line rounded-xl p-10 flex flex-col items-center text-center bg-surface"
        >
          <FileUp size={28} className="text-accent mb-3" />
          <p className="text-ink font-medium mb-1">Drop PDF reports here</p>
          <p className="text-ink-soft text-sm mb-4">or</p>
          <button
            type="button"
            onClick={() => fileInputRef.current && fileInputRef.current.click()}
            className="bg-accent text-white text-sm font-medium px-5 py-2.5 rounded-lg hover:opacity-90 transition-opacity"
          >
            Choose files
          </button>
          <input
            ref={fileInputRef}
            type="file"
            accept="application/pdf"
            multiple
            onChange={handlePicked}
            className="hidden"
          />
          <p className="text-ink-soft text-xs mt-4">PDF only, up to about 30MB each</p>
        </div>
      </div>
    )
  }

  if (stage === 'processing') {
    return (
      <div className="max-w-2xl">
        <h1 className="font-display text-2xl font-semibold text-ink mb-1">
          Reading {currentFile ? currentFile.name : 'document'}…
        </h1>
        {queue.length > 1 && <p className="text-ink-soft text-sm mb-6">File {queueIndex + 1} of {queue.length}</p>}
        <div className="bg-surface border border-line rounded-lg p-6 space-y-3">
          {STEP_MESSAGES.slice(0, stepIndex).map((msg) => (
            <div key={msg} className="flex items-center gap-3 text-sm text-ink-soft">
              <Check size={16} className="text-signal-steady flex-shrink-0" />
              <span>{msg}</span>
            </div>
          ))}
          <div className="flex items-center gap-3 text-sm text-ink">
            <Loader2 size={16} className="text-accent animate-spin flex-shrink-0" />
            <span>{STEP_MESSAGES[stepIndex]}</span>
          </div>
        </div>
      </div>
    )
  }

  if (stage === 'error') {
    return (
      <div className="max-w-2xl">
        <h1 className="font-display text-2xl font-semibold text-ink mb-4">Couldn't read that file</h1>
        <div className="bg-signal-alert-soft border border-line rounded-lg p-5 flex items-start gap-3 mb-6">
          <AlertTriangle size={18} className="text-signal-alert flex-shrink-0 mt-0.5" />
          <p className="text-sm text-ink">{errorMsg}</p>
        </div>
        <div className="flex gap-3">
          {queueIndex + 1 < queue.length && (
            <button type="button" onClick={advanceQueue} className="bg-accent text-white text-sm font-medium px-5 py-2.5 rounded-lg">
              Skip to next file
            </button>
          )}
          <button type="button" onClick={reset} className="border border-line text-ink text-sm font-medium px-5 py-2.5 rounded-lg">
            Start over
          </button>
        </div>
      </div>
    )
  }

  if (stage === 'done') {
    return (
      <EmptyState
        icon={ShieldCheck}
        title={`Saved ${savedCount} report${savedCount === 1 ? '' : 's'}`}
        description="They're already reflected on your dashboard and trends."
        actionLabel="Upload more"
        onAction={reset}
      />
    )
  }

  // stage === 'review'
  return (
    <div className="max-w-3xl">
      <div className="flex items-center justify-between mb-1">
        <h1 className="font-display text-2xl font-semibold text-ink">Check what we found</h1>
        {queue.length > 1 && <span className="text-ink-soft text-sm">File {queueIndex + 1} of {queue.length}</span>}
      </div>
      <p className="text-ink-soft mb-6">
        Fix anything that looks off, remove rows that shouldn't be there, then save. Rows marked "Please verify" were harder to read clearly.
      </p>

      <div className="bg-surface border border-line rounded-lg p-5 mb-5 grid sm:grid-cols-3 gap-4">
        <LabeledInput
          label="Lab name"
          value={draft.report_meta.lab_name || ''}
          onChange={(v) => updateDraftMeta({ lab_name: v })}
        />
        <LabeledInput
          label="Report date"
          type="date"
          value={draft.report_meta.report_date || ''}
          onChange={(v) => updateDraftMeta({ report_date: v })}
        />
        <LabeledInput
          label="Patient name"
          value={draft.report_meta.patient_name || ''}
          onChange={(v) => updateDraftMeta({ patient_name: v })}
        />
      </div>

      <div className="space-y-2 mb-6">
        {draft.tests.map((t) => (
          <ReviewTestRow
            key={t._key}
            test={t}
            onChange={(patch) => updateDraftTest(t._key, patch)}
            onRemove={() => removeDraftTest(t._key)}
          />
        ))}
      </div>

      <div className="flex gap-3">
        <button type="button" onClick={handleSave} className="bg-accent text-white text-sm font-medium px-5 py-2.5 rounded-lg hover:opacity-90 transition-opacity">
          Save to dashboard
        </button>
        <button type="button" onClick={handleDiscard} className="border border-line text-ink text-sm font-medium px-5 py-2.5 rounded-lg">
          Discard this file
        </button>
      </div>
    </div>
  )
}
