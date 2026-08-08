import type { ScheduleStatus } from '@/state/types'
import { Badge } from '@/components/ui/badge'
import { cn } from '@/lib/utils'
import { getScheduleStatusLabel } from '@/lib/statusDerivation'

interface StatusPillProps {
  status: ScheduleStatus
  className?: string
}

export function StatusPill({ status, className }: StatusPillProps) {
  if (status === 'scheduled') return null

  const label = getScheduleStatusLabel(status)

  const variantClass = (() => {
    switch (status) {
      case 'with_pa':
        return 'border-emerald-200 bg-emerald-50 text-emerald-700 dark:border-emerald-800 dark:bg-emerald-950 dark:text-emerald-300'
      case 'with_physician':
        return 'border-blue-200 bg-blue-50 text-blue-700 dark:border-blue-800 dark:bg-blue-950 dark:text-blue-300'
      case 'finished':
        return 'border-green-200 bg-green-50 text-green-700 dark:border-green-800 dark:bg-green-950 dark:text-green-300'
      case 'late':
        return 'border-amber-200 bg-amber-50 text-amber-700 dark:border-amber-800 dark:bg-amber-950 dark:text-amber-300'
      default:
        return ''
    }
  })()

  return (
    <Badge
      variant="outline"
      className={cn(variantClass, className)}
    >
      {label}
    </Badge>
  )
}
