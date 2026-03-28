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
    <div className="bg-white rounded-xl border border-stone-200 hover:border-stone-300 hover:shadow-sm p-4 flex flex-col gap-3 transition-all duration-200">
      <div className="flex items-center justify-between">
        <h3 className="text-base font-semibold text-stone-900">Batch #{number}</h3>
        <BatchStatusBadge status={status} />
      </div>

      <div className="text-sm text-stone-500">
        <span className="font-medium text-stone-700">Strains:</span>{' '}
        {strains.length > 0 ? strains.join(', ') : 'None'}
      </div>

      <div className="text-sm text-stone-500">
        <span className="font-medium text-stone-700">Days:</span> {dayCount}
      </div>

      <div className="pt-2 border-t border-stone-100">
        <Link
          href={`/batches/${id}`}
          className="text-sm font-semibold text-emerald-600 hover:text-emerald-700 transition-colors"
        >
          View batch →
        </Link>
      </div>
    </div>
  )
}
