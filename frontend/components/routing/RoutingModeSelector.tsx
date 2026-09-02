'use client'

interface RoutingMode {
  value: string
  label: string
  desc: string
  emoji: string
}

const MODES: RoutingMode[] = [
  { value: 'primary',    label: 'Primary Card First',  desc: 'Uses your main card, falls back if needed',    emoji: '🎯' },
  { value: 'balanced',   label: 'Balanced Split',       desc: 'Divides equally across all active cards',       emoji: '⚖️' },
  { value: 'auto-split', label: 'Auto-Split',           desc: 'Drains cards sequentially until fully covered', emoji: '⚡' },
]

interface RoutingModeSelectorProps {
  selected: string
  onChange: (mode: string) => void
  onSave?: (mode: string) => void
}

export default function RoutingModeSelector({ selected, onChange, onSave }: RoutingModeSelectorProps) {
  return (
    <div className="space-y-3">
      {MODES.map(m => (
        <button
          key={m.value}
          onClick={() => { onChange(m.value); onSave?.(m.value) }}
          className={`w-full text-left rounded-xl border-2 p-4 transition-all duration-200 ${
            selected === m.value
              ? 'border-[#E94560] bg-[#E94560]/5'
              : 'border-gray-200 hover:border-[#E94560]/40'
          }`}
        >
          <div className="flex items-center gap-3">
            <span className="text-xl">{m.emoji}</span>
            <div className="flex-1">
              <p className={`font-semibold text-sm ${selected === m.value ? 'text-[#E94560]' : 'text-[#4A90e2]'}`}>
                {m.label}
              </p>
              <p className="text-xs text-gray-500 mt-0.5">{m.desc}</p>
            </div>
            <div className={`w-4 h-4 rounded-full border-2 flex-shrink-0 transition ${
              selected === m.value ? 'border-[#E94560] bg-[#E94560]' : 'border-gray-300'
            }`} />
          </div>
        </button>
      ))}
    </div>
  )
}
