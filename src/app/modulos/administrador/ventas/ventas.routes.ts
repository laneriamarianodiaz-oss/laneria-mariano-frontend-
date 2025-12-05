import { Routes } from '@angular/router';

export const VENTAS_ROUTES: Routes = [
  {
    path: '',
    loadComponent: () =>
      import('./componentes/lista-ventas/lista-ventas.component').then(
        (m) => m.ListaVentasComponent
      ),
  },
  {
    path: ':id',
    loadComponent: () =>
      import('./componentes/detalle-venta/detalle-venta.component').then(
        (m) => m.DetalleVentaComponent
      ),
  },
];