import { NavLink } from 'react-router-dom'
import {
  Calendar,
  Users,
  ClipboardList,
  Inbox,
} from 'lucide-react'
import { cn } from '@/lib/utils'
import { useAppState } from '@/state/AppStateContext'
import { Badge } from '@/components/ui/badge'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Separator } from '@/components/ui/separator'

const navItems = [
  { to: '/schedule', label: 'Schedule', icon: Calendar },
  { to: '/patients', label: 'Patients', icon: Users },
  { to: '/queue', label: 'Cosign Queue', icon: ClipboardList, badgeKey: 'cosign' as const },
  { to: '/requests', label: 'Access Requests', icon: Inbox, badgeKey: 'request' as const },
]

export function Sidebar() {
  const { state } = useAppState()

  return (
    <aside className="flex h-full w-56 shrink-0 flex-col border-r bg-sidebar text-sidebar-foreground">
      <div className="px-4 py-5">
        <h1 className="text-lg font-semibold tracking-tight">Concordare</h1>
        <p className="text-xs text-muted-foreground">EHR Prototype</p>
      </div>
      <Separator />
      <ScrollArea className="flex-1 px-2 py-3">
        <nav className="flex flex-col gap-1">
          {navItems.map(({ to, label, icon: Icon, badgeKey }) => {
            const count =
              badgeKey === 'cosign'
                ? state.cosignUnread
                : badgeKey === 'request'
                  ? state.requestUnread
                  : 0
            return (
              <NavLink
                key={to}
                to={to}
                className={({ isActive }) =>
                  cn(
                    'flex items-center gap-2 rounded-lg px-3 py-2 text-sm transition-colors',
                    isActive
                      ? 'bg-sidebar-accent text-sidebar-accent-foreground font-medium'
                      : 'text-sidebar-foreground hover:bg-sidebar-accent/50',
                  )
                }
              >
                <Icon className="size-4 shrink-0" />
                <span className="flex-1">{label}</span>
                {count > 0 && (
                  <Badge variant="destructive" className="h-5 min-w-5 justify-center px-1.5 text-xs">
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
