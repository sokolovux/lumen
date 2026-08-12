import { Fragment, useState, type ReactNode } from 'react'
import { PencilLineIcon } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import {
  Card,
  CardAction,
  CardContent,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import {
  JORDAN_REYES_DEMOGRAPHICS,
  type DemographicsInsurance,
  type DemographicsPhone,
} from '@/lib/jordanReyesDemographics'
import { JORDAN_REYES_IMMUNIZATIONS } from '@/lib/jordanReyesChartData'

function handleEdit(section: string) {
  console.log(`Edit demographics: ${section}`)
}

function DemographicsField({
  label,
  children,
}: {
  label: string
  children: ReactNode
}) {
  return (
    <div data-slot="demographics-field">
      <p>{label}</p>
      <div data-slot="demographics-field-value">{children}</div>
    </div>
  )
}

function DemographicsValue({ children }: { children: ReactNode }) {
  return <p className="text-sm text-foreground">{children}</p>
}

function MultilineValue({ value }: { value: string }) {
  return (
    <p className="text-sm text-foreground whitespace-pre-line">{value}</p>
  )
}

function DemographicsPhoto({
  src,
  alt,
  initials,
}: {
  src: string
  alt: string
  initials: string
}) {
  const [imageFailed, setImageFailed] = useState(false)

  return (
    <div data-slot="demographics-photo">
      {imageFailed ? (
        <div data-slot="demographics-photo-fallback">{initials}</div>
      ) : (
        <img
          src={src}
          alt={alt}
          onError={() => setImageFailed(true)}
        />
      )}
    </div>
  )
}

function DemographicsEditCard({
  title,
  section,
  children,
}: {
  title: string
  section: string
  children: ReactNode
}) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>{title}</CardTitle>
        <CardAction>
          <Button
            size="sm"
            variant="outline"
            onClick={() => handleEdit(section)}
          >
            <PencilLineIcon />
            Edit
          </Button>
        </CardAction>
      </CardHeader>
      <CardContent>
        <div data-slot="demographics-card-content">
          <div data-slot="demographics-fields">{children}</div>
        </div>
      </CardContent>
    </Card>
  )
}

function PhoneField({ label, phone }: { label: string; phone: DemographicsPhone }) {
  return (
    <DemographicsField label={label}>
      <div className="flex flex-wrap items-center gap-2">
        <DemographicsValue>{phone.number}</DemographicsValue>
        <Badge variant="outline">{phone.type}</Badge>
        {phone.okToLeaveVoicemail && (
          <Badge variant="outline">OK to leave voicemail</Badge>
        )}
      </div>
    </DemographicsField>
  )
}

function InsuranceFields({
  prefix,
  insurance,
}: {
  prefix: string
  insurance: DemographicsInsurance
}) {
  return (
    <>
      <DemographicsField label={`${prefix} payer name`}>
        <DemographicsValue>{insurance.payerName}</DemographicsValue>
      </DemographicsField>
      <DemographicsField label={`${prefix} member ID`}>
        <DemographicsValue>{insurance.memberId}</DemographicsValue>
      </DemographicsField>
      <DemographicsField label={`${prefix} group number`}>
        <DemographicsValue>{insurance.groupNumber}</DemographicsValue>
      </DemographicsField>
      <DemographicsField label={`${prefix} subscriber name`}>
        <DemographicsValue>{insurance.subscriberName}</DemographicsValue>
      </DemographicsField>
      <DemographicsField label={`${prefix} relationship to patient`}>
        <DemographicsValue>{insurance.relationshipToPatient}</DemographicsValue>
      </DemographicsField>
      <DemographicsField label={`${prefix} effective date`}>
        <DemographicsValue>{insurance.effectiveDate}</DemographicsValue>
      </DemographicsField>
    </>
  )
}

