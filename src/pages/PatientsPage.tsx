import { PatientRoster } from '@/components/patient/PatientRoster'

export function PatientsPage() {
  return (
    <div className="flex h-full flex-col">
      <div className="border-b px-6 py-4">
        <h4>Patients</h4>
      </div>
      <div className="flex-1 overflow-y-auto p-6">
        <PatientRoster />
      </div>
    </div>
  )
}
