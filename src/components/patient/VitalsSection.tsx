import { toast } from 'sonner'
import type { VisitVitals } from '@/state/types'
import { useAppState } from '@/state/AppStateContext'
import { Button } from '@/components/ui/button'
import {
  InputGroup,
  InputGroupAddon,
  InputGroupInput,
  InputGroupText,
} from '@/components/ui/input-group'
import {
  areVitalsComplete,
  formatVitalValue,
  PAST_VISIT_VITALS,
  VITAL_UNITS,
} from '@/lib/vitals'

interface VitalsSectionProps {
  readOnly?: boolean
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

export function VitalsSection({ readOnly = false }: VitalsSectionProps) {
  const { state, dispatch } = useAppState()

  const editable =
    !readOnly &&
    state.role === 'assistant' &&
    state.visitStarted &&
    !state.vitalsSubmitted

  const displayVitals = readOnly ? PAST_VISIT_VITALS : state.vitals

  const updateField = (key: VitalFieldKey, value: string) => {
    dispatch({ type: 'UPDATE_VITALS', vitals: { [key]: value } })
  }

  const handleSubmit = () => {
    if (!areVitalsComplete(state.vitals)) {
      dispatch({ type: 'SHOW_VITALS_ERRORS' })
      toast.error('Complete all vitals before submitting')
      return
    }

    dispatch({ type: 'SUBMIT_VITALS' })
    toast.success('Vitals submitted')
  }

  const renderEditableField = (field: (typeof VITAL_FIELDS)[number]) => {
    const unit = VITAL_UNITS[field.key]
    const hasError = state.vitalsShowErrors && !state.vitals[field.key].trim()

    return (
      <>
        <p className="text-sm text-muted-foreground">{field.label}</p>
        <InputGroup>
          <InputGroupInput
            value={state.vitals[field.key]}
            placeholder={field.placeholder}
            inputMode={field.inputMode}
            aria-invalid={hasError || undefined}
            onChange={(event) => updateField(field.key, event.target.value)}
          />
          {unit && <VitalUnitAddon unit={unit} />}
        </InputGroup>
      </>
    )
  }

  const renderReadOnlyField = (field: (typeof VITAL_FIELDS)[number]) => {
    const unit = VITAL_UNITS[field.key]
    const value = formatVitalValue(field.key, displayVitals[field.key])

    return (
      <>
        <p className="text-sm text-muted-foreground">{field.label}</p>
        <InputGroup>
          <InputGroupInput readOnly value={value} />
          {unit && <VitalUnitAddon unit={unit} />}
        </InputGroup>
      </>
    )
  }

  return (
    <section data-slot="vitals-section">
      <h5 className="mb-2">Vitals</h5>
      <div className="space-y-2">
        <div className="grid grid-cols-2 gap-x-2 gap-y-3">
          {VITAL_FIELDS.map((field) => (
            <div key={field.key} className="flex flex-col gap-1">
              {editable ? renderEditableField(field) : renderReadOnlyField(field)}
            </div>
          ))}
        </div>
        {editable && (
          <Button onClick={handleSubmit}>
            Submit
          </Button>
        )}
      </div>
    </section>
  )
}
