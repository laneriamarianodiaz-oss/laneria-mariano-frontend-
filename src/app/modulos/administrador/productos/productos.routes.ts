import { Routes } from '@angular/router';

export const PRODUCTOS_ROUTES: Routes = [
  {
    path: '',
    loadComponent: () => import('./componentes/lista-productos/lista-productos.component')
      .then(m => m.ListaProductosComponent)
  }
];