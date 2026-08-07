import { CosignQueueList } from '@/components/queue/CosignQueueList'

export function QueuePage() {
  return (
    <div className="flex h-full flex-col">
      <div className="border-b px-6 py-4">
        <h1 className="text-xl font-semibold">Cosign Queue</h1>
        <p className="text-sm text-muted-foreground">Notes awaiting physician cosign</p>
      </div>
      <div className="flex-1 overflow-y-auto p-6">
        <CosignQueueList />
      </div>
    </div>
  )
}
