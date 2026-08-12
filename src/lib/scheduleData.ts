import type { Appointment, LabResult, Medication, Patient, ScheduleStatus } from '@/state/types'
import { JORDAN_REYES_CONFIDENTIAL_NOTE } from '@/lib/jordanReyesChartData'

export const JORDAN_REYES_ID = 'jordan-reyes'
/** Display name for the demo assistant in physician-facing request copy */
export const DEMO_ASSISTANT_NAME = 'Sam Whitfield'
/** Display name for the demo physician in the product shell */
export const DEMO_PHYSICIAN_NAME = 'Dr. Amara Osei'
/** Short form for banner and handoff copy */
export const DEMO_PHYSICIAN_SHORT_NAME = 'Dr. Osei'

export function getLabDenialCommentTitle(): string {
  return `Comment from ${DEMO_PHYSICIAN_NAME}`
}

export function formatLabDenialComment(reason: string): string {
  return `"${reason}"`
}

/** Jordan chart: first three locked labs show a New badge until access is requested. */
export const JORDAN_NEW_LAB_IDS = new Set([
  'lab-a1c',
  'lab-glucose',
  'lab-ldl',
])

export function shouldShowNewLabBadge(lab: Pick<LabResult, 'id' | 'everRequested'>): boolean {
  return JORDAN_NEW_LAB_IDS.has(lab.id) && !lab.everRequested
}

export function getDemoUserProfile(role: 'assistant' | 'physician') {
  return role === 'assistant'
    ? { name: DEMO_ASSISTANT_NAME, initials: 'SW' }
    : { name: DEMO_PHYSICIAN_NAME, initials: 'AO' }
}

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

const INSURANCE_PLANS = [
  'Blue Cross Blue Shield',
  'Aetna',
  'UnitedHealthcare',
  'Cigna',
  'Humana',
  'Kaiser Permanente',
  'Medicare',
  'Medicaid',
] as const

function insuranceFromIndex(i: number): string {
  return INSURANCE_PLANS[i % INSURANCE_PLANS.length]!
}

function policyNumberFromIndex(i: number): string {
  return `W${String(100000000 + i * 7919).padStart(9, '0').slice(0, 9)}`
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
      insurance: insuranceFromIndex(i),
      insurancePolicyNumber: policyNumberFromIndex(i),
    })
  }
  return patients
}

const CORE_PATIENTS: Patient[] = [
  {
    id: JORDAN_REYES_ID,
    name: 'Jordan Reyes',
    mrn: 'MRN-48291',
    dob: '03/14/1980',
    insurance: 'Aetna',
    insurancePolicyNumber: 'W482910003',
    isInteractive: true,
  },
  {
    id: 'maria-chen',
    name: 'Maria Chen',
    mrn: 'MRN-33102',
    dob: '07/22/1975',
    insurance: 'Medicare',
    insurancePolicyNumber: '1EG4-TE5-MK72',
  },
  {
    id: 'david-kim',
    name: 'David Kim',
    mrn: 'MRN-55847',
    dob: '11/05/1992',
    insurance: 'Blue Cross Blue Shield',
    insurancePolicyNumber: 'XYZ55847102',
  },
  {
    id: 'sarah-patel',
    name: 'Sarah Patel',
    mrn: 'MRN-22419',
    dob: '01/30/1980',
    insurance: 'UnitedHealthcare',
    insurancePolicyNumber: 'UHC22419880',
  },
  {
    id: 'james-wilson',
    name: 'James Wilson',
    mrn: 'MRN-66703',
    dob: '09/18/1965',
    insurance: 'Humana',
    insurancePolicyNumber: 'H667031965',
  },
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

/** Demo "today": aligned with FIXED_CLOCK (Wednesday of WEEK_DATES) */
export const DEMO_TODAY = WEEK_DATES[2]!

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
  'intake',
  'review',
  'finished',
]

