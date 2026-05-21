import { Routes } from '@angular/router';

export const dicomRoutes: Routes = [
  {
    path: 'viewer/:studyId',
    loadComponent: () =>
      import('./pages/dicom-viewer/dicom-viewer').then(m => m.DicomViewer),
  },
  {
    path: 'local',
    loadComponent: () =>
      import('./pages/dicom-local/dicom-local').then(m => m.DicomLocal),
  },
  {
    path: 'viewer',
    loadComponent: () =>
      import('./pages/dicom-home/dicom-home').then(m => m.DicomHome),
  },
  {
    path: '',
    redirectTo: 'viewer',
    pathMatch: 'full',
  },
];
