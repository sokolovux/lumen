import { useAppState } from '@/state/AppStateContext'
import { AccessRequestsList } from '@/components/queue/AccessRequestsList'

export function RequestsPage() {
  const { state } = useAppState()
  const isPhysician = state.role === 'physician'

  return (
    <div className="flex h-full flex-col">
      <div className="border-b px-6 py-4">
        <h1 className="text-xl font-semibold">
          {isPhysician ? 'Access Requests' : 'My Requests'}
        </h1>
        <p className="text-sm text-muted-foreground">
          {isPhysician
            ? 'Grant or deny temporary access to locked lab and imaging results'
            : 'Status of your lab and imaging access requests'}
        </p>
      </div>
      <div className="flex-1 overflow-y-auto p-6">
        <AccessRequestsList />
      </div>
    </div>
  )
}
