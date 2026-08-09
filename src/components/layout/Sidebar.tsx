import { NavLink } from 'react-router-dom'
import {
  Calendar,
  Users,
  ClipboardList,
  Inbox,
} from 'lucide-react'
import { cn } from '@/lib/utils'
import { useAppState } from '@/state/AppStateContext'
import { Badge, countBadgeClassName, notificationBadgeClassName } from '@/components/ui/badge'
import { ScrollArea } from '@/components/ui/scroll-area'

const sharedNavItems = [
  { to: '/schedule', label: 'Schedule', icon: Calendar },
  { to: '/patients', label: 'Patients', icon: Users },
  {
    to: '/queue',
    icon: ClipboardList,
    labelForRole: { physician: 'Cosign queue', assistant: 'Notes review' } as const,
    badgeForRole: { physician: 'cosign' as const, assistant: 'notesReview' as const },
  },
  {
    to: '/requests',
    icon: Inbox,
    labelForRole: { physician: 'Access requests', assistant: 'My requests' } as const,
    badgeForRole: { physician: 'request' as const, assistant: 'assistantApproval' as const },
  },
] as const

export function Sidebar() {
  const { state } = useAppState()

  const badgeCount = (key: 'cosign' | 'notesReview' | 'request' | 'assistantApproval') => {
    switch (key) {
      case 'cosign':
        return state.noteStatus === 'submitted' ? state.cosignUnread : 0
      case 'notesReview':
        return state.noteStatus === 'returned' ? state.notesReviewUnread : 0
      case 'request':
        return state.labs.filter(
          (lab) => lab.status === 'requested' && !state.viewedRequests.includes(lab.id),
        ).length
      case 'assistantApproval':
        return state.assistantUnseenResolution.length
    }
  }

  return (
    <aside className="flex h-full w-56 shrink-0 flex-col border-r bg-sidebar text-sidebar-foreground">
      <div className="flex h-14 shrink-0 items-center border-b px-4">
        <h3>Lumen</h3>
      </div>
      <ScrollArea className="flex-1 px-2 py-3">
        <nav className="flex flex-col gap-1">
          {sharedNavItems.map((item) => {
            const label = 'label' in item ? item.label : item.labelForRole[state.role]
            const badgeKey =
              'badgeForRole' in item ? item.badgeForRole[state.role] : undefined
            const count = badgeKey ? badgeCount(badgeKey) : 0
            const Icon = item.icon

            return (
              <NavLink
                key={item.to}
                to={item.to}
                className={({ isActive }) =>
                  cn(
                    'flex items-center gap-2 rounded-md px-3 py-2 text-base transition-colors',
                    isActive
                      ? 'bg-gray-200 text-sidebar-accent-foreground'
                      : 'text-sidebar-foreground hover:bg-gray-100',
                  )
                }
              >
                <Icon className="size-4 shrink-0" />
                <span className="flex-1">{label}</span>
                {count > 0 && (
                  <Badge
                    variant="outline"
                    className={cn(countBadgeClassName, notificationBadgeClassName)}
                  >
                    {count}
                  </Badge>
                )}
              </NavLink>
            )
          })}
        </nav>
      </ScrollArea>
    </aside>
  )
}
