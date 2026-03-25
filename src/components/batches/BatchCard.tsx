import Link from 'next/link'
import { BatchStatus } from '@prisma/client'
import { BatchStatusBadge } from './BatchStatusBadge'

interface BatchCardProps {
  id: string
  number: number
  status: BatchStatus
  strains: string[]
  dayCount: number
}

export function BatchCard({ id, number, status, strains, dayCount }: BatchCardProps) {
  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4 flex flex-col gap-3">
      <div className="flex items-center justify-between">
        <h3 className="text-base font-semibold text-gray-900">Batch #{number}</h3>
        <BatchStatusBadge status={status} />
      </div>

      <div className="text-sm text-gray-600">
        <span className="font-medium text-gray-700">Strains:</span>{' '}
        {strains.length > 0 ? strains.join(', ') : 'None'}
      </div>

      <div className="text-sm text-gray-600">
        <span className="font-medium text-gray-700">Days:</span> {dayCount}
      </div>

      <div className="pt-2 border-t border-gray-100 flex items-center gap-2">
        <Link
          href={`/batches/${id}`}
          className="bg-white hover:bg-gray-50 text-gray-700 border border-gray-300 font-semibold rounded-md px-4 py-2 min-h-[44px] inline-flex items-center text-sm transition-colors"
        >
          View Batch
        </Link>
      </div>
    </div>
  )
}
