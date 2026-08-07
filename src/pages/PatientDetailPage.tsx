import { Navigate, useParams } from 'react-router-dom'
import { useAppState } from '@/state/AppStateContext'
import { Breadcrumb } from '@/components/layout/Breadcrumb'
import { PatientDetailTabs, PAST_VISITS } from '@/components/patient/PatientDetailTabs'
import { VisitPanel } from '@/components/patient/VisitPanel'
import { ExpiryLightbox } from '@/components/patient/ExpiryLightbox'
import { PATIENTS, JORDAN_REYES_ID } from '@/lib/scheduleData'

export function PatientDetailPage() {
  const { patientId } = useParams<{ patientId: string }>()
  const { state, dispatch } = useAppState()

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
    <div className="flex h-full">
      <div className="flex flex-1 flex-col overflow-hidden">
        <div className="border-b px-6 py-4">
          <Breadcrumb origin={state.breadcrumbOrigin} patientName={patient.name} />
          <h1 className="mt-2 text-xl font-semibold">{patient.name}</h1>
          <p className="text-sm text-muted-foreground">{patient.mrn}</p>
        </div>
        <div className="flex-1 overflow-y-auto p-6">
          <PatientDetailTabs
            onOpenTodayVisit={handleOpenTodayVisit}
            onOpenPastVisit={handleOpenPastVisit}
          />
        </div>
      </div>
      {showVisitPanel && (
        <VisitPanel
          visitLabel={
            state.selectedVisitId === 'today'
              ? 'Today\'s Visit'
              : pastVisit?.label ?? 'Past Visit'
          }
          isPastVisit={state.selectedVisitId !== 'today'}
        />
      )}
      <ExpiryLightbox />
    </div>
  )
}
