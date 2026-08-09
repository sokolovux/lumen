import type { ReactNode } from 'react'
import { Link } from 'react-router-dom'
import { ArrowLeft } from 'lucide-react'
import { Button } from '@/components/ui/button'

type PageHeaderProps = {
  title: ReactNode
  /** When set, shows a back icon button that navigates to this path. */
  backTo?: string
  children?: ReactNode
}

export function PageHeader({ title, backTo, children }: PageHeaderProps) {
  return (
    <header data-slot="page-header">
      <div data-slot="page-header-start">
        {backTo ? (
          <Button variant="ghost" size="icon-sm" asChild>
            <Link to={backTo} aria-label="Back">
              <ArrowLeft />
            </Link>
          </Button>
        ) : null}
        {typeof title === 'string' || typeof title === 'number' ? <h3>{title}</h3> : title}
      </div>
      {children}
    </header>
  )
}
