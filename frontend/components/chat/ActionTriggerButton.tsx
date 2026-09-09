'use client'
import { ActionWorkflow } from '@/types/artifact'
import { ArrowRight, Shield, Filter, TrendingUp, CreditCard, Vault, CheckCircle2 } from 'lucide-react'
import toast from 'react-hot-toast'

interface ActionTriggerButtonProps {
  actions: ActionWorkflow[]
}

const ACTION_ICONS: Record<string, React.ReactNode> = {
  set_guardrail:       <Shield size={13} />,
  filter_transactions: <Filter size={13} />,
  run_forecast:        <TrendingUp size={13} />,
  route_card:          <CreditCard size={13} />,
  activate_vault:      <Vault size={13} />,
}

function handleAction(action: ActionWorkflow) {
  // Stub dispatcher — wires to platform endpoints in a future sprint
  switch (action.action_id) {
    case 'set_guardrail':
      toast.success(`Spend guardrail activated: ${action.payload?.category ? String(action.payload.category) : 'Active'}`, { icon: '🛡️' })
      break
    case 'filter_transactions':
      toast(`Filtering transactions…`, { icon: '🔍' })
      break
    case 'run_forecast':
      toast(`Generating 90-day forecast…`, { icon: '📈' })
      break
    case 'route_card':
      toast(`Smart routing rule updated`, { icon: '💳' })
      break
    case 'activate_vault':
      toast(`Treasury Vault deposit queued`, { icon: '🏦' })
      break
    default:
      toast(action.label)
  }
}

export function ActionTriggerButtons({ actions }: ActionTriggerButtonProps) {
  if (actions.length === 0) return null

  const primary   = actions.filter(a => a.style === 'primary')
  const secondary = actions.filter(a => a.style === 'secondary')

  return (
    <div className="flex flex-wrap gap-2 pt-1">
      {primary.map((action) => (
        <button
          key={action.action_id}
          onClick={() => handleAction(action)}
          className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-[#4A90e2] hover:bg-[#3B78C4] text-white text-xs font-bold transition-all shadow-sm hover:shadow active:scale-95"
        >
          {ACTION_ICONS[action.action_id] ?? <ArrowRight size={13} />}
          <span>{action.label}</span>
        </button>
      ))}

      {secondary.map((action) => (
        <button
          key={action.action_id}
          onClick={() => handleAction(action)}
          className="inline-flex items-center gap-2 px-3.5 py-2.5 rounded-xl bg-card hover:bg-muted/80 border border-border text-foreground text-xs font-semibold transition-all hover:border-border/80 active:scale-95 shadow-sm"
        >
          {ACTION_ICONS[action.action_id] ?? <ArrowRight size={13} />}
          <span>{action.label}</span>
        </button>
      ))}
    </div>
  )
}
