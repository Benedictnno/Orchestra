'use client'
import { useEffect, useState } from 'react'
import { fetchWithAuth } from '@/lib/fetch-utils'

interface Anomaly {
  merchant: string
  anomalyReason: string
  severity: 'high' | 'medium' | 'low'
}

export default function AnomalyBadge() {
  const [anomalies, setAnomalies] = useState<Anomaly[]>([])
  const [open, setOpen] = useState(false)

  useEffect(() => {
    fetchWithAuth('/api/anomalies')
      .then(r => r.json())
      .then(d => setAnomalies(d.anomalies || []))
      .catch(() => {})
  }, [])

  if (anomalies.length === 0) return null

  return (
    <>
      {/* <button
        onClick={() => setOpen(true)}
        className="relative flex items-center gap-2 bg-red-50 border border-red-200 text-red-600 px-3 py-1.5 rounded-full text-sm font-medium"
      >
        ⚠ {anomalies.length} suspicious transaction{anomalies.length > 1 ? 's' : ''}
        <span className="absolute -top-1 -right-1 w-3 h-3 bg-red-500 rounded-full animate-ping" />
      </button> */}

      {open && (
        <div
          className="fixed inset-0 bg-black/40 z-50 flex items-center justify-center p-4"
          onClick={() => setOpen(false)}
        >
          <div
            className="bg-white rounded-2xl p-6 max-w-sm w-full shadow-xl"
            onClick={e => e.stopPropagation()}
          >
            <h3 className="font-bold text-lg text-red-600 mb-4">Suspicious Activity</h3>
            {anomalies.map((a, i) => (
              <div key={i} className="border-b pb-3 mb-3 last:border-0">
                <p className="font-medium text-sm">{a.merchant}</p>
                <p className="text-gray-500 text-xs">{a.anomalyReason}</p>
                <p className="text-red-500 text-xs font-medium mt-1">
                  {a.severity === 'high' ? '🔴 High severity' : '🟡 Medium severity'}
                </p>
              </div>
            ))}
            <button
              onClick={() => setOpen(false)}
              className="mt-2 w-full py-2 rounded-xl bg-gray-100 text-gray-700 text-sm font-medium hover:bg-gray-200 transition"
            >
              Dismiss
            </button>
          </div>
        </div>
      )}
    </>
  )
}
