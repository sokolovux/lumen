import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { Toaster } from '@/components/ui/sonner'
import { AppStateProvider } from '@/state/AppStateContext'
import { Sidebar } from '@/components/layout/Sidebar'
import { DemoControlsBar } from '@/components/layout/DemoControlsBar'
import { SchedulePage } from '@/pages/SchedulePage'
import { PatientsPage } from '@/pages/PatientsPage'
import { PatientDetailPage } from '@/pages/PatientDetailPage'
import { QueuePage } from '@/pages/QueuePage'
import { RequestsPage } from '@/pages/RequestsPage'

function AppLayout() {
  return (
    <div className="flex h-screen flex-col">
      <DemoControlsBar />
      <div className="flex flex-1 overflow-hidden">
        <Sidebar />
        <main className="flex-1 overflow-hidden bg-background">
          <Routes>
            <Route path="/schedule" element={<SchedulePage />} />
            <Route path="/patients" element={<PatientsPage />} />
            <Route path="/patients/:patientId" element={<PatientDetailPage />} />
            <Route path="/queue" element={<QueuePage />} />
            <Route path="/requests" element={<RequestsPage />} />
            <Route path="*" element={<Navigate to="/schedule" replace />} />
          </Routes>
        </main>
      </div>
      <Toaster />
    </div>
  )
}

export default function App() {
  return (
    <AppStateProvider>
      <BrowserRouter>
        <AppLayout />
      </BrowserRouter>
    </AppStateProvider>
  )
}
