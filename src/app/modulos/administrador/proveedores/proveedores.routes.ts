import { Routes } from '@angular/router';

export const PROVEEDORES_ROUTES: Routes = [
  {
    path: '',
    loadComponent: () =>
      import('./componentes/lista-proveedores/lista-proveedores.component').then(
        (m) => m.ListaProveedoresComponent
      ),
  },
  {
    path: 'nuevo',
    loadComponent: () =>
      import('./componentes/formulario-proveedor/formulario-proveedor.component').then(
        (m) => m.FormularioProveedorComponent
      ),
  },
  {
    path: 'editar/:id',
    loadComponent: () =>
      import('./componentes/formulario-proveedor/formulario-proveedor.component').then(
        (m) => m.FormularioProveedorComponent
      ),
  },
  {
    path: ':id/productos',
    loadComponent: () =>
      import('./componentes/productos-proveedor/productos-proveedor.component').then(
        (m) => m.ProductosProveedorComponent
      ),
  },
];