import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { CatalogoComponent } from './componentes/catalogo/catalogo.component';
import { CatalogoCompletoComponent } from './componentes/catalogo-completo/catalogo-completo.component';
import { PedidosPersonalizadosComponent } from './componentes/pedidos-personalizados/pedidos-personalizados.component';
import { DetalleCarritoComponent } from './componentes/detalle-carrito/detalle-carrito.component';
import { FinalizarCompraComponent } from './componentes/finalizar-compra/finalizar-compra.component';
import { MisPedidosComponent } from './componentes/mis-pedidos/mis-pedidos.component';
import { autenticacionGuard } from '../../nucleo/guardias/autenticacion.guard';

const routes: Routes = [
  { path: '', component: CatalogoComponent },
  { path: 'completo', component: CatalogoCompletoComponent },
  { path: 'personalizados', component: PedidosPersonalizadosComponent }, // ← NUEVA RUTA
  { path: 'detalle', component: DetalleCarritoComponent },
  { path: 'finalizar', component: FinalizarCompraComponent, canActivate: [autenticacionGuard] },
  { path: 'mis-pedidos', component: MisPedidosComponent, canActivate: [autenticacionGuard] }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class CarritoRoutingModule { }