/** Pinned demo clock: Monday Aug 10, 2026 at 11:00 AM */
export const FIXED_CLOCK = new Date(2026, 7, 10, 11, 0, 0, 0)

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
