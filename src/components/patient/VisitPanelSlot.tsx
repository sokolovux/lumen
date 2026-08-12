import { useLocation } from 'react-router-dom'
import { useAppState } from '@/state/AppStateContext'
import { useVisitChromeSequence } from '@/components/patient/visit-chrome-sequence'
import { VisitPanel } from '@/components/patient/VisitPanel'
import { PAST_VISITS } from '@/components/patient/PatientDetailTabs'

function isPatientDetailPath(pathname: string) {
  return /^\/patients\/[^/]+$/.test(pathname)
}

export function VisitPanelSlot() {
  const location = useLocation()
  const { state } = useAppState()

  const {
    todayPanelOpen,
    chromeStagger,
    instantChrome,
    onPanelWidthOpenTransitionEnd,
    onPanelWidthCloseTransitionEnd,
  } = useVisitChromeSequence()

  if (!isPatientDetailPath(location.pathname)) {
    return null
  }

  const showPastVisitPanel =
    state.selectedVisitId !== null && state.selectedVisitId !== 'today'
  const showVisitPanel =
    showPastVisitPanel ||
    (state.selectedVisitId === 'today' && todayPanelOpen)
  const todayVisitFinished =
    state.visitFinished && state.noteStatus !== 'returned'
  const todayVisitLabel = todayVisitFinished ? "Today's visit" : 'Visit in progress'
  const pastVisit = PAST_VISITS.find((visit) => visit.id === state.selectedVisitId)

  const isTodayPanel = state.selectedVisitId === 'today'

  return (
    <VisitPanel
      open={showVisitPanel}
      chromeStagger={isTodayPanel ? chromeStagger : 'idle'}
      instantOpen={instantChrome}
      onWidthOpenTransitionEnd={onPanelWidthOpenTransitionEnd}
      onWidthCloseTransitionEnd={onPanelWidthCloseTransitionEnd}
      visitLabel={
        state.selectedVisitId === 'today'
          ? todayVisitLabel
          : pastVisit?.label ?? 'Past visit'
      }
      isPastVisit={showPastVisitPanel}
    />
  )
}
