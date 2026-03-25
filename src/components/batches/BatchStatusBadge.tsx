import { BatchStatus } from '@prisma/client'

interface BatchStatusBadgeProps {
  status: BatchStatus
}

const statusConfig: Record<BatchStatus, { className: string; label: string }> = {
  ACTIVE: {
    className: 'bg-green-100 text-green-800 text-xs font-medium px-2 py-0.5 rounded-full',
    label: 'Active',
  },
  INACTIVE: {
    className: 'bg-yellow-100 text-yellow-800 text-xs font-medium px-2 py-0.5 rounded-full',
    label: 'Inactive',
  },
  COMPLETED: {
    className: 'bg-gray-100 text-gray-500 text-xs font-medium px-2 py-0.5 rounded-full',
    label: 'Completed',
  },
}

export function BatchStatusBadge({ status }: BatchStatusBadgeProps) {
  const { className, label } = statusConfig[status]
  return <span className={className}>{label}</span>
}
