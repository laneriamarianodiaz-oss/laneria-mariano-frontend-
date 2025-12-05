import { Routes } from '@angular/router';
import { autenticacionGuard } from '../../../nucleo/guardias/autenticacion.guard';
import { DetallePedidoAdminComponent } from './componentes/detalle-pedido-admin/detalle-pedido-admin.component';

export const PUNTO_VENTA_ROUTES: Routes = [
  {
    path: '',
    canActivate: [autenticacionGuard],
    loadComponent: () =>
      import('./componentes/pos-principal/pos-principal.component').then(
        (m) => m.PosPrincipalComponent
      ),
    data: {
      titulo: 'Punto de Venta',
      roles: ['administrador', 'vendedor'],
    },
  },
  {
    path: 'pedidos-online/:id',
    canActivate: [autenticacionGuard],
    component: DetallePedidoAdminComponent,
    data: {
      titulo: 'Detalle del Pedido',
      roles: ['administrador', 'vendedor'],
    },
  }
];