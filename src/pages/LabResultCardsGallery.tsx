import type { ReactNode } from 'react'
import { ArrowRight, Check, Lock, Unlock, X } from 'lucide-react'
import { Card, CardContent, CardHeader } from '@/components/ui/card'
import { Badge, notificationBadgeClassName } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { DEMO_PA_NAME } from '@/lib/scheduleData'
import {
  formatCountdown,
  formatGrantDurationLabel,
  getActiveGrantBadgeLabel,
  getLabStatusLabel,
  getLabStatusTint,
} from '@/lib/statusDerivation'
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
        <p className="font-medium">{title}</p>
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
  meta,
  showNew,
  children,
}: {
  status: LabStatus
  role: Role
  surface?: 'labs' | 'requests'
  badgeLabel?: string
  /** Queue PA awaiting: outline with no status tint */
  plainBadge?: boolean
  meta?: ReactNode
  showNew?: boolean
  children?: ReactNode
}) {
  const now = Date.now()
  const label =
    badgeLabel
    ?? (
      status === 'active' && role === 'physician'
        ? getActiveGrantBadgeLabel('physician', DS_ACTIVE_EXPIRES_AT, now)
        : getLabStatusLabel(status, role, surface)
    )

  const subtitle =
    surface === 'requests'
      ? 'Jordan Reyes · lab · Ordered Aug 5, 2026'
      : 'lab · Ordered Aug 5, 2026'

  return (
    <Card>
      <CardHeader>
        <div className="flex flex-wrap items-center gap-1.5">
          <Badge
            variant="outline"
            className={plainBadge ? undefined : getLabStatusTint(status, role, surface)}
          >
            {label}
          </Badge>
          {showNew && (
            <Badge variant="outline" className={notificationBadgeClassName}>
              New
            </Badge>
          )}
        </div>
        <div className="min-w-0">
          <p className="font-medium">HbA1c</p>
          <p className="text-sm text-muted-foreground capitalize">
            {subtitle}
          </p>
          {meta}
        </div>
      </CardHeader>
      {children ? <CardContent>{children}</CardContent> : null}
    </Card>
  )
}

function LabsPaGallery() {
  const now = Date.now()
  const duration = formatGrantDurationLabel('10m' satisfies GrantDuration)

  return (
    <div className="grid gap-6 md:grid-cols-2">
      <Case title="pending" description="Locked. First request.">
        <ResultCardShell status="pending" role="pa">
          <Button variant="outline">
            <Lock className="size-3.5" />
            Request access
          </Button>
        </ResultCardShell>
      </Case>

      <Case title="requested" description="Waiting on physician. Button disabled.">
        <ResultCardShell status="requested" role="pa">
          <Button variant="outline" disabled>
            <Lock className="size-3.5" />
            Request access
          </Button>
        </ResultCardShell>
      </Case>

      <Case
        title="granted_unstarted"
        description="Grant ready. Confirm before countdown."
      >
        <ResultCardShell status="granted_unstarted" role="pa">
          <Button variant="secondary">
            <Unlock className="size-3.5" />
            View for {duration}
          </Button>
        </ResultCardShell>
      </Case>

      <Case title="active" description="Countdown live. View opens document.">
        <ResultCardShell
          status="active"
          role="pa"
          meta={(
            <p className="mt-1 text-xs font-medium text-blue-700">
              Available for {formatCountdown(DS_ACTIVE_EXPIRES_AT, now)}
            </p>
          )}
        >
          <Button variant="secondary">
            View
            <ArrowRight className="size-3.5" />
          </Button>
        </ResultCardShell>
      </Case>

      <Case title="expired" description="Window ended. Re-request.">
        <ResultCardShell status="expired" role="pa">
          <Button variant="outline">
            <Lock className="size-3.5" />
            Request access again
          </Button>
        </ResultCardShell>
      </Case>

      <Case title="denied" description="Denial block with dismiss X (Labs only).">
        <ResultCardShell status="denied" role="pa">
          <div className="space-y-3">
            <Button variant="outline">
              <Lock className="size-3.5" />
              Request access again
            </Button>
            <div className="relative rounded-lg border border-destructive/30 bg-destructive/10 px-3 py-2.5 pr-9 text-destructive">
              <button
                type="button"
                className="absolute top-2 right-2 rounded-md p-0.5 text-destructive/70"
                aria-label="Dismiss denial"
              >
                <X className="size-3.5" />
              </button>
              <p className="text-sm font-medium">Request was denied.</p>
              <p className="mt-1 text-xs opacity-90">Comment from the doctor:</p>
              <p className="mt-0.5 text-sm">Need more clinical context before release.</p>
            </div>
          </div>
        </ResultCardShell>
      </Case>

      <Case
        title="denied · dismissed"
        description="Status stays denied; denial block gone. everDenied → Request access again."
      >
        <ResultCardShell status="denied" role="pa">
          <Button variant="outline">
            <Lock className="size-3.5" />
            Request access again
          </Button>
        </ResultCardShell>
      </Case>

      <Case title="released" description="Permanent access.">
        <ResultCardShell status="released" role="pa">
          <Button variant="secondary">
            View
            <ArrowRight className="size-3.5" />
          </Button>
        </ResultCardShell>
      </Case>

      <Case
        title="released · justReleased"
        description="New badge until first open."
      >
        <ResultCardShell status="released" role="pa" showNew>
          <Button variant="secondary">
            View
            <ArrowRight className="size-3.5" />
          </Button>
        </ResultCardShell>
      </Case>
    </div>
  )
}

