export enum HelpCategory {
  DOCUMENTS = 'Documentos',
  PATIENTS = 'Pacientes',
  USERS = 'Usuarios y Roles',
  DICOM = 'Imágenes DICOM',
  REPORTS = 'Reportes y Auditoría',
  BACKUPS = 'Copias de Seguridad',
  GENERAL = 'Uso General'
}

export interface HelpStep {
  title: string;
  description: string;
  iconName: string;
}

export interface HelpTopic {
  id: string;
  title: string;
  description: string;
  category: HelpCategory;
  tags: string[];
  roles: string[]; // vacío significa disponible para todos
  steps: HelpStep[];
}
