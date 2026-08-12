import { useMemo, useState } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'
import { LayoutGrid, List, Plus, SearchIcon } from 'lucide-react'
import { toast } from 'sonner'
import type { Patient } from '@/state/types'
import { PATIENTS, JORDAN_REYES_ID } from '@/lib/scheduleData'
import { shouldAutoOpenTodayVisit } from '@/lib/visitLifecycle'
import { FIXED_CLOCK } from '@/lib/fixedClock'
import { PageHeader } from '@/components/layout/PageHeader'
import { PageContent } from '@/components/layout/PageContent'
import { Button } from '@/components/ui/button'
import { Card, CardHeader } from '@/components/ui/card'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import { LightScrollbar } from '@/components/ui/light-scrollbar'
import {
  InputGroup,
  InputGroupAddon,
  InputGroupInput,
} from '@/components/ui/input-group'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { useAppState } from '@/state/AppStateContext'

type PatientsView = 'grid' | 'list'
type PatientSort = 'a-z' | 'z-a' | 'younger-oldest' | 'oldest-youngest'

function patientInitials(name: string): string {
  return name
    .split(' ')
    .map((part) => part[0])
    .join('')
}

function parsePatientDob(dob: string): number {
  const [month, day, year] = dob.split('/').map(Number)
  return new Date(year!, month! - 1, day!).getTime()
}

function patientAge(dob: string): number {
  const [month, day, year] = dob.split('/').map(Number)
  const birthDate = new Date(year!, month! - 1, day!)
  let age = FIXED_CLOCK.getFullYear() - birthDate.getFullYear()
  const monthDiff = FIXED_CLOCK.getMonth() - birthDate.getMonth()

  if (monthDiff < 0 || (monthDiff === 0 && FIXED_CLOCK.getDate() < birthDate.getDate())) {
    age--
  }

  return age
}

function formatPatientDob(dob: string): string {
  return `${dob} (${patientAge(dob)})`
}

function formatPatientInsurance(patient: Patient): string {
  return `${patient.insurance} (${patient.insurancePolicyNumber})`
}

function sortPatients(patients: Patient[], sort: PatientSort): Patient[] {
  const sorted = [...patients]

  switch (sort) {
    case 'a-z':
      return sorted.sort((a, b) => a.name.localeCompare(b.name))
    case 'z-a':
      return sorted.sort((a, b) => b.name.localeCompare(a.name))
    case 'younger-oldest':
      return sorted.sort((a, b) => parsePatientDob(b.dob) - parsePatientDob(a.dob))
    case 'oldest-youngest':
      return sorted.sort((a, b) => parsePatientDob(a.dob) - parsePatientDob(b.dob))
  }
}

function patientSexLabel(patientId: string): 'F' | 'M' {
  const sum = patientId.split('').reduce((total, char) => total + char.charCodeAt(0), 0)
  return sum % 2 === 0 ? 'F' : 'M'
}

interface PatientCollectionProps {
  patients: Patient[]
  onPatientClick: (patientId: string, isInteractive?: boolean) => void
}

function PatientsGridView({ patients, onPatientClick }: PatientCollectionProps) {
  return (
    <div data-slot="patients-grid">
      {patients.map((patient) => (
        <Card
          key={patient.id}
          interactive
          data-patient-card=""
          onClick={() => onPatientClick(patient.id, patient.isInteractive)}
        >
          <CardHeader>
            <div className="flex items-start gap-3">
              <Avatar className="shrink-0">
                <AvatarFallback>{patientInitials(patient.name)}</AvatarFallback>
              </Avatar>
              <div className="min-w-0 flex-1">
                <p className="truncate">
                  <strong>{patient.name}</strong>
                </p>
                <p className="truncate text-sm text-muted-foreground">{patient.mrn}</p>
                <p className="truncate text-sm">
                  {formatPatientDob(patient.dob)} · {patientSexLabel(patient.id)}
                </p>
                <p className="truncate text-sm text-muted-foreground">
                  {formatPatientInsurance(patient)}
                </p>
              </div>
            </div>
          </CardHeader>
        </Card>
      ))}
    </div>
  )
}

