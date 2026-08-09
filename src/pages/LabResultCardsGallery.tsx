import type { ReactNode } from 'react'
import { ArrowRight, Check, Lock, Unlock, X } from 'lucide-react'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { DEMO_ASSISTANT_NAME } from '@/lib/scheduleData'
import {
  formatGrantDurationLabel,
  getLabStatusLabel,
  getLabStatusTint,
} from '@/lib/statusDerivation'
import { AccessTimer } from '@/components/patient/AccessTimer'
import type { GrantDuration, LabStatus, Role } from '@/state/types'

/** Fixed window so active demos share one expiresAt (ticks via app timer). */
const DS_ACTIVE_EXPIRES_AT = Date.now() + 10 * 60 * 1000

function Case({
  title,
  description,
  children,
}: {
  title: string
  description: string
  children: ReactNode
}) {
  return (
    <div className="space-y-2">
      <div>
        <p><strong>{title}</strong></p>
        <p className="text-sm text-muted-foreground">{description}</p>
      </div>
      {children}
    </div>
  )
}

function ResultCardShell({
  status,
  role,
  surface = 'labs',
  badgeLabel,
  plainBadge,
  showTimer,
  children,
}: {
  status: LabStatus
  role: Role
  surface?: 'labs' | 'requests'
  badgeLabel?: string
  /** Queue Assistant awaiting: outline with no status tint */
  plainBadge?: boolean
  showTimer?: boolean
  children?: ReactNode
}) {
  const now = Date.now()
  const label = badgeLabel ?? getLabStatusLabel(status, role, surface)

  return (
    <Card>
      <CardContent>
        <div className="flex flex-col items-start gap-(--card-spacing)">
          <div className="flex w-full flex-col gap-1">
            <div className="flex items-start justify-between gap-2">
              <div className="flex flex-wrap items-center gap-1.5">
                <Badge
                  variant="outline"
                  className={plainBadge ? undefined : getLabStatusTint(status, role, surface)}
                >
                  {label}
                </Badge>
              </div>
              {showTimer && (
                <AccessTimer expiresAt={DS_ACTIVE_EXPIRES_AT} now={now} />
              )}
            </div>
            <div className="min-w-0">
              <h6>HbA1c</h6>
              {surface === 'requests' && <p>Jordan Reyes</p>}
              <p className="text-sm text-muted-foreground capitalize">
                lab · Ordered Aug 5, 2026
              </p>
            </div>
          </div>
          {children ? <div className="w-full">{children}</div> : null}
        </div>
      </CardContent>
    </Card>
  )
}

function LabsAssistantGallery() {
  const duration = formatGrantDurationLabel('10m' satisfies GrantDuration)

  return (
    <div className="grid gap-6 md:grid-cols-2">
      <Case title="pending" description="Locked. First request.">
        <ResultCardShell status="pending" role="assistant">
          <Button variant="outline">
            <Lock className="size-3.5" />
            Request access
          </Button>
        </ResultCardShell>
      </Case>

      <Case title="requested" description="Waiting on physician. Button disabled.">
        <ResultCardShell status="requested" role="assistant">
          <Button variant="outline" disabled>
            <Lock className="size-3.5" />
            Request access
          </Button>
        </ResultCardShell>
      </Case>

      <Case
        title="granted_unstarted"
        description="Temporary access (green). Confirm before countdown."
      >
        <ResultCardShell status="granted_unstarted" role="assistant">
          <Button variant="outline">
            <Unlock className="size-3.5" />
            View for {duration}
          </Button>
        </ResultCardShell>
      </Case>

      <Case title="active" description="Mono timer top-right. View opens document.">
        <ResultCardShell status="active" role="assistant" showTimer>
          <Button variant="outline">
            View
          </Button>
        </ResultCardShell>
      </Case>

      <Case title="expired" description="Window ended. Re-request.">
        <ResultCardShell status="expired" role="assistant">
          <Button variant="outline">
            <Lock className="size-3.5" />
            Request access again
          </Button>
        </ResultCardShell>
      </Case>

      <Case title="denied" description="Denial block with dismiss X (Labs only).">
        <ResultCardShell status="denied" role="assistant">
          <div className="space-y-3">
            <Button variant="outline">
              <Lock className="size-3.5" />
              Request access again
            </Button>
            <div className="relative rounded-md border border-destructive/30 bg-destructive/10 px-3 py-2.5 pr-9 text-destructive">
              <button
                type="button"
                className="absolute top-2 right-2 rounded-md p-0.5 text-destructive/70"
                aria-label="Dismiss denial"
              >
                <X className="size-3.5" />
              </button>
              <p className="text-sm"><strong>Request was denied.</strong></p>
              <p className="mt-1 text-xs opacity-90">Comment from the physician:</p>
              <p className="mt-0.5 text-sm">Need more clinical context before release.</p>
            </div>
          </div>
        </ResultCardShell>
      </Case>

      <Case
        title="denied · dismissed"
        description="Badge back to Locked; denial block gone. everDenied → Request access again."
      >
        <ResultCardShell status="pending" role="assistant">
          <Button variant="outline">
            <Lock className="size-3.5" />
            Request access again
          </Button>
        </ResultCardShell>
      </Case>

      <Case title="released" description="Permanent access.">
        <ResultCardShell status="released" role="assistant">
          <Button variant="outline">
            View
          </Button>
        </ResultCardShell>
      </Case>

    </div>
  )
}