const TIME_SLOTS: string[] = (() => {
  const slots: string[] = []
  for (let minutes = 8 * 60; minutes <= 17 * 60; minutes += 15) {
    const h24 = Math.floor(minutes / 60)
    const m = minutes % 60
    const period = h24 >= 12 ? 'PM' : 'AM'
    const h12 = h24 % 12 === 0 ? 12 : h24 % 12
    slots.push(`${h12}:${String(m).padStart(2, '0')}${period}`)
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

function seededStatus(aptNumber: number, date: string): ScheduleStatus {
  if (date < DEMO_TODAY) {
    return aptNumber % 5 === 0 ? 'no_show' : 'finished'
  }
  return APPOINTMENT_STATUSES[(aptNumber - 1) % APPOINTMENT_STATUSES.length]!
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
      const isJordan = date === DEMO_TODAY && slot === 0
      if (isJordan) {
        appointments.push({
          id: 'apt-1',
          patientId: JORDAN_REYES_ID,
          patientName: 'Jordan Reyes',
          time: '1:50PM',
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
        status: seededStatus(aptNumber, date),
      })
      aptNumber += 1
    }
  })

  return appointments
}

/** Seeded placeholder appointments: Jordan's status is derived, not from this list */
export const SEEDED_APPOINTMENTS: Appointment[] = generateWeekAppointments(100)

export function getAppointmentForPatientOnDate(
  patientId: string,
  date: string,
): Appointment | undefined {
  return SEEDED_APPOINTMENTS.find(
    (appointment) => appointment.patientId === patientId && appointment.date === date,
  )
}

export function getAnyAppointmentForPatient(patientId: string): Appointment | undefined {
  return SEEDED_APPOINTMENTS.find((appointment) => appointment.patientId === patientId)
}

export function createInitialLabs(): LabResult[] {
  return [
    {
      id: 'lab-a1c',
      name: 'HbA1c',
      type: 'lab',
      orderDate: 'Aug 3, 2026',
      status: 'pending',
      everRequested: false,
    },
    {
      id: 'lab-glucose',
      name: 'Fasting glucose',
      type: 'lab',
      orderDate: 'Aug 3, 2026',
      status: 'pending',
      everRequested: false,
    },
    {
      id: 'lab-ldl',
      name: 'LDL cholesterol',
      type: 'lab',
      orderDate: 'Aug 3, 2026',
      status: 'pending',
      everRequested: false,
    },
    {
      id: 'lab-creatinine',
      name: 'Serum creatinine',
      type: 'lab',
      orderDate: 'Aug 3, 2026',
      status: 'released',
      everRequested: false,
    },
    {
      id: 'lab-egfr',
      name: 'eGFR',
      type: 'lab',
      orderDate: 'Aug 3, 2026',
      status: 'released',
      everRequested: false,
    },
    {
      id: 'lab-tsh',
      name: 'TSH',
      type: 'lab',
      orderDate: 'Aug 3, 2026',
      status: 'released',
      everRequested: false,
    },
    {
      id: 'lab-cbc',
      name: 'CBC with differential',
      type: 'lab',
      orderDate: 'Aug 3, 2026',
      status: 'released',
      everRequested: false,
    },
    {
      id: 'lab-hepc',
      name: 'Hepatitis C antibody',
      type: 'lab',
      orderDate: 'Aug 5, 2026',
      status: 'pending',
      everRequested: false,
      physicianOnly: true,
    },
    {
      id: 'img-retinal',
      name: 'Diabetic retinal screening',
      type: 'imaging',
      orderDate: 'Apr 22, 2026',
      status: 'released',
      everRequested: false,
    },
    {
      id: 'img-cxr',
      name: 'Chest X-ray',
      type: 'imaging',
      orderDate: 'Nov 8, 2025',
      status: 'released',
      everRequested: false,
    },
    {
      id: 'img-abd-us',
      name: 'Abdominal ultrasound',
      type: 'imaging',
      orderDate: 'May 15, 2026',
      status: 'released',
      everRequested: false,
    },
  ]
}

export function createInitialMeds(): Medication[] {
  return [
    {
      id: 'med-1',
      name: 'Metformin',
      dose: '1000 mg',
      frequency: 'Twice daily',
      status: 'active',
      history: [
        {
          id: 'me-1',
          timestamp: 'Aug 3, 2026 10:15 AM',
          actor: 'physician',
          action: 'continued',
          detail: 'Dose increased to 1000 mg BID',
        },
      ],
    },
    {
      id: 'med-2',
      name: 'Empagliflozin',
      dose: '10 mg',
      frequency: 'Daily',
      status: 'active',
      history: [
        {
          id: 'me-2',
          timestamp: 'Nov 8, 2025 2:40 PM',
          actor: 'physician',
          action: 'continued',
        },
      ],
    },
    {
      id: 'med-3',
      name: 'Lisinopril',
      dose: '20 mg',
      frequency: 'Daily',
      status: 'active',
      history: [
        {
          id: 'me-3',
          timestamp: 'May 15, 2026 9:05 AM',
          actor: 'physician',
          action: 'continued',
          detail: 'Dose increased from 10 mg',
        },
      ],
    },
    {
      id: 'med-4',
      name: 'Amlodipine',
      dose: '5 mg',
      frequency: 'Daily',
      status: 'active',
      history: [
        {
          id: 'me-4',
          timestamp: 'May 15, 2026 9:05 AM',
          actor: 'physician',
          action: 'added',
        },
      ],
    },
    {
      id: 'med-5',
      name: 'Atorvastatin',
      dose: '40 mg',
      frequency: 'Daily',
      status: 'active',
      history: [
        {
          id: 'me-5',
          timestamp: 'Sep 5, 2024 11:20 AM',
          actor: 'physician',
          action: 'added',
        },
      ],
    },
    {
      id: 'med-6',
      name: 'Levothyroxine',
      dose: '75 mcg',
      frequency: 'Daily',
      status: 'active',
      history: [
        {
          id: 'me-6',
          timestamp: 'Mar 12, 2025 3:10 PM',
          actor: 'physician',
          action: 'continued',
        },
      ],
    },
    {
      id: 'med-7',
      name: 'Omeprazole',
      dose: '20 mg',
      frequency: 'Daily',
      status: 'active',
      history: [
        {
          id: 'me-7',
          timestamp: 'Aug 20, 2025 1:55 PM',
          actor: 'physician',
          action: 'continued',
        },
      ],
    },
    {
      id: 'med-8',
      name: 'Sertraline',
      dose: '50 mg',
      frequency: 'Daily',
      status: 'active',
      history: [
        {
          id: 'me-8',
          timestamp: 'Mar 12, 2025 3:10 PM',
          actor: 'physician',
          action: 'continued',
        },
      ],
    },
    {
      id: 'med-9',
      name: 'Aspirin',
      dose: '81 mg',
      frequency: 'Daily',
      status: 'active',
      history: [
        {
          id: 'me-9',
          timestamp: 'Nov 8, 2025 2:40 PM',
          actor: 'physician',
          action: 'continued',
        },
      ],
    },
    {
      id: 'med-10',
      name: 'Semaglutide',
      dose: '0.25 mg',
      frequency: 'Weekly',
      status: 'active',
      history: [
        {
          id: 'me-10',
          timestamp: 'Feb 2, 2026 10:30 AM',
          actor: 'physician',
          action: 'added',
          detail: 'Recently added',
        },
      ],
    },
    {
      id: 'med-11',
      name: 'Vitamin D3',
      dose: '2000 IU',
      frequency: 'Daily',
      status: 'active',
      history: [
        {
          id: 'me-11',
          timestamp: 'Sep 5, 2024 11:20 AM',
          actor: 'physician',
          action: 'added',
        },
      ],
    },
    {
      id: 'med-12',
      name: 'Ibuprofen',
      dose: '600 mg',
      frequency: 'PRN',
      status: 'active',
      history: [
        {
          id: 'me-12',
          timestamp: 'Jul 12, 2019 9:00 AM',
          actor: 'physician',
          action: 'continued',
        },
      ],
    },
    {
      id: 'med-13',
      name: 'Amoxicillin',
      dose: '500 mg',
      frequency: 'Three times daily',
      status: 'discontinued',
      history: [
        {
          id: 'me-13a',
          timestamp: 'Jul 22, 2026 4:15 PM',
          actor: 'physician',
          action: 'added',
          detail: 'Short course for sinusitis',
        },
        {
          id: 'me-13b',
          timestamp: 'Jul 29, 2026 9:00 AM',
          actor: 'physician',
          action: 'discontinued',
          detail: 'Course completed',
        },
      ],
    },
  ]
}

export const JORDAN_REYES_INITIAL_CONFIDENTIAL_NOTE = JORDAN_REYES_CONFIDENTIAL_NOTE

export const TODAY_KANBAN_COLUMNS: { key: ScheduleStatus; label: string }[] = [
  { key: 'scheduled', label: 'Scheduled' },
  { key: 'intake', label: 'Intake' },
  { key: 'review', label: 'Review' },
  { key: 'finished', label: 'Finished' },
]

/** Full Week columns for days before demo today: resolved outcomes only */
export const FULL_WEEK_PAST_DAY_COLUMNS: { key: ScheduleStatus; label: string }[] = [
  { key: 'finished', label: 'Finished' },
  { key: 'no_show', label: 'No Show' },
]

export function formatScheduleDateLabel(isoDate: string): string {
  const date = new Date(`${isoDate}T12:00:00`)
  return date.toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  })
}

export function formatAppointmentTimeDisplay(time: string): string {
  return time.replace(/(AM|PM)$/i, ' $1')
}

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

