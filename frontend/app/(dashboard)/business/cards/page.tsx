'use client'
import { useState } from 'react'
import ModernBusinessCard from '@/components/business/ModernBusinessCard'
import CreateBusinessCardModal from '@/components/business/CreateBusinessCardModal'
import LoadingSpinner from '@/components/shared/LoadingSpinner'
import EmptyState from '@/components/shared/EmptyState'
import { Plus, Briefcase, Search } from 'lucide-react'
import { useBusinessCards } from '@/hooks/useBusiness'
import { BusinessCard } from '@/api-client/types'

export default function BusinessCardsPage() {
  const { data, isLoading: loading } = useBusinessCards()

  const [modalOpen, setModalOpen] = useState(false)
  const [searchQuery, setSearchQuery] = useState('')
  const [statusFilter, setStatusFilter] = useState<'all' | 'active' | 'suspended'>('all')
  const [departmentFilter, setDepartmentFilter] = useState('all')

  const cards: BusinessCard[] = data?.cards || []
  const activeCount = cards.filter(c => c.status === 'active').length

  // Departments list for filter
  const departments = Array.from(new Set(cards.map(c => c.department || 'General').filter(Boolean)))

  // Filter cards
  const filteredCards = cards.filter(card => {
    const q = searchQuery.toLowerCase()
    const matchesSearch =
      (card.label?.toLowerCase() || '').includes(q) ||
      (card.purpose?.toLowerCase() || '').includes(q) ||
      (card.assignedTo?.toLowerCase() || '').includes(q) ||
      (card.department?.toLowerCase() || '').includes(q)

    const matchesStatus = statusFilter === 'all' ? true : card.status === statusFilter

    const matchesDept = departmentFilter === 'all' ? true : (card.department || 'General') === departmentFilter

    return matchesSearch && matchesStatus && matchesDept
  })

  return (
    <div className="max-w-6xl mx-auto space-y-5 sm:space-y-6">
      {/* Header Section */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-semibold tracking-tight text-slate-900">Business Cards</h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-0.5">
            {cards.length} cards issued · {activeCount} active. Create and manage corporate expense cards for your team.
          </p>
        </div>
        <button
          onClick={() => setModalOpen(true)}
          className="inline-flex items-center justify-center gap-1.5 px-3 py-2 sm:py-1.5 bg-slate-900 hover:bg-slate-800 text-white text-xs font-medium rounded-lg shadow-xs transition-colors self-start md:self-auto"
        >
          <Plus size={13} />
          <span>Issue Business Card</span>
        </button>
      </div>

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
            onChange={e => setStatusFilter(e.target.value as 'all' | 'active' | 'suspended')}
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

      {loading ? (
        <div className="py-16"><LoadingSpinner /></div>
      ) : filteredCards.length === 0 ? (
        <EmptyState
          title="No business cards found"
          description={cards.length === 0
            ? 'Issue corporate expense cards to your team with customizable department budgets and approval policies.'
            : 'No business cards matched your search and filter criteria.'}
          action={{
            label: 'Issue Business Card',
            icon: <Briefcase size={14} />,
            onClick: () => setModalOpen(true),
          }}
        />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredCards.map(card => (
            <ModernBusinessCard key={card._id} card={card} />
          ))}
        </div>
      )}

      <CreateBusinessCardModal open={modalOpen} onClose={() => setModalOpen(false)} />
    </div>
  )
}
