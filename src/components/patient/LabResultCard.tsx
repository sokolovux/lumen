import { useEffect, useRef, useState } from 'react'
import { toast } from 'sonner'
import type { GrantDuration, LabResult } from '@/state/types'
import { useAppState } from '@/state/AppStateContext'
import { Card, CardContent, CardHeader } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Skeleton } from '@/components/ui/skeleton'
import { cn } from '@/lib/utils'
import {
  canPaViewLab,
  formatCountdown,
  getLabStatusLabel,
} from '@/lib/statusDerivation'
import { GrantAccessDialog } from '@/components/patient/GrantAccessDialog'
import { DenyAccessDialog } from '@/components/patient/DenyAccessDialog'

interface LabResultCardProps {
  lab: LabResult
  highlighted?: boolean
}

export function LabResultCard({ lab, highlighted = false }: LabResultCardProps) {
  const { state, dispatch } = useAppState()
  const cardRef = useRef<HTMLDivElement>(null)
  const [grantOpen, setGrantOpen] = useState(false)
  const [denyOpen, setDenyOpen] = useState(false)
  const isPa = state.role === 'pa'
  const isPhysician = state.role === 'physician'
  const canView = isPhysician || canPaViewLab(lab)
  const now = Date.now()

  useEffect(() => {
    if (highlighted && cardRef.current) {
      cardRef.current.scrollIntoView({ behavior: 'smooth', block: 'center' })
    }
  }, [highlighted])

  const statusColor = (() => {
    switch (lab.status) {
      case 'pending':
        return ''
      case 'requested':
        return 'border-blue-200 bg-blue-50 text-blue-700'
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
    }
  })()

  const handleRequest = () => {
    dispatch({ type: 'REQUEST_LAB_ACCESS', labId: lab.id })
    toast.success('Access request sent')
  }

  const handleConfirmGrant = () => {
    dispatch({ type: 'CONFIRM_LAB_GRANT', labId: lab.id })
    toast.success('Temporary access confirmed — timer started')
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
    toast.success('Result permanently released')
  }

  return (
    <>
      <div
        ref={cardRef}
        id={`lab-${lab.id}`}
        className={cn(highlighted && 'rounded-lg ring-2 ring-primary ring-offset-2')}
      >
      <Card>
        <CardHeader className="flex flex-row items-start justify-between space-y-0 p-4 pb-2">
          <div>
            <p className="text-sm font-medium">{lab.name}</p>
            <p className="text-xs text-muted-foreground capitalize">
              {lab.type} · Ordered {lab.orderDate}
            </p>
          </div>
          <Badge variant="outline" className={statusColor}>
            {getLabStatusLabel(lab.status)}
          </Badge>
        </CardHeader>
        <CardContent className="p-4 pt-0">
          {canView ? (
            <div className="space-y-1">
              <p className="text-xs text-muted-foreground">Result value</p>
              <Skeleton className="h-5 w-32" />
            </div>
          ) : (
            <p className="text-xs text-muted-foreground italic">
              Result locked — value hidden
            </p>
          )}

          {lab.status === 'active' && lab.grantExpiresAt && (
            <p className="mt-2 text-xs font-medium text-amber-600">
              Expires in {formatCountdown(lab.grantExpiresAt, now)}
            </p>
          )}

          {lab.denialFeedback && (
            <p className="mt-2 text-xs text-destructive">
              Denied: {lab.denialFeedback}
            </p>
          )}

          <div className="mt-3 flex flex-wrap gap-2">
            {isPa && lab.status === 'pending' && (
              <Button size="sm" variant="outline" onClick={handleRequest}>
                Request Access
              </Button>
            )}
            {isPa && lab.status === 'granted_unstarted' && (
              <Button size="sm" onClick={handleConfirmGrant}>
                Confirm Access
              </Button>
            )}
            {isPhysician && lab.status === 'requested' && (
              <>
                <Button size="sm" onClick={() => setGrantOpen(true)}>
                  Grant Temporary Access
                </Button>
                <Button size="sm" variant="destructive" onClick={() => setDenyOpen(true)}>
                  Deny
                </Button>
              </>
            )}
            {isPhysician && (lab.status === 'pending' || lab.status === 'denied' || lab.status === 'expired') && (
              <Button size="sm" variant="secondary" onClick={handleRelease}>
                Release Permanently
              </Button>
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
    </>
  )
}
