import { useEffect, useRef, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { toast } from 'sonner'
import type { GrantDuration, LabResult, LabStatus } from '@/state/types'
import { cn } from '@/lib/utils'
import { useAppState } from '@/state/AppStateContext'
import { Card, CardContent, CardHeader } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { JORDAN_REYES_ID } from '@/lib/scheduleData'
import {
  formatCountdown,
  getLabStatusLabel,
  isPaResolvedLabStatus,
} from '@/lib/statusDerivation'
import { GrantAccessDialog } from '@/components/patient/GrantAccessDialog'
import { DenyAccessDialog } from '@/components/patient/DenyAccessDialog'
import { ReleasePermanentlyDialog } from '@/components/patient/ReleasePermanentlyDialog'

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
  const [releaseLabId, setReleaseLabId] = useState<string | null>(null)

  const requestedLabs = state.labs.filter((lab) => lab.status === 'requested')

  const grantLab = requestedLabs.find((l) => l.id === grantLabId)
  const denyLab = requestedLabs.find((l) => l.id === denyLabId)
  const releaseLab = requestedLabs.find((l) => l.id === releaseLabId)

  const markViewed = (labId: string) => {
    dispatch({ type: 'MARK_REQUEST_READ', labId })
  }

  const handleOpenGrant = (labId: string) => {
    markViewed(labId)
    setGrantLabId(labId)
  }

  const handleOpenDeny = (labId: string) => {
    markViewed(labId)
    setDenyLabId(labId)
  }

  const handleOpenRelease = (labId: string) => {
    markViewed(labId)
    setReleaseLabId(labId)
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

  const handleRelease = () => {
    if (!releaseLabId) return
    dispatch({ type: 'RELEASE_LAB', labId: releaseLabId })
    setReleaseLabId(null)
    toast.success('Result permanently released — PA notified')
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
          const isUnread = !state.viewedRequests.includes(lab.id)
          return (
            <Card key={lab.id} className="gap-2 py-0">
              <CardHeader className="flex flex-row items-start justify-between px-4 pt-4 pb-0">
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
              <CardContent className="flex flex-wrap gap-2 px-4 pt-0 pb-4">
                <Button size="sm" onClick={() => handleOpenGrant(lab.id)}>
                  Grant
                </Button>
                <Button
                  size="sm"
                  variant="destructive"
                  onClick={() => handleOpenDeny(lab.id)}
                >
                  Deny
                </Button>
                <Button
                  size="sm"
                  variant="secondary"
                  onClick={() => handleOpenRelease(lab.id)}
                >
                  Release
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

      {releaseLab && (
        <ReleasePermanentlyDialog
          open={releaseLabId !== null}
          onOpenChange={(open) => { if (!open) setReleaseLabId(null) }}
          labName={releaseLab.name}
          notifiesPa
          onConfirm={handleRelease}
        />
      )}
    </>
  )
}

function PaMyRequestsList() {
  const { state } = useAppState()

  const awaitingLabs = state.labs.filter(
    (lab) => lab.everRequested && lab.status === 'requested',
  )
  const resolvedLabs = state.labs.filter(
    (lab) => lab.everRequested && isPaResolvedLabStatus(lab.status),
  )

  return (
    <Tabs defaultValue="resolved">
      <TabsList>
        <TabsTrigger value="resolved">
          Resolved
          {state.paUnseenResolution.length > 0 && (
            <Badge variant="destructive" className="ml-1.5 h-5 px-1.5 text-xs">
              {state.paUnseenResolution.length}
            </Badge>
          )}
        </TabsTrigger>
        <TabsTrigger value="awaiting">
          Awaiting response
          {awaitingLabs.length > 0 && (
            <Badge variant="secondary" className="ml-1.5 h-5 px-1.5 text-xs">
              {awaitingLabs.length}
            </Badge>
          )}
        </TabsTrigger>
      </TabsList>

      <TabsContent value="resolved" className="mt-4">
        {resolvedLabs.length === 0 ? (
          <EmptyState
            title="No resolved requests"
            description="Granted, denied, released, and expired requests will appear here."
          />
        ) : (
          <div className="space-y-3">
            {resolvedLabs.map((lab) => (
              <ResolvedRequestRow
                key={lab.id}
                lab={lab}
                isUnseen={state.paUnseenResolution.includes(lab.id)}
              />
            ))}
          </div>
        )}
      </TabsContent>

      <TabsContent value="awaiting" className="mt-4">
        {awaitingLabs.length === 0 ? (
          <EmptyState
            title="No awaiting requests"
            description="Labs you've requested that are still waiting on a physician response will appear here."
          />
        ) : (
          <div className="space-y-3">
            {awaitingLabs.map((lab) => (
              <Card key={lab.id} className="gap-2 py-0">
                <CardHeader className="flex flex-row items-start justify-between px-4 py-4">
                  <div>
                    <p className="font-medium">{lab.name}</p>
                    <p className="text-xs text-muted-foreground">
                      Jordan Reyes · {lab.type} · Ordered {lab.orderDate}
                    </p>
                    <p className="mt-1 text-xs text-muted-foreground">
                      Waiting for physician response
                    </p>
                  </div>
                  <LabStatusBadge status={lab.status} />
                </CardHeader>
              </Card>
            ))}
          </div>
        )}
      </TabsContent>
    </Tabs>
  )
}

function ResolvedRequestRow({
  lab,
  isUnseen,
}: {
  lab: LabResult
  isUnseen: boolean
}) {
  const { dispatch } = useAppState()
  const navigate = useNavigate()
  const rowRef = useRef<HTMLDivElement>(null)
  const now = Date.now()

  useEffect(() => {
    if (!isUnseen) return
    const el = rowRef.current
    if (!el) return

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry?.isIntersecting) {
          dispatch({ type: 'MARK_PA_RESOLUTION_SEEN', labId: lab.id })
        }
      },
      { threshold: 0.5 },
    )

    observer.observe(el)
    return () => observer.disconnect()
  }, [dispatch, isUnseen, lab.id])

  const canViewResult =
    lab.status === 'granted_unstarted'
    || lab.status === 'active'
    || lab.status === 'released'
  const isDenied = lab.status === 'denied'

  const handleViewResult = () => {
    dispatch({ type: 'SET_BREADCRUMB_ORIGIN', origin: 'requests' })
    navigate(`/patients/${JORDAN_REYES_ID}?tab=labs&lab=${lab.id}`)
  }

  return (
    <div ref={rowRef}>
      <Card
        className={cn(
          'gap-2 py-0',
          isUnseen && 'ring-2 ring-destructive/40',
        )}
      >
        <CardHeader className="flex flex-row items-start justify-between px-4 pt-4 pb-0">
          <div className="min-w-0 flex-1">
            <div className="flex items-center gap-2">
              <p className="font-medium">{lab.name}</p>
              {isUnseen && (
                <Badge variant="destructive" className="h-5 text-xs">New</Badge>
              )}
            </div>
            <p className="text-xs text-muted-foreground">
              Jordan Reyes · {lab.type} · Ordered {lab.orderDate}
            </p>
            <p className="mt-1 text-xs font-medium">
              {resolvedOutcomeLabel(lab)}
            </p>
            {lab.status === 'active' && lab.grantExpiresAt && (
              <p className="mt-1 text-xs font-medium text-amber-600">
                Expires in {formatCountdown(lab.grantExpiresAt, now)}
              </p>
            )}
            {isDenied && lab.denialReason && (
              <p className="mt-1 text-xs text-destructive">
                Denied: {lab.denialReason}
              </p>
            )}
          </div>
          <LabStatusBadge status={lab.status} />
        </CardHeader>
        <CardContent className="px-4 pt-0 pb-4">
          {canViewResult && (
            <Button size="sm" variant="outline" onClick={handleViewResult}>
              View result
            </Button>
          )}
        </CardContent>
      </Card>
    </div>
  )
}

function resolvedOutcomeLabel(lab: LabResult): string {
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

function EmptyState({ title, description }: { title: string; description: string }) {
  return (
    <div className="flex flex-col items-center justify-center rounded-lg border border-dashed py-16 text-center">
      <p className="text-sm font-medium">{title}</p>
      <p className="mt-1 max-w-sm text-xs text-muted-foreground">{description}</p>
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
