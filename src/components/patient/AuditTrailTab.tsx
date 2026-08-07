import { useAppState } from '@/state/AppStateContext'
import { ScrollArea } from '@/components/ui/scroll-area'

export function AuditTrailTab() {
  const { state } = useAppState()

  if (state.role !== 'physician') {
    return (
      <p className="text-sm text-muted-foreground">
        Audit trail is available to physicians only.
      </p>
    )
  }

  if (state.auditLog.length === 0) {
    return (
      <p className="text-sm text-muted-foreground">No audit events recorded yet.</p>
    )
  }

  return (
    <ScrollArea className="h-[400px]">
      <table className="w-full text-sm">
        <thead>
          <tr className="border-b text-left text-xs text-muted-foreground">
            <th className="pb-2 pr-4 font-medium">Timestamp</th>
            <th className="pb-2 pr-4 font-medium">Actor</th>
            <th className="pb-2 pr-4 font-medium">Action</th>
            <th className="pb-2 font-medium">Detail</th>
          </tr>
        </thead>
        <tbody>
          {[...state.auditLog].reverse().map((event) => (
            <tr key={event.id} className="border-b">
              <td className="py-2 pr-4 text-xs text-muted-foreground">{event.timestamp}</td>
              <td className="py-2 pr-4 capitalize">{event.actor === 'pa' ? 'PA' : 'Physician'}</td>
              <td className="py-2 pr-4">{event.action}</td>
              <td className="py-2 text-muted-foreground">{event.detail}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </ScrollArea>
  )
}
