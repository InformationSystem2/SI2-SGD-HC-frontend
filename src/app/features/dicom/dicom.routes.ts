import { Routes } from '@angular/router';

export const dicomRoutes: Routes = [
  {
    path: 'patient/:patientId',
    loadComponent: () =>
      import('./pages/dicom-list/dicom-list').then(m => m.DicomList),
  },
  {
    path: 'upload',
    loadComponent: () =>
      import('./pages/dicom-upload/dicom-upload').then(m => m.DicomUpload),
  },
  {
    path: 'viewer/:studyId',
    loadComponent: () =>
      import('./pages/dicom-viewer/dicom-viewer').then(m => m.DicomViewer),
  },
  {
    path: '',
    redirectTo: '/pacientes/list',
    pathMatch: 'full',
  },
];