function LabsPhysicianGallery() {
  const now = Date.now()

  return (
    <div className="grid gap-6 md:grid-cols-2">
      <Case title="pending" description="Unreleased. View + Release.">
        <ResultCardShell status="pending" role="physician">
          <div className="flex flex-wrap gap-2">
            <Button variant="secondary">
              View
              <ArrowRight className="size-3.5" />
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
              <Button variant="secondary">
                View
                <ArrowRight className="size-3.5" />
              </Button>
              <Button variant="outline">
                <Unlock className="size-3.5" />
                Release permanently
              </Button>
            </div>
            <div className="space-y-2 rounded-lg border bg-muted/40 px-3 py-2.5">
              <p className="text-xs text-muted-foreground">
                Pending request from {DEMO_PA_NAME}
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
        description="Third-person tag. Buttons unchanged."
      >
        <ResultCardShell status="granted_unstarted" role="physician">
          <div className="flex flex-wrap gap-2">
            <Button variant="secondary">
              View
              <ArrowRight className="size-3.5" />
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
        description="Same expiresAt countdown as PA. Release converts to permanent."
      >
        <ResultCardShell
          status="active"
          role="physician"
          badgeLabel={getActiveGrantBadgeLabel('physician', DS_ACTIVE_EXPIRES_AT, now)}
        >
          <div className="flex flex-wrap gap-2">
            <Button variant="secondary">
              View
              <ArrowRight className="size-3.5" />
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
            <Button variant="secondary">
              View
              <ArrowRight className="size-3.5" />
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
            <Button variant="secondary">
              View
              <ArrowRight className="size-3.5" />
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
          <Button variant="secondary">
            View
            <ArrowRight className="size-3.5" />
          </Button>
        </ResultCardShell>
      </Case>
    </div>
  )
}

function QueuePhysicianGallery() {
  const now = Date.now()

  return (
    <div className="grid gap-6 md:grid-cols-2">
      <Case
        title="Inbox · requested"
        description="Access Requests unresolved. View in chart + Release + Grant/Deny."
      >
        <ResultCardShell status="requested" role="physician" surface="requests">
          <div className="space-y-3">
            <div className="flex flex-wrap gap-2">
              <Button variant="secondary">
                View in chart
                <ArrowRight className="size-3.5" />
              </Button>
              <Button variant="outline">
                <Unlock className="size-3.5" />
                Release permanently
              </Button>
            </div>
            <div className="space-y-2 rounded-lg border bg-muted/40 px-3 py-2.5">
              <p className="text-xs text-muted-foreground">
                Pending request from {DEMO_PA_NAME}
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
        title="Inbox · requested · unread"
        description="New badge for unread inbox item."
      >
        <ResultCardShell status="requested" role="physician" surface="requests" showNew>
          <div className="space-y-3">
            <div className="flex flex-wrap gap-2">
              <Button variant="secondary">
                View in chart
                <ArrowRight className="size-3.5" />
              </Button>
              <Button variant="outline">
                <Unlock className="size-3.5" />
                Release permanently
              </Button>
            </div>
            <div className="space-y-2 rounded-lg border bg-muted/40 px-3 py-2.5">
              <p className="text-xs text-muted-foreground">
                Pending request from {DEMO_PA_NAME}
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
        description="Badge carries the grant state; no outcome line."
      >
        <ResultCardShell
          status="granted_unstarted"
          role="physician"
          surface="requests"
          badgeLabel="Granted — not yet started"
        >
          <Button size="sm" variant="secondary">
            View in chart
            <ArrowRight className="size-3.5" />
          </Button>
        </ResultCardShell>
      </Case>

      <Case title="History · active" description="Live countdown on tag; no outcome line.">
        <ResultCardShell
          status="active"
          role="physician"
          surface="requests"
          badgeLabel={getActiveGrantBadgeLabel('physician', DS_ACTIVE_EXPIRES_AT, now)}
        >
          <Button size="sm" variant="secondary">
            View in chart
            <ArrowRight className="size-3.5" />
          </Button>
        </ResultCardShell>
      </Case>

      <Case title="History · expired" description="Outcome + View in chart.">
        <ResultCardShell
          status="expired"
          role="physician"
          surface="requests"
          meta={<p className="mt-1 text-xs font-medium">Temporary access expired</p>}
        >
          <Button size="sm" variant="secondary">
            View in chart
            <ArrowRight className="size-3.5" />
          </Button>
        </ResultCardShell>
      </Case>

      <Case title="History · denied" description="Feedback line + View in chart.">
        <ResultCardShell
          status="denied"
          role="physician"
          surface="requests"
          meta={(
            <>
              <p className="mt-1 text-xs font-medium">Denied</p>
              <p className="mt-1 text-sm text-muted-foreground">
                Feedback: Need more clinical context before release.
              </p>
            </>
          )}
        >
          <Button size="sm" variant="secondary">
            View in chart
            <ArrowRight className="size-3.5" />
          </Button>
        </ResultCardShell>
      </Case>

      <Case title="History · released" description="Permanently released.">
        <ResultCardShell
          status="released"
          role="physician"
          surface="requests"
          meta={<p className="mt-1 text-xs font-medium">Permanently released</p>}
        >
          <Button size="sm" variant="secondary">
            View in chart
            <ArrowRight className="size-3.5" />
          </Button>
        </ResultCardShell>
      </Case>
    </div>
  )
}

