export type DemographicsPhone = {
  number: string
  type: 'Mobile' | 'Home' | 'Work'
  okToLeaveVoicemail?: boolean
}

export type DemographicsInsurance = {
  payerName: string
  memberId: string
  groupNumber: string
  subscriberName: string
  relationshipToPatient: string
  effectiveDate: string
}

export type DemographicsEmergencyContact = {
  name: string
  relationship: string
  phone: string
}

export type JordanReyesDemographics = {
  identity: {
    legalFirstName: string
    legalMiddleName: string
    legalLastName: string
    legalSuffix: string | null
    preferredName: string
    previousName: string | null
    dateOfBirth: string
    dateOfBirthDisplay: string
    sexAssignedAtBirth: string
    genderIdentity: string
    pronouns: string
    maritalStatus: string
    preferredLanguage: string
    interpreterNeeded: boolean
    ssnMasked: string
    avatarImageUrl: string
    avatarInitials: string
  }
  contact: {
    homeAddress: string
    mailingAddress: string | null
    primaryPhone: DemographicsPhone
    secondaryPhone: DemographicsPhone | null
    email: string
    preferredContactMethod: string
  }
  raceEthnicity: {
    race: string[]
    ethnicity: string
  }
  emergencyContacts: DemographicsEmergencyContact[]
  employment: {
    status: string
    employerName: string
    occupation: string
  }
  insurance: {
    primary: DemographicsInsurance
    secondary: DemographicsInsurance | null
    guarantor: { name: string; relationship: string } | null
  }
  careTeamPharmacy: {
    primaryCareProvider: string | null
    referringProvider: string | null
    pharmacy: {
      name: string
      address: string
      phone: string
    }
  }
  legalAdvanceDirectives: {
    advanceDirectiveOnFile: boolean
    documentReference: string | null
    healthcareProxyName: string | null
  }
  consentCommunication: {
    consentToTreat: { onFile: boolean; date: string | null }
    hipaaAcknowledged: { onFile: boolean; date: string | null }
    consentToTextEmail: boolean
    releaseOfInformation: string | null
  }
  recordMetadata: {
    mrn: string
    registrationDate: string
    lastUpdatedDate: string
    lastUpdatedBy: string
  }
}

export const JORDAN_REYES_DEMOGRAPHICS: JordanReyesDemographics = {
  identity: {
    legalFirstName: 'Jordan',
    legalMiddleName: 'Marie',
    legalLastName: 'Reyes',
    legalSuffix: null,
    preferredName: 'Jordan',
    previousName: null,
    dateOfBirth: '03/14/1988',
    dateOfBirthDisplay: 'March 14, 1988 (38)',
    sexAssignedAtBirth: 'Female',
    genderIdentity: 'Woman',
    pronouns: 'she/her',
    maritalStatus: 'Married',
    preferredLanguage: 'English',
    interpreterNeeded: false,
    ssnMasked: '•••-••-4829',
    avatarImageUrl:
      'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=256&h=256&fit=crop&crop=faces',
    avatarInitials: 'JR',
  },
  contact: {
    homeAddress: '842 Vanderbilt Avenue, Apt 4B\nBrooklyn, NY 11238',
    mailingAddress: null,
    primaryPhone: {
      number: '(718) 555-0142',
      type: 'Mobile',
      okToLeaveVoicemail: true,
    },
    secondaryPhone: {
      number: '(718) 555-0198',
      type: 'Home',
    },
    email: 'jordan.reyes@gmail.com',
    preferredContactMethod: 'Text message',
  },
  raceEthnicity: {
    race: ['Black or African American'],
    ethnicity: 'Hispanic or Latino',
  },
  emergencyContacts: [
    {
      name: 'Miguel Reyes',
      relationship: 'Spouse',
      phone: '(718) 555-0142',
    },
    {
      name: 'Carmen Ortiz',
      relationship: 'Mother',
      phone: '(347) 555-0281',
    },
  ],
  employment: {
    status: 'Employed full-time',
    employerName: 'NYC Department of Education',
    occupation: 'School counselor',
  },
  insurance: {
    primary: {
      payerName: 'Aetna Choice POS II',
      memberId: 'W482910003',
      groupNumber: '084291',
      subscriberName: 'Jordan Reyes',
      relationshipToPatient: 'Self',
      effectiveDate: 'Jan 1, 2025',
    },
    secondary: null,
    guarantor: null,
  },
  careTeamPharmacy: {
    primaryCareProvider: 'Dr. Elena Vasquez · Park Slope Family Medicine',
    referringProvider: null,
    pharmacy: {
      name: 'CVS Pharmacy #5821',
      address: '341 Flatbush Avenue\nBrooklyn, NY 11238',
      phone: '(718) 555-8834',
    },
  },
  legalAdvanceDirectives: {
    advanceDirectiveOnFile: false,
    documentReference: null,
    healthcareProxyName: 'Miguel Reyes',
  },
  consentCommunication: {
    consentToTreat: { onFile: true, date: 'Jul 12, 2019' },
    hipaaAcknowledged: { onFile: true, date: 'Jul 12, 2019' },
    consentToTextEmail: true,
    releaseOfInformation: 'Miguel Reyes (spouse)',
  },
  recordMetadata: {
    mrn: 'MRN-48291',
    registrationDate: 'Jul 12, 2019',
    lastUpdatedDate: 'Aug 2, 2026',
    lastUpdatedBy: 'Sam Whitfield',
  },
}
