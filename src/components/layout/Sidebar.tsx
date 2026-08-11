import { NavLink } from 'react-router-dom'
import type { LucideIcon } from 'lucide-react'
import {
  Calendar,
  CreditCard,
  FileBarChart,
  MessageCircle,
  Users,
  ClipboardList,
  Inbox,
  ScrollText,
  Settings,
  UsersRound,
} from 'lucide-react'
import { cn } from '@/lib/utils'
import { useAppState } from '@/state/AppStateContext'
import { getDemoUserProfile } from '@/lib/scheduleData'
import { getRoleLabel } from '@/lib/statusDerivation'
import { Badge, countBadgeClassName, notificationBadgeClassName } from '@/components/ui/badge'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import { LightScrollbar } from '@/components/ui/light-scrollbar'

type BadgeKey = 'cosign' | 'notesReview' | 'request' | 'assistantApproval'

type SidebarNavItem =
  | {
      to: string
      icon: LucideIcon
      label?: string
      labelForRole?: { physician: string; assistant: string }
      badgeForRole?: { physician: BadgeKey; assistant: BadgeKey }
      roles?: readonly ('physician' | 'assistant')[]
    }
  | {
      label: string
      icon: LucideIcon
      placeholder: true
    }

const queueItem = {
  to: '/queue',
  icon: ClipboardList,
  labelForRole: { physician: 'Cosign queue', assistant: 'Notes review' } as const,
  badgeForRole: { physician: 'cosign' as const, assistant: 'notesReview' as const },
} satisfies SidebarNavItem

const requestsItem = {
  to: '/requests',
  icon: Inbox,
  labelForRole: { physician: 'Access requests', assistant: 'My requests' } as const,
  badgeForRole: { physician: 'request' as const, assistant: 'assistantApproval' as const },
} satisfies SidebarNavItem

const inboxItems: SidebarNavItem[] = [
  queueItem,
  requestsItem,
  { label: 'Messages', icon: MessageCircle, placeholder: true },
]

const careItems: SidebarNavItem[] = [
  { to: '/schedule', label: 'Schedule', icon: Calendar },
  { to: '/patients', label: 'Patients', icon: Users },
]

const practiceItems: SidebarNavItem[] = [
  { label: 'Reports', icon: FileBarChart, placeholder: true },
  { label: 'Payments', icon: CreditCard, placeholder: true },
  { label: 'Team', icon: UsersRound, placeholder: true },
  { to: '/audit-trail', label: 'Audit trail', icon: ScrollText, roles: ['physician'] as const },
  { label: 'Settings', icon: Settings, placeholder: true },
]

const sidebarSections: { key: string; title: string; items: SidebarNavItem[] }[] = [
  { key: 'care', title: 'Care', items: careItems },
  { key: 'inbox', title: 'Inbox', items: inboxItems },
  { key: 'practice', title: 'Practice', items: practiceItems },
]

function isVisibleForRole(item: SidebarNavItem, role: 'physician' | 'assistant') {
  return !('roles' in item) || !item.roles || item.roles.includes(role)
}

export function Sidebar() {
  const { state } = useAppState()

  const badgeCount = (key: BadgeKey) => {
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

  const demoUser = getDemoUserProfile(state.role)

  function renderNavItem(item: SidebarNavItem) {
    const Icon = item.icon

    if ('placeholder' in item && item.placeholder) {
      return (
        <button
          key={item.label}
          type="button"
          className="flex w-full items-center gap-2 rounded-md px-3 py-2 text-base text-sidebar-foreground transition-colors hover:bg-gray-100"
        >
          <Icon className="size-4 shrink-0" />
          <span className="flex-1 text-left">{item.label}</span>
        </button>
      )
    }

    const label = item.label ?? item.labelForRole![state.role]
    const badgeKey = item.badgeForRole?.[state.role]
    const count = badgeKey ? badgeCount(badgeKey) : 0

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
  }

  return (
    <aside className="flex h-full w-56 shrink-0 flex-col overflow-hidden border-r bg-sidebar text-sidebar-foreground">
      <div className="flex h-16 shrink-0 items-center border-b px-4">
        <h3>Lumen</h3>
      </div>
      <LightScrollbar className="min-h-0 flex-1">
        <nav data-slot="sidebar-nav" className="px-2 py-3">
          {sidebarSections.map(({ key, title, items }) => (
            <div key={key} data-slot="sidebar-section">
              <p data-slot="sidebar-section-title">{title}</p>
              {items
                .filter((item) => isVisibleForRole(item, state.role))
                .map((item) => renderNavItem(item))}
            </div>
          ))}
        </nav>
      </LightScrollbar>
      <div className="shrink-0 border-t p-2">
        <button
          type="button"
          className="flex w-full items-center gap-2 rounded-md px-3 py-2 text-base text-sidebar-foreground transition-colors hover:bg-gray-100"
        >
          <Avatar>
            <AvatarFallback>{demoUser.initials}</AvatarFallback>
          </Avatar>
          <div className="grid min-w-0 flex-1 text-left leading-tight">
            <span className="truncate">{demoUser.name}</span>
            <span className="truncate text-xs">{getRoleLabel(state.role)}</span>
          </div>
        </button>
      </div>
    </aside>
  )
}
