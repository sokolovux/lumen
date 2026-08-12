import { Navigate } from 'react-router-dom'
import { useAppState } from '@/state/AppStateContext'
import { Separator } from '@/components/ui/separator'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent } from '@/components/ui/card'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import {
  AUDIT_TRAIL_OMISSIONS,
  formatAuditEventDescription,
  formatNoteRevisionLine,
  getAuditActorLabel,
  groupAuditEventsReverseChronological,
  hasAuditTrailContent,
  splitAuditTimestamp,
} from '@/lib/auditTrail'
import { JORDAN_REYES_ID } from '@/lib/scheduleData'

export function AuditTrailTab() {
  const { state } = useAppState()

  if (state.role !== 'physician') {
    return <Navigate to={`/patients/${JORDAN_REYES_ID}?tab=demographics`} replace />
  }

  const timelineGroups = groupAuditEventsReverseChronological(state.auditLog)
  const noteRevisions = [...state.noteHistory].reverse()

  return (
    <div className="min-w-0 space-y-6">
      <div>
        <h6>Activity timeline</h6>
        <p className="text-sm text-muted-foreground">
          Reverse-chronological history of chart activity for Jordan Reyes.
        </p>
      </div>

      {!hasAuditTrailContent(state) ? (
        <p className="text-sm text-muted-foreground">No audit events recorded yet.</p>
      ) : (
        <div className="min-w-0 space-y-4">
          {timelineGroups.map((group) => (
            <section key={group.dayLabel} className="min-w-0 space-y-2">
              <h6>{group.dayLabel}</h6>
              <Card data-chart-table="">
                <CardContent>
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead data-column="time">Time</TableHead>
                        <TableHead>Actor</TableHead>
                        <TableHead>Event</TableHead>
                        <TableHead data-wrap="true">Description</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {group.events.map((event) => {
                        const { timeLabel } = splitAuditTimestamp(event.timestamp)
                        return (
                          <TableRow key={event.id}>
                            <TableCell data-column="time" className="text-muted-foreground">{timeLabel}</TableCell>
                            <TableCell>{getAuditActorLabel(event.actor)}</TableCell>
                            <TableCell>
                              <div className="flex flex-wrap gap-1">
                                <Badge variant="outline">{event.action}</Badge>
                              </div>
                            </TableCell>
                            <TableCell data-wrap="true">
                              {formatAuditEventDescription(event)}
                            </TableCell>
                          </TableRow>
                        )
                      })}
                    </TableBody>
                  </Table>
                </CardContent>
              </Card>
            </section>
          ))}
        </div>
      )}

      {noteRevisions.length > 0 && (
        <>
          <Separator />
          <div className="space-y-2">
            <h6>Clinical note revisions</h6>
            <p className="text-sm text-muted-foreground">
              Note workflow events across all visits, most recent first.
            </p>
            <Card data-chart-table="">
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead data-column="time">Timestamp</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead data-wrap="true">Detail</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {noteRevisions.map((entry) => {
                      const { timeLabel } = splitAuditTimestamp(entry.timestamp)
                      return (
                      <TableRow key={entry.id}>
                        <TableCell data-column="time" className="text-muted-foreground">{timeLabel}</TableCell>
                        <TableCell>
                          <div className="flex flex-wrap gap-1">
                            <Badge variant="outline">
                              {entry.status === 'submitted'
                                ? 'Submitted'
                                : entry.status === 'returned'
                                  ? 'Returned'
                                  : 'Approved'}
                            </Badge>
                          </div>
                        </TableCell>
                        <TableCell data-wrap="true">{formatNoteRevisionLine(entry)}</TableCell>
                      </TableRow>
                      )
                    })}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </div>
        </>
      )}

      <Separator />
      <div className="space-y-2">
        <h6>Not tracked in this demo</h6>
        {AUDIT_TRAIL_OMISSIONS.map((item) => (
          <p key={item} className="text-sm text-muted-foreground">
            {item}
          </p>
        ))}
      </div>
    </div>
  )
}
