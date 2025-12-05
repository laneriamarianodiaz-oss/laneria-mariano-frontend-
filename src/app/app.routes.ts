import { Routes } from '@angular/router';
import { autenticacionGuard } from './nucleo/guardias/autenticacion.guard';
import { adminGuard } from './nucleo/guardias/admin.guard';

export const routes: Routes = [
  { path: '', redirectTo: '/catalogo', pathMatch: 'full' },

  {
    path: 'autenticacion',
    loadChildren: () => import('./modulos/autenticacion/autenticacion.module')
      .then(m => m.AutenticacionModule)
  },

  {
    path: 'catalogo',
    loadChildren: () => import('./modulos/carrito/carrito.module')
      .then(m => m.CarritoModule)
  },

  {
    path: 'carrito',
    loadChildren: () => import('./modulos/carrito/carrito.module')
      .then(m => m.CarritoModule)
  },

  {
    path: 'comunicacion',
    loadChildren: () => import('./modulos/comunicacion/comunicacion.module')
      .then(m => m.ComunicacionModule),
    canActivate: [autenticacionGuard]
  },

  {
    path: 'admin',
    loadComponent: () => import('./modulos/administrador/diseno/diseno-admin.component')
      .then(m => m.DisenoAdminComponent),
    canActivate: [autenticacionGuard, adminGuard],
    children: [
      { path: '', redirectTo: 'tablero', pathMatch: 'full' },
      {
        path: 'tablero',
        loadComponent: () => import('./modulos/administrador/tablero/componentes/tablero-principal/tablero-principal.component')
          .then(m => m.TableroPrincipalComponent)
      },
      {
        path: 'productos',
        loadChildren: () => import('./modulos/administrador/productos/productos.routes')
          .then(m => m.PRODUCTOS_ROUTES)
      },
      {
        path: 'inventario',
        loadChildren: () => import('./modulos/administrador/inventario/inventario.routes')
          .then(m => m.INVENTARIO_ROUTES)
      },
      {
        path: 'punto-venta',
        loadChildren: () => import('./modulos/administrador/punto-venta/punto-venta.routes')
          .then(m => m.PUNTO_VENTA_ROUTES)
      },
      {
        path: 'ventas',
        loadComponent: () => import('./modulos/administrador/ventas/componentes/lista-ventas/lista-ventas.component')
          .then(m => m.ListaVentasComponent)
      },
      {
        path: 'clientes',
        loadComponent: () => import('./modulos/administrador/clientes/componentes/lista-clientes/lista-clientes.component')
          .then(m => m.ListaClientesComponent)
      },
      {
        path: 'proveedores',
        loadComponent: () => import('./modulos/administrador/proveedores/componentes/lista-proveedores/lista-proveedores.component')
          .then(m => m.ListaProveedoresComponent)
      },
      {
        path: 'reportes',
        loadComponent: () => import('./modulos/administrador/reportes/componentes/tablero-reportes/tablero-reportes.component')
          .then(m => m.TableroReportesComponent)
      }
    ]
  },

  { path: '**', redirectTo: '/catalogo' }
];