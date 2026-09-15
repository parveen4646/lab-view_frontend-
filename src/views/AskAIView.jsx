import { useEffect, useRef, useState } from 'react'
import { Loader2, MessageCircle, Send } from 'lucide-react'
import { EmptyState } from '../components/Feedback'
import { askQuestion } from '../api/client'

const SUGGESTIONS = ['How am I doing overall?', 'What is currently out of range?', 'What has been trending upward?']

export function AskAIView({ reports }) {
  const [messages, setMessages] = useState([])
  const [input, setInput] = useState('')
  const [busy, setBusy] = useState(false)
  const scrollRef = useRef(null)

  useEffect(() => {
    if (scrollRef.current) scrollRef.current.scrollTop = scrollRef.current.scrollHeight
  }, [messages, busy])

  async function handleSend() {
    const query = input.trim()
    if (!query || busy) return
    setInput('')
    setMessages((prev) => [...prev, { role: 'user', text: query }])
    setBusy(true)
    try {
      const { answer, retrieved_labels } = await askQuestion(query)
      setMessages((prev) => [...prev, { role: 'assistant', text: answer, retrievedLabels: retrieved_labels }])
    } catch (e) {
      setMessages((prev) => [...prev, { role: 'assistant', text: "I couldn't get an answer just now — please try again.", error: true }])
    } finally {
      setBusy(false)
    }
  }

  if (reports.length === 0) {
    return (
      <EmptyState
        icon={MessageCircle}
        title="Nothing to ask yet"
        description="Upload a report first, then come back here to ask questions about your own results."
      />
    )
  }

  return (
    <div className="max-w-2xl flex flex-col" style={{ height: 'calc(100vh - 160px)' }}>
      <h1 className="font-display text-2xl font-semibold text-ink mb-1">Ask about your results</h1>
      <p className="text-ink-soft mb-4">Answers are grounded only in the reports you've uploaded — not general medical advice.</p>

      <div ref={scrollRef} className="flex-1 overflow-y-auto hd-scroll space-y-4 mb-4 pr-1">
        {messages.length === 0 && (
          <div className="flex flex-wrap gap-2">
            {SUGGESTIONS.map((s) => (
              <button
                type="button"
                key={s}
                onClick={() => setInput(s)}
                className="text-xs border border-line rounded-full px-3 py-1.5 text-ink-soft"
              >
                {s}
              </button>
            ))}
          </div>
        )}
        {messages.map((m, i) => (
          <div key={i} className={`flex ${m.role === 'user' ? 'justify-end' : 'justify-start'}`}>
            <div className={`max-w-sm rounded-lg px-4 py-2.5 text-sm ${m.role === 'user' ? 'bg-accent text-white' : 'bg-surface border border-line text-ink'}`}>
              {m.role === 'assistant' && m.retrievedLabels && m.retrievedLabels.length > 0 && (
                <div className="flex flex-wrap gap-1 mb-2">
                  {m.retrievedLabels.map((l, j) => (
                    <span key={j} className="text-xs bg-accent-soft text-accent px-2 py-0.5 rounded-full">{l}</span>
                  ))}
                </div>
              )}
              <p className="leading-relaxed">{m.text}</p>
            </div>
          </div>
        ))}
        {busy && (
          <div className="flex justify-start">
            <div className="bg-surface border border-line rounded-lg px-4 py-2.5">
              <Loader2 size={16} className="text-accent animate-spin" />
            </div>
          </div>
        )}
      </div>

      <div className="flex items-center gap-2 border border-line rounded-lg p-2 bg-surface">
        <input
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => { if (e.key === 'Enter') handleSend() }}
          placeholder="Ask a question about your results…"
          className="hd-input flex-1 text-sm text-ink px-2"
        />
        <button
          type="button"
          onClick={handleSend}
          disabled={busy || !input.trim()}
          className="bg-accent text-white rounded-md p-2 disabled:opacity-40"
        >
          <Send size={16} />
        </button>
      </div>
    </div>
  )
}
