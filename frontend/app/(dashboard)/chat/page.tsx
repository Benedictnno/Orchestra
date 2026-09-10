'use client'
import { useState, useEffect, useRef, Suspense } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import {
  Send,
  User,
  Sparkles,
  Bot,
  Trash2,
  Download,
  RefreshCw,
  Plus,
} from 'lucide-react'
import { fetchWithAuth } from '@/lib/fetch-utils'
import { useCards } from '@/hooks/useCards'
import { useCurrentUser } from '@/hooks/useAuth'
import { queryClient } from '@/lib/queryClient'
import toast from 'react-hot-toast'
import { FinancialArtifact } from '@/types/artifact'
import { ArtifactRenderer } from '@/components/chat/ArtifactRenderer'
import { FormattedText } from '@/components/chat/FormattedText'

// ─────────────────────────────────────────────────────────────────────────────
// Types
// ─────────────────────────────────────────────────────────────────────────────

interface Message {
  role: 'user' | 'assistant'
  content: string | null
  artifact?: FinancialArtifact | null
  timestamp?: string
}

const SUGGESTED_PROMPTS = [
  { label: 'Analyze this month’s cash burn & outflow' },
  { label: 'Which card should I route SaaS subscriptions to?' },
  { label: 'Where can I optimize operational spend?' },
  { label: 'Check for high-severity flagged anomalies' },
]

// ─────────────────────────────────────────────────────────────────────────────
// Inner Page Component with search params
// ─────────────────────────────────────────────────────────────────────────────

