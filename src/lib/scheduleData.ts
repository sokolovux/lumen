import type { Appointment, LabResult, Medication, Patient, ScheduleStatus } from '@/state/types'
import { formatTimestamp } from '@/lib/fixedClock'

export const JORDAN_REYES_ID = 'jordan-reyes'
/** Display name for the demo assistant in physician-facing request copy */
export const DEMO_ASSISTANT_NAME = 'Sam Whitfield'

const FIRST_NAMES = [
  'Ava', 'Liam', 'Emma', 'Noah', 'Olivia', 'Ethan', 'Sophia', 'Mason', 'Isabella', 'Lucas',
  'Mia', 'Alexander', 'Charlotte', 'Benjamin', 'Amelia', 'Henry', 'Harper', 'Sebastian', 'Evelyn', 'Jack',
  'Abigail', 'Aiden', 'Emily', 'Owen', 'Elizabeth', 'Samuel', 'Sofia', 'Matthew', 'Avery', 'Joseph',
  'Ella', 'Levi', 'Scarlett', 'Mateo', 'Grace', 'David', 'Chloe', 'John', 'Victoria', 'Wyatt',
  'Riley', 'Carter', 'Aria', 'Julian', 'Lily', 'Luke', 'Aurora', 'Grayson', 'Zoey', 'Isaac',
  'Nora', 'Jayden', 'Camila', 'Gabriel', 'Hannah', 'Anthony', 'Layla', 'Dylan', 'Penelope', 'Leo',
  'Maya', 'Thomas', 'Natalie', 'Charles', 'Zoe', 'Christopher', 'Stella', 'Jaxon', 'Eleanor', 'Maverick',
  'Addison', 'Josiah', 'Lucy', 'Isaiah', 'Paisley', 'Andrew', 'Violet', 'Elias', 'Savannah', 'Joshua',
  'Brooklyn', 'Nathan', 'Bella', 'Caleb', 'Claire', 'Ryan', 'Skylar', 'Nolan', 'Lucy', 'Adrian',
  'Anna', 'Aaron', 'Caroline', 'Eli', 'Genesis', 'Colton', 'Aaliyah', 'Hunter', 'Kennedy', 'Jonathan',
]

const LAST_NAMES = [
  'Smith', 'Johnson', 'Williams', 'Brown', 'Jones', 'Garcia', 'Miller', 'Davis', 'Rodriguez', 'Martinez',
  'Hernandez', 'Lopez', 'Gonzalez', 'Wilson', 'Anderson', 'Thomas', 'Taylor', 'Moore', 'Jackson', 'Martin',
  'Lee', 'Perez', 'Thompson', 'White', 'Harris', 'Sanchez', 'Clark', 'Ramirez', 'Lewis', 'Robinson',
  'Walker', 'Young', 'Allen', 'King', 'Wright', 'Scott', 'Torres', 'Nguyen', 'Hill', 'Flores',
  'Green', 'Adams', 'Nelson', 'Baker', 'Hall', 'Rivera', 'Campbell', 'Mitchell', 'Carter', 'Roberts',
]

function padMrn(n: number): string {
  return `MRN-${String(n).padStart(5, '0')}`
}

function dobFromIndex(i: number): string {
  const month = String((i % 12) + 1).padStart(2, '0')
  const day = String((i % 28) + 1).padStart(2, '0')
  const year = 1955 + (i % 50)
  return `${month}/${day}/${year}`
}

function generatePatients(count: number, mrnStart: number): Patient[] {
  const patients: Patient[] = []
  for (let i = 0; i < count; i++) {
    const first = FIRST_NAMES[i % FIRST_NAMES.length]!
    const last = LAST_NAMES[Math.floor(i / FIRST_NAMES.length) % LAST_NAMES.length]!
    const suffix = Math.floor(i / (FIRST_NAMES.length * LAST_NAMES.length))
    const name = suffix > 0 ? `${first} ${last} ${suffix + 1}` : `${first} ${last}`
    patients.push({
      id: `patient-${String(i + 1).padStart(4, '0')}`,
      name,
      mrn: padMrn(mrnStart + i),
      dob: dobFromIndex(i),
    })
  }
  return patients
}

const CORE_PATIENTS: Patient[] = [
  { id: JORDAN_REYES_ID, name: 'Jordan Reyes', mrn: 'MRN-48291', dob: '03/14/1988', isInteractive: true },
  { id: 'maria-chen', name: 'Maria Chen', mrn: 'MRN-33102', dob: '07/22/1975' },
  { id: 'david-kim', name: 'David Kim', mrn: 'MRN-55847', dob: '11/05/1992' },
  { id: 'sarah-patel', name: 'Sarah Patel', mrn: 'MRN-22419', dob: '01/30/1980' },
  { id: 'james-wilson', name: 'James Wilson', mrn: 'MRN-66703', dob: '09/18/1965' },
]