function LabsPhysicianGallery() {
  return (
    <div className="grid gap-6 md:grid-cols-2">
      <Case title="pending" description="Unreleased. View + Release.">
        <ResultCardShell status="pending" role="physician">
          <div className="flex flex-wrap gap-2">
            <Button variant="outline">
              View
            </Button>
            <Button variant="outline">
              <Unlock className="size-3.5" />
              Release permanently
            </Button>
          </div>
        </ResultCardShell>
      </Case>

      <Case title="requested" description="Inbox actions + pending request widget.">
        <ResultCardShell status="requested" role="physician">
          <div className="space-y-3">
            <div className="flex flex-wrap gap-2">
              <Button variant="outline">
                View
              </Button>
              <Button variant="outline">
                <Unlock className="size-3.5" />
                Release permanently
              </Button>
            </div>
            <div className="space-y-2 rounded-md border bg-muted/40 px-3 py-2.5">
              <p className="text-sm text-foreground">
                Pending request from {DEMO_ASSISTANT_NAME}
              </p>
              <div className="flex flex-wrap gap-2">
                <Button size="sm" variant="success">
                  <Check className="size-3.5" />
                  Grant
                </Button>
                <Button size="sm" variant="destructive">
                  <X className="size-3.5" />
                  Deny
                </Button>
              </div>
            </div>
          </div>
        </ResultCardShell>
      </Case>

      <Case
        title="granted_unstarted"
        description="Temporary access (green). Buttons unchanged."
      >
        <ResultCardShell status="granted_unstarted" role="physician">
          <div className="flex flex-wrap gap-2">
            <Button variant="outline">
              View
            </Button>
            <Button variant="outline">
              <Unlock className="size-3.5" />
              Release permanently
            </Button>
          </div>
        </ResultCardShell>
      </Case>

      <Case
        title="active"
        description="Temporary access + mono timer. Release converts to permanent."
      >
        <ResultCardShell status="active" role="physician" showTimer>
          <div className="flex flex-wrap gap-2">
            <Button variant="outline">
              View
            </Button>
            <Button variant="outline">
              <Unlock className="size-3.5" />
              Release permanently
            </Button>
          </div>
        </ResultCardShell>
      </Case>

      <Case title="expired" description="Neutral outline. View + Release.">
        <ResultCardShell status="expired" role="physician">
          <div className="flex flex-wrap gap-2">
            <Button variant="outline">
              View
            </Button>
            <Button variant="outline">
              <Unlock className="size-3.5" />
              Release permanently
            </Button>
          </div>
        </ResultCardShell>
      </Case>

      <Case title="denied" description="Chart shows Unreleased (neutral).">
        <ResultCardShell status="denied" role="physician">
          <div className="flex flex-wrap gap-2">
            <Button variant="outline">
              View
            </Button>
            <Button variant="outline">
              <Unlock className="size-3.5" />
              Release permanently
            </Button>
          </div>
        </ResultCardShell>
      </Case>

      <Case title="released" description="View only.">
        <ResultCardShell status="released" role="physician">
          <Button variant="outline">
            View
          </Button>
        </ResultCardShell>
      </Case>
    </div>
  )
}

