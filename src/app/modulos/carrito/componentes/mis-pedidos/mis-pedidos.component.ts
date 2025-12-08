import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Router } from '@angular/router';
import { PedidoService } from '../../servicios/pedido.service';
import { Pedido } from '../../../../compartido/modelos/pedido.modelo';
import { DetallePedidoComponent } from '../detalle-pedido/detalle-pedido.component';

@Component({
  selector: 'app-mis-pedidos',
  standalone: true,
  imports: [
    CommonModule, 
    RouterModule,
    DetallePedidoComponent
  ],
  templateUrl: './mis-pedidos.component.html',
  styleUrl: './mis-pedidos.component.scss'
})
export class MisPedidosComponent implements OnInit {
  pedidos: Pedido[] = [];
  cargando = true;
  error = '';

  // Variables para el modal
  pedidoSeleccionado: Pedido | null = null;
  mostrarDetalle: boolean = false;

  // ❌ ELIMINADAS TODAS LAS VARIABLES DE COMPROBANTE

  constructor(
    public pedidoService: PedidoService,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.cargarPedidos();
  }

  cargarPedidos(): void {
    this.cargando = true;
    this.error = '';
    
    this.pedidoService.obtenerMisPedidos().subscribe({
      next: (respuesta) => {
        console.log('✅ Pedidos recibidos:', respuesta);
        
        if (respuesta.success && respuesta.data) {
          this.pedidos = respuesta.data.map((venta: any) => ({
            id: venta.venta_id,
            venta_id: venta.venta_id,
            numero_venta: venta.numero_venta,
            fecha_pedido: venta.fecha_venta,
            fecha_venta: venta.fecha_venta,
            fecha_venta_formato: venta.fecha_venta,
            estado: this.mapearEstado(venta.estado_venta),
            estado_venta: venta.estado_venta,
            total: venta.total_venta,
            total_venta: venta.total_venta,
            subtotal: venta.subtotal || 0,
            descuento: venta.descuento || 0,
            direccion_envio: venta.direccion_envio,
            telefono_contacto: venta.telefono_contacto,
            metodo_pago: venta.metodo_pago,
            canal_venta: venta.canal_venta,
            codigo_operacion: venta.codigo_operacion,
            comprobante_pago: venta.comprobante_pago,
            observaciones: venta.observaciones,
            cliente: venta.cliente,
            cliente_id: venta.cliente_id,
            
            items: (venta.productos || venta.detalles || []).map((item: any) => {
              if (item.nombre) {
                return {
                  producto_id: item.producto_id,
                  producto: {
                    producto_id: item.producto_id,
                    nombre_producto: item.nombre,
                    imagen_url: item.imagen_url
                  },
                  cantidad: item.cantidad,
                  precio_unitario: item.precio_unitario,
                  subtotal: item.subtotal
                };
              }
              return {
                detalle_venta_id: item.detalle_venta_id,
                producto_id: item.producto_id,
                producto: item.producto,
                cantidad: item.cantidad,
                precio_unitario: item.precio_unitario,
                subtotal: item.subtotal
              };
            }),
            
            productos: (venta.productos || venta.detalles || []).map((item: any) => ({
              producto_id: item.producto_id,
              nombre_producto: item.nombre || item.producto?.nombre_producto || 'Producto',
              cantidad: item.cantidad,
              precio_unitario: item.precio_unitario,
              subtotal: item.subtotal,
              imagen_url: item.imagen_url || item.producto?.imagen_url
            }))
          }));
        }
        
        this.cargando = false;
      },
      error: (error) => {
        console.error('❌ Error al cargar pedidos:', error);
        this.error = error.error?.message || 'Error al cargar tus pedidos. Por favor intenta de nuevo.';
        this.cargando = false;
      }
    });
  }

  mapearEstado(estadoBackend: string): any {
    const mapeo: { [key: string]: string } = {
      'Pendiente': 'pendiente',
      'Confirmado': 'confirmado',
      'En Proceso': 'confirmado',
      'Enviado': 'enviado',
      'Entregado': 'entregado',
      'Completado': 'entregado',
      'Cancelado': 'cancelado',
      'Cancelada': 'cancelado'
    };
    return mapeo[estadoBackend] || estadoBackend.toLowerCase();
  }

  obtenerEstadoTexto(estado: string): string {
    const estados: { [key: string]: string } = {
      'Pendiente': '⏳ Pendiente',
      'Confirmado': '✓ Confirmado',
      'En Proceso': '🔄 En Proceso',
      'Enviado': '🚚 Enviado',
      'Entregado': '📦 Entregado',
      'Completado': '✅ Completado',
      'Cancelado': '❌ Cancelado',
      'pendiente': '⏳ Pendiente',
      'confirmado': '✓ Confirmado',
      'enviado': '🚚 Enviado',
      'entregado': '📦 Entregado',
      'cancelado': '❌ Cancelado'
    };
    return estados[estado] || estado;
  }

  verDetalle(pedido: Pedido): void {
    console.log('👁️ Abriendo modal de detalle:', pedido);
    this.pedidoSeleccionado = pedido;
    this.mostrarDetalle = true;
  }

  cerrarDetalle(): void {
    console.log('❌ Cerrando modal');
    this.mostrarDetalle = false;
    this.pedidoSeleccionado = null;
  }

  cancelarPedido(pedido: Pedido, event: Event): void {
    event.stopPropagation();

    const estado = pedido.estado_venta || pedido.estado;
    if (!this.puedeCancelar(estado)) {
      alert('Este pedido no puede ser cancelado en su estado actual');
      return;
    }

    const motivo = prompt('¿Por qué deseas cancelar este pedido?');
    
    if (motivo === null) {
      return;
    }

    const numeroVenta = pedido.numero_venta || `#${pedido.id || pedido.venta_id}`;
    if (confirm(`¿Estás seguro de cancelar el pedido ${numeroVenta}?`)) {
      const id = pedido.venta_id || pedido.id;
      if (!id) {
        alert('Error: No se pudo identificar el pedido');
        return;
      }

      this.pedidoService.cancelarPedido(id, motivo).subscribe({
        next: (respuesta) => {
          console.log('✅ Pedido cancelado:', respuesta);
          alert('Pedido cancelado exitosamente');
          this.cerrarDetalle();
          this.cargarPedidos();
        },
        error: (error) => {
          console.error('❌ Error al cancelar:', error);
          alert('Error al cancelar pedido: ' + (error.error?.message || error.message));
        }
      });
    }
  }

  puedeCancelar(estado: string | undefined): boolean {
    if (!estado) return false;
    return ['Pendiente', 'Confirmado', 'pendiente', 'confirmado'].includes(estado);
  }

  // ❌ ELIMINADOS TODOS LOS MÉTODOS DE SUBIR COMPROBANTE:
  // - puedeSubirComprobante()
  // - seleccionarComprobante()
  // - onArchivoSeleccionado()
  // - subirImagenCloudinary()
  // - subirComprobante()
  // - verComprobante()

  obtenerIconoEstado(estado: string): string {
    return this.pedidoService.obtenerIconoEstado(estado);
  }

  obtenerColorEstado(estado: string): string {
    return this.pedidoService.obtenerColorEstado(estado);
  }
}