import { useState } from 'react'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'

interface DenyAccessDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  labName: string
  onDeny: (feedback: string) => void
}

export function DenyAccessDialog({
  open,
  onOpenChange,
  labName,
  onDeny,
}: DenyAccessDialogProps) {
  const [feedback, setFeedback] = useState('')

  const handleDeny = () => {
    if (!feedback.trim()) return
    onDeny(feedback)
    setFeedback('')
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Deny access request</DialogTitle>
        </DialogHeader>
        <p className="text-sm text-muted-foreground">
          Deny access to <strong>{labName}</strong>. Written feedback is required.
        </p>
        <Textarea
          placeholder="Explain why access is denied..."
          value={feedback}
          onChange={(e) => setFeedback(e.target.value)}
          rows={4}
        />
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button variant="destructive" onClick={handleDeny} disabled={!feedback.trim()}>
            Deny access
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
