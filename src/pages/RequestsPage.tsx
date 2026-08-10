import { useAppState } from '@/state/AppStateContext'
import { PageHeader } from '@/components/layout/PageHeader'
import { LightScrollbar } from '@/components/ui/light-scrollbar'
import { AccessRequestsList } from '@/components/queue/AccessRequestsList'

export function RequestsPage() {
  const { state } = useAppState()
  const isPhysician = state.role === 'physician'

  return (
    <div className="flex h-full flex-col overflow-hidden">
      <PageHeader title={isPhysician ? 'Access requests' : 'My requests'} />
      <LightScrollbar className="min-h-0 flex-1">
        <div className="p-6">
          <AccessRequestsList />
        </div>
      </LightScrollbar>
    </div>
  )
}
