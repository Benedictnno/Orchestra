'use client'
import { FlaggedMerchant } from '@/types/artifact'
import { fmtNGN } from './artifact-utils'
import { AlertTriangle, ArrowUpRight } from 'lucide-react'

interface FlaggedMerchantRowProps {
  merchants: FlaggedMerchant[]
}

export function FlaggedMerchantRows({ merchants }: FlaggedMerchantRowProps) {
  if (merchants.length === 0) return null

  return (
    <div className="space-y-2.5">
      <div className="flex items-center justify-between text-xs">
        <div className="flex items-center gap-1.5 font-bold text-foreground">
          <AlertTriangle size={13} className="text-amber-500" />
          <span>Notable & Flagged Transactions</span>
        </div>
        <span className="text-[10px] text-muted-foreground">{merchants.length} flagged</span>
      </div>

      <div className="space-y-1.5">
        {merchants.map((m) => (
          <div
            key={m.id}
            className="flex items-center justify-between gap-3 px-3.5 py-2.5 rounded-2xl bg-muted/30 border border-border/50 hover:bg-muted/60 transition-colors group"
          >
            <div className="flex items-center gap-3 min-w-0">
              {/* Merchant avatar */}
              <div className="w-8 h-8 rounded-xl bg-card border border-border flex items-center justify-center shrink-0 text-xs font-black text-[#4A90e2] shadow-sm">
                {m.name.charAt(0).toUpperCase()}
              </div>
              <div className="min-w-0">
                <p className="text-xs font-bold text-foreground truncate group-hover:text-[#4A90e2] transition-colors">{m.name}</p>
                <p className="text-[10px] text-muted-foreground">{m.date}</p>
              </div>
            </div>

            <div className="flex items-center gap-2.5 shrink-0">
              <span className="text-[10px] px-2 py-0.5 rounded-full bg-card border border-border/60 text-muted-foreground capitalize font-semibold">
                {m.category}
              </span>
              <span className="text-xs font-black text-rose-600 dark:text-rose-400 tabular-nums">
                {fmtNGN(m.amount)}
              </span>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
