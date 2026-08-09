import type { Ref } from 'react'
import { ArrowRight, Check, Unlock, X } from 'lucide-react'
import type { LabResult } from '@/state/types'
import { useAppState } from '@/state/AppStateContext'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { DEMO_PA_NAME } from '@/lib/scheduleData'
import {
  getLabStatusLabel,
  getLabStatusTint,
} from '@/lib/statusDerivation'
import { AccessTimer } from '@/components/patient/AccessTimer'

export type RequestQueueCardMode =
  | 'physician-inbox'
  | 'physician-history'
  | 'pa-awaiting'
  | 'pa-resolved'

interface RequestQueueCardProps {
  lab: LabResult
  mode: RequestQueueCardMode
  onGrant?: () => void
  onDeny?: () => void
  onRelease?: () => void
  onViewInChart?: () => void
  cardRef?: Ref<HTMLDivElement>
}

export function RequestQueueCard({
  lab,
  mode,
  onGrant,
  onDeny,
  onRelease,
  onViewInChart,
  cardRef,
}: RequestQueueCardProps) {
  const { state } = useAppState()
  const now = Date.now()
  const isPhysician = state.role === 'physician'

  const statusBadgeLabel = (() => {
    if (mode === 'pa-awaiting') return 'Access pending'
    if (lab.status === 'granted_unstarted' && isPhysician) {
      return 'Granted — not yet started'
    }
    return getLabStatusLabel(lab.status, state.role, 'requests')
  })()

  const showTimer =
    mode === 'physician-history'
    && lab.status === 'active'
    && Boolean(lab.grantExpiresAt)

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
    <Button size="sm" variant="outline" onClick={onViewInChart}>
      View in chart
      <ArrowRight className="size-3.5" />
    </Button>
  ) : null

  const denialBlock =
    mode === 'pa-resolved' && lab.status === 'denied' && lab.denialReason ? (
      <div className="rounded-lg border border-destructive/30 bg-destructive/10 px-3 py-2.5 text-destructive">
        <p className="text-sm"><strong>Request was denied.</strong></p>
        <p className="mt-1 text-xs opacity-90">Comment from the doctor:</p>
        <p className="mt-0.5 text-sm">{lab.denialReason}</p>
      </div>
    ) : null

  const actions =
    mode === 'physician-inbox' ? (
      <div className="space-y-3">
        <div className="flex flex-wrap gap-2">
          <Button variant="outline" onClick={onViewInChart}>
            View in chart
            <ArrowRight className="size-3.5" />
          </Button>
          <Button variant="outline" onClick={onRelease}>
            <Unlock className="size-3.5" />
            Release permanently
          </Button>
        </div>
        <div className="space-y-2 rounded-lg border bg-muted/40 px-3 py-2.5">
          <p className="text-sm text-foreground">
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
    ) : mode === 'physician-history' && viewInChartButton ? (
      <div className="flex flex-wrap gap-2">
        {viewInChartButton}
      </div>
    ) : mode === 'pa-resolved' && (denialBlock || viewInChartButton) ? (
      <div className="space-y-3">
        {denialBlock}
        {viewInChartButton && (
          <div className="flex flex-wrap gap-2">
            {viewInChartButton}
          </div>
        )}
      </div>
    ) : null

  return (
    <div ref={cardRef}>
      <Card>
        <CardContent>
          <div className="flex flex-col items-start gap-(--card-spacing)">
            <div className="flex w-full flex-col gap-1">
              <div className="flex items-start justify-between gap-2">
                <div className="flex flex-wrap items-center gap-1.5">
                  {statusBadge}
                </div>
                {showTimer && lab.grantExpiresAt && (
                  <AccessTimer expiresAt={lab.grantExpiresAt} now={now} />
                )}
              </div>
              <div className="min-w-0">
                <h6>{lab.name}</h6>
                <p>Jordan Reyes</p>
                <p className="text-sm text-muted-foreground capitalize">
                  {lab.type} · Ordered {lab.orderDate}
                </p>
              </div>
            </div>
            {actions ? <div className="w-full">{actions}</div> : null}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
