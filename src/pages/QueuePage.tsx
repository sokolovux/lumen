import { useAppState } from '@/state/AppStateContext'
import { CosignQueueList } from '@/components/queue/CosignQueueList'

export function QueuePage() {
  const { state } = useAppState()
  const isPhysician = state.role === 'physician'

  return (
    <div className="flex h-full flex-col">
      <div className="border-b px-6 py-4">
        <h1 className="text-xl font-semibold">
          {isPhysician ? 'Cosign Queue' : 'Notes Review'}
        </h1>
        <p className="text-sm text-muted-foreground">
          {isPhysician
            ? 'Notes awaiting your cosign or return'
            : 'Status of your submitted notes'}
        </p>
      </div>
      <div className="flex-1 overflow-y-auto p-6">
        <CosignQueueList />
      </div>
    </div>
  )
}
