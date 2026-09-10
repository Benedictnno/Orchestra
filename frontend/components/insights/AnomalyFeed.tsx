'use client'
import { useEffect, useState } from 'react'
import { fetchWithAuth } from '@/lib/fetch-utils'
import { AlertTriangle } from 'lucide-react'

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
    <div className="animate-pulse space-y-2.5">
      {[1,2,3].map(i => <div key={i} className="h-14 bg-slate-100 rounded-lg" />)}
    </div>
  )

  if (anomalies.length === 0) return (
    <div className="text-center py-6 text-slate-400 text-xs">
      No anomalous transactions detected
    </div>
  )

  return (
    <div className="space-y-2">
      {anomalies.map((a, i) => (
        <div key={i} className="bg-slate-50 border border-slate-200/80 rounded-lg p-3 flex gap-3 transition-colors hover:bg-slate-100/50">
          <div className="w-7 h-7 rounded bg-amber-50 border border-amber-200/60 flex items-center justify-center text-amber-700 shrink-0 mt-0.5">
            <AlertTriangle size={13} />
          </div>
          <div className="min-w-0 flex-1">
            <div className="flex justify-between items-start mb-0.5 gap-2">
              <h4 className="font-semibold text-slate-900 text-xs truncate">{a.merchant}</h4>
              <span className={`text-[9px] px-1.5 py-0.5 rounded font-medium uppercase font-mono shrink-0 ${
                a.severity === 'high' 
                  ? 'bg-rose-50 text-rose-700 border border-rose-200/60' 
                  : 'bg-amber-50 text-amber-700 border border-amber-200/60'
              }`}>
                {a.severity}
              </span>
            </div>
            <p className="text-slate-600 text-[11px] leading-relaxed">{a.anomalyReason}</p>
          </div>
        </div>
      ))}
    </div>
  )
}

