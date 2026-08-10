import { useLocation, useNavigate } from 'react-router-dom'
import { toast } from 'sonner'
import { PATIENTS, JORDAN_REYES_ID } from '@/lib/scheduleData'
import { PageHeader } from '@/components/layout/PageHeader'
import { Card, CardContent, CardHeader } from '@/components/ui/card'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import { Skeleton } from '@/components/ui/skeleton'
import { LightScrollbar } from '@/components/ui/light-scrollbar'
import { useAppState } from '@/state/AppStateContext'

export function PatientsPage() {
  const navigate = useNavigate()
  const location = useLocation()
  const { dispatch } = useAppState()

  const handlePatientClick = (patientId: string, isInteractive?: boolean) => {
    if (isInteractive || patientId === JORDAN_REYES_ID) {
      dispatch({ type: 'CLOSE_VISIT' })
      navigate(`/patients/${patientId}`, {
        state: { from: `${location.pathname}${location.search}` },
      })
      return
    }
    toast.info('This patient is scoped out of the demo', {
      description: 'Jordan Reyes is the only interactive patient in this prototype.',
    })
  }

  return (
    <div className="flex h-full flex-col overflow-hidden">
      <PageHeader title="Patients" />
      <LightScrollbar className="min-h-0 flex-1">
        <div className="p-6">
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {PATIENTS.map((patient) => {
            const initials = patient.name
              .split(' ')
              .map((n) => n[0])
              .join('')
            return (
              <Card
                key={patient.id}
                interactive
                onClick={() => handlePatientClick(patient.id, patient.isInteractive)}
              >
                <CardHeader>
                  <div className="flex flex-row items-center gap-3">
                    <Avatar>
                      <AvatarFallback>{initials}</AvatarFallback>
                    </Avatar>
                    <div>
                      <p><strong>{patient.name}</strong></p>
                      <p className="text-xs text-muted-foreground">{patient.mrn}</p>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <Skeleton className="h-3 w-24" />
                </CardContent>
              </Card>
            )
          })}
          </div>
        </div>
      </LightScrollbar>
    </div>
  )
}
