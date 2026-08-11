import { useEffect } from 'react'
import { Navigate, useLocation, useParams, useSearchParams } from 'react-router-dom'
import { CalendarPlus, MessageCircle, Phone, Settings } from 'lucide-react'
import { useAppState } from '@/state/AppStateContext'
import { PageHeader } from '@/components/layout/PageHeader'
import { PageContent } from '@/components/layout/PageContent'
import { Button } from '@/components/ui/button'
import { LightScrollbar } from '@/components/ui/light-scrollbar'
import { PatientDetailTabs, PAST_VISITS } from '@/components/patient/PatientDetailTabs'
import { VisitPanel } from '@/components/patient/VisitPanel'
import { TodayAppointmentBanner } from '@/components/patient/TodayAppointmentBanner'
import { PATIENTS, JORDAN_REYES_ID } from '@/lib/scheduleData'
import { canPhysicianOpenTodayVisit, canAssistantOpenTodayVisit, shouldAutoOpenTodayVisit } from '@/lib/visitLifecycle'

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
  const showTodayVisitPanel = todayPanelOpen
  const showPastVisitPanel =
    state.selectedVisitId !== null && state.selectedVisitId !== 'today'
  const showVisitPanel = showTodayVisitPanel || showPastVisitPanel
  const todayVisitFinished =
    state.visitFinished && state.noteStatus !== 'returned'
  const todayVisitLabel = todayVisitFinished ? "Today's visit" : 'Visit in progress'

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
          <PageHeader
            title={(
              <div className="flex min-w-0 items-center gap-2">
                <h3>{patient.name}</h3>
                <p className="text-sm">{patient.mrn}</p>
              </div>
            )}
            backTo={backTo}
          >
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="icon-default"
                type="button"
                aria-label="Patient settings"
                onClick={() => console.log('Patient settings')}
              >
                <Settings />
              </Button>
              <Button
                variant="outline"
                type="button"
                onClick={() => console.log('Message patient')}
              >
                <MessageCircle data-icon="inline-start" />
                Message
              </Button>
              <Button
                variant="outline"
                type="button"
                onClick={() => console.log('Call patient')}
              >
                <Phone data-icon="inline-start" />
                Call
              </Button>
              <Button
                variant="outline"
                type="button"
                onClick={() => console.log('Schedule visit')}
              >
                <CalendarPlus data-icon="inline-start" />
                Schedule visit
              </Button>
            </div>
          </PageHeader>
          <div
            data-slot="banner-slide-port"
            data-panel-open={todayPanelOpen ? 'true' : 'false'}
          >
            <TodayAppointmentBanner
              patientId={patient.id}
              panelOpen={todayPanelOpen}
            />
          </div>
        </div>
        <LightScrollbar className="min-h-0 flex-1">
          <PageContent>
            <PatientDetailTabs
              defaultTab={defaultTab}
              onOpenTodayVisit={handleOpenTodayVisit}
              onOpenPastVisit={handleOpenPastVisit}
              canOpenTodayVisit={
                state.role === 'assistant'
                  ? canAssistantOpenTodayVisit(state)
                  : canPhysicianOpenTodayVisit(state)
              }
            />
          </PageContent>
        </LightScrollbar>
      </div>
      <VisitPanel
        open={showVisitPanel}
        visitLabel={
          state.selectedVisitId === 'today'
            ? todayVisitLabel
            : pastVisit?.label ?? 'Past visit'
        }
        isPastVisit={showPastVisitPanel}
      />
    </div>
  )
}
