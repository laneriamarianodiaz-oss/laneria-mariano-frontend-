import { Routes } from '@angular/router';

export const REPORTES_ROUTES: Routes = [
  {
    path: '',
    loadComponent: () =>
      import('./componentes/tablero-reportes/tablero-reportes.component').then(
        (m) => m.TableroReportesComponent
      ),
  },
];