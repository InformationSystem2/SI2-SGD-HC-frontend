import type { NavItem } from '../models/nav-item.model';
import { ROLES } from '../../../../core/auth/services/role-policy.service';

export const NAV_ITEMS: NavItem[] = [
  {
    label: 'NAV.DASHBOARD',
    path: '/dashboard/dashboard',
    icon: 'layout-dashboard',
    roles: [ROLES.SUPERUSER, ROLES.ADMIN, ROLES.DIRECTOR, ROLES.MEDICO, ROLES.ARCHIVO],
  },
  {
    label: 'NAV.DOCUMENTS',
    path: '/documentos/list',
    icon: 'file-text',
    permissions: ['document:read'],
    subItems: [
      { label: 'NAV.DOCUMENT_LIST', path: '/documentos/list' },
      { label: 'NAV.DOCUMENT_UPLOAD', path: '/documentos/upload' },
      { label: 'NAV.DOCUMENT_TEMPLATES', path: '/documentos/templates' },
      { label: 'NAV.DOCUMENT_TEMPLATE_NEW', path: '/documentos/templates/new' },
      { label: 'NAV.DOCUMENT_EDITOR', path: '/documentos/editor' },
      { label: 'NAV.DOCUMENT_VERSIONS', path: '/documentos/versions' },
    ],
  },
  {
    label: 'NAV.ROLES',
    path: '/roles/list',
    icon: 'shield',
    permissions: ['role:read'],
  },
  {
    label: 'NAV.USERS',
    path: '/usuarios/list',
    icon: 'users',
    permissions: ['user:read'],
    subItems: [
      { label: 'NAV.USER_LIST', path: '/usuarios/list' },
      { label: 'NAV.USER_REGISTER', path: '/usuarios/register' },
    ],
  },
  {
    label: 'NAV.PATIENTS',
    path: '/pacientes/list',
    icon: 'heart-pulse',
    permissions: ['patient:read'],
    subItems: [
      { label: 'NAV.PATIENT_LIST', path: '/pacientes/list' },
      { label: 'NAV.PATIENT_REGISTER', path: '/pacientes/register' },
    ],
  },
  {
    label: 'NAV.DICOM',
    path: '/dicom/viewer',
    icon: 'scan',
    permissions: ['dicom:read'],
    subItems: [
      { label: 'NAV.DICOM_VIEWER', path: '/dicom/viewer' },
    ],

  },
  {
    label: 'NAV.HISTORIAL',
    path: '/historiales',
    icon: 'search',
    permissions: ['document:read'],
  },
  {
    label: 'NAV.TASKS',
    path: '/tareas',
    icon: 'inbox',
    permissions: ['review-task:read'],
  },
  {
    label: 'NAV.NOTIFICATIONS',
    path: '/notificaciones',
    icon: 'bell',
  },
  {
    label: 'NAV.REPORTS',
    path: '/reportes/designer',
    icon: 'file-text',
    permissions: ['report:read'],
    subItems: [
      { label: 'NAV.REPORTS_DESIGNER', path: '/reportes/designer' },
      { label: 'NAV.REPORTS_TEMPLATES', path: '/reportes/templates' }
    ]
  },
  {
    label: 'NAV.CONFIG',
    path: '/dashboard/tenant/info',
    icon: 'settings',
    roles: [ROLES.SUPERUSER, ROLES.ADMIN, ROLES.DIRECTOR],
    subItems: [
      { label: 'NAV.INFO',          path: '/dashboard/tenant/info' },
      { label: 'NAV.APPEARANCE',    path: '/dashboard/tenant/appearance' },
      { label: 'NAV.PREFERENCES',   path: '/dashboard/tenant/preferences' },
      { label: 'NAV.SUBSCRIPTION',  path: '/dashboard/tenant/subscription' },
    ],
  },
  {
    label: 'NAV.ADMIN',
    path: '/dashboard/admin/tenants',
    icon: 'building',
    roles: [ROLES.SUPERUSER],
    subItems: [
      { label: 'NAV.TENANTS', path: '/dashboard/admin/tenants' },
      { label: 'NAV.AUDIT', path: '/audit'},
      { label: 'Backups', path: '/dashboard/admin/backups' },
    ],
  },  
];
