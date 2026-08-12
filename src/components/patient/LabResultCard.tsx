import { useState } from 'react'
import { Check, Lock, Unlock, X } from 'lucide-react'
import { toast } from 'sonner'
import type { GrantDuration, LabResult } from '@/state/types'
import { useAppState } from '@/state/AppStateContext'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge, notificationBadgeClassName } from '@/components/ui/badge'
import {
  formatGrantDurationLabel,
  formatGrantDurationPhrase,
  getLabStatusLabel,
  getLabStatusTint,
} from '@/lib/statusDerivation'
import { AccessTimer } from '@/components/patient/AccessTimer'
import { DEMO_ASSISTANT_NAME, formatLabDenialComment, getLabDenialCommentTitle, shouldShowNewLabBadge } from '@/lib/scheduleData'
import { GrantAccessDialog } from '@/components/patient/GrantAccessDialog'
import { DenyAccessDialog } from '@/components/patient/DenyAccessDialog'
import { ReleasePermanentlyDialog } from '@/components/patient/ReleasePermanentlyDialog'
import { LabDocumentView } from '@/components/patient/LabDocumentView'
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog'

interface LabResultCardProps {
  lab: LabResult
}

export function LabResultCard({ lab }: LabResultCardProps) {
  const { state, dispatch } = useAppState()
  const [grantOpen, setGrantOpen] = useState(false)
  const [denyOpen, setDenyOpen] = useState(false)
  const [releaseOpen, setReleaseOpen] = useState(false)
  const [startWindowOpen, setStartWindowOpen] = useState(false)
  const [documentOpen, setDocumentOpen] = useState(false)
  const isAssistant = state.role === 'assistant'
  const isPhysician = state.role === 'physician'
  const now = Date.now()
  const durationLabel = formatGrantDurationLabel(lab.grantDuration ?? '10m')

  const openDocument = () => {
    setDocumentOpen(true)
  }

  const handleRequest = () => {
    dispatch({ type: 'REQUEST_LAB_ACCESS', labId: lab.id })
    toast.success('Access request sent')
  }

  const handleStartWindow = () => {
    dispatch({ type: 'CONFIRM_LAB_GRANT', labId: lab.id })
    setStartWindowOpen(false)
    setDocumentOpen(true)
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
    toast.success('Access granted. Awaiting assistant confirmation')
  }

  const handleDeny = (feedback: string) => {
    dispatch({ type: 'DENY_LAB_ACCESS', labId: lab.id, feedback })
    setDenyOpen(false)
    toast.success('Access request denied')
  }

  const handleRelease = () => {
    const asResponse = lab.status === 'requested'
    dispatch({ type: 'RELEASE_LAB', labId: lab.id })
    setReleaseOpen(false)
    toast.success(
      asResponse
        ? 'Result permanently released. Assistant notified'
        : 'Result permanently released',
    )
  }

  const showTimer = lab.status === 'active' && Boolean(lab.grantExpiresAt)
  // Labs assistant only: dismissed denial reads as Locked; My Requests keeps denied
  const badgeStatus =
    isAssistant && lab.status === 'denied' && lab.denialDismissed
      ? 'pending'
      : lab.status
  const showNewBadge = shouldShowNewLabBadge(lab)

  return (
    <>
      <div>
        <Card>
          <CardContent>
            <div className="flex flex-col items-start gap-(--card-spacing)">
              <div className="flex w-full flex-col gap-1">
                <div className="flex items-start justify-between gap-2">
                  <div className="flex flex-wrap items-center gap-1.5">
                    <Badge
                      variant="outline"
                      className={getLabStatusTint(badgeStatus, state.role)}
                    >
                      {getLabStatusLabel(badgeStatus, state.role)}
                    </Badge>
                    {showNewBadge && (
                      <Badge variant="outline" className={notificationBadgeClassName}>
                        New
                      </Badge>
                    )}
                  </div>
                  {showTimer && lab.grantExpiresAt && (
                    <AccessTimer expiresAt={lab.grantExpiresAt} now={now} />
                  )}
                </div>
                <div className="min-w-0">
                  <h6>{lab.name}</h6>
                  <p className="text-sm text-muted-foreground capitalize">
                    {lab.type} · Ordered {lab.orderDate}
                  </p>
                </div>
              </div>
              {isAssistant && (
                <PaActions
                  lab={lab}
                  durationLabel={durationLabel}
                  onRequest={handleRequest}
                  onStartWindow={() => setStartWindowOpen(true)}
                  onView={openDocument}
                  onDismissDenial={() =>
                    dispatch({ type: 'DISMISS_LAB_DENIAL', labId: lab.id })
                  }
                />
              )}
              {isPhysician && (
                <div className="w-full">
                  <PhysicianActions
                    lab={lab}
                    onView={openDocument}
                    onRelease={() => setReleaseOpen(true)}
                    onGrant={handleOpenGrant}
                    onDeny={handleOpenDeny}
                  />
                </div>
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
        onConfirm={handleRelease}
      />
      <AlertDialog open={startWindowOpen} onOpenChange={setStartWindowOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Start access window?</AlertDialogTitle>
            <AlertDialogDescription>
              Start your {formatGrantDurationPhrase(lab.grantDuration ?? '10m')} window for{' '}
              <strong>{lab.name}</strong> now? The countdown begins only after you confirm.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleStartWindow}>Confirm</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
      <LabDocumentView
        labId={lab.id}
        open={documentOpen}
        onOpenChange={setDocumentOpen}
      />
    </>
  )
}

function PaActions({
  lab,
  durationLabel,
  onRequest,
  onStartWindow,
  onView,
  onDismissDenial,
}: {
  lab: LabResult
  durationLabel: string
  onRequest: () => void
  onStartWindow: () => void
  onView: () => void
  onDismissDenial: () => void
}) {
  const requestLabel = lab.everDenied ? 'Request access again' : 'Request access'

  switch (lab.status) {
    case 'released':
      return (
        <Button variant="outline" onClick={onView}>
          View
        </Button>
      )
    case 'granted_unstarted':
      return (
        <Button variant="outline" onClick={onStartWindow}>
          <Unlock className="size-3.5" />
          View for {durationLabel}
        </Button>
      )
    case 'active':
      return (
        <Button variant="outline" onClick={onView}>
          View
        </Button>
      )
    case 'expired':
      return (
        <Button variant="outline" onClick={onRequest}>
          <Lock className="size-3.5" />
          Request access again
        </Button>
      )
    case 'pending':
      return (
        <Button variant="outline" onClick={onRequest}>
          <Lock className="size-3.5" />
          {requestLabel}
        </Button>
      )
    case 'requested':
      return (
        <Button variant="outline" disabled>
          <Lock className="size-3.5" />
          {requestLabel}
        </Button>
      )
    case 'denied':
      if (lab.denialDismissed) {
        return (
          <Button variant="outline" onClick={onRequest}>
            <Lock className="size-3.5" />
            Request access
          </Button>
        )
      }
      return (
        <div className="w-full space-y-3">
          <Button variant="outline" onClick={onRequest}>
            <Lock className="size-3.5" />
            {requestLabel}
          </Button>
          <div data-slot="lab-denial-block" data-dismissible="true">
            <button
              type="button"
              onClick={onDismissDenial}
              data-slot="lab-denial-dismiss"
              aria-label="Dismiss denial"
            >
              <X className="size-3.5" />
            </button>
            <p className="text-sm"><strong>{getLabDenialCommentTitle()}</strong></p>
            <p className="mt-0.5 text-sm">{formatLabDenialComment(lab.denialReason ?? '')}</p>
          </div>
        </div>
      )
    default:
      return null
  }
}

function PhysicianActions({
  lab,
  onView,
  onRelease,
  onGrant,
  onDeny,
}: {
  lab: LabResult
  onView: () => void
  onRelease: () => void
  onGrant: () => void
  onDeny: () => void
}) {
  const canRelease = lab.status !== 'released'

  return (
    <div className="space-y-3">
      <div className="flex flex-wrap gap-2">
        <Button variant="outline" onClick={onView}>
          View
        </Button>
        {canRelease && (
          <Button variant="outline" onClick={onRelease}>
            <Unlock className="size-3.5" />
            Release permanently
          </Button>
        )}
      </div>

      {lab.status === 'requested' && (
        <div className="space-y-2 rounded-md border bg-muted/40 px-3 py-2.5">
          <p className="text-sm text-foreground">
            Pending request from {DEMO_ASSISTANT_NAME}
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
      )}
    </div>
  )
}
