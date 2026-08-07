import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog'
import { formatGrantDurationPhrase } from '@/lib/statusDerivation'

interface StartWindowDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  labName: string
  duration: string
  onConfirm: () => void
}

export function StartWindowDialog({
  open,
  onOpenChange,
  labName,
  duration,
  onConfirm,
}: StartWindowDialogProps) {
  const phrase = formatGrantDurationPhrase(duration)

  return (
    <AlertDialog open={open} onOpenChange={onOpenChange}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Start access window?</AlertDialogTitle>
          <AlertDialogDescription>
            Start your {phrase} access window for <strong>{labName}</strong> now?
            The countdown begins only after you confirm.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel>Cancel</AlertDialogCancel>
          <AlertDialogAction onClick={onConfirm}>Confirm</AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  )
}
