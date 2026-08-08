import type { ComponentProps, FC, ReactNode } from 'react'

type UIProps = Record<string, unknown>

declare module '@/components/ui/button' {
  export const Button: FC<ComponentProps<'button'> & UIProps>
  export const buttonVariants: (...args: unknown[]) => string
}

declare module '@/components/ui/card' {
  export const Card: FC<UIProps>
  export const CardHeader: FC<UIProps>
  export const CardContent: FC<UIProps>
  export const CardFooter: FC<UIProps>
  export const CardTitle: FC<UIProps>
  export const CardDescription: FC<UIProps>
  export const CardAction: FC<UIProps>
}

declare module '@/components/ui/badge' {
  export const Badge: FC<UIProps>
  export const badgeVariants: (...args: unknown[]) => string
  export const notificationBadgeClassName: string
  export const countBadgeClassName: string
}

declare module '@/components/ui/dialog' {
  export const Dialog: FC<UIProps>
  export const DialogContent: FC<UIProps>
  export const DialogHeader: FC<UIProps>
  export const DialogTitle: FC<UIProps>
  export const DialogDescription: FC<UIProps>
  export const DialogFooter: FC<UIProps>
  export const DialogTrigger: FC<UIProps>
  export const DialogClose: FC<UIProps>
}

declare module '@/components/ui/tabs' {
  export const Tabs: FC<UIProps>
  export const TabsList: FC<UIProps>
  export const TabsTrigger: FC<UIProps>
  export const TabsContent: FC<UIProps>
}

declare module '@/components/ui/select' {
  export const Select: FC<UIProps>
  export const SelectContent: FC<UIProps>
  export const SelectItem: FC<UIProps>
  export const SelectTrigger: FC<UIProps>
  export const SelectValue: FC<UIProps>
  export const SelectGroup: FC<UIProps>
}

declare module '@/components/ui/textarea' {
  export const Textarea: FC<ComponentProps<'textarea'> & UIProps>
}

declare module '@/components/ui/input' {
  export const Input: FC<ComponentProps<'input'> & UIProps>
}

declare module '@/components/ui/skeleton' {
  export const Skeleton: FC<UIProps>
}

declare module '@/components/ui/separator' {
  export const Separator: FC<UIProps>
}

declare module '@/components/ui/scroll-area' {
  export const ScrollArea: FC<UIProps>
  export const ScrollBar: FC<UIProps>
}

declare module '@/components/ui/avatar' {
  export const Avatar: FC<UIProps>
  export const AvatarImage: FC<UIProps>
  export const AvatarFallback: FC<UIProps>
}

declare module '@/components/ui/breadcrumb' {
  export const Breadcrumb: FC<UIProps>
  export const BreadcrumbList: FC<UIProps>
  export const BreadcrumbItem: FC<UIProps>
  export const BreadcrumbLink: FC<UIProps>
  export const BreadcrumbPage: FC<UIProps>
  export const BreadcrumbSeparator: FC<UIProps>
}

declare module '@/components/ui/sonner' {
  export const Toaster: FC<UIProps>
}

declare module '@/lib/utils' {
  export function cn(...inputs: unknown[]): string
}
