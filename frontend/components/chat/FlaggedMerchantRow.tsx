'use client'
import { FlaggedMerchant } from '@/types/artifact'
import { fmtNGN } from './artifact-utils'
import { AlertTriangle } from 'lucide-react'

interface FlaggedMerchantRowProps {
  merchants: FlaggedMerchant[]
}

export function FlaggedMerchantRows({ merchants }: FlaggedMerchantRowProps) {
  if (merchants.length === 0) return null

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between text-xs">
        <div className="flex items-center gap-1.5 font-medium text-slate-900">
          <AlertTriangle size={13} className="text-amber-500" />
          <span>Notable & Flagged Transactions</span>
        </div>
        <span className="text-[10px] text-slate-400 font-mono">{merchants.length} flagged</span>
      </div>

      <div className="space-y-1.5">
        {merchants.map((m) => (
          <div
            key={m.id}
            className="flex items-center justify-between gap-3 px-3 py-2 rounded-lg bg-slate-50 border border-slate-200/70 hover:bg-slate-100/60 transition-colors"
          >
            <div className="flex items-center gap-2.5 min-w-0">
              {/* Merchant avatar */}
              <div className="w-6 h-6 rounded bg-white border border-slate-200 flex items-center justify-center shrink-0 text-[10px] font-mono font-bold text-slate-700">
                {m.name.charAt(0).toUpperCase()}
              </div>
              <div className="min-w-0">
                <p className="text-xs font-medium text-slate-900 truncate">{m.name}</p>
                <p className="text-[10px] text-slate-400 font-mono">{m.date}</p>
              </div>
            </div>

            <div className="flex items-center gap-2 shrink-0">
              <span className="text-[10px] px-1.5 py-0.5 rounded bg-white border border-slate-200 text-slate-600 capitalize font-mono">
                {m.category}
              </span>
              <span className="text-xs font-semibold font-mono tabular-nums text-slate-900">
                {fmtNGN(m.amount)}
              </span>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

