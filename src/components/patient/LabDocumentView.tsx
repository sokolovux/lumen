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
import { Card, CardContent } from '@/components/ui/card'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { cn } from '@/lib/utils'
import { JORDAN_REYES_LAB_DOCUMENTS } from '@/lib/jordanReyesChartData'

interface LabDocumentViewProps {
  labId: string | null
  open: boolean
  onOpenChange: (open: boolean) => void
}

const TREND_FLAG_CLASS = {
  high: 'text-destructive',
  low: 'text-blue-600',
  normal: 'text-muted-foreground',
} as const

export function LabDocumentView({ labId, open, onOpenChange }: LabDocumentViewProps) {
  const { state } = useAppState()
  const lab = state.labs.find((l) => l.id === labId)
  const isAssistant = state.role === 'assistant'
  const showExpiredOverlay = isAssistant && lab?.status === 'expired'

  if (!lab) return null

  const document = JORDAN_REYES_LAB_DOCUMENTS[lab.id]

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent scoped className="max-w-lg sm:max-w-xl">
        <DialogHeader>
          <DialogTitle>{lab.name}</DialogTitle>
          <DialogDescription>
            {lab.type === 'imaging' ? 'Imaging' : 'Laboratory'} · Ordered {lab.orderDate}
            {document?.summary ? ` · ${document.summary}` : ''}
          </DialogDescription>
        </DialogHeader>

        <div className="relative min-h-56 overflow-hidden rounded-md border">
          <div
            className={cn(
              'min-w-0 space-y-4 p-4 transition-[filter] duration-300',
              showExpiredOverlay && 'pointer-events-none select-none blur-sm',
            )}
          >
            {document?.rows && document.rows.length > 0 && (
              <div className="min-w-0">
                {document.trendLabel && (
                  <p className="mb-2 text-sm">
                    <strong>{document.trendLabel}</strong>
                    {document.unit ? ` (${document.unit})` : ''}
                  </p>
                )}
                <Card data-chart-table="">
                  <CardContent>
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead data-column="date">Date</TableHead>
                          <TableHead data-wrap="true">Result</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {document.rows.map((row) => (
                          <TableRow key={row.date}>
                            <TableCell data-column="date" className="text-muted-foreground">{row.date}</TableCell>
                            <TableCell
                              data-wrap="true"
                              className={row.flag ? TREND_FLAG_CLASS[row.flag] : undefined}
                            >
                              {row.value}
                              {row.flag === 'high' && ' ↑'}
                              {row.flag === 'low' && ' ↓'}
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </CardContent>
                </Card>
              </div>
            )}

            {document?.narrative?.map((line) => (
              <p key={line} className="text-sm text-muted-foreground">
                {line}
              </p>
            ))}

            {!document && (
              <p className="text-sm text-muted-foreground">
                Result document unavailable.
              </p>
            )}
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
