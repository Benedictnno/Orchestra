'use client'
import { useEffect, useState } from 'react'
import { fetchWithAuth } from '@/lib/fetch-utils'

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
          <strong className="font-semibold text-gray-800">{item.title}: </strong>
          {item.detail}
        </span>
      )
    }
    return item.detail || item.title || JSON.stringify(item)
  }
  return String(item ?? '')
}

function getScoreColor(score: number) {
  if (score >= 75) return { stroke: '#10B981', text: 'text-green-600', label: 'Excellent' }
  if (score >= 50) return { stroke: '#F59E0B', text: 'text-amber-600', label: 'Moderate' }
  return { stroke: '#E94560', text: 'text-red-600', label: 'Needs Attention' }
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
      <div className="bg-white rounded-2xl border p-6 animate-pulse">
        <div className="w-40 h-40 bg-gray-200 rounded-full mx-auto mb-4" />
        <div className="h-4 bg-gray-200 rounded w-2/3 mx-auto" />
      </div>
    )
  }

  const score = data?.financialScore ?? 0
  const color = getScoreColor(score)

  // SVG circle gauge constants
  const radius = 60
  const circumference = 2 * Math.PI * radius
  const progress = ((100 - animated) / 100) * circumference

  return (
    <div className="bg-white rounded-2xl border p-6">
      <h3 className="font-bold text-[#1A1A2E] mb-5 flex items-center gap-2">
        <span className="text-lg">💡</span> Financial Health Score
      </h3>

      {/* Circular Gauge */}
      <div className="flex flex-col items-center mb-6">
        <svg width="160" height="160" className="-rotate-90">
          {/* Background track */}
          <circle
            cx="80" cy="80" r={radius}
            fill="none"
            stroke="#F3F4F6"
            strokeWidth="12"
          />
          {/* Animated progress arc */}
          <circle
            cx="80" cy="80" r={radius}
            fill="none"
            stroke={color.stroke}
            strokeWidth="12"
            strokeLinecap="round"
            strokeDasharray={circumference}
            strokeDashoffset={progress}
            style={{ transition: 'stroke-dashoffset 0.05s linear' }}
          />
        </svg>
        {/* Score number in centre */}
        <div className="-mt-[100px] flex flex-col items-center mb-4">
          <span className={`text-4xl font-black ${color.text}`}>{animated}</span>
          <span className="text-xs text-gray-400 font-medium">/ 100</span>
        </div>
        <div className="mt-4">
          <span className={`text-sm font-bold px-3 py-1 rounded-full ${
            score >= 75 ? 'bg-green-100 text-green-700' :
            score >= 50 ? 'bg-amber-100 text-amber-700' :
            'bg-red-100 text-red-700'
          }`}>
            {color.label}
          </span>
        </div>
      </div>

      {/* Summary */}
      {data?.summary && (
        <p className="text-sm text-gray-600 text-center mb-4 leading-relaxed">{data.summary}</p>
      )}

      {/* Observations */}
      {data?.observations && data.observations.length > 0 && (
        <div className="space-y-2 border-t pt-4 mt-2">
          {data.observations.slice(0, 3).map((obs, i) => (
            <div key={i} className="flex gap-2 text-xs text-gray-600">
              <span className={`mt-0.5 shrink-0 ${color.text}`}>●</span>
              <span>{renderObservationText(obs)}</span>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
