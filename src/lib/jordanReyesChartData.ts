import type { VisitVitals } from '@/state/types'

export type ChartProblem = {
  id: string
  name: string
  status: 'active' | 'resolved'
  onset?: string
}

export type ChartAllergy = {
  id: string
  substance: string
  reaction: string
  severity: 'severe' | 'moderate' | 'mild'
}

export type ChartReferral = {
  id: string
  specialty: string
  provider: string
  status: string
  statusTone: 'amber' | 'green' | 'destructive' | 'blue'
  orderedDate: string
  appointmentDate: string | null
}

export type ChartPastVisit = {
  id: string
  label: string
  summary: string
}

export type ChartImmunization = {
  id: string
  name: string
  date: string
  status: 'current'
}

export type LabTrendRow = {
  date: string
  value: string
  flag?: 'high' | 'low' | 'normal'
}

export type LabDocumentData = {
  summary?: string
  trendLabel?: string
  unit?: string
  rows?: LabTrendRow[]
  narrative?: string[]
}

export type VitalsHistoryEntry = {
  date: string
  bloodPressure: string
  heartRate: string
  weight: string
  bmi: string
}

export const JORDAN_REYES_PROBLEMS: ChartProblem[] = [
  { id: 'prob-1', name: 'Type 2 diabetes', status: 'active', onset: '2019' },
  { id: 'prob-2', name: 'Essential hypertension', status: 'active', onset: '2017' },
  { id: 'prob-3', name: 'Hyperlipidemia', status: 'active', onset: '2020' },
  { id: 'prob-4', name: 'Hypothyroidism', status: 'active', onset: '2021' },
  { id: 'prob-5', name: 'GERD', status: 'active', onset: '2022' },
  { id: 'prob-6', name: 'Generalized anxiety disorder', status: 'active', onset: '2023' },
  { id: 'prob-7', name: 'Obesity', status: 'active', onset: '2018' },
  { id: 'prob-8', name: 'Vitamin D deficiency', status: 'active', onset: '2024' },
]

export const JORDAN_REYES_ALLERGIES: ChartAllergy[] = [
  {
    id: 'allergy-1',
    substance: 'Penicillin',
    reaction: 'Anaphylaxis',
    severity: 'severe',
  },
  {
    id: 'allergy-2',
    substance: 'Sulfa',
    reaction: 'Rash',
    severity: 'moderate',
  },
]

export const JORDAN_REYES_REFERRALS: ChartReferral[] = [
  {
    id: 'referral-1',
    specialty: 'Endocrinology',
    provider: 'Dr. Marcus Chen',
    status: 'Pending',
    statusTone: 'amber',
    orderedDate: 'Jul 18, 2026',
    appointmentDate: null,
  },
  {
    id: 'referral-2',
    specialty: 'Ophthalmology',
    provider: 'Dr. Lisa Nguyen',
    status: 'Completed',
    statusTone: 'green',
    orderedDate: 'Mar 4, 2026',
    appointmentDate: 'Apr 22, 2026',
  },
  {
    id: 'referral-3',
    specialty: 'Nutrition',
    provider: 'Rachel Kim, RD',
    status: 'No-show',
    statusTone: 'destructive',
    orderedDate: 'May 2, 2026',
    appointmentDate: 'Jun 10, 2026',
  },
  {
    id: 'referral-4',
    specialty: 'Cardiology',
    provider: 'Dr. Anita Patel',
    status: 'Requested',
    statusTone: 'blue',
    orderedDate: 'Aug 1, 2026',
    appointmentDate: null,
  },
]

/** Seven prior visits; today's encounter is modeled live in VisitPanel. */
export const JORDAN_REYES_PAST_VISITS: ChartPastVisit[] = [
  {
    id: 'visit-2026-08-03',
    label: 'Aug 3, 2026 · Follow-up',
    summary: 'Diabetes follow-up; A1c 7.4%, metformin increased to 1000 mg BID.',
  },
  {
    id: 'visit-2026-05-15',
    label: 'May 15, 2026 · Hypertension check',
    summary: 'BP elevated at 142/90; amlodipine 5 mg daily added to lisinopril.',
  },
  {
    id: 'visit-2026-02-02',
    label: 'Feb 2, 2026 · Medication adjustment',
    summary: 'Semaglutide initiated for weight management and glycemic control.',
  },
  {
    id: 'visit-2025-11-08',
    label: 'Nov 8, 2025 · Annual physical',
    summary: 'Routine health maintenance; labs ordered, immunizations reviewed.',
  },
  {
    id: 'visit-2025-08-20',
    label: 'Aug 20, 2025 · GERD follow-up',
    summary: 'Heartburn improved on omeprazole; dietary counseling reinforced.',
  },
  {
    id: 'visit-2025-03-12',
    label: 'Mar 12, 2025 · Anxiety check-in',
    summary: 'Sertraline 50 mg daily continued; GAD symptoms stable.',
  },
  {
    id: 'visit-2024-09-05',
    label: 'Sep 5, 2024 · Diabetes & lipids review',
    summary: 'A1c 6.9%; atorvastatin 40 mg started for hyperlipidemia.',
  },
]

