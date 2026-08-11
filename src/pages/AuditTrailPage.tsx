import { Navigate } from 'react-router-dom'
import { useAppState } from '@/state/AppStateContext'
import { PageHeader } from '@/components/layout/PageHeader'
import { PageContent } from '@/components/layout/PageContent'
import { LightScrollbar } from '@/components/ui/light-scrollbar'

export function AuditTrailPage() {
  const { state } = useAppState()

  if (state.role !== 'physician') {
    return <Navigate to="/schedule" replace />
  }

  return (
    <div className="flex h-full flex-col overflow-hidden">
      <PageHeader title="Audit trail" />
      <LightScrollbar className="min-h-0 flex-1">
        <PageContent />
      </LightScrollbar>
    </div>
  )
}
