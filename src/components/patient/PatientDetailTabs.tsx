import { toast } from 'sonner'
import type { Medication } from '@/state/types'
import { useAppState } from '@/state/AppStateContext'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Skeleton } from '@/components/ui/skeleton'
import { ScrollArea } from '@/components/ui/scroll-area'
import { LabResultCard } from '@/components/patient/LabResultCard'
import { AddMedicationDialog } from '@/components/patient/AddMedicationDialog'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'

const PAST_VISITS = [
  { id: 'visit-2026-08-03', label: 'Aug 3, 2026 — Follow-up' },
  { id: 'visit-2026-07-20', label: 'Jul 20, 2026 — Annual physical' },
]

interface PatientDetailTabsProps {
  onOpenTodayVisit: () => void
  onOpenPastVisit: (visitId: string) => void
  defaultTab?: string
}

export function PatientDetailTabs({
  onOpenTodayVisit,
  onOpenPastVisit,
  defaultTab = 'visits',
}: PatientDetailTabsProps) {
  const { state, dispatch } = useAppState()

  const handleContinueMed = (med: Medication) => {
    dispatch({ type: 'CONTINUE_MED', medId: med.id })
    toast.success(`${med.name} continued`)
  }

  const handleDiscontinueMed = (med: Medication) => {
    dispatch({ type: 'DISCONTINUE_MED', medId: med.id })
    toast.success(`${med.name} discontinued`)
  }

  return (
    <Tabs defaultValue={defaultTab} key={defaultTab} className="flex-1">
      <TabsList>
        <TabsTrigger value="visits">Visits</TabsTrigger>
        <TabsTrigger value="demographics">Demographics</TabsTrigger>
        <TabsTrigger value="problems">Problems & meds</TabsTrigger>
        <TabsTrigger value="labs">Labs & results</TabsTrigger>
        {state.role === 'physician' && (
          <TabsTrigger value="audit">Audit trail</TabsTrigger>
        )}
      </TabsList>

      <TabsContent value="visits" className="mt-4 space-y-3">
        <div className="rounded-lg border p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="font-medium">Today&apos;s visit</p>
              <p className="text-xs text-muted-foreground">Aug 10, 2026 · 10:30 AM</p>
            </div>
            <Button
              size="sm"
              variant={state.selectedVisitId === 'today' ? 'secondary' : 'default'}
              onClick={onOpenTodayVisit}
            >
              {state.selectedVisitId === 'today' ? 'Visit open' : 'Open visit'}
            </Button>
          </div>
        </div>
        <p className="text-xs font-medium text-muted-foreground">Past visits</p>
        {PAST_VISITS.map((visit) => (
          <div key={visit.id} className="rounded-lg border p-4">
            <div className="flex items-center justify-between">
              <p className="text-sm">{visit.label}</p>
              <Button
                size="sm"
                variant={state.selectedVisitId === visit.id ? 'secondary' : 'outline'}
                onClick={() => onOpenPastVisit(visit.id)}
              >
                {state.selectedVisitId === visit.id ? 'Open' : 'View'}
              </Button>
            </div>
          </div>
        ))}
      </TabsContent>

      <TabsContent value="demographics" className="mt-4 space-y-3">
        {['Name', 'Date of birth', 'MRN', 'Address', 'Phone', 'Insurance'].map((field) => (
          <div key={field} className="flex items-center justify-between border-b pb-2">
            <span className="text-sm text-muted-foreground">{field}</span>
            <Skeleton className="h-4 w-32" />
          </div>
        ))}
      </TabsContent>

      <TabsContent value="problems" className="mt-4 space-y-4">
        <div>
          <h6 className="mb-2">Problem list</h6>
          <div className="space-y-2">
            {['Hypertension', 'Type 2 Diabetes'].map((problem) => (
              <div key={problem} className="rounded-md border p-2">
                <p className="text-sm">{problem}</p>
                <Skeleton className="mt-1 h-3 w-24" />
              </div>
            ))}
          </div>
        </div>
        <div>
          <div className="mb-2 flex items-center justify-between">
            <h6>Medications</h6>
            <AddMedicationDialog />
          </div>
          <div className="space-y-2">
            {state.meds.map((med) => (
              <div key={med.id} className="rounded-lg border p-3">
                <div className="flex items-start justify-between">
                  <div>
                    <p className="text-sm font-medium">{med.name}</p>
                    <p className="text-xs text-muted-foreground">
                      {med.dose} · {med.frequency}
                    </p>
                  </div>
                  <Badge
                    variant="outline"
                    className={
                      med.status === 'active'
                        ? 'border-green-200 bg-green-50 text-green-700'
                        : 'border-destructive/30 bg-destructive/10 text-destructive'
                    }
                  >
                    {med.status === 'active' ? 'Active' : 'Discontinued'}
                  </Badge>
                </div>
                <div className="mt-2 flex gap-2">
                  <Button size="sm" variant="outline" onClick={() => handleContinueMed(med)}>
                    Continue
                  </Button>
                  <Button size="sm" variant="outline" onClick={() => handleDiscontinueMed(med)}>
                    Discontinue
                  </Button>
                </div>
                {med.history.length > 0 && (
                  <ul className="mt-2 space-y-0.5">
                    {med.history.map((event) => (
                      <li key={event.id} className="text-xs text-muted-foreground">
                        {event.timestamp} — {event.action} by{' '}
                        {event.actor === 'pa' ? 'PA' : 'Physician'}
                        {event.detail && ` (${event.detail})`}
                      </li>
                    ))}
                  </ul>
                )}
              </div>
            ))}
          </div>
        </div>
      </TabsContent>

      <TabsContent value="labs" className="mt-4 space-y-3">
        {state.labs.map((lab) => (
          <LabResultCard key={lab.id} lab={lab} />
        ))}
      </TabsContent>

      {state.role === 'physician' && (
        <TabsContent value="audit" className="mt-4">
          {state.auditLog.length === 0 ? (
            <p className="text-sm text-muted-foreground">No audit events recorded yet.</p>
          ) : (
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
                      <td className="py-2 pr-4 capitalize">
                        {event.actor === 'pa' ? 'PA' : 'Physician'}
                      </td>
                      <td className="py-2 pr-4">{event.action}</td>
                      <td className="py-2 text-muted-foreground">{event.detail}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </ScrollArea>
          )}
        </TabsContent>
      )}
    </Tabs>
  )
}

export { PAST_VISITS }
