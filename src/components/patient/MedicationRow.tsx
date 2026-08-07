import { toast } from 'sonner'
import type { Medication } from '@/state/types'
import { useAppState } from '@/state/AppStateContext'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'

interface MedicationRowProps {
  med: Medication
}

export function MedicationRow({ med }: MedicationRowProps) {
  const { state, dispatch } = useAppState()

  const handleContinue = () => {
    dispatch({ type: 'CONTINUE_MED', medId: med.id })
    toast.success(`${med.name} continued`)
  }

  const handleDiscontinue = () => {
    dispatch({ type: 'DISCONTINUE_MED', medId: med.id })
    toast.success(`${med.name} discontinued`)
  }

  return (
    <div className="rounded-lg border p-3">
      <div className="flex items-start justify-between">
        <div>
          <p className="text-sm font-medium">{med.name}</p>
          <p className="text-xs text-muted-foreground">
            {med.dose} · {med.frequency}
          </p>
        </div>
        <Badge
          variant="outline"
          className={
            med.status === 'active'
              ? 'border-green-200 bg-green-50 text-green-700'
              : 'border-destructive/30 bg-destructive/10 text-destructive'
          }
        >
          {med.status === 'active' ? 'Active' : 'Discontinued'}
        </Badge>
      </div>
      <div className="mt-2 flex gap-2">
        <Button size="sm" variant="outline" onClick={handleContinue}>
          Continue
        </Button>
        <Button size="sm" variant="outline" onClick={handleDiscontinue}>
          Discontinue
        </Button>
      </div>
      {med.history.length > 0 && (
        <ul className="mt-2 space-y-0.5">
          {med.history.map((event) => (
            <li key={event.id} className="text-xs text-muted-foreground">
              {event.timestamp} — {event.action} by {event.actor === 'pa' ? 'PA' : 'Physician'}
              {event.detail && ` (${event.detail})`}
            </li>
          ))}
        </ul>
      )}
    </div>
  )
}
