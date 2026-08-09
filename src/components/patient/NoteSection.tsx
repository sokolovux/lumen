import { useState } from 'react'
import { toast } from 'sonner'
import { useAppState } from '@/state/AppStateContext'
import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'
import { Badge } from '@/components/ui/badge'
import { getNoteStatusLabel } from '@/lib/statusDerivation'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog'

interface NoteSectionProps {
  readOnly?: boolean
}

export function NoteSection({ readOnly = false }: NoteSectionProps) {
  const { state, dispatch } = useAppState()
  const [returnDialogOpen, setReturnDialogOpen] = useState(false)
  const [returnFeedback, setReturnFeedback] = useState('')

  const canEdit =
    !readOnly &&
    state.role === 'pa' &&
    (state.noteStatus === 'not_started' ||
      state.noteStatus === 'draft' ||
      state.noteStatus === 'returned')

  const canSubmit = canEdit && state.noteDraft.trim().length > 0

  const handleSubmit = () => {
    dispatch({ type: 'SUBMIT_NOTE' })
    toast.success(
      state.noteStatus === 'returned'
        ? 'Note resubmitted for cosign'
        : 'Note submitted for cosign',
    )
  }

  const handleCosign = () => {
    dispatch({ type: 'COSIGN_NOTE' })
    toast.success('Note cosigned')
  }

  const handleReturn = () => {
    if (!returnFeedback.trim()) return
    dispatch({ type: 'RETURN_NOTE', feedback: returnFeedback })
    setReturnDialogOpen(false)
    setReturnFeedback('')
    toast.success('Note returned to PA')
  }

  const statusVariant = (() => {
    switch (state.noteStatus) {
      case 'submitted':
        return 'border-blue-200 bg-blue-50 text-blue-600'
      case 'returned':
        return 'border-amber-200 bg-amber-50 text-amber-600'
      case 'cosigned':
        return 'border-green-200 bg-green-50 text-green-600'
      default:
        return ''
    }
  })()

  return (
    <section>
      <div className="mb-2 flex items-center justify-between">
        <h6>Clinical note</h6>
        <Badge variant="outline" className={statusVariant}>
          {getNoteStatusLabel(state.noteStatus)}
        </Badge>
      </div>

      {state.returnFeedback && state.noteStatus === 'returned' && (
        <div className="mb-2 rounded-md border border-amber-200 bg-amber-50 p-2 text-xs text-amber-800">
          <p><strong>Return feedback</strong></p>
          <p>{state.returnFeedback}</p>
        </div>
      )}

      {canEdit ? (
        <Textarea
          placeholder="Enter clinical note..."
          value={state.noteDraft}
          onChange={(e) => dispatch({ type: 'UPDATE_NOTE_DRAFT', content: e.target.value })}
          rows={6}
          className="text-sm"
        />
      ) : (
        <div className="rounded-md border p-3">
          {state.noteDraft ? (
            <p className="whitespace-pre-wrap text-sm">{state.noteDraft}</p>
          ) : (
            <p className="text-sm text-muted-foreground italic">No note content</p>
          )}
        </div>
      )}

      <div className="mt-2 flex flex-wrap gap-2">
        {canSubmit && (state.noteStatus === 'not_started' || state.noteStatus === 'draft') && (
          <Button size="sm" onClick={handleSubmit}>
            Submit for cosign
          </Button>
        )}
        {canSubmit && state.noteStatus === 'returned' && (
          <Button size="sm" onClick={handleSubmit}>
            Resubmit for cosign
          </Button>
        )}
        {!readOnly && state.role === 'physician' && state.noteStatus === 'submitted' && (
          <>
            <Button size="sm" onClick={handleCosign}>
              Cosign
            </Button>
            <Button size="sm" variant="outline" onClick={() => setReturnDialogOpen(true)}>
              Return for revision
            </Button>
          </>
        )}
      </div>

      {state.noteHistory.length > 0 && (
        <div className="mt-3">
          <p className="mb-1 text-xs"><strong>Version history</strong></p>
          <ul className="space-y-1">
            {state.noteHistory.map((v) => (
              <li key={v.id} className="text-xs text-muted-foreground">
                v{v.version} — {v.status} by {v.actor === 'pa' ? 'PA' : 'Physician'} at {v.timestamp}
                {v.feedback && ` — "${v.feedback}"`}
              </li>
            ))}
          </ul>
        </div>
      )}

      <Dialog open={returnDialogOpen} onOpenChange={setReturnDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Return note for revision</DialogTitle>
          </DialogHeader>
          <Textarea
            placeholder="Provide feedback for the PA..."
            value={returnFeedback}
            onChange={(e) => setReturnFeedback(e.target.value)}
            rows={4}
          />
          <DialogFooter>
            <Button variant="outline" onClick={() => setReturnDialogOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleReturn} disabled={!returnFeedback.trim()}>
              Return note
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </section>
  )
}
