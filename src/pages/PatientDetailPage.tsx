import { Link, Navigate, useParams, useSearchParams } from 'react-router-dom'
import type { BreadcrumbOrigin } from '@/state/types'
import { useAppState } from '@/state/AppStateContext'
import { PatientDetailTabs, PAST_VISITS } from '@/components/patient/PatientDetailTabs'
import { VisitPanel } from '@/components/patient/VisitPanel'
import { PATIENTS, JORDAN_REYES_ID } from '@/lib/scheduleData'
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from '@/components/ui/breadcrumb'

const breadcrumbOriginConfig: Record<BreadcrumbOrigin, { label: string; path: string }> = {
  schedule: { label: 'Schedule', path: '/schedule' },
  queue: { label: 'Cosign queue', path: '/queue' },
  requests: { label: 'Access requests', path: '/requests' },
  patients: { label: 'Patients', path: '/patients' },
}

export function PatientDetailPage() {
  const { patientId } = useParams<{ patientId: string }>()
  const [searchParams] = useSearchParams()
  const { state, dispatch } = useAppState()

  const tabParam = searchParams.get('tab')
  const labParam = searchParams.get('lab')
  const defaultTab = ['visits', 'demographics', 'problems', 'labs', 'audit'].includes(tabParam ?? '')
    ? tabParam!
    : 'visits'
  const highlightLabId = labParam ?? undefined

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
  const origin = breadcrumbOriginConfig[state.breadcrumbOrigin]

  return (
    <div className="flex h-full overflow-hidden">
      <div className="flex flex-1 flex-col overflow-hidden">
        <div className="border-b px-6 py-4">
          <Breadcrumb>
            <BreadcrumbList>
              <BreadcrumbItem>
                <BreadcrumbLink asChild>
                  <Link to={origin.path}>{origin.label}</Link>
                </BreadcrumbLink>
              </BreadcrumbItem>
              <BreadcrumbSeparator />
              <BreadcrumbItem>
                <BreadcrumbPage>{patient.name}</BreadcrumbPage>
              </BreadcrumbItem>
            </BreadcrumbList>
          </Breadcrumb>
          <h4 className="mt-2">{patient.name}</h4>
        </div>
        <div className="flex-1 overflow-y-auto p-6">
          <PatientDetailTabs
            defaultTab={defaultTab}
            highlightLabId={highlightLabId}
            onOpenTodayVisit={handleOpenTodayVisit}
            onOpenPastVisit={handleOpenPastVisit}
          />
        </div>
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
