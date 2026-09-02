import React from 'react'

interface EmptyStateProps {
  title: string
  description: string
  action: {
    label: string
    icon: React.ReactNode
    onClick: () => void
  }
}

export default function EmptyState({ title, description, action }: EmptyStateProps) {
  return (
    <div className="text-center py-16 px-4">
      <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4 text-2xl">
        {action.icon}
      </div>
      <h3 className="font-bold text-[#4A90e2] text-lg mb-2">{title}</h3>
      <p className="text-gray-500 text-sm mb-6 max-w-xs mx-auto">{description}</p>
      <button onClick={action.onClick}
        className="bg-[#E94560] text-white px-6 py-2.5 rounded-xl text-sm font-medium hover:bg-[#d63850] transition">
        {action.label}
      </button>
    </div>
  )
}