export function DemographicsTab() {
  const data = JORDAN_REYES_DEMOGRAPHICS
  const { identity, contact, raceEthnicity, insurance, careTeamPharmacy, legalAdvanceDirectives, consentCommunication, recordMetadata } = data

  const legalName = [
    identity.legalFirstName,
    identity.legalMiddleName,
    identity.legalLastName,
    identity.legalSuffix,
  ]
    .filter(Boolean)
    .join(' ')

  return (
    <div data-slot="demographics-tab">
      <div data-slot="demographics-grid">
        <DemographicsEditCard title="Identity" section="identity">
          <DemographicsField label="Photo">
            <DemographicsPhoto
              src={identity.avatarImageUrl}
              alt={legalName}
              initials={identity.avatarInitials}
            />
          </DemographicsField>
          <DemographicsField label="Legal name">
            <DemographicsValue>{legalName}</DemographicsValue>
          </DemographicsField>
          <DemographicsField label="Preferred name">
            <DemographicsValue>{identity.preferredName}</DemographicsValue>
          </DemographicsField>
          {identity.previousName && (
            <DemographicsField label="Previous / maiden name">
              <DemographicsValue>{identity.previousName}</DemographicsValue>
            </DemographicsField>
          )}
          <DemographicsField label="Date of birth">
            <DemographicsValue>{identity.dateOfBirthDisplay}</DemographicsValue>
          </DemographicsField>
          <DemographicsField label="Sex assigned at birth">
            <DemographicsValue>{identity.sexAssignedAtBirth}</DemographicsValue>
          </DemographicsField>
          <DemographicsField label="Gender identity">
            <DemographicsValue>{identity.genderIdentity}</DemographicsValue>
          </DemographicsField>
          <DemographicsField label="Pronouns">
            <DemographicsValue>{identity.pronouns}</DemographicsValue>
          </DemographicsField>
          <DemographicsField label="Race">
            <div className="flex flex-wrap gap-2">
              {raceEthnicity.race.map((value) => (
                <Badge key={value} variant="outline">
                  {value}
                </Badge>
              ))}
            </div>
          </DemographicsField>
          <DemographicsField label="Ethnicity">
            <DemographicsValue>{raceEthnicity.ethnicity}</DemographicsValue>
          </DemographicsField>
          <DemographicsField label="Marital status">
            <DemographicsValue>{identity.maritalStatus}</DemographicsValue>
          </DemographicsField>
          <DemographicsField label="Preferred language">
            <DemographicsValue>{identity.preferredLanguage}</DemographicsValue>
          </DemographicsField>
          <DemographicsField label="Interpreter needed">
            <DemographicsValue>{identity.interpreterNeeded ? 'Yes' : 'No'}</DemographicsValue>
          </DemographicsField>
          <DemographicsField label="SSN">
            <DemographicsValue>{identity.ssnMasked}</DemographicsValue>
          </DemographicsField>
        </DemographicsEditCard>

        <DemographicsEditCard title="Contact information" section="contact">
          <DemographicsField label="Home address">
            <MultilineValue value={contact.homeAddress} />
          </DemographicsField>
          {contact.mailingAddress && (
            <DemographicsField label="Mailing address">
              <MultilineValue value={contact.mailingAddress} />
            </DemographicsField>
          )}
          <PhoneField label="Primary phone" phone={contact.primaryPhone} />
          {contact.secondaryPhone && (
            <PhoneField label="Secondary phone" phone={contact.secondaryPhone} />
          )}
          <DemographicsField label="Email">
            <DemographicsValue>{contact.email}</DemographicsValue>
          </DemographicsField>
          <DemographicsField label="Preferred contact method">
            <DemographicsValue>{contact.preferredContactMethod}</DemographicsValue>
          </DemographicsField>
        </DemographicsEditCard>

        <DemographicsEditCard title="Emergency contact" section="emergency-contact">
          {data.emergencyContacts.map((contactEntry, index) => {
            const prefix = index === 0 ? 'Emergency contact' : 'Secondary emergency contact'
            return (
              <Fragment key={contactEntry.name}>
                <DemographicsField label={`${prefix} name`}>
                  <DemographicsValue>{contactEntry.name}</DemographicsValue>
                </DemographicsField>
                <DemographicsField label={`${prefix} relationship`}>
                  <DemographicsValue>{contactEntry.relationship}</DemographicsValue>
                </DemographicsField>
                <DemographicsField label={`${prefix} phone`}>
                  <DemographicsValue>{contactEntry.phone}</DemographicsValue>
                </DemographicsField>
              </Fragment>
            )
          })}
        </DemographicsEditCard>

        <DemographicsEditCard title="Employment" section="employment">
          <DemographicsField label="Employment status">
            <DemographicsValue>{data.employment.status}</DemographicsValue>
          </DemographicsField>
          <DemographicsField label="Employer name">
            <DemographicsValue>{data.employment.employerName}</DemographicsValue>
          </DemographicsField>
          <DemographicsField label="Occupation">
            <DemographicsValue>{data.employment.occupation}</DemographicsValue>
          </DemographicsField>
        </DemographicsEditCard>

        <DemographicsEditCard title="Insurance" section="insurance">
          <InsuranceFields prefix="Primary" insurance={insurance.primary} />
          {insurance.secondary && (
            <InsuranceFields prefix="Secondary" insurance={insurance.secondary} />
          )}
          {insurance.guarantor && (
            <>
              <DemographicsField label="Guarantor name">
                <DemographicsValue>{insurance.guarantor.name}</DemographicsValue>
              </DemographicsField>
              <DemographicsField label="Guarantor relationship">
                <DemographicsValue>{insurance.guarantor.relationship}</DemographicsValue>
              </DemographicsField>
            </>
          )}
        </DemographicsEditCard>

        <DemographicsEditCard title="Care team & pharmacy" section="care-team-pharmacy">
          {careTeamPharmacy.primaryCareProvider && (
            <DemographicsField label="Primary care provider">
              <DemographicsValue>{careTeamPharmacy.primaryCareProvider}</DemographicsValue>
            </DemographicsField>
          )}
          {careTeamPharmacy.referringProvider && (
            <DemographicsField label="Referring provider">
              <DemographicsValue>{careTeamPharmacy.referringProvider}</DemographicsValue>
            </DemographicsField>
          )}
          <DemographicsField label="Pharmacy name">
            <DemographicsValue>{careTeamPharmacy.pharmacy.name}</DemographicsValue>
          </DemographicsField>
          <DemographicsField label="Pharmacy address">
            <MultilineValue value={careTeamPharmacy.pharmacy.address} />
          </DemographicsField>
          <DemographicsField label="Pharmacy phone">
            <DemographicsValue>{careTeamPharmacy.pharmacy.phone}</DemographicsValue>
          </DemographicsField>
        </DemographicsEditCard>

        <DemographicsEditCard title="Legal & advance directives" section="legal-advance-directives">
          <DemographicsField label="Advance directive on file">
            <DemographicsValue>
              {legalAdvanceDirectives.advanceDirectiveOnFile ? 'Yes' : 'Not on file'}
            </DemographicsValue>
          </DemographicsField>
          {legalAdvanceDirectives.documentReference && (
            <DemographicsField label="Document">
              <Button
                variant="link"
                onClick={() => console.log('View advance directive document')}
              >
                {legalAdvanceDirectives.documentReference}
              </Button>
            </DemographicsField>
          )}
          {legalAdvanceDirectives.healthcareProxyName && (
            <DemographicsField label="Healthcare proxy / power of attorney">
              <DemographicsValue>{legalAdvanceDirectives.healthcareProxyName}</DemographicsValue>
            </DemographicsField>
          )}
        </DemographicsEditCard>

        <DemographicsEditCard title="Consent & communication" section="consent-communication">
          <DemographicsField label="Consent to treat on file">
            <DemographicsValue>
              {consentCommunication.consentToTreat.onFile
                ? `Yes · ${consentCommunication.consentToTreat.date}`
                : 'No'}
            </DemographicsValue>
          </DemographicsField>
          <DemographicsField label="HIPAA privacy notice acknowledged">
            <DemographicsValue>
              {consentCommunication.hipaaAcknowledged.onFile
                ? `Yes · ${consentCommunication.hipaaAcknowledged.date}`
                : 'No'}
            </DemographicsValue>
          </DemographicsField>
          <DemographicsField label="Consent to text/email communication">
            <DemographicsValue>
              {consentCommunication.consentToTextEmail ? 'Yes' : 'No'}
            </DemographicsValue>
          </DemographicsField>
          {consentCommunication.releaseOfInformation && (
            <DemographicsField label="Release of information authorized to">
              <DemographicsValue>{consentCommunication.releaseOfInformation}</DemographicsValue>
            </DemographicsField>
          )}
        </DemographicsEditCard>

        <DemographicsEditCard title="Immunizations" section="immunizations">
          <div className="space-y-3">
            {JORDAN_REYES_IMMUNIZATIONS.map((immunization) => (
              <div
                key={immunization.id}
                className="flex items-start justify-between gap-3 border-b pb-3 last:border-b-0 last:pb-0"
              >
                <div>
                  <DemographicsValue>{immunization.name}</DemographicsValue>
                  <p className="text-sm text-muted-foreground">{immunization.date}</p>
                </div>
                <Badge variant="outline" className="border-green-200 bg-green-50 text-green-600">
                  Up to date
                </Badge>
              </div>
            ))}
          </div>
        </DemographicsEditCard>

        <DemographicsEditCard title="Record metadata" section="record-metadata">
          <DemographicsField label="MRN">
            <DemographicsValue>{recordMetadata.mrn}</DemographicsValue>
          </DemographicsField>
          <DemographicsField label="Registration date / patient since">
            <DemographicsValue>{recordMetadata.registrationDate}</DemographicsValue>
          </DemographicsField>
          <DemographicsField label="Last updated">
            <DemographicsValue>
              {recordMetadata.lastUpdatedDate} · {recordMetadata.lastUpdatedBy}
            </DemographicsValue>
          </DemographicsField>
        </DemographicsEditCard>
      </div>
    </div>
  )
}
