import { Navigate, useLocation, useParams, useSearchParams } from 'react-router-dom'
import { useAppState } from '@/state/AppStateContext'
import { PageHeader } from '@/components/layout/PageHeader'
import { LightScrollbar } from '@/components/ui/light-scrollbar'
import { PatientDetailTabs, PAST_VISITS } from '@/components/patient/PatientDetailTabs'
import { VisitPanel } from '@/components/patient/VisitPanel'
import { TodayAppointmentBanner } from '@/components/patient/TodayAppointmentBanner'
import { PATIENTS, JORDAN_REYES_ID } from '@/lib/scheduleData'

type PatientDetailLocationState = {
  from?: string
}

export function PatientDetailPage() {
  const { patientId } = useParams<{ patientId: string }>()
  const [searchParams] = useSearchParams()
  const location = useLocation()
  const { state, dispatch } = useAppState()
  const backTo =
    (location.state as PatientDetailLocationState | null)?.from ?? '/patients'

  const tabParam = searchParams.get('tab')
  const defaultTab = ['demographics', 'problems', 'labs', 'visits', 'audit'].includes(tabParam ?? '')
    ? tabParam!
    : 'demographics'

  const patient = PATIENTS.find((p) => p.id === patientId)

  if (!patient) {
    return <Navigate to="/patients" replace />
  }

  if (patientId !== JORDAN_REYES_ID) {
    return <Navigate to="/patients" replace />
  }

  const handleOpenTodayVisit = () => {
    dispatch({ type: 'OPEN_VISIT', visitId: 'today' })
  }

  const handleOpenPastVisit = (visitId: string) => {
    dispatch({ type: 'OPEN_VISIT', visitId })
  }

  const pastVisit = PAST_VISITS.find((v) => v.id === state.selectedVisitId)
  const showVisitPanel = state.selectedVisitId !== null

  return (
    <div className="flex h-full overflow-hidden">
      <div className="flex flex-1 flex-col overflow-hidden">
        <PageHeader title={patient.name} backTo={backTo} />
        <TodayAppointmentBanner patientId={patient.id} />
        <LightScrollbar className="min-h-0 flex-1">
          <div className="p-6">
            <PatientDetailTabs
              defaultTab={defaultTab}
              onOpenTodayVisit={handleOpenTodayVisit}
              onOpenPastVisit={handleOpenPastVisit}
            />
          </div>
        </LightScrollbar>
      </div>
      <VisitPanel
        open={showVisitPanel}
        visitLabel={
          state.selectedVisitId === 'today'
            ? "Today's visit"
            : pastVisit?.label ?? 'Past visit'
        }
        isPastVisit={
          state.selectedVisitId !== null && state.selectedVisitId !== 'today'
        }
      />
    </div>
  )
}
