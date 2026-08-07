import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { toast } from 'sonner'
import type { GrantDuration, LabStatus } from '@/state/types'
import { cn } from '@/lib/utils'
import { useAppState } from '@/state/AppStateContext'
import { Card, CardContent, CardHeader } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { JORDAN_REYES_ID } from '@/lib/scheduleData'
import {
  canPaViewLab,
  formatCountdown,
  getLabStatusLabel,
  hasPaRequestedLab,
  isPaApprovedLabStatus,
} from '@/lib/statusDerivation'
import { GrantAccessDialog } from '@/components/patient/GrantAccessDialog'
import { DenyAccessDialog } from '@/components/patient/DenyAccessDialog'

export function AccessRequestsList() {
  const { state } = useAppState()
  return state.role === 'physician'
    ? <PhysicianAccessRequestsList />
    : <PaMyRequestsList />
}

function PhysicianAccessRequestsList() {
  const { state, dispatch } = useAppState()
  const [grantLabId, setGrantLabId] = useState<string | null>(null)
  const [denyLabId, setDenyLabId] = useState<string | null>(null)

  const requestedLabs = state.labs.filter((lab) => lab.status === 'requested')

  const grantLab = requestedLabs.find((l) => l.id === grantLabId)
  const denyLab = requestedLabs.find((l) => l.id === denyLabId)

  const markViewed = (requestId: string | undefined) => {
    if (requestId) {
      dispatch({ type: 'MARK_REQUEST_READ', requestId })
    }
  }

  const handleOpenGrant = (labId: string, requestId: string | undefined) => {
    markViewed(requestId)
    setGrantLabId(labId)
  }

  const handleOpenDeny = (labId: string, requestId: string | undefined) => {
    markViewed(requestId)
    setDenyLabId(labId)
  }

  const handleGrant = (duration: GrantDuration) => {
    if (!grantLabId) return
    dispatch({ type: 'GRANT_LAB_ACCESS', labId: grantLabId, duration })
    setGrantLabId(null)
    toast.success('Access granted — awaiting PA confirmation')
  }

  const handleDeny = (feedback: string) => {
    if (!denyLabId) return
    dispatch({ type: 'DENY_LAB_ACCESS', labId: denyLabId, feedback })
    setDenyLabId(null)
    toast.success('Access request denied')
  }

  if (requestedLabs.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center rounded-lg border border-dashed py-16 text-center">
        <p className="text-sm font-medium">No pending access requests</p>
        <p className="mt-1 text-xs text-muted-foreground">
          Lab and imaging access requests from PAs will appear here.
        </p>
      </div>
    )
  }

  return (
    <>
      <div className="space-y-3">
        {requestedLabs.map((lab) => {
          const isUnread = lab.requestId
            ? !state.viewedRequests.includes(lab.requestId)
            : false
          return (
            <Card key={lab.id}>
              <CardHeader className="flex flex-row items-start justify-between p-4 pb-2">
                <div>
                  <div className="flex items-center gap-2">
                    <p className="font-medium">{lab.name}</p>
                    {isUnread && (
                      <Badge variant="destructive" className="h-5 text-xs">New</Badge>
                    )}
                  </div>
                  <p className="text-xs text-muted-foreground">
                    Jordan Reyes · {lab.type} · Ordered {lab.orderDate}
                  </p>
                </div>
                <LabStatusBadge status={lab.status} />
              </CardHeader>
              <CardContent className="flex gap-2 p-4 pt-0">
                <Button
                  size="sm"
                  onClick={() => handleOpenGrant(lab.id, lab.requestId)}
                >
                  Grant…
                </Button>
                <Button
                  size="sm"
                  variant="destructive"
                  onClick={() => handleOpenDeny(lab.id, lab.requestId)}
                >
                  Deny…
                </Button>
              </CardContent>
            </Card>
          )
        })}
      </div>

      {grantLab && (
        <GrantAccessDialog
          open={grantLabId !== null}
          onOpenChange={(open) => { if (!open) setGrantLabId(null) }}
          labName={grantLab.name}
          onGrant={handleGrant}
        />
      )}

      {denyLab && (
        <DenyAccessDialog
          open={denyLabId !== null}
          onOpenChange={(open) => { if (!open) setDenyLabId(null) }}
          labName={denyLab.name}
          onDeny={handleDeny}
        />
      )}
    </>
  )
}