function ChatContent() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const sessionId = searchParams.get('session')
  const newChatSignal = searchParams.get('new')

  const { data: user } = useCurrentUser()
  const { data: cards = [] } = useCards()

  const [activeSessionId, setActiveSessionId] = useState<string | null>(sessionId)
  const [sessionTitle, setSessionTitle] = useState<string>('New Session')
  const [messages, setMessages] = useState<Message[]>([])
  const [input, setInput] = useState('')
  const [loading, setLoading] = useState(false)
  const [fetchingHistory, setFetchingHistory] = useState(true)
  const scrollRef = useRef<HTMLDivElement>(null)

  // When ?new=<timestamp> is present, start a fresh session and clean the URL
  useEffect(() => {
    if (newChatSignal) {
      setActiveSessionId(null)
      setSessionTitle('New Session')
      setMessages([])
      setFetchingHistory(false)
      router.replace('/chat', { scroll: false })
    }
  }, [newChatSignal, router])

  // Sync activeSessionId from URL ?session= param
  useEffect(() => {
    if (newChatSignal) return
    setActiveSessionId(sessionId)
    fetchHistory(sessionId)
  }, [sessionId])

  // ── Auto-scroll ─────────────────────────────────────────────────────────
  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight
    }
  }, [messages, loading])

  // ── History fetch ───────────────────────────────────────────────────────
  async function fetchHistory(currentId: string | null) {
    setFetchingHistory(true)
    try {
      const url = currentId ? `/api/chat?sessionId=${currentId}` : '/api/chat'
      const res = await fetchWithAuth(url)
      if (res.ok) {
        const data = await res.json()
        if (data.session?.title) {
          setSessionTitle(data.session.title)
        } else if (!currentId) {
          setSessionTitle('New Session')
        }

        const history: Message[] = (data.history ?? [])
          .map((m: { role: string; content: string }) => {
            if (m.role === 'assistant') {
              try {
                const parsed = JSON.parse(m.content)
                if (parsed.summary && parsed.observations && parsed.spending_spectrum) {
                  return { role: 'assistant' as const, content: parsed.introText || null, artifact: parsed }
                }
                if (parsed.observations || parsed.action_workflows) {
                  return null
                }
              } catch { /* not JSON */ }
            }
            return { role: m.role as 'user' | 'assistant', content: m.content, artifact: null }
          })
          .filter(Boolean) as Message[]

        setMessages(history)
      } else {
        setMessages([])
      }
    } catch {
      setMessages([])
    } finally {
      setFetchingHistory(false)
    }
  }

  // ── Start New Chat ──────────────────────────────────────────────────────
  function handleNewChat() {
    setActiveSessionId(null)
    setSessionTitle('New Session')
    setMessages([])
    router.push('/chat')
  }

  // ── Send message ────────────────────────────────────────────────────────
  async function sendMessage(textToSend: string) {
    const text = textToSend.trim()
    if (!text || loading) return

    const ts = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    const userMsg: Message = { role: 'user', content: text, timestamp: ts }

    setMessages(prev => [...prev, userMsg])
    setInput('')
    setLoading(true)

    try {
      const res = await fetchWithAuth('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message: text,
          sessionId: activeSessionId || undefined,
        }),
      })

      const data = await res.json()
      if (!res.ok) {
        toast.error(data.message || 'Failed to get response')
        return
      }

      // If a new session was created on backend, sync URL and query cache
      if (data.sessionId && data.sessionId !== activeSessionId) {
        setActiveSessionId(data.sessionId)
        if (data.title) setSessionTitle(data.title)
        router.replace(`/chat?session=${data.sessionId}`, { scroll: false })
        queryClient.invalidateQueries({ queryKey: ['chat-sessions'] })
      }

      const aiTs = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })

      if (data.artifact) {
        // Structured artifact — render component tree
        setMessages(prev => [...prev, {
          role: 'assistant',
          content: data.reply || null,
          artifact: data.artifact,
          timestamp: aiTs,
        }])
      } else {
        // Conversational text response
        setMessages(prev => [...prev, {
          role: 'assistant',
          content: data.reply || data.response || data.message || 'Analysis complete.',
          artifact: null,
          timestamp: aiTs,
        }])
      }
    } catch {
      toast.error('Connection error. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  // ── Clear / Delete Session ──────────────────────────────────────────────
  async function clearChat() {
    if (!confirm('Clear this conversation?')) return
    try {
      const url = activeSessionId ? `/api/chat?sessionId=${activeSessionId}` : '/api/chat'
      const res = await fetchWithAuth(url, { method: 'DELETE' })
      if (res.ok) {
        setMessages([])
        queryClient.invalidateQueries({ queryKey: ['chat-sessions'] })
        toast.success('Conversation cleared')
        handleNewChat()
      }
    } catch {
      toast.error('Failed to clear chat')
    }
  }

  // ── Export ──────────────────────────────────────────────────────────────
  function exportBrief() {
    const text = messages
      .map(m => {
        if (m.role === 'user') return `[USER]:\n${m.content}\n`
        if (m.artifact) return `[ORCHESTRA ARTIFACT]:\n${JSON.stringify(m.artifact, null, 2)}\n`
        return `[ORCHESTRA]:\n${m.content}\n`
      })
      .join('\n---\n\n')
    const blob = new Blob([text], { type: 'text/plain' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `orchestra-ai-brief-${new Date().toISOString().slice(0, 10)}.txt`
    a.click()
    URL.revokeObjectURL(url)
    toast.success('Brief exported')
  }

  return (
    <div className="flex flex-col h-full w-full bg-white rounded-xl border border-slate-200/80 shadow-sm overflow-hidden">

      {/* ── Top Workspace Context Bar ──────────────────────────────────────── */}
      <div className="bg-slate-50/70 backdrop-blur-md px-4 sm:px-6 py-3 border-b border-slate-200/80 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 shrink-0">
        <div className="flex items-center flex-wrap gap-2.5 min-w-0">
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-lg bg-slate-900 flex items-center justify-center text-white shrink-0">
              <Sparkles size={14} />
            </div>
            <span className="font-semibold text-slate-900 text-xs sm:text-sm truncate">
              {sessionTitle || 'Ask Orchestra'}
            </span>
          </div>

          <span className="text-slate-300 text-xs hidden sm:inline">•</span>

          <div className="hidden md:flex items-center gap-1.5 px-2 py-0.5 rounded-md bg-slate-100 text-slate-600 font-mono text-[11px]">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
            <span>{cards.length} Linked Cards Active</span>
          </div>
        </div>

        <div className="flex items-center gap-2 self-end sm:self-auto shrink-0">
          <button
            onClick={handleNewChat}
            className="inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg bg-slate-900 hover:bg-slate-800 text-white text-xs font-medium transition-colors shadow-sm"
          >
            <Plus size={13} />
            <span>New Chat</span>
          </button>

          <button
            onClick={exportBrief}
            className="inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg bg-white border border-slate-200 hover:bg-slate-50 text-slate-700 text-xs font-medium transition-colors shadow-sm"
          >
            <Download size={13} />
            <span className="hidden sm:inline">Export</span>
          </button>

          <button
            onClick={clearChat}
            className="inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg bg-white border border-slate-200 hover:bg-rose-50 hover:text-rose-600 hover:border-rose-200 text-slate-500 text-xs font-medium transition-colors shadow-sm"
          >
            <Trash2 size={13} />
            <span className="hidden sm:inline">Reset</span>
          </button>
        </div>
      </div>

      {/* ── Main Canvas Stream ─────────────────────────────────────────────── */}
      <div ref={scrollRef} className="flex-1 overflow-y-auto p-4 sm:p-6 md:p-8 space-y-5 scroll-smooth bg-slate-50/40">

        {/* ── Conversation Stream ─────────────────────────────────────────── */}
        {fetchingHistory ? (
          <div className="flex flex-col items-center justify-center py-16 gap-3 text-slate-400">
            <RefreshCw size={20} className="animate-spin text-slate-900" />
            <p className="text-xs">Loading copilot history…</p>
          </div>
        ) : messages.length === 0 ? (
          /* Empty state */
          <div className="bg-white rounded-xl border border-slate-200/80 p-6 sm:p-7 space-y-4 max-w-2xl mx-auto my-8 shadow-sm">
            <div className="flex items-start gap-3.5">
              <div className="w-8 h-8 rounded-lg bg-slate-100 text-slate-700 flex items-center justify-center shrink-0">
                <Bot size={18} />
              </div>
              <div className="space-y-1.5">
                <h3 className="font-semibold text-sm text-slate-900">
                  Hello {user?.name || 'there'} — Welcome to Ask Orchestra Copilot
                </h3>
                <p className="text-xs text-slate-500 leading-relaxed">
                  I continuously monitor your {cards.length} connected banking cards, evaluate multi-account cash velocity,
                  detect duplicate fees, and generate structured financial artifacts with deterministic telemetry.
                </p>
              </div>
            </div>

            <div className="pt-3 border-t border-slate-100">
              <p className="text-[11px] font-medium text-slate-400 mb-2.5">Suggested Inquiries</p>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                {SUGGESTED_PROMPTS.map((p, idx) => (
                  <button
                    key={idx}
                    onClick={() => sendMessage(p.label)}
                    className="p-2.5 rounded-lg bg-slate-50 hover:bg-slate-100/80 border border-slate-200/70 text-left text-xs text-slate-700 transition-colors"
                  >
                    <span>{p.label}</span>
                  </button>
                ))}
              </div>
            </div>
          </div>
        ) : (
          messages.map((m, i) => (
            <div key={i} className={`flex gap-3 sm:gap-3.5 ${m.role === 'user' ? 'flex-row-reverse' : 'flex-row'}`}>
              {/* Avatar */}
              <div className={`w-7 h-7 rounded-lg flex items-center justify-center shrink-0 border text-xs
                ${m.role === 'user'
                  ? 'bg-slate-900 text-white border-slate-900'
                  : 'bg-white text-slate-700 border-slate-200'}`}>
                {m.role === 'user' ? <User size={13} /> : <Bot size={13} />}
              </div>

              {/* Content */}
              {m.role === 'assistant' && m.artifact ? (
                /* Structured artifact card */
                <ArtifactRenderer artifact={m.artifact} timestamp={m.timestamp} />
              ) : (
                /* Plain text bubble */
                <div className={`max-w-[90%] sm:max-w-[80%] rounded-xl p-3.5 sm:p-4 text-xs leading-relaxed shadow-sm
                  ${m.role === 'user'
                    ? 'bg-slate-900 text-white rounded-tr-none'
                    : 'bg-white text-slate-900 border border-slate-200/80 rounded-tl-none'}`}>
                  {m.role === 'assistant' ? (
                    <FormattedText content={m.content || ''} />
                  ) : (
                    <p className="whitespace-pre-wrap">{m.content}</p>
                  )}
                  {m.timestamp && (
                    <span className={`block text-[10px] mt-2 font-mono ${m.role === 'user' ? 'text-slate-400 text-right' : 'text-slate-400'}`}>
                      {m.timestamp}
                    </span>
                  )}
                </div>
              )}
            </div>
          ))
        )}

        {/* Typing indicator */}
        {loading && (
          <div className="flex gap-3 sm:gap-3.5">
            <div className="w-7 h-7 rounded-lg bg-white text-slate-700 border border-slate-200 flex items-center justify-center shrink-0">
              <Bot size={13} />
            </div>
            <div className="bg-white border border-slate-200/80 rounded-xl rounded-tl-none px-3 py-2 flex gap-1.5 items-center shadow-sm">
              <div className="w-1.5 h-1.5 bg-slate-400 rounded-full animate-bounce" />
              <div className="w-1.5 h-1.5 bg-slate-400 rounded-full animate-bounce [animation-delay:0.2s]" />
              <div className="w-1.5 h-1.5 bg-slate-400 rounded-full animate-bounce [animation-delay:0.4s]" />
            </div>
          </div>
        )}
      </div>

      {/* ── Floating Prompt Input Dock ─────────────────────────────────────── */}
      <div className="p-3 sm:p-4 bg-white border-t border-slate-200/80 shrink-0">
        <form onSubmit={(e) => { e.preventDefault(); sendMessage(input) }} className="relative">
          <input
            type="text"
            value={input}
            onChange={e => setInput(e.target.value)}
            placeholder="Ask Orchestra anything about your balances, cards, or spending velocity..."
            className="w-full bg-slate-50 border border-slate-200 rounded-lg py-2.5 pl-3.5 pr-12 focus:outline-none focus:ring-1 focus:ring-slate-950 focus:border-slate-950 text-xs text-slate-900 transition-colors"
          />
          <button
            type="submit"
            disabled={!input.trim() || loading}
            className="absolute right-1.5 top-1/2 -translate-y-1/2 w-7 h-7 bg-slate-900 text-white rounded-md flex items-center justify-center hover:bg-slate-800 transition-colors disabled:opacity-40"
          >
            <Send size={13} />
          </button>
        </form>

        <p className="text-[10px] text-slate-400 text-center mt-2">
          Orchestra Copilot utilizes localized bank telemetry to generate deterministic structured financial artifacts.
        </p>
      </div>
    </div>
  )
}

export default function FullCanvasChatPage() {
  return (
    <Suspense
      fallback={
        <div className="flex h-full w-full items-center justify-center bg-white">
          <div className="flex flex-col items-center gap-2">
            <RefreshCw size={20} className="animate-spin text-slate-900" />
            <p className="text-xs text-slate-400">Loading Orchestra workspace…</p>
          </div>
        </div>
      }
    >
      <ChatContent />
    </Suspense>
  )
}


