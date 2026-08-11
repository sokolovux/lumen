import { toast } from 'sonner'
import type { Medication } from '@/state/types'
import { useAppState } from '@/state/AppStateContext'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Skeleton } from '@/components/ui/skeleton'
import { DemographicsTab } from '@/components/patient/DemographicsTab'
import { LightScrollbar } from '@/components/ui/light-scrollbar'
import { LabResultCard } from '@/components/patient/LabResultCard'
import { AddMedicationDialog } from '@/components/patient/AddMedicationDialog'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { getRoleLabel } from '@/lib/statusDerivation'

const PAST_VISITS = [
  { id: 'visit-2026-08-03', label: 'Aug 3, 2026 — Follow-up' },
  { id: 'visit-2026-07-20', label: 'Jul 20, 2026 — Annual physical' },
]

const REFERRALS = [
  {
    id: 'referral-1',
    specialty: 'Cardiology',
    provider: 'Dr. Anita Patel',
    status: 'Scheduled',
    orderedDate: 'Jul 28, 2026',
    appointmentDate: 'Aug 18, 2026',
  },
  {
    id: 'referral-2',
    specialty: 'Endocrinology',
    provider: 'Dr. Marcus Chen',
    status: 'Pending',
    orderedDate: 'Aug 5, 2026',
    appointmentDate: null,
  },
]

interface PatientDetailTabsProps {
  onOpenTodayVisit: () => void
  onOpenPastVisit: (visitId: string) => void
  canOpenTodayVisit?: boolean
  defaultTab?: string
}

