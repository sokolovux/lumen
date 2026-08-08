import { useAppState } from '@/state/AppStateContext'
import { CosignQueueList } from '@/components/queue/CosignQueueList'

export function QueuePage() {
  const { state } = useAppState()
  const isPhysician = state.role === 'physician'

  return (
    <div className="flex h-full flex-col">
      <div className="border-b px-6 py-4">
        <h4>
          {isPhysician ? 'Cosign queue' : 'Notes review'}
        </h4>
      </div>
      <div className="flex-1 overflow-y-auto p-6">
        <CosignQueueList />
      </div>
    </div>
  )
}
