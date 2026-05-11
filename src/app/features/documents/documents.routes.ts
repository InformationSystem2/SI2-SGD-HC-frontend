import { Routes } from '@angular/router';

export const documentsRoutes: Routes = [
  // ── Documentos ──────────────────────────────────────────────────────────
  {
    path: 'list',
    loadComponent: () =>
      import('./pages/document-list/document-list').then(m => m.DocumentList),
  },
  {
    path: 'upload',
    loadComponent: () =>
      import('./pages/document-upload/document-upload').then(m => m.DocumentUpload),
  },
  {
    path: 'new/:templateId',
    loadComponent: () =>
      import('./pages/document-form/document-form').then(m => m.DocumentForm),
  },
  // ── Plantillas ───────────────────────────────────────────────────────────
  {
    path: 'templates',
    loadComponent: () =>
      import('./pages/template-list/template-list').then(m => m.TemplateList),
  },
  {
    path: 'templates/new',
    loadComponent: () =>
      import('./pages/template-form/template-form').then(m => m.TemplateForm),
  },
  {
    path: 'templates/edit/:id',
    loadComponent: () =>
      import('./pages/template-form/template-form').then(m => m.TemplateForm),
  },
  // ── Vista y edición ───────────────────────────────────────────────────────
  {
    path: 'view/:id',
    loadComponent: () =>
      import('./pages/document-detail/document-detail').then(m => m.DocumentDetail),
  },
  {
    path: 'edit/:id',
    loadComponent: () =>
      import('./pages/document-edit/document-edit').then(m => m.DocumentEdit),
  },
  // ── Editor OnlyOffice ─────────────────────────────────────────────────────
  {
    path: 'editor',
    loadComponent: () =>
      import('./pages/document-editor/document-editor').then(m => m.DocumentEditorPage),
  },
  // ── Default ──────────────────────────────────────────────────────────────
  {
    path: '',
    redirectTo: 'list',
    pathMatch: 'full',
  },
];