function QueuePhysicianGallery() {
  return (
    <div className="grid gap-6 md:grid-cols-2">
      <Case
        title="Inbox · requested"
        description="Access Requests unresolved. View in chart + Release + Grant/Deny."
      >
        <ResultCardShell status="requested" role="physician" surface="requests">
          <div className="space-y-3">
            <div className="flex flex-wrap gap-2">
              <Button variant="outline">
                View in chart
                <ArrowRight className="size-3.5" />
              </Button>
              <Button variant="outline">
                <Unlock className="size-3.5" />
                Release permanently
              </Button>
            </div>
            <div className="space-y-2 rounded-md border bg-muted/40 px-3 py-2.5">
              <p className="text-sm text-foreground">
                Pending request from {DEMO_ASSISTANT_NAME}
              </p>
              <div className="flex flex-wrap gap-2">
                <Button size="sm" variant="success">
                  <Check className="size-3.5" />
                  Grant
                </Button>
                <Button size="sm" variant="destructive">
                  <X className="size-3.5" />
                  Deny
                </Button>
              </div>
            </div>
          </div>
        </ResultCardShell>
      </Case>

      <Case
        title="History · granted_unstarted"
        description="Badge carries the grant state."
      >
        <ResultCardShell
          status="granted_unstarted"
          role="physician"
          surface="requests"
          badgeLabel="Granted — not yet started"
        >
          <Button size="sm" variant="outline">
            View in chart
            <ArrowRight className="size-3.5" />
          </Button>
        </ResultCardShell>
      </Case>

      <Case title="History · active" description="Temporary access + mono timer.">
        <ResultCardShell status="active" role="physician" surface="requests" showTimer>
          <Button size="sm" variant="outline">
            View in chart
            <ArrowRight className="size-3.5" />
          </Button>
        </ResultCardShell>
      </Case>

      <Case title="History · expired" description="View in chart.">
        <ResultCardShell status="expired" role="physician" surface="requests">
          <Button size="sm" variant="outline">
            View in chart
            <ArrowRight className="size-3.5" />
          </Button>
        </ResultCardShell>
      </Case>

      <Case title="History · denied" description="View in chart.">
        <ResultCardShell status="denied" role="physician" surface="requests">
          <Button size="sm" variant="outline">
            View in chart
            <ArrowRight className="size-3.5" />
          </Button>
        </ResultCardShell>
      </Case>

      <Case title="History · released" description="View in chart.">
        <ResultCardShell status="released" role="physician" surface="requests">
          <Button size="sm" variant="outline">
            View in chart
            <ArrowRight className="size-3.5" />
          </Button>
        </ResultCardShell>
      </Case>
    </div>
  )
}

function QueueAssistantGallery() {
  return (
    <div className="grid gap-6 md:grid-cols-2">
      <Case
        title="Awaiting · requested"
        description="Access pending. No buttons."
      >
        <ResultCardShell
          status="requested"
          role="assistant"
          surface="requests"
          badgeLabel="Access pending"
          plainBadge
        />
      </Case>

      <Case
        title="Resolved · granted_unstarted"
        description="View in chart only (navigate, no start)."
      >
        <ResultCardShell status="granted_unstarted" role="assistant" surface="requests">
          <Button size="sm" variant="outline">
            View in chart
            <ArrowRight className="size-3.5" />
          </Button>
        </ResultCardShell>
      </Case>

      <Case title="Resolved · active" description="Temporary access badge + View in chart.">
        <ResultCardShell status="active" role="assistant" surface="requests">
          <Button size="sm" variant="outline">
            View in chart
            <ArrowRight className="size-3.5" />
          </Button>
        </ResultCardShell>
      </Case>

      <Case title="Resolved · expired" description="No View in chart.">
        <ResultCardShell status="expired" role="assistant" surface="requests" />
      </Case>

      <Case
        title="Resolved · denied"
        description="Denial block, no dismiss X, no buttons."
      >
        <ResultCardShell status="denied" role="assistant" surface="requests">
          <div className="rounded-md border border-destructive/30 bg-destructive/10 px-3 py-2.5 text-destructive">
            <p className="text-sm"><strong>Request was denied.</strong></p>
            <p className="mt-1 text-xs opacity-90">Comment from the physician:</p>
            <p className="mt-0.5 text-sm">Need more clinical context before release.</p>
          </div>
        </ResultCardShell>
      </Case>

      <Case title="Resolved · released" description="View in chart.">
        <ResultCardShell status="released" role="assistant" surface="requests">
          <Button size="sm" variant="outline">
            View in chart
            <ArrowRight className="size-3.5" />
          </Button>
        </ResultCardShell>
      </Case>

    </div>
  )
}

export function LabResultCardsGallery() {
  return (
    <Tabs defaultValue="labs-assistant">
      <TabsList>
        <TabsTrigger value="labs-assistant">Labs · Assistant</TabsTrigger>
        <TabsTrigger value="labs-physician">Labs · Physician</TabsTrigger>
        <TabsTrigger value="queue-physician">Queue · Physician</TabsTrigger>
        <TabsTrigger value="queue-assistant">Queue · Assistant</TabsTrigger>
      </TabsList>
      <TabsContent value="labs-assistant" className="mt-4">
        <LabsAssistantGallery />
      </TabsContent>
      <TabsContent value="labs-physician" className="mt-4">
        <LabsPhysicianGallery />
      </TabsContent>
      <TabsContent value="queue-physician" className="mt-4">
        <QueuePhysicianGallery />
      </TabsContent>
      <TabsContent value="queue-assistant" className="mt-4">
        <QueueAssistantGallery />
      </TabsContent>
    </Tabs>
  )
}
