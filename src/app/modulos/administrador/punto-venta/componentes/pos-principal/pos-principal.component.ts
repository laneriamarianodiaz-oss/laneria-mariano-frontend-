import { Component, inject, signal, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { PosService } from '../../servicios/pos.service';
import { PedidosOnlineService } from '../../servicios/pedidos-online.service';
import { BusquedaProductosComponent } from '../busqueda-productos/busqueda-productos.component';
import { ItemsCarritoComponent } from '../items-carrito/items-carrito.component';
import { FormularioClienteComponent } from '../formulario-cliente/formulario-cliente.component';
import { ResumenPagoComponent } from '../resumen-pago/resumen-pago.component';
import { PedidosPendientesComponent } from '../pedidos-pendientes/pedidos-pendientes.component';
import { Producto } from '../../../productos/modelos/producto.model';

@Component({
  selector: 'app-pos-principal',
  standalone: true,
  imports: [
    CommonModule,
    BusquedaProductosComponent,
    ItemsCarritoComponent,
    FormularioClienteComponent,
    ResumenPagoComponent,
    PedidosPendientesComponent,
  ],
  templateUrl: './pos-principal.component.html',
  styleUrls: ['./pos-principal.component.css'],
})
export class PosPrincipalComponent implements OnInit {
  private readonly posService = inject(PosService);
  private readonly pedidosService = inject(PedidosOnlineService);

  // Estados locales
  readonly mostrarFormularioCliente = signal(false);
  readonly ventaExitosa = signal(false);
  readonly numeroVenta = signal<string>('');
  readonly vistaActiva = signal<'pos' | 'pedidos'>('pos');

  // Signals del servicio POS
  readonly carrito = this.posService.carrito;
  readonly clienteSeleccionado = this.posService.clienteSeleccionado;
  readonly totalVenta = this.posService.totalVenta;
  readonly totalItems = this.posService.totalItems;
  readonly procesandoVenta = this.posService.procesandoVenta;

  // Signals del servicio de pedidos
  readonly cantidadPendientes = this.pedidosService.cantidadPendientes;

  ngOnInit(): void {
    // Cargar pedidos pendientes al iniciar
    this.pedidosService.obtenerPedidosActivos().subscribe();
  }

  /**
   * Cambiar vista
   */
  cambiarVista(vista: 'pos' | 'pedidos'): void {
    this.vistaActiva.set(vista);
  }

  /**
   * Manejar producto seleccionado desde búsqueda
   */
  onProductoSeleccionado(producto: Producto): void {
    this.posService.agregarProducto(producto, 1);
  }

  /**
   * Mostrar formulario de cliente
   */
  mostrarCliente(): void {
    this.mostrarFormularioCliente.set(true);
  }

  /**
   * Cerrar formulario de cliente
   */
  cerrarFormularioCliente(): void {
    this.mostrarFormularioCliente.set(false);
  }

  /**
   * Procesar venta
   */
  procesarVenta(): void {
    if (!this.clienteSeleccionado()) {
      alert('⚠️ Debe seleccionar un cliente antes de procesar la venta');
      return;
    }

    this.posService.procesarVenta().subscribe({
      next: (respuesta) => {
        if (respuesta.success) {
          this.ventaExitosa.set(true);
          this.numeroVenta.set(respuesta.data.numero_venta);

          setTimeout(() => {
            this.posService.resetearPOS();
            this.ventaExitosa.set(false);
            this.numeroVenta.set('');
          }, 3000);
        }
      },
      error: (error) => {
        console.error('Error al procesar venta:', error);
        alert('❌ Error al procesar la venta. Intente nuevamente.');
      },
    });
  }

  /**
   * Vaciar carrito
   */
  vaciarCarrito(): void {
    if (this.carrito().items.length === 0) return;

    if (confirm('¿Está seguro de vaciar el carrito?')) {
      this.posService.vaciarCarrito();
    }
  }

  /**
   * Nueva venta
   */
  nuevaVenta(): void {
    if (this.carrito().items.length > 0) {
      if (
        confirm(
          '¿Está seguro de iniciar una nueva venta? Se perderá el carrito actual.'
        )
      ) {
        this.posService.resetearPOS();
      }
    } else {
      this.posService.resetearPOS();
    }
  }
}