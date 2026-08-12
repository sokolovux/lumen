import type { ReactNode } from 'react'
import { toast } from 'sonner'
import type { Medication } from '@/state/types'
import { useAppState } from '@/state/AppStateContext'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { DemographicsTab } from '@/components/patient/DemographicsTab'
import { AuditTrailTab } from '@/components/patient/AuditTrailTab'
import { LabResultCard } from '@/components/patient/LabResultCard'
import { AddMedicationDialog } from '@/components/patient/AddMedicationDialog'
import { Button } from '@/components/ui/button'
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
import { getVisibleChartLabs } from '@/lib/statusDerivation'
import {
  DEMO_TODAY,
  formatAppointmentTimeDisplay,
  formatScheduleDateLabel,
  getAppointmentForPatientOnDate,
  JORDAN_REYES_ID,
} from '@/lib/scheduleData'
import {
  JORDAN_REYES_ALLERGIES,
  JORDAN_REYES_PAST_VISITS,
  JORDAN_REYES_PROBLEMS,
  JORDAN_REYES_REFERRALS,
  JORDAN_REYES_VITALS_HISTORY,
} from '@/lib/jordanReyesChartData'

const REFERRAL_STATUS_CLASS: Record<
  (typeof JORDAN_REYES_REFERRALS)[number]['statusTone'],
  string
> = {
  amber: 'border-amber-200 bg-amber-50 text-amber-600',
  green: 'border-green-200 bg-green-50 text-green-600',
  destructive: 'border-red-200 bg-red-50 text-red-600',
  blue: 'border-blue-200 bg-blue-50 text-blue-600',
}

const ALLERGY_SEVERITY_CLASS = {
  severe: 'border-destructive/40 bg-destructive/10 text-destructive',
  moderate: 'border-amber-200 bg-amber-50 text-amber-700',
  mild: 'border-gray-200 bg-gray-50 text-gray-600',
} as const

