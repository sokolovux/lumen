import { useEffect } from 'react'
import { Navigate, useLocation, useParams, useSearchParams } from 'react-router-dom'
import { useAppState } from '@/state/AppStateContext'
import { PageHeader } from '@/components/layout/PageHeader'
import { LightScrollbar } from '@/components/ui/light-scrollbar'
import { PatientDetailTabs, PAST_VISITS } from '@/components/patient/PatientDetailTabs'
import { VisitPanel } from '@/components/patient/VisitPanel'
import { TodayAppointmentBanner } from '@/components/patient/TodayAppointmentBanner'
import { PATIENTS, JORDAN_REYES_ID } from '@/lib/scheduleData'
import { canPhysicianOpenTodayVisit, shouldAutoOpenTodayVisit } from '@/lib/visitLifecycle'

type PatientDetailLocationState = {
  from?: string
  autoOpenTodayVisit?: boolean
}

export function PatientDetailPage() {
  const { patientId } = useParams<{ patientId: string }>()
  const [searchParams] = useSearchParams()
  const location = useLocation()
  const { state, dispatch } = useAppState()
  const locationState = location.state as PatientDetailLocationState | null
  const backTo = locationState?.from ?? '/patients'

  const tabParam = searchParams.get('tab')
  const defaultTab = ['demographics', 'problems', 'medications', 'labs', 'referrals', 'visits', 'audit'].includes(tabParam ?? '')
    ? tabParam!
    : 'demographics'

  const patient = PATIENTS.find((p) => p.id === patientId)

  if (!patient) {
    return <Navigate to="/patients" replace />
  }

  if (patientId !== JORDAN_REYES_ID) {
    return <Navigate to="/patients" replace />
  }

  const todayPanelOpen = state.selectedVisitId === 'today'
  const showTodayVisitPanel = todayPanelOpen && !state.visitFinished
  const showPastVisitPanel =
    state.selectedVisitId !== null && state.selectedVisitId !== 'today'
  const showVisitPanel = showTodayVisitPanel || showPastVisitPanel
  const showBanner = !state.visitFinished

  useEffect(() => {
    if (!locationState?.autoOpenTodayVisit) {
      return
    }
    if (!shouldAutoOpenTodayVisit(state.role, state)) {
      return
    }
    dispatch({ type: 'OPEN_VISIT', visitId: 'today' })
  }, [
    dispatch,
    locationState?.autoOpenTodayVisit,
    state.role,
    state.visitStarted,
    state.visitFinished,
    state.hasSubmittedOnce,
    state.noteStatus,
  ])

  const handleOpenTodayVisit = () => {
    if (state.role === 'physician' && !canPhysicianOpenTodayVisit(state)) {
      return
    }
    dispatch({ type: 'OPEN_VISIT', visitId: 'today' })
  }

  const handleOpenPastVisit = (visitId: string) => {
    dispatch({ type: 'OPEN_VISIT', visitId })
  }

  const pastVisit = PAST_VISITS.find((v) => v.id === state.selectedVisitId)

  return (
    <div className="flex h-full overflow-hidden">
      <div className="flex flex-1 flex-col overflow-hidden">
        <div data-slot="patient-detail-chrome" className="relative shrink-0">
          <PageHeader title={patient.name} backTo={backTo} />
          {showBanner && (
            <div
              data-slot="banner-slide-port"
              data-panel-open={todayPanelOpen ? 'true' : 'false'}
            >
              <TodayAppointmentBanner
                patientId={patient.id}
                panelOpen={todayPanelOpen}
              />
            </div>
          )}
        </div>
        <LightScrollbar className="min-h-0 flex-1">
          <div className="p-6">
            <PatientDetailTabs
              defaultTab={defaultTab}
              onOpenTodayVisit={handleOpenTodayVisit}
              onOpenPastVisit={handleOpenPastVisit}
              canOpenTodayVisit={
                state.role === 'assistant'
                  ? !state.visitFinished
                  : canPhysicianOpenTodayVisit(state)
              }
            />
          </div>
        </LightScrollbar>
      </div>
      {showVisitPanel && (
        <VisitPanel
          open={showVisitPanel}
          visitLabel={
            state.selectedVisitId === 'today'
              ? "Today's visit"
              : pastVisit?.label ?? 'Past visit'
          }
          isPastVisit={showPastVisitPanel}
        />
      )}
    </div>
  )
}
