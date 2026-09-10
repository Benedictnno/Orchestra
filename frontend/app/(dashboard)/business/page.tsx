'use client'
import { useState } from 'react'
import ApprovalQueue from '@/components/business/ApprovalQueue'
import ModernBusinessCard from '@/components/business/ModernBusinessCard'
import CreateBusinessCardModal from '@/components/business/CreateBusinessCardModal'
import LoadingSpinner from '@/components/shared/LoadingSpinner'
import EmptyState from '@/components/shared/EmptyState'
import toast from 'react-hot-toast'
import { 
  Plus, 
  Briefcase, 
  ShieldCheck, 
  CreditCard, 
  TrendingUp, 
  Search, 
  CheckCircle2,
  Clock
} from 'lucide-react'
import { toNaira } from '@/utils/format'
import { useBusinessCards, useApproveExpense } from '@/hooks/useBusiness'
import { BusinessCard, ApprovalRequest } from '@/api-client/types'

export default function BusinessPage() {
  const { data, isLoading: loading } = useBusinessCards()
  const { mutate: approveExpenseMutation } = useApproveExpense()
  
  const [modalOpen, setModalOpen] = useState(false)
  const [searchQuery, setSearchQuery] = useState('')
  const [statusFilter, setStatusFilter] = useState<'all' | 'active' | 'suspended'>('all')
  const [departmentFilter, setDepartmentFilter] = useState('all')

  const cards: BusinessCard[] = data?.cards || []
  const requests: ApprovalRequest[] = data?.pendingActions || []

  function handleApprove(id: string, note?: string) {
    approveExpenseMutation(
      { requestId: id, action: 'approve', note },
      {
        onSuccess: () => toast.success('Expense request approved and settled'),
        onError: () => toast.error('Failed to approve request'),
      }
    )
  }

  function handleReject(id: string, note?: string) {
    approveExpenseMutation(
      { requestId: id, action: 'reject', note },
      {
        onSuccess: () => toast.success('Expense request rejected'),
        onError: () => toast.error('Failed to reject request'),
      }
    )
  }

  // Calculate high level KPIs
  const totalBudget = cards.reduce((acc, c) => acc + (c.budget || c.spendLimit || 0), 0)
  const totalSpent = cards.reduce((acc, c) => acc + (c.amountSpent || 0), 0)
  const activeCount = cards.filter(c => c.status === 'active').length
  const totalUtilization = totalBudget > 0 ? Math.min(100, Math.round((totalSpent / totalBudget) * 100)) : 0

  // Departments list for filter
  const departments = Array.from(new Set(cards.map(c => c.department || 'General').filter(Boolean)))

  // Filter cards
  const filteredCards = cards.filter(card => {
    const matchesSearch = 
      (card.label?.toLowerCase() || '').includes(searchQuery.toLowerCase()) ||
      (card.purpose?.toLowerCase() || '').includes(searchQuery.toLowerCase()) ||
      (card.assignedTo?.toLowerCase() || '').includes(searchQuery.toLowerCase()) ||
      (card.department?.toLowerCase() || '').includes(searchQuery.toLowerCase())

    const matchesStatus = 
      statusFilter === 'all' ? true : card.status === statusFilter

    const matchesDept = 
      departmentFilter === 'all' ? true : (card.department || 'General') === departmentFilter

    return matchesSearch && matchesStatus && matchesDept
  })

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-lg font-semibold text-slate-900 tracking-tight">Business Cards & Expense OS</h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Corporate team expense cards, budget allocation limits, and automated managerial approval workflows.
          </p>
        </div>
        <button 
          onClick={() => setModalOpen(true)}
          className="inline-flex items-center gap-1.5 rounded-lg bg-slate-900 px-3 py-1.5 text-xs font-medium text-white shadow-sm hover:bg-slate-800 transition-colors self-start sm:self-auto"
        >
          <Plus size={14} /> Issue Business Card
        </button>
      </div>

      {/* KPI Overview Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3.5">
        {/* Total Corporate Budget */}
        <div className="bg-white rounded-xl border border-slate-200/80 p-4 shadow-sm">
          <div className="flex items-center justify-between text-slate-500 mb-1.5">
            <span className="text-xs font-medium">Corporate Budget</span>
            <Briefcase size={14} className="text-slate-400" />
          </div>
          <p className="text-xl font-semibold font-mono tabular-nums text-slate-900 tracking-tight">{toNaira(totalBudget)}</p>
          <p className="text-[11px] text-slate-400 mt-1 font-mono">Allocated across {cards.length} cardholders</p>
        </div>

        {/* Total Spent */}
        <div className="bg-white rounded-xl border border-slate-200/80 p-4 shadow-sm">
          <div className="flex items-center justify-between text-slate-500 mb-1.5">
            <span className="text-xs font-medium">Total Spend</span>
            <TrendingUp size={14} className="text-slate-400" />
          </div>
          <p className="text-xl font-semibold font-mono tabular-nums text-slate-900 tracking-tight">{toNaira(totalSpent)}</p>
          <div className="flex items-center gap-2 mt-2">
            <div className="flex-1 h-1.5 bg-slate-100 rounded-full overflow-hidden">
              <div 
                className="h-full bg-slate-900 rounded-full" 
                style={{ width: `${totalUtilization}%` }}
              />
            </div>
            <span className="text-[11px] font-mono tabular-nums text-slate-500">{totalUtilization}%</span>
          </div>
        </div>

        {/* Active Cards */}
        <div className="bg-white rounded-xl border border-slate-200/80 p-4 shadow-sm">
          <div className="flex items-center justify-between text-slate-500 mb-1.5">
            <span className="text-xs font-medium">Active Cards</span>
            <CreditCard size={14} className="text-slate-400" />
          </div>
          <p className="text-xl font-semibold font-mono tabular-nums text-slate-900 tracking-tight">{activeCount} / {cards.length}</p>
          <p className="text-[11px] text-slate-400 mt-1 flex items-center gap-1 font-mono">
            <span className="inline-block w-1.5 h-1.5 rounded-full bg-emerald-500" /> {cards.length - activeCount} suspended
          </p>
        </div>

        {/* Pending Approvals */}
        <div className="bg-white rounded-xl border border-slate-200/80 p-4 shadow-sm">
          <div className="flex items-center justify-between text-slate-500 mb-1.5">
            <span className="text-xs font-medium">Pending Approvals</span>
            <Clock size={14} className="text-slate-400" />
          </div>
          <p className="text-xl font-semibold font-mono tabular-nums text-amber-600 tracking-tight">{requests.length}</p>
          <p className="text-[11px] text-slate-400 mt-1">Awaiting manager review</p>
        </div>
      </div>

      {loading && <div className="py-16"><LoadingSpinner /></div>}

      {!loading && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Main Cards Section */}
          <div className="lg:col-span-2 space-y-4">
            {/* Search and Filters Bar */}
            <div className="flex flex-col sm:flex-row gap-2.5">
              <div className="relative flex-1">
                <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                <input
                  type="text"
                  placeholder="Search cards by label, employee, department..."
                  value={searchQuery}
                  onChange={e => setSearchQuery(e.target.value)}
                  className="w-full rounded-lg border border-slate-200 bg-white pl-9 pr-3 py-1.5 text-xs text-slate-900 placeholder:text-slate-400 focus:border-slate-950 focus:outline-none focus:ring-1 focus:ring-slate-950"
                />
              </div>

              <div className="flex gap-2">
                <select
                  value={statusFilter}
                  onChange={e => setStatusFilter(e.target.value as any)}
                  className="rounded-lg border border-slate-200 bg-white px-2.5 py-1.5 text-xs text-slate-700 focus:border-slate-950 focus:outline-none focus:ring-1 focus:ring-slate-950"
                >
                  <option value="all">All Statuses</option>
                  <option value="active">Active</option>
                  <option value="suspended">Suspended</option>
                </select>

                {departments.length > 0 && (
                  <select
                    value={departmentFilter}
                    onChange={e => setDepartmentFilter(e.target.value)}
                    className="rounded-lg border border-slate-200 bg-white px-2.5 py-1.5 text-xs text-slate-700 focus:border-slate-950 focus:outline-none focus:ring-1 focus:ring-slate-950"
                  >
                    <option value="all">All Departments</option>
                    {departments.map(d => <option key={d} value={d}>{d}</option>)}
                  </select>
                )}
              </div>
            </div>

            {/* Business cards list */}
            {filteredCards.length === 0 ? (
              <EmptyState
                title="No business cards found"
                description={cards.length === 0 
                  ? "Issue corporate expense cards to your team with customizable department budgets and approval policies."
                  : "No business cards matched your search and filter criteria."}
                action={{ 
                  label: 'Issue Business Card', 
                  icon: <Briefcase size={14} />, 
                  onClick: () => setModalOpen(true) 
                }}
              />
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {filteredCards.map(card => (
                  <ModernBusinessCard key={card._id} card={card} />
                ))}
              </div>
            )}
          </div>

          {/* Approval queue sidebar */}
          <div className="space-y-4">
            <div className="bg-white rounded-xl border border-slate-200/80 p-5 shadow-sm">
              <div className="flex items-center justify-between mb-4 pb-3 border-b border-slate-100">
                <div className="flex items-center gap-2">
                  <h2 className="text-xs font-semibold text-slate-900">Approval Queue</h2>
                  <span className="text-[10px] bg-slate-100 text-slate-600 font-medium px-1.5 py-0.5 rounded">
                    Policy Engine
                  </span>
                </div>
                {requests.length > 0 && (
                  <span className="bg-amber-50 text-amber-800 text-[11px] px-2 py-0.5 rounded-full font-medium border border-amber-200/60">
                    {requests.length} pending
                  </span>
                )}
              </div>
              <ApprovalQueue requests={requests} onApprove={handleApprove} onReject={handleReject} />
            </div>

            {/* Policies Callout Card */}
            <div className="bg-slate-900 rounded-xl p-4 text-white shadow-sm space-y-2 border border-slate-800">
              <div className="flex items-center gap-1.5 text-slate-300">
                <ShieldCheck size={14} className="text-emerald-400" />
                <h3 className="text-xs font-semibold text-white">Expense Policy Engine</h3>
              </div>
              <p className="text-[11px] text-slate-400 leading-relaxed">
                Transactions violating department merchant categories or exceeding configured approval thresholds are held for admin sign-off before settlement.
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Create Card Modal */}
      <CreateBusinessCardModal
        open={modalOpen}
        onClose={() => setModalOpen(false)}
      />
    </div>
  )
}

