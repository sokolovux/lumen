import { useEffect, useRef, useState } from 'react'
import { toast } from 'sonner'
import type { GrantDuration, LabResult } from '@/state/types'
import { useAppState } from '@/state/AppStateContext'
import { Card, CardContent, CardHeader } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Skeleton } from '@/components/ui/skeleton'
import { cn } from '@/lib/utils'
import {
  formatCountdown,
  formatGrantDurationLabel,
} from '@/lib/statusDerivation'
import { GrantAccessDialog } from '@/components/patient/GrantAccessDialog'
import { DenyAccessDialog } from '@/components/patient/DenyAccessDialog'
import { ReleasePermanentlyDialog } from '@/components/patient/ReleasePermanentlyDialog'
import { StartWindowDialog } from '@/components/patient/StartWindowDialog'
import { LabDocumentView } from '@/components/patient/LabDocumentView'

interface LabResultCardProps {
  lab: LabResult
  highlighted?: boolean
}

export function LabResultCard({ lab, highlighted = false }: LabResultCardProps) {
  const { state, dispatch } = useAppState()
  const cardRef = useRef<HTMLDivElement>(null)
  const [grantOpen, setGrantOpen] = useState(false)
  const [denyOpen, setDenyOpen] = useState(false)
  const [releaseOpen, setReleaseOpen] = useState(false)
  const [startWindowOpen, setStartWindowOpen] = useState(false)
  const [documentOpen, setDocumentOpen] = useState(false)
  const isPa = state.role === 'pa'
  const isPhysician = state.role === 'physician'
  const now = Date.now()
  const isReleased = lab.status === 'released'

  useEffect(() => {
    if (highlighted && cardRef.current) {
      cardRef.current.scrollIntoView({ behavior: 'smooth', block: 'center' })
    }
  }, [highlighted])

  const handleRequest = () => {
    dispatch({ type: 'REQUEST_LAB_ACCESS', labId: lab.id })
    toast.success('Access request sent')
  }

  const handleStartWindow = () => {
    dispatch({ type: 'CONFIRM_LAB_GRANT', labId: lab.id })
    setStartWindowOpen(false)
    toast.success('Access window started')
  }

  const handleOpenGrant = () => {
    dispatch({ type: 'MARK_REQUEST_READ', labId: lab.id })
    setGrantOpen(true)
  }

  const handleOpenDeny = () => {
    dispatch({ type: 'MARK_REQUEST_READ', labId: lab.id })
    setDenyOpen(true)
  }

  const handleGrant = (duration: GrantDuration) => {
    dispatch({ type: 'GRANT_LAB_ACCESS', labId: lab.id, duration })
    setGrantOpen(false)
    toast.success('Access granted — awaiting PA confirmation')
  }

  const handleDeny = (feedback: string) => {
    dispatch({ type: 'DENY_LAB_ACCESS', labId: lab.id, feedback })
    setDenyOpen(false)
    toast.success('Access request denied')
  }

  const handleRelease = () => {
    dispatch({ type: 'RELEASE_LAB', labId: lab.id })
    setReleaseOpen(false)
    toast.success(
      lab.everRequested
        ? 'Result permanently released — PA notified'
        : 'Result permanently released',
    )
  }

  const durationLabel = formatGrantDurationLabel(lab.grantDuration ?? '10m')

  return (
    <>
      <div
        ref={cardRef}
        id={`lab-${lab.id}`}
        className={cn(highlighted && 'rounded-lg ring-2 ring-primary ring-offset-2')}
      >
        <Card className="gap-2 py-0">
          <CardHeader className="space-y-0 px-4 pt-4 pb-0">
            <p className="text-sm font-medium">{lab.name}</p>
            <p className="text-xs text-muted-foreground capitalize">
              {lab.type} · Ordered {lab.orderDate}
            </p>
          </CardHeader>
          <CardContent className="space-y-3 px-4 pt-0 pb-4">
            {isReleased ? (
              <div className="space-y-1">
                <p className="text-xs text-muted-foreground">Result value</p>
                <Skeleton className="h-5 w-32" />
              </div>
            ) : (
              <StatusLine lab={lab} now={now} />
            )}

            <div className="flex flex-wrap gap-2">
              {isPa && lab.status === 'pending' && (
                <Button size="sm" variant="outline" onClick={handleRequest}>
                  Request access
                </Button>
              )}
              {isPa && lab.status === 'requested' && (
                <Button size="sm" variant="outline" disabled>
                  Waiting on Dr. Osei
                </Button>
              )}
              {isPa && lab.status === 'granted_unstarted' && (
                <Button size="sm" onClick={() => setStartWindowOpen(true)}>
                  Start {durationLabel} window
                </Button>
              )}
              {isPa && lab.status === 'active' && (
                <Button size="sm" onClick={() => setDocumentOpen(true)}>
                  View
                </Button>
              )}
              {isPa && (lab.status === 'expired' || lab.status === 'denied') && (
                <Button size="sm" variant="outline" onClick={handleRequest}>
                  Request again
                </Button>
              )}

              {isPhysician && lab.status === 'pending' && (
                <Button size="sm" variant="secondary" onClick={() => setReleaseOpen(true)}>
                  Release to record
                </Button>
              )}
              {isPhysician && lab.status === 'requested' && (
                <>
                  <Button size="sm" onClick={handleOpenGrant}>
                    Grant
                  </Button>
                  <Button size="sm" variant="destructive" onClick={handleOpenDeny}>
                    Deny
                  </Button>
                  <Button
                    size="sm"
                    variant="secondary"
                    onClick={() => setReleaseOpen(true)}
                  >
                    Release
                  </Button>
                </>
              )}
            </div>
          </CardContent>
        </Card>
      </div>

      <GrantAccessDialog
        open={grantOpen}
        onOpenChange={setGrantOpen}
        labName={lab.name}
        onGrant={handleGrant}
      />
      <DenyAccessDialog
        open={denyOpen}
        onOpenChange={setDenyOpen}
        labName={lab.name}
        onDeny={handleDeny}
      />
      <ReleasePermanentlyDialog
        open={releaseOpen}
        onOpenChange={setReleaseOpen}
        labName={lab.name}
        notifiesPa={lab.everRequested}
        onConfirm={handleRelease}
      />
      <StartWindowDialog
        open={startWindowOpen}
        onOpenChange={setStartWindowOpen}
        labName={lab.name}
        duration={lab.grantDuration ?? '10m'}
        onConfirm={handleStartWindow}
      />
      <LabDocumentView
        labId={lab.id}
        open={documentOpen}
        onOpenChange={setDocumentOpen}
      />
    </>
  )
}

function StatusLine({ lab, now }: { lab: LabResult; now: number }) {
  switch (lab.status) {
    case 'pending':
      return (
        <p className="text-xs text-muted-foreground">
          Pending physician release
        </p>
      )
    case 'requested':
      return (
        <p className="text-xs font-medium text-blue-700">
          Access requested — awaiting response
        </p>
      )
    case 'granted_unstarted':
      return null
    case 'active':
      return (
        <p className="text-xs font-medium text-emerald-700">
          Access open —{' '}
          {lab.grantExpiresAt
            ? formatCountdown(lab.grantExpiresAt, now)
            : '0:00'}{' '}
          remaining
        </p>
      )
    case 'expired':
      return (
        <p className="text-xs font-medium text-amber-700">
          Access expired
        </p>
      )
    case 'denied':
      return (
        <div className="space-y-1">
          <p className="text-xs font-medium text-destructive">
            Request denied
          </p>
          {lab.denialReason && (
            <p className="text-xs text-destructive">
              {lab.denialReason}
            </p>
          )}
        </div>
      )
    default:
      return null
  }
}
