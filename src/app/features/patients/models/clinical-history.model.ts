export interface Allergy {
  allergen: string;
  severity: string;
  reaction: string;
}

export interface Medication {
  medication: string;
  dose: string;
  frequency: string;
}

export interface ClinicalHistory {
  id?: string;
  patientId: string;
  code: string;
  bloodType?: string;
  pathologicalAntecedents?: string;
  nonPathologicalAntecedents?: string;
  familyAntecedents?: string;
  allergies?: Allergy[];
  chronicConditions?: string;
  currentMedications?: Medication[];
  observations?: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface ClinicalHistoryUpdateDto {
  bloodType?: string;
  pathologicalAntecedents?: string;
  nonPathologicalAntecedents?: string;
  familyAntecedents?: string;
  allergies?: Allergy[];
  chronicConditions?: string;
  currentMedications?: Medication[];
  observations?: string;
}
