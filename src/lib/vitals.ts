import type { VisitVitals } from '@/state/types'

export function createEmptyVitals(): VisitVitals {
  return {
    bloodPressure: '',
    heartRate: '',
    respiratoryRate: '',
    temperature: '',
    spO2: '',
    weight: '',
    painScale: '',
    fingerstickGlucose: '',
  }
}

export const VITAL_UNITS: Record<keyof VisitVitals, string | null> = {
  bloodPressure: 'mmHg',
  heartRate: 'bpm',
  respiratoryRate: 'breaths/min',
  temperature: '°F',
  spO2: '%',
  weight: 'lbs',
  painScale: null,
  fingerstickGlucose: 'mg/dL',
}

export function formatVitalValue(key: keyof VisitVitals, value: string): string {
  if (!value.trim()) {
    return '—'
  }

  return value
}

export function areVitalsComplete(vitals: VisitVitals): boolean {
  return getMissingVitalFields(vitals).length === 0
}

export function getMissingVitalFields(vitals: VisitVitals): (keyof VisitVitals)[] {
  return (Object.keys(vitals) as (keyof VisitVitals)[]).filter((key) => !vitals[key].trim())
}

export const VITAL_FIELD_LABELS: Record<keyof VisitVitals, string> = {
  bloodPressure: 'Blood Pressure',
  heartRate: 'Heart Rate',
  respiratoryRate: 'Respiratory Rate',
  temperature: 'Temperature',
  spO2: 'SpO2',
  weight: 'Weight',
  painScale: 'Pain Scale',
  fingerstickGlucose: 'Fingerstick Glucose',
}

export function formatMissingVitalsMessage(vitals: VisitVitals): string {
  const labels = getMissingVitalFields(vitals).map((key) => VITAL_FIELD_LABELS[key])
  return `Please fill out: ${labels.join(', ')}.`
}

export function formatSubmitHandoffErrors(vitals: VisitVitals, noteDraft: string): string | null {
  const missing: string[] = getMissingVitalFields(vitals).map((key) => VITAL_FIELD_LABELS[key])
  if (!noteDraft.trim()) {
    missing.push('Clinical note')
  }
  if (missing.length === 0) {
    return null
  }
  return `Please fill out: ${missing.join(', ')}.`
}

export const PAST_VISIT_VITALS: VisitVitals = {
  bloodPressure: '118/76',
  heartRate: '68',
  respiratoryRate: '14',
  temperature: '98.2',
  spO2: '99',
  weight: '162',
  painScale: '0',
  fingerstickGlucose: '92',
}

export function formatVitalDisplay(
  key: keyof VisitVitals,
  value: string,
): string {
  const formattedValue = formatVitalValue(key, value)
  if (formattedValue === '—') {
    return '—'
  }

  const unit = VITAL_UNITS[key]
  return unit ? `${formattedValue} ${unit}` : formattedValue
}
