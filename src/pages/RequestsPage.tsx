import { useAppState } from '@/state/AppStateContext'
import { PageHeader } from '@/components/layout/PageHeader'
import { AccessRequestsList } from '@/components/queue/AccessRequestsList'

export function RequestsPage() {
  const { state } = useAppState()
  const isPhysician = state.role === 'physician'

  return (
    <div className="flex h-full flex-col">
      <PageHeader title={isPhysician ? 'Access requests' : 'My requests'} />
      <div className="flex-1 overflow-y-auto p-6">
        <AccessRequestsList />
      </div>
    </div>
  )
}
