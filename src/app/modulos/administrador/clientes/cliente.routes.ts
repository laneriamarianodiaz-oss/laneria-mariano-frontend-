import { Routes } from '@angular/router';

export const CLIENTES_ROUTES: Routes = [
  {
    path: '',
    loadComponent: () =>
      import('./componentes/lista-clientes/lista-clientes.component').then(
        (m) => m.ListaClientesComponent
      ),
  },
  {
    path: 'nuevo',
    loadComponent: () =>
      import('./componentes/formulario-cliente/formulario-cliente.component').then(
        (m) => m.FormularioClienteComponent
      ),
  },
  {
    path: 'editar/:id',
    loadComponent: () =>
      import('./componentes/formulario-cliente/formulario-cliente.component').then(
        (m) => m.FormularioClienteComponent
      ),
  },
  {
    path: ':id',
    loadComponent: () =>
      import('./componentes/detalle-cliente/detalle-cliente.component').then(
        (m) => m.DetalleClienteComponent
      ),
  },
];