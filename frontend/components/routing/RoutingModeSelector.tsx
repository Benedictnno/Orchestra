'use client'
import { Target, Scale, Zap, Check } from 'lucide-react'
import { cn } from '@/utils/cn'

interface RoutingMode {
  value: string
  label: string
  desc: string
  icon: React.ElementType
}

const MODES: RoutingMode[] = [
  { value: 'auto-split', label: 'Sequential Auto-Split', desc: 'Drains priority cards sequentially until the exact transaction is covered', icon: Zap },
  { value: 'primary',    label: 'Primary Card First',    desc: 'Charges designated default card, falling back to next available only if declined', icon: Target },
  { value: 'balanced',   label: 'Balanced Proportion',   desc: 'Distributes transaction weight evenly across all active linked balances', icon: Scale },
]

interface RoutingModeSelectorProps {
  selected: string
  onChange: (mode: string) => void
  onSave?: (mode: string) => void
}

export default function RoutingModeSelector({ selected, onChange, onSave }: RoutingModeSelectorProps) {
  return (
    <div className="space-y-2.5">
      {MODES.map(({ value, label, desc, icon: Icon }) => {
        const isSelected = selected === value
        return (
          <button
            key={value}
            type="button"
            onClick={() => { onChange(value); onSave?.(value) }}
            className={cn(
              'w-full text-left rounded-xl border p-3.5 sm:p-4 transition-all duration-150 relative flex items-start gap-3.5',
              isSelected
                ? 'border-slate-900 bg-slate-50/80 shadow-xs ring-1 ring-slate-900'
                : 'border-slate-200 hover:border-slate-300 hover:bg-slate-50/40'
            )}
          >
            <div className={cn(
              'p-2 rounded-lg shrink-0 mt-0.5',
              isSelected ? 'bg-slate-900 text-white' : 'bg-slate-100 text-slate-600'
            )}>
              <Icon size={16} />
            </div>

            <div className="flex-1 min-w-0 pr-2">
              <div className="flex items-center gap-2 mb-0.5">
                <p className={cn('font-semibold text-xs sm:text-sm', isSelected ? 'text-slate-900' : 'text-slate-800')}>
                  {label}
                </p>
                {isSelected && (
                  <span className="px-1.5 py-0.5 rounded bg-slate-200 text-slate-800 text-[10px] font-semibold">
                    Active
                  </span>
                )}
              </div>
              <p className="text-[11px] text-slate-500 leading-relaxed">{desc}</p>
            </div>

            <div className={cn(
              'w-4 h-4 rounded-full flex items-center justify-center shrink-0 mt-1 transition-all',
              isSelected ? 'bg-slate-900 text-white' : 'border border-slate-300'
            )}>
              {isSelected && <Check size={10} strokeWidth={3} />}
            </div>
          </button>
        )
      })}
    </div>
  )
}