export const JORDAN_REYES_IMMUNIZATIONS: ChartImmunization[] = [
  { id: 'imm-1', name: 'Tdap (Tetanus, diphtheria, pertussis)', date: 'Oct 2023', status: 'current' },
  { id: 'imm-2', name: 'Influenza (seasonal)', date: 'Oct 2025', status: 'current' },
  { id: 'imm-3', name: 'COVID-19 (updated booster)', date: 'Sep 2025', status: 'current' },
  { id: 'imm-4', name: 'Pneumococcal (PPSV23)', date: 'Nov 2024', status: 'current' },
  { id: 'imm-5', name: 'Shingles (Shingrix series)', date: 'Completed Jun 2025', status: 'current' },
]

export const JORDAN_REYES_VITALS_HISTORY: VitalsHistoryEntry[] = [
  {
    date: 'Sep 5, 2024',
    bloodPressure: '128/82',
    heartRate: '72',
    weight: '178',
    bmi: '28.4',
  },
  {
    date: 'Nov 8, 2025',
    bloodPressure: '138/88',
    heartRate: '74',
    weight: '184',
    bmi: '29.3',
  },
  {
    date: 'May 15, 2026',
    bloodPressure: '142/90',
    heartRate: '73',
    weight: '188',
    bmi: '30.0',
  },
  {
    date: 'Aug 3, 2026',
    bloodPressure: '146/92',
    heartRate: '74',
    weight: '192',
    bmi: '30.6',
  },
]

export const JORDAN_REYES_PAST_VISIT_VITALS: Record<string, VisitVitals> = {
  'visit-2026-08-03': {
    bloodPressure: '146/92',
    heartRate: '74',
    respiratoryRate: '16',
    temperature: '98.4',
    spO2: '98',
    weight: '192',
    painScale: '0',
    fingerstickGlucose: '168',
  },
  'visit-2026-05-15': {
    bloodPressure: '142/90',
    heartRate: '73',
    respiratoryRate: '16',
    temperature: '98.2',
    spO2: '98',
    weight: '188',
    painScale: '0',
    fingerstickGlucose: '154',
  },
  'visit-2026-02-02': {
    bloodPressure: '136/86',
    heartRate: '74',
    respiratoryRate: '16',
    temperature: '98.3',
    spO2: '99',
    weight: '186',
    painScale: '0',
    fingerstickGlucose: '142',
  },
  'visit-2025-11-08': {
    bloodPressure: '138/88',
    heartRate: '74',
    respiratoryRate: '15',
    temperature: '98.1',
    spO2: '99',
    weight: '184',
    painScale: '0',
    fingerstickGlucose: '128',
  },
  'visit-2025-08-20': {
    bloodPressure: '134/84',
    heartRate: '72',
    respiratoryRate: '16',
    temperature: '98.2',
    spO2: '99',
    weight: '182',
    painScale: '0',
    fingerstickGlucose: '118',
  },
  'visit-2025-03-12': {
    bloodPressure: '132/82',
    heartRate: '72',
    respiratoryRate: '16',
    temperature: '98.0',
    spO2: '99',
    weight: '180',
    painScale: '0',
    fingerstickGlucose: '112',
  },
  'visit-2024-09-05': {
    bloodPressure: '128/82',
    heartRate: '72',
    respiratoryRate: '15',
    temperature: '98.2',
    spO2: '99',
    weight: '178',
    painScale: '0',
    fingerstickGlucose: '104',
  },
}

export const JORDAN_REYES_CONFIDENTIAL_NOTE = `Reactive HCV Ab (8/5/26); holding on HCV RNA until confirmatory result. Not discussing w/ pt or chart team until confirmed; pt very anxious re: stigma given school employment. Will counsel re: transmission if positive.

Also: disclosed marital stress / mood worsening during intake; partner recently laid off. Not ready for partner to know extent of sx. Monitor but do not document in shared note.`