export function PatientDetailTabs({
  onOpenTodayVisit,
  onOpenPastVisit,
  canOpenTodayVisit = true,
  defaultTab = 'demographics',
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
        <TabsTrigger value="demographics">Demographics</TabsTrigger>
        <TabsTrigger value="problems">Problems & allergies</TabsTrigger>
        <TabsTrigger value="medications">Medications</TabsTrigger>
        <TabsTrigger value="labs">Labs & results</TabsTrigger>
        <TabsTrigger value="referrals">Referrals</TabsTrigger>
        <TabsTrigger value="visits">Visit history</TabsTrigger>
        {state.role === 'physician' && (
          <TabsTrigger value="audit">Audit trail</TabsTrigger>
        )}
      </TabsList>

      <TabsContent value="visits" className="mt-4 space-y-3">
        {(state.visitStarted || state.visitFinished) && (
          <div data-slot="patient-tab-card" className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p><strong>Today&apos;s visit</strong></p>
                <p className="text-xs text-muted-foreground">Aug 10, 2026 · 10:30 AM</p>
              </div>
              <Button
                size="sm"
                variant={state.selectedVisitId === 'today' ? 'outline' : 'default'}
                onClick={onOpenTodayVisit}
                disabled={!canOpenTodayVisit}
              >
                {state.selectedVisitId === 'today'
                  ? 'Visit open'
                  : state.noteStatus === 'returned'
                    ? 'Revise visit'
                    : state.visitFinished ||
                        (state.role === 'assistant' &&
                          state.hasSubmittedOnce &&
                          state.noteStatus !== 'returned')
                      ? 'View visit'
                      : 'Open visit'}
              </Button>
            </div>
          </div>
        )}
        <p className="text-xs"><strong>Past visits</strong></p>
        {PAST_VISITS.map((visit) => (
          <div key={visit.id} data-slot="patient-tab-card" className="p-4">
            <div className="flex items-center justify-between">
              <p className="text-sm">{visit.label}</p>
              <Button
                size="sm"
                variant="outline"
                onClick={() => onOpenPastVisit(visit.id)}
              >
                {state.selectedVisitId === visit.id ? 'Open' : 'View'}
              </Button>
            </div>
          </div>
        ))}
      </TabsContent>

      <TabsContent value="demographics" className="mt-4">
        <DemographicsTab />
      </TabsContent>

      <TabsContent value="problems" className="mt-4 space-y-4">
        <div>
          <h6 className="mb-2">Problem list</h6>
          <div className="space-y-2">
            {['Hypertension', 'Type 2 Diabetes'].map((problem) => (
              <div key={problem} data-slot="patient-tab-card" className="p-2">
                <p className="text-sm">{problem}</p>
                <Skeleton className="mt-1 h-3 w-24" />
              </div>
            ))}
          </div>
        </div>
        <div>
          <h6 className="mb-2">Allergies</h6>
          <div className="space-y-2">
            {['Penicillin', 'Sulfa drugs'].map((allergy) => (
              <div key={allergy} data-slot="patient-tab-card" className="p-2">
                <p className="text-sm">{allergy}</p>
                <Skeleton className="mt-1 h-3 w-24" />
              </div>
            ))}
          </div>
        </div>
      </TabsContent>

      <TabsContent value="medications" className="mt-4 space-y-4">
        <div className="flex items-center justify-between">
          <h6>Medications</h6>
          <AddMedicationDialog />
        </div>
        <div className="space-y-2">
          {state.meds.map((med) => (
            <div key={med.id} data-slot="patient-tab-card" className="p-3">
              <div className="flex items-start justify-between">
                <div>
                  <p className="text-sm"><strong>{med.name}</strong></p>
                  <p className="text-xs text-muted-foreground">
                    {med.dose} · {med.frequency}
                  </p>
                </div>
                <Badge
                  variant="outline"
                  className={
                    med.status === 'active'
                      ? 'border-green-200 bg-green-50 text-green-600'
                      : 'border-red-200 bg-red-50 text-red-600'
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
                      {getRoleLabel(event.actor)}
                      {event.detail && ` (${event.detail})`}
                    </li>
                  ))}
                </ul>
              )}
            </div>
          ))}
        </div>
      </TabsContent>

      <TabsContent value="labs" className="mt-4 space-y-3">
        {state.labs.map((lab) => (
          <LabResultCard key={lab.id} lab={lab} />
        ))}
      </TabsContent>

      <TabsContent value="referrals" className="mt-4 space-y-3">
        {REFERRALS.map((referral) => (
          <div key={referral.id} data-slot="patient-tab-card" className="p-4">
            <div className="flex items-start justify-between gap-4">
              <div>
                <p className="text-sm"><strong>{referral.specialty}</strong></p>
                <p className="text-xs text-muted-foreground">{referral.provider}</p>
                <p className="text-xs text-muted-foreground">
                  Ordered {referral.orderedDate}
                  {referral.appointmentDate && ` · Appointment ${referral.appointmentDate}`}
                </p>
              </div>
              <Badge
                variant="outline"
                className={
                  referral.status === 'Scheduled'
                    ? 'border-green-200 bg-green-50 text-green-600'
                    : 'border-amber-200 bg-amber-50 text-amber-600'
                }
              >
                {referral.status}
              </Badge>
            </div>
          </div>
        ))}
      </TabsContent>

      {state.role === 'physician' && (
        <TabsContent value="audit" className="mt-4">
          {state.auditLog.length === 0 ? (
            <p className="text-sm text-muted-foreground">No audit events recorded yet.</p>
          ) : (
            <LightScrollbar className="h-[400px]">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b text-left text-xs text-muted-foreground">
                    <th className="pb-2 pr-4"><strong>Timestamp</strong></th>
                    <th className="pb-2 pr-4"><strong>Actor</strong></th>
                    <th className="pb-2 pr-4"><strong>Action</strong></th>
                    <th className="pb-2"><strong>Detail</strong></th>
                  </tr>
                </thead>
                <tbody>
                  {[...state.auditLog].reverse().map((event) => (
                    <tr key={event.id} className="border-b">
                      <td className="py-2 pr-4 text-xs text-muted-foreground">{event.timestamp}</td>
                      <td className="py-2 pr-4">
                        {getRoleLabel(event.actor)}
                      </td>
                      <td className="py-2 pr-4">{event.action}</td>
                      <td className="py-2 text-muted-foreground">{event.detail}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </LightScrollbar>
          )}
        </TabsContent>
      )}
    </Tabs>
  )
}

export { PAST_VISITS }
