import { Badge } from '@/components/ui/badge'
import { formatCountdownHms } from '@/lib/statusDerivation'

interface AccessTimerProps {
  expiresAt: number
  now?: number
}

/** Neutral mono countdown for active temporary access on result cards. */
export function AccessTimer({ expiresAt, now = Date.now() }: AccessTimerProps) {
  return (
    <span data-slot="access-timer">
      <Badge variant="outline">{formatCountdownHms(expiresAt, now)}</Badge>
    </span>
  )
}