function ChartTabCard({
  badges,
  title,
  meta,
  actions,
}: {
  badges?: ReactNode
  title: ReactNode
  meta?: ReactNode
  actions?: ReactNode
}) {
  return (
    <div>
      <Card>
        <CardContent>
          <div className="flex flex-col items-start gap-(--card-spacing)">
            <div className="flex w-full flex-col gap-1">
              {badges ? (
                <div className="flex flex-wrap items-center gap-1.5">{badges}</div>
              ) : null}
              <div className="min-w-0">
                {title}
                {meta}
              </div>
            </div>
            {actions ? <div className="flex flex-wrap gap-2">{actions}</div> : null}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

function isRecentlyAddedMed(med: Medication): boolean {
  const latest = med.history[med.history.length - 1]
  return latest?.action === 'added' && latest.detail?.toLowerCase().includes('recently added')
}

function isRecentlyCompletedMed(med: Medication): boolean {
  if (med.status !== 'discontinued') {
    return false
  }
  const latest = med.history[med.history.length - 1]
  return latest?.action === 'discontinued' && Boolean(latest.detail?.toLowerCase().includes('completed'))
}

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
  const visibleLabs = getVisibleChartLabs(state.labs, state.role)
  const todayAppointment = getAppointmentForPatientOnDate(JORDAN_REYES_ID, DEMO_TODAY)
  const todayVisitMeta = todayAppointment
    ? `${formatScheduleDateLabel(todayAppointment.date)} · ${formatAppointmentTimeDisplay(todayAppointment.time)}`
    : formatScheduleDateLabel(DEMO_TODAY)

  const handleContinueMed = (med: Medication) => {
    dispatch({ type: 'CONTINUE_MED', medId: med.id })
    toast.success(`${med.name} continued`)
  }

  const handleDiscontinueMed = (med: Medication) => {
    dispatch({ type: 'DISCONTINUE_MED', medId: med.id })
    toast.success(`${med.name} discontinued`)
  }

  const todayVisitButtonLabel =
    state.selectedVisitId === 'today'
      ? 'Visit open'
      : state.noteStatus === 'returned'
        ? 'Revise visit'
        : state.visitFinished ||
            (state.role === 'assistant' &&
              state.hasSubmittedOnce &&
              state.noteStatus !== 'returned')
          ? 'View visit'
          : 'Open visit'

  return (
    <Tabs defaultValue={defaultTab} key={defaultTab} className="min-w-0 flex-1">
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

      <TabsContent value="visits" className="mt-4 min-w-0 space-y-4">
        {(state.visitStarted || state.visitFinished) && (
          <ChartTabCard
            title={<h6>Today&apos;s visit</h6>}
            meta={(
              <>
                <p className="text-sm text-muted-foreground">{todayVisitMeta}</p>
                <p className="text-sm text-muted-foreground">
                  Current encounter. Vitals and note captured in the visit panel.
                </p>
              </>
            )}
            actions={(
              <Button
                variant={state.selectedVisitId === 'today' ? 'outline' : 'default'}
                onClick={onOpenTodayVisit}
                disabled={!canOpenTodayVisit}
              >
                {todayVisitButtonLabel}
              </Button>
            )}
          />
        )}
        <div>
          <h6 className="mb-2">Past visits</h6>
          <div className="space-y-3">
            {JORDAN_REYES_PAST_VISITS.map((visit) => (
              <ChartTabCard
                key={visit.id}
                title={<h6>{visit.label}</h6>}
                meta={<p className="text-sm text-muted-foreground">{visit.summary}</p>}
                actions={(
                  <Button
                    variant="outline"
                    onClick={() => onOpenPastVisit(visit.id)}
                  >
                    {state.selectedVisitId === visit.id ? 'Close' : 'View'}
                  </Button>
                )}
              />
            ))}
          </div>
        </div>
        <div>
          <h6 className="mb-2">Vitals history</h6>
          <Card data-chart-table="">
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead data-column="date">Date</TableHead>
                    <TableHead>BP</TableHead>
                    <TableHead>HR</TableHead>
                    <TableHead>Weight</TableHead>
                    <TableHead>BMI</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {JORDAN_REYES_VITALS_HISTORY.map((entry) => (
                    <TableRow key={entry.date}>
                      <TableCell data-column="date" className="text-muted-foreground">{entry.date}</TableCell>
                      <TableCell>{entry.bloodPressure}</TableCell>
                      <TableCell>{entry.heartRate}</TableCell>
                      <TableCell>{entry.weight} lbs</TableCell>
                      <TableCell>{entry.bmi}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </div>
      </TabsContent>

      <TabsContent value="demographics" className="mt-4">
        <DemographicsTab />
      </TabsContent>

      <TabsContent value="problems" className="mt-4 space-y-4">
        <div>
          <h6 className="mb-2">Problem list</h6>
          <div className="space-y-3">
            {JORDAN_REYES_PROBLEMS.map((problem) => (
              <ChartTabCard
                key={problem.id}
                badges={(
                  <Badge
                    variant="outline"
                    className="border-green-200 bg-green-50 text-green-600"
                  >
                    Active
                  </Badge>
                )}
                title={<h6>{problem.name}</h6>}
                meta={
                  problem.onset ? (
                    <p className="text-sm text-muted-foreground">Onset {problem.onset}</p>
                  ) : undefined
                }
              />
            ))}
          </div>
        </div>
        <div>
          <h6 className="mb-2">Allergies</h6>
          <div className="space-y-3">
            {JORDAN_REYES_ALLERGIES.map((allergy) => (
              <ChartTabCard
                key={allergy.id}
                badges={(
                  <Badge
                    variant="outline"
                    className={ALLERGY_SEVERITY_CLASS[allergy.severity]}
                  >
                    {allergy.severity === 'severe' ? 'Severe (anaphylaxis)' : 'Moderate'}
                  </Badge>
                )}
                title={<h6>{allergy.substance}</h6>}
                meta={<p className="text-sm text-muted-foreground">{allergy.reaction}</p>}
              />
            ))}
          </div>
        </div>
      </TabsContent>

      <TabsContent value="medications" className="mt-4 space-y-4">
        <div className="flex items-center justify-between">
          <h6>Medications</h6>
          <AddMedicationDialog />
        </div>
        <div className="space-y-3">
          {state.meds.map((med) => (
            <ChartTabCard
              key={med.id}
              badges={(
                <>
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
                  {isRecentlyAddedMed(med) && (
                    <Badge
                      variant="outline"
                      className="border-blue-200 bg-blue-50 text-blue-600"
                    >
                      Recently added
                    </Badge>
                  )}
                  {isRecentlyCompletedMed(med) && (
                    <Badge
                      variant="outline"
                      className="border-amber-200 bg-amber-50 text-amber-600"
                    >
                      Recent course completed
                    </Badge>
                  )}
                </>
              )}
              title={<h6>{med.name}</h6>}
              meta={(
                <p className="text-sm text-muted-foreground">
                  {med.dose} · {med.frequency}
                </p>
              )}
              actions={(
                <>
                  <Button variant="outline" onClick={() => handleContinueMed(med)}>
                    Continue
                  </Button>
                  <Button variant="outline" onClick={() => handleDiscontinueMed(med)}>
                    Discontinue
                  </Button>
                </>
              )}
            />
          ))}
        </div>
      </TabsContent>

      <TabsContent value="labs" className="mt-4 space-y-3">
        {visibleLabs.map((lab) => (
          <LabResultCard key={lab.id} lab={lab} />
        ))}
      </TabsContent>

      <TabsContent value="referrals" className="mt-4 space-y-3">
        {JORDAN_REYES_REFERRALS.map((referral) => (
          <ChartTabCard
            key={referral.id}
            badges={(
              <Badge
                variant="outline"
                className={REFERRAL_STATUS_CLASS[referral.statusTone]}
              >
                {referral.status}
              </Badge>
            )}
            title={<h6>{referral.specialty}</h6>}
            meta={(
              <>
                <p className="text-sm text-muted-foreground">{referral.provider}</p>
                <p className="text-sm text-muted-foreground">
                  Ordered {referral.orderedDate}
                  {referral.appointmentDate && ` · Appointment ${referral.appointmentDate}`}
                </p>
              </>
            )}
          />
        ))}
      </TabsContent>

      {state.role === 'physician' && (
        <TabsContent value="audit" className="mt-4 min-w-0">
          <AuditTrailTab />
        </TabsContent>
      )}
    </Tabs>
  )
}

export { JORDAN_REYES_PAST_VISITS as PAST_VISITS }
