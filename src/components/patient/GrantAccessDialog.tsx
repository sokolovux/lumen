import type { GrantDuration } from '@/state/types'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { useState } from 'react'

const DURATIONS: { value: GrantDuration; label: string }[] = [
  { value: '10s', label: '10 seconds (demo)' },
  { value: '10m', label: '10 minutes' },
  { value: '1h', label: '1 hour' },
  { value: '4h', label: '4 hours' },
  { value: '24h', label: '24 hours' },
]

interface GrantAccessDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  labName: string
  onGrant: (duration: GrantDuration) => void
}

export function GrantAccessDialog({
  open,
  onOpenChange,
  labName,
  onGrant,
}: GrantAccessDialogProps) {
  const [duration, setDuration] = useState<GrantDuration>('10m')

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Grant Temporary Access</DialogTitle>
        </DialogHeader>
        <p className="text-sm text-muted-foreground">
          Grant temporary access to <strong>{labName}</strong>. Timer starts when the PA confirms.
        </p>
        <Select value={duration} onValueChange={(v: string) => setDuration(v as GrantDuration)}>
          <SelectTrigger>
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {DURATIONS.map((d) => (
              <SelectItem key={d.value} value={d.value}>
                {d.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button onClick={() => onGrant(duration)}>Grant Access</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
