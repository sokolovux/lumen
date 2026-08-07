import { useNavigate } from 'react-router-dom'
import { useAppState } from '@/state/AppStateContext'
import { Card, CardContent, CardHeader } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { JORDAN_REYES_ID } from '@/lib/scheduleData'
import { getLabStatusLabel } from '@/lib/statusDerivation'

export function AccessRequestsList() {
  const { state, dispatch } = useAppState()
  const navigate = useNavigate()

  const requestedLabs = state.labs.filter((lab) => lab.status === 'requested')

  const handleOpen = (requestId: string) => {
    dispatch({ type: 'SET_BREADCRUMB_ORIGIN', origin: 'requests' })
    dispatch({ type: 'MARK_REQUEST_READ', requestId })
    navigate(`/patients/${JORDAN_REYES_ID}`)
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
    <div className="space-y-3">
      {requestedLabs.map((lab) => {
        const isUnread = lab.requestId
          ? !state.viewedRequests.includes(lab.requestId)
          : false
        return (
          <Card key={lab.id}>
            <CardHeader className="flex flex-row items-start justify-between p-4">
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
              <Badge variant="outline" className="border-blue-200 bg-blue-50 text-blue-700">
                {getLabStatusLabel(lab.status)}
              </Badge>
            </CardHeader>
            <CardContent className="p-4 pt-0">
              <Button
                size="sm"
                onClick={() => lab.requestId && handleOpen(lab.requestId)}
              >
                Review Request
              </Button>
            </CardContent>
          </Card>
        )
      })}
    </div>
  )
}
