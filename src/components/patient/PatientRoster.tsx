import { useNavigate } from 'react-router-dom'
import { toast } from 'sonner'
import { PATIENTS, JORDAN_REYES_ID } from '@/lib/scheduleData'
import { useAppState } from '@/state/AppStateContext'
import { Card, CardContent, CardHeader } from '@/components/ui/card'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import { Skeleton } from '@/components/ui/skeleton'

export function PatientRoster() {
  const navigate = useNavigate()
  const { dispatch } = useAppState()

  const handlePatientClick = (patientId: string, isInteractive?: boolean) => {
    if (isInteractive || patientId === JORDAN_REYES_ID) {
      dispatch({ type: 'SET_BREADCRUMB_ORIGIN', origin: 'patients' })
      navigate(`/patients/${patientId}`)
      return
    }
    toast.info('This patient is scoped out of the demo', {
      description: 'Jordan Reyes is the only interactive patient in this prototype.',
    })
  }

  return (
    <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
      {PATIENTS.map((patient) => {
        const initials = patient.name
          .split(' ')
          .map((n) => n[0])
          .join('')
        return (
          <Card
            key={patient.id}
            className="cursor-pointer transition-shadow hover:shadow-md"
            onClick={() => handlePatientClick(patient.id, patient.isInteractive)}
          >
            <CardHeader className="flex flex-row items-center gap-3 p-4">
              <Avatar>
                <AvatarFallback>{initials}</AvatarFallback>
              </Avatar>
              <div>
                <p className="font-medium">{patient.name}</p>
                <p className="text-xs text-muted-foreground">{patient.mrn}</p>
              </div>
            </CardHeader>
            <CardContent className="px-4 pb-4">
              <Skeleton className="h-3 w-24" />
            </CardContent>
          </Card>
        )
      })}
    </div>
  )
}
