import { useAppState } from '@/state/AppStateContext'
import { PageHeader } from '@/components/layout/PageHeader'
import { CosignQueueList } from '@/components/queue/CosignQueueList'

export function QueuePage() {
  const { state } = useAppState()
  const isPhysician = state.role === 'physician'

  return (
    <div className="flex h-full flex-col">
      <PageHeader title={isPhysician ? 'Cosign queue' : 'Notes review'} />
      <div className="flex-1 overflow-y-auto p-6">
        <CosignQueueList />
      </div>
    </div>
  )
}
