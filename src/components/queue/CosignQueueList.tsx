import { useNavigate } from 'react-router-dom'
import { useAppState } from '@/state/AppStateContext'
import { Card, CardAction, CardHeader } from '@/components/ui/card'
import { Badge, notificationBadgeClassName } from '@/components/ui/badge'
import { JORDAN_REYES_ID } from '@/lib/scheduleData'
import { getNoteStatusLabel } from '@/lib/statusDerivation'

export function CosignQueueList() {
  const { state, dispatch } = useAppState()
  const navigate = useNavigate()
  const isPhysician = state.role === 'physician'

  const hasNoteInReview = state.hasSubmittedOnce

  const handleItemClick = () => {
    dispatch({ type: 'SET_BREADCRUMB_ORIGIN', origin: 'queue' })
    if (isPhysician) {
      dispatch({ type: 'MARK_PHYSICIAN_COSIGN_VIEWED' })
    } else {
      dispatch({ type: 'MARK_PA_NOTES_REVIEW_VIEWED' })
    }
    dispatch({ type: 'OPEN_VISIT', visitId: 'today' })
    navigate(`/patients/${JORDAN_REYES_ID}`)
  }

  const showUnread =
    isPhysician
      ? state.cosignUnread > 0 && state.noteStatus === 'submitted'
      : state.notesReviewUnread > 0 && state.noteStatus === 'returned'

  if (!hasNoteInReview) {
    return (
      <div className="flex flex-col items-center justify-center rounded-lg border border-dashed py-16 text-center">
        <p className="text-sm">
          <strong>
            {isPhysician ? 'No notes awaiting cosign' : 'No notes in review'}
          </strong>
        </p>
        <p className="mt-1 max-w-sm text-xs text-muted-foreground">
          {isPhysician
            ? 'Submitted notes will appear here for physician review.'
            : 'After you submit a note, its review status will appear here.'}
        </p>
      </div>
    )
  }

  return (
    <Card interactive onClick={handleItemClick}>
      <CardHeader>
        <div>
          <div className="flex items-center gap-2">
            <p><strong>Jordan Reyes</strong></p>
            {showUnread && (
              <Badge
                variant="outline"
                className={notificationBadgeClassName}
              >
                New
              </Badge>
            )}
          </div>
          <p className="text-xs text-muted-foreground">Today&apos;s visit · Aug 10, 2026</p>
          <p className="mt-1 text-xs text-muted-foreground">
            {isPhysician
              ? 'Click to open visit panel and cosign or return'
              : 'Click to open visit panel and view status'}
          </p>
        </div>
        <CardAction>
          <Badge variant="outline" className="border-blue-200 bg-blue-50 text-blue-600">
            {getNoteStatusLabel(state.noteStatus)}
          </Badge>
        </CardAction>
      </CardHeader>
    </Card>
  )
}
