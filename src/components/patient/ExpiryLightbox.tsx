import { useAppState } from '@/state/AppStateContext'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogDescription,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'

export function ExpiryLightbox() {
  const { state, dispatch } = useAppState()
  const lab = state.labs.find((l) => l.id === state.expiryModalLabId)
  const isOpen = state.expiryModalLabId !== null

  if (!lab) return null

  return (
    <>
      {isOpen && (
        <div className="fixed inset-0 z-40 bg-background/80 backdrop-blur-sm" aria-hidden />
      )}
      <Dialog
        open={isOpen}
        onOpenChange={() => dispatch({ type: 'DISMISS_EXPIRY_MODAL' })}
      >
        <DialogContent className="z-50">
          <DialogHeader>
            <DialogTitle>Access Expired</DialogTitle>
            <DialogDescription>
              Your temporary access to <strong>{lab.name}</strong> has expired.
              Result values are no longer visible.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button onClick={() => dispatch({ type: 'DISMISS_EXPIRY_MODAL' })}>
              Acknowledge
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  )
}
