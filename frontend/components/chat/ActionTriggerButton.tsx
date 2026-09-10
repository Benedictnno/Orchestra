'use client'
import { ActionWorkflow } from '@/types/artifact'
import { ArrowRight, Shield, Filter, TrendingUp, CreditCard, Vault } from 'lucide-react'
import toast from 'react-hot-toast'

interface ActionTriggerButtonProps {
  actions: ActionWorkflow[]
}

const ACTION_ICONS: Record<string, React.ReactNode> = {
  set_guardrail:       <Shield size={12} />,
  filter_transactions: <Filter size={12} />,
  run_forecast:        <TrendingUp size={12} />,
  route_card:          <CreditCard size={12} />,
  activate_vault:      <Vault size={12} />,
}

function handleAction(action: ActionWorkflow) {
  switch (action.action_id) {
    case 'set_guardrail':
      toast.success(`Spend guardrail activated: ${action.payload?.category ? String(action.payload.category) : 'Active'}`)
      break
    case 'filter_transactions':
      toast(`Filtering transactions…`)
      break
    case 'run_forecast':
      toast(`Generating 90-day forecast…`)
      break
    case 'route_card':
      toast(`Smart routing rule updated`)
      break
    case 'activate_vault':
      toast(`Treasury Vault deposit queued`)
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
          className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-900 hover:bg-slate-800 text-white text-xs font-medium transition-colors shadow-sm"
        >
          {ACTION_ICONS[action.action_id] ?? <ArrowRight size={12} />}
          <span>{action.label}</span>
        </button>
      ))}

      {secondary.map((action) => (
        <button
          key={action.action_id}
          onClick={() => handleAction(action)}
          className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-white hover:bg-slate-50 border border-slate-200 text-slate-700 text-xs font-medium transition-colors shadow-sm"
        >
          {ACTION_ICONS[action.action_id] ?? <ArrowRight size={12} />}
          <span>{action.label}</span>
        </button>
      ))}
    </div>
  )
}