export const PATIENTS: Patient[] = [
  ...CORE_PATIENTS,
  ...generatePatients(500, 70001),
]

export const WEEK_DATES = [
  '2026-08-10',
  '2026-08-11',
  '2026-08-12',
  '2026-08-13',
  '2026-08-14',
]

const APPOINTMENT_KINDS = [
  'Follow-up',
  'Annual physical',
  'New patient',
  'Sick visit',
  'Lab review',
  'Medication check',
]

const APPOINTMENT_STATUSES: ScheduleStatus[] = [
  'scheduled',
  'scheduled',
  'scheduled',
  'with_assistant',
  'with_physician',
  'finished',
  'late',
]

const TIME_SLOTS: string[] = (() => {
  const slots: string[] = []
  for (let minutes = 8 * 60; minutes <= 17 * 60; minutes += 15) {
    const h24 = Math.floor(minutes / 60)
    const m = minutes % 60
    const period = h24 >= 12 ? 'PM' : 'AM'
    const h12 = h24 % 12 === 0 ? 12 : h24 % 12
    slots.push(`${h12}:${String(m).padStart(2, '0')} ${period}`)
  }
  return slots
})()

function distributeCounts(total: number, buckets: number): number[] {
  const base = Math.floor(total / buckets)
  const remainder = total % buckets
  return Array.from({ length: buckets }, (_, i) => base + (i < remainder ? 1 : 0))
}

function timeSlotForIndex(index: number, count: number): string {
  if (count <= 1) return TIME_SLOTS[Math.floor(TIME_SLOTS.length / 3)]!
  const position = index / (count - 1)
  const slot = Math.round(position * (TIME_SLOTS.length - 1))
  return TIME_SLOTS[slot]!
}

function generateWeekAppointments(count: number): Appointment[] {
  const pool = PATIENTS.filter((p) => p.id !== JORDAN_REYES_ID)
  const perDay = distributeCounts(count, WEEK_DATES.length)
  const appointments: Appointment[] = []
  let patientIndex = 0
  let aptNumber = 1

  WEEK_DATES.forEach((date, dayIndex) => {
    const dayCount = perDay[dayIndex]!
    for (let slot = 0; slot < dayCount; slot++) {
      const isJordan = dayIndex === 0 && slot === 0
      if (isJordan) {
        appointments.push({
          id: 'apt-1',
          patientId: JORDAN_REYES_ID,
          patientName: 'Jordan Reyes',
          time: '10:30 AM',
          date,
          kind: 'Follow-up',
          status: 'scheduled',
          isInteractive: true,
        })
        aptNumber += 1
        continue
      }

      const patient = pool[patientIndex % pool.length]!
      patientIndex += 1
      appointments.push({
        id: `apt-${aptNumber}`,
        patientId: patient.id,
        patientName: patient.name,
        time: timeSlotForIndex(slot, dayCount),
        date,
        kind: APPOINTMENT_KINDS[(aptNumber - 1) % APPOINTMENT_KINDS.length]!,
        status: APPOINTMENT_STATUSES[(aptNumber - 1) % APPOINTMENT_STATUSES.length]!,
      })
      aptNumber += 1
    }
  })

  return appointments
}

/** Seeded placeholder appointments — Jordan's status is derived, not from this list */
export const SEEDED_APPOINTMENTS: Appointment[] = generateWeekAppointments(100)

export function createInitialLabs(): LabResult[] {
  return [
    { id: 'lab-1', name: 'CBC with Differential', type: 'lab', orderDate: 'Aug 5, 2026', status: 'pending', everRequested: false },
    { id: 'lab-2', name: 'Comprehensive Metabolic Panel', type: 'lab', orderDate: 'Aug 5, 2026', status: 'pending', everRequested: false },
    { id: 'lab-3', name: 'Chest X-Ray', type: 'imaging', orderDate: 'Aug 7, 2026', status: 'pending', everRequested: false },
    { id: 'lab-4', name: 'HbA1c', type: 'lab', orderDate: 'Aug 3, 2026', status: 'released', everRequested: false },
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
  { key: 'with_assistant', label: 'With Assistant' },
  { key: 'with_physician', label: 'With Physician' },
  { key: 'finished', label: 'Finished' },
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
  if (status === 'finished') return false
  const aptMinutes = parseAppointmentTime(time)
  const fixedMinutes = 11 * 60
  return aptMinutes < fixedMinutes
}
