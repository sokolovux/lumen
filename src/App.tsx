import { useLayoutEffect, useRef, useState } from 'react'
import { BrowserRouter, Routes, Route, Navigate, useLocation } from 'react-router-dom'
import { Toaster } from '@/components/ui/sonner'
import { ThemeProvider } from '@/components/theme-provider'
import { AppStateProvider } from '@/state/AppStateContext'
import { Sidebar } from '@/components/layout/Sidebar'
import { AppChromeProvider } from '@/components/layout/AppChromeContext'
import { DemoControlsBar } from '@/components/layout/DemoControlsBar'
import { VisitPanelSlot } from '@/components/patient/VisitPanelSlot'
import { VisitChromeSequenceProvider } from '@/components/patient/visit-chrome-sequence'
import { SchedulePage } from '@/pages/SchedulePage'
import { PatientsPage } from '@/pages/PatientsPage'
import { PatientDetailPage } from '@/pages/PatientDetailPage'
import { QueuePage } from '@/pages/QueuePage'
import { RequestsPage } from '@/pages/RequestsPage'
import { AuditTrailPage } from '@/pages/AuditTrailPage'
import { DesignSystemPage } from '@/pages/DesignSystemPage'
import { cn } from '@/lib/utils'

const PAGE_FADE_MS = 100

function AppLayout() {
  const location = useLocation()
  const [visible, setVisible] = useState(true)
  const isFirstNavigation = useRef(true)

  useLayoutEffect(() => {
    if (isFirstNavigation.current) {
      isFirstNavigation.current = false
      return
    }

    setVisible(false)
    const id = window.setTimeout(() => {
      setVisible(true)
    }, PAGE_FADE_MS)

    return () => window.clearTimeout(id)
  }, [location.pathname])

  return (
    <div className="flex h-screen flex-col">
      <DemoControlsBar />
      <div className="flex flex-1 overflow-hidden">
        <AppChromeProvider>
          <Sidebar />
          <main className="min-w-0 flex-1 overflow-hidden bg-background">
            <div
              className={cn(
                'h-full transition-opacity duration-100 ease-out',
                visible ? 'opacity-100' : 'opacity-0',
              )}
            >
              <Routes location={location}>
                <Route path="/" element={<Navigate to="/schedule" replace />} />
                <Route path="/schedule" element={<SchedulePage />} />
                <Route path="/patients" element={<PatientsPage />} />
                <Route path="/patients/:patientId" element={<PatientDetailPage />} />
                <Route path="/queue" element={<QueuePage />} />
                <Route path="/requests" element={<RequestsPage />} />
                <Route path="/audit-trail" element={<AuditTrailPage />} />
                <Route path="/ds" element={<DesignSystemPage />} />
                <Route path="*" element={<Navigate to="/schedule" replace />} />
              </Routes>
            </div>
          </main>
        </AppChromeProvider>
        <VisitPanelSlot />
      </div>
      <Toaster />
    </div>
  )
}

export default function App() {
  return (
    <ThemeProvider>
      <AppStateProvider>
        <BrowserRouter>
          <VisitChromeSequenceProvider>
            <AppLayout />
          </VisitChromeSequenceProvider>
        </BrowserRouter>
      </AppStateProvider>
    </ThemeProvider>
  )
}