export const JORDAN_REYES_LAB_DOCUMENTS: Record<string, LabDocumentData> = {
  'lab-a1c': {
    summary: 'Hemoglobin A1c: rising trend',
    trendLabel: 'A1c',
    unit: '%',
    rows: [
      { date: 'Sep 5, 2024', value: '6.9', flag: 'high' },
      { date: 'Nov 8, 2025', value: '7.4', flag: 'high' },
      { date: 'Aug 3, 2026', value: '8.1', flag: 'high' },
    ],
    narrative: [
      'Trend consistent with progressive hyperglycemia despite medication escalation.',
      'Semaglutide added Feb 2026; metformin dose increased Aug 2026.',
    ],
  },
  'lab-glucose': {
    summary: 'Fasting glucose: climbing trend',
    trendLabel: 'Fasting glucose',
    unit: 'mg/dL',
    rows: [
      { date: 'Sep 5, 2024', value: '118', flag: 'high' },
      { date: 'Nov 8, 2025', value: '132', flag: 'high' },
      { date: 'May 15, 2026', value: '148', flag: 'high' },
      { date: 'Aug 3, 2026', value: '162', flag: 'high' },
    ],
  },
  'lab-ldl': {
    summary: 'LDL cholesterol: improving on statin',
    trendLabel: 'LDL',
    unit: 'mg/dL',
    rows: [
      { date: 'Sep 5, 2024', value: '142', flag: 'high' },
      { date: 'Nov 8, 2025', value: '118', flag: 'high' },
      { date: 'May 15, 2026', value: '98', flag: 'normal' },
      { date: 'Aug 3, 2026', value: '92', flag: 'normal' },
    ],
    narrative: ['Atorvastatin 40 mg daily started Sep 2024.'],
  },
  'lab-creatinine': {
    summary: 'Serum creatinine: creeping upward',
    trendLabel: 'Creatinine',
    unit: 'mg/dL',
    rows: [
      { date: 'Sep 5, 2024', value: '0.9', flag: 'normal' },
      { date: 'Nov 8, 2025', value: '1.0', flag: 'normal' },
      { date: 'May 15, 2026', value: '1.1', flag: 'normal' },
      { date: 'Aug 3, 2026', value: '1.2', flag: 'high' },
    ],
  },
  'lab-egfr': {
    summary: 'eGFR: slightly declining',
    trendLabel: 'eGFR',
    unit: 'mL/min/1.73m²',
    rows: [
      { date: 'Sep 5, 2024', value: '92', flag: 'normal' },
      { date: 'Nov 8, 2025', value: '88', flag: 'normal' },
      { date: 'May 15, 2026', value: '82', flag: 'normal' },
      { date: 'Aug 3, 2026', value: '78', flag: 'normal' },
    ],
    narrative: ['Monitor renal function with SGLT2 inhibitor and ACE inhibitor use.'],
  },
  'lab-tsh': {
    summary: 'TSH: within normal range',
    trendLabel: 'TSH',
    unit: 'mIU/L',
    rows: [
      { date: 'Sep 5, 2024', value: '2.1', flag: 'normal' },
      { date: 'Nov 8, 2025', value: '1.8', flag: 'normal' },
      { date: 'May 15, 2026', value: '2.0', flag: 'normal' },
      { date: 'Aug 3, 2026', value: '1.9', flag: 'normal' },
    ],
  },
  'lab-cbc': {
    summary: 'CBC with differential: within normal range',
    trendLabel: 'WBC / Hgb / Plt',
    unit: '',
    rows: [
      { date: 'Sep 5, 2024', value: '6.2 / 13.8 / 245', flag: 'normal' },
      { date: 'Nov 8, 2025', value: '6.0 / 13.6 / 238', flag: 'normal' },
      { date: 'May 15, 2026', value: '5.9 / 13.5 / 232', flag: 'normal' },
      { date: 'Aug 3, 2026', value: '6.1 / 13.4 / 228', flag: 'normal' },
    ],
  },
  'lab-hepc': {
    summary: 'Hepatitis C antibody: reactive, pending confirmation',
    narrative: [
      'Hepatitis C antibody: REACTIVE',
      'Interpretation: Awaiting HCV RNA confirmatory testing.',
      'Result pending release. Physician review only.',
      'Do not disclose to patient until confirmatory workup complete.',
    ],
  },
  'img-retinal': {
    summary: 'Diabetic retinal screening: no referable retinopathy',
    narrative: [
      'Both eyes: mild non-proliferative diabetic retinopathy, no macular edema.',
      'Recommendation: repeat screening in 12 months.',
    ],
  },
  'img-cxr': {
    summary: 'Chest X-ray: normal',
    narrative: [
      'Lungs clear bilaterally. No focal consolidation or effusion.',
      'Cardiomediastinal silhouette within normal limits.',
    ],
  },
  'img-abd-us': {
    summary: 'Abdominal ultrasound: unremarkable',
    narrative: [
      'Liver homogeneous in echotexture. No biliary dilation.',
      'Kidneys normal in size and echogenicity. No hydronephrosis.',
    ],
  },
}

export function getJordanReyesPastVisitVitals(visitId: string): VisitVitals {
  return (
    JORDAN_REYES_PAST_VISIT_VITALS[visitId] ?? {
      bloodPressure: '-',
      heartRate: '-',
      respiratoryRate: '-',
      temperature: '-',
      spO2: '-',
      weight: '-',
      painScale: '-',
      fingerstickGlucose: '-',
    }
  )
}