const PA_REQUEST_STATUSES: LabStatus[] = [
  'requested',
  'granted_unstarted',
  'active',
  'expired',
  'denied',
  'released',
]

function PaMyRequestsList() {
  const { state, dispatch } = useAppState()
  const navigate = useNavigate()

  const myRequestLabs = state.labs
    .filter((lab) => hasPaRequestedLab(lab) && PA_REQUEST_STATUSES.includes(lab.status))
    .sort((a, b) => {
      const aApproved = isPaApprovedLabStatus(a.status) ? 0 : 1
      const bApproved = isPaApprovedLabStatus(b.status) ? 0 : 1
      if (aApproved !== bApproved) return aApproved - bApproved
      return a.name.localeCompare(b.name)
    })

  const handleItemClick = (labId: string, isApproved: boolean) => {
    dispatch({ type: 'SET_BREADCRUMB_ORIGIN', origin: 'requests' })
    if (isApproved) {
      dispatch({ type: 'MARK_PA_APPROVAL_VIEWED', labId })
    }
    navigate(`/patients/${JORDAN_REYES_ID}?tab=labs&lab=${labId}`)
  }

  if (myRequestLabs.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center rounded-lg border border-dashed py-16 text-center">
        <p className="text-sm font-medium">No access requests yet</p>
        <p className="mt-1 max-w-sm text-xs text-muted-foreground">
          Request access from the Labs & Results tab on a patient chart. Approved requests will appear here.
        </p>
      </div>
    )
  }

  const now = Date.now()

  return (
    <div className="space-y-3">
      {myRequestLabs.map((lab) => {
        const isApproved = isPaApprovedLabStatus(lab.status)
        const isUnreadApproval =
          isApproved && !state.viewedPaApprovals.includes(lab.id)
        const canViewResult = canPaViewLab(lab)

        return (
          <Card
            key={lab.id}
            className={cn(
              'cursor-pointer transition-shadow hover:shadow-md',
              isApproved && 'border-green-200 bg-green-50/50 dark:border-green-900 dark:bg-green-950/20',
            )}
            onClick={() => handleItemClick(lab.id, isApproved)}
          >
            <CardHeader className="flex flex-row items-start justify-between p-4">
              <div>
                <div className="flex items-center gap-2">
                  <p className="font-medium">{lab.name}</p>
                  {isUnreadApproval && (
                    <Badge variant="destructive" className="h-5 text-xs">New</Badge>
                  )}
                </div>
                <p className="text-xs text-muted-foreground">
                  Jordan Reyes · {lab.type} · Ordered {lab.orderDate}
                </p>
                {isApproved && (
                  <p className="mt-1 text-xs font-medium text-green-700 dark:text-green-400">
                    Access approved
                    {lab.status === 'granted_unstarted' && ' — confirm to start timer'}
                  </p>
                )}
                {lab.status === 'active' && lab.grantExpiresAt && (
                  <p className="mt-1 text-xs font-medium text-amber-600">
                    Expires in {formatCountdown(lab.grantExpiresAt, now)}
                  </p>
                )}
                {lab.denialFeedback && (
                  <p className="mt-1 text-xs text-destructive">
                    Denied: {lab.denialFeedback}
                  </p>
                )}
                <p className="mt-1 text-xs text-muted-foreground">
                  {canViewResult
                    ? 'Click to view result'
                    : isApproved
                      ? 'Click to open and confirm access'
                      : 'Click to view request status'}
                </p>
              </div>
              <LabStatusBadge status={lab.status} />
            </CardHeader>
          </Card>
        )
      })}
    </div>
  )
}

function LabStatusBadge({ status }: { status: LabStatus }) {
  const colorClass = (() => {
    switch (status) {
      case 'requested':
      case 'granted_unstarted':
        return 'border-blue-200 bg-blue-50 text-blue-700'
      case 'active':
        return 'border-emerald-200 bg-emerald-50 text-emerald-700'
      case 'expired':
        return 'border-amber-200 bg-amber-50 text-amber-700'
      case 'denied':
        return 'border-destructive/30 bg-destructive/10 text-destructive'
      case 'released':
        return 'border-green-200 bg-green-50 text-green-700'
      default:
        return ''
    }
  })()

  return (
    <Badge variant="outline" className={colorClass}>
      {getLabStatusLabel(status)}
    </Badge>
  )
}
