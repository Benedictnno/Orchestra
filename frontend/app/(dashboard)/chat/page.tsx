'use client'
import { useState, useEffect, useRef } from 'react'
import {
  Send,
  User,
  Sparkles,
  Bot,
  Trash2,
  Download,
  ShieldCheck,
  Zap,
  Activity,
  RefreshCw,
} from 'lucide-react'
import { fetchWithAuth } from '@/lib/fetch-utils'
import { toNaira } from '@/utils/format'
import { useCards } from '@/hooks/useCards'
import { useTransactionSummary } from '@/hooks/useTransactions'
import { useCurrentUser } from '@/hooks/useAuth'
import toast from 'react-hot-toast'
import { FinancialArtifact } from '@/types/artifact'
import { ArtifactRenderer } from '@/components/chat/ArtifactRenderer'
import { FormattedText } from '@/components/chat/FormattedText'

// ─────────────────────────────────────────────────────────────────────────────
// Types
// ─────────────────────────────────────────────────────────────────────────────

interface Message {
  role: 'user' | 'assistant'
  content: string | null      // text content or intro text
  artifact?: FinancialArtifact | null
  timestamp?: string
}

const SUGGESTED_PROMPTS = [
  { icon: '📊', label: 'Analyze this month\u2019s spending' },
  { icon: '💳', label: 'Which card should I use for subscriptions?' },
  { icon: '💡', label: 'Where can I cut expenses?' },
  { icon: '⚡', label: 'Check for flagged anomalies' },
]

// ─────────────────────────────────────────────────────────────────────────────
// Page
// ─────────────────────────────────────────────────────────────────────────────

