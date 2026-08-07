import { useState } from 'react'
import { toast } from 'sonner'
import { useAppState } from '@/state/AppStateContext'
import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'

interface ConfidentialNoteSectionProps {
  readOnly?: boolean
}

export function ConfidentialNoteSection({ readOnly = false }: ConfidentialNoteSectionProps) {
  const { state, dispatch } = useAppState()
  const [draft, setDraft] = useState(state.confidentialNoteContent)

  if (state.role !== 'physician') return null

  const handleSave = () => {
    dispatch({ type: 'SAVE_CONFIDENTIAL_NOTE', content: draft })
    toast.success('Confidential note saved')
  }

  return (
    <section>
      <h3 className="mb-1 text-sm font-medium">Confidential Note</h3>
      <p className="mb-2 text-xs text-muted-foreground">
        Physician-only. Hidden from PA — no request path.
      </p>
      <Textarea
        placeholder="Confidential physician note..."
        value={draft}
        onChange={(e) => setDraft(e.target.value)}
        rows={4}
        disabled={readOnly}
        className="text-sm"
      />
      {!readOnly && (
        <Button size="sm" className="mt-2" onClick={handleSave}>
          Save Confidential Note
        </Button>
      )}
    </section>
  )
}
