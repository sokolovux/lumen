import type { Appointment, LabResult, Medication, Patient } from '@/state/types'
import { formatTimestamp } from '@/lib/fixedClock'

export const JORDAN_REYES_ID = 'jordan-reyes'

export const PATIENTS: Patient[] = [
  { id: JORDAN_REYES_ID, name: 'Jordan Reyes', mrn: 'MRN-48291', dob: '03/14/1988', isInteractive: true },
  { id: 'maria-chen', name: 'Maria Chen', mrn: 'MRN-33102', dob: '07/22/1975' },
  { id: 'david-kim', name: 'David Kim', mrn: 'MRN-55847', dob: '11/05/1992' },
  { id: 'sarah-patel', name: 'Sarah Patel', mrn: 'MRN-22419', dob: '01/30/1980' },
  { id: 'james-wilson', name: 'James Wilson', mrn: 'MRN-66703', dob: '09/18/1965' },
]

export const WEEK_DATES = [
  '2026-08-10',
  '2026-08-11',
  '2026-08-12',
  '2026-08-13',
  '2026-08-14',
]

/** Seeded placeholder appointments — Jordan's status is derived, not from this list */
export const SEEDED_APPOINTMENTS: Appointment[] = [
  { id: 'apt-1', patientId: JORDAN_REYES_ID, patientName: 'Jordan Reyes', time: '10:30 AM', date: '2026-08-10', status: 'scheduled', isInteractive: true },
  { id: 'apt-2', patientId: 'maria-chen', patientName: 'Maria Chen', time: '9:00 AM', date: '2026-08-10', status: 'completed' },
  { id: 'apt-3', patientId: 'david-kim', patientName: 'David Kim', time: '9:30 AM', date: '2026-08-10', status: 'in_progress' },
  { id: 'apt-4', patientId: 'sarah-patel', patientName: 'Sarah Patel', time: '11:30 AM', date: '2026-08-10', status: 'scheduled' },
  { id: 'apt-5', patientId: 'james-wilson', patientName: 'James Wilson', time: '1:00 PM', date: '2026-08-10', status: 'scheduled' },
  { id: 'apt-6', patientId: 'maria-chen', patientName: 'Maria Chen', time: '10:00 AM', date: '2026-08-11', status: 'scheduled' },
  { id: 'apt-7', patientId: 'david-kim', patientName: 'David Kim', time: '2:00 PM', date: '2026-08-11', status: 'awaiting_cosign' },
  { id: 'apt-8', patientId: 'sarah-patel', patientName: 'Sarah Patel', time: '9:00 AM', date: '2026-08-12', status: 'checked_in' },
  { id: 'apt-9', patientId: 'james-wilson', patientName: 'James Wilson', time: '11:00 AM', date: '2026-08-13', status: 'scheduled' },
  { id: 'apt-10', patientId: 'maria-chen', patientName: 'Maria Chen', time: '3:00 PM', date: '2026-08-14', status: 'completed' },
]

export function createInitialLabs(): LabResult[] {
  return [
    { id: 'lab-1', name: 'CBC with Differential', type: 'lab', orderDate: 'Aug 5, 2026', status: 'pending' },
    { id: 'lab-2', name: 'Comprehensive Metabolic Panel', type: 'lab', orderDate: 'Aug 5, 2026', status: 'pending' },
    { id: 'lab-3', name: 'Chest X-Ray', type: 'imaging', orderDate: 'Aug 7, 2026', status: 'pending' },
    { id: 'lab-4', name: 'HbA1c', type: 'lab', orderDate: 'Aug 3, 2026', status: 'released' },
  ]
}

export function createInitialMeds(): Medication[] {
  return [
    {
      id: 'med-1',
      name: 'Lisinopril',
      dose: '10 mg',
      frequency: 'Daily',
      status: 'active',
      history: [{ id: 'me-1', timestamp: formatTimestamp(), actor: 'physician', action: 'continued' }],
    },
    {
      id: 'med-2',
      name: 'Metformin',
      dose: '500 mg',
      frequency: 'Twice daily',
      status: 'active',
      history: [{ id: 'me-2', timestamp: formatTimestamp(), actor: 'physician', action: 'continued' }],
    },
  ]
}

export const TODAY_KANBAN_COLUMNS: { key: string; label: string }[] = [
  { key: 'scheduled', label: 'Scheduled' },
  { key: 'checked_in', label: 'Checked In' },
  { key: 'in_progress', label: 'In Progress' },
  { key: 'awaiting_cosign', label: 'Awaiting Cosign' },
  { key: 'completed', label: 'Completed' },
]

export function parseAppointmentTime(time: string): number {
  const match = time.match(/(\d+):(\d+)\s*(AM|PM)/i)
  if (!match) return 0
  let hours = parseInt(match[1] ?? '0', 10)
  const minutes = parseInt(match[2] ?? '0', 10)
  const period = match[3]?.toUpperCase()
  if (period === 'PM' && hours !== 12) hours += 12
  if (period === 'AM' && hours === 12) hours = 0
  return hours * 60 + minutes
}

export function isLateAppointment(time: string, status: string): boolean {
  if (status === 'completed') return false
  const aptMinutes = parseAppointmentTime(time)
  const fixedMinutes = 11 * 60
  return aptMinutes < fixedMinutes
}
