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
  { value: '10s', label: '10s (demo)' },
  { value: '10m', label: '10m' },
  { value: '1h', label: '1h' },
  { value: '4h', label: '4h' },
  { value: '24h', label: '24h' },
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
          <DialogTitle>Grant temporary access</DialogTitle>
        </DialogHeader>
        <p className="text-sm text-muted-foreground">
          Grant temporary access to <strong>{labName}</strong>. Timer starts when the assistant confirms.
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
          <Button variant="success" onClick={() => onGrant(duration)}>
            Grant access
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
