import type { Ref } from 'react'
import { ArrowRight, Check, Unlock, X } from 'lucide-react'
import type { LabResult } from '@/state/types'
import { useAppState } from '@/state/AppStateContext'
import { Card, CardContent, CardHeader } from '@/components/ui/card'
import { Badge, notificationBadgeClassName } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { DEMO_PA_NAME } from '@/lib/scheduleData'
import {
  formatCountdown,
  getActiveGrantBadgeLabel,
  getLabStatusLabel,
  getLabStatusTint,
} from '@/lib/statusDerivation'

export type RequestQueueCardMode =
  | 'physician-inbox'
  | 'physician-history'
  | 'pa-awaiting'
  | 'pa-resolved'

interface RequestQueueCardProps {
  lab: LabResult
  mode: RequestQueueCardMode
  isUnread?: boolean
  onGrant?: () => void
  onDeny?: () => void
  onRelease?: () => void
  onViewInChart?: () => void
  cardRef?: Ref<HTMLDivElement>
}

export function RequestQueueCard({
  lab,
  mode,
  isUnread = false,
  onGrant,
  onDeny,
  onRelease,
  onViewInChart,
  cardRef,
}: RequestQueueCardProps) {
  const { state } = useAppState()
  const now = Date.now()
  const isPhysician = state.role === 'physician'
  const isPa = state.role === 'pa'

  const statusBadgeLabel = (() => {
    if (mode === 'pa-awaiting') return 'Access pending'
    if (lab.status === 'granted_unstarted' && isPhysician) {
      return 'Granted — not yet started'
    }
    if (lab.status === 'active' && lab.grantExpiresAt && isPhysician) {
      return getActiveGrantBadgeLabel('physician', lab.grantExpiresAt, now)
    }
    return getLabStatusLabel(lab.status, state.role, 'requests')
  })()

  const statusBadge =
    mode === 'pa-awaiting' ? (
      <Badge variant="outline">{statusBadgeLabel}</Badge>
    ) : (
      <Badge
        variant="outline"
        className={getLabStatusTint(lab.status, state.role, 'requests')}
      >
        {statusBadgeLabel}
      </Badge>
    )

  // Outcome copy — skip when the badge already states the grant moment
  const outcomeLine = (() => {
    if (isPhysician && (lab.status === 'granted_unstarted' || lab.status === 'active')) {
      return null
    }
    if (mode === 'physician-history') {
      return (
        <p className="mt-1 text-xs font-medium">{physicianHistoryOutcomeLabel(lab)}</p>
      )
    }
    if (mode === 'pa-resolved') {
      if (lab.status === 'active') return null
      return (
        <p className="mt-1 text-xs font-medium">{paResolvedOutcomeLabel(lab)}</p>
      )
    }
    return null
  })()

  // PA resolved: Labs-style meta countdown (same expiresAt as the badge tick)
  const countdownLine =
    mode === 'pa-resolved'
    && isPa
    && lab.status === 'active'
    && lab.grantExpiresAt ? (
      <p className="mt-1 text-xs font-medium text-blue-700">
        Available for {formatCountdown(lab.grantExpiresAt, now)}
      </p>
    ) : null

  const showViewInChart =
    Boolean(onViewInChart)
    && (
      mode === 'physician-inbox'
      || mode === 'physician-history'
      || (
        mode === 'pa-resolved'
        && (
          lab.status === 'granted_unstarted'
          || lab.status === 'active'
          || lab.status === 'released'
        )
      )
    )

  const viewInChartButton = showViewInChart ? (
    <Button size="sm" variant="secondary" onClick={onViewInChart}>
      View in chart
      <ArrowRight className="size-3.5" />
    </Button>
  ) : null

  const denialBlock =
    mode === 'pa-resolved' && lab.status === 'denied' && lab.denialReason ? (
      <div className="rounded-lg border border-destructive/30 bg-destructive/10 px-3 py-2.5 text-destructive">
        <p className="text-sm font-medium">Request was denied.</p>
        <p className="mt-1 text-xs opacity-90">Comment from the doctor:</p>
        <p className="mt-0.5 text-sm">{lab.denialReason}</p>
      </div>
    ) : null

  return (
    <div ref={cardRef}>
      <Card>
        <CardHeader>
          <div className="flex flex-wrap items-center gap-1.5">
            {statusBadge}
            {isUnread && (
              <Badge variant="outline" className={notificationBadgeClassName}>
                New
              </Badge>
            )}
          </div>
          <div className="min-w-0">
            <p className="font-medium">{lab.name}</p>
            <p className="text-sm text-muted-foreground">
              Jordan Reyes · {lab.type} · Ordered {lab.orderDate}
            </p>
            {mode === 'pa-awaiting' && (
              <p className="mt-1 text-sm text-muted-foreground">
                Waiting for physician response
              </p>
            )}
            {outcomeLine}
            {countdownLine}
            {mode === 'physician-history' && lab.status === 'denied' && lab.denialReason && (
              <p className="mt-1 text-sm text-muted-foreground">
                Feedback: {lab.denialReason}
              </p>
            )}
          </div>
        </CardHeader>

        {mode === 'physician-inbox' && (
          <CardContent>
            <div className="space-y-3">
              <div className="flex flex-wrap gap-2">
                <Button variant="secondary" onClick={onViewInChart}>
                  View in chart
                  <ArrowRight className="size-3.5" />
                </Button>
                <Button variant="outline" onClick={onRelease}>
                  <Unlock className="size-3.5" />
                  Release permanently
                </Button>
              </div>
              <div className="space-y-2 rounded-lg border bg-muted/40 px-3 py-2.5">
                <p className="text-xs text-muted-foreground">
                  Pending request from {DEMO_PA_NAME}
                </p>
                <div className="flex flex-wrap gap-2">
                  <Button size="sm" variant="success" onClick={onGrant}>
                    <Check className="size-3.5" />
                    Grant
                  </Button>
                  <Button size="sm" variant="destructive" onClick={onDeny}>
                    <X className="size-3.5" />
                    Deny
                  </Button>
                </div>
              </div>
            </div>
          </CardContent>
        )}

        {mode === 'physician-history' && viewInChartButton && (
          <CardContent>
            <div className="flex flex-wrap gap-2">
              {viewInChartButton}
            </div>
          </CardContent>
        )}

        {mode === 'pa-resolved' && (denialBlock || viewInChartButton) && (
          <CardContent>
            <div className="space-y-3">
              {denialBlock}
              {viewInChartButton && (
                <div className="flex flex-wrap gap-2">
                  {viewInChartButton}
                </div>
              )}
            </div>
          </CardContent>
        )}
      </Card>
    </div>
  )
}

function physicianHistoryOutcomeLabel(lab: LabResult): string {
  switch (lab.status) {
    case 'granted_unstarted':
      return 'Granted — awaiting PA confirmation'
    case 'active':
      return 'Granted — temporary access active'
    case 'expired':
      return 'Temporary access expired'
    case 'denied':
      return 'Denied'
    case 'released':
      return 'Permanently released'
    default:
      return getLabStatusLabel(lab.status, 'physician', 'requests')
  }
}

function paResolvedOutcomeLabel(lab: LabResult): string {
  switch (lab.status) {
    case 'granted_unstarted':
      return 'Granted — confirm to start timer'
    case 'active':
      return 'Granted — temporary access active'
    case 'expired':
      return 'Expired'
    case 'denied':
      return 'Denied'
    case 'released':
      return 'Permanently released'
    default:
      return getLabStatusLabel(lab.status)
  }
}
