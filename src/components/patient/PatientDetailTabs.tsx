import { useAppState } from '@/state/AppStateContext'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Skeleton } from '@/components/ui/skeleton'
import { LabResultCard } from '@/components/patient/LabResultCard'
import { MedicationRow } from '@/components/patient/MedicationRow'
import { AddMedicationDialog } from '@/components/patient/AddMedicationDialog'
import { AuditTrailTab } from '@/components/patient/AuditTrailTab'
import { Button } from '@/components/ui/button'

const PAST_VISITS = [
  { id: 'visit-2026-08-03', label: 'Aug 3, 2026 — Follow-up' },
  { id: 'visit-2026-07-20', label: 'Jul 20, 2026 — Annual Physical' },
]

interface PatientDetailTabsProps {
  onOpenTodayVisit: () => void
  onOpenPastVisit: (visitId: string) => void
  defaultTab?: string
  highlightLabId?: string
}

export function PatientDetailTabs({
  onOpenTodayVisit,
  onOpenPastVisit,
  defaultTab = 'visits',
  highlightLabId,
}: PatientDetailTabsProps) {
  const { state } = useAppState()

  return (
    <Tabs defaultValue={defaultTab} key={`${defaultTab}-${highlightLabId ?? ''}`} className="flex-1">
      <TabsList>
        <TabsTrigger value="visits">Visits</TabsTrigger>
        <TabsTrigger value="demographics">Demographics</TabsTrigger>
        <TabsTrigger value="problems">Problems & Meds</TabsTrigger>
        <TabsTrigger value="labs">Labs & Results</TabsTrigger>
        {state.role === 'physician' && (
          <TabsTrigger value="audit">Audit Trail</TabsTrigger>
        )}
      </TabsList>

      <TabsContent value="visits" className="mt-4 space-y-3">
        <div className="rounded-lg border p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="font-medium">Today&apos;s Visit</p>
              <p className="text-xs text-muted-foreground">Aug 10, 2026 · 10:30 AM</p>
            </div>
            <Button
              size="sm"
              variant={state.selectedVisitId === 'today' ? 'secondary' : 'default'}
              onClick={onOpenTodayVisit}
            >
              {state.selectedVisitId === 'today' ? 'Visit Open' : 'Open Visit'}
            </Button>
          </div>
        </div>
        <p className="text-xs font-medium text-muted-foreground">Past Visits</p>
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
        {['Name', 'Date of Birth', 'MRN', 'Address', 'Phone', 'Insurance'].map((field) => (
          <div key={field} className="flex items-center justify-between border-b pb-2">
            <span className="text-sm text-muted-foreground">{field}</span>
            <Skeleton className="h-4 w-32" />
          </div>
        ))}
      </TabsContent>

      <TabsContent value="problems" className="mt-4 space-y-4">
        <div>
          <h3 className="mb-2 text-sm font-medium">Problem List</h3>
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
            <h3 className="text-sm font-medium">Medications</h3>
            <AddMedicationDialog />
          </div>
          <div className="space-y-2">
            {state.meds.map((med) => (
              <MedicationRow key={med.id} med={med} />
            ))}
          </div>
        </div>
      </TabsContent>

      <TabsContent value="labs" className="mt-4 space-y-3">
        {state.labs.map((lab) => (
          <LabResultCard
            key={lab.id}
            lab={lab}
            highlighted={lab.id === highlightLabId}
          />
        ))}
      </TabsContent>

      {state.role === 'physician' && (
        <TabsContent value="audit" className="mt-4">
          <AuditTrailTab />
        </TabsContent>
      )}
    </Tabs>
  )
}

export { PAST_VISITS }
