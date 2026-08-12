import type { VisitVitals } from '@/state/types'
import { useAppState } from '@/state/AppStateContext'
import {
  InputGroup,
  InputGroupAddon,
  InputGroupInput,
  InputGroupText,
} from '@/components/ui/input-group'
import { VisitFieldLabel } from '@/components/patient/VisitFieldLabel'
import { formatVitalValue, VITAL_UNITS } from '@/lib/vitals'
import { getJordanReyesPastVisitVitals } from '@/lib/jordanReyesChartData'
import { isAssistantNoteRevision } from '@/lib/visitLifecycle'

interface VitalsSectionProps {
  readOnly?: boolean
  pastVisitId?: string | null
}

type VitalFieldKey = keyof VisitVitals

const VITAL_FIELDS: {
  key: VitalFieldKey
  label: string
  placeholder: string
  inputMode?: 'decimal' | 'numeric'
}[] = [
  { key: 'bloodPressure', label: 'Blood pressure', placeholder: '120/80' },
  { key: 'heartRate', label: 'Heart rate', placeholder: '72', inputMode: 'numeric' },
  { key: 'respiratoryRate', label: 'Respiratory rate', placeholder: '16', inputMode: 'numeric' },
  { key: 'temperature', label: 'Temperature', placeholder: '98.6', inputMode: 'decimal' },
  { key: 'spO2', label: 'SpO2', placeholder: '98', inputMode: 'numeric' },
  { key: 'weight', label: 'Weight', placeholder: '150', inputMode: 'decimal' },
  { key: 'painScale', label: 'Pain scale', placeholder: '0', inputMode: 'numeric' },
  {
    key: 'fingerstickGlucose',
    label: 'Fingerstick glucose',
    placeholder: '95',
    inputMode: 'numeric',
  },
]

function VitalUnitAddon({ unit }: { unit: string }) {
  return (
    <InputGroupAddon align="inline-end">
      <InputGroupText>{unit}</InputGroupText>
    </InputGroupAddon>
  )
}

export function VitalsSection({ readOnly = false, pastVisitId = null }: VitalsSectionProps) {
  const { state, dispatch } = useAppState()
  const revisionActive = isAssistantNoteRevision(state)

  const fieldsLocked =
    readOnly ||
    (state.visitFinished && !revisionActive) ||
    state.role === 'physician' ||
    (state.role === 'assistant' &&
      state.noteStatus !== 'returned' &&
      (state.noteStatus === 'submitted' ||
        state.noteStatus === 'cosigned' ||
        state.hasSubmittedOnce))

  const editable =
    !readOnly &&
    state.role === 'assistant' &&
    state.visitStarted &&
    (!state.visitFinished || revisionActive) &&
    !fieldsLocked

  const displayVitals = pastVisitId
    ? getJordanReyesPastVisitVitals(pastVisitId)
    : state.vitals

  const updateField = (key: VitalFieldKey, value: string) => {
    if (!editable) return
    dispatch({ type: 'UPDATE_VITALS', vitals: { [key]: value } })
  }

  const renderField = (field: (typeof VITAL_FIELDS)[number]) => {
    const unit = VITAL_UNITS[field.key]
    const hasError = editable && state.vitalsShowErrors && !state.vitals[field.key].trim()
    const value = fieldsLocked
      ? formatVitalValue(field.key, displayVitals[field.key])
      : state.vitals[field.key]

    return (
      <>
        <VisitFieldLabel required>{field.label}</VisitFieldLabel>
        <InputGroup>
          <InputGroupInput
            value={value}
            placeholder={fieldsLocked ? undefined : field.placeholder}
            inputMode={field.inputMode}
            aria-invalid={hasError || undefined}
            disabled={fieldsLocked}
            onChange={(event) => updateField(field.key, event.target.value)}
          />
          {unit && <VitalUnitAddon unit={unit} />}
        </InputGroup>
      </>
    )
  }

  return (
    <section data-slot="vitals-section">
      <h5 className="mb-2">Vitals</h5>
      <div className="grid grid-cols-2 gap-x-2 gap-y-3">
        {VITAL_FIELDS.map((field) => (
          <div key={field.key} className="flex flex-col gap-1">
            {renderField(field)}
          </div>
        ))}
      </div>
    </section>
  )
}
