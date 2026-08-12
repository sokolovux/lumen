import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useLayoutEffect,
  useRef,
  useState,
  type ReactNode,
} from 'react'
import { useLocation } from 'react-router-dom'
import { useAppState } from '@/state/AppStateContext'

export const VISIT_CHROME_TRANSITION_MS = 200

export type VisitChromeStagger = 'open' | 'close' | 'idle'

function isPatientDetailPath(pathname: string) {
  return /^\/patients\/[^/]+$/.test(pathname)
}

type VisitChromeSequenceContextValue = {
  bannerCollapsed: boolean
  todayPanelOpen: boolean
  chromeStagger: VisitChromeStagger
  instantChrome: boolean
  onPanelWidthOpenTransitionEnd: () => void
  onPanelWidthCloseTransitionEnd: () => void
}

const VisitChromeSequenceContext =
  createContext<VisitChromeSequenceContextValue | null>(null)

export function VisitChromeSequenceProvider({ children }: { children: ReactNode }) {
  const location = useLocation()
  const { state } = useAppState()
  const onPatientDetail = isPatientDetailPath(location.pathname)
  const wantsTodayPanel =
    onPatientDetail && state.selectedVisitId === 'today'
  const visitFinishedOnPage =
    onPatientDetail && state.visitFinished

  const [bannerCollapsed, setBannerCollapsed] = useState(false)
  const [todayPanelOpen, setTodayPanelOpen] = useState(false)
  const [chromeStagger, setChromeStagger] = useState<VisitChromeStagger>('idle')
  const [instantChrome, setInstantChrome] = useState(false)
  const prevWantsTodayPanel = useRef<boolean | null>(null)
  const wantsTodayPanelRef = useRef(wantsTodayPanel)
  wantsTodayPanelRef.current = wantsTodayPanel

  const onPanelWidthOpenTransitionEnd = useCallback(() => {
    if (wantsTodayPanelRef.current) {
      setChromeStagger('idle')
    }
  }, [])

  const onPanelWidthCloseTransitionEnd = useCallback(() => {
    if (!wantsTodayPanelRef.current) {
      setBannerCollapsed(false)
      setChromeStagger('idle')
    }
  }, [])

  useLayoutEffect(() => {
    if (!onPatientDetail) {
      prevWantsTodayPanel.current = null
      return
    }

    const prev = prevWantsTodayPanel.current
    const enteringPatientDetail = prev === null

    if (enteringPatientDetail) {
      prevWantsTodayPanel.current = wantsTodayPanel
      setInstantChrome(true)
      setChromeStagger('idle')
      if (wantsTodayPanel) {
        setBannerCollapsed(true)
        setTodayPanelOpen(true)
      } else {
        setBannerCollapsed(false)
        setTodayPanelOpen(false)
      }
      return
    }

    if (prev === wantsTodayPanel) {
      return
    }

    prevWantsTodayPanel.current = wantsTodayPanel
    setInstantChrome(false)

    if (wantsTodayPanel) {
      setChromeStagger('open')
      setBannerCollapsed(true)
      setTodayPanelOpen(true)
      return
    }

    setChromeStagger('close')
    setTodayPanelOpen(false)
  }, [onPatientDetail, wantsTodayPanel])

  useLayoutEffect(() => {
    if (!visitFinishedOnPage || wantsTodayPanel) {
      return
    }
    setBannerCollapsed(false)
    setChromeStagger('idle')
  }, [visitFinishedOnPage, wantsTodayPanel])

  useEffect(() => {
    if (!instantChrome) {
      return
    }
    const id = requestAnimationFrame(() => {
      requestAnimationFrame(() => setInstantChrome(false))
    })
    return () => cancelAnimationFrame(id)
  }, [instantChrome])

  useEffect(() => {
    if (chromeStagger !== 'close' || todayPanelOpen) {
      return
    }
    const id = window.setTimeout(
      onPanelWidthCloseTransitionEnd,
      VISIT_CHROME_TRANSITION_MS + 32,
    )
    return () => window.clearTimeout(id)
  }, [chromeStagger, todayPanelOpen, onPanelWidthCloseTransitionEnd])

  return (
    <VisitChromeSequenceContext.Provider
      value={{
        bannerCollapsed,
        todayPanelOpen,
        chromeStagger,
        instantChrome,
        onPanelWidthOpenTransitionEnd,
        onPanelWidthCloseTransitionEnd,
      }}
    >
      {children}
    </VisitChromeSequenceContext.Provider>
  )
}

export function useVisitChromeSequence() {
  const context = useContext(VisitChromeSequenceContext)
  if (!context) {
    throw new Error(
      'useVisitChromeSequence must be used within VisitChromeSequenceProvider',
    )
  }
  return context
}
