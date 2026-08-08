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
  onConfirm: () => void
}

export function ReleasePermanentlyDialog({
  open,
  onOpenChange,
  labName,
  onConfirm,
}: ReleasePermanentlyDialogProps) {
  return (
    <AlertDialog open={open} onOpenChange={onOpenChange}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Release this result permanently?</AlertDialogTitle>
          <AlertDialogDescription>
            Release <strong>{labName}</strong> permanently? This can&apos;t be undone.
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
