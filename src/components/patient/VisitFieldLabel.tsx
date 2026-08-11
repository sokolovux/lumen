import type { ReactNode } from 'react'
import { cn } from '@/lib/utils'

type VisitFieldLabelProps = {
  children: ReactNode
  required?: boolean
  optional?: boolean
  as?: 'p' | 'h5'
  className?: string
}

export function VisitFieldLabel({
  children,
  required = false,
  optional = false,
  as: Tag = 'p',
  className,
}: VisitFieldLabelProps) {
  return (
    <Tag
      data-slot="visit-field-label"
      className={cn(Tag === 'h5' ? 'mb-1' : 'text-sm text-muted-foreground', className)}
    >
      {children}
      {required && <span className="text-destructive"> *</span>}
      {optional && <span className="text-xs text-muted-foreground"> (optional)</span>}
    </Tag>
  )
}
