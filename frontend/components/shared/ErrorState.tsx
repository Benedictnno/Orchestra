interface ErrorStateProps {
  title?: string
  description?: string
  onRetry?: () => void
}

export default function ErrorState({
  title = 'Something went wrong',
  description = 'An error occurred. Please try again.',
  onRetry,
}: ErrorStateProps) {
  return (
    <div className="text-center py-16 px-4">
      <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4 text-2xl">
        ⚠️
      </div>
      <h3 className="font-bold text-[#4A90e2] text-lg mb-2">{title}</h3>
      <p className="text-gray-500 text-sm mb-6 max-w-xs mx-auto">{description}</p>
      {onRetry && (
        <button
          onClick={onRetry}
          className="bg-[#E94560] text-white px-6 py-2.5 rounded-xl text-sm font-medium hover:bg-[#d63850] transition"
        >
          Try Again
        </button>
      )}
    </div>
  )
}
