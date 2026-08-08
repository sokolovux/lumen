import { useAppState } from '@/state/AppStateContext'
import { AccessRequestsList } from '@/components/queue/AccessRequestsList'

export function RequestsPage() {
  const { state } = useAppState()
  const isPhysician = state.role === 'physician'

  return (
    <div className="flex h-full flex-col">
      <div className="border-b px-6 py-4">
        <h4>
          {isPhysician ? 'Access requests' : 'My requests'}
        </h4>
      </div>
      <div className="flex-1 overflow-y-auto p-6">
        <AccessRequestsList />
      </div>
    </div>
  )
}
