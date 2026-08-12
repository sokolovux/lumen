import { Badge } from '@/components/ui/badge'
import { formatCountdownHms } from '@/lib/statusDerivation'
import { formatEncounterElapsed } from '@/lib/visitLifecycle'

interface AccessTimerProps {
  expiresAt?: number
  startedAt?: number
  now?: number
}

/** Neutral mono timer for temporary access windows and active encounters. */
export function AccessTimer({ expiresAt, startedAt, now = Date.now() }: AccessTimerProps) {
  const label =
    startedAt != null
      ? formatEncounterElapsed(startedAt, now)
      : expiresAt != null
        ? `Expires in ${formatCountdownHms(expiresAt, now)}`
        : '0:00'

  return (
    <span data-slot="access-timer">
      <Badge variant="outline">{label}</Badge>
    </span>
  )
}
