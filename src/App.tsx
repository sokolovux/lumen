import { useEffect, useState } from 'react'
import { BrowserRouter, Routes, Route, Navigate, useLocation } from 'react-router-dom'
import { Toaster } from '@/components/ui/sonner'
import { ThemeProvider } from '@/components/theme-provider'
import { AppStateProvider } from '@/state/AppStateContext'
import { Sidebar } from '@/components/layout/Sidebar'
import { DemoControlsBar } from '@/components/layout/DemoControlsBar'
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
  const [renderedLocation, setRenderedLocation] = useState(location)
  const [visible, setVisible] = useState(true)

  useEffect(() => {
    if (location.pathname === renderedLocation.pathname) return

    setVisible(false)
    const id = window.setTimeout(() => {
      setRenderedLocation(location)
      setVisible(true)
    }, PAGE_FADE_MS)

    return () => window.clearTimeout(id)
  }, [location, renderedLocation.pathname])

  return (
    <div className="flex h-screen flex-col">
      <DemoControlsBar />
      <div className="flex flex-1 overflow-hidden">
        <Sidebar />
        <main className="flex-1 overflow-hidden bg-background">
          <div
            className={cn(
              'h-full transition-opacity duration-100 ease-out',
              visible ? 'opacity-100' : 'opacity-0',
            )}
          >
            <Routes location={renderedLocation}>
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
          <AppLayout />
        </BrowserRouter>
      </AppStateProvider>
    </ThemeProvider>
  )
}
