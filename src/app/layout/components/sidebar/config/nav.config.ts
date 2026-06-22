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
    path: '/documents/list',
    icon: 'file-text',
    permissions: ['document:read'],
    subItems: [
      { label: 'NAV.DOCUMENT_LIST', path: '/documents/list' },
      { label: 'NAV.DOCUMENT_UPLOAD', path: '/documents/upload' },
      { label: 'NAV.DOCUMENT_TEMPLATES', path: '/documents/templates' },
      { label: 'NAV.DOCUMENT_TEMPLATE_NEW', path: '/documents/templates/new' },
      { label: 'NAV.DOCUMENT_EDITOR', path: '/documents/editor' },
      { label: 'NAV.DOCUMENT_VERSIONS', path: '/documents/versions' },
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
    path: '/users/list',
    icon: 'users',
    permissions: ['user:read'],
    subItems: [
      { label: 'NAV.USER_LIST', path: '/users/list' },
      { label: 'NAV.USER_REGISTER', path: '/users/register' },
    ],
  },
  {
    label: 'NAV.PATIENTS',
    path: '/patients/list',
    icon: 'heart-pulse',
    permissions: ['patient:read'],
    subItems: [
      { label: 'NAV.PATIENT_LIST', path: '/patients/list' },
      { label: 'NAV.PATIENT_REGISTER', path: '/patients/register' },
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
    path: '/records',
    icon: 'search',
    permissions: ['document:read'],
  },
  {
    label: 'NAV.TASKS',
    path: '/tasks',
    icon: 'inbox',
    permissions: ['review-task:read'],
    subItems: [
      { label: 'NAV.TASKS_INBOX', path: '/tasks' },
      { label: 'NAV.TASKS_CREATE', path: '/tasks/create' },
      { label: 'NAV.TASKS_STATS', path: '/tasks/stats' },
    ],
  },
  {
    label: 'NAV.NOTIFICATIONS',
    path: '/notifications',
    icon: 'bell',
  },
  {
    label: 'NAV.REPORTS',
    path: '/reports/designer',
    icon: 'file-text',
    permissions: ['report:read'],
    subItems: [
      { label: 'NAV.REPORTS_DESIGNER', path: '/reports/designer' },
      { label: 'NAV.REPORTS_TEMPLATES', path: '/reports/templates' }
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
      { label: 'NAV.PLANS', path: '/dashboard/admin/plans' },
      { label: 'NAV.AUDIT', path: '/audit'},
      { label: 'Backups', path: '/dashboard/admin/backups' },
    ],
  },  
];
