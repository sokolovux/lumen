import { useLayoutEffect, useRef, useState } from 'react'
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
  const [activePastVisitId, setActivePastVisitId] = useState<string | null>(null)
  const [pastPanelOpen, setPastPanelOpen] = useState(false)
  const pendingPastVisitIdRef = useRef<string | null>(null)

  const {
    todayPanelOpen,
    chromeStagger,
    instantChrome,
    onPanelWidthOpenTransitionEnd,
    onPanelWidthCloseTransitionEnd,
  } = useVisitChromeSequence()

  const onPatientDetail = isPatientDetailPath(location.pathname)
  const isTodayPanel = state.selectedVisitId === 'today'
  const selectedPastId =
    state.selectedVisitId !== null && state.selectedVisitId !== 'today'
      ? state.selectedVisitId
      : null

  useLayoutEffect(() => {
    if (!onPatientDetail || isTodayPanel) {
      return
    }

    if (selectedPastId === null) {
      if (activePastVisitId !== null && pastPanelOpen) {
        setPastPanelOpen(false)
      }
      return
    }

    if (activePastVisitId === null) {
      setActivePastVisitId(selectedPastId)
      setPastPanelOpen(true)
      return
    }

    if (activePastVisitId === selectedPastId) {
      return
    }

    pendingPastVisitIdRef.current = selectedPastId
    setPastPanelOpen(false)
  }, [
    onPatientDetail,
    isTodayPanel,
    selectedPastId,
    activePastVisitId,
    pastPanelOpen,
  ])

  useLayoutEffect(() => {
    if (!onPatientDetail || !isTodayPanel) {
      return
    }

    if (activePastVisitId === null && !pastPanelOpen) {
      return
    }

    pendingPastVisitIdRef.current = null
    if (pastPanelOpen || activePastVisitId !== null) {
      setPastPanelOpen(false)
    }
  }, [onPatientDetail, isTodayPanel, activePastVisitId, pastPanelOpen])

  useLayoutEffect(() => {
    if (!onPatientDetail) {
      pendingPastVisitIdRef.current = null
      setActivePastVisitId(null)
      setPastPanelOpen(false)
    }
  }, [onPatientDetail])

  if (!onPatientDetail) {
    return null
  }

  const handlePanelCloseTransitionEnd = () => {
    const pendingPastVisitId = pendingPastVisitIdRef.current
    if (pendingPastVisitId) {
      pendingPastVisitIdRef.current = null
      setActivePastVisitId(pendingPastVisitId)
      setPastPanelOpen(true)
      return
    }

    if (activePastVisitId !== null && selectedPastId === null) {
      setActivePastVisitId(null)
      return
    }

    if (isTodayPanel) {
      onPanelWidthCloseTransitionEnd()
    }
  }

  const showTodayPanel =
    isTodayPanel && (todayPanelOpen || chromeStagger === 'close')
  const showPastPanel = activePastVisitId !== null
  const showVisitPanel = showTodayPanel || showPastPanel
  const panelOpen = isTodayPanel ? todayPanelOpen : pastPanelOpen
  const pastVisit = PAST_VISITS.find((visit) => visit.id === activePastVisitId)

  if (!showVisitPanel) {
    return null
  }

  return (
    <VisitPanel
      open={panelOpen}
      chromeStagger={isTodayPanel ? chromeStagger : 'idle'}
      instantOpen={isTodayPanel && instantChrome}
      onWidthOpenTransitionEnd={
        isTodayPanel ? onPanelWidthOpenTransitionEnd : undefined
      }
      onWidthCloseTransitionEnd={handlePanelCloseTransitionEnd}
      visitLabel={pastVisit?.label ?? 'Past visit'}
      isPastVisit={showPastPanel}
      pastVisitId={activePastVisitId}
    />
  )
}