function QueuePaGallery() {
  const now = Date.now()

  return (
    <div className="grid gap-6 md:grid-cols-2">
      <Case
        title="Awaiting · requested"
        description="Access pending. No buttons."
      >
        <ResultCardShell
          status="requested"
          role="pa"
          surface="requests"
          badgeLabel="Access pending"
          plainBadge
          meta={(
            <p className="mt-1 text-sm text-muted-foreground">
              Waiting for physician response
            </p>
          )}
        />
      </Case>

      <Case
        title="Resolved · granted_unstarted"
        description="View in chart only (navigate, no start)."
      >
        <ResultCardShell
          status="granted_unstarted"
          role="pa"
          surface="requests"
          meta={<p className="mt-1 text-xs font-medium">Granted — confirm to start timer</p>}
        >
          <Button size="sm" variant="secondary">
            View in chart
            <ArrowRight className="size-3.5" />
          </Button>
        </ResultCardShell>
      </Case>

      <Case title="Resolved · active" description="Temporary access + countdown meta.">
        <ResultCardShell
          status="active"
          role="pa"
          surface="requests"
          meta={(
            <p className="mt-1 text-xs font-medium text-blue-700">
              Available for {formatCountdown(DS_ACTIVE_EXPIRES_AT, now)}
            </p>
          )}
        >
          <Button size="sm" variant="secondary">
            View in chart
            <ArrowRight className="size-3.5" />
          </Button>
        </ResultCardShell>
      </Case>

      <Case title="Resolved · expired" description="No View in chart.">
        <ResultCardShell
          status="expired"
          role="pa"
          surface="requests"
          meta={<p className="mt-1 text-xs font-medium">Expired</p>}
        />
      </Case>

      <Case
        title="Resolved · denied"
        description="Denial block, no dismiss X, no buttons."
      >
        <ResultCardShell
          status="denied"
          role="pa"
          surface="requests"
          meta={<p className="mt-1 text-xs font-medium">Denied</p>}
        >
          <div className="rounded-lg border border-destructive/30 bg-destructive/10 px-3 py-2.5 text-destructive">
            <p className="text-sm font-medium">Request was denied.</p>
            <p className="mt-1 text-xs opacity-90">Comment from the doctor:</p>
            <p className="mt-0.5 text-sm">Need more clinical context before release.</p>
          </div>
        </ResultCardShell>
      </Case>

      <Case title="Resolved · released" description="View in chart.">
        <ResultCardShell
          status="released"
          role="pa"
          surface="requests"
          meta={<p className="mt-1 text-xs font-medium">Permanently released</p>}
        >
          <Button size="sm" variant="secondary">
            View in chart
            <ArrowRight className="size-3.5" />
          </Button>
        </ResultCardShell>
      </Case>

      <Case
        title="Resolved · unseen"
        description="New badge for unseen resolution."
      >
        <ResultCardShell
          status="released"
          role="pa"
          surface="requests"
          showNew
          meta={<p className="mt-1 text-xs font-medium">Permanently released</p>}
        >
          <Button size="sm" variant="secondary">
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
    <Tabs defaultValue="labs-pa">
      <TabsList>
        <TabsTrigger value="labs-pa">Labs · PA</TabsTrigger>
        <TabsTrigger value="labs-physician">Labs · Physician</TabsTrigger>
        <TabsTrigger value="queue-physician">Queue · Physician</TabsTrigger>
        <TabsTrigger value="queue-pa">Queue · PA</TabsTrigger>
      </TabsList>
      <TabsContent value="labs-pa" className="mt-4">
        <LabsPaGallery />
      </TabsContent>
      <TabsContent value="labs-physician" className="mt-4">
        <LabsPhysicianGallery />
      </TabsContent>
      <TabsContent value="queue-physician" className="mt-4">
        <QueuePhysicianGallery />
      </TabsContent>
      <TabsContent value="queue-pa" className="mt-4">
        <QueuePaGallery />
      </TabsContent>
    </Tabs>
  )
}
