import type { ReactNode } from 'react'

type PageContentProps = {
  children?: ReactNode
}

export function PageContent({ children }: PageContentProps) {
  return <div data-slot="page-content">{children}</div>
}
