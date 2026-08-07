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

interface ReleasePermanentlyDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  labName: string
  notifiesPa?: boolean
  onConfirm: () => void
}

export function ReleasePermanentlyDialog({
  open,
  onOpenChange,
  labName,
  notifiesPa = false,
  onConfirm,
}: ReleasePermanentlyDialogProps) {
  return (
    <AlertDialog open={open} onOpenChange={onOpenChange}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Release permanently?</AlertDialogTitle>
          <AlertDialogDescription>
            This will permanently unlock <strong>{labName}</strong> for the PA.
            This action cannot be undone.
            {notifiesPa && ' The PA will be notified.'}
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel>Cancel</AlertDialogCancel>
          <AlertDialogAction variant="destructive" onClick={onConfirm}>
            Release permanently
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  )
}
