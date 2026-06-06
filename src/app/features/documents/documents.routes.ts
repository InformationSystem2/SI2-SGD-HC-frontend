import { Routes } from '@angular/router';
import { permissionGuard } from '../../core/auth/guards/role.guard';

export const documentsRoutes: Routes = [
  // ── Documentos ──────────────────────────────────────────────────────────
  {
    path: 'list',
    canActivate: [permissionGuard('document:read')],
    loadComponent: () =>
      import('./pages/document-list/document-list').then(m => m.DocumentList),
  },
  {
    path: 'upload',
    canActivate: [permissionGuard('document:create')],
    loadComponent: () =>
      import('./pages/document-upload/document-upload').then(m => m.DocumentUpload),
  },
  {
    path: 'new/:templateId',
    canActivate: [permissionGuard('document:create')],
    loadComponent: () =>
      import('./pages/document-form/document-form').then(m => m.DocumentForm),
  },
  // ── Plantillas ───────────────────────────────────────────────────────────
  {
    path: 'templates',
    canActivate: [permissionGuard('template:read')],
    loadComponent: () =>
      import('./pages/template-list/template-list').then(m => m.TemplateList),
  },
  {
    path: 'templates/new',
    canActivate: [permissionGuard('template:create')],
    loadComponent: () =>
      import('./pages/template-form/template-form').then(m => m.TemplateForm),
  },
  {
    path: 'templates/edit/:id',
    canActivate: [permissionGuard('template:update')],
    loadComponent: () =>
      import('./pages/template-form/template-form').then(m => m.TemplateForm),
  },
  // ── Vista y edición ───────────────────────────────────────────────────────
  {
    path: 'view/:id',
    canActivate: [permissionGuard('document:read')],
    loadComponent: () =>
      import('./pages/document-detail/document-detail').then(m => m.DocumentDetail),
  },
  {
    path: 'edit/:id',
    canActivate: [permissionGuard('document:update')],
    loadComponent: () =>
      import('./pages/document-edit/document-edit').then(m => m.DocumentEdit),
  },
  // ── Default ──────────────────────────────────────────────────────────────
  {
    path: '',
    redirectTo: 'list',
    pathMatch: 'full',
  },
];