function PatientsListView({ patients, onPatientClick }: PatientCollectionProps) {
  return (
    <div data-slot="patients-list">
      {patients.map((patient) => (
        <Card
          key={patient.id}
          interactive
          data-patient-card=""
          onClick={() => onPatientClick(patient.id, patient.isInteractive)}
        >
          <Avatar className="shrink-0">
            <AvatarFallback>{patientInitials(patient.name)}</AvatarFallback>
          </Avatar>
          <p className="truncate">
            <strong>{patient.name}</strong>
          </p>
          <p className="truncate text-sm text-muted-foreground">{patient.mrn}</p>
          <p className="truncate text-sm">{formatPatientDob(patient.dob)}</p>
          <p className="text-sm">{patientSexLabel(patient.id)}</p>
          <p className="truncate text-sm text-muted-foreground">
            {formatPatientInsurance(patient)}
          </p>
        </Card>
      ))}
    </div>
  )
}

export function PatientsPage() {
  const navigate = useNavigate()
  const location = useLocation()
  const { dispatch, state } = useAppState()
  const [view, setView] = useState<PatientsView>('list')
  const [sort, setSort] = useState<PatientSort>('a-z')

  const sortedPatients = useMemo(() => sortPatients(PATIENTS, sort), [sort])

  const handlePatientClick = (patientId: string, isInteractive?: boolean) => {
    if (isInteractive || patientId === JORDAN_REYES_ID) {
      const autoOpenTodayVisit =
        patientId === JORDAN_REYES_ID
        && shouldAutoOpenTodayVisit(state.role, state)
      navigate(`/patients/${patientId}`, {
        state: {
          from: `${location.pathname}${location.search}`,
          autoOpenTodayVisit,
        },
      })
      return
    }
    toast.info('This patient is scoped out of the demo', {
      description: 'Jordan Reyes is the only interactive patient in this prototype.',
    })
  }

  return (
    <div className="flex h-full flex-col overflow-hidden">
      <PageHeader title="Patients">
        <div className="flex items-center gap-2">
          <InputGroup className="h-10 w-64">
            <InputGroupAddon>
              <SearchIcon className="opacity-50" />
            </InputGroupAddon>
            <InputGroupInput placeholder="Search patients" readOnly />
          </InputGroup>
          <Select value={sort} onValueChange={(value) => setSort(value as PatientSort)}>
            <SelectTrigger className="w-44">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="a-z">A-Z</SelectItem>
              <SelectItem value="z-a">Z-A</SelectItem>
              <SelectItem value="younger-oldest">Younger-Oldest</SelectItem>
              <SelectItem value="oldest-youngest">Oldest-Youngest</SelectItem>
            </SelectContent>
          </Select>
          <div
            data-slot="page-view-switch"
            className="flex h-10 rounded-sm border bg-background p-0.5"
          >
            {([
              { key: 'list' as const, label: 'List', icon: List },
              { key: 'grid' as const, label: 'Grid', icon: LayoutGrid },
            ]).map(({ key, label, icon: Icon }) => (
              <Button
                key={key}
                variant="ghost"
                size="sm"
                className="h-full"
                aria-pressed={view === key}
                onClick={() => setView(key)}
              >
                <Icon />
                {label}
              </Button>
            ))}
          </div>
          <Button type="button">
            <Plus />
            Create patient
          </Button>
        </div>
      </PageHeader>
      <LightScrollbar className="min-h-0 flex-1">
        <PageContent>
          {view === 'grid' ? (
            <PatientsGridView patients={sortedPatients} onPatientClick={handlePatientClick} />
          ) : (
            <PatientsListView patients={sortedPatients} onPatientClick={handlePatientClick} />
          )}
        </PageContent>
      </LightScrollbar>
    </div>
  )
}
