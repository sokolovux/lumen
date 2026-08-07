import { AccessRequestsList } from '@/components/queue/AccessRequestsList'

export function RequestsPage() {
  return (
    <div className="flex h-full flex-col">
      <div className="border-b px-6 py-4">
        <h1 className="text-xl font-semibold">Access Requests</h1>
        <p className="text-sm text-muted-foreground">Lab and imaging access requests</p>
      </div>
      <div className="flex-1 overflow-y-auto p-6">
        <AccessRequestsList />
      </div>
    </div>
  )
}
