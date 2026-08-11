import { useAppState } from '@/state/AppStateContext'
import { PageHeader } from '@/components/layout/PageHeader'
import { PageContent } from '@/components/layout/PageContent'
import { LightScrollbar } from '@/components/ui/light-scrollbar'
import { CosignQueueList } from '@/components/queue/CosignQueueList'

export function QueuePage() {
  const { state } = useAppState()
  const isPhysician = state.role === 'physician'

  return (
    <div className="flex h-full flex-col overflow-hidden">
      <PageHeader title={isPhysician ? 'Cosign queue' : 'Notes review'} />
      <LightScrollbar className="min-h-0 flex-1">
        <PageContent>
          <CosignQueueList />
        </PageContent>
      </LightScrollbar>
    </div>
  )
}
