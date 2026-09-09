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
  Filter,
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
    <div className="max-w-6xl mx-auto space-y-8 pb-12">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-extrabold text-[#4A90e2] tracking-tight">Business Cards & Expense OS</h1>
          <p className="text-gray-500 font-medium text-sm mt-1">
            Manage corporate team cards, budget controls, and automated transaction approval workflows.
          </p>
        </div>
        <button 
          onClick={() => setModalOpen(true)}
          className="self-start sm:self-auto flex items-center gap-2 bg-[#E94560] hover:bg-[#d63850] text-white px-5 py-3 rounded-2xl text-sm font-bold transition shadow-lg shadow-[#E94560]/20 hover:scale-[1.02] active:scale-[0.98]"
        >
          <Plus size={18} /> Issue Business Card
        </button>
      </div>

      {/* KPI Overview Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Total Corporate Budget */}
        <div className="bg-white rounded-3xl border border-gray-100 p-5 shadow-sm">
          <div className="flex items-center justify-between text-gray-400 mb-2">
            <span className="text-xs font-bold uppercase tracking-wider">Total Corporate Budget</span>
            <div className="w-8 h-8 rounded-xl bg-blue-50 text-[#4A90e2] flex items-center justify-center">
              <Briefcase size={16} />
            </div>
          </div>
          <p className="text-2xl font-black text-[#4A90e2] tracking-tight">{toNaira(totalBudget)}</p>
          <p className="text-[11px] text-gray-400 mt-1 font-medium">Allocated across {cards.length} cardholders</p>
        </div>

        {/* Total Spent */}
        <div className="bg-white rounded-3xl border border-gray-100 p-5 shadow-sm">
          <div className="flex items-center justify-between text-gray-400 mb-2">
            <span className="text-xs font-bold uppercase tracking-wider">Total Spend</span>
            <div className="w-8 h-8 rounded-xl bg-rose-50 text-[#E94560] flex items-center justify-center">
              <TrendingUp size={16} />
            </div>
          </div>
          <p className="text-2xl font-black text-[#E94560] tracking-tight">{toNaira(totalSpent)}</p>
          <div className="flex items-center gap-2 mt-1.5">
            <div className="flex-1 h-1.5 bg-gray-100 rounded-full overflow-hidden">
              <div 
                className="h-full bg-[#E94560] rounded-full" 
                style={{ width: `${totalUtilization}%` }}
              />
            </div>
            <span className="text-[10px] font-bold text-gray-500">{totalUtilization}%</span>
          </div>
        </div>

        {/* Active Cards */}
        <div className="bg-white rounded-3xl border border-gray-100 p-5 shadow-sm">
          <div className="flex items-center justify-between text-gray-400 mb-2">
            <span className="text-xs font-bold uppercase tracking-wider">Active Cards</span>
            <div className="w-8 h-8 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center">
              <CreditCard size={16} />
            </div>
          </div>
          <p className="text-2xl font-black text-gray-900 tracking-tight">{activeCount} / {cards.length}</p>
          <p className="text-[11px] text-emerald-600 font-semibold mt-1 flex items-center gap-1">
            <CheckCircle2 size={12} /> {cards.length - activeCount} suspended
          </p>
        </div>

        {/* Pending Approvals */}
        <div className="bg-white rounded-3xl border border-gray-100 p-5 shadow-sm">
          <div className="flex items-center justify-between text-gray-400 mb-2">
            <span className="text-xs font-bold uppercase tracking-wider">Pending Approvals</span>
            <div className="w-8 h-8 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center">
              <Clock size={16} />
            </div>
          </div>
          <p className="text-2xl font-black text-amber-600 tracking-tight">{requests.length}</p>
          <p className="text-[11px] text-gray-400 mt-1 font-medium">Awaiting manager sign-off</p>
        </div>
      </div>

      {loading && <div className="py-16"><LoadingSpinner /></div>}

      {!loading && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Cards Section */}
          <div className="lg:col-span-2 space-y-6">
            {/* Search and Filters Bar */}
            <div className="flex flex-col sm:flex-row gap-3">
              <div className="relative flex-1">
                <Search size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search cards by label, employee, department..."
                  value={searchQuery}
                  onChange={e => setSearchQuery(e.target.value)}
                  className="w-full bg-white border border-gray-200 rounded-2xl pl-11 pr-4 py-2.5 text-xs font-medium focus:outline-none focus:ring-2 focus:ring-[#4A90e2]/20 focus:border-[#4A90e2] transition"
                />
              </div>

              <div className="flex gap-2">
                <select
                  value={statusFilter}
                  onChange={e => setStatusFilter(e.target.value as any)}
                  className="bg-white border border-gray-200 rounded-2xl px-3.5 py-2.5 text-xs font-bold text-gray-700 focus:outline-none focus:ring-2 focus:ring-[#4A90e2]/20"
                >
                  <option value="all">All Statuses</option>
                  <option value="active">Active Only</option>
                  <option value="suspended">Suspended</option>
                </select>

                {departments.length > 0 && (
                  <select
                    value={departmentFilter}
                    onChange={e => setDepartmentFilter(e.target.value)}
                    className="bg-white border border-gray-200 rounded-2xl px-3.5 py-2.5 text-xs font-bold text-gray-700 focus:outline-none focus:ring-2 focus:ring-[#4A90e2]/20"
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
                  icon: <Briefcase size={18} />, 
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
            <div className="bg-white rounded-3xl border border-gray-100 p-5 sm:p-6 shadow-sm">
              <div className="flex items-center justify-between mb-4 pb-3 border-b border-gray-100">
                <div className="flex items-center gap-2">
                  <h2 className="font-extrabold text-[#4A90e2] text-base">Approval Queue</h2>
                  <span className="text-[10px] bg-blue-50 text-blue-700 font-bold px-2 py-0.5 rounded-full">
                    Policy Engine
                  </span>
                </div>
                {requests.length > 0 && (
                  <span className="bg-amber-100 text-amber-800 text-xs px-2.5 py-0.5 rounded-full font-bold">
                    {requests.length} pending
                  </span>
                )}
              </div>
              <ApprovalQueue requests={requests} onApprove={handleApprove} onReject={handleReject} />
            </div>

            {/* Quick Tips / Policies Card */}
            <div className="bg-gradient-to-br from-[#1E2235] to-[#121524] rounded-3xl p-5 text-white shadow-sm space-y-3">
              <div className="flex items-center gap-2 text-blue-400">
                <ShieldCheck size={18} />
                <h3 className="font-bold text-xs uppercase tracking-wider text-white">Expense Policy Engine</h3>
              </div>
              <p className="text-xs text-gray-300 leading-relaxed">
                Transactions violating department merchant categories or exceeding configured approval limits are automatically held in this queue for admin review before settlement.
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
