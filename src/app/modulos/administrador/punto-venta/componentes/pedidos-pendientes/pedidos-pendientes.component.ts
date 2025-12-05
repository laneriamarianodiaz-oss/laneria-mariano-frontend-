import { Component, inject, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { PedidosOnlineService, VentaOnline, EstadoVenta } from '../../servicios/pedidos-online.service';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-pedidos-pendientes',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './pedidos-pendientes.component.html',
  styleUrls: ['./pedidos-pendientes.component.css'],
})
export class PedidosPendientesComponent implements OnInit, OnDestroy {
  private readonly pedidosService = inject(PedidosOnlineService);
  private readonly router = inject(Router);
  private pollingSubscription?: Subscription;

  // Signals del servicio
  readonly pedidosPendientes = this.pedidosService.pedidosPendientes;
  readonly pedidosConfirmados = this.pedidosService.pedidosConfirmados;
  readonly pedidosCompletados = this.pedidosService.pedidosCompletados;
  readonly cantidadPendientes = this.pedidosService.cantidadPendientes;
  readonly cargando = this.pedidosService.estaCargando;

  // Estado local
  pedidoSeleccionado: VentaOnline | null = null;
  mostrarModal = false;
  mostrarImagenCompleta = false;
  imagenCompletar: string | null = null;

  ngOnInit(): void {
    this.cargarPedidos();

    this.pollingSubscription = this.pedidosService.iniciarPolling().subscribe({
      next: () => {
        console.log('🔄 Pedidos actualizados');
      },
      error: (error) => {
        console.error('❌ Error al actualizar pedidos:', error);
      },
    });
  }

  ngOnDestroy(): void {
    this.pollingSubscription?.unsubscribe();
  }

  cargarPedidos(): void {
    this.pedidosService.obtenerPedidosActivos().subscribe({
      error: (error) => {
        console.error('Error al cargar pedidos:', error);
      },
    });
  }

  verDetalle(pedido: VentaOnline): void {
    this.pedidoSeleccionado = pedido;
    this.mostrarModal = true;
  }

  verDetallePedido(ventaId: number): void {
    console.log('📋 Navegando a detalle del pedido:', ventaId);
    this.router.navigate(['/admin/punto-venta/pedidos-online', ventaId]);
  }

  aceptarPedido(pedido: VentaOnline): void {
    const confirmacion = confirm(
      `¿Aceptar el pedido #${pedido.numero_venta} de ${pedido.cliente_nombre}?\n\nTotal: S/ ${pedido.total.toFixed(2)}`
    );

    if (!confirmacion) return;

    this.pedidosService.confirmarPedido(pedido.venta_id).subscribe({
      next: () => {
        alert('✅ Pedido aceptado y confirmado');
      },
      error: (error) => {
        console.error('Error al aceptar pedido:', error);
        alert('❌ Error al aceptar el pedido');
      },
    });
  }

  completarPedido(pedido: VentaOnline): void {
    const confirmacion = confirm(
      `¿Marcar como completado el pedido #${pedido.numero_venta}?`
    );

    if (!confirmacion) return;

    this.pedidosService.completarPedido(pedido.venta_id).subscribe({
      next: () => {
        alert('✅ Pedido completado');
      },
      error: (error) => {
        console.error('Error al completar pedido:', error);
        alert('❌ Error al completar el pedido');
      },
    });
  }

  rechazarPedido(pedido: VentaOnline): void {
    const motivo = prompt('Ingrese el motivo del rechazo:');
    if (!motivo) return;

    this.pedidosService.cancelarPedido(pedido.venta_id, motivo).subscribe({
      next: () => {
        alert('✅ Pedido cancelado');
      },
      error: (error) => {
        console.error('Error al cancelar pedido:', error);
        alert('❌ Error al cancelar el pedido');
      },
    });
  }

  cerrarModal(): void {
    this.mostrarModal = false;
    this.pedidoSeleccionado = null;
  }

  getEstadoClase(estado: EstadoVenta): string {
    const clases: Record<EstadoVenta, string> = {
      'Pendiente': 'estado-pendiente',
      'Confirmado': 'estado-confirmado',
      'En Proceso': 'estado-proceso',
      'Enviado': 'estado-enviado',
      'Entregado': 'estado-entregado',
      'Completado': 'estado-completado',
      'Cancelado': 'estado-cancelado',
    };
    return clases[estado] || '';
  }

  getEstadoIcono(estado: EstadoVenta): string {
    const iconos: Record<EstadoVenta, string> = {
      'Pendiente': '⏳',
      'Confirmado': '✓',
      'En Proceso': '🔄',
      'Enviado': '🚚',
      'Entregado': '📦',
      'Completado': '✅',
      'Cancelado': '❌',
    };
    return iconos[estado] || '📋';
  }

  formatearFecha(fecha: string): string {
    return new Date(fecha).toLocaleString('es-PE', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  }

  // ✅ MÉTODOS PARA COMPROBANTE YAPE
  copiarCodigo(codigo: string): void {
    if (navigator.clipboard) {
      navigator.clipboard.writeText(codigo).then(() => {
        alert('📋 Código copiado al portapapeles');
      }).catch(() => {
        this.copiarCodigoFallback(codigo);
      });
    } else {
      this.copiarCodigoFallback(codigo);
    }
  }

  private copiarCodigoFallback(codigo: string): void {
    const textArea = document.createElement('textarea');
    textArea.value = codigo;
    textArea.style.position = 'fixed';
    textArea.style.left = '-999999px';
    document.body.appendChild(textArea);
    textArea.select();
    
    try {
      document.execCommand('copy');
      alert('📋 Código copiado: ' + codigo);
    } catch (err) {
      prompt('Copia este código:', codigo);
    }
    
    document.body.removeChild(textArea);
  }

  abrirImagenCompleta(url: string): void {
    this.imagenCompletar = url;
    this.mostrarImagenCompleta = true;
  }

  cerrarImagenCompleta(): void {
    this.mostrarImagenCompleta = false;
    this.imagenCompletar = null;
  }

  onImagenError(event: Event): void {
    const imgElement = event.target as HTMLImageElement;
    console.error('Error al cargar imagen del comprobante');
    imgElement.src = 'assets/img/sin-imagen.png';
    imgElement.alt = 'No se pudo cargar la imagen';
    imgElement.style.border = '2px dashed #fbbf24';
    imgElement.style.padding = '20px';
  }

  rechazarPorComprobanteInvalido(pedido: VentaOnline): void {
    const motivo = prompt(
      '¿Por qué es inválido el comprobante?', 
      'Comprobante no corresponde o es ilegible'
    );
    
    if (!motivo) return;
    
    if (!confirm(`¿Rechazar pedido #${pedido.numero_venta} por comprobante inválido?`)) {
      return;
    }
    
    const datos = {
      estado: 'Cancelado',
      observaciones: `Rechazado: ${motivo}`
    };
    
    // ✅ CORREGIDO: Usar pedidosService
    this.pedidosService.actualizarEstado(pedido.venta_id, datos).subscribe({
      next: () => {
        alert('❌ Pedido rechazado exitosamente');
        this.cargarPedidos();
        this.cerrarModal();
      },
      error: (error: Error) => {
        console.error('Error al rechazar:', error);
        alert('Error al rechazar el pedido');
      }
    });
  }
}