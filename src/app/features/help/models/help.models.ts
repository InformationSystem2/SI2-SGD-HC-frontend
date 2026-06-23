export enum HelpCategory {
  DOCUMENTS = 'HELP.CATEGORIES.DOCUMENTS',
  PATIENTS = 'HELP.CATEGORIES.PATIENTS',
  CLINICAL_HISTORY = 'HELP.CATEGORIES.CLINICAL_HISTORY',
  USERS = 'HELP.CATEGORIES.USERS',
  DICOM = 'HELP.CATEGORIES.DICOM',
  REPORTS = 'HELP.CATEGORIES.REPORTS',
  AUDIT = 'HELP.CATEGORIES.AUDIT',
  BACKUPS = 'HELP.CATEGORIES.BACKUPS',
  SETTINGS = 'HELP.CATEGORIES.SETTINGS',
  GENERAL = 'HELP.CATEGORIES.GENERAL'
}

export interface HelpStep {
  title: string;       // i18n key
  description: string; // i18n key
  iconName: string;
}

export interface HelpTopic {
  id: string;
  title: string;       // i18n key
  description: string; // i18n key
  category: HelpCategory;
  tags: string;        // i18n key → space-separated search terms
  roles: string[];
  steps: HelpStep[];
}
