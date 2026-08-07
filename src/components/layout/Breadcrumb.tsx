import { Link } from 'react-router-dom'
import type { BreadcrumbOrigin } from '@/state/types'
import {
  Breadcrumb as BreadcrumbRoot,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from '@/components/ui/breadcrumb'

const originConfig: Record<BreadcrumbOrigin, { label: string; path: string }> = {
  schedule: { label: 'Schedule', path: '/schedule' },
  queue: { label: 'Cosign queue', path: '/queue' },
  requests: { label: 'Access requests', path: '/requests' },
  patients: { label: 'Patients', path: '/patients' },
}

interface BreadcrumbProps {
  origin: BreadcrumbOrigin
  patientName?: string
}

export function Breadcrumb({ origin, patientName }: BreadcrumbProps) {
  const config = originConfig[origin]

  return (
    <BreadcrumbRoot>
      <BreadcrumbList>
        <BreadcrumbItem>
          <BreadcrumbLink asChild>
            <Link to={config.path}>{config.label}</Link>
          </BreadcrumbLink>
        </BreadcrumbItem>
        {patientName && (
          <>
            <BreadcrumbSeparator />
            <BreadcrumbItem>
              <BreadcrumbPage>{patientName}</BreadcrumbPage>
            </BreadcrumbItem>
          </>
        )}
      </BreadcrumbList>
    </BreadcrumbRoot>
  )
}
