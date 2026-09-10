'use client'
import { useEffect, useState } from 'react'
import { fetchWithAuth } from '@/lib/fetch-utils'
import { Activity } from 'lucide-react'

interface ObservationItem {
  title?: string
  detail?: string
}

type ObservationEntry = string | ObservationItem

interface HealthData {
  financialScore: number
  scoreLabel: string
  summary: string
  observations?: ObservationEntry[]
}

function renderObservationText(item: ObservationEntry): React.ReactNode {
  if (typeof item === 'string') return item
  if (item && typeof item === 'object') {
    if (item.title && item.detail) {
      return (
        <span>
          <strong className="font-medium text-slate-800">{item.title}: </strong>
          {item.detail}
        </span>
      )
    }
    return item.detail || item.title || JSON.stringify(item)
  }
  return String(item ?? '')
}

function getScoreColor(score: number) {
  if (score >= 75) return { stroke: '#0f172a', text: 'text-slate-900', label: 'Optimal Buffer' }
  if (score >= 50) return { stroke: '#f59e0b', text: 'text-amber-600', label: 'Moderate' }
  return { stroke: '#ef4444', text: 'text-rose-600', label: 'Review Required' }
}

export default function FinancialHealthScore() {
  const [data, setData] = useState<HealthData | null>(null)
  const [loading, setLoading] = useState(true)
  const [animated, setAnimated] = useState(0)

  useEffect(() => {
    const animate = (score: number) => {
      let start = 0
      const step = score / 60
      const timer = setInterval(() => {
        start += step
        if (start >= score) { setAnimated(score); clearInterval(timer) }
        else setAnimated(Math.floor(start))
      }, 16)
      return () => clearInterval(timer)
    }

    const fetchData = async () => {
      try {
        const r = await fetchWithAuth('/api/insights')
        const d = await r.json()
        if (r.ok && d.insights) {
          const rawScore = d.insights?.financialScore
          const numericScore = typeof rawScore === 'object' && rawScore !== null
            ? (rawScore.score ?? 72)
            : (typeof rawScore === 'number' ? rawScore : 72)
          const label = typeof rawScore === 'object' && rawScore !== null
            ? (rawScore.label ?? 'Good')
            : (d.insights?.scoreLabel ?? 'Good')

          setData({
            financialScore: numericScore,
            scoreLabel: label,
            summary: d.insights?.summary ?? '',
            observations: Array.isArray(d.insights?.insights) ? d.insights.insights : [],
          })
          setLoading(false)
          return animate(numericScore)
        }
      } catch { /* fallthrough */ }

      // Fallback: calculate score from transaction diversity + card count
      try {
        const [txRes, cardRes] = await Promise.all([
          fetchWithAuth('/api/transactions?limit=50'),
          fetchWithAuth('/api/cards'),
        ])
        const { transactions = [] } = await txRes.json()
        const { cards = [] } = await cardRes.json()

        const categories = new Set(transactions.map((t: { category: string }) => t.category)).size
        const cardCount = cards.length
        const txCount = transactions.length
        // Heuristic: more diversity + more cards = healthier score
        const score = Math.min(100, Math.max(20,
          40 + (cardCount * 10) + (categories * 5) + Math.min(txCount, 10)
        ))
        const label = score >= 75 ? 'Good' : score >= 50 ? 'Fair' : 'Getting Started'
        setData({
          financialScore: score,
          scoreLabel: label,
          summary: cardCount === 0
            ? 'Add your first card to start building your financial profile.'
            : `You have ${cardCount} card${cardCount > 1 ? 's' : ''} connected and ${txCount} transactions tracked.`,
          observations: [],
        })
        setLoading(false)
        return animate(score)
      } catch {
        setData({ financialScore: 50, scoreLabel: 'Pending', summary: 'Connect cards to see your score.', observations: [] })
        setAnimated(50)
        setLoading(false)
      }
    }

    fetchData()
  }, [])

  if (loading) {
    return (
      <div className="bg-white rounded-xl border border-slate-200/80 p-5 shadow-sm animate-pulse h-full">
        <div className="w-32 h-32 bg-slate-100 rounded-full mx-auto mb-4" />
        <div className="h-3 bg-slate-100 rounded w-2/3 mx-auto" />
      </div>
    )
  }

  const score = data?.financialScore ?? 0
  const color = getScoreColor(score)

  // SVG circle gauge constants
  const radius = 56
  const circumference = 2 * Math.PI * radius
  const progress = ((100 - animated) / 100) * circumference

  return (
    <div className="bg-white rounded-xl border border-slate-200/80 p-5 shadow-sm h-full flex flex-col justify-between">
      <div>
        <div className="flex items-center gap-1.5 mb-4 text-slate-900">
          <Activity size={14} className="text-slate-500" />
          <h3 className="text-xs font-semibold">Financial Health Score</h3>
        </div>

        {/* Circular Gauge */}
        <div className="flex flex-col items-center my-3">
          <svg width="140" height="140" className="-rotate-90">
            {/* Background track */}
            <circle
              cx="70" cy="70" r={radius}
              fill="none"
              stroke="#F1F5F9"
              strokeWidth="9"
            />
            {/* Animated progress arc */}
            <circle
              cx="70" cy="70" r={radius}
              fill="none"
              stroke={color.stroke}
              strokeWidth="9"
              strokeLinecap="round"
              strokeDasharray={circumference}
              strokeDashoffset={progress}
              style={{ transition: 'stroke-dashoffset 0.05s linear' }}
            />
          </svg>
          {/* Score number in centre */}
          <div className="-mt-[92px] flex flex-col items-center mb-3">
            <span className="text-3xl font-semibold font-mono tabular-nums text-slate-900">{animated}</span>
            <span className="text-[10px] text-slate-400 font-mono">/ 100</span>
          </div>
          <div className="mt-4">
            <span className="text-[11px] font-medium px-2.5 py-0.5 rounded-full bg-slate-100 text-slate-700 border border-slate-200">
              {color.label}
            </span>
          </div>
        </div>

        {/* Summary */}
        {data?.summary && (
          <p className="text-xs text-slate-600 text-center my-3 leading-relaxed">{data.summary}</p>
        )}
      </div>

      {/* Observations */}
      {data?.observations && data.observations.length > 0 && (
        <div className="space-y-1.5 border-t border-slate-100 pt-3 mt-2">
          {data.observations.slice(0, 3).map((obs, i) => (
            <div key={i} className="flex gap-2 text-[11px] text-slate-600 leading-snug">
              <span className="mt-0.5 shrink-0 text-slate-400 font-mono">▸</span>
              <span>{renderObservationText(obs)}</span>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

