import { useEffect, useRef, useState } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'
import { toast } from 'sonner'
import type { GrantDuration, LabResult } from '@/state/types'
import { cn } from '@/lib/utils'
import { useAppState } from '@/state/AppStateContext'
import { Badge, countBadgeClassName, notificationBadgeClassName } from '@/components/ui/badge'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { JORDAN_REYES_ID } from '@/lib/scheduleData'
import { isAssistantResolvedLabStatus } from '@/lib/statusDerivation'
import { GrantAccessDialog } from '@/components/patient/GrantAccessDialog'
import { DenyAccessDialog } from '@/components/patient/DenyAccessDialog'
import { ReleasePermanentlyDialog } from '@/components/patient/ReleasePermanentlyDialog'
import { RequestQueueCard } from '@/components/queue/RequestQueueCard'

export function AccessRequestsList() {
  const { state } = useAppState()
  return state.role === 'physician'
    ? <PhysicianAccessRequestsList />
    : <PaMyRequestsList />
}

function PhysicianAccessRequestsList() {
  const { state, dispatch } = useAppState()
  const navigate = useNavigate()
  const location = useLocation()
  const [grantLabId, setGrantLabId] = useState<string | null>(null)
  const [denyLabId, setDenyLabId] = useState<string | null>(null)
  const [releaseLabId, setReleaseLabId] = useState<string | null>(null)

  const unresolvedLabs = state.labs.filter((lab) => lab.status === 'requested')
  const historyLabs = state.labs.filter(
    (lab) => lab.everRequested && isAssistantResolvedLabStatus(lab.status),
  )
  const unreadCount = unresolvedLabs.filter(
    (lab) => !state.viewedRequests.includes(lab.id),
  ).length

  const grantLab = unresolvedLabs.find((l) => l.id === grantLabId)
  const denyLab = unresolvedLabs.find((l) => l.id === denyLabId)
  const releaseLab = unresolvedLabs.find((l) => l.id === releaseLabId)

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
    toast.success('Access granted. Awaiting assistant confirmation')
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
    toast.success('Result permanently released. Assistant notified')
  }

  const handleViewInChart = () => {
    dispatch({ type: 'CLOSE_VISIT' })
    navigate(`/patients/${JORDAN_REYES_ID}?tab=labs`, {
      state: { from: `${location.pathname}${location.search}` },
    })
  }

  return (
    <>
      <Tabs defaultValue="unresolved">
        <TabsList>
          <TabsTrigger value="unresolved">
            Pending
            {unreadCount > 0 && (
              <Badge
                variant="outline"
                className={cn('ml-1.5', countBadgeClassName, notificationBadgeClassName)}
              >
                {unreadCount}
              </Badge>
            )}
          </TabsTrigger>
          <TabsTrigger value="history">
            History
            {historyLabs.length > 0 && (
              <Badge variant="outline" className={cn('ml-1.5', countBadgeClassName)}>
                {historyLabs.length}
              </Badge>
            )}
          </TabsTrigger>
        </TabsList>

        <TabsContent value="unresolved" className="mt-4">
          {unresolvedLabs.length === 0 ? (
            <EmptyState
              title="No pending requests"
              description="Lab and imaging access requests from assistants will appear here."
            />
          ) : (
            <div className="space-y-3">
              {unresolvedLabs.map((lab) => (
                <RequestQueueCard
                  key={lab.id}
                  lab={lab}
                  mode="physician-inbox"
                  onGrant={() => handleOpenGrant(lab.id)}
                  onDeny={() => handleOpenDeny(lab.id)}
                  onRelease={() => handleOpenRelease(lab.id)}
                  onViewInChart={handleViewInChart}
                />
              ))}
            </div>
          )}
        </TabsContent>

        <TabsContent value="history" className="mt-4">
          {historyLabs.length === 0 ? (
            <EmptyState
              title="No request history"
              description="Granted, denied, and permanently released requests will appear here."
            />
          ) : (
            <div className="space-y-3">
              {historyLabs.map((lab) => (
                <RequestQueueCard
                  key={lab.id}
                  lab={lab}
                  mode="physician-history"
                  onViewInChart={handleViewInChart}
                />
              ))}
            </div>
          )}
        </TabsContent>
      </Tabs>

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
    (lab) => lab.everRequested && isAssistantResolvedLabStatus(lab.status),
  )

  return (
    <Tabs defaultValue="resolved">
      <TabsList>
        <TabsTrigger value="resolved">
          Resolved
          {state.assistantUnseenResolution.length > 0 && (
            <Badge
              variant="outline"
              className={cn('ml-1.5', countBadgeClassName, notificationBadgeClassName)}
            >
              {state.assistantUnseenResolution.length}
            </Badge>
          )}
        </TabsTrigger>
        <TabsTrigger value="awaiting">
          Pending
          {awaitingLabs.length > 0 && (
            <Badge variant="outline" className={cn('ml-1.5', countBadgeClassName)}>
              {awaitingLabs.length}
            </Badge>
          )}
        </TabsTrigger>
      </TabsList>

      <TabsContent value="resolved" className="mt-4">
        {resolvedLabs.length === 0 ? (
          <EmptyState
            title="No requests in history"
            description="Granted, denied, released, and expired requests will appear here."
          />
        ) : (
          <div className="space-y-3">
            {resolvedLabs.map((lab) => (
              <PaResolvedRow
                key={lab.id}
                lab={lab}
                isUnseen={state.assistantUnseenResolution.includes(lab.id)}
              />
            ))}
          </div>
        )}
      </TabsContent>

      <TabsContent value="awaiting" className="mt-4">
        {awaitingLabs.length === 0 ? (
          <EmptyState
            title="No pending requests"
            description="Labs you've requested that are still waiting on a physician response will appear here."
          />
        ) : (
          <div className="space-y-3">
            {awaitingLabs.map((lab) => (
              <RequestQueueCard
                key={lab.id}
                lab={lab}
                mode="assistant-awaiting"
              />
            ))}
          </div>
        )}
      </TabsContent>
    </Tabs>
  )
}

function PaResolvedRow({
  lab,
  isUnseen,
}: {
  lab: LabResult
  isUnseen: boolean
}) {
  const { dispatch } = useAppState()
  const navigate = useNavigate()
  const location = useLocation()
  const rowRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (!isUnseen) return
    const el = rowRef.current
    if (!el) return

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry?.isIntersecting) {
          dispatch({ type: 'MARK_ASSISTANT_RESOLUTION_SEEN', labId: lab.id })
        }
      },
      { threshold: 0.5 },
    )

    observer.observe(el)
    return () => observer.disconnect()
  }, [dispatch, isUnseen, lab.id])

  const handleViewInChart = () => {
    dispatch({ type: 'CLOSE_VISIT' })
    navigate(`/patients/${JORDAN_REYES_ID}?tab=labs`, {
      state: { from: `${location.pathname}${location.search}` },
    })
  }

  return (
    <RequestQueueCard
      lab={lab}
      mode="assistant-resolved"
      cardRef={rowRef}
      onViewInChart={handleViewInChart}
    />
  )
}

function EmptyState({ title, description }: { title: string; description: string }) {
  return (
    <div data-slot="queue-empty-state">
      <h5>{title}</h5>
      <p className="max-w-sm">{description}</p>
    </div>
  )
}
