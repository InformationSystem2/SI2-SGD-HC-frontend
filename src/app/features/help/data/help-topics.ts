import { HelpTopic, HelpCategory } from '../models/help.models';

export const helpTopics: HelpTopic[] = [

  // ===== DOCUMENTOS =====
  {
    id: 'upload_document',
    title: 'HELP.TOPICS.UPLOAD_DOCUMENT.TITLE',
    description: 'HELP.TOPICS.UPLOAD_DOCUMENT.DESC',
    category: HelpCategory.DOCUMENTS,
    tags: 'HELP.TOPICS.UPLOAD_DOCUMENT.TAGS',
    roles: [],
    steps: [
      { title: 'HELP.TOPICS.UPLOAD_DOCUMENT.S1.TITLE', description: 'HELP.TOPICS.UPLOAD_DOCUMENT.S1.DESC', iconName: 'file' },
      { title: 'HELP.TOPICS.UPLOAD_DOCUMENT.S2.TITLE', description: 'HELP.TOPICS.UPLOAD_DOCUMENT.S2.DESC', iconName: 'upload' },
      { title: 'HELP.TOPICS.UPLOAD_DOCUMENT.S3.TITLE', description: 'HELP.TOPICS.UPLOAD_DOCUMENT.S3.DESC', iconName: 'edit' },
      { title: 'HELP.TOPICS.UPLOAD_DOCUMENT.S4.TITLE', description: 'HELP.TOPICS.UPLOAD_DOCUMENT.S4.DESC', iconName: 'save' }
    ]
  },
  {
    id: 'search_documents',
    title: 'HELP.TOPICS.SEARCH_DOCUMENTS.TITLE',
    description: 'HELP.TOPICS.SEARCH_DOCUMENTS.DESC',
    category: HelpCategory.DOCUMENTS,
    tags: 'HELP.TOPICS.SEARCH_DOCUMENTS.TAGS',
    roles: [],
    steps: [
      { title: 'HELP.TOPICS.SEARCH_DOCUMENTS.S1.TITLE', description: 'HELP.TOPICS.SEARCH_DOCUMENTS.S1.DESC', iconName: 'file' },
      { title: 'HELP.TOPICS.SEARCH_DOCUMENTS.S2.TITLE', description: 'HELP.TOPICS.SEARCH_DOCUMENTS.S2.DESC', iconName: 'search' },
      { title: 'HELP.TOPICS.SEARCH_DOCUMENTS.S3.TITLE', description: 'HELP.TOPICS.SEARCH_DOCUMENTS.S3.DESC', iconName: 'sliders' },
      { title: 'HELP.TOPICS.SEARCH_DOCUMENTS.S4.TITLE', description: 'HELP.TOPICS.SEARCH_DOCUMENTS.S4.DESC', iconName: 'eye' }
    ]
  },
  {
    id: 'manage_templates',
    title: 'HELP.TOPICS.MANAGE_TEMPLATES.TITLE',
    description: 'HELP.TOPICS.MANAGE_TEMPLATES.DESC',
    category: HelpCategory.DOCUMENTS,
    tags: 'HELP.TOPICS.MANAGE_TEMPLATES.TAGS',
    roles: ['ROLE_SUPERUSER', 'ROLE_ADMIN', 'ROLE_ARCHIVO', 'ROLE_MEDICO'],
    steps: [
      { title: 'HELP.TOPICS.MANAGE_TEMPLATES.S1.TITLE', description: 'HELP.TOPICS.MANAGE_TEMPLATES.S1.DESC', iconName: 'file' },
      { title: 'HELP.TOPICS.MANAGE_TEMPLATES.S2.TITLE', description: 'HELP.TOPICS.MANAGE_TEMPLATES.S2.DESC', iconName: 'plus' },
      { title: 'HELP.TOPICS.MANAGE_TEMPLATES.S3.TITLE', description: 'HELP.TOPICS.MANAGE_TEMPLATES.S3.DESC', iconName: 'edit' },
      { title: 'HELP.TOPICS.MANAGE_TEMPLATES.S4.TITLE', description: 'HELP.TOPICS.MANAGE_TEMPLATES.S4.DESC', iconName: 'save' }
    ]
  },
  {
    id: 'edit_onlyoffice',
    title: 'HELP.TOPICS.EDIT_ONLYOFFICE.TITLE',
    description: 'HELP.TOPICS.EDIT_ONLYOFFICE.DESC',
    category: HelpCategory.DOCUMENTS,
    tags: 'HELP.TOPICS.EDIT_ONLYOFFICE.TAGS',
    roles: ['ROLE_SUPERUSER', 'ROLE_ADMIN', 'ROLE_ARCHIVO', 'ROLE_MEDICO'],
    steps: [
      { title: 'HELP.TOPICS.EDIT_ONLYOFFICE.S1.TITLE', description: 'HELP.TOPICS.EDIT_ONLYOFFICE.S1.DESC', iconName: 'file' },
      { title: 'HELP.TOPICS.EDIT_ONLYOFFICE.S2.TITLE', description: 'HELP.TOPICS.EDIT_ONLYOFFICE.S2.DESC', iconName: 'edit' },
      { title: 'HELP.TOPICS.EDIT_ONLYOFFICE.S3.TITLE', description: 'HELP.TOPICS.EDIT_ONLYOFFICE.S3.DESC', iconName: 'save' },
      { title: 'HELP.TOPICS.EDIT_ONLYOFFICE.S4.TITLE', description: 'HELP.TOPICS.EDIT_ONLYOFFICE.S4.DESC', iconName: 'x' }
    ]
  },

  // ===== PACIENTES =====
  {
    id: 'register_patient',
    title: 'HELP.TOPICS.REGISTER_PATIENT.TITLE',
    description: 'HELP.TOPICS.REGISTER_PATIENT.DESC',
    category: HelpCategory.PATIENTS,
    tags: 'HELP.TOPICS.REGISTER_PATIENT.TAGS',
    roles: ['ROLE_SUPERUSER', 'ROLE_ADMIN', 'ROLE_ARCHIVO', 'ROLE_MEDICO'],
    steps: [
      { title: 'HELP.TOPICS.REGISTER_PATIENT.S1.TITLE', description: 'HELP.TOPICS.REGISTER_PATIENT.S1.DESC', iconName: 'users' },
      { title: 'HELP.TOPICS.REGISTER_PATIENT.S2.TITLE', description: 'HELP.TOPICS.REGISTER_PATIENT.S2.DESC', iconName: 'plus' },
      { title: 'HELP.TOPICS.REGISTER_PATIENT.S3.TITLE', description: 'HELP.TOPICS.REGISTER_PATIENT.S3.DESC', iconName: 'edit' },
      { title: 'HELP.TOPICS.REGISTER_PATIENT.S4.TITLE', description: 'HELP.TOPICS.REGISTER_PATIENT.S4.DESC', iconName: 'save' }
    ]
  },

  // ===== HISTORIA CLÍNICA =====
  {
    id: 'view_clinical_history',
    title: 'HELP.TOPICS.VIEW_CLINICAL_HISTORY.TITLE',
    description: 'HELP.TOPICS.VIEW_CLINICAL_HISTORY.DESC',
    category: HelpCategory.CLINICAL_HISTORY,
    tags: 'HELP.TOPICS.VIEW_CLINICAL_HISTORY.TAGS',
    roles: ['ROLE_SUPERUSER', 'ROLE_ADMIN', 'ROLE_MEDICO', 'ROLE_ARCHIVO'],
    steps: [
      { title: 'HELP.TOPICS.VIEW_CLINICAL_HISTORY.S1.TITLE', description: 'HELP.TOPICS.VIEW_CLINICAL_HISTORY.S1.DESC', iconName: 'file' },
      { title: 'HELP.TOPICS.VIEW_CLINICAL_HISTORY.S2.TITLE', description: 'HELP.TOPICS.VIEW_CLINICAL_HISTORY.S2.DESC', iconName: 'search' },
      { title: 'HELP.TOPICS.VIEW_CLINICAL_HISTORY.S3.TITLE', description: 'HELP.TOPICS.VIEW_CLINICAL_HISTORY.S3.DESC', iconName: 'eye' },
      { title: 'HELP.TOPICS.VIEW_CLINICAL_HISTORY.S4.TITLE', description: 'HELP.TOPICS.VIEW_CLINICAL_HISTORY.S4.DESC', iconName: 'info' }
    ]
  },
  {
    id: 'create_clinical_history',
    title: 'HELP.TOPICS.CREATE_CLINICAL_HISTORY.TITLE',
    description: 'HELP.TOPICS.CREATE_CLINICAL_HISTORY.DESC',
    category: HelpCategory.CLINICAL_HISTORY,
    tags: 'HELP.TOPICS.CREATE_CLINICAL_HISTORY.TAGS',
    roles: ['ROLE_SUPERUSER', 'ROLE_ADMIN', 'ROLE_MEDICO', 'ROLE_ARCHIVO'],
    steps: [
      { title: 'HELP.TOPICS.CREATE_CLINICAL_HISTORY.S1.TITLE', description: 'HELP.TOPICS.CREATE_CLINICAL_HISTORY.S1.DESC', iconName: 'file' },
      { title: 'HELP.TOPICS.CREATE_CLINICAL_HISTORY.S2.TITLE', description: 'HELP.TOPICS.CREATE_CLINICAL_HISTORY.S2.DESC', iconName: 'edit' },
      { title: 'HELP.TOPICS.CREATE_CLINICAL_HISTORY.S3.TITLE', description: 'HELP.TOPICS.CREATE_CLINICAL_HISTORY.S3.DESC', iconName: 'plus' },
      { title: 'HELP.TOPICS.CREATE_CLINICAL_HISTORY.S4.TITLE', description: 'HELP.TOPICS.CREATE_CLINICAL_HISTORY.S4.DESC', iconName: 'save' }
    ]
  },
  {
    id: 'add_hc_document',
    title: 'HELP.TOPICS.ADD_HC_DOCUMENT.TITLE',
    description: 'HELP.TOPICS.ADD_HC_DOCUMENT.DESC',
    category: HelpCategory.CLINICAL_HISTORY,
    tags: 'HELP.TOPICS.ADD_HC_DOCUMENT.TAGS',
    roles: ['ROLE_SUPERUSER', 'ROLE_ADMIN', 'ROLE_MEDICO', 'ROLE_ARCHIVO'],
    steps: [
      { title: 'HELP.TOPICS.ADD_HC_DOCUMENT.S1.TITLE', description: 'HELP.TOPICS.ADD_HC_DOCUMENT.S1.DESC', iconName: 'file' },
      { title: 'HELP.TOPICS.ADD_HC_DOCUMENT.S2.TITLE', description: 'HELP.TOPICS.ADD_HC_DOCUMENT.S2.DESC', iconName: 'eye' },
      { title: 'HELP.TOPICS.ADD_HC_DOCUMENT.S3.TITLE', description: 'HELP.TOPICS.ADD_HC_DOCUMENT.S3.DESC', iconName: 'plus' },
      { title: 'HELP.TOPICS.ADD_HC_DOCUMENT.S4.TITLE', description: 'HELP.TOPICS.ADD_HC_DOCUMENT.S4.DESC', iconName: 'save' }
    ]
  },

  // ===== IMÁGENES DICOM =====
  {
    id: 'view_dicom',
    title: 'HELP.TOPICS.VIEW_DICOM.TITLE',
    description: 'HELP.TOPICS.VIEW_DICOM.DESC',
    category: HelpCategory.DICOM,
    tags: 'HELP.TOPICS.VIEW_DICOM.TAGS',
    roles: ['ROLE_SUPERUSER', 'ROLE_ADMIN', 'ROLE_MEDICO', 'ROLE_ARCHIVO'],
    steps: [
      { title: 'HELP.TOPICS.VIEW_DICOM.S1.TITLE', description: 'HELP.TOPICS.VIEW_DICOM.S1.DESC', iconName: 'activity' },
      { title: 'HELP.TOPICS.VIEW_DICOM.S2.TITLE', description: 'HELP.TOPICS.VIEW_DICOM.S2.DESC', iconName: 'eye' },
      { title: 'HELP.TOPICS.VIEW_DICOM.S3.TITLE', description: 'HELP.TOPICS.VIEW_DICOM.S3.DESC', iconName: 'spinner' },
      { title: 'HELP.TOPICS.VIEW_DICOM.S4.TITLE', description: 'HELP.TOPICS.VIEW_DICOM.S4.DESC', iconName: 'sliders' }
    ]
  },
  {
    id: 'upload_dicom',
    title: 'HELP.TOPICS.UPLOAD_DICOM.TITLE',
    description: 'HELP.TOPICS.UPLOAD_DICOM.DESC',
    category: HelpCategory.DICOM,
    tags: 'HELP.TOPICS.UPLOAD_DICOM.TAGS',
    roles: ['ROLE_SUPERUSER', 'ROLE_ADMIN', 'ROLE_MEDICO', 'ROLE_ARCHIVO'],
    steps: [
      { title: 'HELP.TOPICS.UPLOAD_DICOM.S1.TITLE', description: 'HELP.TOPICS.UPLOAD_DICOM.S1.DESC', iconName: 'activity' },
      { title: 'HELP.TOPICS.UPLOAD_DICOM.S2.TITLE', description: 'HELP.TOPICS.UPLOAD_DICOM.S2.DESC', iconName: 'upload' },
      { title: 'HELP.TOPICS.UPLOAD_DICOM.S3.TITLE', description: 'HELP.TOPICS.UPLOAD_DICOM.S3.DESC', iconName: 'users' },
      { title: 'HELP.TOPICS.UPLOAD_DICOM.S4.TITLE', description: 'HELP.TOPICS.UPLOAD_DICOM.S4.DESC', iconName: 'file' },
      { title: 'HELP.TOPICS.UPLOAD_DICOM.S5.TITLE', description: 'HELP.TOPICS.UPLOAD_DICOM.S5.DESC', iconName: 'save' }
    ]
  },
  {
    id: 'view_dicom_local',
    title: 'HELP.TOPICS.VIEW_DICOM_LOCAL.TITLE',
    description: 'HELP.TOPICS.VIEW_DICOM_LOCAL.DESC',
    category: HelpCategory.DICOM,
    tags: 'HELP.TOPICS.VIEW_DICOM_LOCAL.TAGS',
    roles: ['ROLE_SUPERUSER', 'ROLE_ADMIN', 'ROLE_MEDICO', 'ROLE_ARCHIVO'],
    steps: [
      { title: 'HELP.TOPICS.VIEW_DICOM_LOCAL.S1.TITLE', description: 'HELP.TOPICS.VIEW_DICOM_LOCAL.S1.DESC', iconName: 'activity' },
      { title: 'HELP.TOPICS.VIEW_DICOM_LOCAL.S2.TITLE', description: 'HELP.TOPICS.VIEW_DICOM_LOCAL.S2.DESC', iconName: 'file' },
      { title: 'HELP.TOPICS.VIEW_DICOM_LOCAL.S3.TITLE', description: 'HELP.TOPICS.VIEW_DICOM_LOCAL.S3.DESC', iconName: 'eye' }
    ]
  },

  // ===== REPORTES =====
  {
    id: 'view_reports',
    title: 'HELP.TOPICS.VIEW_REPORTS.TITLE',
    description: 'HELP.TOPICS.VIEW_REPORTS.DESC',
    category: HelpCategory.REPORTS,
    tags: 'HELP.TOPICS.VIEW_REPORTS.TAGS',
    roles: ['ROLE_SUPERUSER', 'ROLE_ADMIN', 'ROLE_DIRECTOR', 'ROLE_MEDICO'],
    steps: [
      { title: 'HELP.TOPICS.VIEW_REPORTS.S1.TITLE', description: 'HELP.TOPICS.VIEW_REPORTS.S1.DESC', iconName: 'activity' },
      { title: 'HELP.TOPICS.VIEW_REPORTS.S2.TITLE', description: 'HELP.TOPICS.VIEW_REPORTS.S2.DESC', iconName: 'info' },
      { title: 'HELP.TOPICS.VIEW_REPORTS.S3.TITLE', description: 'HELP.TOPICS.VIEW_REPORTS.S3.DESC', iconName: 'sliders' },
      { title: 'HELP.TOPICS.VIEW_REPORTS.S4.TITLE', description: 'HELP.TOPICS.VIEW_REPORTS.S4.DESC', iconName: 'download' }
    ]
  },

  // ===== AUDITORÍA =====
  {
    id: 'view_audit_logs',
    title: 'HELP.TOPICS.VIEW_AUDIT_LOGS.TITLE',
    description: 'HELP.TOPICS.VIEW_AUDIT_LOGS.DESC',
    category: HelpCategory.AUDIT,
    tags: 'HELP.TOPICS.VIEW_AUDIT_LOGS.TAGS',
    roles: ['ROLE_SUPERUSER'],
    steps: [
      { title: 'HELP.TOPICS.VIEW_AUDIT_LOGS.S1.TITLE', description: 'HELP.TOPICS.VIEW_AUDIT_LOGS.S1.DESC', iconName: 'shield' },
      { title: 'HELP.TOPICS.VIEW_AUDIT_LOGS.S2.TITLE', description: 'HELP.TOPICS.VIEW_AUDIT_LOGS.S2.DESC', iconName: 'search' },
      { title: 'HELP.TOPICS.VIEW_AUDIT_LOGS.S3.TITLE', description: 'HELP.TOPICS.VIEW_AUDIT_LOGS.S3.DESC', iconName: 'info' }
    ]
  },
  {
    id: 'audit_filters',
    title: 'HELP.TOPICS.AUDIT_FILTERS.TITLE',
    description: 'HELP.TOPICS.AUDIT_FILTERS.DESC',
    category: HelpCategory.AUDIT,
    tags: 'HELP.TOPICS.AUDIT_FILTERS.TAGS',
    roles: ['ROLE_SUPERUSER'],
    steps: [
      { title: 'HELP.TOPICS.AUDIT_FILTERS.S1.TITLE', description: 'HELP.TOPICS.AUDIT_FILTERS.S1.DESC', iconName: 'shield' },
      { title: 'HELP.TOPICS.AUDIT_FILTERS.S2.TITLE', description: 'HELP.TOPICS.AUDIT_FILTERS.S2.DESC', iconName: 'sliders' },
      { title: 'HELP.TOPICS.AUDIT_FILTERS.S3.TITLE', description: 'HELP.TOPICS.AUDIT_FILTERS.S3.DESC', iconName: 'eye' }
    ]
  },

  // ===== CONFIGURACIÓN =====
  {
    id: 'manage_tenant_info',
    title: 'HELP.TOPICS.MANAGE_TENANT_INFO.TITLE',
    description: 'HELP.TOPICS.MANAGE_TENANT_INFO.DESC',
    category: HelpCategory.SETTINGS,
    tags: 'HELP.TOPICS.MANAGE_TENANT_INFO.TAGS',
    roles: ['ROLE_SUPERUSER', 'ROLE_ADMIN'],
    steps: [
      { title: 'HELP.TOPICS.MANAGE_TENANT_INFO.S1.TITLE', description: 'HELP.TOPICS.MANAGE_TENANT_INFO.S1.DESC', iconName: 'settings' },
      { title: 'HELP.TOPICS.MANAGE_TENANT_INFO.S2.TITLE', description: 'HELP.TOPICS.MANAGE_TENANT_INFO.S2.DESC', iconName: 'edit' },
      { title: 'HELP.TOPICS.MANAGE_TENANT_INFO.S3.TITLE', description: 'HELP.TOPICS.MANAGE_TENANT_INFO.S3.DESC', iconName: 'save' }
    ]
  },
  {
    id: 'manage_appearance',
    title: 'HELP.TOPICS.MANAGE_APPEARANCE.TITLE',
    description: 'HELP.TOPICS.MANAGE_APPEARANCE.DESC',
    category: HelpCategory.SETTINGS,
    tags: 'HELP.TOPICS.MANAGE_APPEARANCE.TAGS',
    roles: ['ROLE_SUPERUSER', 'ROLE_ADMIN'],
    steps: [
      { title: 'HELP.TOPICS.MANAGE_APPEARANCE.S1.TITLE', description: 'HELP.TOPICS.MANAGE_APPEARANCE.S1.DESC', iconName: 'settings' },
      { title: 'HELP.TOPICS.MANAGE_APPEARANCE.S2.TITLE', description: 'HELP.TOPICS.MANAGE_APPEARANCE.S2.DESC', iconName: 'sliders' },
      { title: 'HELP.TOPICS.MANAGE_APPEARANCE.S3.TITLE', description: 'HELP.TOPICS.MANAGE_APPEARANCE.S3.DESC', iconName: 'edit' },
      { title: 'HELP.TOPICS.MANAGE_APPEARANCE.S4.TITLE', description: 'HELP.TOPICS.MANAGE_APPEARANCE.S4.DESC', iconName: 'eye' }
    ]
  },
  {
    id: 'manage_preferences',
    title: 'HELP.TOPICS.MANAGE_PREFERENCES.TITLE',
    description: 'HELP.TOPICS.MANAGE_PREFERENCES.DESC',
    category: HelpCategory.SETTINGS,
    tags: 'HELP.TOPICS.MANAGE_PREFERENCES.TAGS',
    roles: ['ROLE_SUPERUSER', 'ROLE_ADMIN'],
    steps: [
      { title: 'HELP.TOPICS.MANAGE_PREFERENCES.S1.TITLE', description: 'HELP.TOPICS.MANAGE_PREFERENCES.S1.DESC', iconName: 'settings' },
      { title: 'HELP.TOPICS.MANAGE_PREFERENCES.S2.TITLE', description: 'HELP.TOPICS.MANAGE_PREFERENCES.S2.DESC', iconName: 'sliders' },
      { title: 'HELP.TOPICS.MANAGE_PREFERENCES.S3.TITLE', description: 'HELP.TOPICS.MANAGE_PREFERENCES.S3.DESC', iconName: 'save' }
    ]
  },
  {
    id: 'manage_subscription',
    title: 'HELP.TOPICS.MANAGE_SUBSCRIPTION.TITLE',
    description: 'HELP.TOPICS.MANAGE_SUBSCRIPTION.DESC',
    category: HelpCategory.SETTINGS,
    tags: 'HELP.TOPICS.MANAGE_SUBSCRIPTION.TAGS',
    roles: ['ROLE_SUPERUSER', 'ROLE_ADMIN'],
    steps: [
      { title: 'HELP.TOPICS.MANAGE_SUBSCRIPTION.S1.TITLE', description: 'HELP.TOPICS.MANAGE_SUBSCRIPTION.S1.DESC', iconName: 'settings' },
      { title: 'HELP.TOPICS.MANAGE_SUBSCRIPTION.S2.TITLE', description: 'HELP.TOPICS.MANAGE_SUBSCRIPTION.S2.DESC', iconName: 'info' },
      { title: 'HELP.TOPICS.MANAGE_SUBSCRIPTION.S3.TITLE', description: 'HELP.TOPICS.MANAGE_SUBSCRIPTION.S3.DESC', iconName: 'sliders' },
      { title: 'HELP.TOPICS.MANAGE_SUBSCRIPTION.S4.TITLE', description: 'HELP.TOPICS.MANAGE_SUBSCRIPTION.S4.DESC', iconName: 'dollar' }
    ]
  },

  // ===== COPIAS DE SEGURIDAD =====
  {
    id: 'manage_backups',
    title: 'HELP.TOPICS.MANAGE_BACKUPS.TITLE',
    description: 'HELP.TOPICS.MANAGE_BACKUPS.DESC',
    category: HelpCategory.BACKUPS,
    tags: 'HELP.TOPICS.MANAGE_BACKUPS.TAGS',
    roles: ['ROLE_SUPERUSER'],
    steps: [
      { title: 'HELP.TOPICS.MANAGE_BACKUPS.S1.TITLE', description: 'HELP.TOPICS.MANAGE_BACKUPS.S1.DESC', iconName: 'database' },
      { title: 'HELP.TOPICS.MANAGE_BACKUPS.S2.TITLE', description: 'HELP.TOPICS.MANAGE_BACKUPS.S2.DESC', iconName: 'plus' },
      { title: 'HELP.TOPICS.MANAGE_BACKUPS.S3.TITLE', description: 'HELP.TOPICS.MANAGE_BACKUPS.S3.DESC', iconName: 'download' }
    ]
  },

  // ===== USUARIOS Y ROLES =====
  {
    id: 'manage_users',
    title: 'HELP.TOPICS.MANAGE_USERS.TITLE',
    description: 'HELP.TOPICS.MANAGE_USERS.DESC',
    category: HelpCategory.USERS,
    tags: 'HELP.TOPICS.MANAGE_USERS.TAGS',
    roles: ['ROLE_SUPERUSER', 'ROLE_ADMIN'],
    steps: [
      { title: 'HELP.TOPICS.MANAGE_USERS.S1.TITLE', description: 'HELP.TOPICS.MANAGE_USERS.S1.DESC', iconName: 'users' },
      { title: 'HELP.TOPICS.MANAGE_USERS.S2.TITLE', description: 'HELP.TOPICS.MANAGE_USERS.S2.DESC', iconName: 'user-plus' },
      { title: 'HELP.TOPICS.MANAGE_USERS.S3.TITLE', description: 'HELP.TOPICS.MANAGE_USERS.S3.DESC', iconName: 'edit' },
      { title: 'HELP.TOPICS.MANAGE_USERS.S4.TITLE', description: 'HELP.TOPICS.MANAGE_USERS.S4.DESC', iconName: 'key' }
    ]
  },

  // ===== USO GENERAL =====
  {
    id: 'change_profile_password',
    title: 'HELP.TOPICS.CHANGE_PROFILE_PASSWORD.TITLE',
    description: 'HELP.TOPICS.CHANGE_PROFILE_PASSWORD.DESC',
    category: HelpCategory.GENERAL,
    tags: 'HELP.TOPICS.CHANGE_PROFILE_PASSWORD.TAGS',
    roles: [],
    steps: [
      { title: 'HELP.TOPICS.CHANGE_PROFILE_PASSWORD.S1.TITLE', description: 'HELP.TOPICS.CHANGE_PROFILE_PASSWORD.S1.DESC', iconName: 'user' },
      { title: 'HELP.TOPICS.CHANGE_PROFILE_PASSWORD.S2.TITLE', description: 'HELP.TOPICS.CHANGE_PROFILE_PASSWORD.S2.DESC', iconName: 'settings' },
      { title: 'HELP.TOPICS.CHANGE_PROFILE_PASSWORD.S3.TITLE', description: 'HELP.TOPICS.CHANGE_PROFILE_PASSWORD.S3.DESC', iconName: 'key' },
      { title: 'HELP.TOPICS.CHANGE_PROFILE_PASSWORD.S4.TITLE', description: 'HELP.TOPICS.CHANGE_PROFILE_PASSWORD.S4.DESC', iconName: 'save' }
    ]
  }
];

export const getTopicsByRole = (userRoles: string[]): HelpTopic[] => {
  if (!userRoles || userRoles.length === 0) {
    return helpTopics.filter(topic => topic.roles.length === 0);
  }
  return helpTopics.filter(topic =>
    topic.roles.length === 0 || topic.roles.some(r => userRoles.includes(r))
  );
};

export const searchTopics = (
  query: string,
  userRoles: string[],
  t: (key: string) => string
): HelpTopic[] => {
  const lowerQuery = query.toLowerCase().trim();
  const filteredByRole = getTopicsByRole(userRoles);
  if (!lowerQuery) return filteredByRole;
  return filteredByRole.filter(topic =>
    t(topic.title).toLowerCase().includes(lowerQuery) ||
    t(topic.description).toLowerCase().includes(lowerQuery) ||
    t(topic.tags).toLowerCase().includes(lowerQuery)
  );
};

export const getTopicsByCategory = (category: string, userRoles: string[]): HelpTopic[] => {
  const filteredByRole = getTopicsByRole(userRoles);
  return filteredByRole.filter(topic => topic.category === category);
};

export const getTopicById = (id: string): HelpTopic | undefined => {
  return helpTopics.find(topic => topic.id === id);
};
