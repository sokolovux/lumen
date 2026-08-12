/** Pinned demo clock: Wednesday Aug 12, 2026 at 11:00 AM */
export const FIXED_CLOCK = new Date(2026, 7, 12, 11, 0, 0, 0)

export function formatFixedTime(date: Date = FIXED_CLOCK): string {
  return date.toLocaleTimeString('en-US', {
    hour: 'numeric',
    minute: '2-digit',
    hour12: true,
  })
}

export function formatFixedDate(date: Date = FIXED_CLOCK): string {
  return date.toLocaleDateString('en-US', {
    weekday: 'long',
    month: 'long',
    day: 'numeric',
    year: 'numeric',
  })
}

export function formatTimestamp(date: Date = FIXED_CLOCK): string {
  return `${formatFixedDate(date)} ${formatFixedTime(date)}`
}

/** Short date label for the Schedule page pinned clock (e.g. Wed, Aug 12). */
export function formatFixedScheduleClockDate(date: Date = FIXED_CLOCK): string {
  return date.toLocaleDateString('en-US', {
    weekday: 'short',
    month: 'short',
    day: 'numeric',
  })
}

/** Time label for the Schedule page pinned clock (e.g. 11:00AM). */
export function formatFixedScheduleClockTime(date: Date = FIXED_CLOCK): string {
  return formatFixedTime(date).replace(/\s+(AM|PM)/i, '$1')
}
