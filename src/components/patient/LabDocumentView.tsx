import { useAppState } from '@/state/AppStateContext'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Skeleton } from '@/components/ui/skeleton'
import { cn } from '@/lib/utils'

interface LabDocumentViewProps {
  labId: string | null
  open: boolean
  onOpenChange: (open: boolean) => void
}

export function LabDocumentView({ labId, open, onOpenChange }: LabDocumentViewProps) {
  const { state } = useAppState()
  const lab = state.labs.find((l) => l.id === labId)
  const isPa = state.role === 'pa'
  const showExpiredOverlay = isPa && lab?.status === 'expired'

  if (!lab) return null

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-lg sm:max-w-xl">
        <DialogHeader>
          <DialogTitle>{lab.name}</DialogTitle>
          <DialogDescription>
            Ordered {lab.orderDate} · Placeholder document content
          </DialogDescription>
        </DialogHeader>

        <div className="relative min-h-56 overflow-hidden rounded-lg border">
          <div
            className={cn(
              'space-y-3 p-4 transition-[filter] duration-300',
              showExpiredOverlay && 'pointer-events-none select-none blur-sm',
            )}
          >
            <Skeleton className="h-4 w-2/3" />
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-4 w-5/6" />
            <Skeleton className="h-4 w-4/5" />
            <div className="space-y-2 pt-2">
              <Skeleton className="h-20 w-full" />
              <Skeleton className="h-4 w-1/2" />
              <Skeleton className="h-4 w-3/4" />
            </div>
            <p className="text-xs text-muted-foreground">
              Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do
              eiusmod tempor incididunt ut labore et dolore magna aliqua.
            </p>
          </div>

          {showExpiredOverlay && (
            <div className="absolute inset-0 flex flex-col items-center justify-center gap-3 bg-background/70 px-6 text-center">
              <p className="text-base"><strong>Access has expired</strong></p>
              <p className="max-w-sm text-sm text-muted-foreground">
                Your temporary access window closed. Request access again if you
                still need this result.
              </p>
              <Button onClick={() => onOpenChange(false)}>Close</Button>
            </div>
          )}
        </div>

        {!showExpiredOverlay && (
          <DialogFooter>
            <Button variant="outline" onClick={() => onOpenChange(false)}>
              Close
            </Button>
          </DialogFooter>
        )}
      </DialogContent>
    </Dialog>
  )
}
