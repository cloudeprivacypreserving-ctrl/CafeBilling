interface SectionHeaderProps {
  title: string
  description?: string
  actionLabel?: string
  onActionClick?: () => void
}

export function SectionHeader({ title, description, actionLabel, onActionClick }: SectionHeaderProps) {
  return (
    <div className="mb-6 flex items-center justify-between">
      <div>
        <h2 className="text-2xl font-bold">{title}</h2>
        {description && <p className="mt-1 text-gray-600">{description}</p>}
      </div>
      {actionLabel && (
        <button
          onClick={onActionClick}
          className="text-sm font-medium text-pink-500 hover:text-pink-600"
        >
          {actionLabel}
        </button>
      )}
    </div>
  )
}