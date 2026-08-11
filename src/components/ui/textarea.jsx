import * as React from "react"

import { cn } from "@/lib/utils"

function Textarea({
  className,
  rows = 1,
  ...props
}) {
  return (
    <textarea
      data-slot="textarea"
      rows={rows}
      className={cn(
        "min-h-[4lh] max-h-[6lh] w-full resize-y overflow-y-auto rounded-sm border border-input bg-transparent px-2.5 py-1 text-base transition-colors outline-none placeholder:text-muted-foreground focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50 disabled:cursor-not-allowed disabled:bg-input/50 disabled:opacity-50 aria-invalid:border-destructive aria-invalid:ring-3 aria-invalid:ring-destructive/20 dark:bg-input/30 dark:disabled:bg-input/80 dark:aria-invalid:border-destructive/50 dark:aria-invalid:ring-destructive/40",
        className
      )}
      {...props} />
  );
}

export { Textarea }
