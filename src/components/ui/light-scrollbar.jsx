import * as React from "react"

import { cn } from "@/lib/utils"

const MIN_THUMB_HEIGHT = 24

function LightScrollbar({
  className,
  children,
  ...props
}) {
  const viewportRef = React.useRef(null)
  const [thumb, setThumb] = React.useState({ height: 0, top: 0, scrollable: false })

  const updateThumb = React.useCallback(() => {
    const viewport = viewportRef.current
    if (!viewport) return

    const { scrollTop, scrollHeight, clientHeight } = viewport
    if (scrollHeight <= clientHeight) {
      setThumb({ height: 0, top: 0, scrollable: false })
      return
    }

    const thumbHeight = Math.max(MIN_THUMB_HEIGHT, (clientHeight / scrollHeight) * clientHeight)
    const maxThumbTop = clientHeight - thumbHeight
    const scrollRatio = scrollTop / (scrollHeight - clientHeight)

    setThumb({
      height: thumbHeight,
      top: scrollRatio * maxThumbTop,
      scrollable: true,
    })
  }, [])

  React.useEffect(() => {
    const viewport = viewportRef.current
    if (!viewport) return

    updateThumb()

    viewport.addEventListener("scroll", updateThumb, { passive: true })

    const resizeObserver = new ResizeObserver(updateThumb)
    resizeObserver.observe(viewport)
    for (const child of viewport.children) {
      resizeObserver.observe(child)
    }

    return () => {
      viewport.removeEventListener("scroll", updateThumb)
      resizeObserver.disconnect()
    }
  }, [updateThumb, children])

  return (
    <div
      data-slot="light-scrollbar"
      className={cn("relative min-h-0", className)}
      {...props}>
      <div
        ref={viewportRef}
        data-slot="light-scrollbar-viewport"
        className="h-full overflow-y-auto overscroll-contain">
        {children}
      </div>
      {thumb.scrollable ? (
        <div
          data-slot="light-scrollbar-thumb"
          aria-hidden
          style={{
            height: thumb.height,
            transform: `translateY(${thumb.top}px)`,
          }} />
      ) : null}
    </div>
  );
}

export { LightScrollbar }
