import * as React from "react"
import { cva } from "class-variance-authority";
import { Slot } from "radix-ui"

import { cn } from "@/lib/utils"

/** Shared outline tint for unread counts and "New" indicators — always blue. */
export const notificationBadgeClassName =
  "border-blue-200 bg-blue-50 text-blue-700"

/** Compact numeric count badges (sidebar, tab triggers). */
export const countBadgeClassName = "min-w-5 justify-center px-1.5 tabular-nums"

const badgeVariants = cva(
  "group/badge inline-flex h-5 w-fit shrink-0 items-center justify-center gap-1 overflow-hidden rounded-4xl border px-2 py-0.5 text-sm font-normal whitespace-nowrap transition-all focus-visible:border-ring focus-visible:ring-[3px] focus-visible:ring-ring/50 has-data-[icon=inline-end]:pr-1.5 has-data-[icon=inline-start]:pl-1.5 aria-invalid:border-destructive aria-invalid:ring-destructive/20 dark:aria-invalid:ring-destructive/40 [&>svg]:pointer-events-none [&>svg]:size-3! border-border text-foreground [a]:hover:bg-muted [a]:hover:text-muted-foreground",
  {
    variants: {
      variant: {
        outline: "",
      },
    },
    defaultVariants: {
      variant: "outline",
    },
  }
)

function Badge({
  className,
  variant: _variant = "outline",
  asChild = false,
  ...props
}) {
  const Comp = asChild ? Slot.Root : "span"

  return (
    <Comp
      data-slot="badge"
      data-variant="outline"
      className={cn(badgeVariants({ variant: "outline" }), className)}
      {...props} />
  );
}

export { Badge, badgeVariants }
