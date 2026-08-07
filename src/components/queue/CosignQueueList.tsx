import { useNavigate } from 'react-router-dom'
import { useAppState } from '@/state/AppStateContext'
import { Card, CardContent, CardHeader } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { JORDAN_REYES_ID } from '@/lib/scheduleData'
import { getNoteStatusLabel } from '@/lib/statusDerivation'

export function CosignQueueList() {
  const { state, dispatch } = useAppState()
  const navigate = useNavigate()

  const hasPendingNote = state.noteStatus === 'submitted'

  const handleOpen = () => {
    dispatch({ type: 'SET_BREADCRUMB_ORIGIN', origin: 'queue' })
    dispatch({ type: 'MARK_COSIGN_READ' })
    navigate(`/patients/${JORDAN_REYES_ID}`)
    dispatch({ type: 'OPEN_VISIT', visitId: 'today' })
  }

  if (!hasPendingNote) {
    return (
      <div className="flex flex-col items-center justify-center rounded-lg border border-dashed py-16 text-center">
        <p className="text-sm font-medium">No notes awaiting cosign</p>
        <p className="mt-1 text-xs text-muted-foreground">
          Submitted notes will appear here for physician review.
        </p>
      </div>
    )
  }

  return (
    <Card>
      <CardHeader className="flex flex-row items-start justify-between p-4">
        <div>
          <div className="flex items-center gap-2">
            <p className="font-medium">Jordan Reyes</p>
            {state.cosignUnread > 0 && (
              <Badge variant="destructive" className="h-5 text-xs">New</Badge>
            )}
          </div>
          <p className="text-xs text-muted-foreground">Today&apos;s visit · Aug 10, 2026</p>
        </div>
        <Badge variant="outline" className="border-blue-200 bg-blue-50 text-blue-700">
          {getNoteStatusLabel(state.noteStatus)}
        </Badge>
      </CardHeader>
      <CardContent className="p-4 pt-0">
        <Button size="sm" onClick={handleOpen}>Review Note</Button>
      </CardContent>
    </Card>
  )
}
