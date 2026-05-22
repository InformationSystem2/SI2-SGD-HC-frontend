// src/app/features/historial/historial.routes.ts

/**
 * Definición de rutas para el módulo de historiales clínicos.
 * Carga el componente HistorialList cuando se navega a /historiales.
 */

import { Routes } from '@angular/router';
import { HistorialList } from './pages/historial-list/historial-list';

export const historialRoutes: Routes = [
  {
    path: '',
    component: HistorialList,
  },
];