export default function FullCanvasChatPage() {
  const { data: user } = useCurrentUser()
  const { data: cards = [] } = useCards()
  const { data: summaryData } = useTransactionSummary()

  const [messages, setMessages] = useState<Message[]>([])
  const [input, setInput] = useState('')
  const [loading, setLoading] = useState(false)
  const [fetchingHistory, setFetchingHistory] = useState(true)
  const scrollRef = useRef<HTMLDivElement>(null)

  // ── Derived context bar metrics ─────────────────────────────────────────
  const summary = summaryData?.summary || {
    totalSpent: 0, transactionCount: 0, byCategory: {},
    subscriptionSpend: 0, anomalyCount: 0,
  }
  const totalSpentNaira = (summary.totalSpent || 0) / 100
  const dailyBurnNaira  = Math.round(totalSpentNaira / 30)
  const totalBalanceNaira = cards.reduce((acc, c) => acc + (c.availableBalance || 0), 0)

  const categories = Object.entries(summary.byCategory || {})
    .map(([cat, amount]) => ({
      category: cat,
      amount: Number(amount) / 100,
      percentage: totalSpentNaira > 0
        ? Math.round(((Number(amount) / 100) / totalSpentNaira) * 100)
        : 0,
    }))
    .sort((a, b) => b.amount - a.amount)

  const healthScore = Math.min(96, Math.max(50, Math.round(
    65 + (cards.length * 5) + (categories.length * 3) - ((summary.anomalyCount || 0) * 10)
  )))

  // ── Auto-scroll ─────────────────────────────────────────────────────────
  useEffect(() => { fetchHistory() }, [])
  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight
    }
  }, [messages, loading])

  // ── History fetch ───────────────────────────────────────────────────────
  async function fetchHistory() {
    try {
      const res = await fetchWithAuth('/api/chat')
      if (res.ok) {
        const data = await res.json()
        const history: Message[] = (data.history ?? [])
          .map((m: { role: string; content: string }) => {
            if (m.role === 'assistant') {
              try {
                const parsed = JSON.parse(m.content)
                // Full FinancialArtifact — render component tree
                if (parsed.summary && parsed.observations && parsed.spending_spectrum) {
                  return { role: 'assistant' as const, content: parsed.introText || null, artifact: parsed }
                }
                // Partial LLM JSON (observations-only) — skip, it's an internal format
                if (parsed.observations || parsed.action_workflows) {
                  return null
                }
              } catch { /* not JSON — render as text prose */ }
            }
            return { role: m.role as 'user' | 'assistant', content: m.content, artifact: null }
          })
          .filter(Boolean) as Message[]
        setMessages(history)
      }
    } catch { /* ignore */ }
    finally { setFetchingHistory(false) }
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
        body: JSON.stringify({ message: text }),
      })

      const data = await res.json()
      if (!res.ok) {
        toast.error(data.message || 'Failed to get response')
        return
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

  // ── Clear ───────────────────────────────────────────────────────────────
  async function clearChat() {
    if (!confirm('Clear all conversation history?')) return
    try {
      const res = await fetchWithAuth('/api/chat', { method: 'DELETE' })
      if (res.ok) { setMessages([]); toast.success('Chat history cleared') }
    } catch { toast.error('Failed to clear chat') }
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

  // ─────────────────────────────────────────────────────────────────────────
  // Render
  // ─────────────────────────────────────────────────────────────────────────

  return (
    <div className="flex flex-col h-full w-full bg-card border-x border-border shadow-sm overflow-hidden transition-colors">

      {/* ── Top Workspace Context Bar ──────────────────────────────────────── */}
      <div className="bg-surface-container-low/70 backdrop-blur-md px-4 sm:px-6 py-3 border-b border-border flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 shrink-0">
        <div className="flex items-center flex-wrap gap-2.5">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-xl bg-[#4A90e2] flex items-center justify-center text-white shadow-sm">
              <Sparkles size={16} />
            </div>
            <span className="font-bold text-foreground text-sm sm:text-base">Ask Orchestra</span>
          </div>

          <span className="text-muted-foreground text-xs hidden sm:inline">/</span>

          <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-muted text-muted-foreground font-medium text-[11px]">
            <Zap size={12} className="text-[#4A90e2]" />
            <span>Groq · Llama 3.3 70B Fast Reasoning</span>
          </div>

          <div className="hidden md:flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-emerald-500/10 text-emerald-600 font-semibold text-[11px]">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
            <span>{cards.length} Cards Connected</span>
          </div>
        </div>

        <div className="flex items-center gap-2 self-end sm:self-auto">
          <button
            onClick={exportBrief}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-card border border-border hover:bg-muted text-foreground text-xs font-semibold transition-colors shadow-sm"
          >
            <Download size={13} />
            <span className="hidden sm:inline">Export Brief</span>
          </button>

          <button
            onClick={clearChat}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-card border border-border hover:bg-red-50 hover:text-red-600 hover:border-red-200 text-muted-foreground text-xs font-semibold transition-colors shadow-sm"
          >
            <Trash2 size={13} />
            <span className="hidden sm:inline">Reset</span>
          </button>
        </div>
      </div>

      {/* ── Main Canvas Stream ─────────────────────────────────────────────── */}
      <div ref={scrollRef} className="flex-1 overflow-y-auto p-4 sm:p-6 md:p-8 space-y-6 scroll-smooth bg-background">

        {/* Privacy badge */}
        <div className="flex justify-center">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-card border border-border shadow-sm text-muted-foreground text-xs font-medium">
            <ShieldCheck size={14} className="text-emerald-500" />
            <span>Zero-knowledge session · 256-bit bank encryption · Read-only access</span>
          </div>
        </div>

        {/* Financial Intelligence Overview (always visible at top) */}
        <div className="bg-card rounded-2xl border border-border p-5 sm:p-6 shadow-sm space-y-5">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-border">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-[#4A90e2]/10 text-[#4A90e2] flex items-center justify-center font-bold">
                <Activity size={20} />
              </div>
              <div>
                <h2 className="font-bold text-base sm:text-lg text-foreground">Orchestra Financial Intelligence</h2>
                <p className="text-xs text-muted-foreground">Live multi-bank ledger analysis · 30-day overview</p>
              </div>
            </div>
            <span className="text-xs px-2.5 py-1 rounded-full bg-emerald-100 text-emerald-700 font-bold self-start sm:self-auto">
              Score: {healthScore}/100
            </span>
          </div>

          {/* Key Metrics Grid */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            {[
              { label: 'Total Outflow',    value: toNaira(totalSpentNaira),      sub: `${summary.transactionCount} transactions`,    color: '' },
              { label: 'Liquid Balances',  value: toNaira(totalBalanceNaira),    sub: `${cards.length} connected cards`,             color: 'text-emerald-600' },
              { label: 'Daily Burn Rate',  value: toNaira(dailyBurnNaira),       sub: 'Within limits',                               color: '' },
              { label: 'Top Category',     value: categories[0]?.category || 'None', sub: categories[0] ? `${categories[0].percentage}% of spend` : 'No data', color: 'text-[#4A90e2] capitalize truncate' },
            ].map(({ label, value, sub, color }) => (
              <div key={label} className="bg-muted/40 p-3.5 rounded-xl border border-border/50">
                <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider block">{label}</span>
                <span className={`text-base sm:text-lg font-black text-foreground mt-1 block ${color}`}>{value}</span>
                <span className="text-[10px] text-muted-foreground mt-0.5 block">{sub}</span>
              </div>
            ))}
          </div>

          {/* Spending spectrum */}
          {categories.length > 0 && (
            <div className="space-y-2">
              <div className="flex justify-between items-center text-xs">
                <span className="font-semibold text-foreground">Spending Spectrum</span>
                <span className="text-muted-foreground">{categories.length} active categories</span>
              </div>
              <div className="w-full h-3 rounded-full overflow-hidden flex bg-muted shadow-inner">
                {categories.slice(0, 5).map((cat, i) => {
                  const colors = ['bg-[#4A90e2]', 'bg-emerald-500', 'bg-amber-500', 'bg-purple-500', 'bg-rose-500']
                  return (
                    <div
                      key={cat.category}
                      className={`h-full ${colors[i % colors.length]} transition-all hover:opacity-80`}
                      style={{ width: `${cat.percentage}%` }}
                      title={`${cat.category}: ${cat.percentage}% (${toNaira(cat.amount)})`}
                    />
                  )
                })}
              </div>
              <div className="flex flex-wrap gap-x-4 gap-y-1 text-[11px] text-muted-foreground pt-1">
                {categories.slice(0, 4).map((cat, i) => {
                  const dots = ['bg-[#4A90e2]', 'bg-emerald-500', 'bg-amber-500', 'bg-purple-500']
                  return (
                    <div key={cat.category} className="flex items-center gap-1.5">
                      <span className={`w-2 h-2 rounded-full ${dots[i % dots.length]}`} />
                      <span className="capitalize font-medium text-foreground">{cat.category}</span>
                      <span>({cat.percentage}%)</span>
                    </div>
                  )
                })}
              </div>
            </div>
          )}
        </div>

        {/* ── Conversation Stream ─────────────────────────────────────────── */}
        {fetchingHistory ? (
          <div className="flex flex-col items-center justify-center py-12 gap-3 text-muted-foreground">
            <RefreshCw size={24} className="animate-spin text-[#4A90e2]" />
            <p className="text-xs">Loading copilot history...</p>
          </div>
        ) : messages.length === 0 ? (
          /* Empty state */
          <div className="bg-card rounded-2xl border border-border p-6 sm:p-8 space-y-4">
            <div className="flex items-start gap-4">
              <div className="w-10 h-10 rounded-2xl bg-[#4A90e2]/10 text-[#4A90e2] flex items-center justify-center shrink-0">
                <Bot size={22} />
              </div>
              <div className="space-y-2">
                <h3 className="font-bold text-lg text-foreground">
                  Hello {user?.name || 'there'}! I&apos;m your Orchestra AI Copilot.
                </h3>
                <p className="text-sm text-muted-foreground leading-relaxed">
                  I monitor your {cards.length} connected bank cards, analyze transactions in real-time,
                  detect duplicate fees, and generate structured financial intelligence cards — not generic advice.
                </p>
              </div>
            </div>

            <div className="pt-2 border-t border-border">
              <p className="text-xs font-semibold text-muted-foreground mb-3 uppercase tracking-wider">Suggested Questions</p>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                {SUGGESTED_PROMPTS.map((p, idx) => (
                  <button
                    key={idx}
                    onClick={() => sendMessage(p.label)}
                    className="flex items-center gap-2.5 p-3 rounded-xl bg-muted/40 hover:bg-muted border border-border/50 text-left text-xs font-medium text-foreground transition-all hover:scale-[1.01]"
                  >
                    <span className="text-base">{p.icon}</span>
                    <span>{p.label}</span>
                  </button>
                ))}
              </div>
            </div>
          </div>
        ) : (
          messages.map((m, i) => (
            <div key={i} className={`flex gap-3 sm:gap-4 ${m.role === 'user' ? 'flex-row-reverse' : 'flex-row'}`}>
              {/* Avatar */}
              <div className={`w-8 sm:w-9 h-8 sm:h-9 rounded-xl flex items-center justify-center shrink-0 shadow-sm border
                ${m.role === 'user'
                  ? 'bg-[#4A90e2] text-white border-[#4A90e2]'
                  : 'bg-card text-foreground border-border'}`}>
                {m.role === 'user' ? <User size={16} /> : <Bot size={16} className="text-[#4A90e2]" />}
              </div>

              {/* Content */}
              {m.role === 'assistant' && m.artifact ? (
                /* Structured artifact card */
                <ArtifactRenderer artifact={m.artifact} timestamp={m.timestamp} />
              ) : (
                /* Plain text bubble (user message or fallback assistant text) */
                <div className={`max-w-[92%] sm:max-w-[85%] rounded-2xl p-4 sm:p-5 text-sm leading-relaxed shadow-sm
                  ${m.role === 'user'
                    ? 'bg-[#4A90e2] text-white rounded-tr-none font-medium'
                    : 'bg-card text-foreground border border-border rounded-tl-none'}`}>
                  {m.role === 'assistant' ? (
                    <FormattedText content={m.content || ''} />
                  ) : (
                    <p className="whitespace-pre-wrap">{m.content}</p>
                  )}
                  {m.timestamp && (
                    <span className={`block text-[10px] mt-2.5 ${m.role === 'user' ? 'text-white/70 text-right' : 'text-muted-foreground'}`}>
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
          <div className="flex gap-3 sm:gap-4">
            <div className="w-8 sm:w-9 h-8 sm:h-9 rounded-xl bg-card text-[#4A90e2] border border-border flex items-center justify-center shrink-0 shadow-sm">
              <Bot size={16} />
            </div>
            <div className="bg-card border border-border rounded-2xl rounded-tl-none p-4 flex gap-1.5 items-center shadow-sm">
              <div className="w-2 h-2 bg-[#4A90e2] rounded-full animate-bounce" />
              <div className="w-2 h-2 bg-[#4A90e2] rounded-full animate-bounce [animation-delay:0.2s]" />
              <div className="w-2 h-2 bg-[#4A90e2] rounded-full animate-bounce [animation-delay:0.4s]" />
            </div>
          </div>
        )}
      </div>

      {/* ── Floating Prompt Input Dock ─────────────────────────────────────── */}
      <div className="p-3 sm:p-4 bg-card/90 backdrop-blur-md border-t border-border shrink-0">
        {/* Quick prompt pills */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-2 mb-2 scrollbar-hide">
          {SUGGESTED_PROMPTS.map((p, idx) => (
            <button
              key={idx}
              onClick={() => sendMessage(p.label)}
              className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-muted/60 hover:bg-muted text-muted-foreground hover:text-foreground text-[11px] font-medium whitespace-nowrap transition-all shrink-0"
            >
              <span>{p.icon}</span>
              <span>{p.label}</span>
            </button>
          ))}
        </div>

        <form onSubmit={(e) => { e.preventDefault(); sendMessage(input) }} className="relative">
          <input
            type="text"
            value={input}
            onChange={e => setInput(e.target.value)}
            placeholder="Ask Orchestra anything about your cards, balances, or transactions..."
            className="w-full bg-background border border-border rounded-2xl py-3.5 sm:py-4 pl-5 pr-14 focus:outline-none focus:ring-2 focus:ring-[#4A90e2]/30 focus:border-[#4A90e2] text-sm text-foreground transition-all shadow-inner"
          />
          <button
            type="submit"
            disabled={!input.trim() || loading}
            className="absolute right-2 top-1/2 -translate-y-1/2 w-10 h-10 bg-[#4A90e2] text-white rounded-xl flex items-center justify-center hover:bg-[#3B78C4] transition-all disabled:opacity-40 shadow-sm"
          >
            <Send size={16} />
          </button>
        </form>

        <p className="text-[10px] text-muted-foreground text-center mt-2 font-medium">
          Orchestra AI uses pre-computed ledger analytics to generate structured financial artifacts — not generic advice.
        </p>
      </div>
    </div>
  )
}
