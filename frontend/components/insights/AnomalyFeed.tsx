'use client'
import { useEffect, useState } from 'react'
import { fetchWithAuth } from '@/lib/fetch-utils'

interface Anomaly {
  merchant: string
  anomalyReason: string
  severity: 'high' | 'medium' | 'low'
  date?: string
  amount?: number
}

export default function AnomalyFeed() {
  const [anomalies, setAnomalies] = useState<Anomaly[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchWithAuth('/api/anomalies')
      .then(r => r.json())
      .then(d => { setAnomalies(Array.isArray(d?.anomalies) ? d.anomalies : []); setLoading(false) })
      .catch(() => setLoading(false))
  }, [])

  if (loading) return (
    <div className="animate-pulse space-y-3">
      {[1,2,3].map(i => <div key={i} className="h-16 bg-gray-100 rounded-xl" />)}
    </div>
  )

  if (anomalies.length === 0) return (
    <div className="text-center py-6 text-gray-400 text-xs font-medium">
      No recent anomalies detected
    </div>
  )

  return (
    <div className="space-y-3">
      {anomalies.map((a, i) => (
        <div key={i} className="bg-red-50 border border-red-100 rounded-xl p-4 flex gap-4">
          <div className="w-10 h-10 rounded-full bg-red-100 flex items-center justify-center text-red-600 font-bold shrink-0">
            ⚠
          </div>
          <div className="min-w-0 flex-1">
            <div className="flex justify-between items-start mb-1 gap-2">
              <h4 className="font-bold text-red-900 text-sm truncate">{a.merchant}</h4>
              <span className={`text-[10px] px-2 py-0.5 rounded-full font-bold uppercase shrink-0 ${
                a.severity === 'high' ? 'bg-red-200 text-red-800' : 'bg-amber-200 text-amber-800'
              }`}>
                {a.severity}
              </span>
            </div>
            <p className="text-red-700 text-xs leading-relaxed">{a.anomalyReason}</p>
          </div>
        </div>
      ))}
    </div>
  )
}
