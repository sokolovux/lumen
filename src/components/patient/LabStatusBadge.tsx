import type { LabStatus } from '@/state/types'
import { useAppState } from '@/state/AppStateContext'
import { Badge } from '@/components/ui/badge'
import { getLabStatusLabel } from '@/lib/statusDerivation'

export function LabStatusBadge({
  status,
  surface = 'labs',
}: {
  status: LabStatus
  /** `labs` = physician pending/denied show as Unreleased; `requests` = true outcome labels */
  surface?: 'labs' | 'requests'
}) {
  const { state } = useAppState()
  const physicianChartLocked =
    surface === 'labs' && state.role === 'physician'

  const colorClass = (() => {
    switch (status) {
      case 'requested':
      case 'granted_unstarted':
        return 'border-blue-200 bg-blue-50 text-blue-700'
      case 'active':
        return 'border-blue-200 bg-blue-50 text-blue-700'
      case 'expired':
        return 'text-muted-foreground'
      case 'denied':
        return physicianChartLocked
          ? ''
          : 'border-destructive/30 bg-destructive/10 text-destructive'
      case 'released':
        return 'border-green-200 bg-green-50 text-green-700'
      default:
        return ''
    }
  })()

  return (
    <Badge variant="outline" className={colorClass}>
      {getLabStatusLabel(status, state.role, surface)}
    </Badge>
  )
}
