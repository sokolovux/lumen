import { toast } from 'sonner'
import type { ScheduleStatus } from '@/state/types'

type VisitStage = Extract<ScheduleStatus, 'intake' | 'review' | 'finished'>

const STAGE_TOAST_CLASS: Record<VisitStage, string> = {
  intake: 'visit-toast-intake',
  review: 'visit-toast-review',
  finished: 'visit-toast-finished',
}

export function visitErrorToast(message: string) {
  toast.error(message)
}

export function visitStageToast(message: string, stage: VisitStage) {
  toast.success(message, { className: STAGE_TOAST_CLASS[stage] })
}
