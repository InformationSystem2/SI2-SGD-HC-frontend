// src/app/layout/components/sidebar/config/nav.config.ts

import type { NavItem } from '../models/nav-item.model';

export const NAV_ITEMS: NavItem[] = [
  {
    label: 'NAV.DASHBOARD',
    path: '/dashboard/dashboard',
    icon: 'layout-dashboard',
  },
  {
    label: 'NAV.DOCUMENTS',
    path: '/documentos/list',
    icon: 'file-text',
    permissions: ['DOCUMENT_READ'],
    subItems: [
      { label: 'NAV.DOCUMENT_LIST', path: '/documentos/list' },
      { label: 'NAV.DOCUMENT_UPLOAD', path: '/documentos/upload' },
      { label: 'NAV.DOCUMENT_TEMPLATES', path: '/documentos/templates' },
      { label: 'NAV.DOCUMENT_TEMPLATE_NEW', path: '/documentos/templates/new' },
    ],
  },
  {
    label: 'NAV.ROLES',
    path: '/roles/list',
    icon: 'shield',
    permissions: ['ROLE_READ'],
  },
  {
    label: 'NAV.USERS',
    path: '/usuarios/list',
    icon: 'users',
    permissions: ['USER_READ'],
    subItems: [
      { label: 'NAV.USER_LIST', path: '/usuarios/list' },
      { label: 'NAV.USER_REGISTER', path: '/usuarios/register' },
    ],
  },
  {
    label: 'NAV.PATIENTS',
    path: '/pacientes/list',
    icon: 'heart-pulse',
    permissions: ['PATIENT_READ'],
    subItems: [
      { label: 'NAV.PATIENT_LIST', path: '/pacientes/list' },
      { label: 'NAV.PATIENT_REGISTER', path: '/pacientes/register' },
    ],
  },
  {
    label: 'NAV.HISTORIAL',    // ← usar clave de traducción
    path: '/historiales',
    icon: 'search',
    permissions: ['DOCUMENT_READ'],
  },
];
