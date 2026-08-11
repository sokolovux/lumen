import { useAppState } from '@/state/AppStateContext'
import { PageHeader } from '@/components/layout/PageHeader'
import { PageContent } from '@/components/layout/PageContent'
import { LightScrollbar } from '@/components/ui/light-scrollbar'
import { AccessRequestsList } from '@/components/queue/AccessRequestsList'

export function RequestsPage() {
  const { state } = useAppState()
  const isPhysician = state.role === 'physician'

  return (
    <div className="flex h-full flex-col overflow-hidden">
      <PageHeader title={isPhysician ? 'Access requests' : 'My requests'} />
      <LightScrollbar className="min-h-0 flex-1">
        <PageContent>
          <AccessRequestsList />
        </PageContent>
      </LightScrollbar>
    </div>
  )
}
